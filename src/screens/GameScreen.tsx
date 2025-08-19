import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Image, Animated, Dimensions, Easing, PanResponder, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { gameStyles } from '../styles/GameStyles';
import { menuStyles } from '../styles/MenuStyles';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScrollingRoad from '../components/ScrollingRoad';
import taxiImg from '../assets/game/taxi.webp';
import potholeImg from '../assets/game/pothole.webp';
import stock from '../assets/garage/stock.webp';
import stockWing from '../assets/garage/stock-wing.webp';
import stockStripes from '../assets/garage/stock-stripes.webp';
import stockPlate from '../assets/garage/stock-plate.webp';
import stockWingStripes from '../assets/garage/stock-wing-stripes.webp';
import stockWingPlate from '../assets/garage/stock-wing-plate.webp';
import stockStripesPlate from '../assets/garage/stock-stripes-plate.webp';
import stockWingStripesPlate from '../assets/garage/stock-wing-stripes-plate.webp';
import coinIcon from '../assets/coin/coin.webp';

type GameState = 'idle' | 'running' | 'paused' | 'life_lost' | 'game_over';
type ObstacleType = 'taxi' | 'pothole';
type Lane = 0 | 2;

type Ob = {
  id: string;
  type: ObstacleType;
  lane: Lane;
  w: number;
  h: number;
  anim: Animated.Value;
  lastY: number;
  listenerId?: string;
  duration: number;
  startY: number;
  endY: number;
  running: boolean;
  pxPerMs: number;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const g = gameStyles(insets);
  const m = menuStyles(insets);
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });

  const [state, setState] = useState<GameState>('idle');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [roundCoins, setRoundCoins] = useState(0);
  const [playerLane, setPlayerLane] = useState<Lane>(0);
  const [uid, setUid] = useState<string | null>(null);
  const [coinBalance, setCoinBalance] = useState(0);
  const [roadW, setRoadW] = useState(0);
  const [roadH, setRoadH] = useState(0);
  const [obstacles, setObstacles] = useState<Ob[]>([]);
  const [beatHigh, setBeatHigh] = useState(false);
  const [wingEquipped, setWingEquipped] = useState(false);
  const [stripesEquipped, setStripesEquipped] = useState(false);
  const [plateEquipped, setPlateEquipped] = useState(false);
  const [roadSpeed, setRoadSpeed] = useState(1);

  const [showTopToast, setShowTopToast] = useState(false);
  const [topToastMsg, setTopToastMsg] = useState('');
  const topToastAnim = useRef(new Animated.Value(0)).current;

  const [showResumeCountdown, setShowResumeCountdown] = useState(false);
  const [resumeCount, setResumeCount] = useState(3);

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMode, setOverlayMode] = useState<'start' | 'paused' | 'game_over'>('start');
  const overlayY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  const stateRef = useRef<GameState>('idle');
  const livesRef = useRef(3);
  const laneRef = useRef<Lane>(0);
  const uidRef = useRef<string | null>(null);
  const obstaclesRef = useRef<Ob[]>([]);
  const rngRef = useRef(rng(Date.now() & 0xfffffff));
  const carWRef = useRef(0);
  const carHRef = useRef(0);

  const spawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const collideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lifeLostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userUnsubRef = useRef<null | (() => void)>(null);

  const lastSpawnAtRef = useRef(0);
  const lastSpawnLaneRef = useRef<Lane | null>(null);
  const blockCrossUntilRef = useRef(0);

  const speedRef = useRef(1);
  const scoreFloatRef = useRef(0);
  const coinUnitsRef = useRef(0);

  const lastSavePromiseRef = useRef<Promise<void> | null>(null);

  const localHighRef = useRef(0);
  const storageKeyRef = useRef('localHighScore:guest');
  const shownLiveHighRef = useRef(false);

  const BASE_CAR_W: number = 258;
  const BASE_CAR_H: number = 388;
  const BASE_TAXI_W: number = 255;
  const BASE_TAXI_H: number = 400;
  const BASE_POT_W: number = 197;
  const BASE_POT_H: number = 145;

  const loginGreen = '#1C8C37';
  const loginGreenDark = '#146227';
  const grey = '#2B2B2B';
  const greyDark = '#1A1A1A';
  const lightGrey = '#E0E0E0';

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { laneRef.current = playerLane; }, [playerLane]);
  useEffect(() => { uidRef.current = uid; }, [uid]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);

  const loadLocalHigh = useCallback(async (key: string) => {
    const v = await AsyncStorage.getItem(key);
    const hv = v != null ? Number(v) || 0 : 0;
    setHighScore(hv);
    localHighRef.current = hv;
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUid(u.uid);
        uidRef.current = u.uid;
        storageKeyRef.current = `localHighScore:${u.uid}`;
        const userRef = doc(db, 'users', u.uid);
        const scoreRef = doc(db, 'scores', u.uid);
        const ensureUser = await getDoc(userRef);
        if (!ensureUser.exists()) await setDoc(userRef, { coins: 0, highScore: 0, createdAt: serverTimestamp() }, { merge: true });
        const ensureScore = await getDoc(scoreRef);
        if (!ensureScore.exists()) await setDoc(scoreRef, { uid: u.uid, displayName: u.displayName ?? 'Player', highScore: 0, score: 0, createdAt: serverTimestamp() }, { merge: true });
        await loadLocalHigh(storageKeyRef.current);
        userUnsubRef.current && userUnsubRef.current();
        const unsubUsers = onSnapshot(userRef, (snap) => {
          const d = snap.data() || {};
          const srvHigh = Number(d.highScore ?? 0);
          const srvCoins = Number(d.coins ?? 0);
          setHighScore((cur) => Math.max(cur, srvHigh));
          localHighRef.current = Math.max(localHighRef.current, srvHigh);
          setCoinBalance(srvCoins);
          setWingEquipped(!!d.wingEquipped);
          setStripesEquipped(!!d.stripesEquipped);
          setPlateEquipped(!!d.plateEquipped);
        });
        userUnsubRef.current = () => { unsubUsers(); };
      } else {
        setUid(null);
        uidRef.current = null;
        setCoinBalance(0);
        storageKeyRef.current = 'localHighScore:guest';
        userUnsubRef.current && userUnsubRef.current();
        userUnsubRef.current = null;
        await loadLocalHigh(storageKeyRef.current);
        setWingEquipped(false);
        setStripesEquipped(false);
        setPlateEquipped(false);
      }
    });
    return () => {
      unsubAuth();
      userUnsubRef.current && userUnsubRef.current();
    };
  }, [loadLocalHigh]);

  const computeCarSize = useCallback((w: number) => {
    const cw = Math.max(1, w * 0.22);
    const ratio = BASE_CAR_H / BASE_CAR_W;
    const ch = cw * ratio;
    carWRef.current = cw;
    carHRef.current = ch;
  }, []);

  const carScale = useCallback(() => {
    return carWRef.current / BASE_CAR_W;
  }, []);

  const taxiSize = useCallback(() => {
    const s = carScale();
    return { w: Math.round(BASE_TAXI_W * s), h: Math.round(BASE_TAXI_H * s) };
  }, [carScale]);

  const potholeSize = useCallback(() => {
    const s = carScale();
    return { w: Math.round(BASE_POT_W * s), h: Math.round(BASE_POT_H * s) };
  }, [carScale]);

  const laneX = useCallback((lane: Lane) => {
    const pad = 20;
    const usable = Math.max(0, roadW - pad * 2);
    const half = usable / 2;
    const center = pad + usable / 2;
    const offset = half / 2;
    const cx = lane === 0 ? center - offset : center + offset;
    return Math.round(cx - carWRef.current / 2);
  }, [roadW]);

  const carY = useCallback(() => {
    const bottomPad = 64;
    return Math.max(0, roadH - bottomPad - carHRef.current);
  }, [roadH]);

  const setObstaclesSafe = useCallback((updater: (prev: Ob[]) => Ob[]) => {
    setObstacles((prev) => {
      const next = updater(prev);
      obstaclesRef.current = next;
      return next;
    });
  }, []);

  const clearTimers = useCallback(() => {
    if (spawnTimeoutRef.current) { clearTimeout(spawnTimeoutRef.current); spawnTimeoutRef.current = null; }
    if (scoreIntervalRef.current) { clearInterval(scoreIntervalRef.current); scoreIntervalRef.current = null; }
    if (collideIntervalRef.current) { clearInterval(collideIntervalRef.current); collideIntervalRef.current = null; }
    if (lifeLostTimerRef.current) { clearTimeout(lifeLostTimerRef.current); lifeLostTimerRef.current = null; }
    if (speedIntervalRef.current) { clearInterval(speedIntervalRef.current); speedIntervalRef.current = null; }
  }, []);

  const freezeAllObstacles = useCallback(() => {
    setObstaclesSafe(prev => {
      prev.forEach(o => { o.running = false; o.anim.stopAnimation(); });
      return [...prev];
    });
  }, [setObstaclesSafe]);

  const resumeAllObstacles = useCallback(() => {
    setObstaclesSafe(prev => {
      prev.forEach(o => {
        if (o.lastY >= o.endY) return;
        const remaining = Math.max(0, o.endY - o.lastY);
        const duration = Math.max(1, Math.round(remaining / o.pxPerMs));
        o.running = true;
        Animated.timing(o.anim, {
          toValue: o.endY,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished && stateRef.current !== 'game_over' && stateRef.current !== 'paused') {
            setObstaclesSafe(prev2 => prev2.filter(x => x.id !== o.id));
          }
        });
      });
      return [...prev];
    });
  }, [setObstaclesSafe]);

  const persistResultsRefFn = useRef<(finalScore: number, earned: number) => Promise<void>>(async () => {});
  useEffect(() => {
    persistResultsRefFn.current = async (finalScore: number, earned: number) => {
      const id = uidRef.current;
      if (!id) return;
      const uRef = doc(db, 'users', id);
      const sRef = doc(db, 'scores', id);
      await runTransaction(db, async (tx) => {
        const uSnap = await tx.get(uRef);
        const sSnap = await tx.get(sRef);
        const prevUHigh = uSnap.exists() ? Number(uSnap.data()?.highScore ?? 0) : 0;
        const prevSHigh = sSnap.exists() ? Number(sSnap.data()?.highScore ?? 0) : 0;
        const prevCoins = uSnap.exists() ? Number(uSnap.data()?.coins ?? 0) : 0;
        const nextHigh = Math.max(prevUHigh, prevSHigh, finalScore);
        const newCoins = prevCoins + earned;
        tx.set(uRef, { highScore: nextHigh, coins: newCoins }, { merge: true });
        tx.set(sRef, { uid: id, displayName: auth.currentUser?.displayName ?? 'Player', highScore: nextHigh, score: finalScore, updatedAt: serverTimestamp() }, { merge: true });
      });
    };
  }, []);

  const removeObstacle = useCallback((id: string) => {
    setObstaclesSafe(prev => {
      const o = prev.find(x => x.id === id);
      if (o?.listenerId) o.anim.removeListener(o.listenerId);
      return prev.filter(x => x.id !== id);
    });
  }, [setObstaclesSafe]);

  const spawnObstacle = useCallback((forceLane?: Lane, forceType?: ObstacleType) => {
    if (roadH <= 0 || carHRef.current <= 0) return;
    const s = Math.max(1, speedRef.current);
    const type: ObstacleType = forceType ?? (rngRef.current() < 0.5 ? 'taxi' : 'pothole');
    const lane: Lane = forceLane ?? (rngRef.current() < 0.5 ? 0 : 2);
    let w = 0;
    let h = 0;
    if (type === 'pothole') {
      const p = potholeSize();
      w = p.w; h = p.h;
    } else {
      const t = taxiSize();
      w = t.w; h = t.h;
    }
    const base = type === 'pothole' ? 2300 : 1400;
    const duration = Math.max(type === 'pothole' ? 700 : 500, Math.round(base / s));
    const startY = -h - 12;
    const endY = roadH + 80;
    const anim = new Animated.Value(startY);
    const id = `${Date.now()}-${Math.floor(rngRef.current() * 1e9)}`;
    const totalDist = endY - startY;
    const pxPerMs = totalDist / duration;
    const ob: Ob = { id, type, lane, w, h, anim, lastY: startY, duration, startY, endY, running: true, pxPerMs };
    const listenerId = anim.addListener(({ value }) => { ob.lastY = value; });
    ob.listenerId = listenerId;
    setObstaclesSafe(prev => [...prev, ob]);
    Animated.timing(anim, { toValue: endY, duration, easing: Easing.linear, useNativeDriver: true }).start(({ finished }) => {
      if (finished && stateRef.current !== 'game_over' && stateRef.current !== 'paused') removeObstacle(id);
    });
    lastSpawnAtRef.current = Date.now();
    lastSpawnLaneRef.current = lane;
    blockCrossUntilRef.current = lastSpawnAtRef.current + Math.floor(700 / s);
  }, [roadH, setObstaclesSafe, removeObstacle, taxiSize, potholeSize]);

  const chooseLane = useCallback((): Lane => {
    const last = lastSpawnLaneRef.current;
    const now = Date.now();
    if (last !== null && now < blockCrossUntilRef.current) return last;
    const r = rngRef.current();
    if (last === null) return r < 0.5 ? 0 : 2;
    return r < 0.6 ? last : (last === 0 ? 2 : 0);
  }, []);

  const otherLaneHasEarlyObstacle = useCallback((lane: Lane) => {
    const other: Lane = lane === 0 ? 2 : 0;
    let latest = -9999;
    for (const o of obstaclesRef.current) if (o.lane === other) latest = Math.max(latest, o.lastY);
    return latest >= -50 && latest < roadH * 0.7;
  }, [roadH]);

  const scheduleNextSpawn = useCallback(() => {
    const s = Math.max(1, speedRef.current);
    let base = Math.max(220, Math.floor(700 / s));
    let jitter = Math.max(160, Math.floor(600 / s));
    const lane = chooseLane();
    let type: ObstacleType = rngRef.current() < 0.5 ? 'taxi' : 'pothole';
    if (type === 'taxi' && otherLaneHasEarlyObstacle(lane)) base += Math.floor(350 / s);
    const delay = base + Math.floor(jitter * rngRef.current());
    spawnTimeoutRef.current = setTimeout(() => {
      if (stateRef.current === 'game_over' || stateRef.current === 'paused') return;
      const l = chooseLane();
      const preventWall = otherLaneHasEarlyObstacle(l);
      if (preventWall) spawnObstacle(l, 'pothole'); else spawnObstacle(l, type);
      scheduleNextSpawn();
    }, delay);
  }, [chooseLane, otherLaneHasEarlyObstacle, spawnObstacle]);

  const showTopToastNow = useCallback((msg: string) => {
    setTopToastMsg(msg);
    setShowTopToast(true);
    topToastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(topToastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(topToastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setShowTopToast(false));
  }, [topToastAnim]);

  const beginScoreTicker = useCallback(() => {
    scoreFloatRef.current = 0;
    coinUnitsRef.current = 0;
    shownLiveHighRef.current = false;
    scoreIntervalRef.current = setInterval(() => {
      if (stateRef.current !== 'running') return;
      const s = Math.max(1, speedRef.current);
      scoreFloatRef.current += s;
      const nextScore = Math.floor(scoreFloatRef.current);
      setScore(nextScore);
      if (!shownLiveHighRef.current && nextScore > localHighRef.current) {
        shownLiveHighRef.current = true;
        showTopToastNow('NEW HIGH SCORE!');
      }
      coinUnitsRef.current += 1;
      setRoundCoins(Math.floor(coinUnitsRef.current / 5));
    }, 200);
  }, [showTopToastNow]);

  const startSpeedRamp = useCallback(() => {
    speedRef.current = 1;
    setRoadSpeed(1);
    speedIntervalRef.current = setInterval(() => {
      if (stateRef.current !== 'running') return;
      const cur = speedRef.current + 0.03;
      const capped = cur > 3 ? 3 : cur;
      speedRef.current = capped;
      setRoadSpeed(capped);
    }, 1000);
  }, []);

  const rectsOverlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const handleGameOver = useCallback(() => {
    freezeAllObstacles();
    clearTimers();
    const final = Math.floor(scoreFloatRef.current);
    const earned = Math.floor(coinUnitsRef.current / 5);
    setScore(final);
    setRoundCoins(earned);
    const isNewHigh = final > localHighRef.current;
    if (isNewHigh) {
      setHighScore(final);
      localHighRef.current = final;
      AsyncStorage.setItem(storageKeyRef.current, String(final));
      setBeatHigh(true);
    } else {
      setBeatHigh(false);
    }
    if (uidRef.current) setCoinBalance((c) => c + earned);
    setState('game_over');
    stateRef.current = 'game_over';
    lastSavePromiseRef.current = persistResultsRefFn.current(final, earned);
    openOverlay('game_over');
  }, [freezeAllObstacles, clearTimers]);

  const startCollisionLoop = useCallback(() => {
    collideIntervalRef.current = setInterval(() => {
      if (stateRef.current !== 'running') return;
      const carRect = { x: laneX(laneRef.current), y: carY(), w: carWRef.current, h: carHRef.current };
      let hit: { id: string; type: ObstacleType } | null = null;
      const list = obstaclesRef.current;
      for (const o of list) {
        if (o.lane !== laneRef.current) continue;
        const y = o.lastY;
        const oRect = { x: laneX(o.lane), y, w: o.w, h: o.h };
        if (rectsOverlap(carRect, oRect)) { hit = { id: o.id, type: o.type }; break; }
      }
      if (hit) {
        if (hit.type === 'taxi') {
          handleGameOver();
        } else {
          const nextLives = Math.max(0, livesRef.current - 1);
          setLives(nextLives);
          removeObstacle(hit.id);
          if (nextLives <= 0) {
            handleGameOver();
          } else {
            setState('life_lost');
            stateRef.current = 'life_lost';
            if (lifeLostTimerRef.current) clearTimeout(lifeLostTimerRef.current);
            lifeLostTimerRef.current = setTimeout(() => {
              setState('running');
              stateRef.current = 'running';
            }, 600);
          }
        }
      }
    }, 50);
  }, [carY, laneX, handleGameOver, removeObstacle]);

  const openOverlay = useCallback((mode: 'start' | 'paused' | 'game_over') => {
    setOverlayMode(mode);
    setOverlayVisible(true);
    overlayY.setValue(Dimensions.get('window').height);
    Animated.timing(overlayY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  }, [overlayY]);

  const closeOverlay = useCallback((after?: () => void) => {
    Animated.timing(overlayY, { toValue: Dimensions.get('window').height, duration: 300, useNativeDriver: true }).start(() => {
      setOverlayVisible(false);
      if (after) after();
    });
  }, [overlayY]);

  const startRun = useCallback(() => {
    if (roadW <= 0 || roadH <= 0) return;
    clearTimers();
    setObstaclesSafe(() => []);
    setLives(3);
    setScore(0);
    setRoundCoins(0);
    scoreFloatRef.current = 0;
    coinUnitsRef.current = 0;
    setPlayerLane(0);
    setState('running');
    stateRef.current = 'running';
    setRoadSpeed(1);
    spawnObstacle();
    scheduleNextSpawn();
    beginScoreTicker();
    startSpeedRamp();
    startCollisionLoop();
  }, [roadW, roadH, clearTimers, spawnObstacle, scheduleNextSpawn, beginScoreTicker, startSpeedRamp, startCollisionLoop, setObstaclesSafe]);

  const pauseRun = useCallback(() => {
    if (stateRef.current !== 'running') return;
    clearTimers();
    freezeAllObstacles();
    setState('paused');
    stateRef.current = 'paused';
    openOverlay('paused');
  }, [clearTimers, freezeAllObstacles, openOverlay]);

  const resumeRun = useCallback(() => {
    closeOverlay(() => {
      if (stateRef.current !== 'paused') return;
      setShowResumeCountdown(true);
      setResumeCount(3);
      let count = 3;
      const t = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(t);
          setShowResumeCountdown(false);
          setState('running');
          stateRef.current = 'running';
          resumeAllObstacles();
          scheduleNextSpawn();
          beginScoreTicker();
          startSpeedRamp();
          startCollisionLoop();
        } else {
          setResumeCount(count);
        }
      }, 600);
    });
  }, [closeOverlay, resumeAllObstacles, scheduleNextSpawn, beginScoreTicker, startSpeedRamp, startCollisionLoop]);

  const restartToIdle = useCallback(() => {
    clearTimers();
    freezeAllObstacles();
    setObstaclesSafe(() => []);
    setLives(3);
    setScore(0);
    setRoundCoins(0);
    scoreFloatRef.current = 0;
    coinUnitsRef.current = 0;
    speedRef.current = 1;
    setRoadSpeed(1);
    setPlayerLane(0);
    setState('idle');
    stateRef.current = 'idle';
    setBeatHigh(false);
    shownLiveHighRef.current = false;
    openOverlay('start');
  }, [clearTimers, freezeAllObstacles, setObstaclesSafe, openOverlay]);

  const resetToMenu = useCallback(async () => {
    try { if (lastSavePromiseRef.current) await lastSavePromiseRef.current; } catch {}
    clearTimers();
    if (userUnsubRef.current) userUnsubRef.current();
    (navigation as any).reset({ index: 0, routes: [{ name: 'Menu' }] });
  }, [clearTimers, navigation]);

  useEffect(() => {
    return () => {
      clearTimers();
      setObstaclesSafe(prev => {
        prev.forEach(o => { if (o.listenerId) o.anim.removeListener(o.listenerId); o.anim.stopAnimation(); });
        return [];
      });
    };
  }, [clearTimers, setObstaclesSafe]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) overlayY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100) {
          closeOverlay(() => {
            if (overlayMode === 'paused') {
              resumeRun();
            }
          });
        } else {
          Animated.spring(overlayY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (!fontsLoaded) return;
    if (stateRef.current === 'idle') {
      openOverlay('start');
    }
  }, [fontsLoaded, openOverlay]);

  const carImage = useMemo(() => {
    if (wingEquipped && stripesEquipped && plateEquipped) return stockWingStripesPlate;
    if (wingEquipped && stripesEquipped) return stockWingStripes;
    if (wingEquipped && plateEquipped) return stockWingPlate;
    if (stripesEquipped && plateEquipped) return stockStripesPlate;
    if (wingEquipped) return stockWing;
    if (stripesEquipped) return stockStripes;
    if (plateEquipped) return stockPlate;
    return stock;
  }, [wingEquipped, stripesEquipped, plateEquipped]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={m.flex}>
      <View style={m.topRow}>
        <View style={{ position: 'relative' }}>
          <View style={m.infoCard}>
            <Text style={m.infoText}>BEST: {highScore}</Text>
          </View>
        </View>
        <View style={m.infoCard}>
          <Image source={coinIcon} style={m.coinIcon} />
          <Text style={m.infoText}>{coinBalance}</Text>
        </View>
      </View>

      {showTopToast && (
        <Animated.View
          style={[
            m.loginToast,
            {
              opacity: topToastAnim,
              transform: [
                {
                  translateY: topToastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={m.loginToastText}>{topToastMsg}</Text>
        </Animated.View>
      )}

      <View style={g.card}>
        <Pressable
          style={g.road}
          onLayout={(e) => {
            setRoadW(e.nativeEvent.layout.width);
            setRoadH(e.nativeEvent.layout.height);
            computeCarSize(e.nativeEvent.layout.width);
          }}
          onPressIn={() => { if (stateRef.current === 'running') setPlayerLane(2); }}
          onPressOut={() => { if (stateRef.current === 'running') setPlayerLane(0); }}
        >
          <ScrollingRoad paused={state !== 'running'} speed={roadSpeed} heightPx={roadH} />

          <View style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} style={[g.heart, { opacity: i < lives ? 1 : 0.2 }]} />
              ))}
            </View>
            <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 16, color: lightGrey }}>{score}</Text>
          </View>

          {obstacles.map((o) => (
            <Animated.View
              key={o.id}
              style={{
                position: 'absolute',
                left: laneX(o.lane),
                top: 0,
                width: o.w,
                height: o.h,
                backgroundColor: 'transparent',
                transform: [{ translateY: o.anim }],
                zIndex: 2,
              }}
            >
              <Image source={o.type === 'taxi' ? taxiImg : potholeImg} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            </Animated.View>
          ))}

          <View
            style={{
              position: 'absolute',
              left: laneX(playerLane),
              top: carY(),
              width: carWRef.current,
              height: carHRef.current,
              backgroundColor: 'transparent',
              zIndex: 3,
            }}
          >
            <Image source={carImage} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          </View>

          {showResumeCountdown && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#00000066',
                zIndex: 5,
              }}
            >
              <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 56, color: lightGrey }}>{resumeCount}</Text>
            </View>
          )}

          <Pressable
            onPress={pauseRun}
            disabled={state !== 'running'}
            style={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              width: 44,
              height: 44,
              backgroundColor: state === 'running' ? '#4A5A6A' : '#2F3B47',
              borderWidth: 4,
              borderColor: '#2F3B47',
              borderRadius: 6,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 6,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View style={{ width: 6, height: 18, backgroundColor: lightGrey }} />
              <View style={{ width: 6, height: 18, backgroundColor: lightGrey }} />
            </View>
          </Pressable>
        </Pressable>
      </View>

      {overlayVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
          <Animated.View style={[{ backgroundColor: '#0F1518', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: insets.bottom + 20, paddingTop: 10, width: '100%', transform: [{ translateY: overlayY }] }]} {...panResponder.panHandlers}>
            <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
              <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: '#4A5A6A' }} />
            </View>

            {overlayMode === 'start' && (
              <>
                <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 28, color: lightGrey, textAlign: 'center', marginBottom: 30 }}>START GAME</Text>
                <View style={{ gap: 16 }}>
                  <Pressable
                    onPress={() => closeOverlay(startRun)}
                    style={{ backgroundColor: loginGreen, borderWidth: 4, borderColor: loginGreenDark, borderRadius: 6, alignItems: 'center', justifyContent: 'center', height: 56, width: '100%' }}
                  >
                    <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 18, color: lightGrey }}>START</Text>
                  </Pressable>
                  <Pressable
                    onPress={resetToMenu}
                    style={{ backgroundColor: grey, borderWidth: 4, borderColor: greyDark, borderRadius: 6, alignItems: 'center', justifyContent: 'center', height: 56, width: '100%' }}
                  >
                    <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 18, color: lightGrey }}>MENU</Text>
                  </Pressable>
                </View>
              </>
            )}

            {overlayMode === 'paused' && (
              <>
                <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 28, color: lightGrey, textAlign: 'center', marginBottom: 30 }}>PAUSED</Text>
                <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 16, color: lightGrey, textAlign: 'center', marginBottom: 20 }}>Score {score} • Coins +{roundCoins}</Text>
                <View style={{ gap: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Pressable
                      onPress={() => closeOverlay(restartToIdle)}
                      style={{ flex: 1, backgroundColor: grey, borderWidth: 4, borderColor: greyDark, borderRadius: 6, alignItems: 'center', justifyContent: 'center', height: 56 }}
                    >
                      <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 18, color: lightGrey }}>RESTART</Text>
                    </Pressable>
                    <Pressable
                      onPress={resumeRun}
                      style={{ flex: 1, backgroundColor: loginGreen, borderWidth: 4, borderColor: loginGreenDark, borderRadius: 6, alignItems: 'center', justifyContent: 'center', height: 56 }}
                    >
                      <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 18, color: lightGrey }}>RESUME</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={resetToMenu}
                    style={{ backgroundColor: grey, borderWidth: 4, borderColor: greyDark, borderRadius: 6, alignItems: 'center', justifyContent: 'center', height: 56, width: '100%' }}
                  >
                    <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 18, color: lightGrey }}>MENU</Text>
                  </Pressable>
                </View>
              </>
            )}

            {overlayMode === 'game_over' && (
              <>
                <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 28, color: lightGrey, textAlign: 'center', marginBottom: 30 }}>GAME OVER</Text>
                {beatHigh ? <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 16, color: '#FFD54F', textAlign: 'center', marginBottom: 10 }}>HIGH SCORE!</Text> : null}
                <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 16, color: lightGrey, textAlign: 'center', marginBottom: 20 }}>Score {score} • Coins +{roundCoins}</Text>
                <View style={{ gap: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Pressable
                      onPress={resetToMenu}
                      style={{ flex: 1, backgroundColor: grey, borderWidth: 4, borderColor: greyDark, borderRadius: 6, alignItems: 'center', justifyContent: 'center', height: 56 }}
                    >
                      <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 18, color: lightGrey }}>MENU</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => closeOverlay(() => { setBeatHigh(false); restartToIdle(); })}
                      style={{ flex: 1, backgroundColor: loginGreen, borderWidth: 4, borderColor: loginGreenDark, borderRadius: 6, alignItems: 'center', justifyContent: 'center', height: 56 }}
                    >
                      <Text style={{ fontFamily: 'Silkscreen_400Regular', fontSize: 18, color: lightGrey }}>RESTART</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
