import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { ErrorBanner, EmptyState } from '@/components/ScreenState';
import { SnoozeSheet } from '@/components/SnoozeSheet';
import { ItemCard } from '@/domain/ItemCard';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { colors,shadow } from '@/constants/theme';
import type { ShoppingItem } from '@/types/shopping';
/** Mostra o título e a quantidade de uma seção, permitindo abrir ou recolher seus itens. */
function SectionTitle({title,count,expanded,onPress,trailing}:{title:string;count:number;expanded:boolean;onPress:()=>void;trailing?:React.ReactNode}){
  return <View style={styles.sectionRow}>
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.sectionTap}>
      <Ionicons name={expanded?'chevron-down':'chevron-forward'} size={17} color={colors.ink}/>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.count}><Text style={styles.countText}>{count}</Text></View>
    </Pressable>{trailing}
  </View>;
}
/** Exibe os itens pendentes e comprados e permite gerenciar a lista. */
export default function ShoppingListScreen(){
  const router=useRouter();
  const {pending,completed,busy,error,refresh,toggle,remove,clearError}=useAppStore();
  const resume=useSettingsStore(s=>s.resume);
  const snoozeUntil=useSettingsStore(s=>s.snoozeUntil);
  const [showPending,setShowPending]=useState(true);
  const [showCompleted,setShowCompleted]=useState(true);
  const [sheet,setSheet]=useState(false);
  useFocusEffect(useCallback(()=>{void refresh().catch(()=>undefined);},[refresh]));
  async function onToggle(item:ShoppingItem){
    try {await toggle(item.id);} catch(err){Alert.alert('Erro ao atualizar',String(err));}
  }
  function onRemove(item:ShoppingItem){
    Alert.alert('Excluir item',`Remover "${item.name}" da lista?`,[
      {text:'Cancelar',style:'cancel'},
      {text:'Excluir',style:'destructive',onPress:()=>{void remove(item.id).catch(e=>Alert.alert('Erro',String(e)));}},
    ]);
  }
  const paused=snoozeUntil==='manual'||(typeof snoozeUntil==='number'&&snoozeUntil>Date.now());
  return <SafeAreaView style={styles.screen} edges={['top']}>
    <AppHeader/>
    <ScrollView style={styles.scroll} contentContainerStyle={{paddingHorizontal:16,paddingBottom:118}}
      refreshControl={<RefreshControl refreshing={busy} onRefresh={()=>{void refresh().catch(()=>undefined);}} colors={[colors.primary]}/>}>
      {!!error&&<ErrorBanner message={error} onRetry={()=>{clearError();void refresh().catch(()=>undefined);}}/>}
      <SectionTitle title="Itens pendentes" count={pending.length} expanded={showPending}
        onPress={()=>setShowPending(v=>!v)}
        trailing={<Pressable onPress={()=>{if(paused){void resume().catch(e=>Alert.alert('Erro',String(e)));}else setSheet(true);}}
          style={styles.pause}><Ionicons name={paused?'play-circle-outline':'alarm-outline'} size={15} color={colors.ink}/>
          <Text style={styles.pauseText}>{paused?'Reativar':'Pausar'}</Text></Pressable>}/>
      {showPending && (pending.length ? pending.map(item=><ItemCard key={item.id} item={item}
        onToggle={()=>{void onToggle(item);}} onEdit={()=>router.push({pathname:'/item',params:{id:item.id}})}
        onRemove={()=>onRemove(item)} disabled={busy}/>) :
        <EmptyState title="Lista em dia!" subtitle="Adicione um produto para começar a planejar suas compras."/>)}
      <View style={{height:17}}/>
      <SectionTitle title="Comprados recentemente" count={completed.length} expanded={showCompleted}
        onPress={()=>setShowCompleted(v=>!v)} />
      {showCompleted&&completed.length>0&&completed.map(item=><ItemCard key={item.id} item={item}
        onToggle={()=>{void onToggle(item);}} onEdit={()=>router.push({pathname:'/item',params:{id:item.id}})}
        onRemove={()=>onRemove(item)} disabled={busy}/>)}
      {showCompleted&&completed.length===0&&<Text style={styles.emptyCompleted}>Nenhum item comprado recentemente.</Text>}
    </ScrollView>
    <Pressable style={styles.fab} accessibilityLabel="Adicionar item" onPress={()=>router.push('/item')}>
      <Ionicons name="add" color="#fff" size={28}/></Pressable>
    <SnoozeSheet visible={sheet} onClose={()=>setSheet(false)}/>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},scroll:{flex:1},
  sectionRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',minHeight:56},
  sectionTap:{flexDirection:'row',alignItems:'center',gap:6,flex:1},
  sectionTitle:{fontSize:15,color:colors.ink,fontWeight:'800'},
  count:{paddingVertical:4,paddingHorizontal:8,borderRadius:15,backgroundColor:colors.violetSoft},
  countText:{fontSize:11,color:'#475E88',fontWeight:'800'},
  pause:{height:32,paddingHorizontal:13,borderRadius:20,backgroundColor:colors.violetSoft,flexDirection:'row',alignItems:'center',gap:5},
  pauseText:{fontSize:12,color:colors.ink,fontWeight:'700'},
  emptyCompleted:{fontSize:12,color:colors.muted,paddingHorizontal:10,paddingVertical:14},
  fab:{position:'absolute',right:24,bottom:22,width:57,height:57,backgroundColor:colors.primary,borderRadius:30,
    alignItems:'center',justifyContent:'center',...shadow,shadowOpacity:.18,elevation:6},
});
