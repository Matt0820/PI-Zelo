/**
 * Tela principal do app após o login.
 *
 * Centraliza o resumo do dia, as orientações mais recentes e os acessos rápidos
 * para sintomas e medicações. Ela serve como dashboard administrativo do cuidado.
 */
import { useState } from 'react';
import {
  Alert,
  Linking,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ESASAssessment, Medicacao, Orientacao } from '../types';
import { useVisual, Palette } from '../visual';

type HomeTab = 'resumo' | 'sintomas' | 'medicacoes';

type HomeScreenProps = {
  nomeResponsavel?: string | null;
  orientacoes: Orientacao[];
  avaliacoesESAS: ESASAssessment[];
  medicacoes: Medicacao[];
  onSair: () => void;
  onAbrirOrientacoes: () => void;
  onAbrirESAS: () => void;
  onAbrirMedicacoes: () => void;
  onAbrirMapaDor: () => void;
  onAbrirConfiguracoes: () => void;
};

const dataHoje = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/**
 * Resume registros do paciente e encaminha aos fluxos principais.
 */
export default function HomeScreen({
  nomeResponsavel,
  orientacoes,
  avaliacoesESAS,
  medicacoes,
  onSair,
  onAbrirOrientacoes,
  onAbrirESAS,
  onAbrirMedicacoes,
  onAbrirMapaDor,
  onAbrirConfiguracoes,
}: HomeScreenProps) {
  const [aba, setAba] = useState<HomeTab>('resumo');
  const [menuAberto, setMenuAberto] = useState(false);
  const { cores } = useVisual();
  const estilos = criarEstilos(cores);
  const nomeNormalizado = typeof nomeResponsavel === 'string' ? nomeResponsavel.trim() : '';
  const primeiroNome = nomeNormalizado.split(/\s+/)[0] || 'Responsável';

  function sair() {
    Alert.alert('Sair da conta', 'Deseja voltar à tela de cadastro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: onSair },
    ]);
  }

  // Mantém a orientação mais recente em destaque para facilitar a leitura.
  const orientacaoAtual = orientacoes[0];

  return (
    <SafeAreaView style={estilos.safeArea} edges={['top', 'left', 'right']}>
      <View style={estilos.cabecalho}>
        <View style={estilos.marcaLinha}>
          <Image
            source={require('../assets/logo.png')}
            style={estilos.logo}
            resizeMode="contain"
            accessibilityLabel="Zelo - Cuidados Paliativos"
          />
          <View>
            <Text style={estilos.marca}>zelo</Text>
            <Text style={estilos.rotuloResponsavel}>RESPONSÁVEL</Text>
          </View>
        </View>
        <Pressable
          style={estilos.botaoMenu}
          onPress={() => setMenuAberto(true)}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
          hitSlop={8}
        >
          <Text style={estilos.menuIcone}>☰</Text>
        </Pressable>
      </View>

      <View style={estilos.corpo}>
        <ScrollView contentContainerStyle={estilos.conteudo} showsVerticalScrollIndicator={false}>
          {aba === 'resumo' ? (
            <>
              <View style={estilos.introducao}>
                <Text style={estilos.data}>{dataHoje}</Text>
                <Text style={estilos.titulo}>Olá, {primeiroNome}.</Text>
                <Text style={estilos.descricao}>Aqui está um resumo simples do cuidado de hoje.</Text>
              </View>

              <Pressable
                style={({ pressed }) => [estilos.direcionamento, pressed && estilos.pressionado]}
                onPress={onAbrirOrientacoes}
                accessibilityRole="button"
              >
                <View style={estilos.direcionamentoTopo}>
                  <View style={estilos.iconeDirecionamento}>
                    <Text style={estilos.iconeDirecionamentoTexto}>i</Text>
                  </View>
                  <View style={estilos.direcionamentoTexto}>
                    <Text style={estilos.rotuloCard}>ORIENTAÇÕES</Text>
                    <Text style={estilos.tituloCard}>
                      {orientacaoAtual ? orientacaoAtual.titulo : 'Nenhuma atualização recente'}
                    </Text>
                  </View>
                  <Text style={estilos.seta}>›</Text>
                </View>
                <Text style={estilos.textoCard}>
                  {orientacaoAtual
                    ? orientacaoAtual.descricao
                    : 'Toque para checar as informações mais recentes da equipe.'}
                </Text>
              </Pressable>

              <View style={estilos.tituloSecaoLinha}>
                <Text style={estilos.tituloSecao}>Ações rápidas</Text>
              </View>

              <View style={estilos.gradeResumo}>
                <Pressable
                  style={({ pressed }) => [estilos.cardResumo, pressed && estilos.pressionado]}
                  onPress={onAbrirESAS}
                  accessibilityRole="button"
                >
                  <View style={estilos.cardResumoTopo}>
                    <Text style={estilos.rotuloResumo}>AVALIAÇÃO ESAS</Text>
                    <View style={[estilos.pontoStatus, estilos.pontoCoral]} />
                  </View>
                  <Text style={estilos.valorResumo}>{avaliacoesESAS.length} avaliações</Text>
                  <Text style={estilos.ajudaResumo}>Avaliar os dez sintomas</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [estilos.cardResumo, pressed && estilos.pressionado]}
                  onPress={onAbrirMedicacoes}
                  accessibilityRole="button"
                >
                  <View style={estilos.cardResumoTopo}>
                    <Text style={estilos.rotuloResumo}>MEDICAÇÕES</Text>
                    <View style={[estilos.pontoStatus, estilos.pontoVerde]} />
                  </View>
                  <Text style={estilos.valorResumo}>{medicacoes.length} itens</Text>
                  <Text style={estilos.ajudaResumo}>Adicionar horários do dia</Text>
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [estilos.cardContato, pressed && estilos.pressionado]}
                onPress={() => Linking.openURL('tel:4130000000')}
                accessibilityRole="button"
              >
                <View style={estilos.cardContatoLinha}>
                  <View style={estilos.avatarPaciente}>
                    <Text style={estilos.avatarTexto}>☎</Text>
                  </View>
                  <View style={estilos.direcionamentoTexto}>
                    <Text style={estilos.tituloCard}>Precisa de apoio da equipe?</Text>
                    <Text style={estilos.textoCard}>Ligar para a Central do Hospice: (41) 3000-0000</Text>
                  </View>
                  <Text style={estilos.acao}>Ligar</Text>
                </View>
              </Pressable>
            </>
          ) : aba === 'sintomas' ? (
            <View style={estilos.paginaAba}>
              <Text style={estilos.data}>ACOMPANHAMENTO</Text>
              <Text style={estilos.titulo}>Avaliações ESAS</Text>
              <Text style={estilos.descricao}>Acompanhe como os dez sintomas estão hoje.</Text>

              {avaliacoesESAS.length === 0 ? (
                <View style={estilos.estadoVazio}>
                  <View style={[estilos.iconeVazio, estilos.iconeVazioCoral]}>
                    <Text style={estilos.iconeVazioTexto}>+</Text>
                  </View>
                  <Text style={estilos.tituloCard}>Nenhuma avaliação registrada</Text>
                  <Text style={estilos.textoVazio}>Suas respostas aparecerão aqui depois do primeiro envio.</Text>
                  <Pressable style={estilos.botaoPrimario} onPress={onAbrirESAS} accessibilityRole="button">
                    <Text style={estilos.textoBotaoPrimario}>Iniciar avaliação</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={estilos.listaCards}>
                  {avaliacoesESAS.slice(0, 4).map((item) => (
                    <View key={item.id} style={estilos.itemCard}>
                      <View style={estilos.itemCardTopo}>
                        <Text style={estilos.itemTitulo}>Avaliação de sintomas</Text>
                        <Text style={estilos.itemBadge}>Dor {item.dor}/10</Text>
                      </View>
                      <Text style={estilos.itemTexto}>{new Date(item.dataRegistro).toLocaleString('pt-BR')}</Text>
                      <Text style={estilos.itemTexto}>Maior nota: {Math.max(item.dor, item.cansaco, item.nausea, item.depressao, item.ansiedade, item.sonolencia, item.apetite, item.mal_estar, item.falta_de_ar, item.constipacao ?? 0)}/10</Text>
                    </View>
                  ))}
                  <Pressable style={estilos.botaoSecundario} onPress={onAbrirESAS} accessibilityRole="button">
                    <Text style={estilos.textoBotaoSecundario}>Nova avaliação</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View style={estilos.paginaAba}>
              <Text style={estilos.data}>ROTINA DE CUIDADO</Text>
              <Text style={estilos.titulo}>Medicações</Text>
              <Text style={estilos.descricao}>Veja os horários e lembretes do dia.</Text>

              {medicacoes.length === 0 ? (
                <View style={estilos.estadoVazio}>
                  <View style={[estilos.iconeVazio, estilos.iconeVazioVerde]}>
                    <Text style={estilos.iconeVazioTexto}>+</Text>
                  </View>
                  <Text style={estilos.tituloCard}>Nenhuma medicação cadastrada</Text>
                  <Text style={estilos.textoVazio}>A rotina de medicação aparecerá aqui após ser adicionada.</Text>
                  <Pressable style={estilos.botaoPrimario} onPress={onAbrirMedicacoes} accessibilityRole="button">
                    <Text style={estilos.textoBotaoPrimario}>Adicionar medicação</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={estilos.listaCards}>
                  {medicacoes.slice(0, 4).map((item) => (
                    <View key={item.id} style={estilos.itemCard}>
                      <View style={estilos.itemCardTopo}>
                        <Text style={estilos.itemTitulo}>{item.nome}</Text>
                        <Text style={estilos.itemBadge}>{item.status}</Text>
                      </View>
                      <Text style={estilos.itemTexto}>{item.dose} • {item.horario}</Text>
                      <Text style={estilos.itemTexto}>{item.frequencia}</Text>
                    </View>
                  ))}
                  <Pressable style={estilos.botaoSecundario} onPress={onAbrirMedicacoes} accessibilityRole="button">
                    <Text style={estilos.textoBotaoSecundario}>Gerenciar medicações</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={() => setMenuAberto(false)}>
        <View style={estilos.menuFundo}>
          <View style={estilos.menuPainel}>
            <View style={estilos.menuCabecalho}>
              <View style={estilos.menuAvatar}><Text style={estilos.menuAvatarTexto}>{primeiroNome.slice(0, 1).toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}><Text style={estilos.menuNome}>{primeiroNome}</Text><Text style={estilos.menuLegenda}>Sua área de cuidado</Text></View>
              <Pressable onPress={() => setMenuAberto(false)} accessibilityRole="button" accessibilityLabel="Fechar menu"><Text style={estilos.menuFechar}>×</Text></Pressable>
            </View>
            <View style={estilos.menuSeparador} />
            {[
              { titulo: 'Resumo', detalhe: 'Visão geral do cuidado', acao: () => setAba('resumo') },
              { titulo: 'Avaliações ESAS', detalhe: 'Registrar e acompanhar sintomas', acao: () => { setMenuAberto(false); setAba('sintomas'); } },
              { titulo: 'Medicações', detalhe: 'Rotina e horários', acao: () => { setMenuAberto(false); setAba('medicacoes'); } },
              { titulo: 'Mapa da dor', detalhe: 'Registrar ou consultar locais', acao: onAbrirMapaDor },
              { titulo: 'Orientações', detalhe: 'Informações da equipe', acao: onAbrirOrientacoes },
              { titulo: 'Ajustes visuais', detalhe: 'Tema e acessibilidade', acao: onAbrirConfiguracoes },
            ].map((item) => (
              <Pressable key={item.titulo} style={estilos.menuItem} onPress={() => { setMenuAberto(false); item.acao(); }} accessibilityRole="button">
                <View style={estilos.menuItemTexto}><Text style={estilos.menuItemTitulo}>{item.titulo}</Text><Text style={estilos.menuItemDetalhe}>{item.detalhe}</Text></View>
                <Text style={estilos.menuSeta}>›</Text>
              </Pressable>
            ))}
            <View style={estilos.menuSeparador} />
            <Pressable style={estilos.menuItem} onPress={() => { setMenuAberto(false); sair(); }} accessibilityRole="button">
              <View style={estilos.menuItemTexto}><Text style={estilos.menuSair}>Sair da conta</Text><Text style={estilos.menuItemDetalhe}>Encerrar esta sessão</Text></View>
            </Pressable>
          </View>
          <Pressable style={estilos.menuSombra} onPress={() => setMenuAberto(false)} accessibilityLabel="Fechar menu" />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function criarEstilos(cores: Palette) { return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cores.primaria,
  },
  cabecalho: {
    minHeight: 80,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.primaria,
  },
  marcaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 38,
    height: 62,
  },
  marca: {
    color: cores.superficie,
    fontSize: 24,
    fontWeight: '700',
  },
  rotuloResponsavel: {
    color: cores.primariaSuave,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1,
  },
  botaoMenu: { width: 48, height: 48, borderRadius: 12, borderColor: cores.primariaSuave, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  menuIcone: { color: cores.superficie, fontSize: 24, fontWeight: '700' },
  menuFundo: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.38)' },
  menuSombra: { flex: 1 },
  menuPainel: { width: '84%', maxWidth: 360, height: '100%', backgroundColor: cores.superficie, paddingTop: 58, paddingHorizontal: 20, paddingBottom: 24, elevation: 16 },
  menuCabecalho: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  menuAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: cores.primariaClara, alignItems: 'center', justifyContent: 'center' },
  menuAvatarTexto: { color: cores.primaria, fontSize: 20, fontWeight: '800' },
  menuNome: { color: cores.texto, fontSize: 17, fontWeight: '800' },
  menuLegenda: { color: cores.textoSecundario, fontSize: 13, marginTop: 2 },
  menuFechar: { color: cores.textoSecundario, fontSize: 32, lineHeight: 36, paddingHorizontal: 4 },
  menuSeparador: { height: 1, backgroundColor: cores.borda, marginVertical: 12 },
  menuItem: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10, paddingHorizontal: 12 },
  menuItemTexto: { flex: 1, gap: 3 },
  menuItemTitulo: { color: cores.texto, fontSize: 16, fontWeight: '700' },
  menuItemDetalhe: { color: cores.textoSecundario, fontSize: 13 },
  menuSeta: { color: cores.primaria, fontSize: 25, fontWeight: '700' },
  menuSair: { color: cores.perigo, fontSize: 16, fontWeight: '800' },
  corpo: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
  },
  introducao: {
    marginBottom: 18,
  },
  data: {
    color: cores.perigo,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  titulo: {
    color: cores.texto,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  descricao: {
    color: cores.textoSecundario,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },
  direcionamento: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    marginBottom: 18,
  },
  direcionamentoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconeDirecionamento: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeDirecionamentoTexto: {
    color: cores.superficie,
    fontWeight: '700',
    fontSize: 18,
  },
  direcionamentoTexto: {
    flex: 1,
  },
  rotuloCard: {
    color: cores.textoLeve,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tituloCard: {
    color: cores.texto,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  seta: {
    color: cores.texto,
    fontSize: 28,
    fontWeight: '700',
  },
  textoCard: {
    color: cores.textoLeve,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  tituloSecaoLinha: {
    marginBottom: 12,
  },
  tituloSecao: {
    color: cores.texto,
    fontSize: 18,
    fontWeight: '700',
  },
  gradeResumo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  cardResumo: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
    gap: 8,
  },
  cardResumoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rotuloResumo: {
    color: cores.textoLeve,
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pontoStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pontoCoral: {
    backgroundColor: cores.perigo,
  },
  pontoVerde: {
    backgroundColor: cores.sucesso,
  },
  valorResumo: {
    color: cores.texto,
    fontSize: 24,
    fontWeight: '700',
  },
  ajudaResumo: {
    color: cores.textoLeve,
    fontSize: 13,
    lineHeight: 20,
  },
  cardContato: {
    backgroundColor: cores.superficie,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
  },
  cardContatoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPaciente: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    color: cores.primaria,
    fontSize: 20,
    fontWeight: '700',
  },
  acao: {
    color: cores.primaria,
    fontSize: 14,
    fontWeight: '700',
  },
  pressionado: {
    opacity: 0.9,
  },
  paginaAba: {
    gap: 16,
  },
  estadoVazio: {
    backgroundColor: cores.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  iconeVazio: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeVazioCoral: {
    backgroundColor: cores.perigoFundo,
  },
  iconeVazioVerde: {
    backgroundColor: cores.primariaClara,
  },
  iconeVazioTexto: {
    color: cores.texto,
    fontSize: 28,
    fontWeight: '700',
  },
  textoVazio: {
    color: cores.textoLeve,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  botaoPrimario: {
    backgroundColor: cores.primaria,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  textoBotaoPrimario: {
    color: cores.superficie,
    fontSize: 16,
    fontWeight: '700',
  },
  listaCards: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: cores.superficie,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
    gap: 6,
  },
  itemCardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  itemTitulo: {
    color: cores.texto,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  itemBadge: {
    color: cores.primaria,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: cores.primariaClara,
  },
  itemTexto: {
    color: cores.textoLeve,
    fontSize: 14,
    lineHeight: 20,
  },
  botaoSecundario: {
    backgroundColor: cores.primariaClara,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  textoBotaoSecundario: {
    color: cores.primaria,
    fontSize: 15,
    fontWeight: '700',
  },
  navegacao: {
    flexDirection: 'row',
    backgroundColor: cores.superficie,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemNavegacao: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  textoNavegacao: {
    color: cores.textoLeve,
    fontSize: 15,
    fontWeight: '700',
  },
  navegacaoAtiva: {
    color: cores.primaria,
  },
});
}
