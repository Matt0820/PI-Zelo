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
import type { Medicacao, StatusMedicacao } from '../types';

type MedicacoesScreenProps = {
  medicacoes: Medicacao[];
  onVoltar: () => void;
  onSalvar: (dados: Omit<Medicacao, 'id'>) => Promise<Medicacao>;
};

const statusOpcoes: Array<{ label: string; value: StatusMedicacao }> = [
  { label: 'Agendada', value: 'agendada' },
  { label: 'Tomada', value: 'tomada' },
  { label: 'Atrasada', value: 'atrasada' },
];

export default function MedicacoesScreen({ medicacoes, onVoltar, onSalvar }: MedicacoesScreenProps) {
  const [nome, setNome] = useState('Paracetamol');
  const [dose, setDose] = useState('500mg');
  const [horario, setHorario] = useState('08:00');
  const [frequencia, setFrequencia] = useState('1x ao dia');
  const [observacao, setObservacao] = useState('Tomar com água.');
  const [status, setStatus] = useState<StatusMedicacao>('agendada');
  const [lista, setLista] = useState<Medicacao[]>(medicacoes);

  useEffect(() => {
    setLista(medicacoes);
  }, [medicacoes]);

  async function registrarMedicacao() {
    if (!nome.trim()) {
      Alert.alert('Medicamento sem nome', 'Informe o nome da medicação.');
      return;
    }

    const dadosMedicacao = {
      nome: nome.trim(),
      horario: horario.trim() || '08:00',
      dose: dose.trim() || '1 dose',
      frequencia: frequencia.trim() || '1x ao dia',
      observacao: observacao.trim() || 'Sem observações adicionais.',
      status,
    };

    try {
      const novaMedicacao = await onSalvar(dadosMedicacao);
      setLista((atual) => [novaMedicacao, ...atual]);
    } catch (error) {
      Alert.alert('Não foi possível salvar', error instanceof Error ? error.message : 'Tente novamente em alguns instantes.');
      return;
    }

    setNome('');
    setDose('');
    setHorario('');
    setFrequencia('');
    setObservacao('');
    setStatus('agendada');
    Alert.alert('Medicação salva', 'O registro foi salvo na sua conta.');
  }

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'left', 'right']}>
      <View style={estilos.cabecalho}>
        <Pressable onPress={onVoltar} accessibilityRole="button">
          <Text style={estilos.botaoVoltar}>← Voltar</Text>
        </Pressable>
        <Text style={estilos.titulo}>Medicações</Text>
      </View>

      <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
        <View style={estilos.card}>
          <Text style={estilos.rotulo}>Nome da medicação</Text>
          <TextInput
            style={estilos.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Paracetamol"
            placeholderTextColor="#8A9890"
          />

          <Text style={estilos.rotulo}>Dose</Text>
          <TextInput
            style={estilos.input}
            value={dose}
            onChangeText={setDose}
            placeholder="Ex: 500mg"
            placeholderTextColor="#8A9890"
          />

          <Text style={estilos.rotulo}>Horário</Text>
          <TextInput
            style={estilos.input}
            value={horario}
            onChangeText={setHorario}
            placeholder="Ex: 08:00"
            placeholderTextColor="#8A9890"
          />

          <Text style={estilos.rotulo}>Frequência</Text>
          <TextInput
            style={estilos.input}
            value={frequencia}
            onChangeText={setFrequencia}
            placeholder="Ex: 1x ao dia"
            placeholderTextColor="#8A9890"
          />

          <Text style={estilos.rotulo}>Status</Text>
          <View style={estilos.gradeOpcoes}>
            {statusOpcoes.map((opcao) => {
              const ativa = opcao.value === status;
              return (
                <Pressable
                  key={opcao.value}
                  onPress={() => setStatus(opcao.value)}
                  style={[estilos.opcao, ativa && estilos.opcaoAtiva]}
                  accessibilityRole="button"
                >
                  <Text style={[estilos.textoOpcao, ativa && estilos.textoOpcaoAtivo]}>{opcao.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={estilos.rotulo}>Observações</Text>
          <TextInput
            style={[estilos.input, estilos.inputMultilinha]}
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Informações úteis para a tomada"
            placeholderTextColor="#8A9890"
            multiline
            numberOfLines={4}
          />

          <Pressable style={estilos.botaoPrimario} onPress={registrarMedicacao} accessibilityRole="button">
            <Text style={estilos.textoBotaoPrimario}>Salvar medicação</Text>
          </Pressable>
        </View>

        <View style={estilos.listaSecao}>
          <Text style={estilos.subtitulo}>Rotina de hoje</Text>
          {lista.length === 0 ? (
            <Text style={estilos.vazio}>Ainda não há medicações cadastradas.</Text>
          ) : (
            lista.map((item) => (
              <View key={item.id} style={estilos.itemLista}>
                <View style={estilos.itemCabecalho}>
                  <Text style={estilos.itemTitulo}>{item.nome}</Text>
                  <Text style={estilos.badge}>{item.status}</Text>
                </View>
                <Text style={estilos.itemDetalhe}>{item.dose} • {item.horario}</Text>
                <Text style={estilos.itemDetalhe}>{item.frequencia}</Text>
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
    textTransform: 'capitalize',
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
