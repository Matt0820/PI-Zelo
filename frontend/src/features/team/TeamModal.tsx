import React, { FormEvent, useEffect, useState } from 'react';
import { Usuario, MedicamentoCatalogo, api } from '../../api';
import { Button } from '../../components/Button';
import { ModalDialog } from '../../components/ModalDialog';
import { NoticeFeedback } from '../../components/NoticeFeedback';

export type TeamModalType =
  | 'paciente'
  | 'orientacao'
  | 'diagnostico'
  | 'agendamento'
  | 'medicacao'
  | 'cadastrar_farmaco';

export interface TeamModalProps {
  type: TeamModalType;
  patient: Usuario | null;
  professional: Usuario;
  close: () => void;
  done: (m: string) => void;
}

export function TeamModal({
  type,
  patient,
  professional,
  close,
  done
}: TeamModalProps): React.JSX.Element {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Submodo de cadastro de novo fármaco direto na tela de prescrição
  const [subModoCadastro, setSubModoCadastro] = useState(type === 'cadastrar_farmaco');

  // Estados dedicados para prescrição de medicamentos ao paciente
  const [medNome, setMedNome] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medHorario, setMedHorario] = useState('08:00');
  const [medFreq, setMedFreq] = useState('A cada 8 horas');
  const [medVigencia, setMedVigencia] = useState('Uso contínuo (30 dias)');
  const [medObs, setMedObs] = useState('');
  const [medResgate, setMedResgate] = useState(false);

  // Estados para cadastro no Catálogo do Banco de Dados
  const [catNome, setCatNome] = useState('');
  const [catPrincipio, setCatPrincipio] = useState('');
  const [catVia, setCatVia] = useState('Oral (VO)');
  const [catDose, setCatDose] = useState('');
  const [catFreq, setCatFreq] = useState('A cada 8 horas');
  const [catSintoma, setCatSintoma] = useState('Dor');
  const [catResgate, setCatResgate] = useState(false);
  const [catObs, setCatObs] = useState('');

  // Catálogo carregado do backend
  const [catalogo, setCatalogo] = useState<MedicamentoCatalogo[]>([]);
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(false);

  useEffect(() => {
    if (type === 'medicacao' || type === 'cadastrar_farmaco') {
      setCarregandoCatalogo(true);
      api.catalogoMedicamentos({ apenas_ativos: true })
        .then(items => setCatalogo(items))
        .catch(() => {})
        .finally(() => setCarregandoCatalogo(false));
    }
  }, [type]);

  function aplicarMedicamentoCatalogo(med: MedicamentoCatalogo) {
    setMedNome(med.nome);
    setMedDose(med.dose_padrao);
    setMedFreq(med.frequencia_padrao);
    setMedObs(med.orientacoes_padrao || '');
    setMedResgate(med.eh_dose_resgate);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError('');
    const f = new FormData(e.currentTarget);

    try {
      if (type === 'cadastrar_farmaco' || subModoCadastro) {
        const nome = (catNome || String(f.get('nome') || '')).trim();
        const dose = (catDose || String(f.get('dose_padrao') || '')).trim();
        const freq = (catFreq || String(f.get('frequencia_padrao') || '')).trim();
        const via = catVia || String(f.get('via_administracao') || 'Oral (VO)');
        const principio = (catPrincipio || String(f.get('principio_ativo') || '')).trim();
        const sintoma = catSintoma || String(f.get('sintoma_alvo') || 'Dor');
        const obs = (catObs || String(f.get('orientacoes_padrao') || '')).trim();
        const resgate = catResgate || f.get('eh_dose_resgate') === 'on';

        if (!nome || !dose || !freq) {
          throw new Error('Informe o nome do fármaco, a dose padrão e a frequência recomendada.');
        }

        const novo = await api.criarMedicamentoCatalogo({
          nome,
          principio_ativo: principio || null,
          via_administracao: via,
          dose_padrao: dose,
          frequencia_padrao: freq,
          eh_dose_resgate: resgate,
          sintoma_alvo: sintoma,
          orientacoes_padrao: obs || null,
          ativo: true
        });

        if (type === 'medicacao' && subModoCadastro) {
          // Volta para a prescrição já com o novo fármaco selecionado
          setCatalogo(prev => [novo, ...prev]);
          aplicarMedicamentoCatalogo(novo);
          setSubModoCadastro(false);
          setSending(false);
          return;
        }

        done(`Fármaco "${nome}" cadastrado com sucesso no catálogo institucional do banco de dados.`);
        return;
      }

      if (type === 'paciente') {
        await api.criarPaciente({
          nome: String(f.get('nome')),
          email: String(f.get('email')),
          senha: String(f.get('senha')),
          perfil: 'paciente',
          prontuario: String(f.get('prontuario') || '') || null,
          idade: f.get('idade') ? Number(f.get('idade')) : null,
          telefone: String(f.get('telefone') || '') || null,
          diagnostico_oncologico: String(f.get('diagnostico') || '') || null
        });
        done('Paciente cadastrado. Ele já pode acessar a conta com o email e a senha informados.');
      } else if (type === 'orientacao' && patient) {
        await api.enviarOrientacao(patient.id, {
          titulo: String(f.get('titulo')),
          descricao: String(f.get('descricao')),
          categoria: String(f.get('categoria')),
          prioridade: String(f.get('prioridade'))
        });
        done('Orientação enviada e disponibilizada no app do paciente.');
      } else if (type === 'diagnostico' && patient) {
        const diagnostico = String(f.get('diagnostico')).trim();
        const motivo = String(f.get('motivo')).trim();
        if (!diagnostico || !motivo)
          throw new Error('Preencha o diagnóstico e a justificativa dos cuidados paliativos.');
        await api.registrarEvolucao(patient.id, {
          profissional_nome: professional.nome,
          cargo: 'Equipe assistencial',
          tipo_evolucao: 'Diagnóstico e indicação de cuidados paliativos',
          conteudo: `Diagnóstico: ${diagnostico}\n\nMotivo da indicação de cuidados paliativos: ${motivo}`,
          conduta_plano: String(f.get('plano') || '') || null
        });
        await api.enviarOrientacao(patient.id, {
          titulo: 'Diagnóstico e cuidados paliativos',
          descricao: `Diagnóstico: ${diagnostico}\n\nMotivo do acompanhamento paliativo: ${motivo}`,
          categoria: 'cuidados',
          prioridade: 'media'
        });
        done('Diagnóstico registrado no prontuário e enviado ao app do paciente.');
      } else if (type === 'agendamento' && patient) {
        const data = String(f.get('data'));
        const hora = String(f.get('hora'));
        if (!data || !hora) throw new Error('Informe a data e o horário do agendamento.');
        const agendamento = `Atendimento agendado para ${new Date(`${data}T${hora}:00-03:00`).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}.\nMotivo: ${String(f.get('motivo') || 'Acompanhamento de cuidados paliativos')}`;
        const orientacaoAgendamento = String(f.get('orientacao') || '').trim();
        await api.registrarEvolucao(patient.id, {
          profissional_nome: professional.nome,
          cargo: 'Equipe assistencial',
          tipo_evolucao: 'Agendamento',
          conteudo: agendamento,
          conduta_plano: orientacaoAgendamento || null
        });
        await api.enviarOrientacao(patient.id, {
          titulo: 'Agendamento de atendimento',
          descricao: `${agendamento}${orientacaoAgendamento ? `\n\nOrientação: ${orientacaoAgendamento}` : ''}`,
          categoria: 'cuidados',
          prioridade: 'media'
        });
        done('Agendamento registrado no prontuário e enviado ao app do paciente.');
      } else if (type === 'medicacao' && patient) {
        const nome = medNome.trim() || String(f.get('nome') || '').trim();
        const dose = medDose.trim() || String(f.get('dose') || '').trim();
        const horario = medHorario.trim() || String(f.get('horario') || '08:00').trim();
        const frequencia = medFreq.trim() || String(f.get('frequencia') || 'A cada 8 horas').trim();
        const vigencia = medVigencia.trim() || String(f.get('vigencia') || 'Uso contínuo').trim();
        const observacao = (medObs || String(f.get('observacao') || '')).trim();
        const eh_dose_resgate = medResgate || f.get('eh_dose_resgate') === 'on';

        if (!nome || !dose) throw new Error('Informe o nome e a dose do medicamento.');

        await api.criarMedicacao(patient.id, {
          nome,
          dose,
          horario,
          frequencia,
          observacao: observacao || null,
          vigencia,
          eh_dose_resgate,
          medico_prescritor: professional.nome
        });

        await api.registrarEvolucao(patient.id, {
          profissional_nome: professional.nome,
          cargo: professional.perfil === 'medico' ? 'Médico Paliativista' : 'Equipe Assistencial',
          tipo_evolucao: eh_dose_resgate ? 'Prescrição de Dose de Resgate' : 'Prescrição Medicamentosa',
          conteudo: `Medicamento: ${nome} — Dose: ${dose}\nHorário inicial: ${horario} | Frequência: ${frequencia}\nVigência: ${vigencia}\nOrientações de uso: ${observacao || 'Conforme posologia prescrita.'}`,
          conduta_plano: `Prescrito por ${professional.nome}. Notificação e horários enviados ao app do paciente.`
        });

        done(`Medicamento ${nome} prescrito com sucesso no prontuário de ${patient.nome}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar.');
    } finally {
      setSending(false);
    }
  }

  const isCadastroFarmaco = type === 'cadastrar_farmaco' || subModoCadastro;

  const title = isCadastroFarmaco
    ? 'Cadastrar Fármaco no Catálogo Institucional'
    : {
        paciente: 'Cadastrar paciente',
        orientacao: 'Enviar orientação',
        diagnostico: 'Enviar diagnóstico e justificativa',
        agendamento: 'Enviar agendamento',
        medicacao: 'Prescrever Medicamento ou Receita',
        cadastrar_farmaco: 'Cadastrar Fármaco no Catálogo Institucional'
      }[type];

  return (
    <ModalDialog
      title={title}
      kicker={isCadastroFarmaco ? 'CATÁLOGO DE MEDICAMENTOS (BANCO DE DADOS)' : patient?.nome || 'NOVO PRONTUÁRIO'}
      onClose={close}
      size="large"
    >
      <form onSubmit={submit} className="form-stack">
        {/* CADASTRO DE NOVO FÁRMACO NO CATÁLOGO DO BANCO */}
        {isCadastroFarmaco && (
          <>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: '10px', marginBottom: '8px' }}>
              <strong style={{ color: '#166534', fontSize: '13.5px' }}>
                🏥 Formulário Institucional de Medicamentos (RENAME / Cuidados Paliativos)
              </strong>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#14532d', lineHeight: 1.45 }}>
                Os fármacos cadastrados aqui ficam salvos no banco de dados e são disponibilizados imediatamente com posologias de referência para a equipe médica e assistencial.
              </p>
            </div>

            <div className="form-grid">
              <label>
                Nome Comercial e Apresentação *
                <input
                  name="nome"
                  required
                  value={catNome}
                  onChange={e => setCatNome(e.target.value)}
                  placeholder="Ex.: Morfina 10mg (VO) ou Fentanil 25mcg/h (TD)"
                />
              </label>

              <label>
                Princípio Ativo
                <input
                  name="principio_ativo"
                  value={catPrincipio}
                  onChange={e => setCatPrincipio(e.target.value)}
                  placeholder="Ex.: Sulfato de Morfina"
                />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Via de Administração *
                <select
                  name="via_administracao"
                  value={catVia}
                  onChange={e => setCatVia(e.target.value)}
                  style={{ minHeight: '44px' }}
                >
                  <option value="Oral (VO)">Oral (VO)</option>
                  <option value="Subcutânea (SC)">Subcutânea (SC)</option>
                  <option value="Sublingual (SL)">Sublingual (SL)</option>
                  <option value="Transdérmica (TD)">Transdérmica (TD)</option>
                  <option value="Intravenosa (IV)">Intravenosa (IV)</option>
                  <option value="Retal (VR)">Retal (VR)</option>
                </select>
              </label>

              <label>
                Sintoma-Alvo Predominante (ESAS) *
                <select
                  name="sintoma_alvo"
                  value={catSintoma}
                  onChange={e => setCatSintoma(e.target.value)}
                  style={{ minHeight: '44px' }}
                >
                  <option value="Dor">Dor (Nociceptiva / Neuropática / Irruptiva)</option>
                  <option value="Constipação">Constipação (Intestino Preso / Indução por opioides)</option>
                  <option value="Náusea">Náusea e Vômito</option>
                  <option value="Dispneia">Dispneia (Falta de Ar)</option>
                  <option value="Delirium / Ansiedade">Delirium / Agitação / Ansiedade</option>
                  <option value="Secreção / Estertor">Secreção de vias aéreas / Estertor / Cólica</option>
                  <option value="Cansaço">Cansaço / Astenia</option>
                  <option value="Outro">Outro sintoma geral</option>
                </select>
              </label>
            </div>

            <div className="form-grid">
              <label>
                Dose Padrão de Referência *
                <input
                  name="dose_padrao"
                  required
                  value={catDose}
                  onChange={e => setCatDose(e.target.value)}
                  placeholder="Ex.: 1 comprimido (10mg) ou 15 mL"
                />
              </label>

              <label>
                Frequência Sugerida *
                <input
                  name="frequencia_padrao"
                  required
                  value={catFreq}
                  onChange={e => setCatFreq(e.target.value)}
                  placeholder="Ex.: A cada 4 horas ou 1x ao dia à noite"
                />
              </label>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '4px 0' }}>
              <input
                type="checkbox"
                name="eh_dose_resgate"
                checked={catResgate}
                onChange={e => setCatResgate(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--danger)' }}
              />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>
                ⚡ É dose de resgate recomendada (para alívio rápido de dor/crise aguda SOS)
              </span>
            </label>

            <label>
              Orientações, Recomendações e Precauções Clínicas
              <textarea
                name="orientacoes_padrao"
                rows={3}
                value={catObs}
                onChange={e => setCatObs(e.target.value)}
                placeholder="Ex.: Prescrever laxativo osmótico concomitante se for opioide contínuo. Não partir comprimidos de liberação prolongada."
              />
            </label>

            {type === 'medicacao' && subModoCadastro && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSubModoCadastro(false)}
                style={{ marginBottom: '8px' }}
              >
                ‹ Voltar à Prescrição do Paciente
              </Button>
            )}
          </>
        )}

        {/* CADASTRO DE PACIENTE */}
        {type === 'paciente' && !isCadastroFarmaco && (
          <>
            <label>
              Nome completo do paciente *
              <input name="nome" required maxLength={150} />
            </label>
            <label>
              Email do paciente *
              <input type="email" name="email" required maxLength={255} spellCheck={false} />
            </label>
            <label>
              Senha inicial *
              <input name="senha" type="password" required minLength={8} />
            </label>
            <div className="form-grid">
              <label>
                Prontuário
                <input name="prontuario" />
              </label>
              <label>
                Idade
                <input name="idade" type="number" min="0" max="125" />
              </label>
            </div>
            <label>
              Telefone
              <input name="telefone" type="tel" />
            </label>
            <label>
              Diagnóstico oncológico
              <input name="diagnostico" />
            </label>
            <p className="helper">
              O cadastro cria uma conta de paciente na API compartilhada com o app.
            </p>
          </>
        )}

        {/* ORIENTAÇÃO */}
        {type === 'orientacao' && !isCadastroFarmaco && (
          <>
            <label>
              Título da orientação *
              <input name="titulo" required maxLength={120} />
            </label>
            <label>
              Descrição e instruções *
              <textarea name="descricao" rows={4} required />
            </label>
            <div className="form-grid">
              <label>
                Categoria
                <select name="categoria" defaultValue="cuidados">
                  <option value="dor">Dor e analgesia</option>
                  <option value="constipacao">Constipação intestinal</option>
                  <option value="cuidados">Cuidados gerais e conforto</option>
                  <option value="sintomas">Controle de outros sintomas</option>
                  <option value="seguranca">Segurança e sinais de alarme</option>
                </select>
              </label>
              <label>
                Prioridade
                <select name="prioridade" defaultValue="media">
                  <option value="alta">Alta prioridade</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </label>
            </div>
            <p className="helper">A orientação é sincronizada com o app Zelo do paciente.</p>
          </>
        )}

        {/* DIAGNÓSTICO */}
        {type === 'diagnostico' && !isCadastroFarmaco && (
          <>
            <label>
              Diagnóstico oncológico e estadiamento *
              <input
                name="diagnostico"
                required
                defaultValue={patient?.diagnostico_oncologico || ''}
                placeholder="Ex.: Neoplasia de pulmão estágio IV com metástases ósseas"
              />
            </label>
            <label>
              Motivo e justificativa dos cuidados paliativos *
              <textarea
                name="motivo"
                rows={3}
                required
                placeholder="Registre o contexto clínico que fundamenta o acompanhamento paliativo exclusivo ou proporcional."
              />
            </label>
            <label>
              Plano de cuidado ou conduta
              <textarea name="plano" rows={3} placeholder="Condutas previstas pela equipe para este paciente…" />
            </label>
            <p className="helper">
              Será registrada como evolução clínica no prontuário, com autoria profissional e carimbo de data.
            </p>
          </>
        )}

        {/* AGENDAMENTO */}
        {type === 'agendamento' && !isCadastroFarmaco && (
          <>
            <div className="form-grid">
              <label>
                Data *
                <input type="date" name="data" required />
              </label>
              <label>
                Horário *
                <input type="time" name="hora" required />
              </label>
            </div>
            <label>
              Motivo do atendimento
              <input name="motivo" placeholder="Consulta de acompanhamento ou visita domiciliar…" />
            </label>
            <label>
              Orientação para o paciente
              <textarea
                name="orientacao"
                rows={3}
                placeholder="O que o paciente ou cuidador precisa saber antes do atendimento?"
              />
            </label>
            <p className="helper">O agendamento será incluído no histórico clínico compartilhado.</p>
          </>
        )}

        {/* PRESCRIÇÃO DE MEDICAMENTO AO PACIENTE */}
        {type === 'medicacao' && !isCadastroFarmaco && (
          <>
            {/* SELETOR DO CATÁLOGO DO BANCO */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ fontWeight: 700, color: 'var(--green-dark)', margin: 0, fontSize: '14px' }}>
                  💊 Selecionar do Catálogo do Banco de Dados:
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  
                  onClick={() => setSubModoCadastro(true)}
                  style={{ fontSize: '13px' }}
                >
                  + Cadastrar Novo Fármaco no Banco
                </Button>
              </div>

              {carregandoCatalogo ? (
                <small className="muted">Carregando catálogo terapêutico…</small>
              ) : (
                <select
                  onChange={e => {
                    const sel = catalogo.find(c => c.id === Number(e.target.value));
                    if (sel) aplicarMedicamentoCatalogo(sel);
                  }}
                  style={{ minHeight: '44px', width: '100%' }}
                >
                  <option value="">-- Escolha um medicamento do banco para autopreencher --</option>
                  {catalogo.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} [{c.via_administracao}] — Alvo: {c.sintoma_alvo || 'Geral'} {c.eh_dose_resgate ? '⚡ (Resgate SOS)' : ''}
                    </option>
                  ))}
                </select>
              )}

              {/* Atalhos Rápidos Clicáveis extraídos do Banco */}
              {catalogo.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {catalogo.slice(0, 8).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className="button button-quiet med-shortcut-btn"
                      onClick={() => aplicarMedicamentoCatalogo(c)}
                      title={c.orientacoes_padrao || c.nome}
                      style={{ fontSize: '12.5px', padding: '6px 10px', minHeight: '32px' }}
                    >
                      + {c.nome.split(' ')[0]} {c.dose_padrao}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-grid">
              <label>
                Nome do Medicamento *
                <input
                  name="nome"
                  required
                  value={medNome}
                  onChange={e => setMedNome(e.target.value)}
                  placeholder="Ex.: Morfina 10mg (VO)"
                />
              </label>
              <label>
                Dose / Posologia *
                <input
                  name="dose"
                  required
                  value={medDose}
                  onChange={e => setMedDose(e.target.value)}
                  placeholder="Ex.: 1 comprimido (10mg)"
                />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Horário da 1ª Dose
                <input
                  type="time"
                  name="horario"
                  value={medHorario}
                  onChange={e => setMedHorario(e.target.value)}
                />
              </label>
              <label>
                Frequência / Intervalo
                <input
                  name="frequencia"
                  value={medFreq}
                  onChange={e => setMedFreq(e.target.value)}
                  placeholder="Ex.: A cada 4 horas, 1x ao dia…"
                />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Vigência da Receita
                <input
                  name="vigencia"
                  value={medVigencia}
                  onChange={e => setMedVigencia(e.target.value)}
                  placeholder="Ex.: 30 dias / Uso contínuo"
                />
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  marginTop: '24px'
                }}
              >
                <input
                  type="checkbox"
                  name="eh_dose_resgate"
                  checked={medResgate}
                  onChange={e => setMedResgate(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--danger)' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>
                  ⚡ É Dose de Resgate (Crise de Dor / SOS)
                </span>
              </label>
            </div>

            <label>
              Orientações de Uso da Receita e Recomendações
              <textarea
                name="observacao"
                rows={3}
                value={medObs}
                onChange={e => setMedObs(e.target.value)}
                placeholder="Ex.: Tomar com um copo de água após refeição. Não mastigar. Se constipação, manter laxativo associado."
              />
            </label>

            <p className="helper">
              A prescrição médica fica imediatamente disponível na aba 'Medicações e Receitas' do paciente e agenda os lembretes diários.
            </p>
          </>
        )}

        {error && <NoticeFeedback kind="error" message={error} onDismiss={() => setError('')} />}

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={sending}
            loadingText={isCadastroFarmaco ? 'Salvando no catálogo…' : 'Salvando no prontuário…'}
          >
            {isCadastroFarmaco
              ? 'Salvar Fármaco no Banco'
              : type === 'paciente'
              ? 'Cadastrar paciente'
              : type === 'medicacao'
              ? 'Salvar Prescrição no Prontuário'
              : title}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
