import type { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, View, Text } from 'react-native';
import { colors } from '@/constants/theme';
interface Props extends PropsWithChildren {visible:boolean;title:string;onClose:()=>void;}
export function BottomSheet({visible,title,onClose,children}:Props){
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar"/>
      <View style={styles.sheet}>
        <View style={styles.handle}/>
        <View style={styles.row}><Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={10}><Text style={styles.close}>✕</Text></Pressable></View>
        {children}
      </View>
    </View>
  </Modal>;
}
const styles=StyleSheet.create({
  backdrop:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(14,23,44,.45)'},
  sheet:{backgroundColor:colors.surface,borderTopLeftRadius:26,borderTopRightRadius:26,padding:20,paddingBottom:32},
  handle:{height:4,width:44,borderRadius:99,backgroundColor:'#D8DEEA',alignSelf:'center',marginBottom:20},
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:15},
  title:{fontSize:18,color:colors.ink,fontWeight:'800'},close:{fontSize:19,color:colors.muted},
});
