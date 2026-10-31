/**
 * Contém uma tela de chatbot independente da navegação SPA atualmente conectada.
 */

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Usuario, api } from '../api';
import {
  ChatbotFlowState,
  chooseFlowOption,
  continueFlow,
  createInitialFlow,
  goBackFlow,
  restartFlow,
  startFlow,
  submitFlowText,
  toPainTriagePayload,
} from './flowMachine';
import { chatbotScript } from './script';

type ChatbotNotice = (kind: 'success' | 'error', text: string) => void;
type Props = {
  usuario: Usuario;
  dorInicial: number;
  onConcluir: () => void;
  notice: ChatbotNotice;
  refresh: () => Promise<void>;
};

/**
 * Tela ligada à máquina de fluxo legada; não é a tela importada pela navegação atual.
 */
export default function ChatbotZeloScreen({ usuario, dorInicial, onConcluir, notice, refresh }: Props) {
  const [flow, setFlow] = useState<ChatbotFlowState>(() => createInitialFlow(usuario.nome, dorInicial));
  const [respostaTexto, setRespostaTexto] = useState('');
  const [confirmarReinicio, setConfirmarReinicio] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erroSalvamento, setErroSalvamento] = useState<string | null>(null);
  const perguntaAtual = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    perguntaAtual.current?.focus();
    perguntaAtual.current?.scrollIntoView({ block: 'nearest' });
  }, [flow.nodeId, flow.phase, salvo]);

  const node = flow.phase === 'active' ? chatbotScript[flow.nodeId] as typeof chatbotScript[keyof typeof chatbotScript] | undefined : null;

  function reiniciar() {
    setFlow(restartFlow(usuario.nome, dorInicial));
    setRespostaTexto('');
    setErroSalvamento(null);
    setSalvo(false);
    setConfirmarReinicio(false);
  }

  function enviarTexto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = submitFlowText(flow, respostaTexto);
    setFlow(next);
    if (!next.error) setRespostaTexto('');
  }

  function voltarPergunta() {
    const previous = goBackFlow(flow);
    setFlow(previous);
    if (previous.nodeId === 'associatedSymptomDescription') setRespostaTexto(previous.answers.associatedSymptomDescription ?? '');
    else if (previous.nodeId === 'aggravatingFactorDescription') setRespostaTexto(previous.answers.aggravatingFactorDescription ?? '');
    else setRespostaTexto('');
  }

  async function salvarTriagem() {
    const payload = toPainTriagePayload(flow.answers, dorInicial);
    if (!payload) {
      setErroSalvamento('Faltam respostas obrigatórias. Volte às perguntas e complete a triagem.');
      return;
    }
    setSalvando(true);
    setErroSalvamento(null);
    try {
      await api.registrarTriagem(usuario.id, payload);
      setSalvo(true);
      try {
        await refresh();
        notice('success', payload.solicitou_agendamento
          ? 'Triagem registrada. O pedido de contato foi incluído na Central de Alertas.'
          : 'Triagem registrada e incluída na Central de Alertas da equipe.');
      } catch {
        notice('error', 'A triagem foi registrada, mas não foi possível atualizar os dados exibidos.');
      }
    } catch (error) {
      setErroSalvamento(error instanceof Error ? error.message : 'Não foi possível salvar a triagem. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  const lastMessage = flow.messages[flow.messages.length - 1];
  const activePromptMessageId = flow.phase === 'active' && lastMessage?.role === 'assistant' ? lastMessage.id : null;

  return <section className="chatbot-shell" aria-labelledby="chatbot-title">
    <header className="chatbot-heading">
      <div>
        <span className="eyebrow">DIRECIONAMENTO DE CUIDADO</span>
        <h1 ref={perguntaAtual} tabIndex={-1} id="chatbot-title" style={{ margin: '4px 0' }}>Assistente Zelo · Apoio para Dor</h1>
      </div>
      <a href="tel:4130000000" className="button button-secondary">Ligar para o Hospice: (41) 3000-0000</a>
    </header>

    <div className="chat-stream" role="log" aria-label="Conversa da triagem" aria-live="polite" aria-relevant="additions text">
      {flow.messages.filter(item=>item.id!==activePromptMessageId).map(item => <div key={item.id} className={`chat-bubble chat-bubble-${item.role === 'assistant' ? 'zelo' : 'user'}`}>
        {item.role === 'assistant'&&<strong>{item.text === flow.messages[0]?.text ? 'Enfermeira Virtual Zelo · Hospice Erasto Gaertner' : 'Enfermeira Virtual Zelo'}</strong>}
        <span>{item.text}</span>
      </div>)}
      {flow.phase === 'emergency'&&<div className="notice notice-error" role="alert">
        <h2 ref={perguntaAtual} tabIndex={-1}>Atenção: situação de emergência médica.</h2>
        <p>Procure atendimento de urgência e entre em contato imediatamente com o plantão do Hospice.</p>
        <div className="button-row">
          <a href="tel:4130000000" className="button button-primary">Ligar imediatamente para o Hospice: (41) 3000-0000</a>
          <button type="button" className="button button-secondary" onClick={voltarPergunta}>Voltar e rever resposta</button>
          <button type="button" className="button button-quiet" onClick={onConcluir}>Voltar ao início</button>
        </div>
      </div>}
      {flow.phase === 'readyToSubmit'&&!salvo&&<div className="chat-bubble chat-bubble-zelo">
        <h2 ref={perguntaAtual} tabIndex={-1}>Confirme o registro</h2>
        {flow.answers.contactRequested ? 'Seu pedido de contato será incluído na Central de Alertas da equipe.' : 'Suas respostas serão registradas e disponibilizadas à equipe.'}
      </div>}
      {salvo&&<div className="chat-bubble chat-bubble-zelo" role="status">
        <h2 ref={perguntaAtual} tabIndex={-1}>Triagem registrada com sucesso.</h2>
        {flow.answers.contactRequested ? 'Seu pedido de contato foi registrado na Central de Alertas da equipe.' : 'A triagem está disponível para a equipe.'}
        <div className="button-row">
          <button type="button" className="button button-primary" onClick={onConcluir}>Concluir e voltar ao início</button>
          <button type="button" className="button button-secondary" onClick={reiniciar}>Iniciar nova triagem</button>
        </div>
      </div>}
    </div>

    {flow.error&&<p className="notice notice-error" role="alert">{flow.error}</p>}
    {erroSalvamento&&<div className="notice notice-error" role="alert"><p>{erroSalvamento}</p><button type="button" className="button button-secondary" onClick={salvarTriagem} disabled={salvando}>{salvando?'Salvando…':'Tentar salvar novamente'}</button></div>}
    {flow.phase === 'welcome'&&<div className="chat-controls"><button type="button" className="button button-primary button-wide" onClick={()=>setFlow(startFlow(flow))}>Iniciar triagem e orientações de alívio</button></div>}

    {flow.phase === 'active'&&node&&<div className="chat-controls">
      <h2 ref={perguntaAtual} tabIndex={-1} className="chat-current-question">{node.prompt}</h2>
      {node.type === 'choice'&&<div className="chat-options-grid" role="group" aria-label="Opções de resposta">
        {node.options?.map(option=><button key={option.id} type="button" className="chat-option-btn" onClick={()=>setFlow(chooseFlowOption(flow, option.id))}>{option.label}</button>)}
      </div>}
      {node.type === 'text'&&node.answerKey&&<form className="chat-options-grid" onSubmit={enviarTexto}>
        <label htmlFor="chatbot-text-answer">Sua resposta</label>
        <textarea id="chatbot-text-answer" value={respostaTexto} onChange={event=>setRespostaTexto(event.target.value)} maxLength={200} required aria-describedby="chatbot-text-hint" />
        <small id="chatbot-text-hint">Até 200 caracteres.</small>
        <button type="submit" className="button button-primary">Continuar</button>
      </form>}
      {node.type === 'info'&&<>
        {node.content?.length? <ul className="chat-instructions">{node.content.map(item=><li key={item}>{item}</li>)}</ul> : null}
        <button type="button" className="button button-primary" onClick={()=>setFlow(continueFlow(flow))}>Entendi, continuar</button>
      </>}
      <div className="chat-flow-actions">
        <button type="button" className="button button-quiet" onClick={voltarPergunta}>Voltar à pergunta anterior</button>
        {!confirmarReinicio
          ? <button type="button" className="button button-quiet" onClick={()=>setConfirmarReinicio(true)}>Reiniciar triagem</button>
          : <div role="group" aria-label="Confirmar reinício"><span>Apagar as respostas desta triagem?</span><button type="button" className="button button-secondary" onClick={reiniciar}>Sim, reiniciar</button><button type="button" className="button button-quiet" onClick={()=>setConfirmarReinicio(false)}>Continuar triagem</button></div>}
      </div>
    </div>}

    {flow.phase === 'active'&&!node&&<div className="notice notice-error" role="alert"><h2 ref={perguntaAtual} tabIndex={-1}>O roteiro está sem uma pergunta nesta etapa.</h2><p>Reinicie a triagem para continuar.</p><button type="button" className="button button-secondary" onClick={reiniciar}>Reiniciar triagem</button></div>}
    {flow.phase === 'readyToSubmit'&&!salvo&&<div className="chat-controls">
      <div className="button-row">
        <button type="button" className="button button-primary" onClick={salvarTriagem} disabled={salvando}>{salvando?'Salvando triagem…':'Registrar triagem'}</button>
        <button type="button" className="button button-quiet" onClick={voltarPergunta} disabled={salvando}>Voltar à pergunta anterior</button>
      </div>
      <div role="status" aria-live="polite">{salvando?'Registrando suas respostas…':''}</div>
    </div>}
  </section>;
}
