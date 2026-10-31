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
    timeStyle: 'short'
  });

  return (
    <article className="alert-card">
      <div className="alert-top">
        <span
          className={`severity severity-${alert.severidade === 'grave' ? 'high' : 'medium'}`}
        >
          {alert.severidade === 'grave' ? 'Prioridade alta' : alert.severidade}
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
          <Button variant="secondary" onClick={() => openPatient(patient)}>
            Abrir prontuário
          </Button>
        )}
        {alert.estado === 'Novo' && (
          <Button variant="secondary" onClick={() => update(alert, 'Em revisao')}>
            Iniciar revisão
          </Button>
        )}
        {alert.estado !== 'Tratado' && (
          <Button variant="primary" onClick={() => update(alert, 'Tratado')}>
            Registrar conduta e tratar
          </Button>
        )}
      </div>
    </article>
  );
}
