import { ShareCardThemeId } from './types';

export interface ShareCardThemeColors {
  id: ShareCardThemeId;
  isPremium: boolean;
  background: string;
  text: string;
  secondary: string;
  accent: string;
  previewBorder: string;
}

export const SHARE_CARD_THEMES: Record<ShareCardThemeId, ShareCardThemeColors> = {
  light: {
    id: 'light',
    isPremium: false,
    background: '#FFFFFF',
    text: '#333333',
    secondary: '#737373',
    accent: '#B3B3B3',
    previewBorder: '#D9D9D9',
  },
  dark: {
    id: 'dark',
    isPremium: false,
    background: '#1F1F24',
    text: '#FFFFFF',
    secondary: '#999999',
    accent: '#666666',
    previewBorder: '#4D4D4D',
  },
  warm: {
    id: 'warm',
    isPremium: false,
    background: '#FAF5E8',
    text: '#594533',
    secondary: '#8C7861',
    accent: '#BFA88C',
    previewBorder: '#E0D4BA',
  },
  vintage: {
    id: 'vintage',
    isPremium: false,
    background: '#F5E6D3',
    text: '#5D4037',
    secondary: '#795548',
    accent: '#A1887F',
    previewBorder: '#D7CCC8',
  },
  nature: {
    id: 'nature',
    isPremium: false,
    background: '#E8F5E9',
    text: '#2E7D32',
    secondary: '#558B2F',
    accent: '#81C784',
    previewBorder: '#C8E6C9',
  },
  elegant: {
    id: 'elegant',
    isPremium: true,
    background: '#FFF8E1',
    text: '#6D4C41',
    secondary: '#8D6E63',
    accent: '#BCAAA4',
    previewBorder: '#FFE0B2',
  },
  ocean: {
    id: 'ocean',
    isPremium: true,
    background: '#E3F2FD',
    text: '#1565C0',
    secondary: '#1976D2',
    accent: '#64B5F6',
    previewBorder: '#BBDEFB',
  },
  sunset: {
    id: 'sunset',
    isPremium: true,
    background: '#FFF3E0',
    text: '#E65100',
    secondary: '#F57C00',
    accent: '#FFB74D',
    previewBorder: '#FFE0B2',
  },
};

export const SHARE_CARD_THEME_ORDER: ShareCardThemeId[] = [
  'light',
  'dark',
  'warm',
  'vintage',
  'nature',
  'elegant',
  'ocean',
  'sunset',
];
