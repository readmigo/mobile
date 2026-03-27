import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useOfflineManager } from '../hooks/useOfflineBook';
import { OfflineBook } from '../stores/offlineStore';

export function OfflineManager() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { offlineBooks, formattedSize, clearAll } = useOfflineManager();

  const handleClearAll = () => {
    Alert.alert(
      t('offline.clearAll', { defaultValue: 'Clear All Downloads' }),
      t('offline.clearAllConfirm', { defaultValue: 'This will remove all downloaded books.' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete', { defaultValue: 'Delete' }), style: 'destructive', onPress: clearAll },
      ],
    );
  };

  const renderItem = ({ item }: { item: OfflineBook }) => (
    <View style={[styles.item, { backgroundColor: colors.surface }]}>
      <View style={styles.itemIcon}>
        <Ionicons name="book" size={20} color={colors.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.itemMeta, { color: colors.textTertiary }]}>
          {(item.fileSize / (1024 * 1024)).toFixed(1)} MB
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header stats */}
      <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('offline.cacheSize', { defaultValue: 'Cache Size' })}
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{formattedSize}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('offline.booksCount', { defaultValue: 'Downloaded Books' })}
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{offlineBooks.length}</Text>
        </View>
      </View>

      {offlineBooks.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.clearText, { color: colors.error }]}>
            {t('offline.clearAll', { defaultValue: 'Clear All Downloads' })}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={offlineBooks}
        renderItem={renderItem}
        keyExtractor={(item) => item.bookId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('offline.noDownloads', { defaultValue: 'No downloaded books' })}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  statsCard: { borderRadius: 12, padding: 16, marginBottom: 16, gap: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 14, fontWeight: '600' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, paddingVertical: 8 },
  clearText: { fontSize: 14, fontWeight: '500' },
  list: { gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 12 },
  itemIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '500' },
  itemMeta: { fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, marginTop: 12 },
});
