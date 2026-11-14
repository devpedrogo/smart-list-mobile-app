import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { cacheKeys } from '@/services/backgroundSnapshot';
import { colors } from '@/constants/theme';
/** Verifica se a apresentação inicial já foi concluída e abre a tela correspondente. */
export default function Entry(){
  const [done,setDone]=useState<boolean|null>(null);
  useEffect(()=>{void AsyncStorage.getItem(cacheKeys.onboarding).then(value=>setDone(value==='true')).catch(()=>setDone(false));},[]);
  if(done===null) return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator color={colors.primary}/></View>;
  return <Redirect href={done?'/(tabs)':'/onboarding'}/>;
}
