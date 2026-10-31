import React, { useState } from 'react';
import { Usuario, ESAS, Medicacao, Orientacao, LocalDor, api } from '../../api';
import { Button } from '../../components/Button';
import { MetricCard } from '../../components/MetricCard';
import { PageHeading } from '../../components/PageHeading';
import { EmptyState } from '../../components/EmptyState';
import { ModalDialog } from '../../components/ModalDialog';

export interface PatientHomeProps {
  usuario: Usuario;
  esas: ESAS[];
  medicacoes: Medicacao[];
  orientacoes: Orientacao[];
  dor: LocalDor[];
  onNavigate: (page: 'inicio' | 'esas' | 'chatbot' | 'mapa' | 'medicacoes' | 'orientacoes') => void;
  onOpenChatbotComDor: (dorScore: number) => void;
  refresh: () => Promise<void>;
  notice: (kind: 'success' | 'error', text: string) => void;
}

export function PatientHome({
  usuario,
  esas,
  medicacoes,
  orientacoes,
  dor,
  onNavigate,
  onOpenChatbotComDor,
  refresh,
  notice
}: PatientHomeProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [modalResgate, setModalResgate] = useState(false);
  const [resgateNome, setResgateNome] = useState('Morfina 10mg');
  const [resgateObs, setResgateObs] = useState('');

  const lastESAS = esas[0];
  const lastScoreMax = lastESAS
    ? Math.max(
        lastESAS.dor,
        lastESAS.cansaco,
        lastESAS.nausea,
        lastESAS.depressao,
        lastESAS.ansiedade,
        lastESAS.sonolencia,
        lastESAS.apetite,
        lastESAS.mal_estar,
        lastESAS.falta_de_ar,
        lastESAS.constipacao || 0
      )
    : 0;

  const temGraveRecente = lastScoreMax >= 7;

  // Próximo remédio programado para hoje
  const remediosOrdenados = [...medicacoes].sort((a, b) => (a.horario || '').localeCompare(b.horario || ''));
  const proximoRemedio = remediosOrdenados.find(m => m.status !== 'tomada') || remediosOrdenados[0];

  async function tomarRemedio(m: Medicacao) {
    setLoading(true);
    try {
      const nowHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      await api.confirmarMedicacao(usuario.id, m.id);
      await refresh();
      notice('success', `Dose de ${m.nome} confirmada com sucesso às ${nowHora}!`);
    } catch (err) {
      notice('error', err instanceof Error ? err.message : 'Não foi possível confirmar a dose.');
    } finally {
      setLoading(false);
    }
  }

  async function registrarDoseResgate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const nowHora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      await api.registrarDoseResgate(usuario.id, {
        nome: resgateNome,
        horario: nowHora,
        observacao: resgateObs.trim() || null
      });
      await refresh();
      setModalResgate(false);
      setResgateObs('');
      notice('success', `Dose de resgate (${resgateNome}) registrada com sucesso no prontuário!`);
    } catch (err) {
      notice('error', err instanceof Error ? err.message : 'Não foi possível registrar a dose.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div aria-label="Página Inicial do Paciente">
      <PageHeading
        kicker="ÁREA DO PACIENTE & CUIDADOR"
        title={`Olá, ${usuario.nome.split(' ')[0]}.`}
        description="Acompanhe seus horários de remédios, avisos da equipe médica e envie seus sintomas diários para a equipe médica."
        action={
          <div className="button-row">
            <Button variant="primary" onClick={() => onNavigate('esas')}>
              Avaliar Sintomas (ESAS)
            </Button>
            <Button variant="secondary" onClick={() => setModalResgate(true)}>
              + Tomei Dose de Resgate
            </Button>
          </div>
        }
      />

      {/* 1. SEÇÃO DE RETORNO E AVISOS DA EQUIPE MÉDICA */}
      <article className="record-card record-wide" style={{ marginBottom: '24px', borderLeft: '5px solid var(--green)' }}>
        <div className="section-title" style={{ marginTop: 0 }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--green)' }}>RETORNO DA EQUIPE DE CUIDADOS</span>
            <h2 style={{ fontSize: '20px' }}>Avisos e Orientações Médicas</h2>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('orientacoes')}>
            Ver todos ({orientacoes.length})
          </Button>
        </div>

        {orientacoes.length === 0 ? (
          <EmptyState
            title="Nenhum aviso novo no momento"
            text="Sua equipe de cuidados paliativos acompanha seus registros continuamente. Quando enviarem orientações ou retornos, eles aparecerão aqui."
          />
        ) : (
          <div className="remedy-schedule-list">
            {orientacoes.slice(0, 3).map(o => (
              <div
                key={o.id}
                className="history-item notice-item-card"
                style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <b style={{ color: 'var(--green)', fontSize: '16px' }}>{o.titulo}</b>
                  <span className={`pill ${o.prioridade === 'alta' ? 'severity-high' : ''}`}>
                    Prioridade {o.prioridade}
                  </span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '15px', color: 'var(--ink)', lineHeight: 1.55 }}>
                  {o.descricao}
                </p>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* 2. LEMBRETE E ALERTA DE MEDICAÇÃO DO DIA */}
      <div className={`remedy-alert-card ${proximoRemedio?.eh_dose_resgate ? 'urgent' : ''}`}>
        <div className="remedy-alert-top">
          <div>
            <span className="eyebrow" style={{ color: 'var(--green)' }}>LEMBRETE E ALERTA DE MEDICAÇÃO</span>
            <h2 style={{ margin: '4px 0', fontSize: '22px', color: 'var(--ink)' }}>Próximo Remédio Programado</h2>
          </div>
          {proximoRemedio && (
            <span className="remedy-time-badge">{proximoRemedio.horario || 'Horário flexível'}</span>
          )}
        </div>

        {proximoRemedio ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '16px', lineHeight: 1.5 }}>
              <strong>{proximoRemedio.nome}</strong> · {proximoRemedio.dose} · ({proximoRemedio.frequencia})
              {proximoRemedio.eh_dose_resgate && (
                <span className="pill" style={{ marginLeft: '8px', background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                  Resgate
                </span>
              )}
              {proximoRemedio.observacao && (
                <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--muted)', background: 'var(--paper)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <b>Orientação da receita:</b> {proximoRemedio.observacao}
                </p>
              )}
            </div>

            <div className="button-row" style={{ marginTop: '4px' }}>
              {proximoRemedio.status === 'tomada' ? (
                <span className="pill pill-success" style={{ fontSize: '14px', padding: '8px 14px' }}>
                  ✓ Esta dose já foi confirmada hoje
                </span>
              ) : (
                <Button
                  variant="primary"
                  size="large"
                  onClick={() => tomarRemedio(proximoRemedio)}
                  loading={loading}
                  loadingText="Confirmando…"
                  style={{ minHeight: '48px' }}
                >
                  Confirmar que já tomei {proximoRemedio.nome}
                </Button>
              )}
              <Button variant="secondary" onClick={() => setModalResgate(true)}>
                + Registrar Dose de Resgate Extra
              </Button>
              <Button variant="quiet" onClick={() => onNavigate('medicacoes')}>
                Ver todos os horários e receitas ›
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="muted" style={{ margin: '0 0 12px' }}>
              Nenhum medicamento ativo registrado pela sua equipe médica para hoje.
            </p>
            <Button variant="secondary" onClick={() => setModalResgate(true)}>
              + Registrar Dose de Resgate
            </Button>
          </div>
        )}
      </div>

      {/* 3. ALERTA ESAS E DISPARO DIRETO DO CHATBOT ZELO */}
      {temGraveRecente && (
        <aside
          className="clinical-alert-callout"
          role="alert"
          aria-label="Aviso Clínico de Sintoma Intenso"
        >
          <div className="alert-header">
            <div>
              <span className="alert-tag">Atenção Prioritária</span>
              <h3>
                Aviso Clínico: Sua última avaliação registrou sintoma intenso (Nota {lastScoreMax}/10)
              </h3>
              <p>
                A equipe médica foi notificada. O Chatbot Zelo está pronto para avaliar e direcionar o seu alívio imediato no domicílio.
              </p>
            </div>
          </div>

          <div className="button-row">
            <Button
              variant="danger"
              size="large"
              onClick={() => onOpenChatbotComDor(lastESAS.dor || lastScoreMax)}
              style={{ minHeight: '50px' }}
            >
              Abrir Chatbot Zelo para Cuidado da Dor ›
            </Button>
            <a
              href="tel:4133330000"
              className="button button-call"
              style={{ minHeight: '50px' }}
            >
              Ligar para a Equipe Médica: (41) 3333-0000
            </a>
          </div>
        </aside>
      )}

      {/* 4. MÉTRICAS E INDICADORES DO PACIENTE */}
      <div className="metric-grid">
        <MetricCard label="Avaliações ESAS" value={esas.length} />
        <MetricCard label="Medicações ativas" value={medicacoes.length} />
        <MetricCard label="Avisos da equipe" value={orientacoes.length} />
        <MetricCard label="Locais no mapa" value={dor.length} />
      </div>

      {/* 5. ÚLTIMA AVALIAÇÃO ESAS */}
      <article className="record-card record-wide">
        <div className="section-title" style={{ marginTop: 0 }}>
          <div>
            <h2>Última Avaliação de Sintomas Enviada</h2>
            <p>
              {lastESAS
                ? `Enviada em ${new Date(lastESAS.data_registro).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })} · Gravidade: ${lastESAS.gravidade_maxima}`
                : 'Nenhuma avaliação registrada ainda.'}
            </p>
          </div>
          <Button variant="primary" onClick={() => onNavigate('esas')}>
            Fazer Nova Avaliação ESAS
          </Button>
        </div>

        {lastESAS && (
          <div className="score-grid">
            <div className="score"><span>Dor</span><b className={lastESAS.dor >= 7 ? 'score-high' : ''}>{lastESAS.dor}/10</b></div>
            <div className="score"><span>Cansaço</span><b className={lastESAS.cansaco >= 7 ? 'score-high' : ''}>{lastESAS.cansaco}/10</b></div>
            <div className="score"><span>Náusea</span><b className={lastESAS.nausea >= 7 ? 'score-high' : ''}>{lastESAS.nausea}/10</b></div>
            <div className="score"><span>Tristeza</span><b className={lastESAS.depressao >= 7 ? 'score-high' : ''}>{lastESAS.depressao}/10</b></div>
            <div className="score"><span>Ansiedade</span><b className={lastESAS.ansiedade >= 7 ? 'score-high' : ''}>{lastESAS.ansiedade}/10</b></div>
            <div className="score"><span>Sonolência</span><b className={lastESAS.sonolencia >= 7 ? 'score-high' : ''}>{lastESAS.sonolencia}/10</b></div>
            <div className="score"><span>Falta de apetite</span><b className={lastESAS.apetite >= 7 ? 'score-high' : ''}>{lastESAS.apetite}/10</b></div>
            <div className="score"><span>Mal-estar</span><b className={lastESAS.mal_estar >= 7 ? 'score-high' : ''}>{lastESAS.mal_estar}/10</b></div>
            <div className="score"><span>Falta de ar</span><b className={lastESAS.falta_de_ar >= 7 ? 'score-high' : ''}>{lastESAS.falta_de_ar}/10</b></div>
            <div className="score"><span>Constipação</span><b className={(lastESAS.constipacao || 0) >= 7 ? 'score-high' : ''}>{lastESAS.constipacao ?? '—'}/10</b></div>
          </div>
        )}
      </article>

      {/* 6. ATALHOS RÁPIDOS DA HOME */}
      <div className="quick-links" style={{ marginTop: '20px' }}>
        <button className="quick-link" onClick={() => onNavigate('medicacoes')}>
          <span>Verificar Medicamentos e Horários</span><b>›</b>
        </button>
        <button className="quick-link" onClick={() => onNavigate('mapa')}>
          <span><b>◎</b> Registrar Local no Mapa Corporal</span><b>›</b>
        </button>
        <button className="quick-link" onClick={() => onNavigate('orientacoes')}>
          <span><b>i</b> Consultar Todas as Orientações</span><b>›</b>
        </button>
      </div>

      {/* MODAL RÁPIDO DE RESGATE */}
      {modalResgate && (
        <ModalDialog
          title="Registrar Dose de Resgate (Crise de Dor)"
          kicker="ALÍVIO EMERGENCIAL DOMICILIAR"
          onClose={() => setModalResgate(false)}
        >
          <form onSubmit={registrarDoseResgate} className="form-stack">
            <p className="muted" style={{ margin: '0 0 10px' }}>
              Utilize esta opção se você precisou tomar uma medicação extra para crise aguda de dor prescrita pelo seu médico.
            </p>

            <label>
              Qual remédio de resgate você tomou?
              <select value={resgateNome} onChange={e => setResgateNome(e.target.value)} required>
                <option value="Morfina 10mg">Morfina 10mg</option>
                <option value="Morfina 30mg">Morfina 30mg</option>
                <option value="Codeína 30mg">Codeína 30mg</option>
                <option value="Gabapentina 300mg">Gabapentina 300mg</option>
                <option value="Dipirona 500mg">Dipirona 500mg a 1g</option>
                <option value="Paracetamol 500mg">Paracetamol 500mg</option>
                <option value="Outro medicamento de resgate">Outro medicamento prescrito</option>
              </select>
            </label>

            <label>
              Como estava a dor antes do remédio?
              <textarea
                rows={2}
                value={resgateObs}
                onChange={e => setResgateObs(e.target.value)}
                placeholder="Ex.: Dor forte em pontada nas costas nota 8; tomei com água."
              />
            </label>

            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setModalResgate(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={loading} loadingText="Registrando…">
                Confirmar Registro de Resgate
              </Button>
            </div>
          </form>
        </ModalDialog>
      )}
    </div>
  );
}
