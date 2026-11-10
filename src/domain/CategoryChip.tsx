import { Pressable, Text, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getCategory } from '@/constants/categories';
import { colors } from '@/constants/theme';
interface Props {category:string;selected?:boolean;onPress?:()=>void;compact?:boolean;}
export function CategoryChip({category,selected=false,onPress,compact=false}:Props){
  const info=getCategory(category);
  const iconName=info.icon as React.ComponentProps<typeof Ionicons>['name'];
  return <Pressable onPress={onPress} disabled={!onPress}
    style={[styles.chip,{backgroundColor:info.tint},selected&&styles.selected,compact&&styles.compact]}>
    {!compact&&<Ionicons name={iconName} size={14} color={info.ink}/>}<Text numberOfLines={1}
      style={[styles.text,{color:info.ink}]}>{category}</Text>
  </Pressable>;
}
const styles=StyleSheet.create({
  chip:{borderRadius:20,paddingHorizontal:12,paddingVertical:9,flexDirection:'row',gap:6,alignItems:'center',borderWidth:1.5,borderColor:'transparent'},
  selected:{borderColor:colors.primary},compact:{paddingVertical:4,paddingHorizontal:7},
  text:{fontSize:11,fontWeight:'700'},
});
