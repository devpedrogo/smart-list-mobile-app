import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
const KEY = 'smart_list_device_uuid_v1';
let cached: Promise<string> | undefined;
/** Recupera o identificador salvo ou cria e armazena um novo UUID para o aparelho. */
async function resolveDeviceId(): Promise<string> {
  const stored = await SecureStore.getItemAsync(KEY);
  if (stored) return stored;
  const uuid = Crypto.randomUUID();
  await SecureStore.setItemAsync(KEY, uuid);
  return uuid;
}
/** Devolve o identificador persistente e compartilha a busca entre chamadas simultâneas. */
export async function getDeviceId(): Promise<string> {
  if (!cached) cached = resolveDeviceId().catch(err => { cached = undefined; throw err; });
  return cached;
}
