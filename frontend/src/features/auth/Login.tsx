/**
 * Renderiza login/cadastro e mostra retorno da API sem guardar a senha no estado global.
 */

import React, { FormEvent, useState } from 'react';
import logo from '../../../images/logo-zelo-verde.png';
import { Button } from '../../components/Button';
import { NoticeFeedback } from '../../components/NoticeFeedback';
import { AccessibilityBar } from '../../components/AccessibilityBar';

/**
 * Estrutura do feedback de autenticação exibido na tela.
 */
export interface NoticeState {
  kind: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

/**
 * Callbacks e estado que conectam o formulário à autenticação/cadastro.
 */
export interface LoginProps {
  entrar: (email: string, senha: string, expected: 'equipe' | 'paciente') => void;
  criarConta: (dados: unknown) => Promise<void>;
  busy: boolean;
  notice: NoticeState | null;
}

/**
 * Renderiza os formulários de entrada e cadastro com validação e feedback.
 */
export function Login({
  entrar,
  criarConta,
  busy,
  notice
}: LoginProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modo, setModo] = useState<'equipe' | 'paciente'>('equipe');
  const [cadastrar, setCadastrar] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [proprio, setProprio] = useState(false);
  const [erro, setErro] = useState('');

  const [dados, setDados] = useState<Record<string, string>>({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    idade: '',
    sexo: '',
    prontuario: '',
    diagnostico_oncologico: '',
    tratamento_modificador: '',
    pps_score: '',
    comorbidades: '',
    alergias: '',
    proxima_consulta: '',
    cuidador_principal: '',
    parentesco_cuidador: '',
    senha: ''
  });

  function atualizar(chave: string, valor: string) {
    setDados(atual => ({ ...atual, [chave]: valor }));
  }

  function submitLogin(e: FormEvent) {
    e.preventDefault();
    entrar(email.trim(), senha, modo);
  }

  async function submitSignup(e: FormEvent) {
    e.preventDefault();
    setErro('');

    if (etapa === 0) {
      if (!dados.nome.trim() || !dados.email.trim()) {
        setErro('Informe o nome e o email do paciente.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
        setErro('Confira o email informado.');
        return;
      }
      setEtapa(1);
      return;
    }

    if (etapa === 1) {
      if (!proprio && (!dados.cuidador_principal.trim() || !dados.parentesco_cuidador.trim())) {
        setErro(
          'Informe o nome e a relação do responsável, ou indique que o paciente é seu próprio responsável.'
        );
        return;
      }
      setEtapa(2);
      return;
    }

    if (dados.senha.length < 8) {
      setErro('Use uma senha com pelo menos 8 caracteres.');
      return;
    }

    const numeric = (value: string) => (value.trim() ? Number(value) : null);

    if (
      dados.idade &&
      (!Number.isInteger(numeric(dados.idade)) ||
        Number(dados.idade) < 0 ||
        Number(dados.idade) > 125)
    ) {
      setErro('Informe uma idade entre 0 e 125 anos.');
      return;
    }

    if (
      dados.pps_score &&
      (!Number.isInteger(numeric(dados.pps_score)) ||
        Number(dados.pps_score) < 0 ||
        Number(dados.pps_score) > 100)
    ) {
      setErro('Informe o PPS entre 0 e 100.');
      return;
    }

    try {
      await criarConta({
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        senha: dados.senha,
        perfil: 'paciente',
        prontuario: dados.prontuario.trim() || null,
        idade: numeric(dados.idade),
        sexo: dados.sexo.trim() || null,
        cpf: dados.cpf.trim() || null,
        telefone: dados.telefone.trim() || null,
        cuidador_principal: proprio ? dados.nome.trim() : dados.cuidador_principal.trim() || null,
        parentesco_cuidador: proprio ? 'Próprio paciente' : dados.parentesco_cuidador.trim() || null,
        diagnostico_oncologico: dados.diagnostico_oncologico.trim() || null,
        tratamento_modificador: dados.tratamento_modificador.trim() || null,
        pps_score: numeric(dados.pps_score),
        comorbidades: dados.comorbidades.trim() || null,
        alergias: dados.alergias.trim() || null,
        proxima_consulta: dados.proxima_consulta.trim() || null
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
    }
  }

  const renderField = (key: string, label: string, type = 'text', optional = true) => (
    <label key={key}>
      {label}
      {optional ? ' (opcional)' : ' *'}
      <input
        type={type}
        value={dados[key] || ''}
        onChange={e => atualizar(key, e.target.value)}
        required={!optional}
        maxLength={key === 'sexo' ? 10 : undefined}
        min={key === 'idade' ? '0' : key === 'pps_score' ? '0' : undefined}
        max={key === 'idade' ? '125' : key === 'pps_score' ? '100' : undefined}
      />
    </label>
  );

  const patientSteps = [
    {
      title: 'Dados do paciente',
      help: 'Etapa 1 de 3 · Primeiro, identifique a pessoa que receberá o cuidado.',
      fields: [
        ['nome', 'Nome completo do paciente', 'text', false],
        ['email', 'Email do paciente para acesso', 'email', false],
        ['cpf', 'CPF do paciente'],
        ['telefone', 'Telefone do paciente'],
        ['idade', 'Idade do paciente', 'number'],
        ['sexo', 'Sexo do paciente'],
        ['prontuario', 'Número do prontuário'],
        ['diagnostico_oncologico', 'Diagnóstico oncológico'],
        ['tratamento_modificador', 'Tratamento atual'],
        ['pps_score', 'PPS (0 a 100)', 'number'],
        ['comorbidades', 'Comorbidades'],
        ['alergias', 'Alergias'],
        ['proxima_consulta', 'Próxima consulta']
      ] as Array<[string, string, string?, boolean?]>
    },
    {
      title: 'Responsável pelo paciente',
      help: 'Etapa 2 de 3 · Informe quem acompanha e apoia o paciente.',
      fields: [
        ['cuidador_principal', 'Nome completo do responsável', 'text', false],
        ['parentesco_cuidador', 'Relação com o paciente', 'text', false]
      ] as Array<[string, string, string?, boolean?]>
    },
    {
      title: 'Acesso do paciente',
      help: 'Etapa 3 de 3 · Crie a senha da conta do paciente.',
      fields: [['senha', 'Senha de acesso', 'password', false]] as Array<
        [string, string, string?, boolean?]
      >
    }
  ];

  const current = patientSteps[etapa];

  return (
    <div className="login-shell">
      {/* PAINEL INSTITUCIONAL LATERAL */}
      <section className="login-brand">
        <img src={logo} alt="Logotipo do Zelo" />
        <p className="eyebrow">CUIDADO CONECTADO</p>
        <h1>Presença e cuidado, em cada etapa.</h1>
        <p>
          Informações clínicas, registros de sintomas e orientações de cuidados paliativos reunidos em um só lugar.
        </p>
        <div className="login-values">
          <span>Dados compartilhados com a Equipe Médica</span>
          <span>Triagem ágil de sintomas graves</span>
          <span>Acessibilidade para idosos e cuidadores</span>
        </div>
      </section>

      {/* PAINEL DE AUTENTICAÇÃO */}
      <section className="login-panel">
        <div
          style={{
            width: 'min(100%, 430px)',
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '12px'
          }}
        >
          <AccessibilityBar />
        </div>

        <div className="login-card">
          {/* Seletor de Perfil: Equipe vs. Paciente */}
          <div className="role-switch" role="tablist" aria-label="Perfil de acesso">
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'equipe'}
              className={modo === 'equipe' ? 'active' : ''}
              onClick={() => {
                setModo('equipe');
                setCadastrar(false);
              }}
            >
              Equipe assistencial
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'paciente'}
              className={modo === 'paciente' ? 'active' : ''}
              onClick={() => setModo('paciente')}
            >
              Paciente / Cuidador
            </button>
          </div>

          {/* Sub-alternância: Entrar vs. Criar conta (Paciente) */}
          {modo === 'paciente' && (
            <div className="login-mode-switch" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={!cadastrar}
                className={!cadastrar ? 'active' : ''}
                onClick={() => {
                  setCadastrar(false);
                  setErro('');
                }}
              >
                Já tenho conta
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={cadastrar}
                className={cadastrar ? 'active' : ''}
                onClick={() => {
                  setCadastrar(true);
                  setEtapa(0);
                  setErro('');
                }}
              >
                Cadastrar paciente
              </button>
            </div>
          )}

          <h2>{cadastrar ? 'Cadastro do paciente' : 'Acessar o Zelo'}</h2>
          <p className="muted" style={{ margin: '0 0 20px' }}>
            {cadastrar
              ? current.help
              : modo === 'equipe'
              ? 'Entre com sua conta profissional para acessar a Central de Alertas e os prontuários.'
              : 'Entre com os dados da conta do paciente ou de seu cuidador responsável.'}
          </p>

          {notice && <NoticeFeedback kind={notice.kind} message={notice.text} />}
          {erro && <NoticeFeedback kind="error" message={erro} onDismiss={() => setErro('')} />}

          {cadastrar ? (
            <form onSubmit={submitSignup} className="form-stack">
              {etapa === 1 && (
                <label className="self-check">
                  <input
                    type="checkbox"
                    checked={proprio}
                    onChange={e => {
                      const checked = e.target.checked;
                      setProprio(checked);
                      if (checked) {
                        atualizar('cuidador_principal', dados.nome);
                        atualizar('parentesco_cuidador', 'Próprio paciente');
                      } else {
                        atualizar('cuidador_principal', '');
                        atualizar('parentesco_cuidador', '');
                      }
                    }}
                  />
                  <span>O paciente será o próprio responsável</span>
                </label>
              )}

              {current.fields
                .filter(([key]) => !(etapa === 1 && proprio && key !== ''))
                .map(([key, label, type, optional]) => renderField(key, label, type, optional))}

              {etapa === 0 && (
                <span className="helper">
                  Os dados clínicos e cadastrais são protegidos com sigilo e tratados conforme a LGPD e o comitê de ética em pesquisa (CEP/UFPR nº 6.218.903).
                </span>
              )}

              {etapa === 2 && (
                <span className="helper">
                  Ao criar a conta, você concorda com os termos de uso e a política de privacidade da Plataforma Zelo.
                </span>
              )}

              <div className="button-row" style={{ marginTop: '10px' }}>
                {etapa > 0 && (
                  <Button type="button" variant="secondary" onClick={() => setEtapa(v => v - 1)}>
                    Voltar
                  </Button>
                )}
                <Button type="submit" variant="primary" loading={busy} loadingText="Enviando…">
                  {etapa === 2 ? 'Concluir cadastro' : 'Continuar ›'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={submitLogin} className="form-stack">
              <label>
                Email, CPF ou prontuário
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  placeholder={modo === 'equipe' ? 'assistencial@zelo.saude.gov.br' : '123.456.789-00'}
                />
              </label>

              <label>
                Senha
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                />
              </label>

              <Button
                type="submit"
                variant="primary"
                wide
                size="large"
                loading={busy}
                loadingText="Entrando…"
                style={{ marginTop: '6px' }}
              >
                Entrar no Zelo
              </Button>
            </form>
          )}

          <small style={{ display: 'block', marginTop: '18px', color: 'var(--muted)', lineHeight: 1.5 }}>
            {cadastrar
              ? 'O responsável é identificado na segunda etapa; o prontuário permanece sendo do paciente.'
              : 'Seus dados são integrados diretamente ao acompanhamento ambulatorial e domiciliar da equipe médica.'}
          </small>
        </div>
      </section>
    </div>
  );
}
