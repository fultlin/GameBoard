import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export const usePulseAnimation = (startDelay = 0) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.05,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [scale, opacity, startDelay]);

  return { scale, opacity };
};