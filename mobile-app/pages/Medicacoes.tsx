/**
 * Tela de cadastro e visualização de medicações.
 *
 * O objetivo da tela é permitir registrar a rotina do paciente, controlar o
 * status de cada remédio e manter uma lista de acompanhamento diretamente no app.
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
import { useVisual, Palette } from '../visual';
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
  const { cores } = useVisual();
  const estilos = criarEstilos(cores);
  // Os dados iniciais vêm do estado global da aplicação, mas a tela também mantém
  // uma lista local para refletir inserções imediatamente sem recarregar a tela.
  const [nome, setNome] = useState('');
  const [dose, setDose] = useState('');
  const [horario, setHorario] = useState('');
  const [frequencia, setFrequencia] = useState('');
  const [observacao, setObservacao] = useState('');
  const [status, setStatus] = useState<StatusMedicacao>('agendada');
  const [lista, setLista] = useState<Medicacao[]>(medicacoes);

  useEffect(() => {
    setLista(medicacoes);
  }, [medicacoes]);

  async function registrarMedicacao() {
    // Validação mínima antes de salvar: um nome sempre precisa existir para evitar
    // registros vazios no histórico do paciente.
    if (!nome.trim()) {
      Alert.alert('Dados incompletos', 'Informe o nome da medicação.');
      return;
    }

    if (!dose.trim() || !horario.trim() || !frequencia.trim()) {
      Alert.alert('Dados incompletos', 'Informe dose, horário e frequência conforme a prescrição.');
      return;
    }

    const dadosMedicacao = {
      nome: nome.trim(),
      horario: horario.trim(),
      dose: dose.trim(),
      frequencia: frequencia.trim(),
      observacao: observacao.trim(),
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
            placeholderTextColor="#6E655C"
          />

          <Text style={estilos.rotulo}>Dose</Text>
          <TextInput
            style={estilos.input}
            value={dose}
            onChangeText={setDose}
            placeholder="Ex: 500mg"
            placeholderTextColor="#6E655C"
          />

          <Text style={estilos.rotulo}>Horário</Text>
          <TextInput
            style={estilos.input}
            value={horario}
            onChangeText={setHorario}
            placeholder="Ex: 08:00"
            placeholderTextColor="#6E655C"
          />

          <Text style={estilos.rotulo}>Frequência</Text>
          <TextInput
            style={estilos.input}
            value={frequencia}
            onChangeText={setFrequencia}
            placeholder="Ex: 1x ao dia"
            placeholderTextColor="#6E655C"
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
            placeholderTextColor="#6E655C"
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
    gap: 20,
  },
  card: {
    backgroundColor: cores.superficie,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  rotulo: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F3EFE9',
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: cores.texto,
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
    backgroundColor: '#F3EFE9',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  opcaoAtiva: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  textoOpcao: {
    color: cores.texto,
    fontWeight: '700',
    fontSize: 14,
  },
  textoOpcaoAtivo: {
    color: cores.superficie,
  },
  botaoPrimario: {
    backgroundColor: cores.primaria,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 18,
    alignItems: 'center',
  },
  textoBotaoPrimario: {
    color: cores.superficie,
    fontSize: 16,
    fontWeight: '700',
  },
  listaSecao: {
    gap: 12,
  },
  subtitulo: {
    color: cores.texto,
    fontSize: 20,
    fontWeight: '700',
  },
  vazio: {
    color: cores.textoLeve,
    fontSize: 15,
    lineHeight: 22,
  },
  itemLista: {
    backgroundColor: cores.superficie,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.borda,
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
    color: cores.texto,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    color: cores.primaria,
    fontWeight: '700',
    fontSize: 11,
    backgroundColor: cores.primariaClara,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: 'capitalize',
  },
  itemDetalhe: {
    color: cores.textoLeve,
    fontSize: 13,
    fontWeight: '600',
  },
  itemTexto: {
    color: cores.textoLeve,
    fontSize: 15,
    lineHeight: 22,
  },
});
}
