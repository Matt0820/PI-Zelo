import React from 'react';
import { Orientacao } from '../../api';
import { EmptyState } from '../../components/EmptyState';
import { PageHeading } from '../../components/PageHeading';

export interface PatientOrientationsProps {
  orientacoes: Orientacao[];
}

export function PatientOrientations({ orientacoes }: PatientOrientationsProps): React.JSX.Element {
  return (
    <section aria-label="Avisos e Orientações Médicas">
      <PageHeading
        kicker="EQUIPE DE CUIDADOS PALIATIVOS"
        title="Avisos e Orientações Médicas"
        description="Comunicações, pareceres e orientações clínicas enviadas pela equipe médica de saúde para seu cuidado domiciliar."
      />

      {orientacoes.length === 0 ? (
        <EmptyState
          title="Nenhuma orientação recebida"
          text="Quando a equipe médica ou de enfermagem emitir um parecer ou orientação de cuidado, ela aparecerá aqui."
        />
      ) : (
        <div className="remedy-schedule-list">
          {orientacoes.map(o => {
            const dataFmt = new Date(o.atualizada_em).toLocaleString('pt-BR', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'America/Sao_Paulo'
            });

            return (
              <article
                className="record-card"
                key={o.id}
                style={{
                  marginBottom: '14px',
                  borderLeft: `5px solid ${o.prioridade === 'alta' ? 'var(--danger)' : 'var(--green)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)' }}>
                    {o.titulo}
                  </h3>
                  <span className={`pill ${o.prioridade === 'alta' ? 'severity-high' : ''}`}>
                    Prioridade {o.prioridade} · {dataFmt}
                  </span>
                </div>
                <p style={{ margin: '12px 0 0', fontSize: '15.5px', lineHeight: 1.6, color: 'var(--ink)', whiteSpace: 'pre-line' }}>
                  {o.descricao}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
