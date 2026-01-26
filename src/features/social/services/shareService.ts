import { Share, Platform } from 'react-native';
import * as Linking from 'expo-linking';

export interface ShareContent {
  title: string;
  message: string;
  url?: string;
}

export interface BookShareContent {
  bookId: string;
  bookTitle: string;
  author: string;
  progress?: number;
  quote?: string;
}

export interface ProgressShareContent {
  wordsLearned: number;
  streak: number;
  booksRead: number;
}

const APP_URL = 'https://readmigo.app';

export async function shareGeneric(content: ShareContent): Promise<boolean> {
  try {
    const result = await Share.share({
      title: content.title,
      message: content.url ? `${content.message}\n\n${content.url}` : content.message,
      url: Platform.OS === 'ios' ? content.url : undefined,
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Share failed:', error);
    return false;
  }
}

export async function shareBook(content: BookShareContent): Promise<boolean> {
  const bookUrl = `${APP_URL}/book/${content.bookId}`;
  const message = content.quote
    ? `"${content.quote}"\n\n— ${content.bookTitle} by ${content.author}`
    : `I'm reading "${content.bookTitle}" by ${content.author} on Readmigo!`;

  return shareGeneric({
    title: content.bookTitle,
    message,
    url: bookUrl,
  });
}

export async function shareProgress(content: ProgressShareContent): Promise<boolean> {
  const message = `📚 My Readmigo Progress:\n\n` +
    `🔤 ${content.wordsLearned} words learned\n` +
    `🔥 ${content.streak} day streak\n` +
    `📖 ${content.booksRead} books read\n\n` +
    `Start your reading journey!`;

  return shareGeneric({
    title: 'My Reading Progress',
    message,
    url: APP_URL,
  });
}

export async function shareQuote(quote: string, bookTitle: string, author: string): Promise<boolean> {
  const message = `"${quote}"\n\n— ${bookTitle} by ${author}\n\nShared via Readmigo`;

  return shareGeneric({
    title: 'Quote from ' + bookTitle,
    message,
    url: APP_URL,
  });
}

export async function shareInvite(referralCode?: string): Promise<boolean> {
  const url = referralCode ? `${APP_URL}/invite/${referralCode}` : APP_URL;
  const message = `Join me on Readmigo - the AI-powered reading app!\n\n` +
    `Read any book with AI assistance, learn vocabulary with flashcards, and track your progress.`;

  return shareGeneric({
    title: 'Join Readmigo',
    message,
    url,
  });
}

export function generateDeepLink(path: string, params?: Record<string, string>): string {
  const url = Linking.createURL(path, { queryParams: params });
  return url;
}
