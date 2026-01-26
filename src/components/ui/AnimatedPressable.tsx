import React, { memo } from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScalePressableProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  scaleValue?: number;
  duration?: number;
}

function ScalePressableComponent({
  children,
  style,
  scaleValue = 0.97,
  duration = 100,
  onPressIn,
  onPressOut,
  ...rest
}: ScalePressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: any) => {
    scale.value = withTiming(scaleValue, { duration });
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

export const ScalePressable = memo(ScalePressableComponent);

interface FadePressableProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  activeOpacity?: number;
  duration?: number;
}

function FadePressableComponent({
  children,
  style,
  activeOpacity = 0.7,
  duration = 100,
  onPressIn,
  onPressOut,
  ...rest
}: FadePressableProps) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePressIn = (event: any) => {
    opacity.value = withTiming(activeOpacity, { duration });
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    opacity.value = withTiming(1, { duration });
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

export const FadePressable = memo(FadePressableComponent);

interface BounceViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
}

export function BounceView({ children, style, delay = 0 }: BounceViewProps) {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0, 1], [0, 1]),
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

interface SlideInViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  distance?: number;
}

export function SlideInView({
  children,
  style,
  direction = 'up',
  delay = 0,
  distance = 50,
}: SlideInViewProps) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      progress.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX =
      direction === 'left'
        ? interpolate(progress.value, [0, 1], [distance, 0])
        : direction === 'right'
        ? interpolate(progress.value, [0, 1], [-distance, 0])
        : 0;

    const translateY =
      direction === 'up'
        ? interpolate(progress.value, [0, 1], [distance, 0])
        : direction === 'down'
        ? interpolate(progress.value, [0, 1], [-distance, 0])
        : 0;

    return {
      transform: [{ translateX }, { translateY }],
      opacity: progress.value,
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
