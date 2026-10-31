/**
 * Aplicativo principal do Zelo.
 *
 * Este componente centraliza o estado global da autenticação, navegação e dados
 * carregados do backend. Ele atua como orquestrador entre a interface e o serviço
 * de API, facilitando a manutenção e a evolução das telas do app.
 */
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  buscarESAS,
  buscarLocaisDor,
  buscarMedicacoes,
  buscarOrientacoes,
  criarMedicacao,
  criarUsuario,
  limparTokenAcesso,
  registrarESAS,
  registrarLocalDor,
  registrarTriagemDor,
  entrar as autenticar,
} from './api';
import LoginScreen from './pages/Login';
import CadastroScreen, { DadosCadastro } from './pages/Cadastro';
import ConfiguracoesScreen from './pages/Configuracoes';
import { VisualProvider } from './visual';
import LegalScreen from './pages/Legal';
import HomeScreen from './pages/Home';
import ESASScreen from './pages/ESAS';
import TriagemDorScreen from './pages/TriagemDor';
import MedicacoesScreen from './pages/Medicacoes';
import OrientacoesScreen from './pages/Orientacoes';
import MapaDorScreen from './pages/MapaDor';
import type { ESASAssessment, LocalDor, Medicacao, Orientacao, PainTriageData } from './types';
import { Alert } from 'react-native';

const STORAGE_KEYS = {
  perfil: '@zelo/perfil',
};

/**
 * Coordena autenticação, restauração de sessão e navegação entre telas do Expo.
 */
export default function App() {
  // Estado de navegação: controla qual tela deve ser renderizada.
  const [pagina, setPagina] = useState<'registro' | 'login' | 'legal' | 'home' | 'esas' | 'triagem-dor' | 'medicacoes' | 'orientacoes' | 'mapa-dor' | 'configuracoes'>('registro');
  const [documentoLegal, setDocumentoLegal] = useState<'termos' | 'privacidade'>('termos');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const [userId, setUserId] = useState<number | null>(null);
  const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);
  const [avaliacoesESAS, setAvaliacoesESAS] = useState<ESASAssessment[]>([]);
  const [intensidadeDorTriagem, setIntensidadeDorTriagem] = useState(7);
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([]);
  const [locaisDor, setLocaisDor] = useState<LocalDor[]>([]);



  useEffect(() => {
    // Restaura a sessão completa para manter os registros do paciente acessíveis.
    async function carregarPersistencia() {
      try {
        const perfilSalvo = await AsyncStorage.getItem(STORAGE_KEYS.perfil);
        if (!perfilSalvo) return;

        const perfil = JSON.parse(perfilSalvo) as { id?: number; nome?: string; email?: string };
        if (!Number.isInteger(perfil.id) || !perfil.nome || !perfil.email) {
          await AsyncStorage.removeItem(STORAGE_KEYS.perfil);
          return;
        }

        setNome(perfil.nome);
        setEmail(perfil.email);
        setUserId(perfil.id!);
        setPagina('home');
        try {
          await carregarDadosUsuario(perfil.id!);
        } catch {
          Alert.alert('Dados indisponíveis', 'Sua sessão foi restaurada, mas não foi possível carregar os registros agora.');
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEYS.perfil).catch(() => undefined);
      }
    }

    carregarPersistencia();
  }, []);

  async function carregarDadosUsuario(id: number) {
    // Executa as consultas em paralelo para reduzir o tempo de carregamento inicial.
    const [listaMedicacoes, listaOrientacoes, listaESAS, listaLocaisDor] = await Promise.all([
      buscarMedicacoes(id),
      buscarOrientacoes(id),
      buscarESAS(id),
      buscarLocaisDor(id),
    ]);
    setMedicacoes(listaMedicacoes);
    setOrientacoes(listaOrientacoes);
    setAvaliacoesESAS(listaESAS);
    setLocaisDor(listaLocaisDor);
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

  async function registrar(dados: DadosCadastro) {
    const usuario = await criarUsuario({
      nome:dados.nome.trim(), email:dados.email.trim(), senha:dados.senha,
      perfil:'paciente', prontuario:dados.prontuario.trim()||null,
      idade:dados.idade?Number(dados.idade):null, sexo:dados.sexo.trim()||null,
      cpf:dados.cpf.trim()||null, telefone:dados.telefone.trim()||null,
      cuidador_principal:dados.cuidador_principal.trim()||null,
      parentesco_cuidador:dados.parentesco_cuidador.trim()||null,
      diagnostico_oncologico:dados.diagnostico_oncologico.trim()||null,
      pps_score:dados.pps_score?Number(dados.pps_score):null,
      comorbidades:dados.comorbidades.trim()||null, alergias:dados.alergias.trim()||null,
      proxima_consulta:dados.proxima_consulta.trim()||null,
      tratamento_modificador:dados.tratamento_modificador.trim()||null,
    });
    await iniciarSessao(usuario);
  }

  async function login(emailInformado: string, senhaInformada: string) {
    const usuario = await autenticar(emailInformado, senhaInformada);
    await iniciarSessao(usuario);
  }

  async function salvarESAS(dados: Omit<ESASAssessment, 'id' | 'dataRegistro' | 'acionouTriagem'>): Promise<ESASAssessment> {
    if (userId === null) throw new Error('Entre novamente para registrar a avaliação.');
    const salva = await registrarESAS(userId, dados);
    setAvaliacoesESAS((atuais) => [salva, ...atuais]);
    return salva;
  }

  async function salvarTriagemDor(dados: PainTriageData): Promise<void> {
    if (userId === null) throw new Error('Entre novamente para registrar a triagem.');
    await registrarTriagemDor(userId, dados);
  }

  async function salvarMedicacao(dados: Omit<Medicacao, 'id'>): Promise<Medicacao> {
    if (userId === null) throw new Error('Entre novamente para registrar uma medicação.');
    const salva = await criarMedicacao(userId, dados);
    setMedicacoes((atuais) => [salva, ...atuais]);
    return salva;
  }

  async function salvarLocalDor(dados: Omit<LocalDor, 'id' | 'criadoEm'>): Promise<void> {
    if (userId === null) throw new Error('Entre novamente para registrar o mapa de dor.');
    const registro = await registrarLocalDor(userId, dados);
    setLocaisDor((atuais) => [registro, ...atuais]);
  }

  async function abrirOrientacoes() {
    if (userId !== null) {
      try { setOrientacoes(await buscarOrientacoes(userId)); }
      catch { Alert.alert('Orientações indisponíveis', 'Não foi possível consultar as orientações agora.'); }
    }
    setPagina('orientacoes');
  }

  async function abrirMapaDor() {
    if (userId !== null) {
      try { setLocaisDor(await buscarLocaisDor(userId)); }
      catch { Alert.alert('Mapa indisponível', 'Não foi possível consultar os registros agora.'); }
    }
    setPagina('mapa-dor');
  }

  async function sair() {
    await AsyncStorage.removeItem(STORAGE_KEYS.perfil);
    await limparTokenAcesso();
    setUserId(null);
    setAvaliacoesESAS([]);
    setMedicacoes([]);
    setOrientacoes([]);
    setLocaisDor([]);
    setPagina('registro');
  }

  return (
    <VisualProvider><SafeAreaProvider>
      {pagina === 'home' ? (
        <HomeScreen
          nomeResponsavel={nome}
          orientacoes={orientacoes}
          avaliacoesESAS={avaliacoesESAS}
          medicacoes={medicacoes}
          onSair={sair}
          onAbrirOrientacoes={abrirOrientacoes}
          onAbrirESAS={() => setPagina('esas')}
          onAbrirMedicacoes={() => setPagina('medicacoes')}
          onAbrirMapaDor={abrirMapaDor}
          onAbrirConfiguracoes={() => setPagina('configuracoes')}
        />
      ) : pagina === 'configuracoes' ? (
        <ConfiguracoesScreen onVoltar={() => setPagina('home')} />
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
      ) : pagina === 'mapa-dor' ? (
        <MapaDorScreen registros={locaisDor} onVoltar={() => setPagina('home')} onSalvar={salvarLocalDor} />
      ) : pagina === 'esas' ? (
        <ESASScreen
          onVoltar={() => setPagina('home')}
          onSalvar={salvarESAS}
          onAbrirTriagem={(intensidade) => {
            setIntensidadeDorTriagem(intensidade);
            setPagina('triagem-dor');
          }}
        />
      ) : pagina === 'triagem-dor' ? (
        <TriagemDorScreen intensidadeDor={intensidadeDorTriagem} onVoltar={() => setPagina('home')} onSalvar={salvarTriagemDor} />
      ) : pagina === 'medicacoes' ? (
        <MedicacoesScreen medicacoes={medicacoes} onVoltar={() => setPagina('home')} onSalvar={salvarMedicacao} />
      ) : (
        <CadastroScreen onCriar={registrar} onLogin={() => setPagina('login')} onLegal={(doc) => { setDocumentoLegal(doc); setPagina('legal'); }} />
      )}
    </SafeAreaProvider></VisualProvider>
  );
}
