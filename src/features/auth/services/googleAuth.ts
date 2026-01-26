import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { AuthSessionResult } from 'expo-auth-session';
import { useEffect } from 'react';
import Constants from 'expo-constants';

// Required for web browser redirect
WebBrowser.maybeCompleteAuthSession();

// Get client IDs from app config
const GOOGLE_CLIENT_ID_IOS = Constants.expoConfig?.extra?.googleClientIdIos || '';
const GOOGLE_CLIENT_ID_ANDROID = Constants.expoConfig?.extra?.googleClientIdAndroid || '';
const GOOGLE_CLIENT_ID_WEB = Constants.expoConfig?.extra?.googleClientIdWeb || '';

export interface GoogleAuthResult {
  idToken: string;
  accessToken?: string;
  user?: {
    email?: string;
    name?: string;
    picture?: string;
  };
}

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    androidClientId: GOOGLE_CLIENT_ID_ANDROID,
    webClientId: GOOGLE_CLIENT_ID_WEB,
  });

  return {
    request,
    response,
    promptAsync,
    isReady: !!request,
  };
}

export async function parseGoogleResponse(
  response: AuthSessionResult
): Promise<GoogleAuthResult | null> {
  if (response.type !== 'success') {
    return null;
  }

  const { authentication } = response;
  if (!authentication?.idToken) {
    throw new Error('No ID token received from Google');
  }

  // Decode the ID token to get user info
  const userInfo = await fetchGoogleUserInfo(authentication.accessToken!);

  return {
    idToken: authentication.idToken,
    accessToken: authentication.accessToken ?? undefined,
    user: userInfo,
  };
}

async function fetchGoogleUserInfo(accessToken: string): Promise<{
  email?: string;
  name?: string;
  picture?: string;
}> {
  try {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await response.json();
    return {
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
  } catch (error) {
    console.error('Failed to fetch Google user info:', error);
    return {};
  }
}
