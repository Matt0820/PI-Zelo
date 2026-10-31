/**
 * Permite escolher modos visuais, escala tipográfica e redução de movimento.
 */

import React from 'react';
import { useAccessibility, ModoVisual } from '../../context/AccessibilityContext';
import { PageHeading } from '../../components/PageHeading';
import { Button } from '../../components/Button';
import { Icon } from '../../components/ui';

/**
 * Permite ajustar preferências visuais e tipográficas sem sair do portal.
 */
export function AccessibilityPage(): React.JSX.Element {
  const {
    modoVisual,
    setModoVisual,
    fontStep,
    setFontStep,
    aumentarFonte,
    diminuirFonte,
    resetarFonte,
    reduzirMovimento,
    setReduzirMovimento,
    rotulosFontes
  } = useAccessibility();

  const modosVisuaisConfig: Array<{
    id: ModoVisual;
    titulo: string;
    subtitulo: string;
    descricao: string;
    beneficio: string;
    cores: { fundo: string; borda: string; texto: string; destaque: string };
  }> = [
    {
      id: 'padrao',
      titulo: 'Padrão (Cuidado Acolhedor)',
      subtitulo: 'Esquema original balanceado para luz natural',
      descricao:
        'Cores quentes e acolhedoras com fundo bege suave (#FAF6F0) e verde institucional (#1B5E4A), desenhado especificamente para o ambiente de cuidados paliativos.',
      beneficio: 'Ideal para ambientes bem iluminados e uso geral diário.',
      cores: { fundo: '#FAF6F0', borda: '#D9D1C6', texto: '#1E1B18', destaque: '#1B5E4A' }
    },
    {
      id: 'escuro',
      titulo: 'Modo Noturno (Escuro Suave)',
      subtitulo: 'Tons escuros e descanso ocular',
      descricao:
        'Fundo verde-ardósia escuro (#121916 e #1C2822) com textos claros nítidos (#F4F6F4). Elimina ofuscamento e reduz o brilho excessivo no leito ou quarto escuro.',
      beneficio: 'Indicado para uso noturno, fotofobia e redução da fadiga visual.',
      cores: { fundo: '#121916', borda: '#36483F', texto: '#F4F6F4', destaque: '#68C499' }
    },
    {
      id: 'alto-contraste',
      titulo: 'Alto Contraste Real (Amarelo / Preto)',
      subtitulo: 'WCAG 2.2 AAA — Razão de contraste > 15:1',
      descricao:
        'Fundo preto absoluto (#000000) com tipografia em amarelo vivo (#FFFF00) e branco (#FFFFFF), com bordas reforçadas em todos os botões e áreas clínicas.',
      beneficio: 'Essencial para baixa visão severa, catarata senil, degeneração macular e idosos.',
      cores: { fundo: '#000000', borda: '#FFFFFF', texto: '#FFFFFF', destaque: '#FFFF00' }
    },
    {
      id: 'protanopia',
      titulo: 'Modo Protanopia',
      subtitulo: 'Sensibilidade a tons de vermelho',
      descricao:
        'Substitui alertas vermelhos por azul escuro profundo (#245C91) e tons amarelados, garantindo que nenhum aviso clínico passe despercebido.',
      beneficio: 'Para pacientes e profissionais com deficiência na percepção do vermelho.',
      cores: { fundo: '#FAF6F0', borda: '#C6D8E8', texto: '#1E1B18', destaque: '#245C91' }
    },
    {
      id: 'deuteranopia',
      titulo: 'Modo Deuteranopia',
      subtitulo: 'Sensibilidade a tons de verde',
      descricao:
        'Ajusta elementos verdes para azul cobalto e âmbar com alto contraste, facilitando a diferenciação entre botões e status clínicos.',
      beneficio: 'Para pacientes e profissionais com daltonismo comum verde/vermelho.',
      cores: { fundo: '#FAF6F0', borda: '#C6D8E8', texto: '#1E1B18', destaque: '#245C91' }
    },
    {
      id: 'tritanopia',
      titulo: 'Modo Tritanopia',
      subtitulo: 'Sensibilidade a tons de azul e amarelo',
      descricao:
        'Paleta contrastante baseada em magenta/púrpura (#6B477F) e tons terrosos, otimizando a leitura sem depender de tons cianos ou azuis.',
      beneficio: 'Para pessoas com dificuldade de distinguir azul e amarelo.',
      cores: { fundo: '#FAF6F0', borda: '#E0D2E8', texto: '#1E1B18', destaque: '#6B477F' }
    }
  ];

  return (
    <section aria-label="Configurações de Acessibilidade">
      <PageHeading
        kicker="ACESSIBILIDADE UNIVERSAL · WCAG 2.2 AA / AAA"
        title="Preferências de Acessibilidade"
        description="Ajuste os modos visuais de cor e contraste, tamanho de tipografia e reduza movimentos de acordo com sua necessidade e conforto."
      />

      {/* 1. SELEÇÃO DE MODOS VISUAIS DE CONTRASTE E COR */}
      <article className="record-card record-wide" style={{ marginBottom: '28px' }}>
        <div className="section-title" style={{ marginTop: 0 }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--green)' }}>MODO VISUAL & CONTRASTE</span>
            <h2 style={{ fontSize: '22px' }}>Esquema de Cores da Interface</h2>
            <p className="muted">
              Todas as opções cumprem as diretrizes WCAG 2.2 com foco visível e alta legibilidade.
            </p>
          </div>
          <span className="pill" style={{ fontSize: '13px', padding: '6px 12px' }}>
            Ativo agora: <b>{modosVisuaisConfig.find(m => m.id === modoVisual)?.titulo}</b>
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '16px',
            marginTop: '16px'
          }}
          role="radiogroup"
          aria-label="Escolha o esquema de cores e contraste"
        >
          {modosVisuaisConfig.map(modo => {
            const isAtivo = modoVisual === modo.id;

            return (
              <div
                key={modo.id}
                role="radio"
                aria-checked={isAtivo}
                tabIndex={0}
                onClick={() => setModoVisual(modo.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setModoVisual(modo.id);
                  }
                }}
                className={`accessibility-mode-card ${isAtivo ? 'selected' : ''}`}
                style={{
                  cursor: 'pointer',
                  padding: '18px 20px',
                  borderRadius: '14px',
                  border: isAtivo ? '3px solid var(--green)' : '1.5px solid var(--border)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  transition: 'all 0.2s ease',
                  boxShadow: isAtivo ? '0 4px 16px rgba(0,0,0,0.12)' : 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: isAtivo ? 'var(--green)' : 'var(--ink)' }}>
                      {modo.titulo}
                    </h3>
                    {isAtivo && (
                      <span
                        className="pill"
                        style={{
                          display: 'inline-flex',
                          flex: '0 0 auto',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          background: 'var(--green)',
                          color: modoVisual === 'alto-contraste' ? '#000000' : '#ffffff',
                          fontWeight: 800,
                          fontSize: '11.5px',
                          lineHeight: 1,
                          whiteSpace: 'nowrap',
                          minHeight: '28px',
                          padding: '6px 10px'
                        }}
                      >
                        <Icon name="check" size={13} />
                        Em uso
                      </span>
                    )}
                  </div>
                  <small style={{ color: 'var(--muted)', display: 'block', margin: '4px 0 10px', fontSize: '13px' }}>
                    {modo.subtitulo}
                  </small>
                  <p style={{ margin: '0 0 10px', fontSize: '14px', lineHeight: 1.5, color: 'var(--ink)' }}>
                    {modo.descricao}
                  </p>
                  <div
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--muted)',
                      padding: '8px 10px',
                      background: 'var(--canvas)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <b>Benefício clínico:</b> {modo.beneficio}
                  </div>
                </div>

                {/* Amostra visual de cores */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', marginRight: '4px' }}>Cores:</span>
                    <span
                      title="Fundo"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: modo.cores.fundo,
                        border: '1.5px solid #888'
                      }}
                    />
                    <span
                      title="Destaque"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: modo.cores.destaque,
                        border: '1.5px solid #888'
                      }}
                    />
                    <span
                      title="Texto"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: modo.cores.texto,
                        border: '1.5px solid #888'
                      }}
                    />
                  </div>
                  <Button
                    variant={isAtivo ? 'primary' : 'secondary'}
                    size="normal"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModoVisual(modo.id);
                    }}
                  >
                    {isAtivo ? 'Modo Ativado' : 'Selecionar'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </article>

      {/* 2. CONTROLE DE TAMANHO DA TIPOGRAFIA E ESCALA */}
      <article className="record-card record-wide" style={{ marginBottom: '28px' }}>
        <div className="section-title" style={{ marginTop: 0 }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--green)' }}>TAMANHO DE TEXTO & ESCALA</span>
            <h2 style={{ fontSize: '22px' }}>Tamanho da Fonte da Interface</h2>
            <p className="muted">
              Aumente ou diminua os textos sem quebrar layouts nem perder botões.
            </p>
          </div>
          <span className="pill" style={{ fontSize: '13px', padding: '6px 12px' }}>
            Tamanho atual: <b>{rotulosFontes[fontStep]}</b>
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px'
          }}
        >
          <Button
            variant={fontStep === 0 ? 'primary' : 'secondary'}
            onClick={() => setFontStep(0)}
            style={{ minHeight: '48px', padding: '10px 20px', fontSize: '15px' }}
          >
            A Normal (16px)
          </Button>
          <Button
            variant={fontStep === 1 ? 'primary' : 'secondary'}
            onClick={() => setFontStep(1)}
            style={{ minHeight: '48px', padding: '10px 20px', fontSize: '17px' }}
          >
            A+ Grande (+18%)
          </Button>
          <Button
            variant={fontStep === 2 ? 'primary' : 'secondary'}
            onClick={() => setFontStep(2)}
            style={{ minHeight: '48px', padding: '10px 20px', fontSize: '19px' }}
          >
            A++ Muito Grande (+37%)
          </Button>
          <Button
            variant="quiet"
            onClick={diminuirFonte}
            disabled={fontStep === 0}
            title="Reduzir tamanho"
          >
            Diminuir (A-)
          </Button>
          <Button
            variant="quiet"
            onClick={aumentarFonte}
            disabled={fontStep === 2}
            title="Aumentar tamanho"
          >
            Aumentar (A+)
          </Button>
          <Button
            variant="quiet"
            onClick={resetarFonte}
            title="Redefinir tamanho para o padrão"
          >
            Redefinir Padrão
          </Button>
        </div>

        {/* Amostra em Tempo Real */}
        <div
          style={{
            marginTop: '20px',
            padding: '18px 22px',
            background: 'var(--canvas)',
            borderRadius: '12px',
            border: '1.5px solid var(--border)'
          }}
        >
          <span className="eyebrow" style={{ color: 'var(--green)' }}>EXEMPLO DE LEITURA EM TEMPO REAL</span>
          <p style={{ margin: '8px 0 4px', fontSize: '1.05em', lineHeight: 1.6, color: 'var(--ink)' }}>
            O cuidado paliativo acolhe o paciente e sua família em todos os momentos, promovendo alívio da dor, respeito à autonomia e conforto contínuo no domicílio.
          </p>
          <small style={{ color: 'var(--muted)', fontSize: '0.9em' }}>
            Este parágrafo reflete a escala exata aplicada em botões, formulários e prontuários.
          </small>
        </div>
      </article>

      {/* 3. REDUÇÃO DE MOVIMENTO E CONFORTO MOTOR */}
      <article className="record-card record-wide" style={{ marginBottom: '28px' }}>
        <div className="section-title" style={{ marginTop: 0 }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--green)' }}>CONFORTO MOTOR & SENSIBILIDADE</span>
            <h2 style={{ fontSize: '22px' }}>Redução de Movimento e Animações</h2>
            <p className="muted">
              Desative efeitos dinâmicos, transições de tela e rolagem rápida para evitar náuseas ou desconforto.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            padding: '16px 20px',
            background: 'var(--canvas)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            marginTop: '12px'
          }}
        >
          <div>
            <strong style={{ fontSize: '16px', color: 'var(--ink)' }}>
              {reduzirMovimento ? 'Animações e transições desativadas' : 'Animações suaves ativadas'}
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--muted)' }}>
              Recomendado para pacientes com labirintite, vertigem, náusea associada a quimioterapia ou dificuldades motoras.
            </p>
          </div>

          <Button
            variant={reduzirMovimento ? 'primary' : 'secondary'}
            onClick={() => setReduzirMovimento(!reduzirMovimento)}
            style={{ minHeight: '46px' }}
          >
            {reduzirMovimento ? '✓ Movimento Reduzido (Ativo)' : 'Ativar Redução de Movimento'}
          </Button>
        </div>
      </article>

      {/* 4. GUIA DE NAVEGAÇÃO ACESSÍVEL POR TECLADO */}
      <article className="record-card record-wide">
        <span className="eyebrow" style={{ color: 'var(--green)' }}>NAVEGAÇÃO POR TECLADO & LEITORES DE TELA</span>
        <h2 style={{ fontSize: '22px', margin: '4px 0 14px' }}>Atalhos e Facilidades Operacionais</h2>
        <div className="data-grid">
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--canvas)',
              borderRadius: '10px',
              border: '1px solid var(--border)'
            }}
          >
            <strong style={{ color: 'var(--green)', fontSize: '15px' }}>Tecla Tab</strong>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--ink)' }}>
              Navega ordenadamente para o próximo botão, campo ou opção interativa com foco visível destacado.
            </p>
          </div>
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--canvas)',
              borderRadius: '10px',
              border: '1px solid var(--border)'
            }}
          >
            <strong style={{ color: 'var(--green)', fontSize: '15px' }}>Shift + Tab</strong>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--ink)' }}>
              Retorna o foco para o elemento anterior na ordem lógica de leitura.
            </p>
          </div>
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--canvas)',
              borderRadius: '10px',
              border: '1px solid var(--border)'
            }}
          >
            <strong style={{ color: 'var(--green)', fontSize: '15px' }}>Enter ou Espaço</strong>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--ink)' }}>
              Confirma ações, seleciona botões de dor, horários de remédios e opções do chatbot.
            </p>
          </div>
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--canvas)',
              borderRadius: '10px',
              border: '1px solid var(--border)'
            }}
          >
            <strong style={{ color: 'var(--green)', fontSize: '15px' }}>Esc (Escape)</strong>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--ink)' }}>
              Fecha qualquer modal aberto (prescrição, dose de resgate ou orientações).
            </p>
          </div>
          <div style={{ padding: '14px 16px', background: 'var(--canvas)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <strong style={{ color: 'var(--green)', fontSize: '15px' }}>Alt + A</strong>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--ink)' }}>
              Alterna entre os três tamanhos de texto disponíveis.
            </p>
          </div>
          <div style={{ padding: '14px 16px', background: 'var(--canvas)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <strong style={{ color: 'var(--green)', fontSize: '15px' }}>Alt + C</strong>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--ink)' }}>
              Alterna o modo de alto contraste preto e amarelo.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
