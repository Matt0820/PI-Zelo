import React from 'react';
import { Usuario, ESAS, Triagem, LocalDor, Medicacao, Orientacao, Evolucao } from '../../api';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeading } from '../../components/PageHeading';
import { DataCell } from '../../components/DataCell';
import { TeamModalType } from './TeamModal';

export interface PatientRecordProps {
  patient: Usuario;
  details: {
    esas: ESAS[];
    triagens: Triagem[];
    dor: LocalDor[];
    medicacoes: Medicacao[];
    orientacoes: Orientacao[];
    evolucoes: Evolucao[];
  };
  openModal: (m: TeamModalType) => void;
  back: () => void;
  busy: boolean;
  notice: (kind: 'success' | 'error', text: string) => void;
  refresh: () => Promise<void>;
}

const symptomNames: Array<{ key: keyof Pick<ESAS, 'dor' | 'cansaco' | 'nausea' | 'depressao' | 'ansiedade' | 'sonolencia' | 'apetite' | 'mal_estar' | 'falta_de_ar' | 'constipacao'>; label: string }> = [
  { key: 'dor', label: 'Dor' },
  { key: 'cansaco', label: 'Cansaço' },
  { key: 'nausea', label: 'Náusea' },
  { key: 'depressao', label: 'Tristeza' },
  { key: 'ansiedade', label: 'Ansiedade' },
  { key: 'sonolencia', label: 'Sonolência' },
  { key: 'apetite', label: 'Falta de apetite' },
  { key: 'mal_estar', label: 'Mal-estar' },
  { key: 'falta_de_ar', label: 'Falta de ar' },
  { key: 'constipacao', label: 'Constipação' }
];

export function PatientRecord({
  patient,
  details,
  openModal,
  back,
  busy,
  notice,
  refresh
}: PatientRecordProps): React.JSX.Element {
  const last = details.esas[0];
  const diagnosisNote = details.evolucoes.find(
    e => e.tipo_evolucao === 'Diagnóstico e indicação de cuidados paliativos'
  );
  const diagnosedInNote = diagnosisNote?.conteudo.match(/Diagnóstico:\s*([^\n]+)/)?.[1];
  const palliativeReason = diagnosisNote?.conteudo
    .split('Motivo da indicação de cuidados paliativos:')[1]
    ?.trim();
  const appointment = details.evolucoes.find(e => e.tipo_evolucao === 'Agendamento');

  const dateFmt = (value: string) =>
    new Date(value).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Sao_Paulo' });

  return (
    <section aria-label={`Prontuário de ${patient.nome}`}>
      <button type="button" className="back-link" onClick={back} aria-label="Voltar para a lista de pacientes">
        ‹ Voltar aos pacientes
      </button>

      <PageHeading
        kicker="PRONTUÁRIO DO PACIENTE · EQUIPE MÉDICA"
        title={patient.nome}
        description={`${patient.prontuario ? `Prontuário Zelo ${patient.prontuario}` : 'Sem número de prontuário'} · ${patient.idade ? `${patient.idade} anos` : 'Idade não informada'} · ${patient.cuidador_principal ? `Responsável: ${patient.cuidador_principal}` : 'Responsável não informado'}`}
      />

      {/* Barra de Ações Rápidas do Médico/Enfermeiro */}
      <div className="action-bar">
        <Button variant="primary" onClick={() => openModal('medicacao')}>
          + Prescrever medicamento
        </Button>
        <Button variant="secondary" onClick={() => openModal('diagnostico')}>
          Enviar diagnóstico
        </Button>
        <Button variant="secondary" onClick={() => openModal('orientacao')}>
          Enviar orientação
        </Button>
        <Button variant="secondary" onClick={() => openModal('agendamento')}>
          Enviar agendamento
        </Button>
      </div>

      {busy && <div className="loading" role="status">Atualizando prontuário…</div>}

      <div className="record-grid">
        {/* CONTEXTO CLÍNICO */}
        <article className="record-card record-wide">
          <div className="section-title" style={{ marginTop: 0 }}>
            <div>
              <h2>Contexto Clínico & Diagnóstico</h2>
              <p>Dados cadastrados no perfil assistencial do paciente.</p>
            </div>
            <span className="pill">{patient.perfil}</span>
          </div>

          <dl className="data-grid">
            <DataCell label="Diagnóstico Oncológico" value={patient.diagnostico_oncologico || diagnosedInNote} />
            <DataCell label="Motivo dos Cuidados Paliativos" value={palliativeReason} />
            <DataCell label="Tratamento Modificador Atual" value={patient.tratamento_modificador} />
            <DataCell label="Funcionalidade PPS" value={patient.pps_score ? `${patient.pps_score}%` : null} />
            <DataCell label="Comorbidades Associadas" value={patient.comorbidades} />
            <DataCell label="Alergias Medicamentosas" value={patient.alergias} />
            <DataCell label="Próximo Agendamento" value={patient.proxima_consulta || appointment?.conteudo} />
            <DataCell label="Telefone de Contato" value={patient.telefone} />
            <DataCell
              label="Cuidador Responsável"
              value={patient.cuidador_principal ? `${patient.cuidador_principal}${patient.parentesco_cuidador ? ` (${patient.parentesco_cuidador})` : ''}` : null}
            />
          </dl>
        </article>

        {/* ÚLTIMA AVALIAÇÃO ESAS */}
        <article className="record-card">
          <h2>Avaliação ESAS mais recente</h2>
          {last ? (
            <>
              <p className="muted" style={{ margin: '4px 0 12px' }}>
                {dateFmt(last.data_registro)}
              </p>
              <div className="score-grid">
                {symptomNames.map(s => (
                  <div key={s.key} className="score">
                    <span>{s.label}</span>
                    <b className={Number(last[s.key] || 0) >= 7 ? 'score-high' : ''}>
                      {last[s.key] ?? '—'}/10
                    </b>
                  </div>
                ))}
              </div>
              {last.observacao && <p className="record-note" style={{ marginTop: '12px' }}>{last.observacao}</p>}
            </>
          ) : (
            <EmptyState title="Sem avaliação recente" text="O paciente ainda não enviou uma avaliação de sintomas." />
          )}

          <h3 style={{ marginTop: '20px', fontSize: '16px' }}>Histórico recente de sintomas</h3>
          {details.esas.slice(1, 4).length > 0 ? (
            details.esas.slice(1, 4).map(e => (
              <p className="history-line" key={e.id}>
                {dateFmt(e.data_registro)} · Dor {e.dor}/10 · Cansaço {e.cansaco}/10 · Gravidade: {e.gravidade_maxima}
              </p>
            ))
          ) : (
            <small className="muted">Nenhum registro anterior adicional.</small>
          )}
        </article>

        {/* MAPA DA DOR E APONTAMENTOS CORPORAIS */}
        <article className="record-card">
          <h2>Mapa da dor e lesões</h2>
          {details.dor.length ? (
            details.dor.map(d => (
              <div className="history-item" key={d.id}>
                <b>{d.regiao_anatomica} · {d.tipo_ocorrencia}</b>
                <span>Intensidade {d.intensidade}/10 · {dateFmt(d.criado_em)}</span>
                {d.observacao && <p>{d.observacao}</p>}
                {d.medicamento_associado && <small>Medicação associada: {d.medicamento_associado}</small>}
              </div>
            ))
          ) : (
            <EmptyState title="Sem locais registrados" text="Os apontamentos feitos pelo paciente na silhueta corporal aparecerão aqui." />
          )}
        </article>

        {/* TRIAGENS DO CHATBOT ZELO */}
        <article className="record-card">
          <h2>Triagens de dor (Chatbot Zelo)</h2>
          {details.triagens.length ? (
            details.triagens.slice(0, 4).map(t => (
              <div className="history-item" key={t.id}>
                <b>Dor {t.intensidade_dor}/10 · Característica: {t.caracteristica_dor}</b>
                <span>Duração: {t.tipo_dor} · {dateFmt(t.data_triagem)}</span>
                <p>
                  Resgate tomado: {t.fez_dose_resgate ? 'Sim' : 'Não'} · Remédios efetivos:{' '}
                  {t.medicamentos_efetivos ? 'Sim' : 'Não'}
                  {t.solicitou_agendamento ? ' · Solicitou contato prioritário' : ''}
                </p>
              </div>
            ))
          ) : (
            <EmptyState title="Sem triagens recentes" text="Não há triagem de dor registrada para este paciente." />
          )}
        </article>

        {/* ORIENTAÇÕES ENVIADAS PELA EQUIPE */}
        <article className="record-card">
          <h2>Orientações enviadas</h2>
          {details.orientacoes.length ? (
            details.orientacoes.slice(0, 5).map(o => (
              <div className="history-item" key={o.id}>
                <b>{o.titulo}</b>
                <span>{o.categoria} · Prioridade {o.prioridade} · {dateFmt(o.atualizada_em)}</span>
                <p>{o.descricao}</p>
              </div>
            ))
          ) : (
            <EmptyState title="Sem orientações" text="Envie uma orientação para ela aparecer também no aplicativo do paciente." />
          )}
        </article>

        {/* MEDICAÇÕES E PRESCRIÇÕES DO PACIENTE */}
        <article className="record-card">
          <div className="section-title" style={{ marginTop: 0 }}>
            <div>
              <h2>Medicações e Prescrições</h2>
              <p>Receitas ativas vinculadas ao paciente.</p>
            </div>
            <Button variant="primary" onClick={() => openModal('medicacao')}>
              + Prescrever
            </Button>
          </div>

          {details.medicacoes.length ? (
            details.medicacoes.map(m => (
              <div className="history-item" key={m.id} style={{ padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <b>{m.nome} · {m.dose}</b>
                  <span className="pill">{m.horario} ({m.frequencia})</span>
                </div>
                {m.observacao && <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Orientações: {m.observacao}</p>}
                {m.eh_dose_resgate && (
                  <small style={{ color: 'var(--danger)', fontWeight: 700 }}>
                    Dose de resgate autorizada
                  </small>
                )}
              </div>
            ))
          ) : (
            <EmptyState title="Sem medicações" text="Prescreva a primeira medicação para o paciente." />
          )}
        </article>

        {/* EVOLUÇÕES CLÍNICAS */}
        <article className="record-card record-wide">
          <h2>Evoluções clínicas</h2>
          {details.evolucoes.length ? (
            details.evolucoes.slice(0, 8).map(e => (
              <div className="history-item" key={e.id}>
                <b>{e.tipo_evolucao}</b>
                <span>{e.profissional_nome} ({e.cargo}) · {dateFmt(e.criado_em)}</span>
                <p style={{ whiteSpace: 'pre-line' }}>{e.conteudo}</p>
                {e.conduta_plano && <small style={{ color: 'var(--green)', fontWeight: 600 }}>Conduta/Plano: {e.conduta_plano}</small>}
              </div>
            ))
          ) : (
            <EmptyState title="Sem evoluções registradas" text="Diagnósticos, justificativas e condutas enviadas pela equipe serão registradas aqui." />
          )}
        </article>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Button
          variant="quiet"
          onClick={() => refresh().then(() => notice('success', 'Prontuário atualizado com o servidor.'))}
        >
          Atualizar dados do prontuário
        </Button>
      </div>
    </section>
  );
}
