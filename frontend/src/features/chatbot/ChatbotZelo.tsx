import React, { useState, useEffect, useRef } from 'react';
import { Usuario, api } from '../../api';
import { Button } from '../../components/Button';
import { NoticeFeedback } from '../../components/NoticeFeedback';
import {
  ChatbotAnswers,
  ChatHistoryEntry,
  ChatOption,
  ChatNode
} from './types';
import {
  INITIAL_CHATBOT_ANSWERS,
  CHATBOT_SCRIPT_TREE
} from './chatbot-scripts';

export interface ChatbotZeloProps {
  usuario: Usuario;
  dorInicial?: number;
  onConcluir: () => void;
  notice: (kind: 'success' | 'error', text: string) => void;
  refresh?: () => Promise<void>;
}

export function ChatbotZelo({
  usuario,
  dorInicial = 8,
  onConcluir,
  notice,
  refresh
}: ChatbotZeloProps): React.JSX.Element {
  const [answers, setAnswers] = useState<ChatbotAnswers>(() => ({
    ...INITIAL_CHATBOT_ANSWERS,
    intensidadeDor: Math.max(7, Number(dorInicial) || 8)
  }));

  const [currentNodeId, setCurrentNodeId] = useState<string>('acolhimento');
  const [history, setHistory] = useState<ChatHistoryEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const streamEndRef = useRef<HTMLDivElement>(null);
  const activePromptRef = useRef<HTMLDivElement>(null);
  const firstOptionRef = useRef<HTMLButtonElement>(null);

  const currentNode: ChatNode = CHATBOT_SCRIPT_TREE[currentNodeId] || CHATBOT_SCRIPT_TREE['acolhimento'];

  // Rola suavemente para o novo conteúdo e foca na nova pergunta
  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (firstOptionRef.current) {
      firstOptionRef.current.focus();
    } else if (activePromptRef.current) {
      activePromptRef.current.focus();
    }
  }, [currentNodeId, history.length]);

  // Transmite a triagem para o backend quando o nó conclusivo for atingido
  async function sincronizarTriagem(finalAnswers: ChatbotAnswers) {
    setSaving(true);
    setSaveError(null);
    try {
      await api.registrarTriagem(usuario.id, {
        intensidade_dor: finalAnswers.intensidadeDor,
        caracteristica_dor: finalAnswers.caracteristicaDor,
        mais_de_duas_semanas: finalAnswers.maisDeDuasSemanas,
        tipo_dor: finalAnswers.duracaoDor,
        fez_dose_resgate: finalAnswers.fezDoseResgate,
        medicamentos_efetivos: finalAnswers.medicamentosEfetivos,
        em_acompanhamento: true,
        tem_sintoma_acompanhante: false,
        sintoma_acompanhante_desc: null,
        tem_fator_piora: false,
        fator_piora_desc: null,
        alerta_sinais_alarme_exibido: true,
        medidas_nao_farmacologicas_exibidas: true,
        solicitou_agendamento: finalAnswers.solicitarContato
      });

      if (refresh) await refresh();
      notice(
        'success',
        finalAnswers.solicitarContato
          ? 'Triagem gravada com alerta de contato prioritário para a equipe!'
          : 'Triagem gravada no prontuário para monitoramento contínuo.'
      );
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'Não foi possível sincronizar com o prontuário no momento.'
      );
    } finally {
      setSaving(false);
    }
  }

  // Avança para a próxima etapa registrando o histórico
  function handleSelectOption(option: ChatOption) {
    const updatedAnswers = {
      ...answers,
      ...(option.action ? option.action(answers) : {})
    };
    setAnswers(updatedAnswers);

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Mensagem emitida pelo Zelo no nó atual
    const zeloMessageText =
      typeof currentNode.message === 'function'
        ? currentNode.message(updatedAnswers, usuario.nome)
        : currentNode.message;

    const tip =
      typeof currentNode.clinicalTip === 'function'
        ? currentNode.clinicalTip(updatedAnswers)
        : currentNode.clinicalTip;

    // Adiciona o par (Zelo + Resposta do Usuário) ao histórico
    setHistory(prev => [
      ...prev,
      {
        id: `zelo_${Date.now()}_${currentNode.id}`,
        nodeId: currentNode.id,
        speaker: 'zelo',
        message: zeloMessageText,
        bullets: currentNode.bullets,
        clinicalTip: tip || undefined,
        timestamp: now
      },
      {
        id: `user_${Date.now()}_${option.id}`,
        nodeId: currentNode.id,
        speaker: 'user',
        message: option.label,
        timestamp: now,
        selectedOptionLabel: option.label
      }
    ]);

    const nextId = option.nextNodeId;
    setCurrentNodeId(nextId);

    // Se o próximo nó for o nó de conclusão, executa a sincronização
    if (nextId === 'conclusao') {
      sincronizarTriagem(updatedAnswers);
    }
  }

  // Desfaz a última interação voltando um nó no grafo
  function handleVoltar() {
    if (history.length < 2) {
      setCurrentNodeId('acolhimento');
      setHistory([]);
      return;
    }

    // Remove o último par (user + zelo)
    const newHistory = history.slice(0, -2);
    const lastUserEntry = history[history.length - 1];
    setHistory(newHistory);
    setCurrentNodeId(lastUserEntry.nodeId);
    setSaveError(null);
  }

  // Reinicia a triagem do início
  function handleReiniciar() {
    setHistory([]);
    setAnswers({
      ...INITIAL_CHATBOT_ANSWERS,
      intensidadeDor: Math.max(7, Number(dorInicial) || 8)
    });
    setCurrentNodeId('acolhimento');
    setSaveError(null);
  }

  // Renderiza a mensagem do nó ativo
  const currentPromptMessage =
    typeof currentNode.message === 'function'
      ? currentNode.message(answers, usuario.nome)
      : currentNode.message;

  const currentTip =
    typeof currentNode.clinicalTip === 'function'
      ? currentNode.clinicalTip(answers)
      : currentNode.clinicalTip;

  return (
    <section className="chatbot-shell" aria-label="Chatbot Zelo - Avaliação e Alívio da Dor">
      {/* Cabeçalho do Chatbot com Metadados e Ações */}
      <div className="section-title" style={{ marginTop: 0 }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--green)' }}>DIRECIONAMENTO CLÍNICO DOMICILIAR</span>
          <h1 style={{ fontSize: '24px', margin: '4px 0' }}>Enfermeira Virtual Zelo</h1>
          <p className="muted">
            Protocolo interativo de avaliação da dor validado por juízes especialistas (IVC 0,95).
          </p>
        </div>
        <div className="button-row">
          {history.length > 0 && (
            <Button variant="quiet" onClick={handleReiniciar} title="Reiniciar do começo">
              ↺ Reiniciar Triagem
            </Button>
          )}
          <Button variant="secondary" onClick={onConcluir}>
            Voltar ao Início
          </Button>
        </div>
      </div>

      {/* Região Acessível de Histórico de Conversação (WAI-ARIA) */}
      <div
        className="chat-stream"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions text"
        tabIndex={0}
        aria-label="Histórico de mensagens da triagem"
      >
        {history.map(item => (
          <article
            key={item.id}
            className={`chat-bubble ${item.speaker === 'zelo' ? 'chat-bubble-zelo' : 'chat-bubble-user'}`}
          >
            {item.speaker === 'zelo' && <strong>Enfermeira Virtual Zelo</strong>}
            <div style={{ whiteSpace: 'pre-line' }}>{item.message}</div>

            {item.bullets && item.bullets.length > 0 && (
              <ul style={{ margin: '8px 0', paddingLeft: '20px', lineHeight: 1.6 }}>
                {item.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}

            {item.clinicalTip && (
              <p
                style={{
                  margin: '8px 0 0',
                  padding: '8px 12px',
                  background: 'var(--green-soft)',
                  borderLeft: '3px solid var(--green)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: 'var(--ink)'
                }}
              >
                💡 <b>{item.clinicalTip}</b>
              </p>
            )}

            <small>{item.timestamp}</small>
          </article>
        ))}

        {/* Mensagem Atual do Zelo */}
        <article
          ref={activePromptRef}
          tabIndex={-1}
          className={`chat-bubble chat-bubble-zelo ${currentNode.isEmergencyBlock ? 'emergency-bubble' : ''}`}
          style={
            currentNode.isEmergencyBlock
              ? { border: '2px solid var(--danger)', background: '#fffbfb' }
              : undefined
          }
        >
          <strong style={currentNode.isEmergencyBlock ? { color: 'var(--danger)' } : undefined}>
            {currentNode.title || 'Enfermeira Virtual Zelo'}
          </strong>
          <div style={{ fontSize: '16px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {currentPromptMessage}
          </div>

          {currentNode.bullets && currentNode.bullets.length > 0 && (
            <ul style={{ margin: '10px 0', paddingLeft: '22px', lineHeight: 1.6 }}>
              {currentNode.bullets.map((b, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{b}</li>
              ))}
            </ul>
          )}

          {currentTip && (
            <p
              style={{
                margin: '10px 0 0',
                padding: '10px 14px',
                background: 'var(--green-soft)',
                borderLeft: '4px solid var(--green)',
                borderRadius: '8px',
                fontSize: '14.5px',
                color: 'var(--ink)',
                fontWeight: 600
              }}
            >
              💡 {currentTip}
            </p>
          )}

          {/* Botão de Discagem Direta de Emergência se Alerta Vermelho */}
          {currentNode.isEmergencyBlock && (
            <div style={{ marginTop: '16px' }} className="button-row">
              <a
                href="tel:4130000000"
                className="button button-danger"
                style={{ minHeight: '52px', fontSize: '16px', textDecoration: 'none' }}
              >
                📞 Ligar Imediatamente para o Hospice HEG: (41) 3000-0000
              </a>
            </div>
          )}
        </article>

        <div ref={streamEndRef} aria-hidden="true" />
      </div>

      {/* Contingência de Erro de Conexão com Prontuário */}
      {saveError && (
        <div style={{ marginTop: '12px' }}>
          <NoticeFeedback
            kind="error"
            message={`Erro ao sincronizar com o prontuário: ${saveError}`}
            onDismiss={() => setSaveError(null)}
          />
          <div
            style={{
              padding: '14px 18px',
              background: '#fef2f2',
              border: '1.5px solid #f87171',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div>
              <strong style={{ color: '#991b1b' }}>Linha Direta do Hospice Erasto Gaertner:</strong>
              <p style={{ margin: '3px 0 0', fontSize: '14px', color: '#7f1d1d' }}>
                Em caso de sintomas graves ou sem conexão, ligue diretamente para o plantão.
              </p>
            </div>
            <div className="button-row">
              <Button
                variant="primary"
                onClick={() => sincronizarTriagem(answers)}
                loading={saving}
                loadingText="Tentando novamente…"
              >
                Tentar Salvar Novamente
              </Button>
              <a href="tel:4130000000" className="button button-secondary" style={{ textDecoration: 'none' }}>
                📞 Ligar (41) 3000-0000
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Painel Inferior de Opções e Respostas Fechadas */}
      <div className="chat-controls">
        {!currentNode.isFinish && currentNode.options && currentNode.options.length > 0 && (
          <div className="chat-options-grid" role="group" aria-label="Opções de resposta">
            {currentNode.options.map((option, idx) => (
              <button
                key={option.id}
                ref={idx === 0 ? firstOptionRef : undefined}
                type="button"
                className={`chat-option-btn ${option.isEmergencyAlert ? 'emergency-btn' : ''}`}
                style={
                  option.isEmergencyAlert
                    ? { borderColor: '#fca5a5', background: '#fff5f5' }
                    : undefined
                }
                onClick={() => handleSelectOption(option)}
                disabled={saving}
              >
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{option.label}</div>
                  {option.sublabel && (
                    <small style={{ color: 'var(--muted)', display: 'block', marginTop: '2px', fontSize: '13px' }}>
                      {option.sublabel}
                    </small>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Ações Finais após Conclusão da Triagem */}
        {currentNode.isFinish && (
          <div className="button-row" style={{ marginTop: '8px' }}>
            <Button
              variant="primary"
              size="large"
              onClick={onConcluir}
              style={{ minHeight: '52px', fontSize: '16px' }}
            >
              ✓ Concluir e Voltar ao Início
            </Button>
            <a
              href="tel:4130000000"
              className="button button-secondary"
              style={{ minHeight: '52px', textDecoration: 'none' }}
            >
              📞 Ligar para o Hospice HEG: (41) 3000-0000
            </a>
            <Button variant="quiet" onClick={handleReiniciar}>
              Refazer Avaliação
            </Button>
          </div>
        )}

        {/* Barra de Reversibilidade de Erro (Desfazer última resposta) */}
        {!currentNode.isFinish && history.length > 0 && (
          <div className="chat-actions-row">
            <Button
              type="button"
              variant="quiet"
              onClick={handleVoltar}
              title="Voltar à pergunta anterior se tocou por engano"
            >
              ↺ Corrigir / Voltar à pergunta anterior
            </Button>
            <span className="muted" style={{ fontSize: '13px' }}>
              Etapa {Math.floor(history.length / 2) + 1} de 6
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
