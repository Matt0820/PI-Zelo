import React, { FormEvent, useState } from 'react';
import { Usuario, api } from '../../api';
import { Button } from '../../components/Button';
import { ModalDialog } from '../../components/ModalDialog';
import { NoticeFeedback } from '../../components/NoticeFeedback';

export type TeamModalType = 'paciente' | 'orientacao' | 'diagnostico' | 'agendamento' | 'medicacao';

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

  // Estados dedicados para prescrição de medicamentos
  const [medNome, setMedNome] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medHorario, setMedHorario] = useState('08:00');
  const [medFreq, setMedFreq] = useState('A cada 8 horas');
  const [medVigencia, setMedVigencia] = useState('Uso contínuo (30 dias)');
  const [medObs, setMedObs] = useState('');
  const [medResgate, setMedResgate] = useState(false);

  const atalhosEquipe = [
    {
      nome: 'Morfina 10mg (Resgate)',
      dose: '1 comprimido (10mg)',
      freq: 'Se dor forte (máx a cada 4h)',
      resgate: true,
      obs: 'Dose de resgate SOS se dor intensa (nota >= 7). Não ultrapassar a posologia sem contato com a equipe.'
    },
    {
      nome: 'Morfina 30mg (Contínuo)',
      dose: '1 comprimido (30mg)',
      freq: 'A cada 12 horas (08:00 e 20:00)',
      resgate: false,
      obs: 'Uso contínuo fixo para controle de dor basal. Tomar rigorosamente nos horários prescritos.'
    },
    {
      nome: 'Codeína 30mg',
      dose: '1 comprimido (30mg)',
      freq: 'A cada 6 horas se dor',
      resgate: false,
      obs: 'Opioide fraco para dor moderada. Associar a laxativo profilático conforme protocolo.'
    },
    {
      nome: 'Gabapentina 300mg',
      dose: '1 cápsula (300mg)',
      freq: '1x ao dia à noite',
      resgate: false,
      obs: 'Dor neuropática (queimação/choque). Tomar preferencialmente à noite para mitigar sonolência.'
    },
    {
      nome: 'Dipirona 500mg',
      dose: '1 comprimido (500mg)',
      freq: 'A cada 6 horas se dor/febre',
      resgate: false,
      obs: 'Analgésico e antitérmico para dor leve/moderada.'
    },
    {
      nome: 'Paracetamol 500mg',
      dose: '1 comprimido (500mg)',
      freq: 'A cada 8 horas',
      resgate: false,
      obs: 'Analgésico comum para controle de desconforto leve.'
    },
    {
      nome: 'Ondansetrona 8mg',
      dose: '1 comprimido (8mg)',
      freq: 'A cada 8 horas se náusea',
      resgate: false,
      obs: 'Antiemético. Tomar 30 min antes das refeições em caso de náusea ou profilático pré-quimio.'
    },
    {
      nome: 'Haloperidol 1mg',
      dose: '5 gotas (1mg)',
      freq: '1x ao dia à noite',
      resgate: false,
      obs: 'Controle de náusea refratária ou delírio/agitação noturna.'
    },
    {
      nome: 'Dexametasona 4mg',
      dose: '1 comprimido (4mg)',
      freq: '1x ao dia pela manhã',
      resgate: false,
      obs: 'Corticoide para edema peritumoral e astenia. Tomar com café da manhã para evitar gastrite.'
    },
    {
      nome: 'Lactulose 667mg/ml',
      dose: '15ml (1 colher de sopa)',
      freq: '1x ao dia à noite',
      resgate: false,
      obs: 'Laxativo osmótico profilático obrigatório no uso de opioides. Manter boa hidratação oral.'
    }
  ];

  function aplicarAtalho(a: typeof atalhosEquipe[0]) {
    setMedNome(a.nome);
    setMedDose(a.dose);
    setMedFreq(a.freq);
    setMedObs(a.obs);
    setMedResgate(a.resgate);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
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

  const title = {
    paciente: 'Cadastrar paciente',
    orientacao: 'Enviar orientação',
    diagnostico: 'Enviar diagnóstico e justificativa',
    agendamento: 'Enviar agendamento',
    medicacao: 'Prescrever Medicamento ou Receita'
  }[type];

  return (
    <ModalDialog
      title={title}
      kicker={patient?.nome || 'NOVO PRONTUÁRIO'}
      onClose={close}
      size="large"
    >
      <form onSubmit={submit} className="form-stack">
        {type === 'paciente' && (
          <>
            <label>
              Nome completo do paciente *
              <input name="nome" required maxLength={150} />
            </label>
            <label>
              Email do paciente *
              <input type="email" name="email" required maxLength={255} />
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

        {type === 'orientacao' && (
          <>
            <label>
              Título *
              <input
                name="titulo"
                required
                maxLength={200}
                placeholder="Ex.: Cuidados com a medicação da dor"
              />
            </label>
            <label>
              Orientação Clínica *
              <textarea
                name="descricao"
                required
                rows={5}
                placeholder="Escreva a orientação em linguagem direta e acessível para o paciente/familiar."
              />
            </label>
            <div className="form-grid">
              <label>
                Categoria
                <select name="categoria">
                  <option value="cuidados">Cuidados gerais</option>
                  <option value="sintoma">Manejo de Sintoma</option>
                  <option value="medicacao">Medicação e Posologia</option>
                </select>
              </label>
              <label>
                Prioridade
                <select name="prioridade">
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta (Urgente)</option>
                </select>
              </label>
            </div>
            <p className="helper">
              A orientação ficará disponível na tela inicial do app do paciente assim que for enviada.
            </p>
          </>
        )}

        {type === 'diagnostico' && (
          <>
            <label>
              Diagnóstico clínico *
              <input
                name="diagnostico"
                required
                placeholder="Diagnóstico oncológico e, se disponível, CID-10"
              />
            </label>
            <label>
              Motivo da indicação de cuidados paliativos *
              <textarea
                name="motivo"
                required
                rows={4}
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

        {type === 'agendamento' && (
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

        {type === 'medicacao' && (
          <>
            <div>
              <label style={{ marginBottom: '6px', display: 'block', fontWeight: 700 }}>
                Atalhos Rápidos de Cuidados Paliativos (Protocolo Clínico / RENAME):
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {atalhosEquipe.map(a => (
                  <button
                    key={a.nome}
                    type="button"
                    className="button button-quiet med-shortcut-btn"
                    onClick={() => aplicarAtalho(a)}
                  >
                    + {a.nome}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-grid">
              <label>
                Nome do Medicamento *
                <input
                  name="nome"
                  required
                  value={medNome}
                  onChange={e => setMedNome(e.target.value)}
                  placeholder="Ex.: Morfina 10mg"
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
                  placeholder="Ex.: A cada 8 horas, 1x ao dia…"
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
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>
                  É Dose de Resgate (Crise de Dor)
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
                placeholder="Ex.: Tomar com um copo de água após refeição. Não mastigar. Se náusea, tomar antiemético 30 min antes."
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
          <Button type="submit" variant="primary" loading={sending} loadingText="Salvando no prontuário…">
            {type === 'paciente'
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
