import { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

export const CATEGORY_ICON_MAP: Record<string, IoniconName> = {
  fiction: 'book',
  'non-fiction': 'document-text',
  classics: 'library',
  science: 'flask',
  biography: 'person',
  philosophy: 'bulb',
  poetry: 'musical-notes',
  history: 'time',
  adventure: 'compass',
  romance: 'heart',
  'self-help': 'sunny',
  business: 'briefcase',
  technology: 'hardware-chip',
};

export function getCategoryIcon(name: string): IoniconName {
  return CATEGORY_ICON_MAP[name.toLowerCase()] || 'bookmark-outline';
}
