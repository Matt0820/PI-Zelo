import React, { FormEvent, useState } from 'react';
import logo from '../../../images/logo-zelo-verde.png';
import { Button } from '../../components/Button';
import { NoticeFeedback } from '../../components/NoticeFeedback';
import { AccessibilityBar } from '../../components/AccessibilityBar';

export interface NoticeState {
  kind: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

export interface LoginProps {
  entrar: (email: string, senha: string, expected: 'equipe' | 'paciente') => void;
  criarConta: (dados: unknown) => Promise<void>;
  busy: boolean;
  notice: NoticeState | null;
}

function getPasswordStrength(pwd: string): { label: string; score: number; color: string; hint: string } {
  if (!pwd) {
    return { label: 'Em branco', score: 0, color: '#9ca3af', hint: 'Mínimo de 8 caracteres com letras e números' };
  }
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 10 && /[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
  if (pwd.length >= 12 && /[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 1) {
    return { label: 'Fraca', score: 1, color: '#dc2626', hint: 'Mínimo de 8 caracteres contendo letras e números' };
  }
  if (score === 2) {
    return { label: 'Média', score: 2, color: '#d97706', hint: 'Boa senha. Inclua símbolos para deixá-la ainda mais forte' };
  }
  return { label: 'Forte', score: 3, color: '#16a34a', hint: 'Excelente! Senha segura para proteção do prontuário' };
}

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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');

  const [dados, setDados] = useState<Record<string, string>>({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    telefone: '',
    idade: '',
    sexo: '',
    cuidador_principal: '',
    parentesco_cuidador: '',
    prontuario: '',
    diagnostico_oncologico: '',
    tratamento_modificador: '',
    pps_score: '',
    comorbidades: '',
    alergias: '',
    proxima_consulta: ''
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

    // ETAPA 1: Conta e Dados Básicos (Acesso & Identificação)
    if (etapa === 0) {
      if (!dados.nome.trim()) {
        setErro('Informe o nome completo do paciente.');
        return;
      }
      if (!dados.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
        setErro('Informe um e-mail válido para o acesso do paciente.');
        return;
      }
      if (dados.senha.length < 8) {
        setErro('A senha de acesso deve possuir pelo menos 8 caracteres.');
        return;
      }
      if (!/[A-Za-z]/.test(dados.senha) || !/[0-9]/.test(dados.senha)) {
        setErro('A senha deve conter ao menos letras e números.');
        return;
      }
      if (dados.senha !== confirmarSenha) {
        setErro('A confirmação da senha não confere com a senha digitada.');
        return;
      }
      if (!dados.cpf.trim()) {
        setErro('Informe o CPF do paciente.');
        return;
      }
      if (!dados.telefone.trim()) {
        setErro('Informe o telefone de contato do paciente.');
        return;
      }
      if (!dados.idade.trim()) {
        setErro('Informe a idade do paciente.');
        return;
      }
      const idadeNum = Number(dados.idade);
      if (!Number.isInteger(idadeNum) || idadeNum < 0 || idadeNum > 125) {
        setErro('Informe uma idade válida entre 0 e 125 anos.');
        return;
      }
      if (!dados.sexo.trim()) {
        setErro('Selecione o sexo do paciente.');
        return;
      }

      setEtapa(1);
      return;
    }

    // ETAPA 2: Acompanhante e Responsável Legal
    if (etapa === 1) {
      if (!proprio) {
        if (!dados.cuidador_principal.trim() || !dados.parentesco_cuidador.trim()) {
          setErro(
            'Informe o nome e o grau de relação do responsável, ou marque a opção indicando que o paciente é seu próprio responsável.'
          );
          return;
        }
      }
      setEtapa(2);
      return;
    }

    // ETAPA 3: Histórico Clínico e Aceite dos Termos
    const numeric = (value: string) => (value.trim() ? Number(value) : null);

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
        cpf: dados.cpf.trim() || null,
        telefone: dados.telefone.trim() || null,
        idade: numeric(dados.idade),
        sexo: dados.sexo.trim() || null,
        cuidador_principal: proprio ? dados.nome.trim() : dados.cuidador_principal.trim() || null,
        parentesco_cuidador: proprio ? 'Próprio paciente' : dados.parentesco_cuidador.trim() || null,
        prontuario: dados.prontuario.trim() || null,
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

  const patientSteps = [
    {
      title: 'Conta e dados básicos',
      help: 'Etapa 1 de 3 · Acesso e identificação principal do paciente.'
    },
    {
      title: 'Acompanhante e responsável legal',
      help: 'Etapa 2 de 3 · Informe quem acompanha e apoia o paciente.'
    },
    {
      title: 'Histórico clínico e termos',
      help: 'Etapa 3 de 3 · Informações médicas complementares (opcionais) e termos.'
    }
  ];

  const current = patientSteps[etapa];
  const pwdStrength = getPasswordStrength(dados.senha);

  return (
    <div className="login-shell">
      {/* PAINEL INSTITUCIONAL LATERAL */}
      <section className="login-brand">
        <img
          src={logo}
          alt="Logotipo do Zelo"
          width="160"
          height="40"
          style={{ objectFit: 'contain' }}
        />
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

          <h2>{cadastrar ? current.title : 'Acessar o Zelo'}</h2>
          <p className="muted" style={{ margin: '0 0 16px' }}>
            {cadastrar
              ? current.help
              : modo === 'equipe'
              ? 'Entre com sua conta profissional para acessar a Central de Alertas e os prontuários.'
              : 'Entre com os dados da conta do paciente ou de seu cuidador responsável.'}
          </p>

          {/* Indicador visual das 3 etapas de cadastro */}
          {cadastrar && (
            <div
              style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}
              aria-label={`Etapa ${etapa + 1} de 3`}
            >
              {[0, 1, 2].map(idx => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: idx <= etapa ? 'var(--green)' : '#e2e8f0',
                    transition: 'background-color 0.25s ease'
                  }}
                />
              ))}
            </div>
          )}

          {notice && <NoticeFeedback kind={notice.kind} message={notice.text} />}
          {erro && <NoticeFeedback kind="error" message={erro} onDismiss={() => setErro('')} />}

          {cadastrar ? (
            <form onSubmit={submitSignup} className="form-stack">
              {/* ETAPA 1: CONTA E DADOS BÁSICOS */}
              {etapa === 0 && (
                <>
                  <label>
                    Nome completo do paciente *
                    <input
                      type="text"
                      value={dados.nome}
                      onChange={e => atualizar('nome', e.target.value)}
                      required
                      placeholder="Ex.: Maria de Lourdes Silva"
                    />
                  </label>

                  <label>
                    Email do paciente para acesso *
                    <input
                      type="email"
                      value={dados.email}
                      onChange={e => atualizar('email', e.target.value)}
                      required
                      spellCheck={false}
                      autoComplete="email"
                      placeholder="paciente@exemplo.com"
                    />
                  </label>

                  <label>
                    Senha de acesso *
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        value={dados.senha}
                        onChange={e => atualizar('senha', e.target.value)}
                        required
                        autoComplete="new-password"
                        placeholder="Mínimo de 8 caracteres"
                        style={{ paddingRight: '48px', width: '100%' }}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(v => !v)}
                        aria-label={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
                        title={mostrarSenha ? 'Ocultar senha' : 'Exibir senha'}
                        style={{
                          position: 'absolute',
                          right: '6px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px',
                          color: 'var(--muted)',
                          fontSize: '18px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {mostrarSenha ? '👁️‍🗨️' : '👁️'}
                      </button>
                    </div>
                  </label>

                  {/* Indicador de força de senha */}
                  {dados.senha && (
                    <div style={{ marginTop: '-8px', marginBottom: '4px' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '4px',
                          height: '5px',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          background: 'var(--paper-soft)'
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            background: pwdStrength.score >= 1 ? pwdStrength.color : 'transparent',
                            transition: 'background-color 0.2s ease'
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            background: pwdStrength.score >= 2 ? pwdStrength.color : 'transparent',
                            transition: 'background-color 0.2s ease'
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            background: pwdStrength.score >= 3 ? pwdStrength.color : 'transparent',
                            transition: 'background-color 0.2s ease'
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <span style={{ color: pwdStrength.color, fontWeight: 700 }}>
                          Força: {pwdStrength.label}
                        </span>
                        <span className="muted">{pwdStrength.hint}</span>
                      </div>
                    </div>
                  )}

                  <label>
                    Confirmar senha *
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={e => setConfirmarSenha(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Digite a senha novamente"
                    />
                  </label>

                  <label>
                    CPF do paciente *
                    <input
                      type="text"
                      value={dados.cpf}
                      onChange={e => atualizar('cpf', e.target.value)}
                      required
                      spellCheck={false}
                      placeholder="000.000.000-00"
                    />
                  </label>

                  <label>
                    Telefone do paciente *
                    <input
                      type="tel"
                      value={dados.telefone}
                      onChange={e => atualizar('telefone', e.target.value)}
                      required
                      placeholder="(41) 99999-0000"
                    />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label>
                      Idade *
                      <input
                        type="number"
                        min="0"
                        max="125"
                        value={dados.idade}
                        onChange={e => atualizar('idade', e.target.value)}
                        required
                        placeholder="Ex.: 68"
                      />
                    </label>

                    <label>
                      Sexo *
                      <select
                        value={dados.sexo}
                        onChange={e => atualizar('sexo', e.target.value)}
                        required
                        style={{ minHeight: '44px' }}
                      >
                        <option value="">Selecione…</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                        <option value="Prefiro não informar">Prefiro não informar</option>
                      </select>
                    </label>
                  </div>

                  <span className="helper">
                    Os dados cadastrais e de acesso são protegidos com sigilo e tratados conforme a LGPD e o CEP/UFPR nº 6.218.903.
                  </span>
                </>
              )}

              {/* ETAPA 2: ACOMPANHANTE E RESPONSÁVEL LEGAL */}
              {etapa === 1 && (
                <>
                  <label className="self-check" style={{ marginBottom: '12px' }}>
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

                  {proprio ? (
                    <div
                      style={{
                        background: 'var(--green-soft)',
                        border: '1px solid var(--green)',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        color: 'var(--green)',
                        marginBottom: '10px'
                      }}
                    >
                      <strong style={{ display: 'block', fontSize: '14px' }}>
                        ✓ Paciente como próprio responsável
                      </strong>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink)' }}>
                        O próprio paciente ({dados.nome || 'cadastrado'}) responderá diretamente pelos contatos de suporte e triagem.
                      </p>
                    </div>
                  ) : (
                    <>
                      <label>
                        Nome completo do responsável *
                        <input
                          type="text"
                          value={dados.cuidador_principal}
                          onChange={e => atualizar('cuidador_principal', e.target.value)}
                          required={!proprio}
                          placeholder="Ex.: João Carlos Silva"
                        />
                      </label>

                      <label>
                        Relação com o paciente *
                        <input
                          type="text"
                          value={dados.parentesco_cuidador}
                          onChange={e => atualizar('parentesco_cuidador', e.target.value)}
                          required={!proprio}
                          placeholder="Ex.: Filho(a), Cônjuge, Cuidador formal"
                        />
                      </label>
                    </>
                  )}

                  <span className="helper">
                    O responsável apoia a comunicação com a equipe multiprofissional quando o paciente necessita de auxílio.
                  </span>
                </>
              )}

              {/* ETAPA 3: HISTÓRICO CLÍNICO E TERMOS */}
              {etapa === 2 && (
                <>
                  <div
                    style={{
                      background: 'var(--paper-soft)',
                      border: '1px solid #e2e8f0',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      marginBottom: '4px'
                    }}
                  >
                    <strong style={{ color: 'var(--ink)', fontSize: '13.5px' }}>
                      📋 Histórico de Saúde (Opcional neste momento)
                    </strong>
                    <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.45 }}>
                      Estes dados apoiam a equipe médica na personalização do cuidado. Você pode deixá-los em branco e completar em outro momento no perfil.
                    </p>
                  </div>

                  <label>
                    Número do prontuário (opcional)
                    <input
                      type="text"
                      value={dados.prontuario}
                      onChange={e => atualizar('prontuario', e.target.value)}
                      placeholder="Ex.: HC-123456"
                    />
                  </label>

                  <label>
                    Diagnóstico oncológico (opcional)
                    <input
                      type="text"
                      value={dados.diagnostico_oncologico}
                      onChange={e => atualizar('diagnostico_oncologico', e.target.value)}
                      placeholder="Ex.: Neoplasia de cólon metastático"
                    />
                  </label>

                  <label>
                    Tratamento atual (opcional)
                    <input
                      type="text"
                      value={dados.tratamento_modificador}
                      onChange={e => atualizar('tratamento_modificador', e.target.value)}
                      placeholder="Ex.: Quimioterapia paliativa / Analgesia contínua"
                    />
                  </label>

                  <label>
                    PPS (0 a 100) (opcional)
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={dados.pps_score}
                      onChange={e => atualizar('pps_score', e.target.value)}
                      placeholder="Ex.: 70"
                    />
                  </label>

                  <label>
                    Comorbidades (opcional)
                    <input
                      type="text"
                      value={dados.comorbidades}
                      onChange={e => atualizar('comorbidades', e.target.value)}
                      placeholder="Ex.: Hipertensão arterial, Diabetes"
                    />
                  </label>

                  <label>
                    Alergias (opcional)
                    <input
                      type="text"
                      value={dados.alergias}
                      onChange={e => atualizar('alergias', e.target.value)}
                      placeholder="Ex.: Alergia a dipirona e contraste iodado"
                    />
                  </label>

                  <label>
                    Próxima consulta (opcional)
                    <input
                      type="date"
                      value={dados.proxima_consulta}
                      onChange={e => atualizar('proxima_consulta', e.target.value)}
                    />
                  </label>

                  <span className="helper" style={{ display: 'block', marginTop: '6px' }}>
                    Ao criar a conta, você concorda com os termos de uso e a política de privacidade da Plataforma Zelo.
                  </span>
                </>
              )}

              {/* BOTÕES DE NAVEGAÇÃO ENTRE ETAPAS */}
              <div className="button-row" style={{ marginTop: '12px' }}>
                {etapa > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEtapa(v => v - 1);
                      setErro('');
                    }}
                  >
                    ‹ Voltar
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
                  spellCheck={false}
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

          <small
            style={{
              display: 'block',
              marginTop: '18px',
              color: 'var(--muted)',
              lineHeight: 1.5
            }}
          >
            {cadastrar
              ? 'Seus dados de saúde são protegidos com sigilo e tratados conforme a LGPD e o CEP/UFPR nº 6.218.903.'
              : 'Seus dados são integrados diretamente ao acompanhamento ambulatorial e domiciliar da equipe médica.'}
          </small>
        </div>
      </section>
    </div>
  );
}
