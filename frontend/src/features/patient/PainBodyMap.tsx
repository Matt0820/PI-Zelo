import React, { useState } from 'react';
import { Usuario, LocalDor, api } from '../../api';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeading } from '../../components/PageHeading';
import { Icon } from '../../components/ui';
import bodyMapFront from '../../../images/anatomy/body-front.png';
import bodyMapBack from '../../../images/anatomy/body-back.png';
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
              viewBox="0 0 1024 1536"
              className="body-svg-canvas"
              role="group"
              aria-label={`Silhueta anatômica humana - ${view === 'frente' ? 'Frente' : 'Costas'}`}
            >
              <image
                href={view === 'frente' ? bodyMapFront : bodyMapBack}
                x="0"
                y="0"
                width="1024"
                height="1536"
                preserveAspectRatio="none"
                aria-hidden="true"
              />

              {/* FRENTE */}
              {view === 'frente' && (
                <g className="svg-body-group frente">
                  {/* Cabeça / Face */}
                  <path
                    d="M512 20 C459 20 444 63 444 111 C444 153 455 190 482 207 Q512 226 542 207 C569 190 580 153 580 111 C580 63 565 20 512 20Z"
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
                    d="M482 205 Q512 225 542 205 C548 226 556 241 564 251 Q512 278 460 251 C468 241 476 226 482 205Z"
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
                    d="M466 239 C426 256 365 276 321 293 Q312 321 314 358 C350 342 384 327 421 316 Q420 279 466 239Z"
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
                    d="M558 239 C598 256 659 276 703 293 Q712 321 710 358 C674 342 640 327 603 316 Q604 279 558 239Z"
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
                    d="M421 315 Q512 304 603 315 C620 354 639 404 644 451 Q627 457 603 449 Q558 435 512 421 Q466 435 421 449 Q397 457 380 451 C385 404 404 354 421 315Z"
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
                    d="M421 449 Q466 435 512 421 Q558 435 603 449 L590 538 Q512 547 434 538Z"
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
                    d="M434 538 Q512 547 590 538 L588 644 Q512 656 434 644Z"
                    className={`svg-body-part ${selectedRegionId === 'abdomen_inferior' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('abdomen_inferior')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('abdomen_inferior')}
                    role="button"
                    tabIndex={0}
                    aria-label="Abdômen inferior e pélvis"
                    aria-pressed={selectedRegionId === 'abdomen_inferior'}
                  />
                  {/* Quadril anterior */}
                  <path
                    d="M434 644 Q512 656 588 644 C603 694 624 744 660 780 Q594 802 512 790 Q430 802 364 780 C400 744 419 694 434 644Z"
                    className={`svg-body-part ${selectedRegionId === 'quadril_frente' ? 'selected' : ''}`}
                    onClick={() => selecionarRegiao('quadril_frente')}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && selecionarRegiao('quadril_frente')}
                    role="button"
                    tabIndex={0}
                    aria-label="Quadril e bacia anterior"
                    aria-pressed={selectedRegionId === 'quadril_frente'}
                  />
                  {/* Braço Direito */}
                  <path
                    d="M314 358 C304 405 302 463 293 507 L264 604 C250 650 235 697 219 735 Q195 751 164 777 L184 850 Q197 861 210 850 L229 836 Q244 849 256 834 L266 789 Q269 764 260 742 C282 706 300 662 316 618 L350 536 C365 493 380 454 385 420 Q389 387 405 358Z"
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
                    d="M710 358 C720 405 722 463 731 507 L760 604 C774 650 789 697 805 735 Q829 751 860 777 L840 850 Q827 861 814 850 L795 836 Q780 849 768 834 L758 789 Q755 764 764 742 C742 706 724 662 708 618 L674 536 C659 493 644 454 639 420 Q635 387 619 358Z"
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
                    d="M364 780 Q430 802 512 790 L512 970 Q480 966 447 961 Q395 953 363 965 C363 910 357 835 364 780Z"
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
                    d="M512 790 Q594 802 660 780 C667 835 661 910 661 965 Q629 953 577 961 Q544 966 512 970Z"
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
                    d="M363 965 Q395 953 447 961 Q480 966 512 970 L495 1160 Q483 1248 476 1335 L482 1373 Q472 1414 441 1440 Q410 1462 369 1432 Q347 1413 356 1380 L392 1320 Q390 1275 382 1220 Q365 1110 363 965Z"
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
                    d="M512 970 Q544 966 577 961 Q629 953 661 965 C659 1110 642 1220 634 1275 Q626 1320 662 1380 Q671 1413 649 1432 Q608 1462 577 1440 Q546 1414 536 1373 L542 1335 Q535 1248 529 1160Z"
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
                    d="M512 20 C459 20 444 63 444 111 C444 153 455 190 482 207 Q512 226 542 207 C569 190 580 153 580 111 C580 63 565 20 512 20Z"
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
                    d="M482 205 Q512 225 542 205 C548 226 556 241 564 251 Q512 278 460 251 C468 241 476 226 482 205Z"
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
                    d="M466 239 C425 256 366 277 320 295 Q313 326 316 358 C350 343 383 329 418 317 C420 399 426 494 432 594 Q512 615 592 594 C598 494 604 399 606 317 C641 329 674 343 708 358 Q711 326 704 295 C658 277 599 256 558 239 Q512 269 466 239Z"
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
                    d="M432 594 Q512 615 592 594 L588 690 Q512 706 436 690Z"
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
                    d="M436 690 Q512 706 588 690 C610 725 637 756 660 780 Q594 802 512 790 Q430 802 364 780 C387 756 414 725 436 690Z"
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
                    d="M316 358 C304 405 302 463 293 507 L264 604 C250 650 235 697 219 735 Q195 751 164 777 L184 850 Q197 861 210 850 L229 836 Q244 849 256 834 L266 789 Q269 764 260 742 C282 706 300 662 316 618 L350 536 C365 493 380 454 385 420 Q389 387 405 358Z"
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
                    d="M708 358 C720 405 722 463 731 507 L760 604 C774 650 789 697 805 735 Q829 751 860 777 L840 850 Q827 861 814 850 L795 836 Q780 849 768 834 L758 789 Q755 764 764 742 C742 706 724 662 708 618 L674 536 C659 493 644 454 639 420 Q635 387 619 358Z"
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
                    d="M364 780 Q430 802 512 790 L512 968 Q480 967 446 961 Q394 952 363 965 C363 900 358 835 364 780Z"
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
                    d="M512 790 Q594 802 660 780 C666 835 661 900 661 965 Q630 952 578 961 Q544 967 512 968Z"
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
                    d="M363 965 Q394 952 446 961 Q480 967 512 968 L495 1162 Q482 1248 476 1338 L482 1375 Q472 1415 442 1440 Q411 1463 370 1433 Q348 1414 356 1381 L392 1321 Q390 1276 382 1220 Q365 1110 363 965Z"
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
                    d="M512 968 Q544 967 578 961 Q630 952 661 965 C659 1110 642 1220 634 1276 Q626 1321 662 1381 Q670 1414 648 1433 Q607 1463 576 1440 Q546 1415 536 1375 L542 1338 Q535 1248 529 1162Z"
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
                      <Icon name={cfg.icon} size={18} />
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
                    <Icon name={config.icon} size={18} />
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
