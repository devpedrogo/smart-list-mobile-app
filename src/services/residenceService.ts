import { api, ApiError } from '@/api/client';
import { mapResidence } from '@/api/adapters';
import type { Residence, ResidencePayload } from '@/types/settings';

/**
 * Gerencia a residência no backend. Converte as respostas para o modelo local
 * e trata a ausência de cadastro como um estado válido durante o onboarding.
 */
export const residenceService = {
  /** Busca a residência; 404 significa que ainda não existe cadastro. */
  async get(): Promise<Residence | null> {
    try {
      const { data } = await api.get<unknown>('/residence');
      const residence = mapResidence(data);
      if (!residence) throw new Error('A API retornou uma residência inválida.');
      return residence;
    } catch (err) {
      // Sem residência cadastrada é esperado no onboarding.
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
  /** Valida o endereço, envia os dados normalizados e valida a residência retornada. */
  async save(payload: ResidencePayload): Promise<Residence> {
    if (!payload.address.trim()) throw new Error('Informe um endereço antes de salvar a residência.');
    const { data } = await api.post<unknown>('/residence', {
      address: payload.address.trim(),
      latitude: payload.latitude,
      longitude: payload.longitude,
      geofenceActive: payload.geofenceActive,
    });
    const residence = mapResidence(data);
    if (!residence) throw new Error('A API retornou uma residência inválida após o salvamento.');
    return residence;
  },
  /** Envia a posição atual para o backend avaliar o perímetro da residência. */
  async checkGeofence(latitude: number, longitude: number): Promise<unknown> {
    const { data } = await api.post<unknown>('/residence/check-geofence', {
      currentLatitude: latitude,
      currentLongitude: longitude,
    });
    return data;
  },
};
