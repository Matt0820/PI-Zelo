import React, { useState } from 'react';
import { Usuario, LocalDor, api } from '../../api';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeading } from '../../components/PageHeading';
import { Icon } from '../../components/ui';
import {
  ANATOMICAL_REGIONS,
  OCCURRENCE_TYPES,
  OccurrenceType
} from './body-regions';

const OPPOSITE_REGION: Record<string, string> = {
  cabeca_frente: 'cabeca_costas', cabeca_costas: 'cabeca_frente',
  pescoco_frente: 'cervical', cervical: 'pescoco_frente',
  ombro_direito: 'braco_dir_costas', braco_dir_costas: 'ombro_direito',
  ombro_esquerdo: 'braco_esq_costas', braco_esq_costas: 'ombro_esquerdo',
  torax: 'dorso_superior', dorso_superior: 'torax',
  abdomen_superior: 'lombar_sacra', lombar_sacra: 'abdomen_superior',
  abdomen_inferior: 'gluteos', gluteos: 'abdomen_inferior',
  quadril_frente: 'gluteos',
  coxa_direita: 'coxa_dir_costas', coxa_dir_costas: 'coxa_direita',
  coxa_esquerda: 'coxa_esq_costas', coxa_esq_costas: 'coxa_esquerda',
  joelho_perna_direita: 'panturrilha_pe_dir', panturrilha_pe_dir: 'joelho_perna_direita',
  joelho_perna_esquerda: 'panturrilha_pe_esq', panturrilha_pe_esq: 'joelho_perna_esquerda'
};

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
  const [selectedRegionId, setSelectedRegionId] = useState<string>('abdomen_superior');
  const [tipoOcorrencia, setTipoOcorrencia] = useState<OccurrenceType>('dor');
  const [intensidade, setIntensidade] = useState<number>(6);
  const [observacao, setObservacao] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const selectedRegion =
    ANATOMICAL_REGIONS.find(r => r.id === selectedRegionId) ||
    ANATOMICAL_REGIONS.find(r => r.view === view) ||
    ANATOMICAL_REGIONS[0];


  function selecionarRegiao(id: string) {
    setSelectedRegionId(id);
    const reg = ANATOMICAL_REGIONS.find(r => r.id === id);
    if (reg && reg.view !== view) {
      setView(reg.view);
    }
  }

  function alternarVista(novaVista: 'frente' | 'costas') {
    setView(novaVista);
    const oppositeId = OPPOSITE_REGION[selectedRegionId];
    const oppositeRegion = ANATOMICAL_REGIONS.find(region => region.id === oppositeId && region.view === novaVista);
    if (oppositeRegion) setSelectedRegionId(oppositeRegion.id);
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
        {/* COLUNA ESQUERDA: SILHUETA VETORIAL SVG INTERATIVA */}
        <article className="record-card body-silhouette-card">
          <div className="section-title body-map-heading" style={{ marginTop: 0 }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--green)' }}>SILHUETA VETORIAL ANATÔMICA</span>
              <h2 style={{ fontSize: '20px' }}>
                {view === 'frente' ? 'Visão Anterior (Frente)' : 'Visão Posterior (Costas)'}
              </h2>
            </div>

            {/* Alternância Frente / Costas */}
            <div className="sub-nav-tabs body-map-tabs" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`sub-nav-btn ${view === 'frente' ? 'active' : ''}`}
                onClick={() => alternarVista('frente')}
                aria-pressed={view === 'frente'}
              >
              <Icon name="accessibility"/> Frente
              </button>
              <button
                type="button"
                className={`sub-nav-btn ${view === 'costas' ? 'active' : ''}`}
                onClick={() => alternarVista('costas')}
                aria-pressed={view === 'costas'}
              >
                Costas
              </button>
            </div>
          </div>

          <p className="muted" style={{ fontSize: '13.5px', margin: '4px 0 16px' }}>
            Toque na parte do corpo desejada ou use a tecla Tab para navegar pelas regiões anatômicas.
          </p>

          {/* SVG INTERATIVO DA SILHUETA HUMANA */}
          <div className="svg-silhouette-wrapper">
            <svg
              viewBox="0 0 320 540"
              className="body-svg-canvas"
              role="img"
              aria-label={`Silhueta anatômica humana - ${view === 'frente' ? 'Frente' : 'Costas'}`}
            >
              <defs>
                <filter id="shadow-drop" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* FRENTE */}
              {view === 'frente' && (
                <g className="svg-body-group frente">
                  {/* Cabeça / Face */}
                  <path
                    d="M 160 30 C 140 30 130 45 130 70 C 130 95 142 110 160 110 C 178 110 190 95 190 70 C 190 45 180 30 160 30 Z"
                    className={`svg-body-part ${selectedRegionId === 'cabeca_frente' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('cabeca_frente')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('cabeca_frente')}
                    role="button"
                    tabIndex={0}
                    aria-label="Cabeça e Face (Frente)"
                    aria-pressed={selectedRegionId === 'cabeca_frente'}
                  />
                  {/* Pescoço anterior */}
                  <path
                    d="M 148 110 L 172 110 L 175 132 L 145 132 Z"
                    className={`svg-body-part ${selectedRegionId === 'pescoco_frente' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('pescoco_frente')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('pescoco_frente')}
                    role="button"
                    tabIndex={0}
                    aria-label="Pescoço anterior"
                    aria-pressed={selectedRegionId === 'pescoco_frente'}
                  />
                  {/* Ombro Direito */}
                  <path
                    d="M 145 132 L 95 152 L 110 182 L 138 155 Z"
                    className={`svg-body-part ${selectedRegionId === 'ombro_direito' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('ombro_direito')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('ombro_direito')}
                    role="button"
                    tabIndex={0}
                    aria-label="Ombro direito"
                    aria-pressed={selectedRegionId === 'ombro_direito'}
                  />
                  {/* Ombro Esquerdo */}
                  <path
                    d="M 175 132 L 225 152 L 210 182 L 182 155 Z"
                    className={`svg-body-part ${selectedRegionId === 'ombro_esquerdo' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('ombro_esquerdo')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('ombro_esquerdo')}
                    role="button"
                    tabIndex={0}
                    aria-label="Ombro esquerdo"
                    aria-pressed={selectedRegionId === 'ombro_esquerdo'}
                  />
                  {/* Tórax anterior / Peito */}
                  <path
                    d="M 138 140 L 182 140 L 188 200 L 132 200 Z"
                    className={`svg-body-part ${selectedRegionId === 'torax' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('torax')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('torax')}
                    role="button"
                    tabIndex={0}
                    aria-label="Tórax anterior / Peito"
                    aria-pressed={selectedRegionId === 'torax'}
                  />
                  {/* Abdômen Superior */}
                  <path
                    d="M 132 200 L 188 200 L 186 242 L 134 242 Z"
                    className={`svg-body-part ${selectedRegionId === 'abdomen_superior' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('abdomen_superior')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('abdomen_superior')}
                    role="button"
                    tabIndex={0}
                    aria-label="Abdômen superior"
                    aria-pressed={selectedRegionId === 'abdomen_superior'}
                  />
                  {/* Abdômen Inferior / Pélvis */}
                  <path
                    d="M 134 242 L 186 242 L 195 285 L 125 285 Z"
                    className={`svg-body-part ${selectedRegionId === 'abdomen_inferior' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('abdomen_inferior')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('abdomen_inferior')}
                    role="button"
                    tabIndex={0}
                    aria-label="Abdômen inferior e pélvis"
                    aria-pressed={selectedRegionId === 'abdomen_inferior'}
                  />
                  {/* Braço Direito */}
                  <path
                    d="M 95 152 L 72 230 L 60 300 L 80 305 L 94 235 L 110 182 Z"
                    className={`svg-body-part ${selectedRegionId === 'braco_direito' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('braco_direito')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('braco_direito')}
                    role="button"
                    tabIndex={0}
                    aria-label="Braço e mão direita"
                    aria-pressed={selectedRegionId === 'braco_direito'}
                  />
                  {/* Braço Esquerdo */}
                  <path
                    d="M 225 152 L 248 230 L 260 300 L 240 305 L 226 235 L 210 182 Z"
                    className={`svg-body-part ${selectedRegionId === 'braco_esquerdo' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('braco_esquerdo')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('braco_esquerdo')}
                    role="button"
                    tabIndex={0}
                    aria-label="Braço e mão esquerda"
                    aria-pressed={selectedRegionId === 'braco_esquerdo'}
                  />
                  {/* Coxa Direita */}
                  <path
                    d="M 125 285 L 157 285 L 153 390 L 120 390 Z"
                    className={`svg-body-part ${selectedRegionId === 'coxa_direita' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('coxa_direita')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('coxa_direita')}
                    role="button"
                    tabIndex={0}
                    aria-label="Coxa direita"
                    aria-pressed={selectedRegionId === 'coxa_direita'}
                  />
                  {/* Coxa Esquerda */}
                  <path
                    d="M 163 285 L 195 285 L 200 390 L 167 390 Z"
                    className={`svg-body-part ${selectedRegionId === 'coxa_esquerda' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('coxa_esquerda')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('coxa_esquerda')}
                    role="button"
                    tabIndex={0}
                    aria-label="Coxa esquerda"
                    aria-pressed={selectedRegionId === 'coxa_esquerda'}
                  />
                  {/* Joelho, Perna e Pé Direito */}
                  <path
                    d="M 120 390 L 153 390 L 148 480 L 125 515 L 108 515 L 122 470 Z"
                    className={`svg-body-part ${selectedRegionId === 'joelho_perna_direita' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('joelho_perna_direita')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('joelho_perna_direita')}
                    role="button"
                    tabIndex={0}
                    aria-label="Joelho, perna e pé direito"
                    aria-pressed={selectedRegionId === 'joelho_perna_direita'}
                  />
                  {/* Joelho, Perna e Pé Esquerdo */}
                  <path
                    d="M 167 390 L 200 390 L 198 470 L 212 515 L 195 515 L 172 480 Z"
                    className={`svg-body-part ${selectedRegionId === 'joelho_perna_esquerda' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('joelho_perna_esquerda')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('joelho_perna_esquerda')}
                    role="button"
                    tabIndex={0}
                    aria-label="Joelho, perna e pé esquerdo"
                    aria-pressed={selectedRegionId === 'joelho_perna_esquerda'}
                  />
                </g>
              )}

              {/* COSTAS */}
              {view === 'costas' && (
                <g className="svg-body-group costas">
                  {/* Cabeça / Nuca */}
                  <path
                    d="M 160 30 C 140 30 130 45 130 70 C 130 95 142 110 160 110 C 178 110 190 95 190 70 C 190 45 180 30 160 30 Z"
                    className={`svg-body-part ${selectedRegionId === 'cabeca_costas' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('cabeca_costas')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('cabeca_costas')}
                    role="button"
                    tabIndex={0}
                    aria-label="Cabeça posterior e nuca"
                    aria-pressed={selectedRegionId === 'cabeca_costas'}
                  />
                  {/* Cervical */}
                  <path
                    d="M 148 110 L 172 110 L 175 135 L 145 135 Z"
                    className={`svg-body-part ${selectedRegionId === 'cervical' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('cervical')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('cervical')}
                    role="button"
                    tabIndex={0}
                    aria-label="Coluna cervical e nuca"
                    aria-pressed={selectedRegionId === 'cervical'}
                  />
                  {/* Dorso / Costas Superior / Escápulas */}
                  <path
                    d="M 135 135 L 185 135 L 190 215 L 130 215 Z"
                    className={`svg-body-part ${selectedRegionId === 'dorso_superior' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('dorso_superior')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('dorso_superior')}
                    role="button"
                    tabIndex={0}
                    aria-label="Costas superior e escápulas"
                    aria-pressed={selectedRegionId === 'dorso_superior'}
                  />
                  {/* Região Lombar / Sacra */}
                  <path
                    d="M 130 215 L 190 215 L 188 260 L 132 260 Z"
                    className={`svg-body-part ${selectedRegionId === 'lombar_sacra' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('lombar_sacra')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('lombar_sacra')}
                    role="button"
                    tabIndex={0}
                    aria-label="Região lombar e sacra"
                    aria-pressed={selectedRegionId === 'lombar_sacra'}
                  />
                  {/* Glúteos */}
                  <path
                    d="M 132 260 L 188 260 L 195 305 L 125 305 Z"
                    className={`svg-body-part ${selectedRegionId === 'gluteos' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('gluteos')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('gluteos')}
                    role="button"
                    tabIndex={0}
                    aria-label="Glúteos e quadril posterior"
                    aria-pressed={selectedRegionId === 'gluteos'}
                  />
                  {/* Braço Direito Posterior */}
                  <path
                    d="M 95 152 L 72 230 L 60 300 L 80 305 L 94 235 L 110 182 Z"
                    className={`svg-body-part ${selectedRegionId === 'braco_dir_costas' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('braco_dir_costas')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('braco_dir_costas')}
                    role="button"
                    tabIndex={0}
                    aria-label="Braço direito posterior"
                    aria-pressed={selectedRegionId === 'braco_dir_costas'}
                  />
                  {/* Braço Esquerdo Posterior */}
                  <path
                    d="M 225 152 L 248 230 L 260 300 L 240 305 L 226 235 L 210 182 Z"
                    className={`svg-body-part ${selectedRegionId === 'braco_esq_costas' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('braco_esq_costas')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('braco_esq_costas')}
                    role="button"
                    tabIndex={0}
                    aria-label="Braço esquerdo posterior"
                    aria-pressed={selectedRegionId === 'braco_esq_costas'}
                  />
                  {/* Coxa Direita Posterior */}
                  <path
                    d="M 125 305 L 157 305 L 153 395 L 120 395 Z"
                    className={`svg-body-part ${selectedRegionId === 'coxa_dir_costas' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('coxa_dir_costas')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('coxa_dir_costas')}
                    role="button"
                    tabIndex={0}
                    aria-label="Coxa direita posterior"
                    aria-pressed={selectedRegionId === 'coxa_dir_costas'}
                  />
                  {/* Coxa Esquerda Posterior */}
                  <path
                    d="M 163 305 L 195 305 L 200 395 L 167 395 Z"
                    className={`svg-body-part ${selectedRegionId === 'coxa_esq_costas' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('coxa_esq_costas')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('coxa_esq_costas')}
                    role="button"
                    tabIndex={0}
                    aria-label="Coxa esquerda posterior"
                    aria-pressed={selectedRegionId === 'coxa_esq_costas'}
                  />
                  {/* Panturrilha / Calcanhar Direito */}
                  <path
                    d="M 120 395 L 153 395 L 148 480 L 138 520 L 118 520 L 122 470 Z"
                    className={`svg-body-part ${selectedRegionId === 'panturrilha_pe_dir' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('panturrilha_pe_dir')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('panturrilha_pe_dir')}
                    role="button"
                    tabIndex={0}
                    aria-label="Panturrilha e calcanhar direito"
                    aria-pressed={selectedRegionId === 'panturrilha_pe_dir'}
                  />
                  {/* Panturrilha / Calcanhar Esquerdo */}
                  <path
                    d="M 167 395 L 200 395 L 198 470 L 202 520 L 182 520 L 172 480 Z"
                    className={`svg-body-part ${selectedRegionId === 'panturrilha_pe_esq' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('panturrilha_pe_esq')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('panturrilha_pe_esq')}
                    role="button"
                    tabIndex={0}
                    aria-label="Panturrilha e calcanhar esquerdo"
                    aria-pressed={selectedRegionId === 'panturrilha_pe_esq'}
                  />
                </g>
              )}
              <path
                className="body-contour"
                aria-hidden="true"
                pointerEvents="none"
                d="M148 110 L145 132 C129 137 111 144 95 152 C85 180 76 207 70 230 L60 300 L80 305 L94 236 C100 210 111 190 127 176 C132 209 130 248 125 285 C121 320 122 359 120 390 L122 470 L108 515 L130 515 L148 480 L156 390 L160 300 L164 390 L172 480 L195 515 L212 515 L198 470 L200 390 C198 359 199 320 195 285 C190 248 188 209 193 176 C209 190 220 210 226 236 L240 305 L260 300 L250 230 C244 207 235 180 225 152 C209 144 191 137 175 132 L172 110"
              />
              <g className={`anatomy-details ${view}`} aria-hidden="true" pointerEvents="none">
                {view === 'frente' ? (
                  <>
                    <path d="M105 153 Q132 139 158 151 Q188 139 215 153 M160 154V193 M132 244 Q160 252 188 244" />
                    <circle cx="160" cy="221" r="2.5" />
                    <path d="M72 230 60 300 M248 230 260 300 M120 390H153 M167 390H200" />
                  </>
                ) : (
                  <>
                    <path d="M160 136V301 M132 158 Q148 148 158 177 Q145 191 130 195 M188 158 Q172 148 162 177 Q175 191 190 195" />
                    <path d="M139 231 Q160 241 181 231 M125 305 Q160 316 195 305 M120 395H153 M167 395H200" />
                    <circle cx="160" cy="274" r="2.5" />
                  </>
                )}
              </g>
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
              <Icon name="map-pin"/> {selectedRegion.name} ({selectedRegion.view === 'frente' ? 'Frente' : 'Costas'})
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
                      <span aria-hidden="true">{cfg.icon}</span>
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
                    <div className={`rating-row ${group.values.length === 3 ? 'rating-row-three' : ''}`}>
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
                placeholder="Ex.: Piora ao deitar de lado; há vermelhidão no local; curativo foi trocado pela manhã..."
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
            const dataFmt = new Date(item.criado_em).toLocaleString('pt-BR', {
              dateStyle: 'medium',
              timeStyle: 'short'
            });

            return (
              <article key={item.id} className="record-card" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '18px' }} aria-hidden="true">{config.icon}</span>
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
                  <p style={{ margin: '10px 0 0', fontSize: '14.5px', color: 'var(--ink)', lineHeight: 1.5, background: 'var(--canvas)', padding: '8px 12px', borderRadius: '8px' }}>
                    <><Icon name="clipboard"/> <b>Observação clínica:</b> {item.observacao}</>
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
