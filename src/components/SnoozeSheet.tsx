import { useState } from 'react';
import { View,Text,Pressable,StyleSheet,Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BottomSheet } from '@/ui/BottomSheet';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { SnoozeChoice } from '@/types/settings';
import { colors } from '@/constants/theme';
interface Props {visible:boolean;onClose:()=>void;}
const OPTIONS:{key:SnoozeChoice;title:string;description:string;emoji:string}[] = [
  {key:'30',title:'30 minutos',description:'Ideal para passeios curtos ou caminhadas rápidas.',emoji:'☘'},
  {key:'60',title:'1 hora',description:'Recomendado para recados rápidos ou almoço.',emoji:'◷'},
  {key:'tomorrow',title:'Até amanhã de manhã',description:'Retomar monitoramento às 08:00.',emoji:'☀'},
  {key:'manual',title:'Até eu reativar manualmente',description:'Pausar indefinidamente até você reativar.',emoji:'◉'},
];
/** Permite escolher por quanto tempo os lembretes ficarão pausados. */
export function SnoozeSheet({visible,onClose}:Props){
  const [choice,setChoice]=useState<SnoozeChoice>('30');
  const pause=useSettingsStore(s=>s.snooze);
  const saving=useSettingsStore(s=>s.saving);
  async function confirm(){
    try {await pause(choice);onClose();}
    catch(e){Alert.alert('Não foi possível pausar',e instanceof Error?e.message:'Tente novamente.');}
  }
  return <BottomSheet visible={visible} onClose={onClose} title="Adiar Lembretes Residenciais">
    <Text style={styles.description}>Vai dar uma volta rápida ou não vai ao mercado agora? Escolha por quanto tempo pausar os avisos.</Text>
    {OPTIONS.map(option=><Pressable key={option.key} onPress={()=>setChoice(option.key)}
      style={[styles.option,choice===option.key&&styles.selected]}>
      <View style={[styles.radio,choice===option.key&&styles.radioSelected]}>
        {choice===option.key&&<View style={styles.radioInside}/>}</View>
      <View style={{flex:1}}><Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionDesc}>{option.description}</Text></View>
      <Text style={styles.symbol}>{option.emoji}</Text>
    </Pressable>)}
    <PrimaryButton onPress={()=>{void confirm();}} loading={saving} style={{marginTop:15}}>
      ✓ Confirmar Soneca</PrimaryButton>
  </BottomSheet>;
}
const styles=StyleSheet.create({
  description:{fontSize:12,color:colors.muted,lineHeight:17,marginBottom:16,textAlign:'center'},
  option:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'#F2F3FF',padding:14,borderRadius:12,marginBottom:7},
  selected:{backgroundColor:'#E7ECF5'},radio:{width:19,height:19,borderRadius:12,borderWidth:1.5,borderColor:'#D1D8EB',alignItems:'center',justifyContent:'center'},
  radioSelected:{backgroundColor:colors.primary,borderColor:colors.primary},radioInside:{width:8,height:8,borderRadius:6,backgroundColor:'#fff'},
  optionTitle:{fontWeight:'800',color:colors.ink,fontSize:13},optionDesc:{color:colors.muted,fontSize:11,marginTop:3},symbol:{fontSize:16,color:colors.primary},
});
