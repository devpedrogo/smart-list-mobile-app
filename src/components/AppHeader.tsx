import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme';
import { useSettingsStore } from '@/store/useSettingsStore';
interface Props {title?:string;}
export function AppHeader({title='Lista De Compras'}:Props){
  const router=useRouter();
  const enabled=useSettingsStore(s=>s.settings.remindersEnabled);
  const residence=useSettingsStore(s=>s.residence);
  return <View style={styles.wrapper}>
    <View style={styles.line}>
      <Text style={styles.title}>{title}</Text>
      <View style={{flexDirection:'row',gap:16,alignItems:'center'}}>
        <Pressable accessibilityLabel="Abrir configurações" onPress={()=>router.push('/(tabs)/settings')}>
          <Ionicons name="settings-outline" size={23} color={colors.ink}/></Pressable>
        <View style={styles.user}><Ionicons name="person" size={16} color="#fff"/></View>
      </View>
    </View>
    <View style={styles.status}><View style={[styles.dot,!enabled&&{backgroundColor:'#D4A20B'}]}/>
      <Text style={styles.statusLabel}>{enabled&&residence?'MONITORAMENTO RESIDENCIAL ATIVO':'MONITORAMENTO NÃO CONFIGURADO'}</Text></View>
  </View>;
}
const styles=StyleSheet.create({
  wrapper:{backgroundColor:colors.background,paddingTop:10,paddingBottom:16,paddingHorizontal:20},
  line:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  title:{fontSize:21,fontWeight:'800',color:colors.ink},user:{backgroundColor:colors.primary,width:29,height:29,borderRadius:15,alignItems:'center',justifyContent:'center'},
  status:{flexDirection:'row',alignItems:'center',gap:6,marginTop:6},
  dot:{height:7,width:7,borderRadius:4,backgroundColor:colors.green},
  statusLabel:{fontSize:10,letterSpacing:.2,fontWeight:'800',color:'#34815A'},
});
