import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ShoppingItem } from '@/types/shopping';
import type { Residence, SnoozeUntil } from '@/types/settings';
export const cacheKeys = {
  pending: 'smartlist:bg:pending', residence:'smartlist:bg:residence',
  reminders: 'smartlist:bg:reminders', snooze: 'smartlist:bg:snooze',
  boundary:'smartlist:bg:boundary', onboarding:'smartlist:onboardingDone',
} as const;
export interface BoundaryState { inside: boolean | null; exitedAt: number | null; }

// Dados locais permitem que a tarefa de localização funcione sem consultar a API.
const safeParse = <T,>(value: string | null, fallback: T): T => {
  try { return value === null ? fallback : JSON.parse(value) as T; } catch { return fallback; }
};

/**
 * Persiste em armazenamento local o estado mínimo necessário para notificações
 * e geofence em segundo plano; read() reúne os valores com padrões seguros.
 */
export const backgroundSnapshot = {
  /** Salva a cópia dos itens pendentes consumida pela tarefa em segundo plano. */
  async savePending(items:ShoppingItem[]):Promise<void> {
    await AsyncStorage.setItem(cacheKeys.pending, JSON.stringify(items));
  },
  /** Salva ou limpa a residência usada para calcular o perímetro localmente. */
  async saveResidence(residence:Residence|null):Promise<void> {
    await AsyncStorage.setItem(cacheKeys.residence, JSON.stringify(residence));
  },
  /** Persiste se os lembretes devem ser emitidos pela tarefa em segundo plano. */
  async saveReminders(enabled:boolean):Promise<void> {
    await AsyncStorage.setItem(cacheKeys.reminders, JSON.stringify(enabled));
  },
  /** Armazena até quando os lembretes permanecem pausados. */
  async saveSnooze(value:SnoozeUntil):Promise<void> {
    await AsyncStorage.setItem(cacheKeys.snooze, JSON.stringify(value));
  },
  /** Registra a última posição conhecida em relação ao perímetro. */
  async saveBoundary(state:BoundaryState):Promise<void> {
    await AsyncStorage.setItem(cacheKeys.boundary,JSON.stringify(state));
  },
  /** Lê as chaves em lote e usa valores padrão se estiverem ausentes ou inválidas. */
  async read():Promise<{pending:ShoppingItem[]; residence:Residence|null; remindersEnabled:boolean; snoozeUntil:SnoozeUntil; boundary:BoundaryState}> {
    const [items, residence, enabled, snooze, boundary] = await AsyncStorage.multiGet([
      cacheKeys.pending,cacheKeys.residence,cacheKeys.reminders,cacheKeys.snooze,cacheKeys.boundary,
    ]);
    return {
      pending:safeParse<ShoppingItem[]>((items?.[1] ?? null),[]),
      residence:safeParse<Residence|null>((residence?.[1] ?? null),null),
      remindersEnabled:safeParse<boolean>((enabled?.[1] ?? null),true),
      snoozeUntil:safeParse<SnoozeUntil>((snooze?.[1] ?? null),null),
      boundary:safeParse<BoundaryState>((boundary?.[1] ?? null),{inside:null,exitedAt:null}),
    };
  },
};
