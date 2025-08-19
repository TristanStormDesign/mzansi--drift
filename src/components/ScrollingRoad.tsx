import React, { useEffect, useRef } from 'react';
import { Animated, Image as RNImage, Image, Easing, View, StyleSheet } from 'react-native';

const roadSource = RNImage.resolveAssetSource(require('../assets/game/road.webp'));
const AnimatedImage = Animated.createAnimatedComponent(RNImage);

type Props = {
  paused: boolean;
  speed: number;        // 1..3 from your game
  heightPx: number;     // pass the measured roadH
};

export default function ScrollingRoad({ paused, speed, heightPx }: Props) {
  const H = Math.max(1, Math.floor(heightPx || 1));
  const translateY = useRef(new Animated.Value(0)).current;
  const lastYRef = useRef(0);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const pausedRef = useRef(paused);
  const speedRef = useRef(speed);
  const heightRef = useRef(H);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { heightRef.current = H; }, [H]);

  useEffect(() => {
    const id = translateY.addListener(({ value }) => { lastYRef.current = value; });
    return () => translateY.removeListener(id);
  }, [translateY]);

  const stopAnim = () => {
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
  };

  const runSegment = () => {
    const cur = lastYRef.current % heightRef.current;
    translateY.setValue(cur);
    const baseCycleMs = 2200;                  // your original baseline
    const s = Math.max(0.2, speedRef.current); // guard
    const duration = Math.max(300, Math.floor(baseCycleMs / s));
    const target = cur + heightRef.current;

    const anim = Animated.timing(translateY, {
      toValue: target,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    animRef.current = anim;
    anim.start(({ finished }) => {
      if (finished && !pausedRef.current) {
        // Snap back within range to avoid growing numbers and continue
        translateY.setValue(lastYRef.current % heightRef.current);
        runSegment();
      }
    });
  };

  useEffect(() => {
    stopAnim();
    if (!pausedRef.current && heightRef.current > 0) {
      runSegment();
    }
    return stopAnim;
  }, [paused, H, speed]); // any change restarts from the same offset with new timing

  if (!heightPx) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image source={roadSource} style={{ width: 1, height: 1, position: 'absolute', opacity: 0 }} />
      <AnimatedImage
        source={roadSource}
        resizeMode="cover"
        style={{ position: 'absolute', width: '100%', height: H, top: 0, transform: [{ translateY }] }}
      />
      <AnimatedImage
        source={roadSource}
        resizeMode="cover"
        style={{ position: 'absolute', width: '100%', height: H, top: -H, transform: [{ translateY }] }}
      />
      <AnimatedImage
        source={roadSource}
        resizeMode="cover"
        style={{ position: 'absolute', width: '100%', height: H, top: -2 * H, transform: [{ translateY }] }}
      />
    </View>
  );
}
