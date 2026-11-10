import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cacheKeys } from '@/services/backgroundSnapshot';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { colors } from '@/constants/theme';
const STEPS=[
  {number:'PASSO 1',title:'Cadastre o que precisa',description:'Anote produtos rapidamente, com ou sem quantidades, organizados pelo seu ritmo.',icon:'checkmark-done-outline' as const},
  {number:'PASSO 2',title:'Defina sua residência',description:'Configure sua casa e a distância ideal (150m a princípio) para ser avisado sem falsos alarmes.',icon:'locate-outline' as const},
  {number:'PASSO 3',title:'Lembretes inteligentes',description:'O app avisa na hora que você sai de casa para que sua viagem não seja em vão.',icon:'notifications-outline' as const},
];
export default function Onboarding(){
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  async function finish(setup:boolean){
    setBusy(true);
    try {
      await AsyncStorage.setItem(cacheKeys.onboarding,'true');
      router.replace(setup?'/residence':'/(tabs)');
    }catch(err){Alert.alert('Erro',String(err));}
    finally{setBusy(false);}
  }
  return <SafeAreaView edges={['top','bottom']} style={styles.screen}>
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}><View style={styles.halo}><View style={styles.innerHalo}>
        <Ionicons name="home" size={40} color={colors.primary}/>
        <Ionicons style={styles.pin} name="location" size={21} color="#00A652"/>
      </View></View></View>
      <Text style={styles.title}>Nunca mais esqueça as{'\n'}compras ao sair de casa</Text>
      <Text style={styles.subtitle}>O Smart List monitora sua lista e avisa automaticamente assim que você se afasta da sua residência com produtos pendentes.</Text>
      <View style={styles.steps}>{STEPS.map((step,index)=><View key={step.number} style={styles.step}>
        <View style={styles.stepIcon}><Ionicons name={step.icon} size={25} color={index===2?'#2468E9':colors.primary}/></View>
        <View style={{flex:1}}><Text style={styles.stepNum}>{step.number}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDesc}>{step.description}</Text></View>
      </View>)}</View>
      <View style={styles.privacy}><Ionicons name="shield-checkmark" size={26} color={colors.primary}/>
        <View style={{flex:1}}><Text style={styles.privacyTitle}>Sua privacidade em primeiro lugar</Text>
          <Text style={styles.privacyText}>A localização é usada apenas no aparelho para identificar a saída de casa. Você pode usar a lista normalmente mesmo sem ativar a localização.</Text></View></View>
      <PrimaryButton onPress={()=>{void finish(true);}} loading={busy} style={{marginTop:20}}>
        ➤ Configurar Residência e Permissões</PrimaryButton>
      <Pressable onPress={()=>{void finish(false);}} style={styles.skip}><Text style={styles.skipText}>Começar a usar a lista agora (configurar depois)</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},container:{paddingHorizontal:17,paddingBottom:26},
  hero:{height:165,alignItems:'center',justifyContent:'center'},
  halo:{width:154,height:154,borderRadius:78,backgroundColor:'#E5ECFF',alignItems:'center',justifyContent:'center'},
  innerHalo:{width:110,height:110,borderRadius:55,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',position:'relative'},
  pin:{position:'absolute',right:23,top:21},title:{fontSize:24,fontWeight:'900',lineHeight:31,color:colors.ink,textAlign:'center'},
  subtitle:{fontSize:12,lineHeight:19,color:'#395077',textAlign:'center',marginTop:10,marginBottom:23},
  steps:{gap:8},step:{backgroundColor:'#fff',borderRadius:15,padding:15,flexDirection:'row',gap:12,alignItems:'flex-start'},
  stepIcon:{backgroundColor:colors.violetSoft,width:42,height:42,borderRadius:12,alignItems:'center',justifyContent:'center'},
  stepNum:{fontSize:10,fontWeight:'800',color:colors.primary,marginBottom:4},
  stepTitle:{fontSize:15,fontWeight:'800',color:colors.ink},stepDesc:{fontSize:12,color:colors.muted,lineHeight:17,marginTop:4},
  privacy:{flexDirection:'row',backgroundColor:'#ECEFFF',padding:15,gap:12,borderRadius:14,marginTop:18},
  privacyTitle:{fontSize:12,fontWeight:'800',color:colors.ink},privacyText:{fontSize:11,color:'#405177',lineHeight:17,marginTop:3},
  skip:{alignItems:'center',paddingVertical:17},skipText:{fontSize:12,color:colors.ink,fontWeight:'700',textAlign:'center'},
});
