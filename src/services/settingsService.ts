import { api } from '@/api/client';
import { mapSettings } from '@/api/adapters';
import type { AppSettings } from '@/types/settings';
export const settingsService = {
  async get(): Promise<AppSettings> {
    const {data} = await api.get<unknown>('/settings');
    return mapSettings(data);
  },
  async update(settings: AppSettings): Promise<AppSettings> {
    const request = {
      remindOnLeave: settings.remindersEnabled,
      vibrateOnNotify: settings.vibrationEnabled,
      notificationPermission: settings.notificationPermission,
      locationPermission: settings.locationPermission,
    };
    const {data} = await api.put<unknown>('/settings', request);
    return mapSettings(data);
  },
  async diagnostics(): Promise<unknown> {
    const {data} = await api.get<unknown>('/settings/diagnostic');
    return data;
  },
  async health(): Promise<boolean> {
    try { await api.get('/health'); return true; } catch { return false; }
  },
};
