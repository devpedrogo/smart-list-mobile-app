import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
interface Props {label:string;onPress:()=>void;}
export function UnitChip({label,onPress}:Props){
  return <Pressable onPress={onPress} style={styles.chip}>
    <Text style={styles.text}>{label}</Text>
  </Pressable>;
}
const styles=StyleSheet.create({
  chip:{paddingHorizontal:11,paddingVertical:7,backgroundColor:colors.violetSoft,borderRadius:20},
  text:{color:'#46577B',fontSize:12,fontWeight:'700'},
});
