import React, { useState } from 'react';
import { Usuario, Medicacao, api } from '../../api';
import { Button } from '../../components/Button';
import { ModalDialog } from '../../components/ModalDialog';
import { EmptyState } from '../../components/EmptyState';
import { PageHeading } from '../../components/PageHeading';
import { DataCell } from '../../components/DataCell';
import { Icon } from '../../components/ui';

export interface MedicationScheduleProps {
  usuario: Usuario;
  medicacoes: Medicacao[];
  refresh: () => Promise<void>;
  notice: (kind: 'success' | 'error', text: string) => void;
}

export function MedicationSchedule({
  usuario,
  medicacoes,
  refresh,
  notice
}: MedicationScheduleProps): React.JSX.Element {
  const [medAba, setMedAba] = useState<'hoje' | 'receitas'>('hoje');
  const [loading, setLoading] = useState(false);
  const [modalResgate, setModalResgate] = useState(false);
  const [resgateNome, setResgateNome] = useState('Morfina 10mg');
  const [resgateObs, setResgateObs] = useState('');

  async function tomarRemedio(m: Medicacao) {
    setLoading(true);
    try {
      const nowHora = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const obsAtual = m.observacao
        ? `${m.observacao} · Confirmado às ${nowHora}`
        : `Confirmado às ${nowHora}`;

      await api.atualizarMedicacao(usuario.id, m.id, {
        status: 'tomada',
        observacao: obsAtual
      });
      await refresh();
      notice('success', `Dose de ${m.nome} confirmada com sucesso às ${nowHora}!`);
    } catch (err) {
      notice('error', err instanceof Error ? err.message : 'Não foi possível confirmar a dose.');
    } finally {
      setLoading(false);
    }
  }

  async function reabrirRemedio(m: Medicacao) {
    setLoading(true);
    try {
      await api.atualizarMedicacao(usuario.id, m.id, { status: 'ativo' });
      await refresh();
      notice('success', `Lembrete de ${m.nome} reaberto como pendente.`);
    } catch (err) {
      notice('error', err instanceof Error ? err.message : 'Não foi possível reabrir a dose.');
    } finally {
      setLoading(false);
    }
  }

  async function registrarDoseResgate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const nowHora = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      await api.criarMedicacao(usuario.id, {
        nome: resgateNome,
        dose: '1 dose de resgate SOS',
        horario: nowHora,
        frequencia: 'Uso pontual para crise aguda de dor',
        observacao: resgateObs
          ? `Dose de resgate tomada às ${nowHora}. Obs: ${resgateObs}`
          : `Dose de resgate tomada às ${nowHora}`,
        status: 'tomada',
        eh_dose_resgate: true,
        medico_prescritor: 'Prescrição de resgate domiciliar'
      });

      await refresh();
      setModalResgate(false);
      setResgateObs('');
      notice('success', `Dose de resgate (${resgateNome}) registrada às ${nowHora} no prontuário!`);
    } catch (err) {
      notice(
        'error',
        err instanceof Error ? err.message : 'Não foi possível registrar a dose de resgate.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-label="Medicações, Horários e Receitas Médicas">
      <PageHeading
        kicker="TRATAMENTO PRESCRITO"
        title="Medicações e Receitas"
        description="Consulte os remédios prescritos pela sua equipe médica, verifique os horários de hoje e confirme as doses tomadas com um toque."
        action={
          <Button variant="primary" onClick={() => setModalResgate(true)}>
            + Registrar Dose de Resgate
          </Button>
        }
      />

      {/* Navegação em Sub-abas */}
      <div className="sub-nav-tabs" role="tablist" aria-label="Abas de medicamentos">
        <button
          type="button"
          role="tab"
          aria-selected={medAba === 'hoje'}
          className={`sub-nav-btn ${medAba === 'hoje' ? 'active' : ''}`}
          onClick={() => setMedAba('hoje')}
        >
          <Icon name="clock"/> Horários de Hoje & Lembretes ({medicacoes.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={medAba === 'receitas'}
          className={`sub-nav-btn ${medAba === 'receitas' ? 'active' : ''}`}
          onClick={() => setMedAba('receitas')}
        >
          <Icon name="clipboard"/> Receitas Prescritas & Orientações de Uso
        </button>
      </div>

      {/* ABA 1: HORÁRIOS DE HOJE */}
      {medAba === 'hoje' && (
        <div className="remedy-schedule-list">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              flexWrap: 'wrap'
            }}
          >
            <p className="muted" style={{ margin: 0 }}>
              Toque em <b>Confirmar que já tomei</b> para registrar a ingestão no prontuário diário.
            </p>
            <Button variant="secondary" onClick={() => setModalResgate(true)}>
              <Icon name="bolt"/> Tomou remédio de resgate fora da hora?
            </Button>
          </div>

          {medicacoes.length === 0 ? (
            <EmptyState
              title="Nenhum medicamento ativo"
              text="A equipe médica ainda não cadastrou medicamentos neste prontuário."
            />
          ) : (
            medicacoes.map(m => (
              <article className="remedy-schedule-item" key={m.id}>
                <div className="remedy-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="remedy-time-badge" style={{ fontSize: '16px', padding: '4px 10px' }}>
                      <Icon name="clock"/> {m.horario || 'Horário flexível'}
                    </span>
                    <b>{m.nome}</b> · <span style={{ fontWeight: 700 }}>{m.dose}</span>
                    {m.eh_dose_resgate && (
                      <span className="pill" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
                        <><Icon name="bolt"/> Resgate</>
                      </span>
                    )}
                    {m.status === 'tomada' ? (
                      <span className="pill pill-success">
                        ✓ Dose tomada hoje
                      </span>
                    ) : (
                      <span className="pill pill-warning">
                        Pendente
                      </span>
                    )}
                  </div>

                  <span>
                    Frequência: {m.frequencia || 'Conforme prescrição'}{' '}
                    {m.medico_prescritor ? `· Prescritor: ${m.medico_prescritor}` : ''}
                  </span>

                  {m.observacao && (
                    <p>
                      <><Icon name="clipboard"/> <b>Orientações de uso:</b> {m.observacao}</>
                    </p>
                  )}
                </div>

                <div className="button-row">
                  {m.status === 'tomada' ? (
                    <Button
                      variant="quiet"
                      onClick={() => reabrirRemedio(m)}
                      disabled={loading}
                      title="Marcar como pendente novamente se tocou por engano"
                    >
                      Desfazer
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => tomarRemedio(m)}
                      loading={loading}
                      loadingText="Salvando…"
                      style={{ minHeight: '48px' }}
                    >
                      ✓ Confirmar que já tomei
                    </Button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* ABA 2: RECEITAS PRESCRITAS */}
      {medAba === 'receitas' && (
        <div className="remedy-schedule-list">
          <p className="muted" style={{ margin: '0 0 14px' }}>
            Relação completa de receitas médicas e orientações de uso emitidas pela equipe médica:
          </p>

          {medicacoes.length === 0 ? (
            <EmptyState
              title="Nenhuma receita registrada"
              text="Nenhuma receita prescrita pela equipe médica no momento."
            />
          ) : (
            medicacoes.map(m => (
              <article className="record-card" key={m.id} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--green)' }}>
                    <><Icon name="pill"/> {m.nome} · {m.dose}</>
                  </h3>
                  <span className="pill">{m.vigencia || 'Receita ativa'}</span>
                </div>

                <div className="data-grid" style={{ marginTop: '14px' }}>
                  <DataCell label="Posologia e Horários" value={`${m.frequencia} (Horário base: ${m.horario})`} />
                  <DataCell
                    label="Finalidade"
                    value={m.eh_dose_resgate ? 'Dose de resgate para crise de dor' : 'Uso fixo contínuo'}
                  />
                  <DataCell label="Médico Prescritor" value={m.medico_prescritor || 'Equipe Médica'} />
                  <DataCell
                    label="Instruções e Orientações de Uso"
                    value={m.observacao || 'Tomar com água conforme prescrição médica.'}
                  />
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* MODAL RÁPIDO PARA REGISTRAR DOSE DE RESGATE */}
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
              <select
                value={resgateNome}
                onChange={e => setResgateNome(e.target.value)}
                required
              >
                <option value="Morfina 10mg">Morfina 10mg (Comprimido / Gotas)</option>
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
    </section>
  );
}
