import React, { useEffect, useRef } from 'react';
import { Animated, Image as RNImage, Image, View, StyleSheet } from 'react-native';

const roadSource = RNImage.resolveAssetSource(require('../assets/game/road.webp'));
const AnimatedImage = Animated.createAnimatedComponent(RNImage);

type Props = {
  paused: boolean;
  speed: number;
  heightPx: number;
  widthPx?: number;
};

export default function ScrollingRoad({ paused, speed, heightPx, widthPx = 0 }: Props) {
  const H = Math.max(1, Math.floor(heightPx || 1));
  const W = Math.max(0, Math.floor(widthPx || 0));
  const translateY = useRef(new Animated.Value(0)).current;
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const playingRef = useRef(false);
  const ppsRef = useRef(120);
  const heightRef = useRef(H);

  const recompute = () => {
    const s = Math.max(1, Math.min(3, speed || 1));
    const carScale = W > 0 ? (W * 0.22) / 258 : 0;
    const potholeH = 145 * carScale;
    const totalDist = H + 92 + potholeH;
    const durationMs = Math.max(700, Math.round(2300 / s));
    ppsRef.current = (totalDist / durationMs) * 0.84;
  };

  useEffect(() => {
    heightRef.current = H;
    translateY.setValue(offsetRef.current % H);
    recompute();
  }, [H]);

  useEffect(() => {
    recompute();
  }, [W, speed]);

  useEffect(() => {
    playingRef.current = !paused && H > 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastTsRef.current = null;
    const cb = (ts: number) => {
      if (!playingRef.current) {
        lastTsRef.current = ts;
      } else {
        const last = lastTsRef.current ?? ts;
        const dt = ts - last;
        lastTsRef.current = ts;
        const dy = dt * ppsRef.current;
        offsetRef.current = (offsetRef.current + dy) % heightRef.current;
        translateY.setValue(offsetRef.current);
      }
      rafRef.current = requestAnimationFrame(cb);
    };
    rafRef.current = requestAnimationFrame(cb);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [paused, H]);

  if (!heightPx) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image source={roadSource} style={{ width: 1, height: 1, position: 'absolute', opacity: 0 }} />
      <AnimatedImage
        source={roadSource}
        resizeMode="cover"
        style={{
          position: 'absolute',
          width: '100%',
          height: H,
          top: 0,
          transform: [{ translateY }],
        }}
      />
      <AnimatedImage
        source={roadSource}
        resizeMode="cover"
        style={{
          position: 'absolute',
          width: '100%',
          height: H,
          top: -H,
          transform: [{ translateY }],
        }}
      />
    </View>
  );
}
