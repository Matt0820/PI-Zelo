import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Orientacao } from '../types';

type OrientacoesScreenProps = {
  orientacoes: Orientacao[];
  onVoltar: () => void;
};

const prioridadeCor: Record<Orientacao['prioridade'], string> = {
  baixa: '#DCEBDF',
  media: '#F4E9D0',
  alta: '#F7D4D4',
};

const prioridadeTexto: Record<Orientacao['prioridade'], string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

export default function OrientacoesScreen({ orientacoes, onVoltar }: OrientacoesScreenProps) {
  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'left', 'right']}>
      <View style={estilos.cabecalho}>
        <Pressable onPress={onVoltar} accessibilityRole="button">
          <Text style={estilos.botaoVoltar}>← Voltar</Text>
        </Pressable>
        <Text style={estilos.titulo}>Orientações</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <Text style={estilos.introducao}>
          As orientações enviadas pela equipe aparecerão aqui.
        </Text>

        {orientacoes.map((item) => (
          <View key={item.id} style={estilos.card}>
            <View style={estilos.cardTopo}>
              <Text style={estilos.categoria}>{item.categoria}</Text>
              <View style={[estilos.prioridade, { backgroundColor: prioridadeCor[item.prioridade] }]}>
                <Text style={estilos.prioridadeTexto}>{prioridadeTexto[item.prioridade]}</Text>
              </View>
            </View>

            <Text style={estilos.cardTitulo}>{item.titulo}</Text>
            <Text style={estilos.cardDescricao}>{item.descricao}</Text>
            <Text style={estilos.atualizacao}>Atualizado em: {new Date(item.atualizadaEm).toLocaleString('pt-BR')}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F7F3',
  },
  cabecalho: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#174C3D',
  },
  botaoVoltar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
  conteudo: {
    padding: 20,
    gap: 16,
  },
  introducao: {
    color: '#536760',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E8E2',
    gap: 10,
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoria: {
    color: '#174C3D',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  prioridade: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  prioridadeTexto: {
    color: '#173D33',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitulo: {
    color: '#173D33',
    fontSize: 20,
    fontWeight: '700',
  },
  cardDescricao: {
    color: '#41534E',
    fontSize: 15,
    lineHeight: 22,
  },
  atualizacao: {
    color: '#5C6D67',
    fontSize: 12,
    fontWeight: '600',
  },
});
