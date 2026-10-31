/**
 * Seleciona a tela do paciente e conecta cada jornada aos dados e callbacks compartilhados.
 */

import React, { useState } from 'react';
import { Usuario, ESAS, Medicacao, Orientacao, LocalDor } from '../../api';
import { PatientHome } from './PatientHome';
import { ESASWizard } from './ESASWizard';
import { MedicationSchedule } from './MedicationSchedule';
import { PatientOrientations } from './PatientOrientations';
import { PainBodyMap } from './PainBodyMap';
import { ChatbotZelo } from '../chatbot/ChatbotZelo';
import { AccessibilityPage } from '../accessibility';

/**
 * Identificadores internos das telas disponíveis ao paciente.
 */
export type PatientPage = 'inicio' | 'esas' | 'chatbot' | 'mapa' | 'medicacoes' | 'orientacoes' | 'acessibilidade';

/**
 * Página selecionada, dados da API e operações fornecidas pelo componente raiz.
 */
export interface PatientAreaProps {
  usuario: Usuario;
  page: PatientPage;
  setPage: (p: PatientPage) => void;
  data: {
    esas: ESAS[];
    medicacoes: Medicacao[];
    orientacoes: Orientacao[];
    dor: LocalDor[];
  };
  refresh: () => Promise<void>;
  notice: (kind: 'success' | 'error', text: string) => void;
}

/**
 * Renderiza a jornada escolhida e repassa dados e callbacks às telas.
 */
export function PatientArea({
  usuario,
  page,
  setPage,
  data,
  refresh,
  notice
}: PatientAreaProps): React.JSX.Element {
  const [chatbotDor, setChatbotDor] = useState<number>(8);

  return (
    <section className="patient-area-shell">
      {page === 'inicio' && (
        <PatientHome
          usuario={usuario}
          esas={data.esas}
          medicacoes={data.medicacoes}
          orientacoes={data.orientacoes}
          dor={data.dor}
          onNavigate={setPage}
          onOpenChatbotComDor={dor => {
            setChatbotDor(dor);
            setPage('chatbot');
          }}
          refresh={refresh}
          notice={notice}
        />
      )}

      {page === 'esas' && (
        <ESASWizard
          usuario={usuario}
          ultimasAvaliacoes={data.esas}
          refresh={refresh}
          notice={notice}
          onConcluirComGrave={dor => {
            setChatbotDor(dor);
            setPage('chatbot');
          }}
          onConcluirLeve={() => setPage('inicio')}
        />
      )}

      {page === 'chatbot' && (
        <ChatbotZelo
          usuario={usuario}
          dorInicial={chatbotDor}
          onConcluir={() => setPage('inicio')}
          notice={notice}
          refresh={refresh}
        />
      )}

      {page === 'medicacoes' && (
        <MedicationSchedule
          usuario={usuario}
          medicacoes={data.medicacoes}
          refresh={refresh}
          notice={notice}
        />
      )}

      {page === 'mapa' && (
        <PainBodyMap
          usuario={usuario}
          locaisDor={data.dor}
          refresh={refresh}
          notice={notice}
          onConcluir={() => setPage('inicio')}
        />
      )}

      {page === 'orientacoes' && (
        <PatientOrientations orientacoes={data.orientacoes} />
      )}

      {page === 'acessibilidade' && (
        <AccessibilityPage />
      )}
    </section>
  );
}
