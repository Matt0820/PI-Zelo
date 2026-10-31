/**
 * Tela de orientações do cuidado.
 *
 * Aqui as mensagens da equipe ficam organizadas por categoria e prioridade,
 * permitindo que o responsável veja rapidamente o que requer atenção.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVisual, Palette } from '../visual';
import type { Orientacao } from '../types';

type OrientacoesScreenProps = {
  orientacoes: Orientacao[];
  onVoltar: () => void;
};

const prioridadeCor: Record<Orientacao['prioridade'], string> = {
  baixa: '#EAF5EC',
  media: '#FEF8EC',
  alta: '#FDF2F0',
};

const prioridadeTexto: Record<Orientacao['prioridade'], string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

/**
 * Exibe orientações da API em formato de leitura mobile.
 */
export default function OrientacoesScreen({ orientacoes, onVoltar }: OrientacoesScreenProps) {
  const { cores } = useVisual();
  const estilos = criarEstilos(cores);
  // As orientações são exibidas como cartões, destacando nível de urgência e
  // contexto do cuidado para leitura rápida e entendimento do caso.
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

function criarEstilos(cores: Palette) { return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  cabecalho: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.primaria,
  },
  botaoVoltar: {
    color: cores.superficie,
    fontSize: 16,
    fontWeight: '700',
  },
  titulo: {
    color: cores.superficie,
    fontSize: 26,
    fontWeight: '700',
  },
  conteudo: {
    padding: 20,
    gap: 16,
  },
  introducao: {
    color: cores.textoLeve,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  card: {
    backgroundColor: cores.superficie,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: 10,
  },
  cardTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoria: {
    color: cores.primaria,
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
    color: cores.texto,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitulo: {
    color: cores.texto,
    fontSize: 20,
    fontWeight: '700',
  },
  cardDescricao: {
    color: cores.textoLeve,
    fontSize: 15,
    lineHeight: 22,
  },
  atualizacao: {
    color: cores.textoLeve,
    fontSize: 12,
    fontWeight: '600',
  },
});
}
