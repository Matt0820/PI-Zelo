import React, { useState } from 'react';
import { Usuario, ESAS, Medicacao, Orientacao, LocalDor } from '../../api';
import { PatientHome } from './PatientHome';
import { ESASWizard } from './ESASWizard';
import { MedicationSchedule } from './MedicationSchedule';
import { PatientOrientations } from './PatientOrientations';
import { PainBodyMap } from './PainBodyMap';
import { ChatbotZelo } from '../chatbot/ChatbotZelo';
import { AccessibilityPage } from '../accessibility';

export type PatientPage = 'inicio' | 'esas' | 'chatbot' | 'mapa' | 'medicacoes' | 'orientacoes' | 'acessibilidade';

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

export function PatientArea({
  usuario,
  page,
  setPage,
  data,
  refresh,
  notice
}: PatientAreaProps): React.JSX.Element {
  const [chatbotScore, setChatbotScore] = useState<number>(8);
  const [chatbotSintoma, setChatbotSintoma] = useState<string>('dor');

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
          onOpenChatbotComDor={(score, sintoma) => {
            setChatbotScore(score);
            setChatbotSintoma(sintoma || 'dor');
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
          onConcluirComGrave={(score, sintoma) => {
            setChatbotScore(score);
            setChatbotSintoma(sintoma || 'dor');
            setPage('chatbot');
          }}
          onConcluirLeve={() => setPage('inicio')}
        />
      )}

      {page === 'chatbot' && (
        <ChatbotZelo
          usuario={usuario}
          dorInicial={chatbotScore}
          sintomaGatilho={chatbotSintoma}
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
