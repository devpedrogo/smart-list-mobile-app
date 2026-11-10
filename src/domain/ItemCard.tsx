import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ShoppingItem } from '@/types/shopping';
import { CategoryChip } from '@/domain/CategoryChip';
import { colors } from '@/constants/theme';
interface Props {item:ShoppingItem;onToggle:()=>void;onEdit:()=>void;onRemove:()=>void;disabled?:boolean;}
export function ItemCard({item,onToggle,onEdit,onRemove,disabled}:Props){
  return <View style={styles.card}>
    <Pressable accessibilityRole="checkbox" accessibilityState={{checked:item.completed}}
      accessibilityLabel={`Marcar ${item.name}`} disabled={disabled} onPress={onToggle}
      style={[styles.checkbox,item.completed&&styles.checked]}>
      {item.completed&&<Ionicons name="checkmark" size={15} color="#fff"/>}
    </Pressable>
    <Pressable onPress={onEdit} style={{flex:1,gap:4}}>
      <Text numberOfLines={2} style={[styles.name,item.completed&&styles.finished]}>{item.name}</Text>
      <View style={styles.meta}>{!!item.quantity&&<Text style={styles.quantity}>{item.quantity}</Text>}
        <CategoryChip category={item.category} compact/></View>
    </Pressable>
    <Pressable onPress={onRemove} accessibilityLabel={`Excluir ${item.name}`} hitSlop={9}>
      <Ionicons name="ellipsis-vertical" size={20} color={colors.ink}/>
    </Pressable>
  </View>;
}
const styles=StyleSheet.create({
  card:{minHeight:76,backgroundColor:'#fff',borderRadius:14,paddingHorizontal:12,paddingVertical:15,
    flexDirection:'row',alignItems:'center',gap:12,marginBottom:9,borderWidth:1,borderColor:'#F0F0F4'},
  checkbox:{width:23,height:23,borderRadius:7,backgroundColor:colors.violetSoft,alignItems:'center',justifyContent:'center'},
  checked:{backgroundColor:'#63AA86'},name:{fontSize:14,fontWeight:'700',color:colors.ink},
  finished:{textDecorationLine:'line-through',color:'#9296A0',fontWeight:'500'},
  meta:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:6},quantity:{fontSize:11,color:'#586377'},
});
