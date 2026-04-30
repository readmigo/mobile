export type ShareCardThemeId =
  | 'light'
  | 'dark'
  | 'warm'
  | 'vintage'
  | 'nature'
  | 'elegant'
  | 'ocean'
  | 'sunset';

export type ShareCardSource = 'highlight' | 'quote' | 'agora' | 'custom';

export interface ShareCardContent {
  text: string;
  author?: string;
  bookTitle?: string;
  source: ShareCardSource;
}
