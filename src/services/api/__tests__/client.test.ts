import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { apiClient, BASE_URL } from '../client';
import { useAuthStore } from '@/stores/authStore';

const refreshMock = new MockAdapter(axios);
const apiMock = new MockAdapter(apiClient);

beforeEach(() => {
  refreshMock.reset();
  apiMock.reset();
  useAuthStore.setState({
    user: null,
    accessToken: 'OLD_ACCESS',
    refreshToken: 'OLD_REFRESH',
    isAuthenticated: true,
    isLoading: false,
    isGuestMode: false,
  });
});

afterAll(() => {
  refreshMock.restore();
  apiMock.restore();
});

describe('apiClient response interceptor', () => {
  it('refreshes tokens on 401 and retries original request', async () => {
    apiMock.onGet('/me').replyOnce(401).onGet('/me').replyOnce(200, { ok: true });
    refreshMock.onPost(`${BASE_URL}/api/v1/auth/refresh`).replyOnce(200, {
      accessToken: 'NEW_ACCESS',
      refreshToken: 'NEW_REFRESH',
    });

    const res = await apiClient.get('/me');

    expect(res.data).toEqual({ ok: true });
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('NEW_ACCESS');
    expect(state.refreshToken).toBe('NEW_REFRESH');
    expect(state.isAuthenticated).toBe(true);
  });

  it('logs out when refresh endpoint fails', async () => {
    apiMock.onGet('/me').replyOnce(401);
    refreshMock.onPost(`${BASE_URL}/api/v1/auth/refresh`).replyOnce(500);

    await expect(apiClient.get('/me')).rejects.toBeDefined();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('logs out immediately when no refresh token is present', async () => {
    useAuthStore.setState({
      accessToken: 'OLD_ACCESS',
      refreshToken: null,
      isAuthenticated: true,
    });
    apiMock.onGet('/me').replyOnce(401);

    await expect(apiClient.get('/me')).rejects.toBeDefined();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('does not loop on second 401 (uses _retry flag)', async () => {
    apiMock.onGet('/me').reply(401);
    refreshMock.onPost(`${BASE_URL}/api/v1/auth/refresh`).replyOnce(200, {
      accessToken: 'NEW_ACCESS',
      refreshToken: 'NEW_REFRESH',
    });

    await expect(apiClient.get('/me')).rejects.toBeDefined();

    expect(refreshMock.history.post.length).toBe(1);
  });
});
