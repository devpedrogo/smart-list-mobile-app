import { useEffect,useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, UNIT_SHORTCUTS } from '@/constants/categories';
import { colors } from '@/constants/theme';
import { CategoryChip } from '@/domain/CategoryChip';
import { UnitChip } from '@/domain/UnitChip';
import { TextField } from '@/ui/TextField';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { useAppStore,findItem } from '@/store/useAppStore';
/** Permite cadastrar um produto ou editar um item já existente na lista. */
export default function ItemForm(){
  const router=useRouter();
  const params=useLocalSearchParams<{id?:string}>();
  const existing=params.id?findItem(params.id):undefined;
  const [name,setName]=useState(existing?.name??'');
  const [quantity,setQuantity]=useState(existing?.quantity??'');
  const [category,setCategory]=useState(existing?.category??'Mercado');
  const [loading,setLoading]=useState(false);
  const add=useAppStore(s=>s.add);
  const edit=useAppStore(s=>s.edit);
  useEffect(()=>{
    if(existing){setName(existing.name);setQuantity(existing.quantity);setCategory(existing.category);}
  },[existing?.id]);
  const addUnit=(unit:string)=>setQuantity(q=>q.trimEnd()?`${q.trimEnd()} ${unit}`:unit);
  async function save(){
    if(!name.trim()){Alert.alert('Campo obrigatório','Digite o nome do produto.');return;}
    setLoading(true);
    const payload={name:name.trim(),quantity:quantity.trim(),category};
    try {if(existing)await edit(existing.id,payload);else await add(payload);router.back();}
    catch(e){Alert.alert('Erro ao salvar',e instanceof Error?e.message:'Tente novamente.');}
    finally{setLoading(false);}
  }
  return <SafeAreaView style={styles.screen} edges={['top','bottom']}>
    <View style={styles.header}>
      <Pressable onPress={()=>router.back()} accessibilityLabel="Voltar"><Ionicons name="arrow-back" size={24} color={colors.ink}/></Pressable>
      <Text style={styles.headerTitle}>{existing?'Editar Item':'Adicionar Item'}</Text>
      <View style={styles.avatar}><Ionicons name="person" size={15} color="#fff"/></View>
    </View>
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView contentContainerStyle={{padding:16,paddingBottom:30}} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.banner}><Ionicons name="navigate" size={15} color="#2873E7"/>
            <Text style={styles.bannerText}>Modo Compras: avisa ao sair de casa com itens pendentes</Text></View>
          <View style={styles.intro}>
            <View style={styles.plus}><Ionicons name="list" size={19} color={colors.primary}/></View>
            <View style={{flex:1}}><Text style={styles.formTitle}>{existing?'Editar produto':'Adicionar Item à Lista'}</Text>
              <Text style={styles.formDescription}>Lembrete inteligente com geolocalização</Text></View></View>
          <TextField label="Nome do produto" value={name} onChangeText={setName}
            placeholder="Ex: Arroz integral, Detergente..." autoCapitalize="sentences" maxLength={120}/>
          <TextField label="Quantidade" optional value={quantity} onChangeText={setQuantity}
            placeholder="Ex: 2 unidades, 1 kg, 500g" maxLength={80}/>
          <View style={styles.units}><Text style={styles.unitLabel}>Unidades:</Text>
            {UNIT_SHORTCUTS.map(u=><UnitChip key={u} label={u} onPress={()=>addUnit(u)}/>)}</View>
          <Text style={styles.groupTitle}>⚡ Adicionar tag ao item</Text>
          <View style={styles.categories}>{CATEGORIES.map(c=><CategoryChip key={c.label}
            category={c.label} selected={category===c.label} onPress={()=>setCategory(c.label)}/>)}</View>
          <PrimaryButton loading={loading} onPress={()=>{void save();}} style={{marginTop:24}}>▣ Salvar Item</PrimaryButton>
          <Pressable style={styles.cancel} onPress={()=>router.back()}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background},
  header:{height:62,paddingHorizontal:20,flexDirection:'row',gap:20,alignItems:'center',backgroundColor:colors.background},
  headerTitle:{flex:1,fontSize:17,fontWeight:'800',color:colors.ink},
  avatar:{backgroundColor:colors.primary,width:28,height:28,borderRadius:15,alignItems:'center',justifyContent:'center'},
  card:{backgroundColor:colors.surface,borderRadius:18,padding:16},
  banner:{flexDirection:'row',alignItems:'center',gap:9,padding:13,backgroundColor:'#EFF2FF',borderRadius:13,marginBottom:21},
  bannerText:{color:colors.ink,fontWeight:'600',fontSize:11,flex:1},
  intro:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:20},
  plus:{backgroundColor:colors.primarySoft,width:35,height:35,borderRadius:18,alignItems:'center',justifyContent:'center'},
  formTitle:{fontSize:17,fontWeight:'800',color:colors.ink},
  formDescription:{fontSize:10,color:colors.muted,marginTop:2},
  units:{flexDirection:'row',flexWrap:'wrap',gap:5,alignItems:'center',marginTop:-5,marginBottom:20},
  unitLabel:{fontSize:11,color:colors.muted,marginRight:3},
  groupTitle:{color:colors.ink,fontSize:12,fontWeight:'800',marginBottom:12},
  categories:{flexDirection:'row',gap:7,flexWrap:'wrap'},
  cancel:{alignItems:'center',paddingVertical:18},cancelText:{fontSize:13,color:colors.ink,fontWeight:'600'},
});
