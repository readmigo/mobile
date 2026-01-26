import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

interface BookReferenceProps {
  bookId: string | null;
  bookTitle: string | null;
}

function BookReferenceComponent({ bookId, bookTitle }: BookReferenceProps) {
  const router = useRouter();
  const { colors } = useTheme();

  // Don't render if no book title
  if (!bookTitle) {
    return null;
  }

  const isClickable = bookId !== null;

  const handlePress = () => {
    if (isClickable && bookId) {
      router.push(`/book/${bookId}`);
    }
  };

  const containerStyle = [
    styles.container,
    {
      backgroundColor: isClickable ? colors.primaryLight + '15' : colors.backgroundSecondary,
      borderColor: isClickable ? colors.primary : colors.border,
    },
  ];

  const textStyle = [
    styles.title,
    {
      color: isClickable ? colors.primary : colors.textSecondary,
      textDecorationLine: (isClickable ? 'underline' : 'none') as 'underline' | 'none',
    },
  ];

  const content = (
    <View style={containerStyle}>
      <Ionicons
        name="book-outline"
        size={16}
        color={isClickable ? colors.primary : colors.textSecondary}
        style={styles.icon}
      />
      <Text style={textStyle} numberOfLines={1}>
        {bookTitle}
      </Text>
      {isClickable && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.primary}
          style={styles.arrow}
        />
      )}
    </View>
  );

  if (isClickable) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.pressable,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  arrow: {
    marginLeft: 4,
  },
});

export const BookReference = memo(BookReferenceComponent);
