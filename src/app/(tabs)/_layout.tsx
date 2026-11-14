import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/theme';
/** Organiza as abas principais e define os ícones e as cores da navegação. */
export default function TabLayout(){
  return <Tabs screenOptions={{
    headerShown:false,
    tabBarActiveTintColor:colors.primary,
    tabBarInactiveTintColor:'#8A929A',
    tabBarLabelStyle:{fontSize:11,fontWeight:'700',paddingTop:2},
    tabBarStyle:{height:68,paddingTop:9,paddingBottom:12,backgroundColor:'#fff',borderTopColor:colors.border},
  }}>
    <Tabs.Screen name="index" options={{title:'Lista',tabBarIcon:({color,size})=><Ionicons name="list-outline" color={typeof color==='string'?color:colors.primary} size={size}/>}}/>
    <Tabs.Screen name="settings" options={{title:'Configurações',tabBarIcon:({color,size})=><Ionicons name="settings-outline" color={typeof color==='string'?color:colors.primary} size={size}/>}}/>
  </Tabs>;
}
