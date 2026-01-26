import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi, LoginRequest, RegisterRequest, SocialLoginRequest } from '@/services/api/auth';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isGuestMode,
    setUser,
    setTokens,
    logout: storeLogout,
    enterGuestMode,
    exitGuestMode,
    setLoading,
  } = useAuthStore();

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      setUser(response.data.user);
      setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } finally {
      setLoading(false);
    }
  }, [setUser, setTokens, setLoading]);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await authApi.register(data);
      setUser(response.data.user);
      setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } finally {
      setLoading(false);
    }
  }, [setUser, setTokens, setLoading]);

  const socialLogin = useCallback(async (data: SocialLoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.socialLogin(data);
      setUser(response.data.user);
      setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } finally {
      setLoading(false);
    }
  }, [setUser, setTokens, setLoading]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      storeLogout();
    }
  }, [storeLogout]);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [setUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isGuestMode,
    login,
    register,
    socialLogin,
    logout,
    enterGuestMode,
    exitGuestMode,
    refreshProfile,
  };
}
