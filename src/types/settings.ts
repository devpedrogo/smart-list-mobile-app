export type NotificationPermission = 'PERMITIDO' | 'NEGADO';
export type LocationPermission = 'SEMPRE_PERMITIDA' | 'APENAS_DURANTE_USO' | 'NEGADO';
export interface AppSettings {
  remindersEnabled: boolean;
  vibrationEnabled: boolean;
  notificationPermission: NotificationPermission;
  locationPermission: LocationPermission;
}
export interface SystemDiagnostics {
  notificationsAllowed: boolean;
  foregroundLocationAllowed: boolean;
  backgroundLocationAllowed: boolean;
  apiOnline: boolean | null;
}
export interface Residence {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address?: string;
  geofenceActive: boolean;
}
export interface ResidencePayload {
  latitude: number;
  longitude: number;
  address: string;
  geofenceActive: boolean;
}
export type SnoozeChoice = '30' | '60' | 'tomorrow' | 'manual';
export type SnoozeUntil = number | 'manual' | null;
export type SnoozeOption = 'MINUTES_30' | 'HOUR_1' | 'TOMORROW_MORNING' | 'INDEFINITE';
export interface SnoozePayload {
  option: SnoozeOption;
}
