// Type declarations for missing modules

declare module '@react-native-community/slider' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  interface SliderProps {
    style?: StyleProp<ViewStyle>;
    value?: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    disabled?: boolean;
    onValueChange?: (value: number) => void;
    onSlidingStart?: (value: number) => void;
    onSlidingComplete?: (value: number) => void;
  }

  const Slider: React.FC<SliderProps>;
  export default Slider;
}

