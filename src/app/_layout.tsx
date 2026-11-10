import 'react-native-gesture-handler';
import '@/tasks/geofenceTask';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, AppState, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { notificationService, SNOOZE_ACTION } from '@/services/notificationService';
import { colors } from '@/constants/theme';
/** Layout raiz: o módulo de TaskManager deve carregar sem hooks e fora das telas. */
export default function RootLayout(){
  const [ready,setReady]=useState(false);
  const router=useRouter();
  const initialize=useAppStore(s=>s.initialize);
  const refresh=useAppStore(s=>s.refresh);
  const load=useSettingsStore(s=>s.load);
  useEffect(()=>{
    let active=true;
    async function boot(){
      try {
        await initialize();
        await notificationService.prepare();
        await Promise.allSettled([refresh(),load()]);
      } catch(err) {console.warn('Inicialização:',err);}
      finally {if(active)setReady(true);}
    }
    void boot();
    return ()=>{active=false;};
  },[initialize,refresh,load]);
  useEffect(()=>{
    if(!ready)return;
    async function consumeNativeAction(){
      try {
        const action=await notificationService.consumeNativeAction();
        if(action==='snooze')await useSettingsStore.getState().snooze('30');
      } catch(err) {
        Alert.alert('Não foi possível adiar os lembretes',err instanceof Error?err.message:String(err));
      }
    }
    const actionSubscription=notificationService.addNativeActionListener(action=>{
      if(action==='snooze')void consumeNativeAction();
    });
    void consumeNativeAction();
    const subscription=AppState.addEventListener('change',state=>{
      if(state==='active')void consumeNativeAction();
    });
    return ()=>{
      actionSubscription?.remove();
      subscription.remove();
    };
  },[ready]);
  useEffect(()=>{
    if (!ready) return;
    async function handle(response:Notifications.NotificationResponse){
      Notifications.clearLastNotificationResponse();
      if(response.actionIdentifier===SNOOZE_ACTION){
        try {await useSettingsStore.getState().snooze('30');}
        catch(err){console.warn('Não foi possível adiar:',err);}
      } else {
        router.push('/(tabs)');
      }
    }
    const subscription=Notifications.addNotificationResponseReceivedListener(response=>{void handle(response);});
    // Notificações abertas com o aplicativo encerrado também navegam à lista.
    void Notifications.getLastNotificationResponseAsync().then(result=>{
      if(result) void handle(result);
    }).catch(()=>undefined);
    return ()=>subscription.remove();
  },[router,ready]);
  return <SafeAreaProvider>
    <StatusBar style="dark"/>
    {!ready ? <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary}/></View> :
      <Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.background}}}>
        <Stack.Screen name="index"/>
        <Stack.Screen name="(tabs)"/>
        <Stack.Screen name="onboarding"/>
        <Stack.Screen name="item" options={{presentation:'modal'}}/>
        <Stack.Screen name="residence"/>
      </Stack>}
  </SafeAreaProvider>;
}
const styles=StyleSheet.create({loading:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:colors.background}});
