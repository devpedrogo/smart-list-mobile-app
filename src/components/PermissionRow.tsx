import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/theme';
interface Props {name:string;description:string;allowed:boolean;icon:React.ComponentProps<typeof Ionicons>['name'];}
export function PermissionRow({name,description,allowed,icon}:Props){
  return <View style={styles.row}>
    <View style={styles.icon}><Ionicons name={icon} size={18} color={colors.primary}/></View>
    <View style={{flex:1}}><Text style={styles.name}>{name}</Text><Text style={styles.description}>{description}</Text></View>
    <View style={[styles.pill,!allowed&&{backgroundColor:'#FFF0D5'}]}>
      <Text style={[styles.pillLabel,!allowed&&{color:'#975F00'}]}>{allowed?'Permitido':'Pendente'}</Text>
    </View>
  </View>;
}
const styles=StyleSheet.create({
  row:{flexDirection:'row',gap:9,alignItems:'center',paddingVertical:11},
  icon:{width:34,height:34,borderRadius:10,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},
  name:{fontSize:12,fontWeight:'700',color:colors.ink},description:{fontSize:10,color:colors.muted,marginTop:2},
  pill:{backgroundColor:colors.primarySoft,paddingVertical:4,paddingHorizontal:8,borderRadius:12},
  pillLabel:{fontSize:10,fontWeight:'800',color:colors.primary},
});
