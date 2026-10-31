import React from 'react';
import { Alerta, Usuario } from '../../api';
import { Button } from '../../components/Button';

export interface AlertCardProps {
  alert: Alerta;
  patient?: Usuario;
  openPatient: (p: Usuario) => void;
  update: (a: Alerta, state: string) => void;
}

export function AlertCard({
  alert,
  patient,
  openPatient,
  update
}: AlertCardProps): React.JSX.Element {
  const dataFmt = new Date(alert.criado_em).toLocaleString('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo'
  });

  const isGrave = alert.severidade === 'grave';
  const isNovo = alert.estado === 'Novo';

  return (
    <article className={`alert-card ${isGrave ? 'alert-critical' : ''} ${isNovo ? 'alert-new' : ''}`}>
      <div className="alert-top">
        {isGrave && isNovo && (
          <span className="beacon-indicator" title="Alerta crítico recente que requer triagem imediata">
            <span className="beacon-dot" aria-hidden="true" />
            Ação Imediata
          </span>
        )}
        <span
          className={`severity severity-${isGrave ? 'high' : 'medium'}`}
        >
          {isGrave ? 'Prioridade alta' : alert.severidade}
        </span>
        <span className="state">
          {alert.estado === 'Em revisao' ? 'Em revisão' : alert.estado}
        </span>
      </div>

      <h3 style={{ margin: '10px 0 6px', fontSize: '18px' }}>{alert.titulo}</h3>
      <p style={{ margin: '0 0 10px', color: 'var(--muted)', lineHeight: 1.5 }}>
        {alert.descricao}
      </p>

      <small style={{ color: 'var(--muted)' }}>
        {dataFmt}
        {patient ? ` · Paciente: ${patient.nome}` : ''}
      </small>

      <div className="button-row" style={{ marginTop: '14px' }}>
        {patient && (
          <Button
            variant="secondary"
            onClick={() => openPatient(patient)}
            title="Acessar o histórico completo, medicações e evoluções deste paciente"
          >
            Abrir prontuário
          </Button>
        )}
        {alert.estado === 'Novo' && (
          <Button
            variant="secondary"
            onClick={() => update(alert, 'Em revisao')}
            title="Assumir este chamado e colocar o caso em revisão no seu plantão"
          >
            Iniciar revisão
          </Button>
        )}
        {alert.estado !== 'Tratado' && (
          <Button
            variant="primary"
            onClick={() => update(alert, 'Tratado')}
            title="Concluir o atendimento clínico deste alerta e retirá-lo da fila de pendências"
          >
            Registrar conduta e tratar
          </Button>
        )}
      </div>
    </article>
  );
}
