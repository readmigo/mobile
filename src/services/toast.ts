import Toast from 'react-native-toast-message';
import { AppError } from '@/services/api/errors';

export function notifySuccess(text: string, sub?: string) {
  Toast.show({ type: 'success', text1: text, text2: sub, position: 'top' });
}

export function notifyError(error: AppError | string) {
  const text = typeof error === 'string' ? error : error.userMessage;
  Toast.show({ type: 'error', text1: text, position: 'top', visibilityTime: 4000 });
}

export function notifyInfo(text: string) {
  Toast.show({ type: 'info', text1: text, position: 'top' });
}

// Re-export the Toast component so consumers don't need a direct dep on the lib
export { default as ToastRoot } from 'react-native-toast-message';
