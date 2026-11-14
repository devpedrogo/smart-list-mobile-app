import { View,Text,StyleSheet,Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/theme';
/** Apresenta uma mensagem amigável quando ainda não há conteúdo para mostrar. */
export function EmptyState({title,subtitle}: {title:string;subtitle:string}){
  return <View style={styles.empty}>
    <Ionicons name="basket-outline" color="#8299AD" size={36}/>
    <Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text>
  </View>;
}
/** Mostra um erro e permite tentar novamente ao tocar no aviso. */
export function ErrorBanner({message,onRetry}: {message:string;onRetry:()=>void}) {
  return <Pressable style={styles.error} onPress={onRetry}>
    <Ionicons name="alert-circle-outline" size={19} color={colors.red}/>
    <Text style={styles.errorText}>{message} Toque para tentar novamente.</Text>
  </Pressable>;
}
const styles=StyleSheet.create({
  empty:{padding:25,alignItems:'center',justifyContent:'center',gap:7},
  title:{fontWeight:'700',color:colors.ink,fontSize:15},subtitle:{fontSize:12,color:colors.muted,textAlign:'center'},
  error:{backgroundColor:'#FFF0F1',borderRadius:12,padding:12,flexDirection:'row',gap:8,alignItems:'center',marginBottom:12},
  errorText:{flex:1,fontSize:12,color:colors.red},
});
