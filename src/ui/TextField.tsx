import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { colors } from '@/constants/theme';
interface Props extends TextInputProps {label:string; optional?:boolean;}
/** Campo de texto com rótulo e indicação opcional de preenchimento. */
export function TextField({label,optional,...props}:Props){
  return <View style={styles.wrapper}>
    <View style={styles.labelLine}><Text style={styles.label}>{label}</Text>
      {optional && <Text style={styles.optional}>Opcional</Text>}</View>
    <TextInput {...props} placeholderTextColor="#9CA5BA" style={[styles.input,props.style]}/>
  </View>;
}
const styles=StyleSheet.create({
  wrapper:{gap:7,marginBottom:15},labelLine:{flexDirection:'row',justifyContent:'space-between'},
  label:{fontWeight:'700',color:colors.ink,fontSize:12},optional:{fontSize:11,color:colors.muted},
  input:{backgroundColor:colors.violetSoft,height:47,borderRadius:10,paddingHorizontal:14,color:colors.ink,fontSize:14},
});
