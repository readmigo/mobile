import { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

export type FeedbackCategory =
  | 'BUG'
  | 'FEATURE_REQUEST'
  | 'UI_UX'
  | 'CONTENT'
  | 'PERFORMANCE'
  | 'OTHER';

export interface FeedbackCategoryMeta {
  id: FeedbackCategory;
  icon: IoniconName;
  color: string;
  labelKey: string;
}

export const FEEDBACK_CATEGORIES: FeedbackCategoryMeta[] = [
  { id: 'BUG', icon: 'bug', color: '#E53935', labelKey: 'messaging.category.bug' },
  { id: 'FEATURE_REQUEST', icon: 'bulb', color: '#FDD835', labelKey: 'messaging.category.featureRequest' },
  { id: 'UI_UX', icon: 'color-palette', color: '#9C27B0', labelKey: 'messaging.category.uiUx' },
  { id: 'CONTENT', icon: 'book', color: '#1E88E5', labelKey: 'messaging.category.content' },
  { id: 'PERFORMANCE', icon: 'speedometer', color: '#FB8C00', labelKey: 'messaging.category.performance' },
  { id: 'OTHER', icon: 'ellipsis-horizontal-circle', color: '#757575', labelKey: 'messaging.category.other' },
];
