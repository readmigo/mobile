import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, ViewStyle } from 'react-native';
import { FlashList, FlashListProps, ListRenderItem } from '@shopify/flash-list';
import { useTheme } from '@/hooks/useTheme';

interface OptimizedListProps<T> extends Omit<FlashListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  emptyComponent?: React.ReactElement;
  headerComponent?: React.ReactElement;
  footerComponent?: React.ReactElement;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
}

export function OptimizedList<T>({
  data,
  renderItem,
  onRefresh,
  isRefreshing = false,
  emptyComponent,
  headerComponent,
  footerComponent,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  keyExtractor,
  ...rest
}: OptimizedListProps<T>) {
  const { colors } = useTheme();

  const refreshControl = useMemo(() => {
    if (!onRefresh) return undefined;

    return (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        tintColor={colors.primary}
        colors={[colors.primary]}
      />
    );
  }, [onRefresh, isRefreshing, colors.primary]);

  const ListEmptyComponent = useCallback(() => {
    return emptyComponent || null;
  }, [emptyComponent]);

  const ListHeaderComponent = useCallback(() => {
    return headerComponent || null;
  }, [headerComponent]);

  const ListFooterComponent = useCallback(() => {
    return footerComponent || null;
  }, [footerComponent]);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      refreshControl={refreshControl}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyExtractor={keyExtractor}
      {...rest}
    />
  );
}

// Horizontal list variant
interface OptimizedHorizontalListProps<T> extends Omit<FlashListProps<T>, 'renderItem' | 'horizontal'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  contentContainerStyle?: ViewStyle;
}

export function OptimizedHorizontalList<T>({
  data,
  renderItem,
  contentContainerStyle,
  ...rest
}: OptimizedHorizontalListProps<T>) {
  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
