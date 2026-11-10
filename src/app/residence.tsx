import { useEffect,useState } from 'react';
import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Circle, Marker } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/store/useSettingsStore';
import { isExpoGo, locationService, supportsBackgroundGeofencing } from '@/services/locationService';
import { notificationService } from '@/services/notificationService';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { PermissionRow } from '@/components/PermissionRow';
import { colors } from '@/constants/theme';
export default function ResidenceScreen(){
  const router=useRouter();
  const configured=useSettingsStore(s=>s.residence);
  const saving=useSettingsStore(s=>s.saving);
  const saveResidence=useSettingsStore(s=>s.saveResidence);
  const diagnostic=useSettingsStore(s=>s.diagnostic);
  const loadDiagnostics=useSettingsStore(s=>s.loadDiagnostics);
  const [coords,setCoords]=useState<{latitude:number;longitude:number}|null>(configured);
  const [address,setAddress]=useState(configured?.address??'');
  const [locating,setLocating]=useState(false);
  useEffect(()=>{void loadDiagnostics();},[loadDiagnostics]);
  async function configureLocation(){
    setLocating(true);
    try {
      const permitted=await locationService.requestPermissions();
      const notificationPermission=await notificationService.askPermission();
      await loadDiagnostics();
      if(!permitted.foreground){Alert.alert('Permissão necessária','Ative a localização para escolher sua residência.');return;}
      if(!permitted.background){
        Alert.alert(
          'Localização em segundo plano',
          isExpoGo
            ? 'No Expo Go, a localização em primeiro plano funciona normalmente, mas o geofencing em segundo plano requer um development build.'
            : supportsBackgroundGeofencing
              ? 'Você pode cadastrar a residência, mas os lembretes de saída exigem a permissão “Permitir o tempo todo”. Ative nas configurações do aparelho.'
              : 'Você pode cadastrar a residência, mas o geofencing em segundo plano não está disponível nesta plataforma.',
        );
      }
      if(!notificationPermission){Alert.alert('Notificações desativadas','Para receber os lembretes, ative as notificações nas configurações do dispositivo.');}
      const point=await locationService.currentPosition();
      const place=await locationService.address(point);
      setCoords(point);setAddress(place);
    } catch(e){Alert.alert('Não foi possível obter a localização',e instanceof Error?e.message:String(e));}
    finally{setLocating(false);}
  }
  async function chooseLocation(latitude:number,longitude:number){
    const point={latitude,longitude};
    setCoords(point);
    setAddress(await locationService.address(point));
  }
  async function save(){
    if(!coords){Alert.alert('Escolha uma localização','Use a localização atual ou toque no mapa.');return;}
    if(!address.trim()){Alert.alert('Endereço necessário','Não foi possível identificar o endereço dessa localização. Escolha outro ponto no mapa.');return;}
    const residence={...coords,address:address.trim(),geofenceActive:true};
    try {await saveResidence(residence);router.replace('/(tabs)');}
    catch(e){Alert.alert('Erro ao salvar residência',e instanceof Error?e.message:String(e));}
  }
  return <SafeAreaView style={styles.screen} edges={['top','bottom']}>
    <View style={styles.header}>
      <Pressable onPress={()=>router.back()}><Ionicons name="arrow-back-outline" size={24} color={colors.ink}/></Pressable>
      <Text style={styles.headerTitle}>Configuração da Residência</Text>
      <Ionicons name="shield-checkmark" size={23} color={colors.primary}/>
    </View>
    <ScrollView contentContainerStyle={{paddingHorizontal:15,paddingBottom:24}}>
      <View style={styles.statusBox}><View style={styles.statusIcon}><Ionicons name="navigate" size={21} color="#226DE6"/></View>
        <View style={{flex:1}}><Text style={styles.statusTitle}>Monitoramento Geofence</Text>
          <Text style={styles.statusDesc}>{diagnostic.backgroundLocationAllowed?'Localização autorizada em segundo plano':'Autorização de localização necessária'}</Text></View>
        <View style={[styles.statusBadge,diagnostic.backgroundLocationAllowed&&{backgroundColor:'#BFF3C9'}]}>
          <Text style={styles.statusBadgeText}>{diagnostic.backgroundLocationAllowed?'Online':'Pendente'}</Text></View>
      </View>
      <View style={styles.mapCard}>
        {coords ? <MapView style={styles.map} region={{latitude:coords.latitude,longitude:coords.longitude,
          latitudeDelta:0.007,longitudeDelta:0.007}} onPress={event=>{void chooseLocation(event.nativeEvent.coordinate.latitude,event.nativeEvent.coordinate.longitude);}}>
          <Circle center={coords} radius={150} fillColor="rgba(0,109,51,0.22)" strokeColor="rgba(0,109,51,0.65)" strokeWidth={2}/>
          <Marker coordinate={coords} title="Residência" description="Ponto central da geofence">
            <View style={styles.house}><Ionicons name="home" size={23} color="#fff"/></View>
          </Marker>
        </MapView> : <View style={[styles.map,styles.mapEmpty]}>
          <Ionicons name="map-outline" size={45} color="#7B8DAB"/>
          <Text style={styles.mapEmptyTitle}>O mapa aparece após localizar o aparelho.</Text>
          <Text style={styles.mapEmptyText}>Escolha sua posição atual para definir a área de monitoramento.</Text>
        </View>}
        <View style={styles.addressBox}><Ionicons name="location-outline" size={24} color={colors.primary}/>
          <View style={{flex:1}}><Text style={styles.infoSmall}>ENDEREÇO RESIDENCIAL {coords?'DEFINIDO':'NÃO DEFINIDO'}</Text>
            <Text style={styles.addressTitle}>{address||'Aguardando localização'}</Text>
            <Text style={styles.addressSub}>Toque no mapa para ajustar o ponto central.</Text></View>
        </View>
        <PrimaryButton secondary onPress={()=>{void configureLocation();}} loading={locating} style={{margin:13,marginTop:0}}>
          ◎ Usar minha localização atual
        </PrimaryButton>
      </View>
      <View style={styles.radiusCard}>
        <Text style={styles.cardTitle}>Raio de monitoramento</Text>
        <Text style={styles.radiusText}>150 metros</Text>
        <Text style={styles.radiusExplanation}>Raio definido pela API. Alertaremos após o aparelho ultrapassar a borda da área residencial.</Text>
      </View>
      <View style={styles.permissionCard}><Text style={styles.cardTitle}>Diagnóstico do Sistema</Text>
        <PermissionRow name="Localização em uso" description="Necessária para determinar a residência"
          allowed={diagnostic.foregroundLocationAllowed} icon="location-outline"/>
        <PermissionRow name="Segundo plano" description="Necessária para avisos automáticos"
          allowed={diagnostic.backgroundLocationAllowed} icon="shield-checkmark-outline"/>
        <PermissionRow name="Notificações" description="Exibir alertas na bandeja do aparelho"
          allowed={diagnostic.notificationsAllowed} icon="notifications-outline"/>
      </View>
      <PrimaryButton loading={saving} onPress={()=>{void save();}} style={{marginTop:16}}>
        ✓ Salvar Configuração de Residência</PrimaryButton>
    </ScrollView>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},
  header:{flexDirection:'row',alignItems:'center',gap:14,padding:18},
  headerTitle:{flex:1,fontSize:16,fontWeight:'800',color:colors.ink},
  statusBox:{backgroundColor:colors.violetSoft,borderRadius:15,padding:14,marginBottom:12,
    flexDirection:'row',alignItems:'center',gap:12},
  statusIcon:{height:38,width:38,backgroundColor:'#E1E8FF',borderRadius:12,alignItems:'center',justifyContent:'center'},
  statusTitle:{fontSize:12,fontWeight:'800',color:colors.ink},statusDesc:{fontSize:11,color:colors.muted,marginTop:3},
  statusBadge:{backgroundColor:'#FFE5BE',borderRadius:10,paddingHorizontal:8,paddingVertical:4},statusBadgeText:{fontSize:10,color:'#5A6338',fontWeight:'800'},
  mapCard:{backgroundColor:'#fff',borderRadius:16,overflow:'hidden'},map:{height:260,width:'100%'},
  mapEmpty:{alignItems:'center',justifyContent:'center',backgroundColor:'#E8ECFF',padding:24,gap:10},
  mapEmptyTitle:{color:colors.ink,fontSize:13,fontWeight:'700',textAlign:'center'},mapEmptyText:{fontSize:11,color:colors.muted,textAlign:'center'},
  house:{width:40,height:40,borderRadius:25,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},
  addressBox:{flexDirection:'row',alignItems:'center',gap:12,padding:14},
  infoSmall:{fontSize:10,fontWeight:'800',color:colors.muted},addressTitle:{fontSize:14,color:colors.ink,fontWeight:'700',marginTop:5},
  addressSub:{color:colors.muted,fontSize:10,marginTop:4},
  radiusCard:{padding:17,backgroundColor:'#fff',borderRadius:15,marginTop:12,alignItems:'center'},
  cardTitle:{fontSize:14,fontWeight:'800',color:colors.ink},radiusText:{color:colors.primary,fontWeight:'900',fontSize:15,
    backgroundColor:colors.primarySoft,borderRadius:20,paddingVertical:6,paddingHorizontal:16,marginTop:10},
  radiusExplanation:{color:colors.muted,fontSize:11,lineHeight:16,textAlign:'center',marginTop:12},
  permissionCard:{backgroundColor:'#fff',borderRadius:15,padding:14,marginTop:12},
});
