import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
const KEY = 'smart_list_device_uuid_v1';
let cached: Promise<string> | undefined;
async function resolveDeviceId(): Promise<string> {
  const stored = await SecureStore.getItemAsync(KEY);
  if (stored) return stored;
  const uuid = Crypto.randomUUID();
  await SecureStore.setItemAsync(KEY, uuid);
  return uuid;
}
/** Coalescing: chamadas concorrentes nunca criam IDs diferentes. */
export async function getDeviceId(): Promise<string> {
  if (!cached) cached = resolveDeviceId().catch(err => { cached = undefined; throw err; });
  return cached;
}
