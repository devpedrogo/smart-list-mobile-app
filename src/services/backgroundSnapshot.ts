import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ShoppingItem } from '@/types/shopping';
import type { Residence, SnoozeUntil } from '@/types/settings';
export const cacheKeys = {
  pending: 'smartlist:bg:pending', residence:'smartlist:bg:residence',
  reminders: 'smartlist:bg:reminders', snooze: 'smartlist:bg:snooze',
  boundary:'smartlist:bg:boundary', onboarding:'smartlist:onboardingDone',
} as const;
export interface BoundaryState { inside: boolean | null; exitedAt: number | null; }
const safeParse = <T,>(value: string | null, fallback: T): T => {
  try { return value === null ? fallback : JSON.parse(value) as T; } catch { return fallback; }
};
export const backgroundSnapshot = {
  async savePending(items:ShoppingItem[]):Promise<void> {
    await AsyncStorage.setItem(cacheKeys.pending, JSON.stringify(items));
  },
  async saveResidence(residence:Residence|null):Promise<void> {
    await AsyncStorage.setItem(cacheKeys.residence, JSON.stringify(residence));
  },
  async saveReminders(enabled:boolean):Promise<void> {
    await AsyncStorage.setItem(cacheKeys.reminders, JSON.stringify(enabled));
  },
  async saveSnooze(value:SnoozeUntil):Promise<void> {
    await AsyncStorage.setItem(cacheKeys.snooze, JSON.stringify(value));
  },
  async saveBoundary(state:BoundaryState):Promise<void> {
    await AsyncStorage.setItem(cacheKeys.boundary,JSON.stringify(state));
  },
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
