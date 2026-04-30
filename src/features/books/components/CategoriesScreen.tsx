import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useCategories } from '@/features/books/hooks/useBooks';
import { getCategoryIcon } from '../categoryIcons';

interface CategoryRowProps {
  category: string;
  showDivider: boolean;
}

function CategoryRow({ category, showDivider }: CategoryRowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const iconName = getCategoryIcon(category);

  const displayName = t(`discover.${category}`, {
    defaultValue: category.charAt(0).toUpperCase() + category.slice(1),
  });

  return (
    <TouchableOpacity
      style={[
        styles.row,
        showDivider && {
          borderBottomColor: colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
      onPress={() => router.push(`/category/${category}` as any)}
      activeOpacity={0.6}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={iconName} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.label, { color: colors.text }]}>{displayName}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

export function CategoriesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data: categories, isLoading, refetch, isRefetching } = useCategories();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: t('bookLists.categories', { defaultValue: 'Categories' }),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !categories || categories.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="library-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('bookLists.noCategories', { defaultValue: 'No categories available' })}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          <View style={[styles.list, { backgroundColor: colors.surface }]}>
            {categories.map((category, idx) => (
              <CategoryRow
                key={category}
                category={category}
                showDivider={idx < categories.length - 1}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    paddingVertical: 16,
  },
  list: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});
