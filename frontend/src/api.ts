export type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  prontuario: string | null;
  idade: number | null;
  sexo: string | null;
  cpf: string | null;
  telefone: string | null;
  cuidador_principal: string | null;
  parentesco_cuidador: string | null;
  diagnostico_oncologico: string | null;
  pps_score: number | null;
  comorbidades: string | null;
  alergias: string | null;
  proxima_consulta: string | null;
  tratamento_modificador: string | null;
  criado_em: string;
};

export type ESAS = {
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

export type Triagem = {
  id: number;
  user_id: number;
  intensidade_dor: number;
  caracteristica_dor: string;
  mais_de_duas_semanas: boolean;
  tipo_dor: string;
  fez_dose_resgate: boolean;
  medicamentos_efetivos: boolean;
  em_acompanhamento: boolean;
  tem_sintoma_acompanhante: boolean;
  sintoma_acompanhante_desc: string | null;
  tem_fator_piora: boolean;
  fator_piora_desc: string | null;
  solicitou_agendamento: boolean;
  status_atendimento: string;
  data_triagem: string;
};

export type Alerta = {
  id: number;
  user_id: number;
  tipo_alerta: string;
  titulo: string;
  descricao: string;
  severidade: string;
  estado: string;
  revisado_por: string | null;
  observacao_conduta: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type Evolucao = {
  id: number;
  user_id: number;
  profissional_nome: string;
  cargo: string;
  conselho_classe: string | null;
  tipo_evolucao: string;
  conteudo: string;
  conduta_plano: string | null;
  criado_em: string;
};

export type LocalDor = {
  id: number;
  user_id: number;
  regiao_anatomica: string;
  tipo_ocorrencia: string;
  intensidade: number;
  foto_anexada_url: string | null;
  observacao: string | null;
  medicamento_associado: string | null;
  criado_em: string;
};

export type Medicacao = {
  id: number;
  user_id: number;
  nome: string;
  dose: string;
  horario: string;
  frequencia: string;
  observacao: string | null;
  status: string;
  eh_dose_resgate: boolean;
  medico_prescritor: string | null;
  vigencia: string | null;
};

export type MedicamentoCatalogo = {
  id: number;
  nome: string;
  principio_ativo: string | null;
  via_administracao: string;
  dose_padrao: string;
  frequencia_padrao: string;
  eh_dose_resgate: boolean;
  sintoma_alvo: string | null;
  orientacoes_padrao: string | null;
  ativo: boolean;
  criado_em: string;
};

export type Orientacao = {
  id: number;
  user_id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  atualizada_em: string;
};

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const tokenKey = '@zelo/web/access-token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(tokenKey);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(tokenKey, token);
    } else {
      localStorage.removeItem(tokenKey);
    }
  } catch {
    // Armazenamento indisponível: sessão em memória
  }
}

export type AuthResponse = {
  user: Usuario;
  access_token: string;
  token_type: 'bearer';
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isNullableString(value: unknown): boolean {
  return value === null || typeof value === 'string';
}

export function isUsuario(value: unknown): value is Usuario {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.nome === 'string' &&
    typeof value.email === 'string' &&
    typeof value.perfil === 'string' &&
    typeof value.ativo === 'boolean' &&
    typeof value.criado_em === 'string' &&
    [
      'prontuario',
      'sexo',
      'cpf',
      'telefone',
      'cuidador_principal',
      'parentesco_cuidador',
      'diagnostico_oncologico',
      'comorbidades',
      'alergias',
      'proxima_consulta',
      'tratamento_modificador'
    ].every(key => isNullableString(value[key])) &&
    (value.idade === null || typeof value.idade === 'number') &&
    (value.pps_score === null || typeof value.pps_score === 'number')
  );
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  const token = getToken();
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers
      }
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Confirme se o backend está iniciado.');
  }

  const body = (await response.json().catch(() => null)) as { detail?: unknown } | null;

  if (response.status === 401 && path !== '/api/auth/login' && path !== '/api/login') {
    setToken(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('zelo:auth-expired'));
    }
  }

  if (!response.ok) {
    const detail = body?.detail;
    const msg =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
        ? detail.map(e => String((e as { msg?: string }).msg || 'Campo inválido')).join('; ')
        : 'Não foi possível concluir a solicitação.';
    throw new Error(`API ${response.status}: ${msg}`);
  }

  return body as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, data: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(data) });

export const api = {
  login: async (email: string, senha: string): Promise<Usuario> => {
    const auth = await post<unknown>('/api/auth/login', { email, senha });
    if (!isRecord(auth) || !isUsuario(auth.user) || typeof auth.access_token !== 'string') {
      throw new Error(
        'A API de login está desatualizada ou incompatível. Reinicie o backend na versão atual e recarregue o site.'
      );
    }
    setToken(auth.access_token);
    return auth.user;
  },
  logout: (): void => {
    setToken(null);
  },
  getToken,
  setToken,
  pacientes: () => get<Usuario[]>('/api/users?perfil=paciente'),
  paciente: (id: number) => get<Usuario>(`/api/users/${id}`),
  criarPaciente: async (data: unknown): Promise<Usuario> => {
    const auth = await post<AuthResponse>('/api/users', data);
    setToken(auth.access_token);
    return auth.user;
  },
  esas: (id: number) => get<ESAS[]>(`/api/users/${id}/esas`),
  triagens: (id: number) => get<Triagem[]>(`/api/users/${id}/triagem-dor`),
  locaisDor: (id: number) => get<LocalDor[]>(`/api/users/${id}/locais-dor`),
  medicamentos: (id: number) => get<Medicacao[]>(`/api/users/${id}/medications`),
  orientacoes: (id: number) => get<Orientacao[]>(`/api/users/${id}/orientations`),
  evolucoes: (id: number) => get<Evolucao[]>(`/api/users/${id}/evolucoes`),
  alertas: () => get<Alerta[]>('/api/alertas'),
  registrarESAS: (id: number, data: unknown) => post<ESAS>(`/api/users/${id}/esas`, data),
  registrarMapaDor: (id: number, data: unknown) => post<LocalDor>(`/api/users/${id}/locais-dor`, data),
  enviarOrientacao: (id: number, data: unknown) =>
    post<Orientacao>(`/api/users/${id}/orientations`, data),
  registrarEvolucao: (id: number, data: unknown) => post<Evolucao>(`/api/users/${id}/evolucoes`, data),
  atualizarAlerta: (id: number, data: unknown) =>
    request<Alerta>(`/api/alertas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  criarMedicacao: (id: number, data: unknown) => post<Medicacao>(`/api/users/${id}/medications`, data),
  confirmarMedicacao: (id: number, medId: number) =>
    post<Medicacao>(`/api/users/${id}/medications/${medId}/confirm`, {}),
  desfazerConfirmacaoMedicacao: (id: number, medId: number) =>
    post<Medicacao>(`/api/users/${id}/medications/${medId}/undo-confirmation`, {}),
  registrarDoseResgate: (id: number, data: unknown) =>
    post<Medicacao>(`/api/users/${id}/rescue-doses`, data),
  atualizarMedicacao: (id: number, medId: number, data: unknown) =>
    request<Medicacao>(`/api/users/${id}/medications/${medId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  registrarTriagem: (id: number, data: unknown) =>
    post<Triagem>(`/api/users/${id}/triagem-dor`, data),
  catalogoMedicamentos: (params?: { search?: string; sintoma_alvo?: string; apenas_ativos?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.sintoma_alvo) query.set('sintoma_alvo', params.sintoma_alvo);
    if (params?.apenas_ativos !== undefined) query.set('apenas_ativos', String(params.apenas_ativos));
    const qs = query.toString();
    return get<MedicamentoCatalogo[]>(`/api/catalog/medications${qs ? `?${qs}` : ''}`);
  },
  criarMedicamentoCatalogo: (data: unknown) => post<MedicamentoCatalogo>('/api/catalog/medications', data),
  atualizarMedicamentoCatalogo: (id: number, data: unknown) =>
    request<MedicamentoCatalogo>(`/api/catalog/medications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  removerMedicamentoCatalogo: (id: number) =>
    request<void>(`/api/catalog/medications/${id}`, { method: 'DELETE' })
};
