import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { backgroundSnapshot } from '@/services/backgroundSnapshot';
import { insideRadius } from '@/utils/geometry';
import type { Residence } from '@/types/settings';
export const GEOFENCE_TASK = 'SMART_LIST_GEOFENCE_TASK';
export const GEOFENCE_IDENTIFIER = 'smart-list-home';
export const isExpoGo = Constants.appOwnership === 'expo';
export const supportsBackgroundGeofencing = Platform.OS !== 'web' && !isExpoGo;
export interface LocationPermissionStatus { foreground:boolean; background:boolean; }

/**
 * Encapsula permissões, leitura de localização e registro de geofence. Antes de
 * registrar o perímetro, sincroniza permissões e estado para evitar eventos antigos.
 */
export const locationService = {
  /** Consulta permissões em primeiro plano e, quando suportado, em segundo plano. */
  async permissions():Promise<LocationPermissionStatus> {
    const fg = await Location.getForegroundPermissionsAsync();
    if (!supportsBackgroundGeofencing) return {foreground:fg.granted,background:false};
    const bg = await Location.getBackgroundPermissionsAsync();
    return {foreground:fg.granted,background:bg.granted};
  },
  /** Solicita acesso em primeiro plano antes de pedir o acesso em segundo plano. */
  async requestPermissions():Promise<LocationPermissionStatus> {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (!fg.granted) return {foreground:false,background:false};
    if (!supportsBackgroundGeofencing) return {foreground:true,background:false};
    // Android 11+ pode abrir as configurações do dispositivo.
    const bg = await Location.requestBackgroundPermissionsAsync();
    return {foreground:true,background:bg.granted};
  },
  /** Obtém a posição atual com precisão equilibrada para configurar a residência. */
  async currentPosition():Promise<{latitude:number;longitude:number}> {
    const loc = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
    return {latitude:loc.coords.latitude,longitude:loc.coords.longitude};
  },
  /** Converte coordenadas em endereço; se a geocodificação falhar, retorna as coordenadas. */
  async address(point:{latitude:number;longitude:number}):Promise<string> {
    try {
      const result = await Location.reverseGeocodeAsync(point);
      const item = result[0];
      if (!item) return `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
      return [item.street, item.streetNumber, item.district, item.city, item.region]
        .filter(Boolean).join(', ');
    } catch { return `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`; }
  },
  /** Interrompe o monitoramento apenas quando a plataforma pode executá-lo e ele está ativo. */
  async stop():Promise<void> {
    if (!supportsBackgroundGeofencing) return;
    if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK))
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
  },
  /**
   * Mantém o geofence alinhado com residência, preferências e permissões:
   * interrompe quando não aplicável; caso contrário, inicializa o estado e registra
   * o perímetro somente se ainda não estiver ativo ou se a residência mudou.
   */
  async syncRegistration(residence:Residence|null, enabled:boolean):Promise<boolean> {
    if (!supportsBackgroundGeofencing) return false;
    if (!residence || !enabled || !residence.geofenceActive) { await this.stop(); return false; }
    const permissions = await this.permissions();
    if (!permissions.foreground || !permissions.background) { await this.stop(); return false; }
    const supported = await TaskManager.isAvailableAsync();
    if (!supported) return false;
    const snapshot = await backgroundSnapshot.read();
    const homeChanged = !snapshot.residence ||
      snapshot.residence.latitude !== residence.latitude ||
      snapshot.residence.longitude !== residence.longitude ||
      snapshot.residence.radiusMeters !== residence.radiusMeters;
    const running = await Location.hasStartedGeofencingAsync(GEOFENCE_TASK);
    if (!running || homeChanged) {
      // Inicia o estado do perímetro antes de registrar o evento. Sem disparos retroativos.
      try {
        const coords = await this.currentPosition();
        await backgroundSnapshot.saveBoundary({inside: insideRadius(coords,residence),exitedAt:null});
      } catch {
        await backgroundSnapshot.saveBoundary({inside:null,exitedAt:null});
      }
      await Location.startGeofencingAsync(GEOFENCE_TASK,[{
        identifier:GEOFENCE_IDENTIFIER,
        latitude:residence.latitude, longitude:residence.longitude,
        radius:residence.radiusMeters, notifyOnEnter:true, notifyOnExit:true,
      }]);
    }
    return true;
  },
};
