/**
 * Aplicativo principal do Zelo.
 *
 * Este componente centraliza o estado global da autenticação, navegação e dados
 * carregados do backend. Ele atua como orquestrador entre a interface e o serviço
 * de API, facilitando a manutenção e a evolução das telas do app.
 */
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  buscarMedicacoes,
  buscarOrientacoes,
  buscarSintomas,
  criarMedicacao,
  criarSintoma,
  criarUsuario,
  entrar as autenticar,
} from './api';
import LoginScreen from './pages/Login';
import LegalScreen from './pages/Legal';
import HomeScreen from './pages/Home';
import SintomasScreen from './pages/Sintomas';
import MedicacoesScreen from './pages/Medicacoes';
import OrientacoesScreen from './pages/Orientacoes';
import type { Medicacao, Orientacao, Sintoma } from './types';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const STORAGE_KEYS = {
  perfil: '@zelo/perfil',
};

export default function App() {
  // Estado de navegação: controla qual tela deve ser renderizada.
  const [pagina, setPagina] = useState<'registro' | 'login' | 'legal' | 'home' | 'sintomas' | 'medicacoes' | 'orientacoes'>('registro');
  const [documentoLegal, setDocumentoLegal] = useState<'termos' | 'privacidade'>('termos');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);
  const [sintomas, setSintomas] = useState<Sintoma[]>([]);
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([]);

  const cadastroJsonTemporario = nome.trim() && email.trim() && senha
    ? JSON.stringify({ nome: nome.trim(), email: email.trim(), senha })
    : null;

  useEffect(() => {
    // Carrega o perfil persistido para manter a sessão consistente ao abrir o app.
    async function carregarPersistencia() {
      try {
        const perfilSalvo = await AsyncStorage.getItem(STORAGE_KEYS.perfil);

        if (perfilSalvo) {
          const perfil = JSON.parse(perfilSalvo) as { nome?: string; email?: string };
          if (perfil.nome) setNome(perfil.nome);
          if (perfil.email) setEmail(perfil.email);
        }
      } catch {
        // Ignora falha de carregamento inicial em ambiente local.
      }
    }

    carregarPersistencia();
  }, []);

  async function carregarDadosUsuario(id: number) {
    // Executa as consultas em paralelo para reduzir o tempo de carregamento inicial.
    const [listaSintomas, listaMedicacoes, listaOrientacoes] = await Promise.all([
      buscarSintomas(id),
      buscarMedicacoes(id),
      buscarOrientacoes(id),
    ]);
    setSintomas(listaSintomas);
    setMedicacoes(listaMedicacoes);
    setOrientacoes(listaOrientacoes);
  }

  async function iniciarSessao(usuario: { id: number; nome: string; email: string }) {
    setNome(usuario.nome);
    setEmail(usuario.email);
    setUserId(usuario.id);
    await AsyncStorage.setItem(STORAGE_KEYS.perfil, JSON.stringify(usuario));
    setPagina('home');

    try {
      await carregarDadosUsuario(usuario.id);
    } catch {
      Alert.alert('Dados indisponíveis', 'Sua conta foi conectada, mas não foi possível carregar os registros agora.');
    }
  }

  async function registrar() {
    if (!cadastroJsonTemporario) {
      Alert.alert('Faltam alguns dados', 'Preencha seu nome, email e senha para continuar.');
      return;
    }

    const cadastro = JSON.parse(cadastroJsonTemporario) as {
      nome: string;
      email: string;
      senha: string;
    };

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cadastro.email)) {
      Alert.alert('Email inválido', 'Confira o endereço de email informado.');
      return;
    }

    if (cadastro.senha.length < 8) {
      Alert.alert('Senha muito curta', 'Use pelo menos 8 caracteres na sua senha.');
      return;
    }

    try {
      const usuario = await criarUsuario(cadastro);
      await iniciarSessao(usuario);
    } catch (error) {
      Alert.alert('Não foi possível criar a conta', error instanceof Error ? error.message : 'Tente novamente em alguns instantes.');
    }
  }

  async function login(emailInformado: string, senhaInformada: string) {
    const usuario = await autenticar(emailInformado, senhaInformada);
    await iniciarSessao(usuario);
  }

  async function salvarSintoma(dados: Omit<Sintoma, 'id' | 'atualizadoEm'>): Promise<Sintoma> {
    if (userId === null) throw new Error('Entre novamente para registrar um sintoma.');
    const salvo = await criarSintoma(userId, dados);
    setSintomas((atuais) => [salvo, ...atuais]);
    return salvo;
  }

  async function salvarMedicacao(dados: Omit<Medicacao, 'id'>): Promise<Medicacao> {
    if (userId === null) throw new Error('Entre novamente para registrar uma medicação.');
    const salva = await criarMedicacao(userId, dados);
    setMedicacoes((atuais) => [salva, ...atuais]);
    return salva;
  }

  async function sair() {
    await AsyncStorage.removeItem(STORAGE_KEYS.perfil);
    setUserId(null);
    setSintomas([]);
    setMedicacoes([]);
    setOrientacoes([]);
    setPagina('registro');
  }

  return (
    <SafeAreaProvider>
      {pagina === 'home' ? (
        <HomeScreen
          nomeResponsavel={nome}
          orientacoes={orientacoes}
          sintomas={sintomas}
          medicacoes={medicacoes}
          onSair={sair}
          onAbrirOrientacoes={() => setPagina('orientacoes')}
          onAbrirSintomas={() => setPagina('sintomas')}
          onAbrirMedicacoes={() => setPagina('medicacoes')}
        />
      ) : pagina === 'login' ? (
        <LoginScreen onVoltar={() => setPagina('registro')} onEntrar={login} />
      ) : pagina === 'legal' ? (
        <LegalScreen
          documento={documentoLegal}
          onSelecionarDocumento={setDocumentoLegal}
          onVoltar={() => setPagina('registro')}
        />
      ) : pagina === 'orientacoes' ? (
        <OrientacoesScreen orientacoes={orientacoes} onVoltar={() => setPagina('home')} />
      ) : pagina === 'sintomas' ? (
        <SintomasScreen sintomas={sintomas} onVoltar={() => setPagina('home')} onSalvar={salvarSintoma} />
      ) : pagina === 'medicacoes' ? (
        <MedicacoesScreen medicacoes={medicacoes} onVoltar={() => setPagina('home')} onSalvar={salvarMedicacao} />
      ) : (
        <SafeAreaView style={estilos.safeArea} edges={['top', 'left', 'right']}>
          <View style={estilos.cabecalho}>
            <Image
              source={require('./assets/logo.png')}
              style={estilos.logo}
              resizeMode="contain"
              accessibilityLabel="Zelo - Cuidados Paliativos"
            />
          </View>
          <View style={estilos.corpo}>
            <KeyboardAvoidingView
              style={estilos.keyboardArea}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                contentContainerStyle={estilos.conteudo}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={estilos.introducao}>
                  <Text style={estilos.sobreTitulo}>CUIDADO COMEÇA COM CONEXÃO</Text>
                  <Text style={estilos.titulo}>Vamos criar sua conta.</Text>
                  <Text style={estilos.descricao}>
                    Um espaço de cuidado, presença e apoio para você e sua família.
                  </Text>
                </View>

                <View style={estilos.formulario}>
                  <View style={estilos.campoGrupo}>
                    <Text style={estilos.rotulo}>Nome completo</Text>
                    <TextInput
                      style={estilos.campo}
                      placeholder="Como podemos chamar você?"
                      placeholderTextColor="#87958E"
                      value={nome}
                      onChangeText={setNome}
                      autoCapitalize="words"
                      autoComplete="name"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={estilos.campoGrupo}>
                    <Text style={estilos.rotulo}>Email</Text>
                    <TextInput
                      style={estilos.campo}
                      placeholder="voce@email.com"
                      placeholderTextColor="#87958E"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>

                  <View style={estilos.campoGrupo}>
                    <View style={estilos.rotuloLinha}>
                      <Text style={estilos.rotulo}>Senha</Text>
                      <Pressable
                        onPress={() => setSenhaVisivel(!senhaVisivel)}
                        accessibilityRole="button"
                        accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        <Text style={estilos.acaoCampo}>{senhaVisivel ? 'Ocultar' : 'Mostrar'}</Text>
                      </Pressable>
                    </View>
                    <TextInput
                      style={estilos.campo}
                      placeholder="Pelo menos 8 caracteres"
                      placeholderTextColor="#87958E"
                      value={senha}
                      onChangeText={setSenha}
                      secureTextEntry={!senhaVisivel}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      returnKeyType="done"
                      onSubmitEditing={registrar}
                    />
                  </View>

                  <Pressable
                    style={({ pressed }) => [estilos.botao, pressed && estilos.botaoPressionado]}
                    onPress={registrar}
                    accessibilityRole="button"
                  >
                    <Text style={estilos.textoBotao}>Criar minha conta</Text>
                    <Text style={estilos.setaBotao}>→</Text>
                  </Pressable>

                  <Text style={estilos.termos}>
                    Ao continuar, você concorda com nossos{' '}
                    <Text
                      style={estilos.termosDestaque}
                      accessibilityRole="link"
                      onPress={() => {
                        setDocumentoLegal('termos');
                        setPagina('legal');
                      }}
                    >
                      Termos de uso
                    </Text>{' '}e{' '}
                    <Text
                      style={estilos.termosDestaque}
                      accessibilityRole="link"
                      onPress={() => {
                        setDocumentoLegal('privacidade');
                        setPagina('legal');
                      }}
                    >
                      Política de privacidade
                    </Text>.
                  </Text>
                </View>

                <View style={estilos.rodape}>
                  <Text style={estilos.textoRodape}>Já tem uma conta?</Text>
                  <Pressable accessibilityRole="button" onPress={() => setPagina('login')}>
                    <Text style={estilos.linkRodape}>Fazer login</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#174C3D',
  },
  cabecalho: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    paddingHorizontal: 24,
    backgroundColor: '#174C3D',
  },
  logo: {
    width: 36,
    height: 64,
  },
  marca: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0,
  },
  corpo: {
    flex: 1,
    backgroundColor: '#F3F7F3',
  },
  keyboardArea: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 28,
  },
  introducao: {
    marginBottom: 30,
  },

  sobreTitulo: {
    color: '#B55D45',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 12,
  },
  titulo: {
    color: '#173D33',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: 0,
    maxWidth: 360,
  },
  descricao: {
    color: '#63736B',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 360,
  },
  formulario: {
    gap: 20,
  },
  campoGrupo: {
    gap: 8,
  },
  rotuloLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rotulo: {
    color: '#28463B',
    fontSize: 14,
    fontWeight: '600',
  },
  acaoCampo: {
    color: '#26745C',
    fontSize: 13,
    fontWeight: '600',
  },
  campo: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#D9E3DC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    color: '#173D33',
    fontSize: 15,
  },
  botao: {
    minHeight: 56,
    marginTop: 4,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#26745C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  botaoPressionado: {
    backgroundColor: '#1E624D',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  setaBotao: {
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 22,
  },
  termos: {
    color: '#718078',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: -4,
  },
  termosDestaque: {
    color: '#385C4D',
    fontWeight: '600',
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 'auto',
    paddingTop: 32,
  },
  textoRodape: {
    color: '#63736B',
    fontSize: 14,
  },
  linkRodape: {
    color: '#26745C',
    fontSize: 14,
    fontWeight: '700',
  },
});
