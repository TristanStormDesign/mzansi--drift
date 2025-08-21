import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Image, Animated, Dimensions, Platform, KeyboardAvoidingView, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
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
import { Audio, ResizeMode, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { multiplayerGameStyles } from '../styles/MultiplayerGameStyles';
import { RootStackParamList } from '../types/navigation';

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

export default function MultiplayerGameScreen() {
  const insets = useSafeAreaInsets();
  const g = multiplayerGameStyles(insets);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'MultiplayerGame'>>();
  const { roomId } = route.params;
  const [fontsLoaded] = useFonts({ Silkscreen_400Regular });

  const [state, setState] = useState<GameState>('idle');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [playerLane, setPlayerLane] = useState<Lane>(0);
  const [roadW, setRoadW] = useState(0);
  const [roadH, setRoadH] = useState(0);
  const [obstacles, setObstacles] = useState<Ob[]>([]);
  const [wingEquipped, setWingEquipped] = useState(false);
  const [stripesEquipped, setStripesEquipped] = useState(false);
  const [plateEquipped, setPlateEquipped] = useState(false);
  const [roadSpeed, setRoadSpeed] = useState(1);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayMode, setOverlayMode] = useState<'lobby' | 'round_end' | 'match_end'>('lobby');
  const [role, setRole] = useState<'p1' | 'p2'>('p1');
  const [opLane, setOpLane] = useState<Lane>(0);
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [p1Flag, setP1Flag] = useState('');
  const [p2Flag, setP2Flag] = useState('');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [bestOf, setBestOf] = useState(3);
  const [seed, setSeed] = useState(0);
  const [winner, setWinner] = useState<null | 'p1' | 'p2'>(null);

  const overlayY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const stateRef = useRef<GameState>('idle');
  const livesRef = useRef(3);
  const laneRef = useRef<Lane>(0);
  const obstaclesRef = useRef<Ob[]>([]);
  const rngRef = useRef(() => Math.random());
  const carWRef = useRef(0);
  const carHRef = useRef(0);

  const spawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const collideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lastSpawnAtRef = useRef(0);
  const blockCrossUntilRef = useRef(0);
  const lastSpawnLaneRef = useRef<Lane | null>(null);

  const speedRef = useRef(1);
  const scoreFloatRef = useRef(0);

  const potholeHitsRef = useRef(0);

  const musicRef = useRef<Audio.Sound | null>(null);
  const carRef = useRef<Audio.Sound | null>(null);
  const potholeRefs = useRef<Audio.Sound[]>([]);
  const crashRef = useRef<Audio.Sound | null>(null);

  const musicVolRef = useRef(0.06);
  const sfxVolRef = useRef(0.45);

  const BASE_CAR_W = 258;
  const BASE_CAR_H = 388;
  const BASE_TAXI_W = 255;
  const BASE_TAXI_H = 400;
  const BASE_POT_W = 197;
  const BASE_POT_H = 145;

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { laneRef.current = playerLane; }, [playerLane]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);

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

  const opCarY = useCallback(() => {
    const y = carY();
    return Math.min(roadH - carHRef.current - 10, y + Math.floor(carHRef.current * 0.65));
  }, [carY, roadH]);

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
    if (speedIntervalRef.current) { clearInterval(speedIntervalRef.current); speedIntervalRef.current = null; }
  }, []);

  const freezeAllObstacles = useCallback(() => {
    setObstaclesSafe(prev => {
      prev.forEach(o => { o.running = false; o.anim.stopAnimation(); });
      return [...prev];
    });
  }, [setObstaclesSafe]);

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
    const base = type === 'pothole' ? 2800 : 1400;
    const duration = Math.max(type === 'pothole' ? 800 : 500, Math.round(base / s));
    const startY = -h - 12;
    const endY = roadH + 80;
    const anim = new Animated.Value(startY);
    const id = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    const totalDist = endY - startY;
    const pxPerMs = totalDist / duration;
    const ob: Ob = { id, type, lane, w, h, anim, lastY: startY, duration, startY, endY, running: true, pxPerMs };
    const listenerId = anim.addListener(({ value }) => { ob.lastY = value; });
    ob.listenerId = listenerId;
    setObstaclesSafe(prev => [...prev, ob]);
    Animated.timing(anim, { toValue: endY, duration, easing: Easing.linear, useNativeDriver: true }).start(({ finished }) => {
      if (finished && stateRef.current !== 'game_over') removeObstacle(id);
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
    const t = setTimeout(() => {
      if (stateRef.current === 'game_over') return;
      const l = chooseLane();
      const preventWall = otherLaneHasEarlyObstacle(l);
      if (preventWall) spawnObstacle(l, 'pothole'); else spawnObstacle(l, type);
      scheduleNextSpawn();
    }, delay);
    spawnTimeoutRef.current = t;
  }, [chooseLane, otherLaneHasEarlyObstacle, spawnObstacle]);

  const beginScoreTicker = useCallback(() => {
    scoreFloatRef.current = 0;
    const i = setInterval(() => {
      if (stateRef.current !== 'running') return;
      const s = Math.max(1, speedRef.current);
      scoreFloatRef.current += s;
      const nextScore = Math.floor(scoreFloatRef.current);
      setScore(nextScore);
    }, 200);
    scoreIntervalRef.current = i;
  }, []);

  const startSpeedRamp = useCallback(() => {
    speedRef.current = 1;
    setRoadSpeed(1);
    const i = setInterval(() => {
      if (stateRef.current !== 'running') return;
      const cur = speedRef.current + 0.03;
      const capped = cur > 3 ? 3 : cur;
      speedRef.current = capped;
      setRoadSpeed(capped);
    }, 1000);
    speedIntervalRef.current = i;
  }, []);

  const rectsOverlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const playPotholeSfx = useCallback(() => {
    const idx = Math.min(potholeHitsRef.current, 3) - 1;
    const s = potholeRefs.current[idx];
    if (s) s.replayAsync();
  }, []);

  const handleGameOverLocal = useCallback(() => {
    freezeAllObstacles();
    clearTimers();
    setState('game_over');
    stateRef.current = 'game_over';
    runTransaction(db, async (tx) => {
      const me = auth.currentUser?.uid || '';
      const rRef = doc(db, 'rooms', roomId);
      const snap = await tx.get(rRef);
      if (!snap.exists()) return;
      const d = snap.data() as any;
      if (d.status !== 'running') return;
      const isP1 = d.players?.p1?.uid === me;
      const winnerSide = isP1 ? 'p2' : 'p1';
      const scores = d.scores || { p1: 0, p2: 0 };
      const nextScores = { p1: scores.p1, p2: scores.p2 };
      nextScores[winnerSide] = (nextScores[winnerSide] || 0) + 1;
      tx.update(rRef, {
        status: 'round_end',
        winner: winnerSide,
        scores: nextScores,
        updatedAt: serverTimestamp(),
      });
    });
  }, [freezeAllObstacles, clearTimers, roomId]);

  const startCollisionLoop = useCallback(() => {
    const i = setInterval(() => {
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
          handleGameOverLocal();
        } else {
          potholeHitsRef.current += 1;
          playPotholeSfx();
          const nextLives = Math.max(0, livesRef.current - 1);
          setLives(nextLives);
          removeObstacle(hit.id);
          if (nextLives <= 0) {
            handleGameOverLocal();
          }
        }
      }
    }, 50);
    collideIntervalRef.current = i;
  }, [carY, laneX, handleGameOverLocal, removeObstacle, playPotholeSfx]);

  const openOverlay = useCallback(() => {
    setOverlayVisible(true);
    overlayY.setValue(Dimensions.get('window').height);
    Animated.timing(overlayY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
  }, [overlayY]);

  const closeOverlay = useCallback(() => {
    Animated.timing(overlayY, { toValue: Dimensions.get('window').height, duration: 300, useNativeDriver: true }).start(() => {
      setOverlayVisible(false);
    });
  }, [overlayY]);

  const startRun = useCallback(async () => {
    if (roadW <= 0 || roadH <= 0) return;
    clearTimers();
    setObstaclesSafe(() => []);
    setLives(3);
    setScore(0);
    potholeHitsRef.current = 0;
    scoreFloatRef.current = 0;
    setPlayerLane(0);
    setState('running');
    stateRef.current = 'running';
    setRoadSpeed(1);
    rngRef.current = rng(seed || 1);
    try {
      const rRef = doc(db, 'rooms', roomId);
      const me = auth.currentUser?.uid || '';
      const snap = await getDoc(rRef);
      const d = snap.data() as any;
      const isP1 = d?.players?.p1?.uid === me;
      await updateDoc(rRef, {
        [isP1 ? 'players.p1.lane' : 'players.p2.lane']: 0,
        [isP1 ? 'players.p1.lives' : 'players.p2.lives']: 3,
        [isP1 ? 'players.p1.alive' : 'players.p2.alive']: true,
        updatedAt: serverTimestamp(),
      });
    } catch {}
    spawnObstacle();
    scheduleNextSpawn();
    beginScoreTicker();
    startSpeedRamp();
    startCollisionLoop();
  }, [roadW, roadH, clearTimers, spawnObstacle, scheduleNextSpawn, beginScoreTicker, startSpeedRamp, startCollisionLoop, seed, roomId, setObstaclesSafe]);

  const nextRound = useCallback(async () => {
    const rRef = doc(db, 'rooms', roomId);
    const seedNext = (Date.now() & 0xfffffff) >>> 0;
    await updateDoc(rRef, {
      status: 'running',
      round: roundNum + 1,
      seed: seedNext,
      winner: null,
      updatedAt: serverTimestamp(),
    });
  }, [roomId, roundNum]);

  useEffect(() => {
    return () => {
      clearTimers();
      setObstaclesSafe(prev => {
        prev.forEach(o => { if (o.listenerId) o.anim.removeListener(o.listenerId); o.anim.stopAnimation(); });
        return [];
      });
    };
  }, [clearTimers, setObstaclesSafe]);

  useEffect(() => {
    if (!roomId) return;
    const rRef = doc(db, 'rooms', roomId);
    const unsub = onSnapshot(rRef, (snap) => {
      const d = snap.data() as any;
      if (!d) return;
      const me = auth.currentUser?.uid || '';
      const myRole = d.players?.p1?.uid === me ? 'p1' : 'p2';
      setRole(myRole);
      setP1Name(d.players?.p1?.displayName || 'Player 1');
      setP2Name(d.players?.p2?.displayName || 'Player 2');
      setP1Flag(d.players?.p1?.flagEmoji || '');
      setP2Flag(d.players?.p2?.flagEmoji || '');
      setP1Score(d.scores?.p1 || 0);
      setP2Score(d.scores?.p2 || 0);
      setRoundNum(d.round || 1);
      setBestOf(d.bestOf || 3);
      setSeed(d.seed || 1);
      setWinner(d.winner || null);
      const opponentLane = myRole === 'p1' ? d.players?.p2?.lane ?? 0 : d.players?.p1?.lane ?? 0;
      setOpLane(opponentLane === 2 ? 2 : 0);
      if (d.status === 'lobby') {
        setOverlayMode('lobby');
        openOverlay();
      } else if (d.status === 'running') {
        closeOverlay();
        setTimeout(() => startRun(), 30);
      } else if (d.status === 'round_end') {
        setOverlayMode('round_end');
        openOverlay();
      } else if (d.status === 'match_end') {
        setOverlayMode('match_end');
        openOverlay();
      }
    });
    return () => unsub();
  }, [roomId, openOverlay, closeOverlay, startRun]);

  useEffect(() => {
    if (!fontsLoaded) return;
  }, [fontsLoaded]);

  const meCarImage = useMemo(() => {
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

  const targetWins = Math.ceil(bestOf / 2);
  const matchWinner = p1Score >= targetWins ? 'p1' : (p2Score >= targetWins ? 'p2' : null);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={g.flex}>
      <View style={g.scoreboardBar}>
        <View style={g.scoreBox}>
          <Text style={g.scoreText}>{p1Flag ? `${p1Flag} ` : ''}{p1Name}</Text>
          <Text style={g.scoreText}>{p1Score}</Text>
        </View>
        <View style={g.roleChip}>
          <Text style={g.roleText}>{role === 'p1' ? 'P1' : 'P2'}</Text>
        </View>
        <View style={g.scoreBox}>
          <Text style={g.scoreText}>{p2Flag ? `${p2Flag} ` : ''}{p2Name}</Text>
          <Text style={g.scoreText}>{p2Score}</Text>
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
          onPressIn={() => { if (stateRef.current === 'running') setPlayerLane(2); }}
          onPressOut={() => { if (stateRef.current === 'running') setPlayerLane(0); }}
        >
          <ScrollingRoad paused={state !== 'running'} speed={roadSpeed} heightPx={roadH} />

          <View style={[g.hudInside, g.hudRowTopPad]}>
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
              </View>
            </View>
          </View>

          {obstacles.map((o) => (
            <Animated.View
              key={o.id}
              style={[
                g.obstacle,
                {
                  left: laneX(o.lane),
                  width: o.w,
                  height: o.h,
                  transform: [{ translateY: o.anim }],
                },
              ]}
            >
              <Image source={o.type === 'taxi' ? taxiImg : potholeImg} style={g.full} resizeMode="contain" />
            </Animated.View>
          ))}

          <View
            style={[
              g.car,
              {
                left: laneX(playerLane),
                top: carY(),
                width: carWRef.current,
                height: carHRef.current,
              },
            ]}
          >
            <Image source={meCarImage} style={g.full} resizeMode="contain" />
          </View>

          <View
            style={[
              g.ghostCar,
              {
                left: laneX(opLane),
                top: opCarY(),
                width: carWRef.current,
                height: carHRef.current,
              },
            ]}
          >
            <Image source={meCarImage} style={g.full} resizeMode="contain" />
          </View>
        </Pressable>
      </View>

      {overlayVisible && (
        <View style={g.overlayWrap}>
          <Animated.View style={[g.overlayCard, { transform: [{ translateY: overlayY }] }]}>
            {overlayMode === 'lobby' && (
              <>
                <Text style={g.overlayTitle}>MULTIPLAYER</Text>
                <View style={{ gap: 16 }}>
                  <View style={g.infoPill}>
                    <Text style={g.infoPillText}>Waiting for host to start</Text>
                  </View>
                </View>
                <View style={{ height: 12 }} />
                <View style={g.btnCol}>
                  <View style={g.btnRow}>
                    <Pressable onPress={() => navigation.goBack()} style={g.btnGreyFlex}>
                      <Text style={g.btnText}>EXIT</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
            {overlayMode === 'round_end' && (
              <>
                <Text style={g.overlayTitle}>ROUND {roundNum} OVER</Text>
                <View style={{ gap: 10 }}>
                  <View style={g.infoPill}>
                    <Text style={g.infoPillText}>{winner === 'p1' ? `${p1Name} wins` : `${p2Name} wins`}</Text>
                  </View>
                </View>
                <View style={{ height: 12 }} />
                <View style={g.btnCol}>
                  <View style={g.btnRow}>
                    {Math.max(p1Score, p2Score) >= Math.ceil(bestOf / 2) ? (
                      <Pressable onPress={() => navigation.goBack()} style={g.btnGreenFlex}>
                        <Text style={g.btnText}>FINISH</Text>
                      </Pressable>
                    ) : role === 'p1' ? (
                      <Pressable onPress={nextRound} style={g.btnGreenFlex}>
                        <Text style={g.btnText}>NEXT ROUND</Text>
                      </Pressable>
                    ) : (
                      <Pressable disabled style={g.btnGreyFlex}>
                        <Text style={g.btnText}>WAITING</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => navigation.goBack()} style={g.btnGreyFlex}>
                      <Text style={g.btnText}>EXIT</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
            {overlayMode === 'match_end' && (
              <>
                <Text style={g.overlayTitle}>MATCH OVER</Text>
                <View style={{ gap: 10 }}>
                  <View style={g.infoPill}>
                    <Text style={g.infoPillText}>{p1Score > p2Score ? `${p1Name} wins` : `${p2Name} wins`}</Text>
                  </View>
                </View>
                <View style={{ height: 12 }} />
                <View style={g.btnCol}>
                  <View style={g.btnRow}>
                    <Pressable onPress={() => navigation.goBack()} style={g.btnGreenFlex}>
                      <Text style={g.btnText}>FINISH</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.goBack()} style={g.btnGreyFlex}>
                      <Text style={g.btnText}>EXIT</Text>
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
