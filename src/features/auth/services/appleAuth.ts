import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

export interface AppleAuthResult {
  idToken: string;
  nonce: string;
  user?: {
    email?: string;
    fullName?: {
      givenName?: string;
      familyName?: string;
    };
  };
}

export async function isAppleAuthAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  return await AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple(): Promise<AppleAuthResult> {
  // Generate a random nonce for security
  const nonce = await generateNonce();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    nonce
  );

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      throw new Error('No identity token received from Apple');
    }

    return {
      idToken: credential.identityToken,
      nonce,
      user: {
        email: credential.email ?? undefined,
        fullName: credential.fullName
          ? {
              givenName: credential.fullName.givenName ?? undefined,
              familyName: credential.fullName.familyName ?? undefined,
            }
          : undefined,
      },
    };
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Apple Sign In was cancelled');
    }
    throw error;
  }
}

async function generateNonce(length = 32): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < randomBytes.length; i++) {
    nonce += chars[randomBytes[i] % chars.length];
  }
  return nonce;
}
