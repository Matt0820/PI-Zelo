import React, { useMemo, useState } from 'react';
import { ESAS } from '../../api';

export interface EsasTrendChartProps {
  esas: ESAS[];
}

interface SymptomMeta {
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
  color: string;
}

export const ESAS_SYMPTOMS: SymptomMeta[] = [
  { key: 'dor', label: 'Dor', color: '#dc2626' },
  { key: 'constipacao', label: 'Constipação', color: '#1b5e4a' },
  { key: 'nausea', label: 'Náusea', color: '#0d9488' },
  { key: 'falta_de_ar', label: 'Falta de ar', color: '#0284c7' },
  { key: 'cansaco', label: 'Cansaço', color: '#ea580c' },
  { key: 'ansiedade', label: 'Ansiedade', color: '#c2410c' },
  { key: 'depressao', label: 'Tristeza', color: '#2563eb' },
  { key: 'sonolencia', label: 'Sonolência', color: '#16a34a' },
  { key: 'apetite', label: 'Falta de apetite', color: '#ca8a04' },
  { key: 'mal_estar', label: 'Mal-estar', color: '#991b1b' }
];

export function EsasTrendChart({ esas }: EsasTrendChartProps): React.JSX.Element {
  // Ordena cronologicamente (da avaliação mais antiga para a mais recente)
  const chronological = useMemo(() => {
    return [...esas].sort(
      (a, b) => new Date(a.data_registro).getTime() - new Date(b.data_registro).getTime()
    );
  }, [esas]);

  // Sintomas selecionados para visualização ativa
  const [activeKeys, setActiveKeys] = useState<Set<string>>(
    new Set(['dor', 'constipacao', 'nausea', 'falta_de_ar'])
  );

  const toggleSymptom = (key: string) => {
    setActiveKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key); // mantém pelo menos um ativo
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const setPreset = (preset: 'paliativo' | 'fisicos' | 'todos') => {
    if (preset === 'paliativo') {
      setActiveKeys(new Set(['dor', 'constipacao']));
    } else if (preset === 'fisicos') {
      setActiveKeys(new Set(['dor', 'constipacao', 'nausea', 'falta_de_ar']));
    } else {
      setActiveKeys(new Set(ESAS_SYMPTOMS.map(s => s.key)));
    }
  };

  if (chronological.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          background: 'var(--paper)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}
      >
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          Nenhuma avaliação ESAS registrada para gerar a curva de tendência temporal.
        </p>
      </div>
    );
  }

  // Dimensões do gráfico SVG
  const svgWidth = 800;
  const svgHeight = 280;
  const padLeft = 45;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 45;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  const totalPoints = chronological.length;

  const getX = (index: number) => {
    if (totalPoints <= 1) return padLeft + chartWidth / 2;
    return padLeft + (index / (totalPoints - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(10, val));
    return padTop + chartHeight - (clamped / 10) * chartHeight;
  };

  // Linhas horizontais de referência (0, 2, 4, 6, 8, 10)
  const yTicks = [0, 2, 4, 6, 8, 10];
  const criticalY = getY(7);

  // Formatação de data resumida
  const formatShortDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatFullDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo'
    });
  };

  // Análise de Variação Recente (Delta entre última e penúltima avaliação)
  const lastRecord = chronological[chronological.length - 1];
  const prevRecord = chronological.length > 1 ? chronological[chronological.length - 2] : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Barra de Presets e Seletores */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>
            Filtros rápidos:
          </span>
          <button
            type="button"
            className="button button-quiet"
            style={{ minHeight: '32px', padding: '4px 10px', fontSize: '12px', borderRadius: '16px' }}
            onClick={() => setPreset('paliativo')}
          >
            Dor & Constipação
          </button>
          <button
            type="button"
            className="button button-quiet"
            style={{ minHeight: '32px', padding: '4px 10px', fontSize: '12px', borderRadius: '16px' }}
            onClick={() => setPreset('fisicos')}
          >
            Sintomas Físicos
          </button>
          <button
            type="button"
            className="button button-quiet"
            style={{ minHeight: '32px', padding: '4px 10px', fontSize: '12px', borderRadius: '16px' }}
            onClick={() => setPreset('todos')}
          >
            Todos os 10
          </button>
        </div>

        <span style={{ fontSize: '13px', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
          {chronological.length} {chronological.length === 1 ? 'avaliação registrada' : 'avaliações na linha do tempo'}
        </span>
      </div>

      {/* Chips Seletores Individuais de Sintomas */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}
        role="group"
        aria-label="Alternar exibição de sintomas na curva de tendência"
      >
        {ESAS_SYMPTOMS.map(s => {
          const active = activeKeys.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSymptom(s.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 11px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: active ? 800 : 500,
                border: `1.5px solid ${active ? s.color : 'var(--border)'}`,
                backgroundColor: active ? 'var(--paper)' : 'transparent',
                color: active ? 'var(--ink)' : 'var(--muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              aria-pressed={active}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: active ? s.color : '#c0b8ad',
                  display: 'inline-block'
                }}
              />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Contêiner Responsivo do Gráfico SVG */}
      <div
        style={{
          background: 'var(--paper)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '16px 12px 10px',
          overflowX: 'auto'
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            width: '100%',
            height: 'auto',
            minWidth: '580px',
            display: 'block'
          }}
          role="img"
          aria-label="Gráfico de linhas mostrando a evolução temporal dos sintomas da escala ESAS"
        >
          {/* Zona Crítica (>= 7) */}
          <rect
            x={padLeft}
            y={padTop}
            width={chartWidth}
            height={criticalY - padTop}
            fill="rgba(220, 38, 38, 0.05)"
            rx="4"
          />

          {/* Linha pontilhada no limiar 7 */}
          <line
            x1={padLeft}
            y1={criticalY}
            x2={padLeft + chartWidth}
            y2={criticalY}
            stroke="#dc2626"
            strokeDasharray="4 4"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
          <text
            x={padLeft + chartWidth - 6}
            y={criticalY - 6}
            fill="#dc2626"
            fontSize="10"
            fontWeight="700"
            textAnchor="end"
            opacity="0.9"
          >
            Zona Crítica (ESAS ≥ 7)
          </text>

          {/* Linhas horizontais e rótulos do Eixo Y */}
          {yTicks.map(val => {
            const y = getY(val);
            return (
              <g key={`y-${val}`}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartWidth}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  fill="var(--muted)"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="end"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Marcadores e rótulos do Eixo X (Datas) */}
          {chronological.map((rec, i) => {
            const x = getX(i);
            return (
              <g key={`x-${rec.id}`}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + chartHeight}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  strokeOpacity="0.4"
                />
                <text
                  x={x}
                  y={padTop + chartHeight + 20}
                  fill="var(--muted)"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatShortDate(rec.data_registro)}
                </text>
              </g>
            );
          })}

          {/* Traçado das linhas e pontos para cada sintoma ativo */}
          {ESAS_SYMPTOMS.filter(s => activeKeys.has(s.key)).map(s => {
            const points = chronological.map((rec, i) => {
              const rawVal = Number(rec[s.key] ?? 0);
              return {
                x: getX(i),
                y: getY(rawVal),
                val: rawVal,
                date: rec.data_registro
              };
            });

            const pathD =
              points.length > 1
                ? points.reduce((acc, pt, i) => {
                    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                  }, '')
                : '';

            return (
              <g key={`line-${s.key}`}>
                {/* Linha contínua se houver 2 ou mais pontos */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                )}

                {/* Pontos circulares com tooltip nativo */}
                {points.map((pt, i) => (
                  <circle
                    key={`dot-${s.key}-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.val >= 7 ? 6.5 : 5}
                    fill="var(--paper)"
                    stroke={s.color}
                    strokeWidth="2.5"
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  >
                    <title>
                      {`${s.label}: ${pt.val}/10 em ${formatFullDate(pt.date)}`}
                    </title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Painel de Variação Clínica Recente (Delta) */}
      {prevRecord && (
        <div
          style={{
            background: 'var(--paper-soft, #faf7f2)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '14px 16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink)' }}>
              Variação da Última Avaliação ({formatShortDate(prevRecord.data_registro)} → {formatShortDate(lastRecord.data_registro)}):
            </span>
            <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Resposta Terapêutica
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
              gap: '10px'
            }}
          >
            {ESAS_SYMPTOMS.filter(s => activeKeys.has(s.key)).map(s => {
              const currentVal = Number(lastRecord[s.key] ?? 0);
              const prevVal = Number(prevRecord[s.key] ?? 0);
              const delta = currentVal - prevVal;

              const isImprovement = delta < 0; // Menos sintoma = melhora clínica
              const isCritical = currentVal >= 7;

              return (
                <div
                  key={`delta-${s.key}`}
                  style={{
                    background: 'var(--paper)',
                    border: `1px solid ${isCritical ? '#fca5a5' : 'var(--border)'}`,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: s.color,
                        flexShrink: 0
                      }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                      {s.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: isCritical ? '#dc2626' : 'var(--ink)',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {currentVal}/10
                    </span>

                    {delta !== 0 ? (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: isImprovement ? 'var(--green)' : '#dc2626',
                          backgroundColor: isImprovement ? 'var(--green-soft)' : '#fee2e2',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontVariantNumeric: 'tabular-nums'
                        }}
                        title={isImprovement ? 'Melhora clínica' : 'Agravamento do sintoma'}
                      >
                        {isImprovement ? `↓ ${delta}` : `↑ +${delta}`}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--muted)',
                          padding: '2px 5px',
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      >
                        =
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
