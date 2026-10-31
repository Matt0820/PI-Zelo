/**
 * Apresenta preferências visuais e opções de configuração do app.
 */

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PALETAS, useVisual, VisualMode } from '../visual';

const escolhas:{id:VisualMode;titulo:string;texto:string}[]=[
 {id:'claro',titulo:'Claro',texto:'Aparência clara da identidade Zelo.'},{id:'escuro',titulo:'Escuro',texto:'Reduz o brilho em ambientes com pouca luz.'},{id:'alto-contraste',titulo:'Alto contraste',texto:'Realça texto, bordas e controles.'},{id:'protanopia',titulo:'Daltonismo · protanopia',texto:'Paleta ajustada para dificuldade com tons vermelhos.'},{id:'deuteranopia',titulo:'Daltonismo · deuteranopia',texto:'Paleta ajustada para dificuldade com tons verdes.'},{id:'tritanopia',titulo:'Daltonismo · tritanopia',texto:'Paleta ajustada para dificuldade com tons azuis e amarelos.'},
];
/**
 * Apresenta modo visual e preferências do app.
 */
export default function Configuracoes({onVoltar}:{onVoltar:()=>void}){
 const {modo,setModo}=useVisual();const c=PALETAS[modo];const s=StyleSheet.create({safe:{flex:1,backgroundColor:c.fundo},header:{backgroundColor:c.primaria,padding:18,gap:8},back:{color:c.textoInverse,fontSize:16,fontWeight:'700'},title:{color:c.textoInverse,fontSize:24,fontWeight:'800'},content:{maxWidth:620,width:'100%',alignSelf:'center',padding:20,gap:12},intro:{color:c.textoSecundario,fontSize:15,lineHeight:22,marginBottom:4},card:{padding:15,borderRadius:12,borderWidth:1,borderColor:c.borda,backgroundColor:c.superficie,flexDirection:'row',gap:12,alignItems:'center'},selected:{borderWidth:2,borderColor:c.primaria,backgroundColor:c.primariaClara},radio:{height:22,width:22,borderRadius:12,borderWidth:2,borderColor:c.borda,alignItems:'center',justifyContent:'center'},radioOn:{backgroundColor:c.primaria,borderColor:c.primaria},dot:{height:8,width:8,borderRadius:5,backgroundColor:c.textoInverse},name:{color:c.texto,fontSize:16,fontWeight:'800'},desc:{color:c.textoSecundario,fontSize:13,lineHeight:18,marginTop:3},hint:{fontSize:13,lineHeight:19,color:c.textoSecundario,marginTop:8}});
 return <SafeAreaView style={s.safe} edges={['top','left','right']}><View style={s.header}><Pressable onPress={onVoltar} accessibilityRole="button"><Text style={s.back}>‹ Voltar</Text></Pressable><Text style={s.title}>Ajustes visuais</Text></View><ScrollView contentContainerStyle={s.content}><Text style={s.intro}>Escolha como prefere visualizar o Zelo. A opção fica salva neste dispositivo e pode ser alterada quando quiser.</Text>{escolhas.map(o=><Pressable key={o.id} onPress={()=>setModo(o.id)} accessibilityRole="radio" accessibilityState={{selected:modo===o.id}} style={[s.card,modo===o.id&&s.selected]}><View style={[s.radio,modo===o.id&&s.radioOn]}>{modo===o.id&&<View style={s.dot}/>}</View><View style={{flex:1}}><Text style={s.name}>{o.titulo}</Text><Text style={s.desc}>{o.texto}</Text></View></Pressable>)}<Text style={s.hint}>Os modos para daltonismo alteram as cores de destaque e mantêm rótulos e valores numéricos para que a informação não dependa apenas da cor.</Text></ScrollView></SafeAreaView>;
}
