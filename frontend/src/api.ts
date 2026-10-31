export type Usuario = {
  id: number; nome: string; email: string; perfil: string; ativo: boolean;
  prontuario: string | null; idade: number | null; sexo: string | null;
  cpf: string | null; telefone: string | null; cuidador_principal: string | null;
  parentesco_cuidador: string | null; diagnostico_oncologico: string | null;
  pps_score: number | null; comorbidades: string | null; alergias: string | null;
  proxima_consulta: string | null; tratamento_modificador: string | null;
  criado_em: string;
};
export type ESAS = { id:number; user_id:number; dor:number; cansaco:number; nausea:number; depressao:number; ansiedade:number; sonolencia:number; apetite:number; mal_estar:number; falta_de_ar:number; constipacao:number|null; gravidade_maxima:string; acionou_triagem_dor:boolean; observacao:string|null; data_registro:string };
export type Triagem = { id:number; user_id:number; intensidade_dor:number; caracteristica_dor:string; mais_de_duas_semanas:boolean; tipo_dor:string; fez_dose_resgate:boolean; medicamentos_efetivos:boolean; em_acompanhamento:boolean; tem_sintoma_acompanhante:boolean; sintoma_acompanhante_desc:string|null; tem_fator_piora:boolean; fator_piora_desc:string|null; solicitou_agendamento:boolean; status_atendimento:string; data_triagem:string };
export type Alerta = { id:number; user_id:number; tipo_alerta:string; titulo:string; descricao:string; severidade:string; estado:string; revisado_por:string|null; observacao_conduta:string|null; criado_em:string; atualizado_em:string };
export type Evolucao = { id:number; user_id:number; profissional_nome:string; cargo:string; conselho_classe:string|null; tipo_evolucao:string; conteudo:string; conduta_plano:string|null; criado_em:string };
export type LocalDor = { id:number; user_id:number; regiao_anatomica:string; tipo_ocorrencia:string; intensidade:number; foto_anexada_url:string|null; observacao:string|null; medicamento_associado:string|null; criado_em:string };
export type Medicacao = { id:number; user_id:number; nome:string; dose:string; horario:string; frequencia:string; observacao:string|null; status:string; eh_dose_resgate:boolean; medico_prescritor:string|null; vigencia:string|null };
export type Orientacao = { id:number; user_id:number; titulo:string; descricao:string; categoria:string; prioridade:string; atualizada_em:string };

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
async function request<T>(path:string, init:RequestInit={}):Promise<T>{
  let response:Response;
  try { response=await fetch(`${API_BASE}${path}`,{...init,headers:{'Content-Type':'application/json',...init.headers}}); }
  catch { throw new Error('Não foi possível conectar à API. Confirme se o backend está iniciado.'); }
  const body=await response.json().catch(()=>null) as {detail?:unknown}|null;
  if(!response.ok){const detail=body?.detail;const msg=typeof detail==='string'?detail:Array.isArray(detail)?detail.map((e)=>String((e as {msg?:string}).msg||'Campo inválido')).join('; '):'Não foi possível concluir a solicitação.';throw new Error(`API ${response.status}: ${msg}`);}
  return body as T;
}
const get=<T,>(path:string)=>request<T>(path);
const post=<T,>(path:string,data:unknown)=>request<T>(path,{method:'POST',body:JSON.stringify(data)});
export const api={
  login:(email:string,senha:string)=>post<Usuario>('/api/auth/login',{email,senha}),
  pacientes:()=>get<Usuario[]>('/api/users?perfil=paciente'),
  paciente:(id:number)=>get<Usuario>(`/api/users/${id}`),
  criarPaciente:(data:unknown)=>post<Usuario>('/api/users',data),
  esas:(id:number)=>get<ESAS[]>(`/api/users/${id}/esas`),
  triagens:(id:number)=>get<Triagem[]>(`/api/users/${id}/triagem-dor`),
  locaisDor:(id:number)=>get<LocalDor[]>(`/api/users/${id}/locais-dor`),
  medicamentos:(id:number)=>get<Medicacao[]>(`/api/users/${id}/medications`),
  orientacoes:(id:number)=>get<Orientacao[]>(`/api/users/${id}/orientations`),
  evolucoes:(id:number)=>get<Evolucao[]>(`/api/users/${id}/evolucoes`),
  alertas:()=>get<Alerta[]>('/api/alertas'),
  registrarESAS:(id:number,data:unknown)=>post<ESAS>(`/api/users/${id}/esas`,data),
  registrarMapaDor:(id:number,data:unknown)=>post<LocalDor>(`/api/users/${id}/locais-dor`,data),
  enviarOrientacao:(id:number,data:unknown)=>post<Orientacao>(`/api/users/${id}/orientations`,data),
  registrarEvolucao:(id:number,data:unknown)=>post<Evolucao>(`/api/users/${id}/evolucoes`,data),
  atualizarAlerta:(id:number,data:unknown)=>request<Alerta>(`/api/alertas/${id}`,{method:'PATCH',body:JSON.stringify(data)}),
  criarMedicacao:(id:number,data:unknown)=>post<Medicacao>(`/api/users/${id}/medications`,data),
};
