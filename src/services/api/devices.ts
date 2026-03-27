import { apiClient, ApiResponse } from './client';

export interface UserDevice {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'web';
  model?: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export const devicesApi = {
  getDevices: async (): Promise<ApiResponse<UserDevice[]>> => {
    const response = await apiClient.get('/user/devices');
    return response.data;
  },

  removeDevice: async (deviceId: string): Promise<void> => {
    await apiClient.delete(`/user/devices/${deviceId}`);
  },

  renameDevice: async (deviceId: string, name: string): Promise<void> => {
    await apiClient.patch(`/user/devices/${deviceId}`, { name });
  },
};
