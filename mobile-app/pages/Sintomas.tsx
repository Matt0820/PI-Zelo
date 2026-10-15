/**
 * Tela de registro de sintomas.
 *
 * Mantém o histórico de como o paciente está se sentindo e facilita a coleta de
 * observações relevantes para que a equipe de cuidado acompanhe a evolução.
 */
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { GravidadeSintoma, Sintoma } from '../types';

type SintomasScreenProps = {
  sintomas: Sintoma[];
  onVoltar: () => void;
  onSalvar: (dados: Omit<Sintoma, 'id' | 'atualizadoEm'>) => Promise<Sintoma>;
};

const opcoesGravidade: Array<{ label: string; value: GravidadeSintoma }> = [
  { label: 'Leve', value: 'leve' },
  { label: 'Moderada', value: 'moderada' },
  { label: 'Grave', value: 'grave' },
];

export default function SintomasScreen({ sintomas, onVoltar, onSalvar }: SintomasScreenProps) {
  // A tela usa valores pré-populados para acelerar a entrada e reduzir fricção em
  // uso de rotina, mas o usuário pode alterar tudo ao salvar um novo registro.
  const [nome, setNome] = useState('Dor no corpo');
  const [gravidade, setGravidade] = useState<GravidadeSintoma>('moderada');
  const [momento, setMomento] = useState('Hoje pela manhã');
  const [observacao, setObservacao] = useState('Melhorou depois de descansar.');
  const [lista, setLista] = useState<Sintoma[]>(sintomas);

  useEffect(() => {
    setLista(sintomas);
  }, [sintomas]);

  async function registrarSintoma() {
    // O nome do sintoma é obrigatório para evitar registros inúteis ou ambíguos.
    if (!nome.trim()) {
      Alert.alert('Sintoma sem nome', 'Informe o sintoma que está sentindo.');
      return;
    }

    const dadosSintoma = {
      nome: nome.trim(),
      gravidade,
      momento: momento.trim() || 'Hoje',
      observacao: observacao.trim() || 'Sem observações adicionais.',
    };

    try {
      const novoSintoma = await onSalvar(dadosSintoma);
      setLista((atual) => [novoSintoma, ...atual]);
    } catch (error) {
      Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente em alguns instantes.');
      return;
    }

    setNome('');
    setMomento('');
    setObservacao('');
    setGravidade('moderada');
    Alert.alert('Sintoma registrado', 'O registro foi salvo na sua conta.');
  }

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'left', 'right']}>
      <View style={estilos.cabecalho}>
        <Pressable onPress={onVoltar} accessibilityRole="button">
          <Text style={estilos.botaoVoltar}>← Voltar</Text>
        </Pressable>
        <Text style={estilos.titulo}>Sintomas</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.card}>
          <Text style={estilos.rotulo}>Qual sintoma você está sentindo?</Text>
          <TextInput
            style={estilos.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Dor de cabeça"
            placeholderTextColor="#8A9890"
          />

          <Text style={estilos.rotulo}>Gravidade</Text>
          <View style={estilos.gradeOpcoes}>
            {opcoesGravidade.map((opcao) => {
              const ativa = opcao.value === gravidade;
              return (
                <Pressable
                  key={opcao.value}
                  onPress={() => setGravidade(opcao.value)}
                  style={[estilos.opcao, ativa && estilos.opcaoAtiva]}
                  accessibilityRole="button"
                >
                  <Text style={[estilos.textoOpcao, ativa && estilos.textoOpcaoAtivo]}>{opcao.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={estilos.rotulo}>Momento</Text>
          <TextInput
            style={estilos.input}
            value={momento}
            onChangeText={setMomento}
            placeholder="Ex: Hoje à noite"
            placeholderTextColor="#8A9890"
          />

          <Text style={estilos.rotulo}>Observações</Text>
          <TextInput
            style={[estilos.input, estilos.inputMultilinha]}
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Descreva como o sintoma está se manifestando"
            placeholderTextColor="#8A9890"
            multiline
            numberOfLines={4}
          />

          <Pressable style={estilos.botaoPrimario} onPress={registrarSintoma} accessibilityRole="button">
            <Text style={estilos.textoBotaoPrimario}>Salvar sintoma</Text>
          </Pressable>
        </View>

        <View style={estilos.listaSecao}>
          <Text style={estilos.subtitulo}>Registros recentes</Text>
          {lista.length === 0 ? (
            <Text style={estilos.vazio}>Ainda não há registros de sintomas.</Text>
          ) : (
            lista.map((item) => (
              <View key={item.id} style={estilos.itemLista}>
                <View style={estilos.itemCabecalho}>
                  <Text style={estilos.itemTitulo}>{item.nome}</Text>
                  <Text style={estilos.badge}>{item.gravidade}</Text>
                </View>
                <Text style={estilos.itemDetalhe}>{item.momento}</Text>
                <Text style={estilos.itemTexto}>{item.observacao}</Text>
              </View>
            ))
          )}
        </View>
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
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E0E8E2',
  },
  rotulo: {
    color: '#173D33',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F4F7F3',
    borderWidth: 1,
    borderColor: '#D8E1DB',
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#173D33',
    marginBottom: 8,
  },
  inputMultilinha: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  gradeOpcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  opcao: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F2F6F3',
    borderWidth: 1,
    borderColor: '#D8E1DB',
  },
  opcaoAtiva: {
    backgroundColor: '#174C3D',
    borderColor: '#174C3D',
  },
  textoOpcao: {
    color: '#173D33',
    fontWeight: '700',
    fontSize: 14,
  },
  textoOpcaoAtivo: {
    color: '#FFFFFF',
  },
  botaoPrimario: {
    backgroundColor: '#174C3D',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 18,
    alignItems: 'center',
  },
  textoBotaoPrimario: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  listaSecao: {
    gap: 12,
  },
  subtitulo: {
    color: '#173D33',
    fontSize: 20,
    fontWeight: '700',
  },
  vazio: {
    color: '#5C6D67',
    fontSize: 15,
    lineHeight: 22,
  },
  itemLista: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E8E2',
    padding: 16,
    gap: 6,
  },
  itemCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  itemTitulo: {
    color: '#173D33',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    color: '#174C3D',
    fontWeight: '700',
    fontSize: 11,
    backgroundColor: '#E9F3EF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  itemDetalhe: {
    color: '#5C6D67',
    fontSize: 13,
    fontWeight: '600',
  },
  itemTexto: {
    color: '#41534E',
    fontSize: 15,
    lineHeight: 22,
  },
});
