/**
 * Tela principal do app após o login.
 *
 * Centraliza o resumo do dia, as orientações mais recentes e os acessos rápidos
 * para sintomas e medicações. Ela serve como dashboard administrativo do cuidado.
 */
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Medicacao, Orientacao, Sintoma } from '../types';

type HomeTab = 'resumo' | 'sintomas' | 'medicacoes';

type HomeScreenProps = {
  nomeResponsavel: string;
  orientacoes: Orientacao[];
  sintomas: Sintoma[];
  medicacoes: Medicacao[];
  onSair: () => void;
  onAbrirOrientacoes: () => void;
  onAbrirSintomas: () => void;
  onAbrirMedicacoes: () => void;
};

const dataHoje = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export default function HomeScreen({
  nomeResponsavel,
  orientacoes,
  sintomas,
  medicacoes,
  onSair,
  onAbrirOrientacoes,
  onAbrirSintomas,
  onAbrirMedicacoes,
}: HomeScreenProps) {
  const [aba, setAba] = useState<HomeTab>('resumo');
  const primeiroNome = nomeResponsavel.trim().split(/\s+/)[0] || 'Responsável';

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
          style={estilos.botaoPerfil}
          onPress={sair}
          accessibilityRole="button"
          accessibilityLabel="Opções da conta"
          hitSlop={8}
        >
          <Text style={estilos.iniciais}>{primeiroNome.slice(0, 1).toUpperCase()}</Text>
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
                  onPress={onAbrirSintomas}
                  accessibilityRole="button"
                >
                  <View style={estilos.cardResumoTopo}>
                    <Text style={estilos.rotuloResumo}>SINTOMAS</Text>
                    <View style={[estilos.pontoStatus, estilos.pontoCoral]} />
                  </View>
                  <Text style={estilos.valorResumo}>{sintomas.length} registros</Text>
                  <Text style={estilos.ajudaResumo}>Registrar como se sente hoje</Text>
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
                onPress={() => Alert.alert('Contato com a equipe', 'Este campo ficará pronto para integração futura com contatos do paciente.')}
                accessibilityRole="button"
              >
                <View style={estilos.cardContatoLinha}>
                  <View style={estilos.avatarPaciente}>
                    <Text style={estilos.avatarTexto}>+</Text>
                  </View>
                  <View style={estilos.direcionamentoTexto}>
                    <Text style={estilos.tituloCard}>Pessoas e contatos</Text>
                    <Text style={estilos.textoCard}>Ainda não há pessoas vinculadas.</Text>
                  </View>
                  <Text style={estilos.acao}>Adicionar</Text>
                </View>
              </Pressable>
            </>
          ) : aba === 'sintomas' ? (
            <View style={estilos.paginaAba}>
              <Text style={estilos.data}>ACOMPANHAMENTO</Text>
              <Text style={estilos.titulo}>Sintomas</Text>
              <Text style={estilos.descricao}>Registre como está se sentindo no momento.</Text>

              {sintomas.length === 0 ? (
                <View style={estilos.estadoVazio}>
                  <View style={[estilos.iconeVazio, estilos.iconeVazioCoral]}>
                    <Text style={estilos.iconeVazioTexto}>+</Text>
                  </View>
                  <Text style={estilos.tituloCard}>Nenhum sintoma registrado</Text>
                  <Text style={estilos.textoVazio}>Os registros aparecerão aqui quando forem adicionados.</Text>
                  <Pressable style={estilos.botaoPrimario} onPress={onAbrirSintomas} accessibilityRole="button">
                    <Text style={estilos.textoBotaoPrimario}>Registrar sintoma</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={estilos.listaCards}>
                  {sintomas.slice(0, 4).map((item) => (
                    <View key={item.id} style={estilos.itemCard}>
                      <View style={estilos.itemCardTopo}>
                        <Text style={estilos.itemTitulo}>{item.nome}</Text>
                        <Text style={estilos.itemBadge}>{item.gravidade}</Text>
                      </View>
                      <Text style={estilos.itemTexto}>{item.momento}</Text>
                      <Text style={estilos.itemTexto}>{item.observacao}</Text>
                    </View>
                  ))}
                  <Pressable style={estilos.botaoSecundario} onPress={onAbrirSintomas} accessibilityRole="button">
                    <Text style={estilos.textoBotaoSecundario}>Gerenciar sintomas</Text>
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

      <View style={estilos.navegacao}>
        <Pressable
          style={estilos.itemNavegacao}
          onPress={() => setAba('resumo')}
          accessibilityRole="button"
          accessibilityState={{ selected: aba === 'resumo' }}
        >
          <Text style={[estilos.textoNavegacao, aba === 'resumo' && estilos.navegacaoAtiva]}>Resumo</Text>
        </Pressable>
        <Pressable
          style={estilos.itemNavegacao}
          onPress={() => setAba('sintomas')}
          accessibilityRole="button"
          accessibilityState={{ selected: aba === 'sintomas' }}
        >
          <Text style={[estilos.textoNavegacao, aba === 'sintomas' && estilos.navegacaoAtiva]}>Sintomas</Text>
        </Pressable>
        <Pressable
          style={estilos.itemNavegacao}
          onPress={() => setAba('medicacoes')}
          accessibilityRole="button"
          accessibilityState={{ selected: aba === 'medicacoes' }}
        >
          <Text style={[estilos.textoNavegacao, aba === 'medicacoes' && estilos.navegacaoAtiva]}>Medicações</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#174C3D',
  },
  cabecalho: {
    minHeight: 80,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#174C3D',
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
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  rotuloResponsavel: {
    color: '#C7DED3',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1,
  },
  botaoPerfil: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2C6B56',
    borderWidth: 1,
    borderColor: '#6B9C85',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciais: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  corpo: {
    flex: 1,
    backgroundColor: '#F3F7F3',
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
    color: '#B55D45',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  titulo: {
    color: '#173D33',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  descricao: {
    color: '#63736B',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },
  direcionamento: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E8E2',
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
    backgroundColor: '#174C3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeDirecionamentoTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  direcionamentoTexto: {
    flex: 1,
  },
  rotuloCard: {
    color: '#678178',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tituloCard: {
    color: '#173D33',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  seta: {
    color: '#173D33',
    fontSize: 28,
    fontWeight: '700',
  },
  textoCard: {
    color: '#536760',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  tituloSecaoLinha: {
    marginBottom: 12,
  },
  tituloSecao: {
    color: '#173D33',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E8E2',
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
    color: '#678178',
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
    backgroundColor: '#CB7F66',
  },
  pontoVerde: {
    backgroundColor: '#3C8B68',
  },
  valorResumo: {
    color: '#173D33',
    fontSize: 24,
    fontWeight: '700',
  },
  ajudaResumo: {
    color: '#536760',
    fontSize: 13,
    lineHeight: 20,
  },
  cardContato: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E8E2',
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
    backgroundColor: '#DCEAE1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    color: '#174C3D',
    fontSize: 20,
    fontWeight: '700',
  },
  acao: {
    color: '#174C3D',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E8E2',
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
    backgroundColor: '#FBE5DC',
  },
  iconeVazioVerde: {
    backgroundColor: '#E6F1EA',
  },
  iconeVazioTexto: {
    color: '#173D33',
    fontSize: 28,
    fontWeight: '700',
  },
  textoVazio: {
    color: '#536760',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  botaoPrimario: {
    backgroundColor: '#174C3D',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  textoBotaoPrimario: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  listaCards: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E8E2',
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
    color: '#173D33',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  itemBadge: {
    color: '#174C3D',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E9F3EF',
  },
  itemTexto: {
    color: '#536760',
    fontSize: 14,
    lineHeight: 20,
  },
  botaoSecundario: {
    backgroundColor: '#EAF3EE',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  textoBotaoSecundario: {
    color: '#174C3D',
    fontSize: 15,
    fontWeight: '700',
  },
  navegacao: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E8E2',
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
    color: '#5F7067',
    fontSize: 15,
    fontWeight: '700',
  },
  navegacaoAtiva: {
    color: '#174C3D',
  },
});