import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/stores/settingsStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LevelKey = 'beginner' | 'elementary' | 'intermediate' | 'advanced';

interface LevelOption {
  key: LevelKey;
  number: string;
  title: string;
  description: string;
}

interface GoalOption {
  value: number;
  label: string;
}

interface InterestOption {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  displayName: string;
  localizedName: string;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const LEVEL_OPTIONS: LevelOption[] = [
  { key: 'beginner', number: 'A1', title: 'Beginner', description: 'I know a few basic words' },
  { key: 'elementary', number: 'A2', title: 'Elementary', description: 'I can handle simple conversations' },
  { key: 'intermediate', number: 'B1', title: 'Intermediate', description: 'I can read simple articles' },
  { key: 'advanced', number: 'B2', title: 'Advanced', description: 'I can read most English content' },
];

const GOAL_OPTIONS: GoalOption[] = [
  { value: 5, label: 'min' },
  { value: 10, label: 'min' },
  { value: 15, label: 'min' },
  { value: 20, label: 'min' },
  { value: 30, label: 'min' },
  { value: 60, label: 'min' },
];

const INTEREST_OPTIONS: InterestOption[] = [
  { key: 'fiction', icon: 'book-outline', displayName: 'Fiction', localizedName: 'Stories & Novels' },
  { key: 'science', icon: 'flask-outline', displayName: 'Science', localizedName: 'Scientific Discovery' },
  { key: 'history', icon: 'time-outline', displayName: 'History', localizedName: 'Past Events' },
  { key: 'technology', icon: 'laptop-outline', displayName: 'Technology', localizedName: 'Tech & Innovation' },
  { key: 'business', icon: 'briefcase-outline', displayName: 'Business', localizedName: 'Economy & Finance' },
  { key: 'philosophy', icon: 'bulb-outline', displayName: 'Philosophy', localizedName: 'Ideas & Thought' },
  { key: 'travel', icon: 'airplane-outline', displayName: 'Travel', localizedName: 'World Exploration' },
  { key: 'nature', icon: 'leaf-outline', displayName: 'Nature', localizedName: 'Environment & Wildlife' },
  { key: 'art', icon: 'color-palette-outline', displayName: 'Art', localizedName: 'Creative Expression' },
  { key: 'health', icon: 'fitness-outline', displayName: 'Health', localizedName: 'Wellness & Fitness' },
];

const WELCOME_FEATURES = [
  {
    icon: 'library-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Thousands of Books',
    description: 'From classics to modern bestsellers',
  },
  {
    icon: 'sparkles-outline' as keyof typeof Ionicons.glyphMap,
    title: 'AI-Powered Assistance',
    description: 'Instant explanations and translations',
  },
  {
    icon: 'trending-up-outline' as keyof typeof Ionicons.glyphMap,
    title: 'Track Your Progress',
    description: 'Build vocabulary with smart flashcards',
  },
];

const TOTAL_STEPS = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const setDailyGoal = useSettingsStore((s) => s.setDailyGoal);

  // ---- state ----
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<LevelKey | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<number>(15);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

  // ---- animations ----
  const welcomeIconScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const runEntrance = useCallback(() => {
    welcomeIconScale.setValue(0);
    contentOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(welcomeIconScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [welcomeIconScale, contentOpacity]);

  useEffect(() => {
    runEntrance();
  }, [currentStep, runEntrance]);

  // ---- handlers ----
  const handleContinue = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save daily goal to settings store
      setDailyGoal(selectedGoal);
      // Log selections for debugging
      console.log('[Onboarding] level:', selectedLevel);
      console.log('[Onboarding] dailyGoal:', selectedGoal);
      console.log('[Onboarding] interests:', [...selectedInterests]);
      router.replace('/(auth)/login');
    }
  };

  const toggleInterest = (key: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const isButtonDisabled = isLastStep && selectedInterests.size === 0;

  // ---- derived styles ----
  const primaryBg01 = colors.primary + '1A'; // ~0.1 opacity
  const primaryBg02 = colors.primary + '33'; // ~0.2 opacity
  const grayBg02 = colors.textTertiary + '33';
  const grayBg03 = colors.textTertiary + '4D';

  // =======================================================================
  // Progress Bar
  // =======================================================================
  const renderProgressBar = () => (
    <View style={styles.progressBarRow}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            {
              backgroundColor: i <= currentStep ? colors.primary : grayBg03,
            },
          ]}
        />
      ))}
    </View>
  );

  // =======================================================================
  // Step 1 - Welcome
  // =======================================================================
  const renderWelcome = () => (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.stepContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Icon */}
      <Animated.View
        style={[
          styles.welcomeIconCircle,
          { backgroundColor: primaryBg01, transform: [{ scale: welcomeIconScale }] },
        ]}
      >
        <Ionicons name="hand-left-outline" size={72} color={colors.primary} />
      </Animated.View>

      {/* Title + Subtitle */}
      <Animated.View style={[styles.welcomeHeader, { opacity: contentOpacity }]}>
        <Text style={[styles.titleText, { color: colors.text }]}>Welcome to Readmigo</Text>
        <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
          Learn English through reading books you love
        </Text>
      </Animated.View>

      {/* Features */}
      <Animated.View style={[styles.featureList, { opacity: contentOpacity }]}>
        {WELCOME_FEATURES.map((f, idx) => (
          <View key={idx} style={styles.featureRow}>
            <View style={[styles.featureIconCircle, { backgroundColor: primaryBg01 }]}>
              <Ionicons name={f.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.featureTextWrap}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{f.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                {f.description}
              </Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );

  // =======================================================================
  // Step 2 - Level Assessment
  // =======================================================================
  const renderLevel = () => (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.stepContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.stepHeader, { opacity: contentOpacity }]}>
        <Ionicons name="school-outline" size={48} color={colors.primary} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>What's your level?</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          We'll personalize content to match your ability
        </Text>
      </Animated.View>

      <Animated.View style={[styles.levelCards, { opacity: contentOpacity }]}>
        {LEVEL_OPTIONS.map((opt) => {
          const selected = selectedLevel === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.7}
              onPress={() => setSelectedLevel(opt.key)}
              style={[
                styles.levelCard,
                {
                  backgroundColor: selected ? primaryBg01 : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.levelNumberCircle,
                  {
                    backgroundColor: selected ? colors.primary : grayBg02,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.levelNumber,
                    { color: selected ? colors.onPrimary : colors.textSecondary },
                  ]}
                >
                  {opt.number}
                </Text>
              </View>
              <View style={styles.levelTextWrap}>
                <Text style={[styles.levelTitle, { color: colors.text }]}>{opt.title}</Text>
                <Text style={[styles.levelDesc, { color: colors.textSecondary }]}>
                  {opt.description}
                </Text>
              </View>
              {selected && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </ScrollView>
  );

  // =======================================================================
  // Step 3 - Goal Setting
  // =======================================================================
  const renderGoal = () => (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.stepContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.stepHeader, { opacity: contentOpacity }]}>
        <Ionicons name="flag-outline" size={48} color={colors.primary} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>Set your daily goal</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          How much time do you want to read each day?
        </Text>
      </Animated.View>

      {/* Large number */}
      <Animated.View style={[styles.goalBigNumberWrap, { opacity: contentOpacity }]}>
        <Text style={[styles.goalBigNumber, { color: colors.primary }]}>{selectedGoal}</Text>
        <Text style={[styles.goalBigLabel, { color: colors.textSecondary }]}>minutes per day</Text>
      </Animated.View>

      {/* Grid */}
      <Animated.View style={[styles.goalGrid, { opacity: contentOpacity }]}>
        {GOAL_OPTIONS.map((opt) => {
          const selected = selectedGoal === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              activeOpacity={0.7}
              onPress={() => setSelectedGoal(opt.value)}
              style={[
                styles.goalCell,
                {
                  backgroundColor: selected ? colors.primary : grayBg02,
                },
              ]}
            >
              <Text
                style={[
                  styles.goalCellNumber,
                  { color: selected ? colors.onPrimary : colors.primary },
                ]}
              >
                {opt.value}
              </Text>
              <Text
                style={[
                  styles.goalCellLabel,
                  { color: selected ? colors.onPrimary : colors.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Recommendation */}
      <Animated.View
        style={[styles.recommendBox, { backgroundColor: primaryBg01, opacity: contentOpacity }]}
      >
        <Ionicons name="bulb-outline" size={18} color={colors.primary} />
        <Text style={[styles.recommendText, { color: colors.textSecondary }]}>
          We recommend 15-20 minutes daily for consistent progress
        </Text>
      </Animated.View>
    </ScrollView>
  );

  // =======================================================================
  // Step 4 - Interests
  // =======================================================================
  const renderInterests = () => (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.stepContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.stepHeader, { opacity: contentOpacity }]}>
        <Ionicons name="heart-outline" size={48} color={colors.primary} />
        <Text style={[styles.stepTitle, { color: colors.text }]}>What interests you?</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          Choose topics you'd like to read about
        </Text>
      </Animated.View>

      <Animated.View style={{ opacity: contentOpacity }}>
        <Text style={[styles.counterText, { color: colors.textSecondary }]}>
          {selectedInterests.size} selected
        </Text>
      </Animated.View>

      <Animated.View style={[styles.interestGrid, { opacity: contentOpacity }]}>
        {INTEREST_OPTIONS.map((opt) => {
          const selected = selectedInterests.has(opt.key);
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.7}
              onPress={() => toggleInterest(opt.key)}
              style={[
                styles.interestCard,
                {
                  backgroundColor: selected ? primaryBg01 : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  borderWidth: selected ? 2 : 1,
                  transform: [{ scale: selected ? 1.02 : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.interestIconCircle,
                  {
                    backgroundColor: selected ? colors.primary : grayBg02,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={28}
                  color={selected ? colors.onPrimary : colors.textSecondary}
                />
              </View>
              <Text style={[styles.interestName, { color: colors.text }]}>{opt.displayName}</Text>
              <Text style={[styles.interestLocal, { color: colors.textSecondary }]}>
                {opt.localizedName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </ScrollView>
  );

  // =======================================================================
  // Render current step
  // =======================================================================
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcome();
      case 1:
        return renderLevel();
      case 2:
        return renderGoal();
      case 3:
        return renderInterests();
      default:
        return null;
    }
  };

  // =======================================================================
  // Main layout
  // =======================================================================
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderProgressBar()}
      {renderStep()}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={isButtonDisabled}
          style={[
            styles.continueButton,
            {
              backgroundColor: isButtonDisabled ? colors.textTertiary : colors.primary,
            },
          ]}
        >
          <Text style={[styles.continueButtonText, { color: colors.onPrimary }]}>
            {isLastStep ? 'Complete' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ---- Progress bar ----
  progressBarRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },

  // ---- Scroll / step content ----
  scrollFlex: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // ---- Welcome step ----
  welcomeIconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
  },
  featureList: {
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 20,
  },

  // ---- Shared step header ----
  stepHeader: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    gap: 8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  stepSubtitle: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },

  // ---- Level cards ----
  levelCards: {
    gap: 12,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  levelNumberCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  levelTextWrap: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  levelDesc: {
    fontSize: 13,
    lineHeight: 18,
  },

  // ---- Goal ----
  goalBigNumberWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  goalBigNumber: {
    fontSize: 72,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  goalBigLabel: {
    fontSize: 15,
    marginTop: -4,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  goalCell: {
    width: '30%',
    flexGrow: 1,
    flexBasis: '30%',
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalCellNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  goalCellLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  recommendBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
  },
  recommendText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  // ---- Interests ----
  counterText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestCard: {
    width: '47%',
    flexGrow: 1,
    flexBasis: '47%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  interestIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  interestName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  interestLocal: {
    fontSize: 12,
    lineHeight: 16,
  },

  // ---- Footer / button ----
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    paddingTop: 8,
  },
  continueButton: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
