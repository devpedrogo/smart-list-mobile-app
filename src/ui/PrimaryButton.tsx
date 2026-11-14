import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radii } from '@/constants/theme';
interface Props extends PropsWithChildren {
  onPress:()=>void; loading?:boolean; secondary?:boolean;
  disabled?:boolean; style?:ViewStyle;
}
/** Botão reutilizável que também mostra carregamento e aceita o estado desativado. */
export function PrimaryButton({children,onPress,loading=false,disabled=false,secondary=false,style}:Props){
  const inactive=disabled||loading;
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={inactive}
    style={[styles.base,secondary?styles.secondary:styles.primary,inactive&&styles.disabled,style]}>
    {loading ? <ActivityIndicator color={secondary?colors.primary:'#fff'}/> :
      <Text style={[styles.label,secondary&&styles.secondaryLabel]}>{children}</Text>}
  </Pressable>;
}
const styles=StyleSheet.create({
  base:{height:50,borderRadius:radii.sm,alignItems:'center',justifyContent:'center',paddingHorizontal:16},
  primary:{backgroundColor:colors.primary},secondary:{backgroundColor:colors.violetSoft},
  label:{fontSize:14,fontWeight:'800',color:'#fff'},secondaryLabel:{color:colors.ink},
  disabled:{opacity:0.55},
});
