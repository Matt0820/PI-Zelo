import { formatBrasiliaDateTime } from '../../utils/date-time';
import React, { useState } from 'react';
import { Usuario, LocalDor, api } from '../../api';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeading } from '../../components/PageHeading';
import {
  ANATOMICAL_REGIONS,
  OCCURRENCE_TYPES,
  OccurrenceType
} from './body-regions';
import bodyMapCostas from '../../assets/body-map-costas.png';
import bodyMapFrente from '../../assets/body-map-frente.png';

export interface PainBodyMapProps {
  usuario: Usuario;
  locaisDor: LocalDor[];
  refresh: () => Promise<void>;
  notice: (kind: 'success' | 'error', text: string) => void;
  onConcluir?: () => void;
}

export function PainBodyMap({
  usuario,
  locaisDor,
  refresh,
  notice,
  onConcluir
}: PainBodyMapProps): React.JSX.Element {
  const [view, setView] = useState<'frente' | 'costas'>('frente');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('peitoral_dir');
  const [tipoOcorrencia, setTipoOcorrencia] = useState<OccurrenceType>('dor');
  const [intensidade, setIntensidade] = useState<number>(6);
  const [observacao, setObservacao] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mostrarHistoricoNoMapa, setMostrarHistoricoNoMapa] = useState<boolean>(false);

  const selectedRegion =
    ANATOMICAL_REGIONS.find(r => r.id === selectedRegionId) ||
    ANATOMICAL_REGIONS.find(r => r.view === view) ||
    ANATOMICAL_REGIONS[0];

  const currentOccurrenceCfg = OCCURRENCE_TYPES[tipoOcorrencia] || OCCURRENCE_TYPES.dor;

  function selecionarRegiao(id: string) {
    setSelectedRegionId(id);
    const reg = ANATOMICAL_REGIONS.find(r => r.id === id);
    if (reg && reg.view !== view) {
      setView(reg.view);
    }
  }

  function alternarVisao(novaVisao: 'frente' | 'costas') {
    setView(novaVisao);
    // Sincroniza a região selecionada para a nova visão para manter o indicador no mapa visível
    const regiaoAtual = ANATOMICAL_REGIONS.find(r => r.id === selectedRegionId);
    if (regiaoAtual && regiaoAtual.view !== novaVisao) {
      const primeiraDaNovaVisao = ANATOMICAL_REGIONS.find(r => r.view === novaVisao);
      if (primeiraDaNovaVisao) {
        setSelectedRegionId(primeiraDaNovaVisao.id);
      }
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRegion) {
      notice('error', 'Selecione uma região do corpo na silhueta ou na lista.');
      return;
    }

    setLoading(true);
    try {
      await api.registrarMapaDor(usuario.id, {
        regiao_anatomica: selectedRegion.name,
        tipo_ocorrencia: tipoOcorrencia,
        intensidade: intensidade,
        observacao: observacao.trim() || null
      });

      await refresh();
      setObservacao('');
      notice('success', `Registro corporal em "${selectedRegion.name}" salvo com sucesso!`);
      if (onConcluir) onConcluir();
    } catch (err) {
      notice(
        'error',
        err instanceof Error ? err.message : 'Não foi possível salvar o registro no mapa corporal.'
      );
    } finally {
      setLoading(false);
    }
  }

  const currentRegions = ANATOMICAL_REGIONS.filter(r => r.view === view);

  // Mapear histórico de registros corporais para pins anatômicos nesta visão (opcional sob demanda)
  const markersInView = locaisDor
    .map(item => {
      const matched = ANATOMICAL_REGIONS.find(
        r =>
          r.name.toLowerCase() === item.regiao_anatomica.toLowerCase() ||
          item.regiao_anatomica.toLowerCase().includes(r.name.toLowerCase()) ||
          r.name.toLowerCase().includes(item.regiao_anatomica.toLowerCase())
      );
      if (!matched || matched.view !== view) return null;
      const cfg = OCCURRENCE_TYPES[item.tipo_ocorrencia as OccurrenceType] || OCCURRENCE_TYPES.dor;
      return {
        ...item,
        center: matched.center,
        regionName: matched.name,
        color: cfg.color
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return (
    <section className="pain-map-container" aria-label="Mapa Anatômico Corporal">
      <PageHeading
        kicker="MAPA CORPORAL INTERATIVO"
        title="Registrar Local de Dor, Inchaço ou Ferida"
        description="Toque na silhueta anatômica do corpo para apontar onde o sintoma se manifesta, defina a intensidade e envie para a equipe médica."
        action={
          onConcluir && (
            <Button variant="secondary" onClick={onConcluir}>
              Voltar ao Início
            </Button>
          )
        }
      />

      <div className="pain-map-grid">
        {/* COLUNA ESQUERDA: SILHUETA ANATÔMICA VETORIAL INTERATIVA */}
        <article className="record-card body-silhouette-card">
          <div className="section-title" style={{ marginTop: 0, flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--green)' }}>SILHUETA ANATÔMICA CLÍNICA</span>
              <h2 style={{ fontSize: '20px' }}>
                {view === 'frente' ? 'Visão Anterior (Frente)' : 'Visão Posterior (Costas)'}
              </h2>
            </div>

            {/* Alternância Frente / Costas e Toggle de Histórico */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {markersInView.length > 0 && (
                <button
                  type="button"
                  className={`sub-nav-btn ${mostrarHistoricoNoMapa ? 'active' : ''}`}
                  onClick={() => setMostrarHistoricoNoMapa(prev => !prev)}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  title="Alternar exibição dos apontamentos anteriores na silhueta"
                  aria-pressed={mostrarHistoricoNoMapa}
                >
                  {mostrarHistoricoNoMapa ? 'Ocultar Pontos Anteriores' : `Ver Pontos Anteriores (${markersInView.length})`}
                </button>
              )}

              <div className="sub-nav-tabs" style={{ marginBottom: 0 }}>
                <button
                  type="button"
                  className={`sub-nav-btn ${view === 'frente' ? 'active' : ''}`}
                  onClick={() => alternarVisao('frente')}
                  aria-pressed={view === 'frente'}
                >
                  Frente
                </button>
                <button
                  type="button"
                  className={`sub-nav-btn ${view === 'costas' ? 'active' : ''}`}
                  onClick={() => alternarVisao('costas')}
                  aria-pressed={view === 'costas'}
                >
                  Costas
                </button>
              </div>
            </div>
          </div>

          <p className="muted" style={{ fontSize: '13.5px', margin: '4px 0 16px' }}>
            Toque na parte do corpo desejada ou use a tecla Tab para navegar pelas regiões anatômicas.
          </p>

          {/* SVG INTERATIVO DA SILHUETA HUMANA */}
          <div className="svg-silhouette-wrapper">
            <svg
              viewBox="0 0 683 1024"
              className="body-svg-canvas"
              role="img"
              aria-label={`Silhueta anatômica humana - ${view === 'frente' ? 'Visão Anterior (Frente)' : 'Visão Posterior (Costas)'}`}
            >
              <defs>
                <filter id="shadow-drop" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
                </filter>
                <filter id="pin-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Camada 1: Imagem Anatômica Base da Silhueta */}
              <image
                href={view === 'frente' ? bodyMapFrente : bodyMapCostas}
                x="0"
                y="0"
                width="683"
                height="1024"
                className="body-silhouette-img"
                preserveAspectRatio="xMidYMid meet"
              />

              {/* Camada 2: Regiões Anatômicas Vetoriais Clicáveis */}
              <g className={`svg-body-group ${view}`}>
                {currentRegions.map(reg => {
                  const isSelected = selectedRegionId === reg.id;
                  return (
                    <path
                      key={reg.id}
                      d={reg.path}
                      className={`svg-body-part ${isSelected ? 'selected' : ''}`}
                      onClick={() => selecionarRegiao(reg.id)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao(reg.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${reg.name}: ${reg.description}`}
                      aria-pressed={isSelected}
                    >
                      <title>{`${reg.name} - ${reg.description}`}</title>
                    </path>
                  );
                })}
              </g>

              {/* Camada 3: Marcador Pulsante na Região Atualmente Selecionada */}
              {selectedRegion && selectedRegion.view === view && (
                <g
                  className="selected-target-marker"
                  transform={`translate(${selectedRegion.center.x}, ${selectedRegion.center.y})`}
                  style={{ pointerEvents: 'none' }}
                >
                  <circle r="22" className="selected-target-pulse" fill={currentOccurrenceCfg.color} fillOpacity="0.35" />
                  <circle r="10" fill={currentOccurrenceCfg.color} stroke="#ffffff" strokeWidth="2.5" />
                  <circle r="4" fill="#ffffff" />
                </g>
              )}

              {/* Camada 4: Pins de Registros Anteriores no Prontuário (apenas sob demanda) */}
              {mostrarHistoricoNoMapa && markersInView.map((item, idx) => (
                <g
                  key={item.id || idx}
                  className="recorded-pain-pin"
                  transform={`translate(${item.center.x}, ${item.center.y})`}
                  style={{ pointerEvents: 'none' }}
                  aria-hidden="true"
                >
                  <circle r="14" className="pulse-ring" fill={item.color} fillOpacity="0.35" />
                  <circle r="9" fill={item.color} stroke="#ffffff" strokeWidth="2" filter="url(#pin-glow)" />
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    fontSize="10"
                    fontWeight="800"
                    fill="#ffffff"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {item.intensidade}
                  </text>
                  <title>{`${item.regionName}: Intensidade ${item.intensidade}/10 (${item.tipo_ocorrencia})`}</title>
                </g>
              ))}
            </svg>
          </div>

          <div
            style={{
              marginTop: '14px',
              padding: '12px 14px',
              background: 'var(--canvas)',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
              Região Marcada no Mapa:
            </span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--green)', marginTop: '2px' }}>
              {selectedRegion.name} ({selectedRegion.view === 'frente' ? 'Frente' : 'Costas'})
            </div>
            <small className="muted">{selectedRegion.description}</small>
          </div>
        </article>

        {/* COLUNA DIREITA: FORMULÁRIO DE INTENSIDADE E TIPO CLÍNICO */}
        <article className="record-card">
          <h2 style={{ margin: '0 0 16px', fontSize: '20px' }}>Detalhes do Local Selecionado</h2>

          <form onSubmit={handleSalvar} className="form-stack">
            {/* Redundância Acessível: Seletor Textual de Região */}
            <label>
              Região Anatômica Selecionada:
              <select
                value={selectedRegionId}
                onChange={e => selecionarRegiao(e.target.value)}
                aria-label="Seletor de região corporal anatômica"
              >
                <optgroup label="Visão Anterior (Frente)">
                  {ANATOMICAL_REGIONS.filter(r => r.view === 'frente').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Visão Posterior (Costas)">
                  {ANATOMICAL_REGIONS.filter(r => r.view === 'costas').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>

            {/* Tipo de Ocorrência Clínica */}
            <div>
              <span style={{ display: 'block', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
                Tipo de Manifestação no Local:
              </span>
              <div className="occurrence-pills-row" role="radiogroup" aria-label="Tipo de manifestação">
                {(Object.keys(OCCURRENCE_TYPES) as OccurrenceType[]).map(typeKey => {
                  const cfg = OCCURRENCE_TYPES[typeKey];
                  const isSelected = tipoOcorrencia === typeKey;
                  return (
                    <button
                      key={typeKey}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`occurrence-pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => setTipoOcorrencia(typeKey)}
                    >
                      {cfg.icon && <span aria-hidden="true">{cfg.icon}</span>}
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Intensidade Numérica 0 a 10 com Agrupamento Ergonômico */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>
                  Intensidade do Incômodo:
                </span>
                <b
                  style={{
                    fontSize: '18px',
                    color: intensidade >= 7 ? 'var(--danger)' : 'var(--green)'
                  }}
                >
                  {intensidade}/10 · {intensidade <= 3 ? 'Leve' : intensidade <= 6 ? 'Moderado' : 'Forte / Intenso'}
                </b>
              </div>

              <div className="rating-groups" role="radiogroup" aria-label="Nota de intensidade de 0 a 10">
                {[
                  { label: 'Leve (0 a 3)', values: [0, 1, 2, 3] },
                  { label: 'Moderado (4 a 6)', values: [4, 5, 6] },
                  { label: 'Forte (7 a 10)', values: [7, 8, 9, 10] }
                ].map(group => (
                  <div className="rating-group" key={group.label} style={{ padding: '6px 8px' }}>
                    <div className="rating-label">{group.label}</div>
                    <div className="rating-row">
                      {group.values.map(n => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={intensidade === n}
                          className={`${intensidade === n ? 'selected' : ''} ${n >= 7 ? 'score-btn-high' : ''}`}
                          onClick={() => setIntensidade(n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações Clínicas Adicionais */}
            <label>
              Observações e Cuidados (Opcional):
              <textarea
                rows={3}
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                placeholder="Ex.: Piora ao deitar de lado; há vermelhidão no local; curativo foi trocado pela manhã…"
              />
            </label>

            {/* Botão de Envio */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              loadingText="Salvando no prontuário…"
              style={{ minHeight: '52px', marginTop: '6px' }}
            >
              Gravar Apontamento no Mapa Corporal
            </Button>
          </form>
        </article>
      </div>

      {/* SEÇÃO: HISTÓRICO DE APONTAMENTOS CORPORAIS DO PACIENTE */}
      <h2 className="section-heading" style={{ marginTop: '36px' }}>
        Registros Corporais Anteriores no Prontuário
      </h2>

      {locaisDor.length === 0 ? (
        <EmptyState
          title="Nenhum local registrado ainda"
          text="Seus apontamentos no mapa corporal aparecerão aqui com data, intensidade e orientações da equipe."
        />
      ) : (
        <div className="history-list">
          {locaisDor.map(item => {
            const config = OCCURRENCE_TYPES[item.tipo_ocorrencia as OccurrenceType] || OCCURRENCE_TYPES.dor;
            const dataFmt = formatBrasiliaDateTime(item.criado_em, { dateStyle: 'medium', timeStyle: 'short' });

            return (
              <article key={item.id} className="record-card" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    
                    <strong style={{ fontSize: '17px', color: 'var(--ink)' }}>
                      {item.regiao_anatomica}
                    </strong>
                    <span
                      className="pill"
                      style={{
                        background: item.intensidade >= 7 ? 'var(--danger-soft)' : 'var(--green-soft)',
                        color: item.intensidade >= 7 ? 'var(--danger)' : 'var(--green)',
                        fontWeight: 700
                      }}
                    >
                      Intensidade {item.intensidade}/10
                    </span>
                    <span className="pill">{config.label}</span>
                  </div>
                  <span className="muted" style={{ fontSize: '13px' }}>
                    {dataFmt}
                  </span>
                </div>

                {item.observacao && (
                  <p style={{ margin: '10px 0 0', fontSize: '14.5px', color: 'var(--ink)', lineHeight: 1.5, background: 'var(--canvas)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <b>Observação clínica:</b> {item.observacao}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
