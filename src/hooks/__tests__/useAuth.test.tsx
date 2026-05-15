import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api/auth';

jest.mock('@/services/api/auth', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    socialLogin: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

const fakeUser = {
  id: 'u1',
  email: 'a@b.com',
  displayName: 'A',
  subscriptionTier: 'free' as const,
};

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    isGuestMode: false,
  });
  jest.clearAllMocks();
});

describe('useAuth', () => {
  it('login stores user and tokens on success', async () => {
    mockedAuthApi.login.mockResolvedValueOnce({
      data: { user: fakeUser, accessToken: 'A', refreshToken: 'R' },
    } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'a@b.com', password: 'p' } as any);
    });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(fakeUser);
    expect(state.accessToken).toBe('A');
    expect(state.refreshToken).toBe('R');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('login resets isLoading to false even on api error', async () => {
    mockedAuthApi.login.mockRejectedValueOnce(new Error('bad creds'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(
        result.current.login({ email: 'a@b.com', password: 'p' } as any)
      ).rejects.toThrow('bad creds');
    });

    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('logout clears auth store even if api call fails', async () => {
    useAuthStore.setState({
      user: fakeUser,
      accessToken: 'A',
      refreshToken: 'R',
      isAuthenticated: true,
      isLoading: false,
      isGuestMode: false,
    });
    mockedAuthApi.logout.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('refreshProfile swallows errors and logs them', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAuthApi.getProfile.mockRejectedValueOnce(new Error('500'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(errSpy).toHaveBeenCalledWith('Failed to refresh profile:', expect.any(Error));
    errSpy.mockRestore();
  });
});
