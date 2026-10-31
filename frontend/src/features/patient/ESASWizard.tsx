import React, { useEffect, useState } from 'react';
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
  const draftKey = `@zelo/web/esas-draft/${usuario.id}`;
  const readDraft = () => {
    const empty: Record<string, number | null> = Object.fromEntries(ESAS_SYMPTOMS.map(s => [s.key, null]));
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return { step: 0, scores: empty };
      const draft = JSON.parse(raw) as { step?: unknown; scores?: Record<string, unknown> };
      const restored = { ...empty };
      for (const symptom of ESAS_SYMPTOMS) {
        const value = draft.scores?.[symptom.key];
        if (value === null || (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10)) {
          restored[symptom.key] = value as number | null;
        }
      }
      const step = typeof draft.step === 'number' && Number.isInteger(draft.step)
        ? Math.max(0, Math.min(ESAS_SYMPTOMS.length, draft.step))
        : 0;
      return { step, scores: restored };
    } catch {
      return { step: 0, scores: empty };
    }
  };
  const [initialDraft] = useState(readDraft);
  const [step, setStep] = useState(initialDraft.step);
  const [scores, setScores] = useState<Record<string, number | null>>(initialDraft.scores);
  const [loading, setLoading] = useState(false);

  const isReview = step === ESAS_SYMPTOMS.length;
  const currentSymptom = ESAS_SYMPTOMS[Math.min(step, ESAS_SYMPTOMS.length - 1)];
  const currentScore = scores[currentSymptom.key];

  useEffect(() => {
    const hasAnswers = Object.values(scores).some(value => value !== null);
    try {
      if (hasAnswers) localStorage.setItem(draftKey, JSON.stringify({ step, scores }));
      else localStorage.removeItem(draftKey);
    } catch {
      // Mantém o formulário utilizável se o navegador bloquear o armazenamento.
    }
  }, [draftKey, step, scores]);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (Object.values(scores).some(value => value !== null)) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [scores]);

  async function enviarESAS() {
    if (ESAS_SYMPTOMS.some(s => scores[s.key] === null)) {
      notice('error', 'Por favor, responda a todos os 9 sintomas antes de enviar.');
      return;
    }

    setLoading(true);
    try {
      const scoresNumericos = Object.fromEntries(
        Object.entries(scores).map(([k, v]) => [k, Number(v) || 0])
      );
      const dorScore = Number(scores.dor) || 0;
      const temGrave = dorScore >= 7;

      await api.registrarESAS(usuario.id, {
        ...scoresNumericos,
        observacao: temGrave ? 'Gatilho de intensidade severa acionado no domicílio' : ''
      });

      try { localStorage.removeItem(draftKey); } catch { /* Avaliação já enviada. */ }
      setScores(Object.fromEntries(ESAS_SYMPTOMS.map(s => [s.key, null])));
      setStep(0);
      let refreshFailed = false;
      try { await refresh(); } catch { refreshFailed = true; }

      if (temGrave) {
        notice(
          'success',
          `Avaliação enviada. Como você indicou dor intensa (${dorScore}/10), abrimos o Chatbot Zelo para orientar o próximo passo.${refreshFailed ? ' A lista exibida pode demorar para atualizar.' : ''}`
        );
        onConcluirComGrave(dorScore);
      } else {
        notice('success', `Avaliação ESAS enviada com sucesso para a equipe médica.${refreshFailed ? ' A lista exibida pode demorar para atualizar.' : ''}`);
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
        description="Escolha uma nota de 0 a 10 para cada um dos 9 sintomas. Nota 7 ou mais em Dor inicia a triagem do Chatbot Zelo."
      />

      <div className="wizard-card">
        {/* Barra de Progresso com Acessibilidade */}
        <div className="wizard-progress">
          <div className="wizard-progress-header">
            <span>
              {isReview
                ? `Revisão final · ${ESAS_SYMPTOMS.length} sintomas`
                : <>Sintoma {step + 1} de {ESAS_SYMPTOMS.length} · <b>{currentSymptom.label}</b></>}
            </span>
            <span style={{ fontSize: '13px' }}>
              {Math.round((Math.min(step + 1, ESAS_SYMPTOMS.length) / ESAS_SYMPTOMS.length) * 100)}% concluído
            </span>
          </div>
          <div
            className="wizard-progress-track"
            role="progressbar"
            aria-valuenow={Math.min(step + 1, ESAS_SYMPTOMS.length)}
            aria-valuemin={0}
            aria-valuemax={ESAS_SYMPTOMS.length}
            aria-label={isReview ? 'Revisão final da avaliação' : `Progresso da avaliação: sintoma ${step + 1} de ${ESAS_SYMPTOMS.length}`}
          >
            <i style={{ width: `${(Math.min(step + 1, ESAS_SYMPTOMS.length) / ESAS_SYMPTOMS.length) * 100}%` }} />
          </div>
        </div>

        {!isReview ? <>
          <h2 style={{ fontSize: '26px', margin: '20px 0 6px', color: 'var(--ink)' }}>
            {currentSymptom.label}
          </h2>
          <p style={{ fontSize: '16.5px', color: 'var(--ink)', margin: '0 0 8px' }}>
            {currentSymptom.question}
          </p>
          <small className="muted" style={{ display: 'block', marginBottom: '22px' }}>
            <b>Orientações da escala:</b> {currentSymptom.hint}
          </small>

          {/* Seleção ergonômica com alvos táteis de 56 × 56 px */}
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
              <div className={`rating-row ${group.values.length === 3 ? 'rating-row-three' : ''}`}>
                {group.values.map(n => (
                  <button
                    type="button"
                    key={n}
                    role="radio"
                    aria-checked={currentScore === n}
                    className={`${currentScore === n ? 'selected' : ''} ${n >= 7 ? 'score-btn-high' : ''}`}
                    onClick={() => setScores(old => ({ ...old, [currentSymptom.key]: n }))}
                    style={{ minHeight: '56px' }}
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
              {currentScore !== null ? `Nota selecionada: ${currentScore}/10` : 'Selecione uma nota'}
            </span>
            <span>10 · Pior intensidade possível</span>
          </div>
        </> : <>
          <h2 style={{ fontSize: '26px', margin: '20px 0 6px', color: 'var(--ink)' }}>Confira suas respostas</h2>
          <p className="muted" style={{ marginBottom: '18px' }}>
            Selecione um sintoma para corrigir a nota antes de enviar à equipe.
          </p>
          <div className="score-grid" aria-label="Resumo das notas ESAS">
            {ESAS_SYMPTOMS.map((symptom, index) => (
              <button
                key={symptom.key}
                type="button"
                className="score review-score"
                onClick={() => setStep(index)}
                aria-label={`Corrigir ${symptom.label}, nota ${scores[symptom.key]} de 10`}
              >
                <span>{symptom.label}</span>
                <b>{scores[symptom.key]}/10</b>
                <small>Corrigir resposta</small>
              </button>
            ))}
          </div>
        </>}

        {/* Ações de Navegação do Wizard */}
        <div className="button-row wizard-actions">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 0}
            onClick={() => setStep(v => Math.max(0, v === ESAS_SYMPTOMS.length ? ESAS_SYMPTOMS.length - 1 : v - 1))}
          >
            {isReview ? 'Voltar às perguntas' : '← Voltar'}
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
          ) : step === ESAS_SYMPTOMS.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              disabled={currentScore === null}
              onClick={() => setStep(ESAS_SYMPTOMS.length)}
            >
              Revisar respostas
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="large"
              disabled={loading}
              loading={loading}
              loadingText="Gravando e validando…"
              onClick={enviarESAS}
            >
              Confirmar e Enviar Avaliação
            </Button>
          )}
        </div>
      </div>

      {/* Histórico Recente de ESAS */}
      <h2 className="section-heading">Avaliações Anteriores com a Equipe Médica</h2>
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
