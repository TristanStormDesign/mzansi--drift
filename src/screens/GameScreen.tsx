import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Image, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { gameStyles } from '../styles/GameStyles';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import coinIcon from '../assets/coin/coin.webp';

type GameState = 'idle' | 'running' | 'life_lost' | 'game_over';
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
  const styles = gameStyles(insets);
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
          setCoinBalance((cur) => Math.max(cur, srvCoins));
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
      }
    });
    return () => {
      unsubAuth();
      userUnsubRef.current && userUnsubRef.current();
    };
  }, [loadLocalHigh]);

  const computeCarSize = useCallback((w: number) => {
    const cw = Math.min(120, w * 0.22);
    const ch = cw * 0.6;
    carWRef.current = cw;
    carHRef.current = ch;
  }, []);

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

  const clearTimers = useCallback(() => {
    if (spawnTimeoutRef.current) { clearTimeout(spawnTimeoutRef.current); spawnTimeoutRef.current = null; }
    if (scoreIntervalRef.current) { clearInterval(scoreIntervalRef.current); scoreIntervalRef.current = null; }
    if (collideIntervalRef.current) { clearInterval(collideIntervalRef.current); collideIntervalRef.current = null; }
    if (lifeLostTimerRef.current) { clearTimeout(lifeLostTimerRef.current); lifeLostTimerRef.current = null; }
    if (speedIntervalRef.current) { clearInterval(speedIntervalRef.current); speedIntervalRef.current = null; }
  }, []);

  const freezeAllObstacles = useCallback(() => {
    setObstacles(prev => {
      prev.forEach(o => { o.running = false; o.anim.stopAnimation(); });
      return [...prev];
    });
  }, []);

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

  const setObstaclesSafe = useCallback((updater: (prev: Ob[]) => Ob[]) => {
    setObstacles((prev) => {
      const next = updater(prev);
      obstaclesRef.current = next;
      return next;
    });
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
    let w = carWRef.current;
    let h = carHRef.current;
    let base = 1800;
    if (type === 'pothole') {
      const sz = Math.max(18, Math.round(carWRef.current * 0.44));
      w = sz; h = sz; base = 2300;
    } else {
      w = Math.round(carWRef.current * 0.7);
      h = Math.round(carHRef.current * 1.6);
      base = 1400;
    }
    const duration = Math.max(type === 'pothole' ? 700 : 500, Math.round(base / s));
    const startY = -h - 12;
    const endY = roadH + 80;
    const anim = new Animated.Value(startY);
    const id = `${Date.now()}-${Math.floor(rngRef.current() * 1e9)}`;
    const ob: Ob = { id, type, lane, w, h, anim, lastY: startY, duration, startY, endY, running: true };
    const listenerId = anim.addListener(({ value }) => { ob.lastY = value; });
    ob.listenerId = listenerId;
    setObstaclesSafe(prev => [...prev, ob]);
    Animated.timing(anim, { toValue: endY, duration, useNativeDriver: true }).start(({ finished }) => {
      if (finished && stateRef.current !== 'game_over') removeObstacle(id);
    });
    lastSpawnAtRef.current = Date.now();
    lastSpawnLaneRef.current = lane;
    blockCrossUntilRef.current = lastSpawnAtRef.current + Math.floor(700 / s);
  }, [roadH, setObstaclesSafe, removeObstacle]);

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
      if (stateRef.current === 'game_over') { scheduleNextSpawn(); return; }
      const l = chooseLane();
      const preventWall = otherLaneHasEarlyObstacle(l);
      if (preventWall) spawnObstacle(l, 'pothole'); else spawnObstacle(l, type);
      scheduleNextSpawn();
    }, delay);
  }, [chooseLane, otherLaneHasEarlyObstacle, spawnObstacle]);

  const beginScoreTicker = useCallback(() => {
    scoreFloatRef.current = 0;
    coinUnitsRef.current = 0;
    scoreIntervalRef.current = setInterval(() => {
      if (stateRef.current !== 'running') return;
      const s = Math.max(1, speedRef.current);
      scoreFloatRef.current += s;
      const nextScore = Math.floor(scoreFloatRef.current);
      setScore(nextScore);
      coinUnitsRef.current += 1;
      setRoundCoins(Math.floor(coinUnitsRef.current / 5));
    }, 200);
  }, []);

  const startSpeedRamp = useCallback(() => {
    speedRef.current = 1;
    speedIntervalRef.current = setInterval(() => {
      if (stateRef.current !== 'running') return;
      const cur = speedRef.current + 0.03;
      speedRef.current = cur > 3 ? 3 : cur;
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
    spawnObstacle();
    scheduleNextSpawn();
    beginScoreTicker();
    startSpeedRamp();
    startCollisionLoop();
  }, [roadW, roadH, clearTimers, spawnObstacle, scheduleNextSpawn, beginScoreTicker, startSpeedRamp, startCollisionLoop, setObstaclesSafe]);

  useEffect(() => {
    return () => {
      clearTimers();
      setObstaclesSafe(prev => {
        prev.forEach(o => { if (o.listenerId) o.anim.removeListener(o.listenerId); o.anim.stopAnimation(); });
        return [];
      });
    };
  }, [clearTimers, setObstaclesSafe]);

  if (!fontsLoaded) return null;

  const isLoggedIn = !!uid;
  const plusText = `+${String(roundCoins).padStart(3, '0')}`;

  return (
    <View style={styles.flex}>
      <View style={styles.hudRow}>
        {isLoggedIn ? (
          <>
            <Text style={styles.hudText}>LIVES: {lives}</Text>
            <Text style={styles.hudText}>SCORE: {score}</Text>
            <Text style={styles.hudText}>HIGH: {highScore}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image source={coinIcon} style={{ width: 18, height: 18 }} />
              <Text style={styles.hudText}>{coinBalance}</Text>
              <Text style={[styles.hudText, { color: '#00C853' }]}>{plusText}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.hudText}>LIVES: {lives}</Text>
            <Text style={styles.hudText}>SCORE: {score}</Text>
            <Text style={styles.hudText}>HIGH: {highScore}</Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Pressable
          style={styles.road}
          onLayout={(e) => {
            setRoadW(e.nativeEvent.layout.width);
            setRoadH(e.nativeEvent.layout.height);
            computeCarSize(e.nativeEvent.layout.width);
          }}
          onPressIn={() => { if (stateRef.current === 'running') setPlayerLane(2); }}
          onPressOut={() => { if (stateRef.current === 'running') setPlayerLane(0); }}
        >
          <View style={styles.centerLine} />
          {obstacles.map((o) => (
            <Animated.View
              key={o.id}
              style={{
                position: 'absolute',
                left: laneX(o.lane),
                top: 0,
                width: o.w,
                height: o.h,
                backgroundColor: o.type === 'taxi' ? '#7E57C2' : '#9575CD',
                borderRadius: o.type === 'pothole' ? 4 : 8,
                transform: [{ translateY: o.anim }],
                zIndex: 2,
              }}
            />
          ))}
          <View
            style={{
              position: 'absolute',
              left: laneX(playerLane),
              top: carY(),
              width: carWRef.current,
              height: carHRef.current,
              backgroundColor: state === 'life_lost' ? '#1f3d35aa' : '#1f3d35ff',
              borderRadius: 8,
              zIndex: 3,
            }}
          />
          {state === 'idle' && (
            <View style={styles.overlayCard}>
              <Text style={styles.overlayTitle}>TAP TO START</Text>
              <Pressable style={styles.overlayButton} onPress={startRun}>
                <Text style={styles.overlayButtonText}>START</Text>
              </Pressable>
              <Text style={styles.overlayHint}>Hold to move RIGHT • Release to stay LEFT</Text>
            </View>
          )}
          {state === 'game_over' && (
            <View style={styles.overlayCard}>
              <Text style={styles.overlayTitle}>GAME OVER</Text>
              {beatHigh && <Text style={[styles.overlaySub, { color: '#FFD54F' }]}>HIGH SCORE!</Text>}
              <Text style={styles.overlaySub}>Score {score} • Coins +{roundCoins}</Text>
              <View style={styles.overlayRow}>
                <Pressable
                  style={styles.overlayButton}
                  onPress={async () => {
                    try { if (lastSavePromiseRef.current) await lastSavePromiseRef.current; } catch {}
                    navigation.navigate('Menu' as never);
                  }}
                >
                  <Text style={styles.overlayButtonText}>MENU</Text>
                </Pressable>
                <Pressable
                  style={styles.overlayButton}
                  onPress={async () => {
                    try { if (lastSavePromiseRef.current) await lastSavePromiseRef.current; } catch {}
                    setBeatHigh(false);
                    setState('idle');
                  }}
                >
                  <Text style={styles.overlayButtonText}>RESTART</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.returnButtonContainer}>
        <Pressable
          style={styles.returnButton}
          onPress={async () => {
            try { if (lastSavePromiseRef.current) await lastSavePromiseRef.current; } catch {}
            navigation.navigate('Menu' as never);
          }}
        >
          <Text style={styles.returnText}>RETURN</Text>
        </Pressable>
      </View>
    </View>
  );
}
