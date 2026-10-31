import React, { useEffect, useState } from 'react';
import logo from '../images/logo-zelo-verde.png';
import {
  Alerta,
  api,
  ESAS,
  Evolucao,
  LocalDor,
  Medicacao,
  Orientacao,
  Triagem,
  Usuario
} from './api';
import { NoticeFeedback } from './components/NoticeFeedback';
import { Icon, type IconName } from './components/Icon';
import { useAccessibility, ModoVisual } from './context/AccessibilityContext';
import { Login, NoticeState } from './features/auth';
import { PatientArea, PatientPage } from './features/patient';
import { TeamArea, TeamPage, TeamModal, TeamModalType } from './features/team';

const sessionKey = '@zelo/web/session';

interface NavEntry {
  id: string;
  name: string;
  icon: IconName;
  action: () => void;
}

export default function App(): React.JSX.Element {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try {
      const saved = localStorage.getItem(sessionKey);
      return saved ? (JSON.parse(saved) as Usuario) : null;
    } catch {
      return null;
    }
  });

  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [busy, setBusy] = useState(false);
  const [equipePagina, setEquipePagina] = useState<TeamPage>('painel');
  const [paginaPaciente, setPaginaPaciente] = useState<PatientPage>('inicio');
  const [pacientes, setPacientes] = useState<Usuario[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [selecionado, setSelecionado] = useState<Usuario | null>(null);
  const [query, setQuery] = useState('');
  const [detalhes, setDetalhes] = useState<{
    esas: ESAS[];
    triagens: Triagem[];
    dor: LocalDor[];
    medicacoes: Medicacao[];
    orientacoes: Orientacao[];
    evolucoes: Evolucao[];
  }>({ esas: [], triagens: [], dor: [], medicacoes: [], orientacoes: [], evolucoes: [] });

  const [modal, setModal] = useState<TeamModalType | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);

  const { modoVisual, setModoVisual, nomesModosVisuais } = useAccessibility();

  const [patientData, setPatientData] = useState<{
    esas: ESAS[];
    medicacoes: Medicacao[];
    orientacoes: Orientacao[];
    dor: LocalDor[];
  }>({ esas: [], medicacoes: [], orientacoes: [], dor: [] });

  const isTeam =
    usuario?.perfil === 'assistencial' ||
    usuario?.perfil === 'admin' ||
    usuario?.perfil === 'medico';

  const show = (kind: 'success' | 'error' | 'warning' | 'info', text: string) => {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 5000);
  };

  function sair() {
    api.logout();
    try {
      localStorage.removeItem(sessionKey);
    } catch {
      // storage indisponível
    }
    setUsuario(null);
    setSelecionado(null);
    setMenuAberto(false);
  }

  // Intercepta evento de expiração de sessão disparado pelo api.ts
  useEffect(() => {
    const handleExpired = () => {
      sair();
      show('error', 'Sua sessão expirou. Por favor, entre novamente com suas credenciais.');
    };
    window.addEventListener('zelo:auth-expired', handleExpired);
    return () => window.removeEventListener('zelo:auth-expired', handleExpired);
  }, []);

  async function carregarEquipe() {
    const [ps, as] = await Promise.all([api.pacientes(), api.alertas()]);
    setPacientes(ps);
    setAlertas(as);
  }

  async function carregarDetalhe(p: Usuario) {
    setSelecionado(p);
    const [esas, triagens, dor, medicacoes, orientacoes, evolucoes] = await Promise.all([
      api.esas(p.id),
      api.triagens(p.id),
      api.locaisDor(p.id),
      api.medicamentos(p.id),
      api.orientacoes(p.id),
      api.evolucoes(p.id)
    ]);
    setDetalhes({ esas, triagens, dor, medicacoes, orientacoes, evolucoes });
  }

  async function carregarPaciente(id: number) {
    const [esas, medicacoes, orientacoes, dor] = await Promise.all([
      api.esas(id),
      api.medicamentos(id),
      api.orientacoes(id),
      api.locaisDor(id)
    ]);
    setPatientData({ esas, medicacoes, orientacoes, dor });
  }

  useEffect(() => {
    if (usuario && isTeam) {
      carregarEquipe().catch(e => show('error', String(e.message || e)));
    }
  }, [usuario?.id, isTeam]);

  useEffect(() => {
    if (usuario && !isTeam) {
      carregarPaciente(usuario.id).catch(e => show('error', String(e.message || e)));
    }
  }, [usuario?.id, isTeam]);

  async function entrar(email: string, senha: string, expected: 'equipe' | 'paciente') {
    setBusy(true);
    try {
      const user = await api.login(email, senha);
      if (!user.ativo) throw new Error('Esta conta está inativa. Fale com a equipe responsável.');
      if (expected === 'equipe' && !['assistencial', 'admin', 'medico'].includes(user.perfil)) {
        throw new Error('Esta conta é de paciente. Selecione a opção Paciente / Cuidador.');
      }
      if (expected === 'paciente' && !['paciente', 'cuidador'].includes(user.perfil)) {
        throw new Error('Esta conta é da equipe profissional. Selecione Equipe assistencial.');
      }
      setUsuario(user);
      localStorage.setItem(sessionKey, JSON.stringify(user));
    } catch (e) {
      show('error', e instanceof Error ? e.message : 'Não foi possível entrar no sistema.');
    } finally {
      setBusy(false);
    }
  }

  if (!usuario) {
    return (
      <Login
        entrar={entrar}
        criarConta={async dados => {
          setBusy(true);
          try {
            const user = await api.criarPaciente(dados);
            setUsuario(user);
            localStorage.setItem(sessionKey, JSON.stringify(user));
            show('success', 'Conta do paciente criada com sucesso.');
          } finally {
            setBusy(false);
          }
        }}
        busy={busy}
        notice={notice}
      />
    );
  }

  const teamNavItems: NavEntry[] = [
    {
      id: 'painel',
      name: 'Visão geral',
      icon: 'home',
      action: () => {
        setSelecionado(null);
        setEquipePagina('painel');
      }
    },
    {
      id: 'pacientes',
      name: 'Pacientes',
      icon: 'users',
      action: () => {
        setSelecionado(null);
        setEquipePagina('pacientes');
      }
    },
    {
      id: 'alertas',
      name: 'Alertas clínicos',
      icon: 'alert-triangle',
      action: () => {
        setSelecionado(null);
        setEquipePagina('alertas');
      }
    },
    {
      id: 'acessibilidade',
      name: 'Acessibilidade',
      icon: 'bolt',
      action: () => {
        setSelecionado(null);
        setEquipePagina('acessibilidade');
      }
    }
  ];

  const patientNavItems: NavEntry[] = [
    { id: 'inicio', name: 'Início', icon: 'home', action: () => setPaginaPaciente('inicio') },
    { id: 'esas', name: 'Avaliação ESAS', icon: 'clock', action: () => setPaginaPaciente('esas') },
    { id: 'chatbot', name: 'Chatbot Zelo (Apoio)', icon: 'chat', action: () => setPaginaPaciente('chatbot') },
    { id: 'medicacoes', name: 'Medicações & Receitas', icon: 'pill', action: () => setPaginaPaciente('medicacoes') },
    { id: 'mapa', name: 'Mapa da dor', icon: 'map-pin', action: () => setPaginaPaciente('mapa') },
    { id: 'orientacoes', name: 'Avisos da equipe', icon: 'info', action: () => setPaginaPaciente('orientacoes') },
    { id: 'acessibilidade', name: 'Acessibilidade', icon: 'bolt', action: () => setPaginaPaciente('acessibilidade') }
  ];

  const navItems = isTeam ? teamNavItems : patientNavItems;

  return (
    <div className="app-shell">
      {/* CABEÇALHO SUPERIOR (TOPBAR) */}
      <header className="topbar">
        <button
          className="brand"
          onClick={() => {
            setSelecionado(null);
            if (isTeam) setEquipePagina('painel');
            else setPaginaPaciente('inicio');
          }}
          aria-label="Ir para o início do Zelo"
        >
          <img src={logo} alt="Logotipo do Zelo" />
          <span>
            <b>zelo</b>
            <small>{isTeam ? 'Portal assistencial' : 'Área do paciente'}</small>
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="topbar-user">
            <span>{usuario.nome}</span>
            <button className="button button-quiet" onClick={sair} aria-label="Sair da conta">
              Sair
            </button>
          </div>
        </div>

        <button
          className="menu-trigger"
          aria-label="Abrir menu de navegação"
          onClick={() => setMenuAberto(true)}
        >
          <span className="menu-icon" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
      </header>

      {/* ÁREA DE TRABALHO: SIDEBAR + CONTEÚDO PRINCIPAL */}
      <div className="workspace">
        <aside
          className={`sidebar ${menuAberto ? 'sidebar-open' : ''}`}
          aria-label="Menu principal"
        >
          <div className="sidebar-head">
            <strong>{isTeam ? 'Acompanhamento Clínico' : 'Meu cuidado'}</strong>
            <button
              className="sidebar-close"
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar menu"
            >
              ×
            </button>
          </div>

          {navItems.map(item => {
            const isActive = isTeam ? equipePagina === item.id : paginaPaciente === item.id;
            return (
              <button
                className={`nav-item ${isActive ? 'active' : ''}`}
                key={item.id}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  item.action();
                  setMenuAberto(false);
                }}
              >
                <span className="nav-icon" aria-hidden="true">
                  <Icon name={item.icon} size={18} />
                </span>
                {item.name}
              </button>
            );
          })}

          {isTeam && (
            <div className="sidebar-note">
              Use os comandos “+ Prescrever” ou “Enviar” para registrar ações com validade no
              prontuário.
            </div>
          )}

          <label className="sidebar-appearance">
            Modo Visual
            <select
              value={modoVisual}
              onChange={e => setModoVisual(e.target.value as ModoVisual)}
              aria-label="Alternar modo visual de exibição"
            >
              {(Object.keys(nomesModosVisuais) as ModoVisual[]).map(m => (
                <option key={m} value={m}>
                  {nomesModosVisuais[m]}
                </option>
              ))}
            </select>
          </label>

          <button className="nav-item nav-logout" onClick={sair} aria-label="Sair da conta">
            <span className="nav-icon" aria-hidden="true">
              <Icon name="logout" size={18} />
            </span>
            Sair da conta
          </button>
        </aside>

        {menuAberto && (
          <button
            aria-label="Fechar menu"
            className="sidebar-scrim"
            onClick={() => setMenuAberto(false)}
          />
        )}

        <main className="main-content">
          {notice && (
            <NoticeFeedback
              kind={notice.kind}
              message={notice.text}
              onDismiss={() => setNotice(null)}
            />
          )}

          {isTeam ? (
            <TeamArea
              page={equipePagina}
              setPage={setEquipePagina}
              selected={selecionado}
              setSelected={setSelecionado}
              patients={pacientes}
              alerts={alertas}
              query={query}
              setQuery={setQuery}
              details={detalhes}
              busy={busy}
              setBusy={setBusy}
              openPatient={p => {
                setBusy(true);
                carregarDetalhe(p)
                  .then(() => setBusy(false))
                  .catch(e => {
                    setBusy(false);
                    show('error', e.message);
                  });
              }}
              refreshDetail={() =>
                selecionado ? carregarDetalhe(selecionado) : carregarEquipe()
              }
              openModal={setModal}
              notice={(kind, text) => show(kind, text)}
              updateAlert={async (a, state) => {
                try {
                  await api.atualizarAlerta(a.id, {
                    estado: state,
                    revisado_por: usuario.nome,
                    observacao_conduta:
                      state === 'Tratado'
                        ? 'Conduta clínica registrada pela equipe na plataforma Zelo.'
                        : null
                  });
                  await carregarEquipe();
                  show('success', `Alerta atualizado para “${state}”.`);
                } catch (e) {
                  show('error', String((e as Error).message));
                }
              }}
            />
          ) : (
            <PatientArea
              usuario={usuario}
              page={paginaPaciente}
              setPage={setPaginaPaciente}
              data={patientData}
              refresh={() => carregarPaciente(usuario.id)}
              notice={(kind, text) => show(kind, text)}
            />
          )}
        </main>
      </div>

      {modal && isTeam && (
        <TeamModal
          type={modal}
          patient={selecionado}
          professional={usuario}
          close={() => setModal(null)}
          done={async text => {
            setModal(null);
            show('success', text);
            if (selecionado) await carregarDetalhe(selecionado);
            await carregarEquipe();
          }}
        />
      )}
    </div>
  );
}
