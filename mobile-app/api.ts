/**
 * Cliente HTTP do app mobile para comunicação com a API do Zelo.
 *
 * Centraliza a base URL, os endpoints e a conversão de resposta em modelos do
 * aplicativo. Isso facilita manutenção, porque qualquer mudança na API pode ser
 * ajustada em um único lugar.
 */
import { Platform } from 'react-native';
import type { Medicacao, Orientacao, Sintoma } from './types';

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

type MedicacaoApi = {
  id: number;
  nome: string;
  dose: string;
  horario: string;
  frequencia: string;
  observacao: string | null;
  status: Medicacao['status'];
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

async function requisicao<T>(path: string, options: RequestInit = {}): Promise<T> {
  /**
   * Wrapper genérico para qualquer chamada à API.
   *
   * Mantém o tratamento de erro e a serialização em um único ponto, reduzindo
   * duplicação e padronizando mensagens para o restante do app.
   */
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
    throw new Error(message);
  }

  return body as T;
}

export function criarUsuario(dados: { nome: string; email: string; senha: string }) {
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
  }));
}

export async function criarMedicacao(userId: number, dados: Omit<Medicacao, 'id'>): Promise<Medicacao> {
  const item = await requisicao<MedicacaoApi>(`/api/users/${userId}/medications`, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  return {
    id: String(item.id),
    nome: item.nome,
    dose: item.dose,
    horario: item.horario,
    frequencia: item.frequencia,
    observacao: item.observacao || '',
    status: item.status,
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