import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Image, Animated, Dimensions, Platform, KeyboardAvoidingView, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { gameStyles } from '../styles/GameStyles';
import { menuStyles } from '../styles/MenuStyles';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, runTransaction, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScrollingRoad from '../components/ScrollingRoad';
import taxiImg from '../assets/game/taxi.webp';
import potholeImg from '../assets/game/pothole.webp';
import heartImg from '../assets/game/heart.webp';
import stock from '../assets/garage/stock.webp';
import stockWing from '../assets/garage/stock-wing.webp';
import stockStripes from '../assets/garage/stock-stripes.webp';
import stockPlate from '../assets/garage/stock-plate.webp';
import stockWingStripes from '../assets/garage/stock-wing-stripes.webp';
import stockWingPlate from '../assets/garage/stock-wing-plate.webp';
import stockStripesPlate from '../assets/garage/stock-stripes-plate.webp';
import stockWingStripesPlate from '../assets/garage/stock-wing-stripes-plate.webp';
import coinIcon from '../assets/coin/coin.webp';
import { Audio, Video, ResizeMode, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Camera, CameraView } from 'expo-camera';
import { storage } from '../firebase/firebaseConfig';
import * as FileSystem from 'expo-file-system';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';


type GameState = 'idle' | 'running' | 'game_over';
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
  countedPass?: boolean;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const g = gameStyles(insets);
  const m = menuStyles(insets);
  const navigation = useNavigation() as any;
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
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMode, setOverlayMode] = useState<'start' | 'game_over'>('start');

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
  const speedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userUnsubRef = useRef<null | (() => void)>(null);
  const lastSavePromiseRef = useRef<Promise<void> | null>(null);
  const lastSpawnAtRef = useRef(0);
  const lastSpawnLaneRef = useRef<Lane | null>(null);
  const blockCrossUntilRef = useRef(0);
  const speedRef = useRef(1);
  const scoreFloatRef = useRef(0);
  const coinUnitsRef = useRef(0);
  const localHighRef = useRef(0);
  const storageKeyRef = useRef('localHighScore:guest');
  const shownLiveHighRef = useRef(false);
  const potholeHitsRef = useRef(0);

  const musicRef = useRef<Audio.Sound | null>(null);
  const carRef = useRef<Audio.Sound | null>(null);
  const potholeRefs = useRef<Audio.Sound[]>([]);
  const crashRef = useRef<Audio.Sound | null>(null);
  const hootRef = useRef<Audio.Sound | null>(null);
  const musicVolRef = useRef(0.06);
  const sfxVolRef = useRef(0.45);
  const musicMutedRef = useRef(false);
  const sfxMutedRef = useRef(false);

  const taxiPassCountRef = useRef(0);

  const cameraRef = useRef<CameraView | null>(null);
  const [camGranted, setCamGranted] = useState(false);

  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const usernameRef = useRef<string>('Player');
  const countryRef = useRef<string | null>(null);
  const countryFlagRef = useRef<string | null>(null);

  const BASE_CAR_W = 258;
  const BASE_CAR_H = 388;
  const BASE_TAXI_W = 255;
  const BASE_TAXI_H = 400;
  const BASE_POT_W = 197;
  const BASE_POT_H = 145;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  useEffect(() => {
    laneRef.current = playerLane;
  }, [playerLane]);
  useEffect(() => {
    uidRef.current = uid;
  }, [uid]);
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  const showToast = useCallback(
    (txt: string) => {
      setToastText(txt);
      setToastVisible(true);
      toastOpacity.setValue(0);
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        setTimeout(() => {
          Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setToastVisible(false));
        }, 1600);
      });
    },
    [toastOpacity]
  );

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
          const name = typeof d.username === 'string' && d.username.trim() ? d.username : auth.currentUser?.displayName ?? 'Player';
          usernameRef.current = name;
          countryRef.current = typeof d.country === 'string' ? d.country : null;
          countryFlagRef.current = typeof d.countryFlag === 'string' ? d.countryFlag : null;
        });
        userUnsubRef.current = () => {
          unsubUsers();
        };
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
        usernameRef.current = 'Player';
        countryRef.current = null;
        countryFlagRef.current = null;
      }
    });
    return () => {
      unsubAuth();
      userUnsubRef.current && userUnsubRef.current();
    };
  }, [loadLocalHigh]);

  const computeCarSize = useCallback((w: number) => {
    const cw = Math.max(1, w * 0.176);
    const ratio = BASE_CAR_H / BASE_CAR_W;
    const ch = cw * ratio;
    carWRef.current = cw;
    carHRef.current = ch;
  }, []);

  const carScale = useCallback(() => carWRef.current / BASE_CAR_W, []);
  const taxiSize = useCallback(() => {
    const s = carScale();
    return { w: Math.round(BASE_TAXI_W * s), h: Math.round(BASE_TAXI_H * s) };
  }, [carScale]);
  const potholeSize = useCallback(() => {
    const s = carScale();
    return { w: Math.round(BASE_POT_W * s), h: Math.round(BASE_POT_H * s) };
  }, [carScale]);

  const laneX = useCallback(
    (lane: Lane) => {
      const pad = 20;
      const usable = Math.max(0, roadW - pad * 2);
      const half = usable / 2;
      const center = pad + usable / 2;
      const offset = half / 2;
      const cx = lane === 0 ? center - offset : center + offset;
      return Math.round(cx - carWRef.current / 2);
    },
    [roadW]
  );

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
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }
    if (scoreIntervalRef.current) {
      clearInterval(scoreIntervalRef.current);
      scoreIntervalRef.current = null;
    }
    if (collideIntervalRef.current) {
      clearInterval(collideIntervalRef.current);
      collideIntervalRef.current = null;
    }
    if (speedIntervalRef.current) {
      clearInterval(speedIntervalRef.current);
      speedIntervalRef.current = null;
    }
  }, []);

  const freezeAllObstacles = useCallback(() => {
    setObstaclesSafe((prev) => {
      prev.forEach((o) => {
        o.running = false;
        o.anim.stopAnimation();
      });
      return [...prev];
    });
  }, [setObstaclesSafe]);

  const persistResultsRefFn = useRef<(finalScore: number, earned: number) => Promise<void>>(async () => { });
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

  const removeObstacle = useCallback(
    (id: string) => {
      setObstaclesSafe((prev) => {
        const o = prev.find((x) => x.id === id);
        if (o?.listenerId) o.anim.removeListener(o.listenerId);
        return prev.filter((x) => x.id !== id);
      });
    },
    [setObstaclesSafe]
  );

  const handleTaxiPassed = useCallback(async () => {
    taxiPassCountRef.current += 1;
    if (taxiPassCountRef.current % 5 === 0) {
      try {
        if (hootRef.current && !sfxMutedRef.current) {
          await hootRef.current.setVolumeAsync(sfxVolRef.current * 0.6);
          await hootRef.current.replayAsync();
        }
      } catch { }
    }
  }, []);

  const spawnObstacle = useCallback(
    (forceLane?: Lane, forceType?: ObstacleType) => {
      if (roadH <= 0 || carHRef.current <= 0) return;
      const s = Math.max(1, speedRef.current);
      const type: ObstacleType = forceType ?? (rngRef.current() < 0.5 ? 'taxi' : 'pothole');
      const lane: Lane = forceLane ?? (rngRef.current() < 0.5 ? 0 : 2);
      let w = 0;
      let h = 0;
      if (type === 'pothole') {
        const p = potholeSize();
        w = p.w;
        h = p.h;
      } else {
        const t = taxiSize();
        w = t.w;
        h = t.h;
      }
      const base = type === 'pothole' ? 2800 : 1400;
      const duration = Math.max(type === 'pothole' ? 800 : 500, Math.round(base / s));
      const startY = -h - 12;
      const endY = roadH + 80;
      const anim = new Animated.Value(startY);
      const id = `${Date.now()}-${Math.floor(rngRef.current() * 1e9)}`;
      const totalDist = endY - startY;
      const pxPerMs = totalDist / duration;
      const ob: Ob = { id, type, lane, w, h, anim, lastY: startY, duration, startY, endY, running: true, pxPerMs, countedPass: false };
      const listenerId = anim.addListener(({ value }) => {
        ob.lastY = value;
        if (!ob.countedPass && ob.type === 'taxi') {
          const cy = carY();
          if (value >= cy + carHRef.current) {
            ob.countedPass = true;
            handleTaxiPassed();
          }
        }
      });
      ob.listenerId = listenerId;
      setObstaclesSafe((prev) => [...prev, ob]);
      Animated.timing(anim, { toValue: endY, duration, easing: Easing.linear, useNativeDriver: true }).start(({ finished }) => {
        if (finished && stateRef.current !== 'game_over') removeObstacle(id);
      });
      lastSpawnAtRef.current = Date.now();
      lastSpawnLaneRef.current = lane;
      blockCrossUntilRef.current = lastSpawnAtRef.current + Math.floor(700 / s);
    },
    [roadH, setObstaclesSafe, removeObstacle, taxiSize, potholeSize, carY, handleTaxiPassed]
  );

  const chooseLane = useCallback((): Lane => {
    const last = lastSpawnLaneRef.current;
    const now = Date.now();
    if (last !== null && now < blockCrossUntilRef.current) return last;
    const r = rngRef.current();
    if (last === null) return r < 0.5 ? 0 : 2;
    return r < 0.6 ? last : last === 0 ? 2 : 0;
  }, []);

  const otherLaneHasEarlyObstacle = useCallback(
    (lane: Lane) => {
      const other: Lane = lane === 0 ? 2 : 0;
      let latest = -9999;
      for (const o of obstaclesRef.current) if (o.lane === other) latest = Math.max(latest, o.lastY);
      return latest >= -50 && latest < roadH * 0.7;
    },
    [roadH]
  );

  const scheduleNextSpawn = useCallback(() => {
    const s = Math.max(1, speedRef.current);
    let base = Math.max(220, Math.floor(700 / s));
    let jitter = Math.max(160, Math.floor(600 / s));
    const lane = chooseLane();
    let type: ObstacleType = rngRef.current() < 0.5 ? 'taxi' : 'pothole';
    if (type === 'taxi' && otherLaneHasEarlyObstacle(lane)) base += Math.floor(350 / s);
    const delay = base + Math.floor(jitter * rngRef.current());
    spawnTimeoutRef.current = setTimeout(() => {
      if (stateRef.current === 'game_over') return;
      const l = chooseLane();
      const preventWall = otherLaneHasEarlyObstacle(l);
      if (preventWall) spawnObstacle(l, 'pothole');
      else spawnObstacle(l, type);
      scheduleNextSpawn();
    }, delay);
  }, [chooseLane, otherLaneHasEarlyObstacle, spawnObstacle]);

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
      }
      coinUnitsRef.current += 1;
      setRoundCoins(Math.floor(coinUnitsRef.current / 5));
    }, 200);
  }, []);

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

  const stopLoopingAudio = useCallback(async () => {
    try {
      if (carRef.current) await carRef.current.stopAsync();
    } catch { }
    try {
      if (musicRef.current) await musicRef.current.stopAsync();
    } catch { }
  }, []);

  const createPostIfNeeded = useCallback(
    async (finalScore: number, type: 'high_score' | 'wooden_spoon') => {
      const id = uidRef.current;
      if (!id) return;

      let photoUrl: string | null = null;

      try {
        if (camGranted && cameraRef.current) {
          const pic = await cameraRef.current.takePictureAsync({
            quality: 0.4,
            skipProcessing: true,
          });
          if (pic?.uri) {
            const key = `posts/${id}/${Date.now()}.jpg`;
            const sref = storageRef(storage, key);

            const resp = await fetch(pic.uri);
            const blob = await resp.blob();

            await uploadBytes(sref, blob, { contentType: 'image/jpeg' });
            photoUrl = await getDownloadURL(sref);
          }
        }
      } catch (e) {
        console.warn('📷 upload failed, posting without image:', e);
      }

      try {
        await addDoc(collection(db, 'posts'), {
          uid: id,
          username: usernameRef.current,
          countryFlag: countryFlagRef.current ?? null,
          score: finalScore,
          type,
          photoUrl,
          createdAt: serverTimestamp(),
        });
        console.log('✅ post created');
      } catch (e) {
        console.error('❌ failed to write post:', e);
      }
    },
    [camGranted]
  );


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
    stopLoopingAudio();
    if (isNewHigh) {
      createPostIfNeeded(final, 'high_score');
    } else if (final < 50) {
      createPostIfNeeded(final, 'wooden_spoon');
    }
    openOverlay('game_over');
  }, [freezeAllObstacles, clearTimers, stopLoopingAudio, createPostIfNeeded]);

  const startCollisionLoop = useCallback(
    () => {
      collideIntervalRef.current = setInterval(() => {
        if (stateRef.current !== 'running') return;
        const carRect = { x: laneX(laneRef.current), y: carY(), w: carWRef.current, h: carHRef.current };
        let hit: { id: string; type: ObstacleType } | null = null;
        const list = obstaclesRef.current;
        for (const o of list) {
          if (o.lane !== laneRef.current) continue;
          const y = o.lastY;
          const oRect = { x: laneX(o.lane), y, w: o.w, h: o.h };
          if (rectsOverlap(carRect, oRect)) {
            hit = { id: o.id, type: o.type };
            break;
          }
        }
        if (hit) {
          if (hit.type === 'taxi') {
            try {
              if (crashRef.current && !sfxMutedRef.current) crashRef.current.replayAsync();
            } catch { }
            handleGameOver();
          } else {
            potholeHitsRef.current += 1;
            const idx = Math.min(potholeHitsRef.current, 3) - 1;
            const s = potholeRefs.current[idx];
            try {
              if (s && !sfxMutedRef.current) s.replayAsync();
            } catch { }
            const nextLives = Math.max(0, livesRef.current - 1);
            setLives(nextLives);
            removeObstacle(hit.id);
            if (nextLives <= 0) {
              handleGameOver();
            }
          }
        }
      }, 50);
    },
    [carY, laneX, handleGameOver, removeObstacle]
  );

  const openOverlay = useCallback(
    (mode: 'start' | 'game_over') => {
      setOverlayMode(mode);
      setOverlayVisible(true);
      overlayY.setValue(Dimensions.get('window').height);
      Animated.timing(overlayY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    },
    [overlayY]
  );

  const closeOverlay = useCallback(
    (after?: () => void) => {
      Animated.timing(overlayY, { toValue: Dimensions.get('window').height, duration: 300, useNativeDriver: true }).start(() => {
        setOverlayVisible(false);
        if (after) after();
      });
    },
    [overlayY]
  );

  const startRun = useCallback(() => {
    if (roadW <= 0 || roadH <= 0) return;
    clearTimers();
    setObstaclesSafe(() => []);
    setLives(3);
    setScore(0);
    setRoundCoins(0);
    potholeHitsRef.current = 0;
    scoreFloatRef.current = 0;
    coinUnitsRef.current = 0;
    taxiPassCountRef.current = 0;
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

  const restartToIdle = useCallback(() => {
    clearTimers();
    freezeAllObstacles();
    setObstaclesSafe(() => []);
    setLives(3);
    setScore(0);
    setRoundCoins(0);
    potholeHitsRef.current = 0;
    scoreFloatRef.current = 0;
    coinUnitsRef.current = 0;
    taxiPassCountRef.current = 0;
    speedRef.current = 1;
    setRoadSpeed(1);
    setPlayerLane(0);
    setState('idle');
    stateRef.current = 'idle';
    setBeatHigh(false);
    shownLiveHighRef.current = false;
    stopLoopingAudio();
    openOverlay('start');
  }, [clearTimers, freezeAllObstacles, setObstaclesSafe, openOverlay, stopLoopingAudio]);

  const resetToMenu = useCallback(async () => {
    try {
      if (lastSavePromiseRef.current) await lastSavePromiseRef.current;
    } catch { }
    clearTimers();
    stopLoopingAudio();
    if (userUnsubRef.current) userUnsubRef.current();
    navigation.reset({ index: 0, routes: [{ name: 'Menu' }] });
  }, [clearTimers, navigation, stopLoopingAudio]);

  useEffect(() => {
    return () => {
      clearTimers();
      setObstaclesSafe((prev) => {
        prev.forEach((o) => {
          if (o.listenerId) o.anim.removeListener(o.listenerId);
          o.anim.stopAnimation();
        });
        return [];
      });
    };
  }, [clearTimers, setObstaclesSafe]);

  useEffect(() => {
    if (!fontsLoaded) return;
    if (stateRef.current === 'idle') {
      openOverlay('start');
    }
  }, [fontsLoaded, openOverlay]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setCamGranted(status === 'granted');
      } catch { }
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
      } catch { }
      try {
        const mv = await AsyncStorage.getItem('musicVolume');
        const sv = await AsyncStorage.getItem('sfxVolume');
        if (mv != null) {
          const n = Number(mv);
          if (!Number.isNaN(n)) musicVolRef.current = Math.max(0, Math.min(1, n));
        }
        if (sv != null) {
          const n = Number(sv);
          if (!Number.isNaN(n)) sfxVolRef.current = Math.max(0, Math.min(1, n));
        }
        const mm = await AsyncStorage.getItem('musicMuted');
        const sm = await AsyncStorage.getItem('sfxMuted');
        musicMutedRef.current = mm === 'true';
        sfxMutedRef.current = sm === 'true';
      } catch { }
      try {
        const music = new Audio.Sound();
        await music.loadAsync(require('../assets/game/game-music.mp3'));
        await music.setIsLoopingAsync(true);
        await music.setVolumeAsync(musicMutedRef.current ? 0 : musicVolRef.current);
        musicRef.current = music;
      } catch { }
      try {
        const car = new Audio.Sound();
        await car.loadAsync(require('../assets/game/car.mp3'));
        await car.setIsLoopingAsync(true);
        await car.setVolumeAsync(sfxMutedRef.current ? 0 : sfxVolRef.current * 0.35);
        carRef.current = car;
      } catch { }
      try {
        const p1 = new Audio.Sound();
        await p1.loadAsync(require('../assets/game/pothole-1.mp3'));
        await p1.setVolumeAsync(sfxMutedRef.current ? 0 : sfxVolRef.current);
        const p2 = new Audio.Sound();
        await p2.loadAsync(require('../assets/game/pothole-2.mp3'));
        await p2.setVolumeAsync(sfxMutedRef.current ? 0 : sfxVolRef.current);
        const p3 = new Audio.Sound();
        await p3.loadAsync(require('../assets/game/pothole-3.mp3'));
        await p3.setVolumeAsync(sfxMutedRef.current ? 0 : sfxVolRef.current);
        potholeRefs.current = [p1, p2, p3];
      } catch { }
      try {
        const crash = new Audio.Sound();
        await crash.loadAsync(require('../assets/game/crash.mp3'));
        await crash.setVolumeAsync(sfxMutedRef.current ? 0 : sfxVolRef.current);
        crashRef.current = crash;
      } catch { }
      try {
        const hoot = new Audio.Sound();
        await hoot.loadAsync(require('../assets/game/hoot.mp3'));
        await hoot.setVolumeAsync(sfxMutedRef.current ? 0 : sfxVolRef.current * 0.6);
        hootRef.current = hoot;
      } catch { }
    })();
    return () => {
      (async () => {
        try {
          if (carRef.current) {
            await carRef.current.stopAsync();
            await carRef.current.unloadAsync();
            carRef.current = null;
          }
        } catch { }
        try {
          if (musicRef.current) {
            await musicRef.current.stopAsync();
            await musicRef.current.unloadAsync();
            musicRef.current = null;
          }
        } catch { }
        for (const s of potholeRefs.current) {
          try {
            await s.unloadAsync();
          } catch { }
        }
        potholeRefs.current = [];
        try {
          if (crashRef.current) {
            await crashRef.current.unloadAsync();
            crashRef.current = null;
          }
        } catch { }
        try {
          if (hootRef.current) {
            await hootRef.current.unloadAsync();
            hootRef.current = null;
          }
        } catch { }
      })();
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (state === 'running') {
        try {
          if (musicRef.current) {
            await musicRef.current.setVolumeAsync(musicMutedRef.current ? 0 : musicVolRef.current);
            await musicRef.current.replayAsync();
          }
        } catch { }
        try {
          if (carRef.current) {
            await carRef.current.setVolumeAsync(sfxMutedRef.current ? 0 : sfxVolRef.current * 0.35);
            await carRef.current.replayAsync();
          }
        } catch { }
      } else {
        try {
          if (carRef.current) await carRef.current.stopAsync();
        } catch { }
        try {
          if (musicRef.current) await musicRef.current.stopAsync();
        } catch { }
      }
    })();
  }, [state]);

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

  if (!fontsLoaded) return <View style={g.blank} />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={m.flex}>
      <View style={m.topRow}>
        <View style={g.relativeBox}>
          <View style={m.infoCard}>
            <Text style={m.infoText}>BEST: {highScore}</Text>
          </View>
        </View>
        <View style={m.infoCard}>
          <Image source={coinIcon} style={m.coinIcon} />
          <Text style={m.infoText}>{coinBalance}</Text>
        </View>
      </View>
      <View style={g.card}>
        <Pressable
          style={g.road}
          onLayout={(e) => {
            setRoadW(e.nativeEvent.layout.width);
            setRoadH(e.nativeEvent.layout.height);
            computeCarSize(e.nativeEvent.layout.width);
          }}
          onPressIn={() => {
            if (stateRef.current === 'running') setPlayerLane(2);
          }}
          onPressOut={() => {
            if (stateRef.current === 'running') setPlayerLane(0);
          }}
        >
          <ScrollingRoad paused={state !== 'running'} speed={roadSpeed} heightPx={roadH} />
          <View style={g.hudInside}>
            <View style={g.hudRow}>
              <View style={g.hudHeartsChip}>
                <View style={g.hudHeartsInner}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Image key={i} source={heartImg} style={[g.heartIcon, i < lives ? g.heartOn : g.heartOff]} />
                  ))}
                </View>
              </View>
              <View style={g.hudChipsRight}>
                <View style={g.hudChip}>
                  <Text style={g.hudChipText}>{score}</Text>
                </View>
                <View style={g.hudChipRow}>
                  <Image source={coinIcon} style={g.hudCoinIcon} />
                  <Text style={g.hudChipText}>+{roundCoins}</Text>
                </View>
              </View>
            </View>
          </View>

          {obstacles.map((o) => (
            <Animated.View key={o.id} style={[g.obstacle, { left: laneX(o.lane), width: o.w, height: o.h, transform: [{ translateY: o.anim }] }]}>
              <Image source={o.type === 'taxi' ? taxiImg : potholeImg} style={g.full} resizeMode="contain" />
            </Animated.View>
          ))}

          <View style={[g.car, { left: laneX(playerLane), top: carY(), width: carWRef.current, height: carHRef.current }]}>
            <Image source={carImage} style={g.full} resizeMode="contain" />
          </View>
        </Pressable>
      </View>

      {overlayVisible && (
        <View style={g.overlayWrap}>
          <Animated.View style={[g.overlayCard, { transform: [{ translateY: overlayY }] }]}>
            {overlayMode === 'start' && (
              <>
                <Text style={g.overlayTitle}>START GAME</Text>
                <View style={g.overlaySectionWrap}>
                  <View style={g.overlayInfoCard}>
                    <Text style={g.overlayInfoText}>Hold down to change lanes</Text>
                    <View style={g.tutorialBox}>
                      <Video source={require('../assets/game/hold.mp4')} style={g.full} isLooping shouldPlay resizeMode={ResizeMode.COVER} />
                    </View>
                  </View>
                  <View style={g.miniRow}>
                    <View style={g.miniCard}>
                      <Image source={potholeImg} style={g.miniImg} resizeMode="contain" />
                      <Text style={g.miniText}>Avoid potholes</Text>
                    </View>
                    <View style={g.miniCard}>
                      <Image source={taxiImg} style={g.miniImg} resizeMode="contain" />
                      <Text style={g.miniText}>Avoid taxis</Text>
                    </View>
                  </View>
                </View>
                <View style={g.btnCol}>
                  <Pressable onPress={() => closeOverlay(startRun)} style={g.btnGreen}>
                    <Text style={g.btnText}>START</Text>
                  </Pressable>
                  <Pressable onPress={resetToMenu} style={g.btnGrey}>
                    <Text style={g.btnText}>MENU</Text>
                  </Pressable>
                </View>
              </>
            )}
            {overlayMode === 'game_over' && (
              <>
                <Text style={g.overlayTitle}>GAME OVER</Text>
                {beatHigh ? <Text style={g.overlayHigh}>HIGH SCORE!</Text> : null}
                <View style={g.endRow}>
                  <View style={g.infoPill}>
                    <Text style={g.infoPillText}>Score {score}</Text>
                  </View>
                  <View style={g.infoPillRow}>
                    <Image source={coinIcon} style={g.pillCoin} />
                    <Text style={g.infoPillText}>+{roundCoins}</Text>
                  </View>
                </View>
                <View style={g.btnCol}>
                  <View style={g.btnRow}>
                    <Pressable onPress={resetToMenu} style={g.btnGreyFlex}>
                      <Text style={g.btnText}>MENU</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        closeOverlay(() => {
                          setBeatHigh(false);
                          restartToIdle();
                        });
                      }}
                      style={g.btnGreenFlex}
                    >
                      <Text style={g.btnText}>RESTART</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      )}

      {toastVisible && (
        <Animated.View style={[g.toastWrap, { opacity: toastOpacity }]}>
          <Text style={g.toastText}>{toastText}</Text>
        </Animated.View>
      )}

      <CameraView ref={cameraRef} facing="front" style={{ width: 1, height: 1, position: 'absolute', opacity: 0 }} />
    </KeyboardAvoidingView>
  );
}
