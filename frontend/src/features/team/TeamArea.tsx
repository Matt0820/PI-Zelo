import React, { useMemo } from 'react';
import { Usuario, Alerta, ESAS, Triagem, LocalDor, Medicacao, Orientacao, Evolucao } from '../../api';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { MetricCard } from '../../components/MetricCard';
import { PageHeading } from '../../components/PageHeading';
import { PatientCard } from './PatientCard';
import { AlertCard } from './AlertCard';
import { PatientRecord } from './PatientRecord';
import { TeamModalType } from './TeamModal';
import { AccessibilityPage } from '../accessibility';

export type TeamPage = 'painel' | 'pacientes' | 'alertas' | 'acessibilidade';

export interface TeamAreaProps {
  page: TeamPage;
  setPage: (p: TeamPage) => void;
  selected: Usuario | null;
  setSelected: (p: Usuario | null) => void;
  patients: Usuario[];
  alerts: Alerta[];
  query: string;
  setQuery: (q: string) => void;
  details: {
    esas: ESAS[];
    triagens: Triagem[];
    dor: LocalDor[];
    medicacoes: Medicacao[];
    orientacoes: Orientacao[];
    evolucoes: Evolucao[];
  };
  busy: boolean;
  setBusy: (v: boolean) => void;
  openPatient: (p: Usuario) => void;
  openModal: (m: TeamModalType) => void;
  notice: (kind: 'success' | 'error', text: string) => void;
  refreshDetail: () => Promise<void>;
  updateAlert: (a: Alerta, state: string) => void;
}

export function TeamArea({
  page,
  setPage,
  selected,
  setSelected,
  patients,
  alerts,
  query,
  setQuery,
  details,
  busy,
  setBusy,
  openPatient,
  openModal,
  notice,
  refreshDetail,
  updateAlert
}: TeamAreaProps): React.JSX.Element {
  const filteredPatients = useMemo(
    () =>
      patients.filter(p =>
        `${p.nome} ${p.prontuario || ''} ${p.diagnostico_oncologico || ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [patients, query]
  );

  const pendingAlerts = alerts.filter(a => a.estado !== 'Tratado');
  const criticalAlerts = alerts.filter(a => a.severidade === 'grave' && a.estado !== 'Tratado');

  // Se um paciente estiver aberto, exibe seu prontuário detalhado
  if (selected) {
    return (
      <PatientRecord
        patient={selected}
        details={details}
        openModal={openModal}
        back={() => {
          setBusy(false);
          setSelected(null);
          setPage('pacientes');
        }}
        busy={busy}
        notice={notice}
        refresh={refreshDetail}
      />
    );
  }

  // TELA: ALERTAS CLÍNICOS
  if (page === 'alertas') {
    return (
      <section aria-label="Central de Alertas Clínicos">
        <PageHeading
          kicker="CENTRAL DE MONITORAMENTO"
          title="Alertas Clínicos do Turno"
          description="Acompanhe eventos de exacerbação de sintomas (ESAS >= 7), chamadas do Chatbot Zelo e pendências terapêuticas."
        />

        <div className="filter-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span className="state">Todos os alertas ativos</span>
          <span className="muted">{alerts.length} registros no sistema</span>
        </div>

        {busy && <div className="loading" role="status">Atualizando alertas…</div>}

        {alerts.length === 0 ? (
          <EmptyState
            title="Nenhum alerta registrado"
            text="Quando um paciente pontuar sintomas severos ou solicitar contato via chatbot, o alerta aparecerá aqui."
          />
        ) : (
          alerts.map(a => (
            <AlertCard
              key={a.id}
              alert={a}
              patient={patients.find(p => p.id === a.user_id)}
              openPatient={openPatient}
              update={updateAlert}
            />
          ))
        )}
      </section>
    );
  }

  if (page === 'acessibilidade') {
    return <AccessibilityPage />;
  }

  // TELA: LISTA DE PACIENTES MONITORADOS
  if (page === 'pacientes') {
    return (
      <section aria-label="Lista de Pacientes Monitorados">
        <PageHeading
          kicker="CARTEIRA DE CUIDADO"
          title="Pacientes em Acompanhamento"
          description="Pesquise por nome, diagnóstico ou número de prontuário e selecione para abrir o prontuário completo."
          action={
            <Button variant="primary" onClick={() => openModal('paciente')}>
              + Cadastrar Paciente
            </Button>
          }
        />

        <div className="toolbar">
          <input
            className="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome, prontuário HEG ou diagnóstico..."
            aria-label="Campo de busca de pacientes"
          />
          <span className="muted">{filteredPatients.length} pacientes localizados</span>
        </div>

        {busy && <div className="loading" role="status">Carregando carteira de pacientes…</div>}

        {filteredPatients.length === 0 ? (
          <EmptyState
            title="Nenhum paciente localizado"
            text="Verifique os termos da busca ou cadastre um novo paciente para iniciar o monitoramento."
          />
        ) : (
          <div className="patient-grid">
            {filteredPatients.map(p => (
              <PatientCard key={p.id} patient={p} onClick={() => openPatient(p)} />
            ))}
          </div>
        )}
      </section>
    );
  }

  // TELA: PAINEL / DASHBOARD PRINCIPAL
  return (
    <section aria-label="Painel Assistencial de Cuidados Paliativos">
      <PageHeading
        kicker="PORTAL ASSISTENCIAL · HOSPICE ERASTO GAERTNER"
        title="Painel de Prioridades do Turno"
        description="Visão situacional dos pacientes em cuidados paliativos domiciliares, prioridades de intervenção e alertas do plantão."
        action={
          <div className="button-row">
            <Button variant="primary" onClick={() => openModal('paciente')}>
              + Cadastrar Paciente
            </Button>
            <Button variant="secondary" onClick={() => setPage('alertas')}>
              Ver Alertas ({pendingAlerts.length})
            </Button>
          </div>
        }
      />

      {/* Indicadores do Turno */}
      <div className="metric-grid">
        <MetricCard label="Pacientes monitorados" value={patients.length} />
        <MetricCard label="Alertas pendentes" value={pendingAlerts.length} danger={pendingAlerts.length > 0} />
        <MetricCard label="Casos críticos (ESAS ≥ 7)" value={criticalAlerts.length} danger={criticalAlerts.length > 0} />
        <MetricCard label="Avisos emitidos" value={alerts.length} />
      </div>

      {/* Fila de Casos Prioritários para Ação */}
      <div className="section-title">
        <div>
          <h2>Fila de Ação Imediata</h2>
          <p>Eventos clínicos não tratados que demandam revisão ou telenfermagem.</p>
        </div>
        <Button variant="quiet" onClick={() => setPage('alertas')}>
          Ir para Central de Alertas ›
        </Button>
      </div>

      {pendingAlerts.length === 0 ? (
        <EmptyState
          title="Nenhum alerta crítico pendente"
          text="Todos os pacientes monitorados no domicílio estão com sintomas controlados ou com condutas já registradas."
        />
      ) : (
        pendingAlerts.slice(0, 5).map(a => (
          <AlertCard
            key={a.id}
            alert={a}
            patient={patients.find(p => p.id === a.user_id)}
            openPatient={openPatient}
            update={updateAlert}
          />
        ))
      )}

      {/* Carteira Rápida de Pacientes */}
      <div className="section-title" style={{ marginTop: '36px' }}>
        <div>
          <h2>Carteira de Pacientes Recentes</h2>
          <p>Selecione um paciente para prescrever medicamentos ou registrar evoluções.</p>
        </div>
        <Button variant="quiet" onClick={() => setPage('pacientes')}>
          Ver todos os {patients.length} pacientes ›
        </Button>
      </div>

      <div className="patient-grid">
        {patients.slice(0, 6).map(p => (
          <PatientCard key={p.id} patient={p} onClick={() => openPatient(p)} />
        ))}
      </div>
    </section>
  );
}
