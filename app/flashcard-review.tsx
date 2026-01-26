import { router } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { FlashcardReview } from '@/features/vocabulary';

export default function FlashcardReviewScreen() {
  const { colors } = useTheme();

  const handleComplete = () => {
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlashcardReview onComplete={handleComplete} onClose={handleClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
