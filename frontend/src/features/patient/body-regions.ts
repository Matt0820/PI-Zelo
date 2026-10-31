/**
 * Declara regiões selecionáveis do mapa corporal e os tipos de ocorrência apresentados na tela.
 */

export interface AnatomicalRegion {
  id: string;
  name: string;
  view: 'frente' | 'costas';
  category: 'cabeca' | 'tronco' | 'membros_superiores' | 'membros_inferiores';
  description: string;
}

/**
 * Regiões do mapa corporal usadas para interação por SVG e alternativa de seleção.
 */
export const ANATOMICAL_REGIONS: AnatomicalRegion[] = [
  // FRENTE (ANTERIOR)
  { id: 'cabeca_frente', name: 'Cabeça / Face', view: 'frente', category: 'cabeca', description: 'Testa, olhos, face e mandíbula' },
  { id: 'pescoco_frente', name: 'Pescoço anterior', view: 'frente', category: 'cabeca', description: 'Garganta e região cervical anterior' },
  { id: 'ombro_direito', name: 'Ombro direito', view: 'frente', category: 'membros_superiores', description: 'Articulação do ombro direito' },
  { id: 'ombro_esquerdo', name: 'Ombro esquerdo', view: 'frente', category: 'membros_superiores', description: 'Articulação do ombro esquerdo' },
  { id: 'torax', name: 'Tórax anterior / Peito', view: 'frente', category: 'tronco', description: 'Região peitoral e costelas anteriores' },
  { id: 'braco_superior_direito', name: 'Braço superior direito', view: 'frente', category: 'membros_superiores', description: 'Região entre o ombro e o cotovelo direitos' },
  { id: 'cotovelo_direito', name: 'Cotovelo direito', view: 'frente', category: 'membros_superiores', description: 'Articulação do cotovelo direito' },
  { id: 'antebraco_direito', name: 'Antebraço direito', view: 'frente', category: 'membros_superiores', description: 'Região entre o cotovelo e o punho direitos' },
  { id: 'mao_direita', name: 'Mão direita', view: 'frente', category: 'membros_superiores', description: 'Punho, palma e dedos da mão direita' },
  { id: 'braco_superior_esquerdo', name: 'Braço superior esquerdo', view: 'frente', category: 'membros_superiores', description: 'Região entre o ombro e o cotovelo esquerdos' },
  { id: 'cotovelo_esquerdo', name: 'Cotovelo esquerdo', view: 'frente', category: 'membros_superiores', description: 'Articulação do cotovelo esquerdo' },
  { id: 'antebraco_esquerdo', name: 'Antebraço esquerdo', view: 'frente', category: 'membros_superiores', description: 'Região entre o cotovelo e o punho esquerdos' },
  { id: 'mao_esquerda', name: 'Mão esquerda', view: 'frente', category: 'membros_superiores', description: 'Punho, palma e dedos da mão esquerda' },
  { id: 'abdomen_superior', name: 'Abdômen superior', view: 'frente', category: 'tronco', description: 'Boca do estômago e hipocôndrios' },
  { id: 'abdomen_inferior', name: 'Abdômen inferior / Pélvis', view: 'frente', category: 'tronco', description: 'Baixo ventre, virilha e bexiga' },
  { id: 'quadril_frente', name: 'Quadril / Bacia anterior', view: 'frente', category: 'tronco', description: 'Região pélvica e articulação do quadril' },
  { id: 'coxa_direita', name: 'Coxa direita', view: 'frente', category: 'membros_inferiores', description: 'Coxa e fêmur direito' },
  { id: 'coxa_esquerda', name: 'Coxa esquerda', view: 'frente', category: 'membros_inferiores', description: 'Coxa e fêmur esquerdo' },
  { id: 'joelho_perna_direita', name: 'Joelho / Perna / Pé direito', view: 'frente', category: 'membros_inferiores', description: 'Joelho, canela, tornozelo e pé direito' },
  { id: 'joelho_perna_esquerda', name: 'Joelho / Perna / Pé esquerdo', view: 'frente', category: 'membros_inferiores', description: 'Joelho, canela, tornozelo e pé esquerdo' },

  // COSTAS (POSTERIOR)
  { id: 'cabeca_costas', name: 'Nuca / Cabeça posterior', view: 'costas', category: 'cabeca', description: 'Occipital e parte de trás da cabeça' },
  { id: 'cervical', name: 'Coluna cervical / Pescoço posterior', view: 'costas', category: 'cabeca', description: 'Nuca e coluna cervical' },
  { id: 'dorso_superior', name: 'Costas superior / Escápulas', view: 'costas', category: 'tronco', description: 'Omoplatas e coluna torácica alta' },
  { id: 'lombar_sacra', name: 'Região lombar / Sacra', view: 'costas', category: 'tronco', description: 'Fundo das costas, coluna lombar e sacro' },
  { id: 'gluteos', name: 'Glúteos / Quadril posterior', view: 'costas', category: 'tronco', description: 'Nádegas e cóccix' },
  { id: 'braco_sup_dir_costas', name: 'Braço superior direito (costas)', view: 'costas', category: 'membros_superiores', description: 'Parte posterior entre o ombro e o cotovelo direitos' },
  { id: 'cotovelo_dir_costas', name: 'Cotovelo direito (costas)', view: 'costas', category: 'membros_superiores', description: 'Articulação posterior do cotovelo direito' },
  { id: 'antebraco_dir_costas', name: 'Antebraço direito (costas)', view: 'costas', category: 'membros_superiores', description: 'Parte posterior entre o cotovelo e o punho direitos' },
  { id: 'mao_dir_costas', name: 'Mão direita (costas)', view: 'costas', category: 'membros_superiores', description: 'Dorso e dedos da mão direita' },
  { id: 'braco_sup_esq_costas', name: 'Braço superior esquerdo (costas)', view: 'costas', category: 'membros_superiores', description: 'Parte posterior entre o ombro e o cotovelo esquerdos' },
  { id: 'cotovelo_esq_costas', name: 'Cotovelo esquerdo (costas)', view: 'costas', category: 'membros_superiores', description: 'Articulação posterior do cotovelo esquerdo' },
  { id: 'antebraco_esq_costas', name: 'Antebraço esquerdo (costas)', view: 'costas', category: 'membros_superiores', description: 'Parte posterior entre o cotovelo e o punho esquerdos' },
  { id: 'mao_esq_costas', name: 'Mão esquerda (costas)', view: 'costas', category: 'membros_superiores', description: 'Dorso e dedos da mão esquerda' },
  { id: 'coxa_dir_costas', name: 'Coxa direita posterior', view: 'costas', category: 'membros_inferiores', description: 'Posterior da coxa direita' },
  { id: 'coxa_esq_costas', name: 'Coxa esquerda posterior', view: 'costas', category: 'membros_inferiores', description: 'Posterior da coxa esquerda' },
  { id: 'panturrilha_pe_dir', name: 'Panturrilha / Calcanhar direito', view: 'costas', category: 'membros_inferiores', description: 'Batata da perna e calcanhar direito' },
  { id: 'panturrilha_pe_esq', name: 'Panturrilha / Calcanhar esquerdo', view: 'costas', category: 'membros_inferiores', description: 'Batata da perna e calcanhar esquerdo' }
];

import type { IconName } from '../../components/ui';

/**
 * Tipos de ocorrência que o paciente pode registrar.
 */
export type OccurrenceType = 'dor' | 'edema' | 'lesao';

/**
 * Rótulo, ícone, descrição e cores de um tipo de ocorrência.
 */
export interface OccurrenceConfig {
  type: OccurrenceType;
  label: string;
  icon: IconName;
  color: string;
  softColor: string;
  description: string;
}

/**
 * Metadados visuais dos tipos de ocorrência do mapa.
 */
export const OCCURRENCE_TYPES: Record<OccurrenceType, OccurrenceConfig> = {
  dor: {
    type: 'dor',
    label: 'Dor',
    icon: 'bolt',
    color: 'var(--danger)',
    softColor: 'var(--danger-soft)',
    description: 'Sensação dolorosa, pontada, queimação ou aperto'
  },
  edema: {
    type: 'edema',
    label: 'Inchaço (Edema)',
    icon: 'droplet',
    color: '#2563eb',
    softColor: '#eff6ff',
    description: 'Retenção de líquido, inchaço em pernas, braços ou abdômen'
  },
  lesao: {
    type: 'lesao',
    label: 'Ferida ou Lesão de pele',
    icon: 'bandage',
    color: '#7c3aed',
    softColor: '#f5f3ff',
    description: 'Lesão por pressão, vermelhidão, ferida tumoral ou bolhas'
  }
};
