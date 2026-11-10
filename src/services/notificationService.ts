import * as Notifications from 'expo-notifications';
import { NativeEventEmitter, Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { api } from '@/api/client';
import type { ShoppingItem } from '@/types/shopping';
import type { SnoozeChoice, SnoozePayload, SnoozeUntil } from '@/types/settings';
import { untilTomorrowMorning, firstNames } from '@/utils/format';
export const REMINDER_CATEGORY = 'SMART_LIST_REMINDER';
export const SNOOZE_ACTION = 'SNOOZE_30';
export const OPEN_ACTION = 'OPEN_LIST';
export const REMINDER_CHANNEL = 'smart-list-reminders';
interface SmartListNotificationsModule {
  addListener(eventName:string): void;
  removeListeners(count:number): void;
  presentDepartureNotification(items: Array<{name:string;category:string}>): Promise<void>;
  consumePendingAction(): Promise<string|null>;
}
const nativeNotifications = Platform.OS === 'android'
  ? requireOptionalNativeModule<SmartListNotificationsModule>('SmartListNotifications')
  : null;
const nativeNotificationsEmitter = nativeNotifications
  ? new NativeEventEmitter<{onNotificationAction:[{action:string}]}>(nativeNotifications)
  : null;
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true,
    shouldPlaySound: true, shouldSetBadge: false,
  }),
});
export function snoozePayload(choice: SnoozeChoice): {payload:SnoozePayload; until:SnoozeUntil} {
  switch (choice) {
    case 'manual': return { payload:{option:'INDEFINITE'}, until:'manual' };
    case 'tomorrow': return { payload:{option:'TOMORROW_MORNING'}, until:untilTomorrowMorning().getTime() };
    case '30': return { payload:{option:'MINUTES_30'}, until:Date.now() + 30 * 60000 };
    case '60': return { payload:{option:'HOUR_1'}, until:Date.now() + 60 * 60000 };
    default: throw new Error('A opção de pausa selecionada é inválida.');
  }
}
export const notificationService = {
  async prepare(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
        name:'Lembretes da Smart List',
        importance:Notifications.AndroidImportance.HIGH,
        vibrationPattern:[0,250,180,250],
        lightColor:'#006D33', sound:'default',
      });
    }
    await Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY, [
      {identifier:OPEN_ACTION, buttonTitle:'Abrir lista', options:{opensAppToForeground:true}},
      {identifier:SNOOZE_ACTION, buttonTitle:'Adiar 30 min', options:{opensAppToForeground:true}},
    ]);
  },
  async askPermission(): Promise<boolean> {
    const res = await Notifications.getPermissionsAsync();
    if (res.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  },
  async notifyDeparture(items: ShoppingItem[]): Promise<void> {
    if (nativeNotifications) {
      await nativeNotifications.presentDepartureNotification(
        items.map(item => ({name:item.name,category:item.category})),
      );
      return;
    }
    const names = firstNames(items.map(item => item.name));
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Você saiu de casa com compras pendentes!',
        body: `Há ${items.length} ${items.length === 1 ? 'item' : 'itens'} na lista: ${names}.`,
        data: { url: '/(tabs)', kind:'geofence_exit' },
        categoryIdentifier: REMINDER_CATEGORY,
        sound: 'default',
      },
      trigger: null,
    });
  },
  async consumeNativeAction(): Promise<string|null> {
    return nativeNotifications?.consumePendingAction() ?? null;
  },
  addNativeActionListener(listener: (action:string)=>void): {remove:()=>void}|null {
    return nativeNotificationsEmitter?.addListener(
      'onNotificationAction',
      ({action})=>listener(action),
    ) ?? null;
  },
  async snooze(payload: SnoozePayload): Promise<void> {
    await api.post('/notifications/snooze', payload);
  },
  async resume(): Promise<void> {
    await api.delete('/notifications/snooze');
  },
};
