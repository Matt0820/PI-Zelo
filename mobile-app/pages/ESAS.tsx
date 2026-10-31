/** Avaliação ESAS guiada, seguindo o fluxo do site do paciente. */
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ESASAssessment } from '../types';
import { useVisual, Palette } from '../visual';

type ESASKey = 'dor' | 'cansaco' | 'nausea' | 'depressao' | 'ansiedade' | 'sonolencia' | 'apetite' | 'mal_estar' | 'falta_de_ar' | 'constipacao';
type ESASDraft = Record<ESASKey, number | null>;

const perguntas: Array<{ key: ESASKey; titulo: string; pergunta: string; zero: string; dez: string }> = [
  { key: 'dor', titulo: 'Dor', pergunta: 'Indique o número que melhor descreve a intensidade da sua dor neste momento.', zero: 'Sem dor', dez: 'Pior dor possível' },
  { key: 'cansaco', titulo: 'Cansaço / Fadiga', pergunta: 'Como está seu nível de cansaço ou fraqueza física agora?', zero: 'Sem cansaço', dez: 'Pior cansaço possível' },
  { key: 'nausea', titulo: 'Náusea / Enjoo', pergunta: 'Você está sentindo enjoo ou vontade de vomitar hoje?', zero: 'Sem náusea', dez: 'Pior náusea' },
  { key: 'depressao', titulo: 'Tristeza / Depressão', pergunta: 'Como você avalia o sentimento de tristeza ou desânimo hoje?', zero: 'Sem tristeza', dez: 'Pior tristeza possível' },
  { key: 'ansiedade', titulo: 'Ansiedade / Agitação', pergunta: 'Como você sente seu estado de calma ou ansiedade neste momento?', zero: 'Sem ansiedade', dez: 'Pior ansiedade' },
  { key: 'sonolencia', titulo: 'Sonolência', pergunta: 'Como avalia a vontade de dormir ou sonolência durante o dia?', zero: 'Sem sono excessivo', dez: 'Pior sonolência' },
  { key: 'apetite', titulo: 'Falta de apetite', pergunta: 'Como foi a alimentação e a vontade de comer nas últimas refeições?', zero: 'Bom apetite', dez: 'Pior falta de apetite' },
  { key: 'mal_estar', titulo: 'Sensação de mal-estar', pergunta: 'De maneira geral, como você sente o seu corpo hoje?', zero: 'Bem-estar pleno', dez: 'Pior mal-estar' },
  { key: 'falta_de_ar', titulo: 'Falta de ar / Dispneia', pergunta: 'Você tem sentido cansaço ao respirar ou falta de ar em repouso?', zero: 'Sem falta de ar', dez: 'Pior falta de ar' },
  { key: 'constipacao', titulo: 'Intestino preso / Constipação', pergunta: 'Como avalia a dificuldade para evacuar nas últimas 24 horas?', zero: 'Hábito intestinal normal', dez: 'Pior constipação possível' },
];

const inicial: ESASDraft = {
  dor: null, cansaco: null, nausea: null, depressao: null, ansiedade: null,
  sonolencia: null, apetite: null, mal_estar: null, falta_de_ar: null, constipacao: null,
};

type ESASScreenProps = {
  onVoltar: () => void;
  onSalvar: (dados: Omit<ESASAssessment, 'id' | 'dataRegistro' | 'acionouTriagem'>) => Promise<ESASAssessment>;
  onAbrirTriagem: (intensidadeDor: number) => void;
};

export default function ESASScreen({ onVoltar, onSalvar, onAbrirTriagem }: ESASScreenProps) {
  const { cores } = useVisual();
  const styles = criarStyles(cores);
  const [respostas, setRespostas] = useState<ESASDraft>(inicial);
  const [etapa, setEtapa] = useState(0);
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [concluida, setConcluida] = useState(false);
  const [dorGrave, setDorGrave] = useState(false);
  const [registroGrave, setRegistroGrave] = useState(false);

  const maxima = Math.max(...Object.values(respostas).map((v) => v ?? 0));
  const temGravidadeAlta = maxima >= 7;
  const pergunta = perguntas[etapa];

  function selecionarNota(nota: number) {
    setRespostas((atuais) => ({ ...atuais, [pergunta.key]: nota }));
  }

  function sairDoRegistro() {
    const temRespostas = Object.values(respostas).some((valor) => valor !== null);
    if (!temRespostas) {
      onVoltar();
      return;
    }
    Alert.alert('Sair sem concluir?', 'As respostas desta avaliação serão descartadas.', [
      { text: 'Continuar respondendo', style: 'cancel' },
      { text: 'Sair e descartar', style: 'destructive', onPress: onVoltar },
    ]);
  }

  function voltarEtapa() {
    if (etapa > 0) setEtapa(etapa - 1);
    else sairDoRegistro();
  }

  function continuar() {
    if (respostas[pergunta.key] === null) {
      Alert.alert('Selecione uma nota', 'Escolha um número de 0 a 10 para continuar.');
      return;
    }
    if (etapa < perguntas.length - 1) setEtapa(etapa + 1);
    else setEtapa(perguntas.length);
  }

  async function salvar() {
    if (Object.values(respostas).some((valor) => valor === null)) {
      Alert.alert('Avaliação incompleta', 'Responda aos dez sintomas antes de enviar.');
      return;
    }
    setSalvando(true);
    try {
      await onSalvar({
        dor: respostas.dor!, cansaco: respostas.cansaco!, nausea: respostas.nausea!,
        depressao: respostas.depressao!, ansiedade: respostas.ansiedade!, sonolencia: respostas.sonolencia!,
        apetite: respostas.apetite!, mal_estar: respostas.mal_estar!, falta_de_ar: respostas.falta_de_ar!,
        constipacao: respostas.constipacao!, observacao: observacao.trim(),
      });
      setDorGrave(respostas.dor! >= 7);
      setRegistroGrave(temGravidadeAlta);
      setConcluida(true);
    } catch (error) {
      Alert.alert('Não foi possível enviar', error instanceof Error ? error.message : 'Tente novamente em alguns instantes.');
    } finally {
      setSalvando(false);
    }
  }

  if (concluida) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerLabel}>AVALIAÇÃO ESAS</Text>
          <Text style={styles.headerTitle}>Registro enviado</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, registroGrave && styles.dangerCard]}>
            <Text style={styles.cardTitle}>{registroGrave ? 'Há um sintoma em intensidade alta.' : 'Sua avaliação foi registrada.'}</Text>
            <Text style={styles.bodyText}>
              {dorGrave
                ? 'A avaliação de dor intensa foi registrada e a equipe foi notificada. Continue para a triagem guiada de dor ou ligue para a central do Hospice.'
                : registroGrave
                  ? 'A avaliação foi salva. Entre em contato com sua equipe de cuidado para orientação sobre os sintomas.'
                  : 'Suas respostas foram salvas para acompanhamento pela equipe de cuidado.'}
            </Text>
            {dorGrave ? (
              <Pressable style={styles.primaryButton} onPress={() => onAbrirTriagem(respostas.dor!)} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Continuar para a triagem da dor</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.secondaryButton} onPress={onVoltar} accessibilityRole="button">
              <Text style={styles.secondaryButtonText}>Voltar ao início</Text>
            </Pressable>
          </View>
          <Text style={styles.notice}>Se precisar de apoio imediato, entre em contato com a equipe responsável.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={voltarEtapa} accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={styles.back}>‹ Voltar</Text>
        </Pressable>
        <Text style={styles.headerLabel}>REGISTRAR SINTOMAS · ESAS</Text>
        <Text style={styles.headerTitle}>{etapa < perguntas.length ? pergunta.titulo : 'Revise suas respostas'}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {etapa < perguntas.length ? (
          <>
            <View style={styles.stepRow}>
              <Text style={styles.stepText}>Passo {etapa + 1} de {perguntas.length}</Text>
              <Text style={styles.stepText}>ESAS</Text>
            </View>
            <View style={styles.progressTrack}>
              {perguntas.map((item, index) => <View key={item.key} style={[styles.progressTick, index <= etapa && styles.progressTickActive]} />)}
            </View>
            <View style={styles.card}>
              <Text style={styles.question}>{pergunta.pergunta}</Text>
              <View style={styles.scaleGroups} accessibilityRole="radiogroup">
                {[{ titulo: '0 a 5', notas: [0, 1, 2, 3, 4, 5] }, { titulo: '6 a 10', notas: [6, 7, 8, 9, 10] }].map((grupo) => (
                  <View key={grupo.titulo} style={styles.scaleGroup}>
                    <Text style={styles.scaleGroupLabel}>{grupo.titulo}</Text>
                    <View style={styles.scaleRow}>
                      {grupo.notas.map((nota) => (
                        <Pressable
                          key={nota}
                          onPress={() => selecionarNota(nota)}
                          style={[styles.scaleButton, respostas[pergunta.key] === nota && styles.scaleSelected]}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: respostas[pergunta.key] === nota }}
                          accessibilityLabel={`${nota} de 10`}
                        >
                          <Text style={[styles.scaleText, respostas[pergunta.key] === nota && styles.scaleTextSelected]}>{nota}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.scaleLabels}>
                <Text style={styles.scaleLabel}>0 · {pergunta.zero}</Text>
                <Text style={[styles.scaleLabel, styles.scaleRight]}>10 · {pergunta.dez}</Text>
              </View>
              {respostas[pergunta.key] !== null ? (
                <View style={styles.selectionFeedback}><Text style={styles.selectionText}>Selecionado: {respostas[pergunta.key]} de 10</Text></View>
              ) : null}
            </View>
            <Pressable style={styles.primaryButton} onPress={continuar} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>{etapa === perguntas.length - 1 ? 'Revisar respostas' : 'Continuar'}</Text>
            </Pressable>
            <Pressable style={styles.linkButton} onPress={sairDoRegistro} accessibilityRole="button">
              <Text style={styles.linkText}>Sair do registro</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.question}>Confira os dez sintomas antes de enviar.</Text>
              {perguntas.map((item, index) => (
                <Pressable key={item.key} style={styles.reviewRow} onPress={() => setEtapa(index)} accessibilityRole="button">
                  <Text style={styles.reviewLabel}>{item.titulo}</Text>
                  <Text style={[styles.reviewScore, (respostas[item.key] ?? 0) >= 7 && styles.reviewScoreHigh]}>{respostas[item.key]}/10  ·  Editar</Text>
                </Pressable>
              ))}
            </View>
            {temGravidadeAlta ? (
              <View style={styles.dangerCard}>
                <Text style={styles.dangerTitle}>Sintoma em intensidade alta (7 ou mais).</Text>
                <Text style={styles.bodyText}>A equipe de cuidado receberá o registro. Se a dor estiver em 7 ou mais, a triagem guiada estará disponível após o envio.</Text>
              </View>
            ) : null}
            <View style={styles.card}>
              <Text style={styles.inputLabel}>Observações (opcional)</Text>
              <TextInput
                style={styles.input}
                value={observacao}
                onChangeText={setObservacao}
                placeholder="Se quiser, acrescente uma observação."
                placeholderTextColor={cores.textoLeve}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <Pressable style={[styles.primaryButton, salvando && styles.disabled]} onPress={salvar} disabled={salvando} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>{salvando ? 'Enviando…' : 'Concluir e enviar avaliação'}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setEtapa(perguntas.length - 1)} accessibilityRole="button">
              <Text style={styles.secondaryButtonText}>Voltar ao último sintoma</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function criarStyles(cores: Palette) { return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.fundo },
  header: { backgroundColor: cores.primaria, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18, gap: 7 },
  back: { color: cores.textoInverse, fontSize: 16, fontWeight: '700' },
  headerLabel: { color: '#EAF5EC', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  headerTitle: { color: cores.textoInverse, fontSize: 24, fontWeight: '800' },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 20, gap: 16, paddingBottom: 36 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepText: { color: cores.textoSecundario, fontSize: 14, fontWeight: '700' },
  progressTrack: { flexDirection: 'row', gap: 4 },
  progressTick: { flex: 1, height: 5, borderRadius: 4, backgroundColor: cores.borda },
  progressTickActive: { backgroundColor: cores.primaria },
  card: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, borderRadius: 12, padding: 18, gap: 14 },
  cardTitle: { color: cores.texto, fontSize: 18, fontWeight: '800' },
  question: { color: cores.texto, fontSize: 18, fontWeight: '700', lineHeight: 26 },
  scaleGroups: { gap: 10 },
  scaleGroup: { gap: 6 },
  scaleGroupLabel: { color: cores.textoSecundario, fontSize: 12, fontWeight: '700' },
  scaleRow: { flexDirection: 'row', gap: 6 },
  scaleButton: { flex: 1, minWidth: 0, height: 54, borderRadius: 8, borderWidth: 2, borderColor: cores.borda, backgroundColor: cores.superficie, alignItems: 'center', justifyContent: 'center' },
  scaleSelected: { backgroundColor: cores.primaria, borderColor: cores.primariaHover },
  scaleText: { color: cores.texto, fontSize: 19, fontWeight: '800' },
  scaleTextSelected: { color: cores.textoInverse },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  scaleLabel: { color: cores.textoSecundario, fontSize: 12, flexShrink: 1 },
  scaleRight: { textAlign: 'right' },
  selectionFeedback: { backgroundColor: cores.primariaClara, borderRadius: 8, padding: 12 },
  selectionText: { textAlign: 'center', color: cores.primaria, fontSize: 16, fontWeight: '800' },
  primaryButton: { minHeight: 56, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.primaria },
  primaryButtonText: { color: cores.textoInverse, fontSize: 16, textAlign: 'center', fontWeight: '800' },
  secondaryButton: { minHeight: 52, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.superficie, borderWidth: 1.5, borderColor: cores.primaria },
  secondaryButtonText: { color: cores.primaria, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  linkButton: { minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  linkText: { color: cores.textoSecundario, fontSize: 15, fontWeight: '700' },
  reviewRow: { minHeight: 48, borderBottomWidth: 1, borderBottomColor: cores.borda, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  reviewLabel: { flex: 1, color: cores.texto, fontSize: 15, fontWeight: '700' },
  reviewScore: { color: cores.primaria, fontWeight: '800' },
  reviewScoreHigh: { color: cores.perigo },
  dangerCard: { backgroundColor: cores.perigoFundo, borderWidth: 2, borderColor: cores.perigo, borderRadius: 12, padding: 16, gap: 8 },
  dangerTitle: { color: cores.perigo, fontSize: 16, fontWeight: '800' },
  bodyText: { color: cores.textoSecundario, fontSize: 15, lineHeight: 22 },
  inputLabel: { color: cores.texto, fontSize: 16, fontWeight: '700' },
  input: { minHeight: 100, borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: 12, color: cores.texto, fontSize: 16 },
  notice: { color: cores.textoSecundario, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  disabled: { opacity: 0.6 },
});
}
