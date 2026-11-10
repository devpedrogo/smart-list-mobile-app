import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { settingsService } from '@/services/settingsService';
import { residenceService } from '@/services/residenceService';
import { locationService } from '@/services/locationService';
import { backgroundSnapshot } from '@/services/backgroundSnapshot';
import { notificationService, snoozePayload } from '@/services/notificationService';
import type { AppSettings, Residence, ResidencePayload, SnoozeChoice, SnoozeUntil, SystemDiagnostics } from '@/types/settings';
import { cleanError } from '@/utils/format';
interface SettingsState {
  settings:AppSettings;
  residence:Residence|null;
  snoozeUntil:SnoozeUntil;
  diagnostic:SystemDiagnostics;
  error:string|null;
  saving:boolean;
  load:()=>Promise<void>;
  loadDiagnostics:()=>Promise<void>;
  updateSettings:(patch:Partial<AppSettings>)=>Promise<void>;
  saveResidence:(payload:ResidencePayload)=>Promise<void>;
  snooze:(choice:SnoozeChoice)=>Promise<void>;
  resume:()=>Promise<void>;
  clearError:()=>void;
}
const defaults:AppSettings={
  remindersEnabled:true,
  vibrationEnabled:true,
  notificationPermission:'NEGADO',
  locationPermission:'NEGADO',
};
async function currentPermissionSettings():Promise<Pick<AppSettings,'notificationPermission'|'locationPermission'>>{
  const [location,notifications]=await Promise.all([
    locationService.permissions(),
    Notifications.getPermissionsAsync(),
  ]);
  return {
    notificationPermission:notifications.granted?'PERMITIDO':'NEGADO',
    locationPermission:!location.foreground?'NEGADO':
      location.background?'SEMPRE_PERMITIDA':'APENAS_DURANTE_USO',
  };
}
export const useSettingsStore = create<SettingsState>((set,get) => ({
  settings:defaults,residence:null,snoozeUntil:null,
  diagnostic:{notificationsAllowed:false,foregroundLocationAllowed:false,backgroundLocationAllowed:false,apiOnline:null},
  error:null,saving:false,
  async load(){
    const snap=await backgroundSnapshot.read();
    set({snoozeUntil:snap.snoozeUntil});
    // Busca cada recurso independentemente: lista de compras continua útil offline do monitoramento.
    const [st,res]=await Promise.allSettled([settingsService.get(),residenceService.get()]);
    if(st.status==='fulfilled') {
      try {
        const next={...st.value,...await currentPermissionSettings()};
        const permissionsChanged=next.notificationPermission!==st.value.notificationPermission||
          next.locationPermission!==st.value.locationPermission;
        const settings=permissionsChanged?await settingsService.update(next):st.value;
        set({settings});
        await backgroundSnapshot.saveReminders(settings.remindersEnabled);
      } catch(err) {
        set({settings:st.value,error:cleanError(err)});
        await backgroundSnapshot.saveReminders(st.value.remindersEnabled);
      }
    } else {set({error:cleanError(st.reason)});}
    if(res.status==='fulfilled') {
      set({residence:res.value});
      await backgroundSnapshot.saveResidence(res.value);
    } else {set({error:cleanError(res.reason)});}
    await locationService.syncRegistration(get().residence,get().settings.remindersEnabled)
      .catch(err=>{console.warn('Permissão ou geofencing:',err);});
  },
  async loadDiagnostics(){
    const [loc,notifications,health] = await Promise.all([
      locationService.permissions().catch(()=>({foreground:false,background:false})),
      Notifications.getPermissionsAsync().catch(()=>null),
      settingsService.diagnostics().then(()=>true).catch(()=>settingsService.health()),
    ]);
    set({diagnostic:{
      foregroundLocationAllowed:loc.foreground,
      backgroundLocationAllowed:loc.background,
      notificationsAllowed:notifications?.granted ?? false,
      apiOnline:health,
    }});
  },
  async updateSettings(patch){
    set({saving:true,error:null});
    try {
      const next:AppSettings={
        ...get().settings,
        ...patch,
        ...await currentPermissionSettings(),
      };
      const saved=await settingsService.update(next);
      set({settings:saved});
      await backgroundSnapshot.saveReminders(saved.remindersEnabled);
      await locationService.syncRegistration(get().residence,saved.remindersEnabled);
    } catch(err) {set({error:cleanError(err)});throw err;}
    finally{set({saving:false});}
  },
  async saveResidence(payload){
    set({saving:true,error:null});
    try {
      const residence=await residenceService.save(payload);
      set({residence});
      await backgroundSnapshot.saveResidence(residence);
      // força nova geofence se os parâmetros mudaram
      await locationService.stop();
      await locationService.syncRegistration(residence,get().settings.remindersEnabled);
      await get().loadDiagnostics();
    } catch(err) {set({error:cleanError(err)});throw err;}
    finally {set({saving:false});}
  },
  async snooze(choice){
    set({saving:true,error:null});
    try {
      const {payload,until}=snoozePayload(choice);
      await notificationService.snooze(payload);
      set({snoozeUntil:until});
      await backgroundSnapshot.saveSnooze(until);
    } catch(err) {set({error:cleanError(err)});throw err;}
    finally {set({saving:false});}
  },
  async resume(){
    set({saving:true,error:null});
    try {
      await notificationService.resume();
      set({snoozeUntil:null});
      await backgroundSnapshot.saveSnooze(null);
    } catch(err) {set({error:cleanError(err)});throw err;}
    finally{set({saving:false});}
  },
  clearError:()=>set({error:null}),
}));
