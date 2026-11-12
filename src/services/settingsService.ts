import { api } from '@/api/client';
import { mapSettings } from '@/api/adapters';
import type { AppSettings } from '@/types/settings';

/**
 * Faz a leitura e atualização das preferências no backend, adaptando os dados
 * entre o contrato da API e o modelo de configurações do aplicativo.
 */
export const settingsService = {
  /** Busca as preferências e normaliza a resposta para o modelo local. */
  async get(): Promise<AppSettings> {
    const {data} = await api.get<unknown>('/settings');
    return mapSettings(data);
  },
  /** Traduz os nomes locais para o contrato da API e normaliza a resposta atualizada. */
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
  /** Recupera informações de diagnóstico fornecidas pelo backend. */
  async diagnostics(): Promise<unknown> {
    const {data} = await api.get<unknown>('/settings/diagnostic');
    return data;
  },
  /** Verifica se a API responde; retorna false quando a requisição falha. */
  async health(): Promise<boolean> {
    try { await api.get('/health'); return true; } catch { return false; }
  },
};
