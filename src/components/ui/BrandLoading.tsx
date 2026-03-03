import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Rect,
  G,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { colors as brandColors } from '@/theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

type BrandLoadingSize = 'small' | 'medium' | 'large' | 'extraLarge';

interface BrandLoadingProps {
  size?: BrandLoadingSize;
}

const SIZE_MAP: Record<BrandLoadingSize, number> = {
  small: 28,
  medium: 52,
  large: 84,
  extraLarge: 128,
};

// SVG viewBox reference: 88x92 (headphone + book + notes area)
const VIEWBOX_W = 88;
const VIEWBOX_H = 92;

export function BrandLoading({ size = 'medium' }: BrandLoadingProps) {
  const { colors, isDark } = useTheme();
  const sizePoints = SIZE_MAP[size];
  const showDetails = size !== 'small';
  const showNotes = size !== 'small';

  // Scale factor to compute actual render dimensions from the reference 76pt
  const scale = sizePoints / 76;
  const renderWidth = VIEWBOX_W * scale;
  const renderHeight = VIEWBOX_H * scale;

  // --- Animations ---

  // Breathing animation for headphone band (vertical offset)
  const breathAnim = useSharedValue(0);
  useEffect(() => {
    breathAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  // Page flip animation cycle: 1.5s active flipping, 1s pause = 2.5s total
  const flipCycle = useSharedValue(0);
  useEffect(() => {
    if (!showDetails) return;
    flipCycle.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.linear }),
      -1,
      false,
    );
  }, [showDetails]);

  // Text line highlight animation (staggered per line)
  const highlightAnim = useSharedValue(0);
  useEffect(() => {
    if (!showDetails) return;
    highlightAnim.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.linear }),
      -1,
      false,
    );
  }, [showDetails]);

  // Music note animations (each note floats upward and fades)
  const noteAnim0 = useSharedValue(0);
  const noteAnim1 = useSharedValue(0);
  const noteAnim2 = useSharedValue(0);
  const noteAnim3 = useSharedValue(0);
  const noteAnim4 = useSharedValue(0);

  useEffect(() => {
    if (!showNotes) return;
    const notes = [noteAnim0, noteAnim1, noteAnim2, noteAnim3, noteAnim4];
    const durations = [1250, 1400, 1150, 1300, 1200];
    const delays = [0, 175, 350, 525, 100];

    notes.forEach((anim, i) => {
      anim.value = withDelay(
        delays[i],
        withRepeat(
          withTiming(1, { duration: durations[i], easing: Easing.linear }),
          -1,
          false,
        ),
      );
    });
  }, [showNotes]);

  // --- Derived animation values ---

  const breathOffset = useDerivedValue(() => {
    return interpolate(breathAnim.value, [0, 1], [0, 2]);
  });

  // Headphone band path animated with breathing
  const bandAnimatedProps = useAnimatedProps(() => {
    const offset = breathOffset.value;
    return {
      d: `M14 ${48 + offset} Q14 ${14 + offset} 44 ${14 + offset} Q74 ${14 + offset} 74 ${48 + offset}`,
    };
  });

  // Page flip: compute page X position based on cycle
  const flipPageAnimatedProps = useAnimatedProps(() => {
    const cycleProgress = flipCycle.value;
    const activeDuration = 1.5 / 2.5; // 60% of cycle is active
    if (cycleProgress >= activeDuration) {
      return { opacity: 0, d: 'M0 0' };
    }

    const activeProgress = cycleProgress / activeDuration;
    const singleFlipDuration = activeDuration / 8;
    const flipPhase =
      (activeProgress % singleFlipDuration) / singleFlipDuration;

    if (flipPhase < 0.1 || flipPhase > 0.9) {
      return { opacity: 0, d: 'M0 0' };
    }

    const t = (flipPhase - 0.1) / 0.8; // normalized 0->1
    const cosT = Math.cos(t * Math.PI);

    if (Math.abs(cosT) < 0.03) {
      return { opacity: 0, d: 'M0 0' };
    }

    const spineX = 44; // book center X in SVG space
    const pageW = 12;
    const freeEdgeX = spineX + cosT * pageW;
    const curlAmount = Math.sin(t * Math.PI) * 3;
    const midX = (spineX + freeEdgeX) / 2;

    return {
      opacity: 1,
      d: `M${spineX} 36 Q${midX} ${36 - curlAmount} ${freeEdgeX} 36 L${freeEdgeX} 62 Q${midX} ${62 - curlAmount * 0.3} ${spineX} 62 Z`,
    };
  });

  // Text line highlight opacities (8 lines, staggered)
  const lineOpacities = Array.from({ length: 8 }, (_, i) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDerivedValue(() => {
      const phase =
        ((highlightAnim.value + i * 0.12) % 1.0);
      return Math.sin(phase * Math.PI) * 0.7;
    }),
  );

  // Note animation derived values
  const noteAnims = [noteAnim0, noteAnim1, noteAnim2, noteAnim3, noteAnim4];
  const noteConfigs = [
    { char: '\u266A', angle: 210, maxR: 28, fontSize: 11, color: brandColors.brandGradientEnd },
    { char: '\u266B', angle: 240, maxR: 32, fontSize: 12, color: brandColors.brandGradientMiddle },
    { char: '\u266A', angle: 270, maxR: 26, fontSize: 11, color: brandColors.brandGradientStart },
    { char: '\u266B', angle: 300, maxR: 30, fontSize: 12, color: brandColors.accentPink },
    { char: '\u266A', angle: 330, maxR: 28, fontSize: 11, color: brandColors.accentPurple },
  ];

  const noteTransforms = noteAnims.map((anim, i) => {
    const config = noteConfigs[i];
    const rad = (config.angle * Math.PI) / 180;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDerivedValue(() => {
      const phase = anim.value;
      const r = config.maxR * (0.3 + phase * 0.7);
      const x = 44 + r * Math.cos(rad);
      const y = 31 + r * Math.sin(rad);

      let opacity: number;
      if (phase < 0.15) {
        opacity = (phase / 0.15) * 0.85;
      } else if (phase < 0.6) {
        opacity = 0.85 - ((phase - 0.15) / 0.45) * 0.15;
      } else {
        opacity = 0.7 * (1 - (phase - 0.6) / 0.4);
      }

      return { x, y, opacity };
    });
  });

  const pageColor = isDark ? '#2C2C2E' : '#FFFFFF';
  const pageBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  const spineColor = isDark ? '#3A3A3C' : '#E5E5EA';
  const flipPageColor = isDark ? '#3A3A3C' : '#F2F2F7';

  return (
    <View style={[styles.container, { width: renderWidth, height: renderHeight }]}>
      <Svg
        width={renderWidth}
        height={renderHeight}
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      >
        <Defs>
          {/* Headphone band gradient */}
          <LinearGradient id="bandGrad" x1="14" y1="48" x2="74" y2="48" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={brandColors.brandGradientStart} />
            <Stop offset="0.5" stopColor={brandColors.brandGradientMiddle} />
            <Stop offset="1" stopColor={brandColors.brandGradientEnd} />
          </LinearGradient>

          {/* Ear cup gradient */}
          <LinearGradient id="cupGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={brandColors.brandGradientMiddle} />
            <Stop offset="1" stopColor={brandColors.brandPrimary} />
          </LinearGradient>

          {/* Left text line highlight gradient (blue) */}
          <LinearGradient id="hlBlue" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={brandColors.brandGradientStart} stopOpacity="0.7" />
            <Stop offset="1" stopColor={brandColors.brandGradientStart} stopOpacity="0" />
          </LinearGradient>

          {/* Right text line highlight gradient (purple) */}
          <LinearGradient id="hlPurple" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={brandColors.brandGradientMiddle} stopOpacity="0.7" />
            <Stop offset="1" stopColor={brandColors.brandGradientMiddle} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Headphone Band */}
        <AnimatedPath
          animatedProps={bandAnimatedProps}
          fill="none"
          stroke="url(#bandGrad)"
          strokeWidth={Math.max(4.5, 1.5)}
          strokeLinecap="round"
        />

        {/* Left Ear Cup */}
        <Rect x={6} y={42} width={18} height={26} rx={7} fill="url(#cupGrad)" />
        {showDetails && (
          <>
            <Rect
              x={9}
              y={46}
              width={12}
              height={18}
              rx={5}
              fill="none"
              stroke={brandColors.brandGradientEnd}
              strokeWidth={0.8}
              strokeOpacity={0.4}
            />
            <Rect
              x={10.5}
              y={48}
              width={9}
              height={14}
              rx={4}
              fill={brandColors.brandPrimary}
              fillOpacity={0.3}
            />
          </>
        )}

        {/* Right Ear Cup */}
        <Rect x={64} y={42} width={18} height={26} rx={7} fill="url(#cupGrad)" />
        {showDetails && (
          <>
            <Rect
              x={67}
              y={46}
              width={12}
              height={18}
              rx={5}
              fill="none"
              stroke={brandColors.brandGradientEnd}
              strokeWidth={0.8}
              strokeOpacity={0.4}
            />
            <Rect
              x={68.5}
              y={48}
              width={9}
              height={14}
              rx={4}
              fill={brandColors.brandPrimary}
              fillOpacity={0.3}
            />
          </>
        )}

        {/* Book - Left Page */}
        <Path
          d="M30 40 Q30 36 32.5 36 L42 36 L42 62 Q37 61 30 62 Z"
          fill={pageColor}
          stroke={pageBorder}
          strokeWidth={0.8}
        />

        {/* Book - Right Page */}
        <Path
          d="M46 36 L55.5 36 Q58 36 58 40 L58 62 Q51 61 46 62 Z"
          fill={pageColor}
          stroke={pageBorder}
          strokeWidth={0.8}
        />

        {/* Book - Spine */}
        <Path
          d="M42 36 Q44 34 46 36 L46 62 Q44 64 42 62 Z"
          fill={spineColor}
          stroke={pageBorder}
          strokeWidth={0.6}
        />

        {/* Animated Page Flip (medium+ only) */}
        {showDetails && (
          <AnimatedPath
            animatedProps={flipPageAnimatedProps}
            fill={flipPageColor}
            stroke={pageBorder}
            strokeWidth={0.8}
          />
        )}

        {/* Text Lines on Book Pages (medium+ only) */}
        {showDetails && (
          <TextLines
            lineOpacities={lineOpacities}
            isDark={isDark}
          />
        )}

        {/* Music Notes (medium+ only) */}
        {showNotes &&
          noteConfigs.map((config, i) => (
            <MusicNote
              key={i}
              config={config}
              transform={noteTransforms[i]}
            />
          ))}
      </Svg>
    </View>
  );
}

// --- Sub-components for animated elements ---

interface TextLinesProps {
  lineOpacities: { value: number }[];
  isDark: boolean;
}

function TextLines({ lineOpacities, isDark }: TextLinesProps) {
  const baseGray = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  // Left page lines at y offsets: 43, 47, 51, 55
  const leftYs = [43, 47, 51, 55];
  // Right page lines at y offsets: 43, 47, 51, 55
  const rightYs = [43, 47, 51, 55];

  return (
    <G>
      {/* Left page base lines */}
      {leftYs.map((y, i) => (
        <Rect key={`lb-${i}`} x={32.5} y={y} width={7.5} height={1.2} rx={0.6} fill={baseGray} />
      ))}
      {/* Left page highlight lines */}
      {leftYs.map((y, i) => (
        <AnimatedTextLine
          key={`lh-${i}`}
          x={32.5}
          y={y}
          width={7.5}
          opacity={lineOpacities[i]}
          color={brandColors.brandGradientStart}
        />
      ))}
      {/* Right page base lines */}
      {rightYs.map((y, i) => (
        <Rect
          key={`rb-${i}`}
          x={48.5}
          y={y}
          width={i === 3 ? 5 : 7.5}
          height={1.2}
          rx={0.6}
          fill={baseGray}
        />
      ))}
      {/* Right page highlight lines */}
      {rightYs.map((y, i) => (
        <AnimatedTextLine
          key={`rh-${i}`}
          x={48.5}
          y={y}
          width={i === 3 ? 5 : 7.5}
          opacity={lineOpacities[i + 4]}
          color={brandColors.brandGradientMiddle}
        />
      ))}
    </G>
  );
}

interface AnimatedTextLineProps {
  x: number;
  y: number;
  width: number;
  opacity: { value: number };
  color: string;
}

function AnimatedTextLine({ x, y, width, opacity, color }: AnimatedTextLineProps) {
  const animatedProps = useAnimatedProps(() => ({
    fillOpacity: Math.max(0, opacity.value),
  }));

  return (
    <AnimatedRect
      x={x}
      y={y}
      width={width}
      height={1.2}
      rx={0.6}
      fill={color}
      animatedProps={animatedProps}
    />
  );
}

interface MusicNoteProps {
  config: {
    char: string;
    angle: number;
    maxR: number;
    fontSize: number;
    color: string;
  };
  transform: { value: { x: number; y: number; opacity: number } };
}

function MusicNote({ config, transform }: MusicNoteProps) {
  const animatedProps = useAnimatedProps(() => {
    const { x, y, opacity } = transform.value;
    return {
      x: x,
      y: y,
      fillOpacity: opacity,
    };
  });

  return (
    <AnimatedSvgText
      animatedProps={animatedProps}
      fill={config.color}
      fontSize={config.fontSize}
      textAnchor="middle"
    >
      {config.char}
    </AnimatedSvgText>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
