/**
 * Cliente HTTP do app mobile para comunicação com a API do Zelo.
 *
 * Centraliza a base URL, os endpoints e a conversão de resposta em modelos do
 * aplicativo, incluindo a escala ESAS e a triagem conversacional da dor.
 */
import { Platform } from 'react-native';
import type { ESASAssessment, LocalDor, Medicacao, Orientacao, PainTriageData, Sintoma } from './types';

const hostLocal = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const API_URL = (process.env.EXPO_PUBLIC_API_URL || `http://${hostLocal}:8000`).replace(/\/$/, '');

type UsuarioApi = {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  criado_em: string;
};

type SintomaApi = {
  id: number;
  nome: string;
  gravidade: Sintoma['gravidade'];
  momento: string;
  observacao: string | null;
  atualizado_em: string;
  user_id: number;
};

type ESASApi = {
  id: number;
  user_id: number;
  dor: number;
  cansaco: number;
  nausea: number;
  depressao: number;
  ansiedade: number;
  sonolencia: number;
  apetite: number;
  mal_estar: number;
  falta_de_ar: number;
  constipacao: number | null;
  gravidade_maxima: string;
  acionou_triagem_dor: boolean;
  observacao: string | null;
  data_registro: string;
};

type MedicacaoApi = {
  id: number;
  nome: string;
  dose: string;
  horario: string;
  frequencia: string;
  observacao: string | null;
  status: Medicacao['status'];
  eh_dose_resgate?: boolean;
  user_id: number;
};

type OrientacaoApi = {
  id: number;
  titulo: string;
  descricao: string;
  categoria: Orientacao['categoria'];
  prioridade: Orientacao['prioridade'];
  atualizada_em: string;
  user_id: number;
};

type LocalDorApi = {
  id:number; user_id:number; regiao_anatomica:string; tipo_ocorrencia:string;
  intensidade:number; observacao:string|null; medicamento_associado:string|null; criado_em:string;
};

async function requisicao<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se o backend está iniciado e a URL está correta.');
  }

  const body = await response.json().catch(() => null) as { detail?: unknown } | null;
  if (!response.ok) {
    const detail = body?.detail;
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((item) => (item as { msg?: string }).msg || 'Campo inválido').join('\n')
        : 'Não foi possível concluir a solicitação.';
    throw new Error(`API ${response.status} em ${path}: ${message}`);
  }

  return body as T;
}

export type DadosUsuario = { nome:string; email:string; senha:string; perfil:'paciente'|'cuidador'; prontuario:string|null; idade:number|null; sexo:string|null; cpf:string|null; telefone:string|null; cuidador_principal:string|null; parentesco_cuidador:string|null; diagnostico_oncologico:string|null; pps_score:number|null; comorbidades:string|null; alergias:string|null; proxima_consulta:string|null; tratamento_modificador:string|null };

export function criarUsuario(dados: DadosUsuario) {
  return requisicao<UsuarioApi>('/api/users', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function entrar(email: string, senha: string) {
  return requisicao<UsuarioApi>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

export async function buscarSintomas(userId: number): Promise<Sintoma[]> {
  const registros = await requisicao<SintomaApi[]>(`/api/users/${userId}/symptoms`);
  return registros.map((item) => ({
    id: String(item.id),
    nome: item.nome,
    gravidade: item.gravidade,
    momento: item.momento,
    observacao: item.observacao || '',
    atualizadoEm: item.atualizado_em,
  }));
}

export async function criarSintoma(userId: number, dados: Omit<Sintoma, 'id' | 'atualizadoEm'>): Promise<Sintoma> {
  const item = await requisicao<SintomaApi>(`/api/users/${userId}/symptoms`, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return {
    id: String(item.id),
    nome: item.nome,
    gravidade: item.gravidade,
    momento: item.momento,
    observacao: item.observacao || '',
    atualizadoEm: item.atualizado_em,
  };
}

export async function buscarESAS(userId: number): Promise<ESASAssessment[]> {
  const registros = await requisicao<ESASApi[]>(`/api/users/${userId}/esas`);
  return registros.map((item) => ({
    id: String(item.id),
    dor: item.dor,
    cansaco: item.cansaco,
    nausea: item.nausea,
    depressao: item.depressao,
    ansiedade: item.ansiedade,
    sonolencia: item.sonolencia,
    apetite: item.apetite,
    mal_estar: item.mal_estar,
    falta_de_ar: item.falta_de_ar,
    constipacao: item.constipacao || 0,
    observacao: item.observacao || '',
    acionouTriagem: item.acionou_triagem_dor,
    dataRegistro: item.data_registro,
  }));
}

export async function registrarESAS(
  userId: number,
  dados: Omit<ESASAssessment, 'id' | 'dataRegistro' | 'acionouTriagem'>,
): Promise<ESASAssessment> {
  const item = await requisicao<ESASApi>(`/api/users/${userId}/esas`, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return {
    id: String(item.id),
    dor: item.dor,
    cansaco: item.cansaco,
    nausea: item.nausea,
    depressao: item.depressao,
    ansiedade: item.ansiedade,
    sonolencia: item.sonolencia,
    apetite: item.apetite,
    mal_estar: item.mal_estar,
    falta_de_ar: item.falta_de_ar,
    constipacao: item.constipacao || 0,
    observacao: item.observacao || '',
    acionouTriagem: item.acionou_triagem_dor,
    dataRegistro: item.data_registro,
  };
}

export async function registrarTriagemDor(userId: number, dados: PainTriageData): Promise<void> {
  await requisicao(`/api/users/${userId}/triagem-dor`, {
    method: 'POST',
    body: JSON.stringify({
      intensidade_dor: dados.intensidadeDor,
      caracteristica_dor: dados.caracteristica,
      mais_de_duas_semanas: dados.maisDeDuasSemanas,
      fez_dose_resgate: dados.fezDoseResgate,
      medicamentos_efetivos: dados.medicamentosEfetivos,
      em_acompanhamento: dados.emAcompanhamento,
      tem_sintoma_acompanhante: dados.temSintomaAcompanhante,
      sintoma_acompanhante_desc: dados.sintomaAcompanhanteDesc || null,
      tem_fator_piora: dados.temFatorPiora,
      fator_piora_desc: dados.fatorPioraDesc || null,
      alerta_sinais_alarme_exibido: true,
      medidas_nao_farmacologicas_exibidas: true,
      solicitou_agendamento: dados.solicitouAgendamento,
    }),
  });
}

export async function buscarMedicacoes(userId: number): Promise<Medicacao[]> {
  const registros = await requisicao<MedicacaoApi[]>(`/api/users/${userId}/medications`);
  return registros.map((item) => ({
    id: String(item.id),
    nome: item.nome,
    dose: item.dose,
    horario: item.horario,
    frequencia: item.frequencia,
    observacao: item.observacao || '',
    status: item.status,
    ehDoseResgate: item.eh_dose_resgate,
  }));
}

export async function criarMedicacao(userId: number, dados: Omit<Medicacao, 'id'>): Promise<Medicacao> {
  const item = await requisicao<MedicacaoApi>(`/api/users/${userId}/medications`, {
    method: 'POST',
    body: JSON.stringify({
      nome: dados.nome,
      dose: dados.dose,
      horario: dados.horario,
      frequencia: dados.frequencia,
      observacao: dados.observacao,
      status: dados.status,
      eh_dose_resgate: dados.ehDoseResgate || false,
    }),
  });
  return {
    id: String(item.id),
    nome: item.nome,
    dose: item.dose,
    horario: item.horario,
    frequencia: item.frequencia,
    observacao: item.observacao || '',
    status: item.status,
    ehDoseResgate: item.eh_dose_resgate,
  };
}

export async function buscarOrientacoes(userId: number): Promise<Orientacao[]> {
  const registros = await requisicao<OrientacaoApi[]>(`/api/users/${userId}/orientations`);
  return registros.map((item) => ({
    id: String(item.id),
    titulo: item.titulo,
    descricao: item.descricao,
    categoria: item.categoria,
    prioridade: item.prioridade,
    atualizadaEm: item.atualizada_em,
  }));
}

export async function buscarLocaisDor(userId:number):Promise<LocalDor[]> {
  const rows=await requisicao<LocalDorApi[]>(`/api/users/${userId}/locais-dor`);
  return rows.map(row=>({id:String(row.id),regiaoAnatomica:row.regiao_anatomica,tipoOcorrencia:row.tipo_ocorrencia,intensidade:row.intensidade,observacao:row.observacao||'',medicamentoAssociado:row.medicamento_associado||'',criadoEm:row.criado_em}));
}

export async function registrarLocalDor(userId:number,dados:Omit<LocalDor,'id'|'criadoEm'>):Promise<LocalDor> {
  const row=await requisicao<LocalDorApi>(`/api/users/${userId}/locais-dor`,{method:'POST',body:JSON.stringify({regiao_anatomica:dados.regiaoAnatomica,tipo_ocorrencia:dados.tipoOcorrencia,intensidade:dados.intensidade,observacao:dados.observacao||null,medicamento_associado:dados.medicamentoAssociado||null})});
  return {id:String(row.id),regiaoAnatomica:row.regiao_anatomica,tipoOcorrencia:row.tipo_ocorrencia,intensidade:row.intensidade,observacao:row.observacao||'',medicamentoAssociado:row.medicamento_associado||'',criadoEm:row.criado_em};
}
