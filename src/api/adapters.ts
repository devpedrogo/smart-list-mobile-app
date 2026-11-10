import type { ShoppingItem, ShoppingItemGroups } from '@/types/shopping';
import type { AppSettings, LocationPermission, NotificationPermission, Residence } from '@/types/settings';
/** Converte os DTOs confirmados do backend para os modelos usados pelas telas. */
type Dict = Record<string, unknown>;
function isObject(v: unknown): v is Dict { return typeof v === 'object' && v !== null && !Array.isArray(v); }
const categoryLabels: Record<string, string> = {
  MERCEARIA: 'Mercearia',
  LATICINIOS: 'Laticínios',
  OLEOS_CONDIMENTOS: 'Óleos e condimentos',
  PADARIA: 'Padaria',
  HORTIFRUTI: 'Hortifrúti',
  LIMPEZA: 'Limpeza',
  HIGIENE_PESSOAL: 'Higiene pessoal',
  FARMACIA: 'Farmácia',
  MERCADO: 'Mercado',
  PAPELARIA: 'Papelaria',
  OUTROS: 'Outros',
};
export function categoryFromApi(category: unknown): string {
  if (typeof category !== 'string') throw new Error('A API retornou uma categoria inválida.');
  const label = categoryLabels[category];
  if (!label) throw new Error(`A API retornou uma categoria desconhecida: "${category}".`);
  return label;
}
export function categoryToApi(category: string): string {
  const entry = Object.entries(categoryLabels).find(([, label]) => label === category);
  if (!entry) throw new Error(`A categoria "${category}" não é aceita pela API.`);
  return entry[0];
}
export function mapShoppingItem(v: unknown): ShoppingItem | null {
  if (!isObject(v)) return null;
  const id = v.id;
  const name = v.name;
  if ((typeof id !== 'string' && typeof id !== 'number') || typeof name !== 'string') return null;
  const quantity = v.quantity;
  const category = v.category;
  const completed = v.completed;
  if ((typeof quantity !== 'string' && quantity !== null) || typeof category !== 'string' || typeof completed !== 'boolean') return null;
  return {
    id: String(id), name,
    quantity: quantity ?? '',
    category: categoryFromApi(category),
    completed,
    completedAt: null,
  };
}
export function mapShoppingGroups(response: unknown): ShoppingItemGroups {
  if (!isObject(response) || !Array.isArray(response.pendingItems) || !Array.isArray(response.completedItems)) {
    throw new Error('A API retornou uma lista de compras em formato inválido.');
  }
  const mapItems = (items: unknown[], group: string) => items.map((item, index) => {
    const mapped = mapShoppingItem(item);
    if (!mapped) throw new Error(`O item ${index + 1} da lista ${group} retornada pela API é inválido.`);
    return mapped;
  });
  const pend = mapItems(response.pendingItems, 'pendentes').map(item => ({ ...item, completed: false }));
  const comp = mapItems(response.completedItems, 'concluídos').map(item => ({ ...item, completed: true }));
  return {
    pending: pend,
    completed: comp,
  };
}
export function mapSettings(v: unknown): AppSettings {
  if (!isObject(v)) throw new Error('A API retornou configurações em formato inválido.');
  const data = v;
  const remindOnLeave = data.remindOnLeave;
  const vibrateOnNotify = data.vibrateOnNotify;
  const notificationPermission = data.notificationPermission;
  const locationPermission = data.locationPermission;
  if (typeof remindOnLeave !== 'boolean' || typeof vibrateOnNotify !== 'boolean') {
    throw new Error('A API retornou configurações incompletas.');
  }
  if (notificationPermission !== 'PERMITIDO' && notificationPermission !== 'NEGADO') {
    throw new Error('A API retornou um estado de permissão de notificações inválido.');
  }
  if (locationPermission !== 'SEMPRE_PERMITIDA' && locationPermission !== 'APENAS_DURANTE_USO' && locationPermission !== 'NEGADO') {
    throw new Error('A API retornou um estado de permissão de localização inválido.');
  }
  const mappedNotificationPermission: NotificationPermission = notificationPermission;
  const mappedLocationPermission: LocationPermission = locationPermission;
  return {
    remindersEnabled: remindOnLeave,
    vibrationEnabled: vibrateOnNotify,
    notificationPermission: mappedNotificationPermission,
    locationPermission: mappedLocationPermission,
  };
}
export function mapResidence(v: unknown): Residence | null {
  if (v == null) return null;
  const obj = isObject(v) ? v : {};
  const data = isObject(obj.data) ? obj.data : obj;
  const latitude = data.latitude;
  const longitude = data.longitude;
  const radiusMeters = data.radiusMeters;
  const address = data.address;
  const geofenceActive = data.geofenceActive;
  if (
    typeof latitude !== 'number' || latitude < -90 || latitude > 90 ||
    typeof longitude !== 'number' || longitude < -180 || longitude > 180 ||
    typeof radiusMeters !== 'number' || radiusMeters <= 0 ||
    typeof address !== 'string' ||
    typeof geofenceActive !== 'boolean'
  ) return null;
  return { latitude, longitude, radiusMeters, address, geofenceActive };
}
