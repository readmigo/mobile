import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Share,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { postcardsApi, PostcardTemplate, Postcard } from '@/services/api/postcards';

export function PostcardsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'create' | 'gallery'>('create');
  const [selectedTemplate, setSelectedTemplate] = useState<PostcardTemplate | null>(null);
  const [customText, setCustomText] = useState('');

  const itemWidth = (width - 48) / 2;

  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['postcards', 'templates'],
    queryFn: async () => (await postcardsApi.getTemplates()).data,
  });

  const { data: gallery, isLoading: loadingGallery } = useQuery({
    queryKey: ['postcards', 'my'],
    queryFn: async () => (await postcardsApi.getMyPostcards()).data,
    enabled: tab === 'gallery',
  });

  const { mutate: generate, isPending: generating } = useMutation({
    mutationFn: () => postcardsApi.generate({ templateId: selectedTemplate!.id, text: customText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postcards', 'my'] });
      setSelectedTemplate(null);
      setCustomText('');
      setTab('gallery');
      Alert.alert(t('postcards.created', { defaultValue: 'Postcard Created!' }));
    },
  });

  const handleShare = async (postcard: Postcard) => {
    await Share.share({ url: postcard.imageUrl, message: postcard.text });
  };

  const renderTemplate = useCallback(
    ({ item }: { item: PostcardTemplate }) => (
      <TouchableOpacity
        style={[
          styles.templateItem,
          { width: itemWidth },
          selectedTemplate?.id === item.id && { borderColor: colors.primary, borderWidth: 2 },
        ]}
        onPress={() => setSelectedTemplate(item)}
      >
        <Image
          source={{ uri: item.previewUrl }}
          style={[styles.templateImage, { width: itemWidth, height: itemWidth * 1.4 }]}
          resizeMode="cover"
        />
        <Text style={[styles.templateName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [itemWidth, colors, selectedTemplate],
  );

  const renderGalleryItem = useCallback(
    ({ item }: { item: Postcard }) => (
      <TouchableOpacity
        style={[styles.galleryItem, { width: itemWidth }]}
        onPress={() => handleShare(item)}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.galleryImage, { width: itemWidth, height: itemWidth * 1.4 }]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    ),
    [itemWidth],
  );

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'create', label: t('postcards.create', { defaultValue: 'Create' }) },
    { id: 'gallery', label: t('postcards.gallery', { defaultValue: 'My Gallery' }) },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surface }]}>
        {tabs.map((tb) => (
          <TouchableOpacity
            key={tb.id}
            style={[styles.tab, tab === tb.id && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(tb.id)}
          >
            <Text style={[styles.tabText, { color: tab === tb.id ? colors.primary : colors.textSecondary }]}>
              {tb.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'create' ? (
        <View style={styles.createContainer}>
          {/* Templates */}
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            {t('postcards.chooseTemplate', { defaultValue: 'Choose a Template' })}
          </Text>
          {loadingTemplates ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <FlatList
              data={templates}
              renderItem={renderTemplate}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.templateRow}
              contentContainerStyle={styles.templateList}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                selectedTemplate ? (
                  <View style={styles.editor}>
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>
                      {t('postcards.addText', { defaultValue: 'Add Your Message' })}
                    </Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                      value={customText}
                      onChangeText={setCustomText}
                      placeholder={t('postcards.textPlaceholder', { defaultValue: 'Write something special...' })}
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      maxLength={200}
                    />
                    <TouchableOpacity
                      style={[styles.generateBtn, { backgroundColor: colors.primary }]}
                      onPress={() => generate()}
                      disabled={generating}
                    >
                      {generating ? (
                        <ActivityIndicator color={colors.onPrimary} />
                      ) : (
                        <Text style={[styles.generateText, { color: colors.onPrimary }]}>
                          {t('postcards.generate', { defaultValue: 'Create Postcard' })}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      ) : (
        <FlatList
          data={gallery ?? []}
          renderItem={renderGalleryItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.templateRow}
          contentContainerStyle={styles.templateList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loadingGallery ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.empty}>
                <Ionicons name="images-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('postcards.noPostcards', { defaultValue: 'No postcards yet' })}
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 14, fontWeight: '600' },
  createContainer: { flex: 1, paddingTop: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '600', paddingHorizontal: 16, marginBottom: 12 },
  templateList: { paddingHorizontal: 16, paddingBottom: 32 },
  templateRow: { gap: 12, marginBottom: 12 },
  templateItem: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'transparent' },
  templateImage: { borderRadius: 12 },
  templateName: { fontSize: 13, fontWeight: '500', paddingVertical: 6, textAlign: 'center' },
  galleryItem: { borderRadius: 12, overflow: 'hidden' },
  galleryImage: { borderRadius: 12 },
  editor: { paddingTop: 16 },
  textInput: { height: 80, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, marginHorizontal: 16, marginBottom: 16, textAlignVertical: 'top' },
  generateBtn: { marginHorizontal: 16, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  generateText: { fontSize: 16, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, marginTop: 12 },
});
