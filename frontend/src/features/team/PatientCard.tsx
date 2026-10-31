/**
 * Resume um paciente em um cartão que abre seu prontuário.
 */

import React from 'react';
import { Usuario } from '../../api';

/**
 * Paciente resumido e ação para abrir o prontuário.
 */
export interface PatientCardProps {
  patient: Usuario;
  onClick: () => void;
}

/**
 * Apresenta o paciente como atalho para consulta do prontuário.
 */
export function PatientCard({ patient, onClick }: PatientCardProps): React.JSX.Element {
  return (
    <button
      type="button"
      className="patient-card"
      onClick={onClick}
      aria-label={`Abrir prontuário de ${patient.nome}`}
    >
      <span className="patient-avatar" aria-hidden="true">
        {patient.nome.slice(0, 1).toUpperCase()}
      </span>
      <span className="patient-card-body">
        <b>{patient.nome}</b>
        <small>
          {patient.prontuario ? `Prontuário ${patient.prontuario}` : 'Prontuário não informado'}
        </small>
        <small>{patient.diagnostico_oncologico || 'Diagnóstico não informado'}</small>
      </span>
      <span className="chevron" aria-hidden="true">
        ›
      </span>
    </button>
  );
}
