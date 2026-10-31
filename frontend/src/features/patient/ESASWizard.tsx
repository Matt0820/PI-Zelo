import React, { useState } from 'react';
import { Usuario, ESAS, api } from '../../api';
import { Button } from '../../components/Button';
import { PageHeading } from '../../components/PageHeading';

export interface ESASWizardProps {
  usuario: Usuario;
  ultimasAvaliacoes: ESAS[];
  refresh: () => Promise<void>;
  notice: (kind: 'success' | 'error', text: string) => void;
  onConcluirComGrave: (dorScore: number) => void;
  onConcluirLeve: () => void;
}

export const ESAS_SYMPTOMS: Array<{
  key: keyof Pick<
    ESAS,
    | 'dor'
    | 'cansaco'
    | 'nausea'
    | 'depressao'
    | 'ansiedade'
    | 'sonolencia'
    | 'apetite'
    | 'mal_estar'
    | 'falta_de_ar'
    | 'constipacao'
  >;
  label: string;
  question: string;
  hint: string;
}> = [
  {
    key: 'dor',
    label: 'Dor',
    question: 'Como o(a) senhor(a) avalia a dor no corpo neste momento?',
    hint: '0 significa sem nenhuma dor e 10 a pior dor imaginável.'
  },
  {
    key: 'cansaco',
    label: 'Cansaço / Fadiga',
    question: 'Qual o nível de cansaço ou falta de energia hoje?',
    hint: '0 significa com boa disposição e 10 cansaço extremo.'
  },
  {
    key: 'nausea',
    label: 'Náusea / Enjoo',
    question: 'Está sentindo enjoo ou vontade de vomitar?',
    hint: '0 significa sem nenhum enjoo e 10 náusea intensa.'
  },
  {
    key: 'depressao',
    label: 'Tristeza / Desânimo',
    question: 'Como está o seu humor ou sensação de tristeza hoje?',
    hint: '0 significa sem tristeza e 10 tristeza profunda.'
  },
  {
    key: 'ansiedade',
    label: 'Ansiedade / Inquietação',
    question: 'Como está a sensação de preocupação ou ansiedade?',
    hint: '0 significa calmo(a) e tranquilo(a) e 10 ansiedade intensa.'
  },
  {
    key: 'sonolencia',
    label: 'Sonolência durante o dia',
    question: 'Está sentindo muito sono ou dificuldade de ficar acordado(a)?',
    hint: '0 significa bem acordado(a) e 10 sonolência contínua.'
  },
  {
    key: 'apetite',
    label: 'Falta de Apetite',
    question: 'Como está a dificuldade ou falta de vontade de comer?',
    hint: '0 significa apetite normal/bom e 10 recusa total de alimentos.'
  },
  {
    key: 'mal_estar',
    label: 'Mal-estar Geral',
    question: 'Como está a sensação geral de mal-estar no corpo?',
    hint: '0 significa sensação de bem-estar e 10 pior mal-estar possível.'
  },
  {
    key: 'falta_de_ar',
    label: 'Falta de Ar / Respiração',
    question: 'Está sentindo canseira no peito ou dificuldade para respirar?',
    hint: '0 significa respiração confortável e 10 falta de ar severa.'
  },
  {
    key: 'constipacao',
    label: 'Constipação / Intestino Preso',
    question: 'Qual a dificuldade para evacuar ou sensação de intestino preso?',
    hint: '0 significa intestino funcionando normalmente e 10 prisão de ventre severa.'
  }
];

export function ESASWizard({
  usuario,
  ultimasAvaliacoes,
  refresh,
  notice,
  onConcluirComGrave,
  onConcluirLeve
}: ESASWizardProps): React.JSX.Element {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(ESAS_SYMPTOMS.map(s => [s.key, null]))
  );
  const [loading, setLoading] = useState(false);

  const currentSymptom = ESAS_SYMPTOMS[step];
  const currentScore = scores[currentSymptom.key];

  async function enviarESAS() {
    if (ESAS_SYMPTOMS.some(s => scores[s.key] === null)) {
      notice('error', 'Por favor, responda a todos os 10 sintomas antes de enviar.');
      return;
    }

    setLoading(true);
    try {
      const scoresNumericos = Object.fromEntries(
        Object.entries(scores).map(([k, v]) => [k, Number(v) || 0])
      );
      const maxScore = Math.max(...Object.values(scoresNumericos));
      const temGrave = maxScore >= 7;
      const dorScore = Number(scores.dor) || maxScore;

      await api.registrarESAS(usuario.id, {
        ...scoresNumericos,
        observacao: temGrave ? 'Gatilho de intensidade severa acionado no domicílio' : ''
      });

      await refresh();
      setScores(Object.fromEntries(ESAS_SYMPTOMS.map(s => [s.key, null])));
      setStep(0);

      if (temGrave) {
        notice(
          'success',
          `Avaliação enviada. Como você indicou nota alta (${dorScore}/10), abrimos o Chatbot Zelo para direcionar seu alívio imediato.`
        );
        onConcluirComGrave(dorScore);
      } else {
        notice('success', 'Avaliação ESAS enviada com sucesso para a equipe do Hospice.');
        onConcluirLeve();
      }
    } catch (e) {
      notice('error', e instanceof Error ? e.message : 'Não foi possível enviar a avaliação ESAS.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-label="Avaliação Diária de Sintomas - Escala ESAS">
      <PageHeading
        kicker="ESCALA EDMONTON DE SINTOMAS (ESAS)"
        title="Avaliação Diária de Sintomas"
        description="Escolha uma nota de 0 a 10 para cada um dos 10 sintomas. Notas 7 ou mais acionam o direcionamento imediato do Chatbot Zelo para alívio no domicílio."
      />

      <div className="wizard-card">
        {/* Barra de Progresso com Acessibilidade */}
        <div className="wizard-progress">
          <div className="wizard-progress-header">
            <span>
              Sintoma {step + 1} de {ESAS_SYMPTOMS.length} · <b>{currentSymptom.label}</b>
            </span>
            <span style={{ fontSize: '13px' }}>
              {Math.round(((step + 1) / ESAS_SYMPTOMS.length) * 100)}% concluído
            </span>
          </div>
          <div
            className="wizard-progress-track"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={ESAS_SYMPTOMS.length}
            aria-label={`Progresso da avaliação: sintoma ${step + 1} de ${ESAS_SYMPTOMS.length}`}
          >
            <i style={{ width: `${((step + 1) / ESAS_SYMPTOMS.length) * 100}%` }} />
          </div>
        </div>

        <h2 style={{ fontSize: '26px', margin: '20px 0 6px', color: 'var(--ink)' }}>
          {currentSymptom.label}
        </h2>
        <p style={{ fontSize: '16.5px', color: 'var(--ink)', margin: '0 0 8px' }}>
          {currentSymptom.question}
        </p>
        <small className="muted" style={{ display: 'block', marginBottom: '22px' }}>
          <b>Orientações da escala:</b> {currentSymptom.hint}
        </small>

        {/* Seleção Ergonômica de Notas (Botões Táteis ≥ 48px) */}
        <div
          className="rating-groups"
          role="radiogroup"
          aria-label={`Nota de 0 a 10 para ${currentSymptom.label}`}
        >
          {[
            { label: 'Sem sintoma a Leve (0 a 3)', values: [0, 1, 2, 3] },
            { label: 'Moderado (4 a 6)', values: [4, 5, 6] },
            { label: 'Forte a Pior Possível (7 a 10)', values: [7, 8, 9, 10] }
          ].map(group => (
            <div className="rating-group" key={group.label}>
              <div className="rating-label">{group.label}</div>
              <div className="rating-row">
                {group.values.map(n => (
                  <button
                    type="button"
                    key={n}
                    role="radio"
                    aria-checked={currentScore === n}
                    className={`${currentScore === n ? 'selected' : ''} ${n >= 7 ? 'score-btn-high' : ''}`}
                    onClick={() => setScores(old => ({ ...old, [currentSymptom.key]: n }))}
                    style={{ minHeight: '50px' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="range-captions">
          <span>0 · Ausência do sintoma</span>
          <span style={{ fontWeight: 700, color: 'var(--green)' }}>
            {currentScore !== null ? `Nota Selecionada: ${currentScore}/10` : 'Selecione uma nota'}
          </span>
          <span>10 · Pior intensidade possível</span>
        </div>

        {/* Ações de Navegação do Wizard */}
        <div className="button-row wizard-actions">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 0}
            onClick={() => setStep(v => Math.max(0, v - 1))}
          >
            ← Voltar
          </Button>

          {step < ESAS_SYMPTOMS.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              disabled={currentScore === null}
              onClick={() => setStep(v => v + 1)}
            >
              Próximo sintoma ›
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="large"
              disabled={currentScore === null || loading}
              loading={loading}
              loadingText="Gravando e validando…"
              onClick={enviarESAS}
            >
              Finalizar e Enviar Avaliação
            </Button>
          )}
        </div>
      </div>

      {/* Histórico Recente de ESAS */}
      <h2 className="section-heading">Avaliações Anteriores no Hospice</h2>
      {ultimasAvaliacoes.length === 0 ? (
        <p className="muted">Nenhuma avaliação anterior registrada ainda.</p>
      ) : (
        ultimasAvaliacoes.slice(0, 4).map(e => {
          const dataFmt = new Date(e.data_registro).toLocaleString('pt-BR', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });
          return (
            <p className="history-line" key={e.id}>
              {dataFmt} · <b>Dor:</b> {e.dor}/10 · <b>Cansaço:</b> {e.cansaco}/10 ·{' '}
              <b>Constipação:</b> {e.constipacao ?? '—'}/10 · Gravidade:{' '}
              <span className={`pill ${e.gravidade_maxima === 'grave' ? 'severity-high' : ''}`}>
                {e.gravidade_maxima}
              </span>
            </p>
          );
        })
      )}
    </section>
  );
}
