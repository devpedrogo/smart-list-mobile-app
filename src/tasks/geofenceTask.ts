/** Importar UMA vez no entrypoint (src/app/_layout.tsx), no escopo global. */
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { backgroundSnapshot } from '@/services/backgroundSnapshot';
import { notificationService } from '@/services/notificationService';
import { GEOFENCE_TASK, GEOFENCE_IDENTIFIER } from '@/services/locationService';

TaskManager.defineTask(GEOFENCE_TASK, async ({data,error}) => {
  if (error) { console.warn('Geofence task:',error.message); return; }
  if (!data) return;
  const event = data as {eventType:Location.GeofencingEventType;region:Location.LocationRegion};
  if (event.region.identifier !== GEOFENCE_IDENTIFIER) return;
  const {pending,remindersEnabled,snoozeUntil,boundary} = await backgroundSnapshot.read();
  if (event.eventType === Location.GeofencingEventType.Enter) {
    await backgroundSnapshot.saveBoundary({inside:true,exitedAt:null});
    return;
  }
  if (event.eventType !== Location.GeofencingEventType.Exit) return;
  // Só avisar na transição observada de DENTRO -> FORA; evita falso alerta inicial.
  const shouldNotify = boundary.inside === true;
  await backgroundSnapshot.saveBoundary({inside:false,exitedAt:Date.now()});
  const paused = snoozeUntil === 'manual' || (typeof snoozeUntil === 'number' && snoozeUntil > Date.now());
  if (!shouldNotify || !remindersEnabled || paused || pending.length === 0) return;
  try { await notificationService.notifyDeparture(pending); }
  catch (err) { console.warn('Não foi possível exibir a notificação de saída:',err); }
});
