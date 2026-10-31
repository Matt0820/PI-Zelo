/** Triagem guiada de dor baseada no fluxo existente no site do paciente. */
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { PainTriageData } from '../types';
import { useVisual, Palette } from '../visual';

const contatoHospice = 'tel:4130000000';

type Respostas = {
  sinaisEmergencia: boolean | null;
  caracteristica: PainTriageData['caracteristica'] | null;
  maisDeDuasSemanas: boolean | null;
  fezDoseResgate: boolean | null;
  medicamentosEfetivos: boolean | null;
  temSintomaAcompanhante: boolean | null;
  sintomaAcompanhanteDesc: string;
  temFatorPiora: boolean | null;
  fatorPioraDesc: string;
  emAcompanhamento: boolean | null;
  solicitouAgendamento: boolean | null;
};

const respostaInicial: Respostas = {
  sinaisEmergencia: null, caracteristica: null, maisDeDuasSemanas: null,
  fezDoseResgate: null, medicamentosEfetivos: null, temSintomaAcompanhante: null,
  sintomaAcompanhanteDesc: '', temFatorPiora: null, fatorPioraDesc: '',
  emAcompanhamento: null, solicitouAgendamento: null,
};

type Props = {
  intensidadeDor: number;
  onVoltar: () => void;
  onSalvar: (dados: PainTriageData) => Promise<void>;
};

let styles: ReturnType<typeof criarStyles>;

/**
 * Conduz respostas de triagem e as devolve ao App para envio.
 */
export default function TriagemDorScreen({ intensidadeDor, onVoltar, onSalvar }: Props) {
  const { cores } = useVisual();
  styles = criarStyles(cores);
  const [etapa, setEtapa] = useState(0);
  const [respostas, setRespostas] = useState<Respostas>(respostaInicial);
  const [salvando, setSalvando] = useState(false);
  const [salva, setSalva] = useState(false);

  function mudar<K extends keyof Respostas>(campo: K, valor: Respostas[K]) {
    setRespostas((atuais) => ({ ...atuais, [campo]: valor }));
  }

  function voltar() {
    if (etapa > 0) setEtapa(etapa - 1);
    else onVoltar();
  }

  function respostaBinaria(campo: keyof Respostas, sim: boolean) {
    mudar(campo, sim as never);
    if (campo === 'sinaisEmergencia' && sim) {
      setEtapa(11);
      return;
    }
    setEtapa((atual) => atual + 1);
  }

  async function concluir() {
    const camposObrigatorios: Array<keyof Respostas> = [
      'caracteristica', 'maisDeDuasSemanas', 'fezDoseResgate', 'medicamentosEfetivos',
      'temSintomaAcompanhante', 'temFatorPiora', 'emAcompanhamento', 'solicitouAgendamento',
    ];
    if (camposObrigatorios.some((campo) => respostas[campo] === null)) {
      Alert.alert('Triagem incompleta', 'Responda às perguntas antes de concluir.');
      return;
    }

    setSalvando(true);
    try {
      await onSalvar({
        intensidadeDor,
        caracteristica: respostas.caracteristica!,
        maisDeDuasSemanas: respostas.maisDeDuasSemanas!,
        fezDoseResgate: respostas.fezDoseResgate!,
        medicamentosEfetivos: respostas.medicamentosEfetivos!,
        emAcompanhamento: respostas.emAcompanhamento!,
        temSintomaAcompanhante: respostas.temSintomaAcompanhante!,
        sintomaAcompanhanteDesc: respostas.sintomaAcompanhanteDesc.trim() || undefined,
        temFatorPiora: respostas.temFatorPiora!,
        fatorPioraDesc: respostas.fatorPioraDesc.trim() || undefined,
        solicitouAgendamento: respostas.solicitouAgendamento!,
      });
      setSalva(true);
    } catch (error) {
      Alert.alert('Não foi possível concluir', error instanceof Error ? error.message : 'Tente novamente em alguns instantes.');
    } finally {
      setSalvando(false);
    }
  }

  const tituloEtapa = [
    'Sinais de alarme', 'Característica da dor', 'Duração da dor', 'Dose de resgate',
    'Efeito dos medicamentos', 'Outros sintomas', 'Fatores de piora',
    'Acompanhamento', 'Medidas de conforto', 'Contato com a equipe', 'Triagem registrada', 'Sinal de alarme',
  ][etapa];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={etapa === 11 ? onVoltar : voltar} accessibilityRole="button"><Text style={styles.back}>‹ Voltar</Text></Pressable>
        <Text style={styles.headerLabel}>DIRECIONAMENTO DE CUIDADO · DOR {intensidadeDor}/10</Text>
        <Text style={styles.headerTitle}>{tituloEtapa}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.safetyBox} accessibilityRole="alert">
          <Text style={styles.safetyTitle}>Aviso de segurança</Text>
          <Text style={styles.bodyText}>Em caso de sinais de alarme médico grave, procure atendimento presencial imediato.</Text>
        </View>

        {etapa === 0 ? (
          <View style={styles.card}>
            <Text style={styles.question}>Aconteceu alguma destas situações urgentes agora?</Text>
            <Text style={styles.bodyText}>• Queda ou suspeita de osso quebrado hoje?{"\n"}• Perda de movimentos ou sensibilidade nas pernas e pés?{"\n"}• Sonolência profunda ou difícil de acordar após ingerir morfina?</Text>
            <Option label="Não aconteceu nenhuma dessas" onPress={() => respostaBinaria('sinaisEmergencia', false)} />
            <Option label="Sim, aconteceu uma situação urgente" danger onPress={() => respostaBinaria('sinaisEmergencia', true)} />
            {respostas.sinaisEmergencia ? (
              <View style={styles.dangerBox}>
                <Text style={styles.dangerTitle}>Procure atendimento presencial imediato.</Text>
                <Text style={styles.bodyText}>Devido à presença de sinais de alerta clínico, é necessária avaliação médica e de enfermagem presencial.</Text>
                <Pressable style={styles.dangerButton} onPress={() => Linking.openURL(contatoHospice)} accessibilityRole="button"><Text style={styles.primaryButtonText}>Ligar para a central do Hospice</Text></Pressable>
              </View>
            ) : null}
          </View>
        ) : etapa === 1 ? (
          <View style={styles.card}>
            <Text style={styles.question}>Qual opção descreve melhor a sensação da sua dor?</Text>
            <Option label="Somática — pontada, aperto ou facada em um ponto" onPress={() => { mudar('caracteristica', 'somatica'); setEtapa(2); }} />
            <Option label="Neuropática — choque, queimação ou formigamento" onPress={() => { mudar('caracteristica', 'neuropatica'); setEtapa(2); }} />
            <Option label="Visceral — espalhada na barriga ou sensação de cólica" onPress={() => { mudar('caracteristica', 'visceral'); setEtapa(2); }} />
            <Option label="Nenhuma das opções acima" onPress={() => { mudar('caracteristica', 'nenhuma'); setEtapa(2); }} />
          </View>
        ) : etapa === 2 ? (
          <BinaryCard question="Sua dor começou há mais de duas semanas?" yes="Sim, há mais de duas semanas" no="Não, começou recentemente" onSelect={(v) => respostaBinaria('maisDeDuasSemanas', v)} />
        ) : etapa === 3 ? (
          <BinaryCard question="Você já fez uso da dose de resgate prescrita para dor forte hoje?" yes="Sim, já usei a dose de resgate" no="Não usei a dose de resgate" onSelect={(v) => respostaBinaria('fezDoseResgate', v)} />
        ) : etapa === 4 ? (
          <BinaryCard question="Seus medicamentos estão sendo efetivos na maior parte do dia?" yes="Sim, estão sendo efetivos" no="Não estão controlando adequadamente" onSelect={(v) => respostaBinaria('medicamentosEfetivos', v)} />
        ) : etapa === 5 ? (
          <View style={styles.card}>
            <Text style={styles.question}>Além da dor, há outro sintoma que a acompanha?</Text>
            <Option label="Sim" onPress={() => mudar('temSintomaAcompanhante', true)} selected={respostas.temSintomaAcompanhante === true} />
            <Option label="Não" onPress={() => { mudar('temSintomaAcompanhante', false); mudar('sintomaAcompanhanteDesc', ''); }} selected={respostas.temSintomaAcompanhante === false} />
            {respostas.temSintomaAcompanhante ? <TextInput style={styles.input} value={respostas.sintomaAcompanhanteDesc} onChangeText={(v) => mudar('sintomaAcompanhanteDesc', v)} placeholder="Qual sintoma? (opcional)" placeholderTextColor={cores.textoLeve} /> : null}
            <Continue disabled={respostas.temSintomaAcompanhante === null} onPress={() => setEtapa(6)} />
          </View>
        ) : etapa === 6 ? (
          <View style={styles.card}>
            <Text style={styles.question}>Percebeu algo que aumenta ou piora a dor?</Text>
            <Option label="Sim" onPress={() => mudar('temFatorPiora', true)} selected={respostas.temFatorPiora === true} />
            <Option label="Não" onPress={() => { mudar('temFatorPiora', false); mudar('fatorPioraDesc', ''); }} selected={respostas.temFatorPiora === false} />
            {respostas.temFatorPiora ? <TextInput style={styles.input} value={respostas.fatorPioraDesc} onChangeText={(v) => mudar('fatorPioraDesc', v)} placeholder="O que piora a dor? (opcional)" placeholderTextColor={cores.textoLeve} /> : null}
            <Continue disabled={respostas.temFatorPiora === null} onPress={() => setEtapa(7)} />
          </View>
        ) : etapa === 7 ? (
          <BinaryCard question="Você já está em acompanhamento com a equipe especializada?" yes="Sim, estou em acompanhamento" no="Não" onSelect={(v) => respostaBinaria('emAcompanhamento', v)} />
        ) : etapa === 8 ? (
          <View style={styles.card}>
            <Text style={styles.question}>Medidas de conforto e autocuidado domiciliar</Text>
            <Text style={styles.bodyText}>• Mantenha o ambiente calmo e uma posição confortável.{"\n"}• Pratique respirações suaves e lentas com o familiar cuidador.{"\n"}• Use música acolhedora, leitura ou conversa tranquila.{"\n"}• Ofereça presença e apoio emocional.</Text>
            <Continue onPress={() => setEtapa(9)} label="Continuar" />
          </View>
        ) : etapa === 9 ? (
          <BinaryCard question="Deseja solicitar agendamento ou retorno telefônico prioritário da equipe?" yes="Sim, solicitar contato da equipe" no="Não, vou aguardar" onSelect={(v) => { mudar('solicitouAgendamento', v); setEtapa(10); }} />
        ) : etapa === 11 ? (
          <View style={styles.dangerBox}>
            <Text style={styles.dangerTitle}>Procure atendimento presencial imediato.</Text>
            <Text style={styles.bodyText}>A triagem foi interrompida após a indicação de um sinal de alarme, conforme o fluxo do site.</Text>
            <Pressable style={styles.dangerButton} onPress={() => Linking.openURL(contatoHospice)} accessibilityRole="button"><Text style={styles.primaryButtonText}>Ligar para a central do Hospice</Text></Pressable>
            <Continue onPress={onVoltar} label="Voltar ao início" />
          </View>
        ) : etapa === 10 && salva ? (
          <View style={styles.card}>
            <Text style={styles.successTitle}>Triagem registrada</Text>
            <Text style={styles.bodyText}>{respostas.solicitouAgendamento ? 'Sua solicitação de contato foi registrada para a equipe.' : 'Suas respostas foram registradas para acompanhamento.'}</Text>
            <Pressable style={styles.primaryButton} onPress={() => Linking.openURL(contatoHospice)} accessibilityRole="button"><Text style={styles.primaryButtonText}>Ligar para a central do Hospice</Text></Pressable>
            <Continue onPress={onVoltar} label="Voltar ao início" />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.question}>Confira as respostas da triagem.</Text>
            <Text style={styles.bodyText}>A dor foi registrada como {intensidadeDor}/10. Ao concluir, as respostas serão enviadas à equipe.</Text>
            <Pressable style={[styles.primaryButton, salvando && styles.disabled]} onPress={concluir} disabled={salvando} accessibilityRole="button"><Text style={styles.primaryButtonText}>{salvando ? 'Enviando…' : 'Concluir e registrar triagem'}</Text></Pressable>
          </View>
        )}
        {etapa > 0 && etapa < 10 ? <Pressable style={styles.backButton} onPress={voltar} accessibilityRole="button"><Text style={styles.backButtonText}>Voltar à pergunta anterior</Text></Pressable> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Option({ label, onPress, danger = false, selected = false }: { label: string; onPress: () => void; danger?: boolean; selected?: boolean }) {
  return <Pressable style={[styles.option, danger && styles.optionDanger, selected && styles.optionSelected]} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}><Text style={[styles.optionText, danger && styles.optionDangerText, selected && styles.optionSelectedText]}>{label}</Text></Pressable>;
}

function Continue({ onPress, label = 'Continuar', disabled = false }: { onPress: () => void; label?: string; disabled?: boolean }) {
  return <Pressable style={[styles.primaryButton, disabled && styles.disabled]} onPress={onPress} disabled={disabled} accessibilityRole="button"><Text style={styles.primaryButtonText}>{label}</Text></Pressable>;
}

function BinaryCard({ question, yes, no, onSelect }: { question: string; yes: string; no: string; onSelect: (value: boolean) => void }) {
  return <View style={styles.card}><Text style={styles.question}>{question}</Text><Option label={yes} onPress={() => onSelect(true)} /><Option label={no} onPress={() => onSelect(false)} /></View>;
}

function criarStyles(cores: Palette) { return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.fundo },
  header: { backgroundColor: cores.primaria, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, gap: 7 },
  back: { color: cores.textoInverse, fontSize: 16, fontWeight: '700' },
  headerLabel: { color: '#EAF5EC', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  headerTitle: { color: cores.textoInverse, fontSize: 22, fontWeight: '800' },
  content: { padding: 20, gap: 14, paddingBottom: 36 },
  card: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, borderRadius: 12, padding: 18, gap: 12 },
  safetyBox: { backgroundColor: cores.perigoFundo, borderWidth: 2, borderColor: cores.perigo, borderRadius: 12, padding: 16, gap: 6 },
  safetyTitle: { color: cores.perigo, fontSize: 16, fontWeight: '800' },
  question: { color: cores.texto, fontSize: 18, lineHeight: 26, fontWeight: '800' },
  bodyText: { color: cores.textoSecundario, fontSize: 15, lineHeight: 23 },
  option: { minHeight: 56, borderWidth: 2, borderColor: cores.primaria, backgroundColor: cores.superficie, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center' },
  optionText: { color: cores.primaria, fontSize: 16, fontWeight: '800' },
  optionDanger: { borderColor: cores.perigo },
  optionDangerText: { color: cores.perigo },
  optionSelected: { backgroundColor: cores.primaria },
  optionSelectedText: { color: cores.textoInverse },
  dangerBox: { padding: 14, backgroundColor: cores.perigoFundo, borderWidth: 1, borderColor: cores.perigo, borderRadius: 10, gap: 8 },
  dangerTitle: { color: cores.perigo, fontSize: 17, fontWeight: '800' },
  dangerButton: { minHeight: 54, backgroundColor: cores.perigo, borderRadius: 8, alignItems: 'center', justifyContent: 'center', padding: 12 },
  primaryButton: { minHeight: 56, backgroundColor: cores.primaria, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryButtonText: { color: cores.textoInverse, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  successTitle: { color: cores.sucesso, fontSize: 19, fontWeight: '800' },
  input: { minHeight: 70, borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: 12, color: cores.texto, fontSize: 16 },
  backButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  backButtonText: { color: cores.textoSecundario, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.55 },
});
}
