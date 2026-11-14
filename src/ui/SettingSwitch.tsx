import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
interface Props {label:string;description?:string;value:boolean;onValueChange:(v:boolean)=>void;disabled?:boolean;}
/** Exibe uma opção de configuração que pode ser ligada ou desligada. */
export function SettingSwitch({label,description,value,onValueChange,disabled}:Props){
  return <View style={styles.row}>
    <View style={{flex:1,paddingRight:12}}><Text style={styles.label}>{label}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}</View>
    <Switch accessibilityLabel={label} value={value} onValueChange={onValueChange} disabled={disabled}
      trackColor={{false:'#DCE1ED',true:'#A6DEC0'}} thumbColor={value?colors.primary:'#FFFFFF'}/>
  </View>;
}
const styles=StyleSheet.create({
  row:{flexDirection:'row',alignItems:'center',padding:14,minHeight:70},
  label:{color:colors.ink,fontSize:14,fontWeight:'700'},
  description:{fontSize:11,color:colors.muted,lineHeight:16,marginTop:3},
});
