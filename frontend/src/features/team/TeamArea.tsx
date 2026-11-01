import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {

  Usuario,

  Alerta,

  ESAS,

  Triagem,

  LocalDor,

  Medicacao,

  Orientacao,

  Evolucao,

  MedicamentoCatalogo,

  api

} from '../../api';

import { Button } from '../../components/Button';

import { EmptyState } from '../../components/EmptyState';

import { MetricCard } from '../../components/MetricCard';

import { PageHeading } from '../../components/PageHeading';

import { PatientCard } from './PatientCard';

import { AlertCard } from './AlertCard';

import { PatientRecord } from './PatientRecord';

import { TeamModalType } from './TeamModal';

import { AccessibilityPage } from '../accessibility';



export type TeamPage = 'painel' | 'pacientes' | 'alertas' | 'catalogo' | 'acessibilidade';



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

  // Estado do catálogo de medicamentos do banco de dados

  const [catalogMeds, setCatalogMeds] = useState<MedicamentoCatalogo[]>([]);

  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const [catalogSearch, setCatalogSearch] = useState('');

  const [sintomaFilter, setSintomaFilter] = useState('todos');



  const carregarCatalogo = useCallback(async () => {

    setLoadingCatalog(true);

    try {

      const data = await api.catalogoMedicamentos({

        search: catalogSearch.trim() || undefined,

        sintoma_alvo: sintomaFilter === 'todos' ? undefined : sintomaFilter,

        apenas_ativos: true

      });

      setCatalogMeds(data);

    } catch (e) {

      notice('error', e instanceof Error ? e.message : 'Erro ao carregar catálogo de fármacos.');

    } finally {

      setLoadingCatalog(false);

    }

  }, [catalogSearch, sintomaFilter, notice]);



  useEffect(() => {

    if (page === 'catalogo') {

      carregarCatalogo();

    }

  }, [page, carregarCatalogo]);



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



  async function inativarFarmaco(med: MedicamentoCatalogo) {

    if (!window.confirm(`Tem certeza que deseja inativar o fármaco "${med.nome}" do catálogo institucional?`)) {

      return;

    }

    try {

      await api.removerMedicamentoCatalogo(med.id);

      notice('success', `Fármaco "${med.nome}" inativado com sucesso.`);

      carregarCatalogo();

    } catch (e) {

      notice('error', e instanceof Error ? e.message : 'Falha ao inativar fármaco.');

    }

  }



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



  // TELA: CATÁLOGO DE FÁRMACOS & PROTOCOLOS

  if (page === 'catalogo') {

    const totalFarmacos = catalogMeds.length;

    const totalResgate = catalogMeds.filter(m => m.eh_dose_resgate).length;

    const totalVias = new Set(catalogMeds.map(m => m.via_administracao)).size;



    const sintomasOpcoes = [

      { id: 'todos', label: 'Todos os sintomas' },

      { id: 'Dor', label: 'Dor oncológica' },

      { id: 'Náusea', label: 'Náusea e vômito' },

      { id: 'Constipação', label: 'Constipação intestinal' },

      { id: 'Ansiedade', label: 'Ansiedade e insônia' },

      { id: 'Secreção', label: 'Secreção e estertor' }

    ];



    return (

      <section aria-label="Catálogo Institucional de Fármacos">

        <PageHeading

          kicker="PADRONIZAÇÃO INSTITUCIONAL · CUIDADOS PALIATIVOS"

          title="Catálogo de Fármacos & Doses"

          description="Fármacos padronizados com vias de administração, posologias de rotina, doses de resgate SOS e orientações clínicas baseadas em protocolos paliativistas (RENAME / Erasto Gaertner)."

          action={

            <Button variant="primary" onClick={() => openModal('cadastrar_farmaco')}>

              + Cadastrar Fármaco no Banco

            </Button>

          }

        />



        {/* Indicadores do Catálogo */}

        <div className="metric-grid">

          <MetricCard label="Fármacos padronizados" value={totalFarmacos} />

          <MetricCard label="Doses de resgate (SOS)" value={totalResgate} />

          <MetricCard label="Vias terapêuticas" value={totalVias} />

          <MetricCard label="Status do banco de dados" value="Sincronizado" />

        </div>



        {/* Filtros e Busca */}

        <div

          className="toolbar"

          style={{

            display: 'flex',

            flexWrap: 'wrap',

            alignItems: 'center',

            justifyContent: 'space-between',

            gap: '12px',

            marginBottom: '20px'

          }}

        >

          <div style={{ flex: '1 1 320px', minWidth: '260px' }}>

            <input

              className="search"

              value={catalogSearch}

              onChange={e => setCatalogSearch(e.target.value)}

              placeholder="Buscar por nome do remédio, princípio ativo ou indicação…"

              aria-label="Campo de busca no catálogo de medicamentos"

            />

          </div>



          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>

            {sintomasOpcoes.map(s => (

              <button

                key={s.id}

                type="button"

                className={`button ${sintomaFilter === s.id ? 'button-secondary' : 'button-quiet'}`}

                style={{

                  minHeight: '38px',

                  padding: '6px 14px',

                  fontSize: '13px',

                  borderRadius: '20px',

                  fontWeight: sintomaFilter === s.id ? 800 : 500

                }}

                onClick={() => setSintomaFilter(s.id)}

              >

                {s.label}

              </button>

            ))}

          </div>

        </div>



        {loadingCatalog && <div className="loading" role="status">Consultando catálogo no banco de dados…</div>}



        {catalogMeds.length === 0 && !loadingCatalog ? (

          <EmptyState

            title="Nenhum fármaco encontrado no catálogo"

            text="Não encontramos medicamentos correspondentes aos termos ou filtros selecionados. Clique em '+ Cadastrar Fármaco no Banco' para incluir um novo medicamento."

          />

        ) : (

          <div

            style={{

              display: 'grid',

              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',

              gap: '16px'

            }}

          >

            {catalogMeds.map(med => (

              <article

                key={med.id}

                className="record-card"

                style={{

                  display: 'flex',

                  flexDirection: 'column',

                  justifyContent: 'space-between',

                  borderRadius: '12px',

                  padding: '20px',

                  position: 'relative'

                }}

              >

                <div>

                  <div

                    style={{

                      display: 'flex',

                      alignItems: 'flex-start',

                      justifyContent: 'space-between',

                      gap: '12px',

                      marginBottom: '10px'

                    }}

                  >

                    <div>

                      <h3

                        style={{

                          margin: 0,

                          fontSize: '18px',

                          fontWeight: 800,

                          color: 'var(--ink)'

                        }}

                      >

                        {med.nome}

                      </h3>

                      <p

                        style={{

                          margin: '2px 0 0',

                          fontSize: '13px',

                          color: 'var(--muted)',

                          fontStyle: 'italic'

                        }}

                      >

                        {med.principio_ativo}

                      </p>

                    </div>



                    <span

                      className="pill"

                      style={{

                        backgroundColor: 'var(--green-soft)',

                        color: 'var(--green)',

                        fontWeight: 700,

                        whiteSpace: 'nowrap'

                      }}

                    >

                      {med.via_administracao}

                    </span>

                  </div>



                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>

                    {med.sintoma_alvo && (

                      <span

                        className="pill"

                        style={{

                          backgroundColor: 'var(--paper-soft)',

                          color: 'var(--ink)',

                          fontSize: '12px'

                        }}

                      >

                        🎯 {med.sintoma_alvo}

                      </span>

                    )}



                    {med.eh_dose_resgate && (

                      <span

                        className="pill"

                        style={{

                          backgroundColor: '#fef3c7',

                          color: '#92400e',

                          border: '1px solid #fde68a',

                          fontWeight: 800,

                          fontSize: '12px'

                        }}

                      >

                        ⚡ Resgate SOS

                      </span>

                    )}

                  </div>



                  <div

                    style={{

                      background: 'var(--paper-soft, #faf7f2)',

                      border: '1px solid var(--border)',

                      borderRadius: '8px',

                      padding: '12px',

                      marginBottom: '14px'

                    }}

                  >

                    <div style={{ fontSize: '13px', marginBottom: '6px' }}>

                      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Dose padrão: </span>

                      <strong style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>

                        {med.dose_padrao}

                      </strong>

                    </div>

                    <div style={{ fontSize: '13px' }}>

                      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Frequência: </span>

                      <strong style={{ color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>

                        {med.frequencia_padrao}

                      </strong>

                    </div>

                  </div>



                  {med.orientacoes_padrao && (

                    <div

                      style={{

                        fontSize: '13px',

                        lineHeight: '1.5',

                        color: 'var(--muted)',

                        background: '#f8fafc',

                        borderLeft: '3px solid var(--green)',

                        padding: '10px 12px',

                        borderRadius: '0 6px 6px 0',

                        marginBottom: '14px'

                      }}

                    >

                      <strong style={{ color: 'var(--green)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>

                        Precauções & Orientações Clínicas

                      </strong>

                      {med.orientacoes_padrao}

                    </div>

                  )}

                </div>



                <div

                  style={{

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'space-between',

                    paddingTop: '12px',

                    borderTop: '1px solid var(--border)',

                    marginTop: 'auto'

                  }}

                >

                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>

                    Código #{med.id}

                  </span>

                  <button

                    type="button"

                    className="button button-quiet"

                    style={{ minHeight: '32px', padding: '4px 10px', fontSize: '12px', color: 'var(--danger)' }}

                    onClick={() => inativarFarmaco(med)}

                    title="Inativar este medicamento do catálogo"

                  >

                    Inativar Fármaco

                  </button>

                </div>

              </article>

            ))}

          </div>

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

            placeholder="Buscar por nome, prontuário ou diagnóstico…"

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

        kicker="PORTAL ASSISTENCIAL · EQUIPE MÉDICA"

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

