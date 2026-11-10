import { useCallback,useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect,useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { PermissionRow } from '@/components/PermissionRow';
import { SettingSwitch } from '@/ui/SettingSwitch';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAppStore } from '@/store/useAppStore';
import { notificationService } from '@/services/notificationService';
import { colors } from '@/constants/theme';
function Heading({title,right}:{title:string;right?:string}){
  return <View style={styles.heading}><Text style={styles.sectionTitle}>{title}</Text>
    {!!right&&<Text style={styles.right}>{right}</Text>}</View>;
}
function MenuRow({icon,title,description,onPress,danger=false}:{icon:React.ComponentProps<typeof Ionicons>['name'];title:string;description:string;onPress:()=>void;danger?:boolean}){
  return <Pressable style={styles.menuRow} onPress={onPress}>
    <View style={[styles.iconBox,danger&&{backgroundColor:'#FFF0EE'}]}><Ionicons name={icon} size={18} color={danger?colors.red:colors.primary}/></View>
    <View style={{flex:1}}><Text style={styles.menuTitle}>{title}</Text><Text style={styles.menuDescription}>{description}</Text></View>
    <Ionicons name="chevron-forward-outline" size={19} color={colors.ink}/>
  </Pressable>;
}
export default function SettingsScreen(){
  const router=useRouter();
  const [testingNotification,setTestingNotification]=useState(false);
  const {settings,diagnostic,residence,snoozeUntil,updateSettings,loadDiagnostics,resume}=useSettingsStore();
  const clearCompleted=useAppStore(s=>s.clearCompleted);
  const completedLength=useAppStore(s=>s.completed.length);
  const pendingItems=useAppStore(s=>s.pending);
  useFocusEffect(useCallback(()=>{void loadDiagnostics();},[loadDiagnostics]));
  function update(key:'remindersEnabled'|'vibrationEnabled', value:boolean){
    void updateSettings({[key]:value}).catch(e=>Alert.alert('Não foi possível salvar',String(e)));
  }
  function removeAll(){
    Alert.alert('Limpar itens comprados',`Excluir ${completedLength} itens concluídos?`,[
      {text:'Cancelar',style:'cancel'},
      {text:'Limpar',style:'destructive',onPress:()=>{void clearCompleted().catch(e=>Alert.alert('Erro',String(e)));}},
    ]);
  }
  async function testDepartureNotification(){
    if(pendingItems.length===0){
      Alert.alert('Lista vazia','Adicione pelo menos um item pendente para testar a notificação.');
      return;
    }
    setTestingNotification(true);
    try {
      const permitted=await notificationService.askPermission();
      if(!permitted){
        Alert.alert('Notificações desativadas','Ative as notificações do Smart List nas configurações do Android e tente novamente.');
        return;
      }
      await notificationService.notifyDeparture(pendingItems);
      Alert.alert(
        'Teste enviado',
        'A notificação foi disparada. No development build Android ela usa o layout customizado; no Expo Go, usa o layout padrão. O teste não altera a localização nem o geofence.',
      );
    } catch(error) {
      Alert.alert('Não foi possível testar a notificação',error instanceof Error?error.message:String(error));
    } finally {
      setTestingNotification(false);
    }
  }
  const paused=snoozeUntil==='manual'||(typeof snoozeUntil==='number'&&snoozeUntil>Date.now());
  return <SafeAreaView style={styles.screen} edges={['top']}>
    <AppHeader title="Configurações"/>
    <ScrollView contentContainerStyle={{paddingHorizontal:16,paddingBottom:35}}>
      <Heading title="LEMBRETES & MONITORAMENTO" right="Geofencing"/>
      <View style={styles.card}>
        <SettingSwitch label="Lembretes ao sair de casa"
          description="Envia um alerta quando você sai da área residencial com itens pendentes na lista."
          value={settings.remindersEnabled} onValueChange={v=>update('remindersEnabled',v)}/>
        <View style={styles.divider}/>
        <MenuRow icon="locate-outline" title="Configuração da Residência"
          description={residence?.address?`${residence.address} · Raio: ${residence.radiusMeters}m`:'Definir endereço · raio fixo de 150 m'}
          onPress={()=>router.push('/residence')}/>
        <View style={styles.divider}/>
        <SettingSwitch label="Vibração ao notificar" description="Padrão tátil curto para atenção imediata"
          value={settings.vibrationEnabled} onValueChange={v=>update('vibrationEnabled',v)}/>
      </View>
      <Heading title="PERMISSÕES DO SISTEMA" right="Android / iOS"/>
      <View style={styles.card}>
        <PermissionRow name="Notificações" description="Permissão para avisos no aparelho"
          allowed={diagnostic.notificationsAllowed} icon="notifications-outline"/>
        <View style={styles.divider}/>
        <PermissionRow name="Localização em uso" description="Localização com aplicativo aberto"
          allowed={diagnostic.foregroundLocationAllowed} icon="location-outline"/>
        <View style={styles.divider}/>
        <PermissionRow name="Localização em segundo plano" description="Necessária para geofencing"
          allowed={diagnostic.backgroundLocationAllowed} icon="navigate-outline"/>
        <View style={styles.privacy}><Ionicons name="shield-checkmark-outline" size={20} color={colors.primary}/>
          <Text style={styles.privacyText}>Sua privacidade em primeiro lugar: o app usa as permissões apenas para lembrar suas compras ao sair de casa.</Text></View>
      </View>
      <Heading title="TESTE DE NOTIFICAÇÃO" right="Simulação"/>
      <View style={styles.card}>
        <Text style={styles.testDescription}>
          Dispara agora um lembrete usando os itens pendentes. Não simula GPS nem testa o geofence.
        </Text>
        <PrimaryButton loading={testingNotification} onPress={()=>{void testDepartureNotification();}} style={styles.testButton}>
          Enviar notificação de teste
        </PrimaryButton>
      </View>
      <Heading title="GERENCIAMENTO DA LISTA"/>
      <View style={styles.card}>
        <MenuRow icon="trash-outline" title="Limpar itens comprados"
          description="Remove apenas os itens com checkmark" onPress={removeAll} danger/>
        <View style={styles.divider}/>
        {paused ? <MenuRow icon="play-outline" title="Reativar lembretes"
          description="Retomar os avisos de saída agora"
          onPress={()=>{void resume().catch(e=>Alert.alert('Erro',String(e)));}}/>:
          <MenuRow icon="alarm-outline" title="Pausar lembretes temporariamente"
            description="Use o botão Pausar na lista principal" onPress={()=>router.push('/(tabs)')}/>}
      </View>
      <View style={styles.footer}><Text style={styles.footerMain}>♧ Smart List • v1.0.0</Text>
        <Text style={styles.footerCaption}>Dados locais protegidos no dispositivo.</Text></View>
    </ScrollView>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},heading:{marginTop:20,marginBottom:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  sectionTitle:{fontSize:12,color:colors.ink,letterSpacing:.4,fontWeight:'800'},right:{fontSize:10,color:colors.primary,fontWeight:'700'},
  card:{backgroundColor:'#fff',borderRadius:16,overflow:'hidden',paddingHorizontal:3},
  divider:{height:1,backgroundColor:colors.border,marginHorizontal:13},
  menuRow:{padding:14,flexDirection:'row',gap:12,alignItems:'center',minHeight:72},
  iconBox:{width:36,height:36,borderRadius:10,backgroundColor:colors.violetSoft,alignItems:'center',justifyContent:'center'},
  menuTitle:{fontSize:13,color:colors.ink,fontWeight:'700'},menuDescription:{fontSize:11,color:colors.muted,lineHeight:16,marginTop:4},
  privacy:{margin:10,borderRadius:12,padding:12,backgroundColor:'#EDF0FF',flexDirection:'row',gap:10},
  privacyText:{flex:1,color:'#43517A',fontSize:11,lineHeight:16},
  testDescription:{fontSize:12,color:colors.muted,lineHeight:18,padding:13,paddingBottom:0},
  testButton:{margin:13},
  footer:{alignItems:'center',gap:7,paddingTop:24},footerMain:{fontSize:11,fontWeight:'700',color:colors.primary},
  footerCaption:{fontSize:10,color:colors.muted},
});
