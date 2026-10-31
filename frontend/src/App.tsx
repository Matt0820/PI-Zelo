import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import logo from '../images/logo-zelo-verde.png';
import { AccessibilityBar } from './components/AccessibilityBar';
import { useAccessibility, ModoVisual } from './context/AccessibilityContext';
import { Alerta, api, ESAS, Evolucao, LocalDor, Medicacao, Orientacao, Triagem, Usuario } from './api';

type Notice={kind:'success'|'error';text:string};
type TeamPage='painel'|'pacientes'|'alertas';
type PatientPage='inicio'|'esas'|'chatbot'|'mapa'|'medicacoes'|'orientacoes';

const sessionKey='@zelo/web/session';
const symptomRows:Array<{key:keyof Pick<ESAS,'dor'|'cansaco'|'nausea'|'depressao'|'ansiedade'|'sonolencia'|'apetite'|'mal_estar'|'falta_de_ar'|'constipacao'>;label:string}>= [
 {key:'dor',label:'Dor'}, {key:'cansaco',label:'Cansaço'}, {key:'nausea',label:'Náusea'}, {key:'depressao',label:'Tristeza'}, {key:'ansiedade',label:'Ansiedade'}, {key:'sonolencia',label:'Sonolência'}, {key:'apetite',label:'Falta de apetite'}, {key:'mal_estar',label:'Mal-estar'}, {key:'falta_de_ar',label:'Falta de ar'}, {key:'constipacao',label:'Constipação'},
];
const date=(value:string)=>new Date(value).toLocaleString('pt-BR',{dateStyle:'medium',timeStyle:'short'});

export default function App(){
 const [usuario,setUsuario]=useState<Usuario|null>(()=>{try{const saved=localStorage.getItem(sessionKey);return saved?JSON.parse(saved) as Usuario:null;}catch{return null;}});
 const [notice,setNotice]=useState<Notice|null>(null);
 const [busy,setBusy]=useState(false);
 const [equipePagina,setEquipePagina]=useState<TeamPage>('painel');
 const [paginaPaciente,setPaginaPaciente]=useState<PatientPage>('inicio');
 const [pacientes,setPacientes]=useState<Usuario[]>([]);
 const [alertas,setAlertas]=useState<Alerta[]>([]);
 const [selecionado,setSelecionado]=useState<Usuario|null>(null);
 const [query,setQuery]=useState('');
 const [detalhes,setDetalhes]=useState<{esas:ESAS[];triagens:Triagem[];dor:LocalDor[];medicacoes:Medicacao[];orientacoes:Orientacao[];evolucoes:Evolucao[]}>({esas:[],triagens:[],dor:[],medicacoes:[],orientacoes:[],evolucoes:[]});
 const [modal,setModal]=useState<'paciente'|'orientacao'|'diagnostico'|'agendamento'|'medicacao'|null>(null);
 const [menuAberto,setMenuAberto]=useState(false);
 const { modoVisual, setModoVisual, nomesModosVisuais } = useAccessibility();
 const [patientData,setPatientData]=useState<{esas:ESAS[];medicacoes:Medicacao[];orientacoes:Orientacao[];dor:LocalDor[]}>({esas:[],medicacoes:[],orientacoes:[],dor:[]});
 const isTeam=usuario?.perfil==='assistencial'||usuario?.perfil==='admin';
 const show=(kind:Notice['kind'],text:string)=>{setNotice({kind,text});window.setTimeout(()=>setNotice(null),5000);};
 async function carregarEquipe(){const [ps,as]=await Promise.all([api.pacientes(),api.alertas()]);setPacientes(ps);setAlertas(as);}
 async function carregarDetalhe(p:Usuario){setSelecionado(p);const [esas,triagens,dor,medicacoes,orientacoes,evolucoes]=await Promise.all([api.esas(p.id),api.triagens(p.id),api.locaisDor(p.id),api.medicamentos(p.id),api.orientacoes(p.id),api.evolucoes(p.id)]);setDetalhes({esas,triagens,dor,medicacoes,orientacoes,evolucoes});}
 async function carregarPaciente(id:number){const [esas,medicacoes,orientacoes,dor]=await Promise.all([api.esas(id),api.medicamentos(id),api.orientacoes(id),api.locaisDor(id)]);setPatientData({esas,medicacoes,orientacoes,dor});}
 useEffect(()=>{if(usuario&&isTeam)carregarEquipe().catch(e=>show('error',String(e.message||e)));},[usuario?.id,isTeam]);
 useEffect(()=>{if(usuario&&!isTeam)carregarPaciente(usuario.id).catch(e=>show('error',String(e.message||e)));},[usuario?.id,isTeam]);
 async function entrar(email:string,senha:string,expected:'equipe'|'paciente'){setBusy(true);try{const user=await api.login(email,senha);if(!user.ativo)throw new Error('Esta conta está inativa. Fale com a equipe responsável.');if(expected==='equipe'&&!['assistencial','admin'].includes(user.perfil))throw new Error('Esta conta é de paciente. Selecione a opção Paciente.');if(expected==='paciente'&&!['paciente','cuidador'].includes(user.perfil))throw new Error('Esta conta é da equipe. Selecione Equipe assistencial.');setUsuario(user);localStorage.setItem(sessionKey,JSON.stringify(user));}catch(e){show('error',e instanceof Error?e.message:'Não foi possível entrar.');}finally{setBusy(false);}}
 function sair(){localStorage.removeItem(sessionKey);setUsuario(null);setSelecionado(null);setMenuAberto(false);}
 if(!usuario)return <Login entrar={entrar} criarConta={async dados=>{setBusy(true);try{const user=await api.criarPaciente(dados);setUsuario(user);localStorage.setItem(sessionKey,JSON.stringify(user));show('success','Conta do paciente criada.');}finally{setBusy(false);}}} busy={busy} notice={notice} />;
 return <div className="app-shell">
  <header className="topbar">
   <button className="brand" onClick={()=>{setSelecionado(null);isTeam?setEquipePagina('painel'):setPaginaPaciente('inicio');}} aria-label="Ir para o início">
     <img src={logo} alt="Zelo"/>
     <span><b>zelo</b><small>{isTeam?'Portal assistencial':'Área do paciente'}</small></span>
   </button>
   <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
     <AccessibilityBar />
     <div className="topbar-user">
       <span>{usuario.nome}</span>
       <button className="button button-quiet" onClick={sair}>Sair</button>
     </div>
   </div>
   <button className="menu-trigger" aria-label="Abrir menu" onClick={()=>setMenuAberto(true)}>
     <span className="menu-icon" aria-hidden="true"><i/><i/><i/></span>
   </button>
  </header>
  <div className="workspace">
   <aside className={`sidebar ${menuAberto?'sidebar-open':''}`}>
    <div className="sidebar-head"><strong>{isTeam?'Acompanhamento':'Meu cuidado'}</strong><button className="sidebar-close" onClick={()=>setMenuAberto(false)} aria-label="Fechar menu">×</button></div>
    {(isTeam?[
      {id:'painel',name:'Visão geral',icon:'⌂',action:()=>{setSelecionado(null);setEquipePagina('painel');}},
      {id:'pacientes',name:'Pacientes',icon:'◉',action:()=>{setSelecionado(null);setEquipePagina('pacientes');}},
      {id:'alertas',name:'Alertas clínicos',icon:'!',action:()=>{setSelecionado(null);setEquipePagina('alertas');}},
    ]:[
      {id:'inicio',name:'Início',icon:'⌂',action:()=>setPaginaPaciente('inicio')},
      {id:'esas',name:'Avaliação ESAS',icon:'◷',action:()=>setPaginaPaciente('esas')},
      {id:'chatbot',name:'Chatbot Zelo (Apoio)',icon:'💬',action:()=>setPaginaPaciente('chatbot')},
      {id:'medicacoes',name:'Medicações & Receitas',icon:'＋',action:()=>setPaginaPaciente('medicacoes')},
      {id:'mapa',name:'Mapa da dor',icon:'◎',action:()=>setPaginaPaciente('mapa')},
      {id:'orientacoes',name:'Avisos da equipe',icon:'i',action:()=>setPaginaPaciente('orientacoes')},
    ]).map(item=><button className="nav-item" key={item.id} onClick={()=>{item.action();setMenuAberto(false);}}><span className="nav-icon">{item.icon}</span>{item.name}</button>)}
    {isTeam&&<div className="sidebar-note">Use os comandos “Enviar” para registrar cada ação no prontuário do paciente.</div>}
    <label className="sidebar-appearance">Modo Visual<select value={modoVisual} onChange={e=>setModoVisual(e.target.value as ModoVisual)}>{(Object.keys(nomesModosVisuais) as ModoVisual[]).map(m=><option key={m} value={m}>{nomesModosVisuais[m]}</option>)}</select></label>
    <button className="nav-item nav-logout" onClick={sair}><span className="nav-icon">↪</span>Sair da conta</button>
   </aside>
   {menuAberto&&<button aria-label="Fechar menu" className="sidebar-scrim" onClick={()=>setMenuAberto(false)} />}
   <main className="main-content">
    {notice&&<div className={`notice notice-${notice.kind}`} role="status">{notice.text}<button onClick={()=>setNotice(null)} aria-label="Fechar">×</button></div>}
    {isTeam? <TeamArea page={equipePagina} setPage={setEquipePagina} selected={selecionado} setSelected={setSelecionado} patients={pacientes} alerts={alertas} query={query} setQuery={setQuery} details={detalhes} busy={busy} setBusy={setBusy} openPatient={(p)=>{setBusy(true);carregarDetalhe(p).then(()=>setBusy(false)).catch(e=>{setBusy(false);show('error',e.message);});}} refreshDetail={()=>selecionado?carregarDetalhe(selecionado):carregarEquipe()} openModal={setModal} notice={show} updateAlert={async(a,state)=>{try{await api.atualizarAlerta(a.id,{estado:state,revisado_por:usuario.nome,observacao_conduta:state==='Tratado'?'Conduta registrada pela equipe no portal Zelo.':null});await carregarEquipe();show('success',`Alerta atualizado para “${state}”.`);}catch(e){show('error',String((e as Error).message));}}} />
      : <PatientArea usuario={usuario} page={paginaPaciente} setPage={setPaginaPaciente} data={patientData} refresh={()=>carregarPaciente(usuario.id)} notice={show} />}
   </main>
  </div>
  {modal&&isTeam&&<TeamModal type={modal} patient={selecionado} professional={usuario} close={()=>setModal(null)} done={async(text)=>{setModal(null);show('success',text);if(selecionado)await carregarDetalhe(selecionado);await carregarEquipe();}} />}
 </div>;
}

function Login({entrar,criarConta,busy,notice}:{entrar:(email:string,senha:string,expected:'equipe'|'paciente')=>void;criarConta:(dados:unknown)=>Promise<void>;busy:boolean;notice:Notice|null}){
 const [email,setEmail]=useState('');const [senha,setSenha]=useState('');const [modo,setModo]=useState<'equipe'|'paciente'>('equipe');const [cadastrar,setCadastrar]=useState(false);const [etapa,setEtapa]=useState(0);const [proprio,setProprio]=useState(false);const [erro,setErro]=useState('');
 const [dados,setDados]=useState<Record<string,string>>({nome:'',email:'',cpf:'',telefone:'',idade:'',sexo:'',prontuario:'',diagnostico_oncologico:'',tratamento_modificador:'',pps_score:'',comorbidades:'',alergias:'',proxima_consulta:'',cuidador_principal:'',parentesco_cuidador:'',senha:''});
 function atualizar(chave:string,valor:string){setDados(atual=>({...atual,[chave]:valor}));}
 function submitLogin(e:FormEvent){e.preventDefault();entrar(email.trim(),senha,modo);}
 async function submitSignup(e:FormEvent){e.preventDefault();setErro('');if(etapa===0){if(!dados.nome.trim()||!dados.email.trim()){setErro('Informe o nome e o email do paciente.');return;}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)){setErro('Confira o email informado.');return;}setEtapa(1);return;}if(etapa===1){if(!proprio&&(!dados.cuidador_principal.trim()||!dados.parentesco_cuidador.trim())){setErro('Informe o nome e a relação do responsável, ou indique que o paciente é seu próprio responsável.');return;}setEtapa(2);return;}if(dados.senha.length<8){setErro('Use uma senha com pelo menos 8 caracteres.');return;}const numeric=(value:string)=>value.trim()?Number(value):null;if(dados.idade&&(!Number.isInteger(numeric(dados.idade))||Number(dados.idade)<0||Number(dados.idade)>125)){setErro('Informe uma idade entre 0 e 125 anos.');return;}if(dados.pps_score&&(!Number.isInteger(numeric(dados.pps_score))||Number(dados.pps_score)<0||Number(dados.pps_score)>100)){setErro('Informe o PPS entre 0 e 100.');return;}try{await criarConta({nome:dados.nome.trim(),email:dados.email.trim(),senha:dados.senha,perfil:'paciente',prontuario:dados.prontuario.trim()||null,idade:numeric(dados.idade),sexo:dados.sexo.trim()||null,cpf:dados.cpf.trim()||null,telefone:dados.telefone.trim()||null,cuidador_principal:proprio?dados.nome.trim():dados.cuidador_principal.trim()||null,parentesco_cuidador:proprio?'Próprio paciente':dados.parentesco_cuidador.trim()||null,diagnostico_oncologico:dados.diagnostico_oncologico.trim()||null,tratamento_modificador:dados.tratamento_modificador.trim()||null,pps_score:numeric(dados.pps_score),comorbidades:dados.comorbidades.trim()||null,alergias:dados.alergias.trim()||null,proxima_consulta:dados.proxima_consulta.trim()||null});}catch(error){setErro(error instanceof Error?error.message:'Não foi possível criar a conta.');}}
 const renderField=(key:string,label:string,type='text',optional=true)=><label key={key}>{label}{optional?' (opcional)':' *'}<input type={type} value={dados[key]||''} onChange={e=>atualizar(key,e.target.value)} required={!optional} maxLength={key==='sexo'?10:undefined} min={key==='idade'?'0':key==='pps_score'?'0':undefined} max={key==='idade'?'125':key==='pps_score'?'100':undefined} /></label>;
 const patientSteps=[
  {title:'Dados do paciente',help:'Etapa 1 de 3 · Primeiro, identifique a pessoa que receberá o cuidado.',fields:[['nome','Nome completo do paciente','text',false],['email','Email do paciente para acesso','email',false],['cpf','CPF do paciente'],['telefone','Telefone do paciente'],['idade','Idade do paciente','number'],['sexo','Sexo do paciente'],['prontuario','Número do prontuário'],['diagnostico_oncologico','Diagnóstico oncológico'],['tratamento_modificador','Tratamento atual'],['pps_score','PPS (0 a 100)','number'],['comorbidades','Comorbidades'],['alergias','Alergias'],['proxima_consulta','Próxima consulta']] as Array<[string,string,string?,boolean?]>},
  {title:'Responsável pelo paciente',help:'Etapa 2 de 3 · Informe quem acompanha e apoia o paciente.',fields:[['cuidador_principal','Nome completo do responsável','text',false],['parentesco_cuidador','Relação com o paciente','text',false]] as Array<[string,string,string?,boolean?]>},
  {title:'Acesso do paciente',help:'Etapa 3 de 3 · Crie a senha da conta do paciente.',fields:[['senha','Senha','password',false]] as Array<[string,string,string?,boolean?]>},
 ];
 const current=patientSteps[etapa];
 return <div className="login-shell"><section className="login-brand"><img src={logo} alt="Zelo"/><p className="eyebrow">CUIDADO CONECTADO</p><h1>Presença e cuidado, em cada etapa.</h1><p>Informações do paciente, registros clínicos e orientações reunidos em um só lugar.</p><div className="login-values"><span>Dados compartilhados com o app</span><span>Fluxos claros para a equipe e a família</span></div></section><section className="login-panel"><div style={{width:'min(100%, 430px)',display:'flex',justifyContent:'flex-end',marginBottom:'12px'}}><AccessibilityBar /></div><div className="login-card"><div className="role-switch"><button className={modo==='equipe'?'active':''} onClick={()=>{setModo('equipe');setCadastrar(false);}}>Equipe assistencial</button><button className={modo==='paciente'?'active':''} onClick={()=>setModo('paciente')}>Paciente</button></div>{modo==='paciente'&&<div className="login-mode-switch"><button className={!cadastrar?'active':''} onClick={()=>{setCadastrar(false);setErro('');}}>Entrar</button><button className={cadastrar?'active':''} onClick={()=>{setCadastrar(true);setEtapa(0);setErro('');}}>Criar conta</button></div>}<h2>{cadastrar?'Cadastro do paciente':'Acessar o Zelo'}</h2><p>{cadastrar?current.help:modo==='equipe'?'Entre com sua conta profissional.':'Entre com os dados da conta do paciente.'}</p>{notice&&<div className={`notice notice-${notice.kind}`}>{notice.text}</div>}{erro&&<div className="notice notice-error">{erro}</div>}{cadastrar?<form onSubmit={submitSignup} className="form-stack">{etapa===1&&<label className="self-check"><input type="checkbox" checked={proprio} onChange={e=>{const checked=e.target.checked;setProprio(checked);if(checked){atualizar('cuidador_principal',dados.nome);atualizar('parentesco_cuidador','Próprio paciente');}else{atualizar('cuidador_principal','');atualizar('parentesco_cuidador','');}}}/><span>O paciente será o próprio responsável</span></label>}{current.fields.filter(([key])=>!(etapa===1&&proprio&&key!=='')).map(([key,label,type,optional])=>renderField(key,label,type,optional))}{etapa===0&&<span className="helper">Os dados de identificação e saúde são opcionais; o paciente e a conta ficam identificados como pessoa atendida.</span>}{etapa===2&&<span className="helper">Ao criar a conta, você concorda com os termos de uso e a política de privacidade do Zelo.</span>}<div className="button-row">{etapa>0&&<button type="button" className="button button-secondary" onClick={()=>setEtapa(v=>v-1)}>Voltar</button>}<button className="button button-primary" disabled={busy}>{busy?'Enviando…':etapa===2?'Criar conta do paciente':'Continuar'}</button></div></form>:<form onSubmit={submitLogin}><label>Email, CPF ou prontuário<input value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required /></label><label>Senha<input type="password" value={senha} onChange={e=>setSenha(e.target.value)} autoComplete="current-password" required /></label><button className="button button-primary button-wide" disabled={busy}>{busy?'Entrando…':'Entrar'}</button></form>}<small>{cadastrar?'O responsável é identificado na segunda etapa; a conta permanece sendo do paciente.':'Os mesmos dados de paciente e registros são usados no app Zelo.'}</small></div></section></div>;
}
function TeamArea({page,setPage,selected,setSelected,patients,alerts,query,setQuery,details,busy,setBusy,openPatient,openModal,notice,refreshDetail,updateAlert}:{page:TeamPage;setPage:(p:TeamPage)=>void;selected:Usuario|null;setSelected:(p:Usuario|null)=>void;patients:Usuario[];alerts:Alerta[];query:string;setQuery:(q:string)=>void;details:{esas:ESAS[];triagens:Triagem[];dor:LocalDor[];medicacoes:Medicacao[];orientacoes:Orientacao[];evolucoes:Evolucao[]};busy:boolean;setBusy:(v:boolean)=>void;openPatient:(p:Usuario)=>void;openModal:(m:'paciente'|'orientacao'|'diagnostico'|'agendamento'|'medicacao'|null)=>void;notice:(kind:Notice['kind'],text:string)=>void;refreshDetail:()=>Promise<void>;updateAlert:(a:Alerta,state:string)=>void}){
 const filtered=useMemo(()=>patients.filter(p=>`${p.nome} ${p.prontuario||''} ${p.diagnostico_oncologico||''}`.toLowerCase().includes(query.toLowerCase())),[patients,query]);
 if(selected)return <PatientRecord patient={selected} details={details} openModal={openModal} back={()=>{setBusy(false);setSelected(null);setPage('pacientes');}} busy={busy} notice={notice} refresh={refreshDetail} />;
 if(page==='alertas')return <section><PageHeading kicker="ACOMPANHAMENTO" title="Alertas clínicos" description="Revise os registros enviados pelo app e atualize o estado de atendimento." /><div className="filter-row"><span className="state">Todos os alertas</span><span>{alerts.length} registros</span></div>{busy?<Loading/>:alerts.length===0?<Empty title="Nenhum alerta registrado" text="Alertas de dor intensa e triagens aparecem aqui quando enviados pelo app."/>:<div className="stack">{alerts.map(a=><AlertCard key={a.id} alert={a} patient={patients.find(p=>p.id===a.user_id)} openPatient={openPatient} update={updateAlert}/>)}</div>}</section>;
 if(page==='pacientes')return <section><PageHeading kicker="PRONTUÁRIO" title="Pacientes" description="Encontre um paciente para consultar avaliações e registros de cuidado." action={<button className="button button-primary" onClick={()=>openModal('paciente')}>Cadastrar paciente</button>} /><div className="toolbar"><input className="search" placeholder="Buscar por nome, prontuário ou diagnóstico" value={query} onChange={e=>setQuery(e.target.value)} /><span>{filtered.length} pacientes</span></div>{busy?<Loading/>:filtered.length===0?<Empty title="Nenhum paciente encontrado" text="Ajuste a busca ou cadastre um paciente."/>:<div className="patient-grid">{filtered.map(p=><PatientCard key={p.id} patient={p} onClick={()=>openPatient(p)}/>)}</div>}</section>;
 const newAlerts=alerts.filter(a=>a.estado==='Novo').length;
 return <section><PageHeading kicker="RESUMO DO SERVIÇO" title="Visão geral" description="Acompanhe pacientes e registros recentes em um só lugar." action={<button className="button button-primary" onClick={()=>openModal('paciente')}>Cadastrar paciente</button>} /><div className="metric-grid"><Metric label="Pacientes cadastrados" value={patients.length} /><Metric label="Alertas novos" value={newAlerts} tone={newAlerts?'danger':''}/><Metric label="Em revisão" value={alerts.filter(a=>a.estado==='Em revisao').length}/><Metric label="Alertas tratados" value={alerts.filter(a=>a.estado==='Tratado').length}/></div><div className="section-title"><div><h2>Pacientes recentes</h2><p>Acesso rápido ao prontuário.</p></div><button className="button button-secondary" onClick={()=>setPage('pacientes')}>Ver pacientes</button></div>{patients.length===0?<Empty title="Nenhum paciente cadastrado" text="Cadastre o primeiro paciente para começar o acompanhamento."/>:<div className="patient-grid">{patients.slice(0,4).map(p=><PatientCard key={p.id} patient={p} onClick={()=>openPatient(p)}/>)}</div>}<div className="section-title"><div><h2>Alertas novos</h2><p>Registros enviados pelo paciente ou cuidador.</p></div><button className="button button-secondary" onClick={()=>setPage('alertas')}>Abrir alertas</button></div>{alerts.filter(a=>a.estado==='Novo').slice(0,3).map(a=><AlertCard key={a.id} alert={a} patient={patients.find(p=>p.id===a.user_id)} openPatient={openPatient} update={updateAlert}/>)}</section>;
}

function PageHeading({kicker,title,description,action}:{kicker:string;title:string;description:string;action?:ReactNode}){return <div className="page-heading"><div><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;}
function Metric({label,value,tone=''}:{label:string;value:number|string;tone?:string}){return <article className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong></article>;}
function PatientCard({patient,onClick}:{patient:Usuario;onClick:()=>void}){return <button className="patient-card" onClick={onClick}><span className="patient-avatar">{patient.nome.slice(0,1).toUpperCase()}</span><span className="patient-card-body"><b>{patient.nome}</b><small>{patient.prontuario?`Prontuário ${patient.prontuario}`:'Prontuário não informado'}</small><small>{patient.diagnostico_oncologico||'Diagnóstico não informado'}</small></span><span className="chevron">›</span></button>;}
function AlertCard({alert,patient,openPatient,update}:{alert:Alerta;patient?:Usuario;openPatient:(p:Usuario)=>void;update:(a:Alerta,state:string)=>void}){return <article className="alert-card"><div className="alert-top"><span className={`severity severity-${alert.severidade==='grave'?'high':'medium'}`}>{alert.severidade==='grave'?'Prioridade alta':alert.severidade}</span><span className="state">{alert.estado==='Em revisao'?'Em revisão':alert.estado}</span></div><h3>{alert.titulo}</h3><p>{alert.descricao}</p><small>{date(alert.criado_em)}{patient?` · ${patient.nome}`:''}</small><div className="button-row">{patient&&<button className="button button-secondary" onClick={()=>openPatient(patient)}>Abrir prontuário</button>}{alert.estado==='Novo'&&<button className="button button-secondary" onClick={()=>update(alert,'Em revisao')}>Iniciar revisão</button>}{alert.estado!=='Tratado'&&<button className="button button-primary" onClick={()=>update(alert,'Tratado')}>Registrar conduta e tratar</button>}</div></article>;}
function PatientRecord({patient,details,openModal,back,busy,notice,refresh}:{patient:Usuario;details:{esas:ESAS[];triagens:Triagem[];dor:LocalDor[];medicacoes:Medicacao[];orientacoes:Orientacao[];evolucoes:Evolucao[]};openModal:(m:'paciente'|'orientacao'|'diagnostico'|'agendamento'|'medicacao'|null)=>void;back:()=>void;busy:boolean;notice:(kind:Notice['kind'],text:string)=>void;refresh:()=>Promise<void>}){
 const last=details.esas[0];
 const diagnosisNote=details.evolucoes.find(e=>e.tipo_evolucao==='Diagnóstico e indicação de cuidados paliativos');
 const diagnosedInNote=diagnosisNote?.conteudo.match(/Diagnóstico:\s*([^\n]+)/)?.[1];
 const palliativeReason=diagnosisNote?.conteudo.split('Motivo da indicação de cuidados paliativos:')[1]?.trim();
 const appointment=details.evolucoes.find(e=>e.tipo_evolucao==='Agendamento');
 return <section><button className="back-link" onClick={back}>‹ Voltar aos pacientes</button><PageHeading kicker="PRONTUÁRIO DO PACIENTE" title={patient.nome} description={`${patient.prontuario?`Prontuário ${patient.prontuario}`:'Sem número de prontuário'} · ${patient.idade?`${patient.idade} anos`:'Idade não informada'} · ${patient.cuidador_principal?`Responsável: ${patient.cuidador_principal}`:'Responsável não informado'}`} /><div className="action-bar"><button className="button button-primary" onClick={()=>openModal('medicacao')}>+ Prescrever medicamento</button><button className="button button-secondary" onClick={()=>openModal('diagnostico')}>Enviar diagnóstico</button><button className="button button-secondary" onClick={()=>openModal('orientacao')}>Enviar orientação</button><button className="button button-secondary" onClick={()=>openModal('agendamento')}>Enviar agendamento</button></div>{busy&&<Loading/>}<div className="record-grid"><article className="record-card record-wide"><div className="section-title"><div><h2>Contexto clínico</h2><p>Dados cadastrados no perfil do paciente.</p></div><span className="pill">{patient.perfil}</span></div><dl className="data-grid"><Data label="Diagnóstico" value={patient.diagnostico_oncologico||diagnosedInNote}/><Data label="Motivo dos cuidados paliativos" value={palliativeReason}/><Data label="Tratamento atual" value={patient.tratamento_modificador}/><Data label="PPS" value={patient.pps_score?`${patient.pps_score}%`:null}/><Data label="Comorbidades" value={patient.comorbidades}/><Data label="Alergias" value={patient.alergias}/><Data label="Próxima consulta" value={patient.proxima_consulta||appointment?.conteudo}/><Data label="Telefone" value={patient.telefone}/><Data label="Responsável" value={patient.cuidador_principal?`${patient.cuidador_principal}${patient.parentesco_cuidador?` · ${patient.parentesco_cuidador}`:''}`:null}/></dl></article>
 <article className="record-card"><h2>Avaliação ESAS mais recente</h2>{last?<><p className="muted">{date(last.data_registro)}</p><div className="score-grid">{symptomRows.map(s=><div key={s.key} className="score"><span>{s.label}</span><b className={Number(last[s.key]||0)>=7?'score-high':''}>{last[s.key]??'—'}/10</b></div>)}</div>{last.observacao&&<p className="record-note">{last.observacao}</p>}</>:<Empty title="Sem avaliação" text="O paciente ainda não enviou uma avaliação ESAS."/>}<h3>Histórico recente</h3>{details.esas.slice(1,4).map(e=><p className="history-line" key={e.id}>{date(e.data_registro)} · Dor {e.dor}/10 · {e.gravidade_maxima}</p>)}</article>
 <article className="record-card"><h2>Mapa da dor e ocorrências</h2>{details.dor.length?details.dor.map(d=><div className="history-item" key={d.id}><b>{d.regiao_anatomica} · {d.tipo_ocorrencia}</b><span>Intensidade {d.intensidade}/10 · {date(d.criado_em)}</span>{d.observacao&&<p>{d.observacao}</p>}{d.medicamento_associado&&<small>Medicação associada: {d.medicamento_associado}</small>}</div>):<Empty title="Sem locais registrados" text="Os registros feitos pelo paciente no mapa corporal aparecerão aqui."/>}</article>
 <article className="record-card"><h2>Triagens de dor</h2>{details.triagens.length?details.triagens.slice(0,4).map(t=><div className="history-item" key={t.id}><b>Dor {t.intensidade_dor}/10 · {t.caracteristica_dor}</b><span>{t.tipo_dor} · {date(t.data_triagem)}</span><p>Resgate: {t.fez_dose_resgate?'sim':'não'} · Medicações efetivas: {t.medicamentos_efetivos?'sim':'não'}{t.solicitou_agendamento?' · Pediu contato/agendamento':''}</p></div>):<Empty title="Sem triagens" text="Não há triagem de dor registrada para este paciente."/>}</article>
 <article className="record-card"><h2>Orientações enviadas</h2>{details.orientacoes.length?details.orientacoes.slice(0,5).map(o=><div className="history-item" key={o.id}><b>{o.titulo}</b><span>{o.categoria} · {o.prioridade} · {date(o.atualizada_em)}</span><p>{o.descricao}</p></div>):<Empty title="Sem orientações" text="Envie uma orientação para ela aparecer também no app do paciente."/>}</article>
 <article className="record-card record-wide"><h2>Evoluções clínicas</h2>{details.evolucoes.length?details.evolucoes.slice(0,8).map(e=><div className="history-item" key={e.id}><b>{e.tipo_evolucao}</b><span>{e.profissional_nome} · {date(e.criado_em)}</span><p>{e.conteudo}</p>{e.conduta_plano&&<small>Plano: {e.conduta_plano}</small>}</div>):<Empty title="Sem evoluções" text="Diagnósticos, justificativas e agendamentos enviados pela equipe serão registrados aqui."/>}</article>
 <article className="record-card"><div className="section-title" style={{marginTop:0}}><div><h2>Medicações e Prescrições</h2><p>Receitas ativas vinculadas ao paciente.</p></div><button className="button button-primary" onClick={()=>openModal('medicacao')}>+ Prescrever</button></div>{details.medicacoes.length?details.medicacoes.map(m=><div className="history-item" key={m.id} style={{padding:'10px 0'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'8px',flexWrap:'wrap'}}><b>💊 {m.nome} · {m.dose}</b><span className="pill">{m.horario} ({m.frequencia})</span></div>{m.observacao&&<p style={{margin:'4px 0 0',fontSize:'13px'}}>📋 Orientações: {m.observacao}</p>}{m.eh_dose_resgate&&<small style={{color:'var(--danger)',fontWeight:700}}>⚡ Dose de resgate autorizada</small>}</div>):<Empty title="Sem medicações" text="Prescreva a primeira medicação para o paciente."/>}</article></div>
 <button className="button button-quiet" onClick={()=>refresh().then(()=>notice('success','Prontuário atualizado.'))}>Atualizar dados do prontuário</button></section>;
}
function Data({label,value}:{label:string;value:string|number|null|undefined}){return <div className="data-cell"><dt>{label}</dt><dd>{value||'Não informado'}</dd></div>}
function Empty({title,text}:{title:string;text:string}){return <div className="empty"><b>{title}</b><p>{text}</p></div>}
function Loading(){return <div className="loading" role="status">Carregando dados…</div>}

function TeamModal({type,patient,professional,close,done}:{type:'paciente'|'orientacao'|'diagnostico'|'agendamento'|'medicacao';patient:Usuario|null;professional:Usuario;close:()=>void;done:(m:string)=>void}){
  const [sending,setSending]=useState(false);
  const [error,setError]=useState('');

  // Estados dedicados para prescrição de medicamentos
  const [medNome,setMedNome]=useState('');
  const [medDose,setMedDose]=useState('');
  const [medHorario,setMedHorario]=useState('08:00');
  const [medFreq,setMedFreq]=useState('A cada 8 horas');
  const [medVigencia,setMedVigencia]=useState('Uso contínuo (30 dias)');
  const [medObs,setMedObs]=useState('');
  const [medResgate,setMedResgate]=useState(false);

  const atalhosHospice = [
    { nome: 'Morfina 10mg (Resgate)', dose: '1 comprimido (10mg)', freq: 'Se dor forte (máx a cada 4h)', resgate: true, obs: 'Dose de resgate SOS se dor intensa (nota >= 7). Não ultrapassar a posologia sem contato com a equipe.' },
    { nome: 'Morfina 30mg (Contínuo)', dose: '1 comprimido (30mg)', freq: 'A cada 12 horas (08:00 e 20:00)', resgate: false, obs: 'Uso contínuo fixo para controle de dor basal. Tomar rigorosamente nos horários prescritos.' },
    { nome: 'Codeína 30mg', dose: '1 comprimido (30mg)', freq: 'A cada 6 horas se dor', resgate: false, obs: 'Opioide fraco para dor moderada. Associar a laxativo profilático conforme protocolo.' },
    { nome: 'Gabapentina 300mg', dose: '1 cápsula (300mg)', freq: '1x ao dia à noite', resgate: false, obs: 'Dor neuropática (queimação/choque). Tomar preferencialmente à noite para mitigar sonolência.' },
    { nome: 'Dipirona 500mg', dose: '1 comprimido (500mg)', freq: 'A cada 6 horas se dor/febre', resgate: false, obs: 'Analgésico e antitérmico para dor leve/moderada.' },
    { nome: 'Paracetamol 500mg', dose: '1 comprimido (500mg)', freq: 'A cada 8 horas', resgate: false, obs: 'Analgésico comum para controle de desconforto leve.' },
    { nome: 'Ondansetrona 8mg', dose: '1 comprimido (8mg)', freq: 'A cada 8 horas se náusea', resgate: false, obs: 'Antiemético. Tomar 30 min antes das refeições em caso de náusea ou profilático pré-quimio.' },
    { nome: 'Haloperidol 1mg', dose: '5 gotas (1mg)', freq: '1x ao dia à noite', resgate: false, obs: 'Controle de náusea refratária ou delírio/agitação noturna.' },
    { nome: 'Dexametasona 4mg', dose: '1 comprimido (4mg)', freq: '1x ao dia pela manhã', resgate: false, obs: 'Corticoide para edema peritumoral e astenia. Tomar com café da manhã para evitar gastrite.' },
    { nome: 'Lactulose 667mg/ml', dose: '15ml (1 colher de sopa)', freq: '1x ao dia à noite', resgate: false, obs: 'Laxativo osmótico profilático obrigatório no uso de opioides. Manter boa hidratação oral.' }
  ];

  function aplicarAtalho(a: typeof atalhosHospice[0]){
    setMedNome(a.nome);
    setMedDose(a.dose);
    setMedFreq(a.freq);
    setMedObs(a.obs);
    setMedResgate(a.resgate);
  }

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    setSending(true);
    setError('');
    const f=new FormData(e.currentTarget);
    try{
      if(type==='paciente'){
        await api.criarPaciente({nome:String(f.get('nome')),email:String(f.get('email')),senha:String(f.get('senha')),perfil:'paciente',prontuario:String(f.get('prontuario')||'')||null,idade:f.get('idade')?Number(f.get('idade')):null,telefone:String(f.get('telefone')||'')||null,diagnostico_oncologico:String(f.get('diagnostico')||'')||null});
        done('Paciente cadastrado. Ele já pode acessar a conta com o email e a senha informados.');
      }else if(type==='orientacao'&&patient){
        await api.enviarOrientacao(patient.id,{titulo:String(f.get('titulo')),descricao:String(f.get('descricao')),categoria:String(f.get('categoria')),prioridade:String(f.get('prioridade'))});
        done('Orientação enviada e disponibilizada no app do paciente.');
      }else if(type==='diagnostico'&&patient){
        const diagnostico=String(f.get('diagnostico')).trim();
        const motivo=String(f.get('motivo')).trim();
        if(!diagnostico||!motivo)throw new Error('Preencha o diagnóstico e a justificativa dos cuidados paliativos.');
        await api.registrarEvolucao(patient.id,{profissional_nome:professional.nome,cargo:'Equipe assistencial',tipo_evolucao:'Diagnóstico e indicação de cuidados paliativos',conteudo:`Diagnóstico: ${diagnostico}\n\nMotivo da indicação de cuidados paliativos: ${motivo}`,conduta_plano:String(f.get('plano')||'')||null});
        await api.enviarOrientacao(patient.id,{titulo:'Diagnóstico e cuidados paliativos',descricao:`Diagnóstico: ${diagnostico}\n\nMotivo do acompanhamento paliativo: ${motivo}`,categoria:'cuidados',prioridade:'media'});
        done('Diagnóstico registrado no prontuário e enviado ao app do paciente.');
      }else if(type==='agendamento'&&patient){
        const data=String(f.get('data'));
        const hora=String(f.get('hora'));
        if(!data||!hora)throw new Error('Informe a data e o horário do agendamento.');
        const agendamento=`Atendimento agendado para ${new Date(`${data}T${hora}`).toLocaleString('pt-BR')}.\nMotivo: ${String(f.get('motivo')||'Acompanhamento de cuidados paliativos')}`;
        const orientacaoAgendamento=String(f.get('orientacao')||'').trim();
        await api.registrarEvolucao(patient.id,{profissional_nome:professional.nome,cargo:'Equipe assistencial',tipo_evolucao:'Agendamento',conteudo:agendamento,conduta_plano:orientacaoAgendamento||null});
        await api.enviarOrientacao(patient.id,{titulo:'Agendamento de atendimento',descricao:`${agendamento}${orientacaoAgendamento?`\n\nOrientação: ${orientacaoAgendamento}`:''}`,categoria:'cuidados',prioridade:'media'});
        done('Agendamento registrado no prontuário e enviado ao app do paciente.');
      }else if(type==='medicacao'&&patient){
        const nome=medNome.trim() || String(f.get('nome')||'').trim();
        const dose=medDose.trim() || String(f.get('dose')||'').trim();
        const horario=medHorario.trim() || String(f.get('horario')||'08:00').trim();
        const frequencia=medFreq.trim() || String(f.get('frequencia')||'A cada 8 horas').trim();
        const vigencia=medVigencia.trim() || String(f.get('vigencia')||'Uso contínuo').trim();
        const observacao=(medObs || String(f.get('observacao')||'')).trim();
        const eh_dose_resgate=medResgate || f.get('eh_dose_resgate')==='on';

        if(!nome||!dose)throw new Error('Informe o nome e a dose do medicamento.');

        await api.criarMedicacao(patient.id,{
          nome,
          dose,
          horario,
          frequencia,
          observacao:observacao||null,
          vigencia,
          eh_dose_resgate,
          medico_prescritor:professional.nome
        });

        await api.registrarEvolucao(patient.id,{
          profissional_nome:professional.nome,
          cargo:professional.perfil==='medico'?'Médico Paliativista':'Equipe Assistencial',
          tipo_evolucao:eh_dose_resgate?'Prescrição de Dose de Resgate':'Prescrição Medicamentosa',
          conteudo:`Medicamento: ${nome} — Dose: ${dose}\nHorário inicial: ${horario} | Frequência: ${frequencia}\nVigência: ${vigencia}\nOrientações de uso: ${observacao||'Conforme posologia prescrita.'}`,
          conduta_plano:`Prescrito por ${professional.nome}. Notificação e horários enviados ao app do paciente.`
        });

        done(`Medicamento ${nome} prescrito com sucesso no prontuário de ${patient.nome}.`);
      }
    }catch(err){
      setError(err instanceof Error?err.message:'Não foi possível enviar.');
    }finally{
      setSending(false);
    }
  }

  const title={paciente:'Cadastrar paciente',orientacao:'Enviar orientação',diagnostico:'Enviar diagnóstico e justificativa',agendamento:'Enviar agendamento',medicacao:'Prescrever Medicamento ou Receita'}[type];

  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-head">
        <div>
          <span className="eyebrow">{patient?.nome||'NOVO PRONTUÁRIO'}</span>
          <h2 id="modal-title">{title}</h2>
        </div>
        <button className="icon-button" onClick={close} aria-label="Fechar">×</button>
      </div>

      <form onSubmit={submit} className="form-stack">
        {type==='paciente'&&<>
          <label>Nome completo do paciente<input name="nome" required maxLength={150}/></label>
          <label>Email do paciente<input type="email" name="email" required maxLength={255}/></label>
          <label>Senha inicial<input name="senha" type="password" required minLength={8}/></label>
          <div className="form-grid">
            <label>Prontuário<input name="prontuario"/></label>
            <label>Idade<input name="idade" type="number" min="0" max="125"/></label>
          </div>
          <label>Telefone<input name="telefone" type="tel"/></label>
          <label>Diagnóstico oncológico<input name="diagnostico"/></label>
          <p className="helper">O cadastro cria uma conta de paciente na API compartilhada com o app.</p>
        </>}

        {type==='orientacao'&&<>
          <label>Título<input name="titulo" required maxLength={200} placeholder="Ex.: Cuidados com a medicação"/></label>
          <label>Orientação<textarea name="descricao" required rows={5} placeholder="Escreva a orientação em linguagem direta."/></label>
          <div className="form-grid">
            <label>Categoria<select name="categoria"><option value="cuidados">Cuidados</option><option value="sintoma">Sintoma</option><option value="medicacao">Medicação</option></select></label>
            <label>Prioridade<select name="prioridade"><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option></select></label>
          </div>
          <p className="helper">A orientação ficará disponível no app do paciente quando enviada.</p>
        </>}

        {type==='diagnostico'&&<>
          <label>Diagnóstico clínico<input name="diagnostico" required placeholder="Diagnóstico e, se disponível, CID-10"/></label>
          <label>Motivo da indicação de cuidados paliativos<textarea name="motivo" required rows={4} placeholder="Registre o contexto clínico que fundamenta o acompanhamento paliativo."/></label>
          <label>Plano ou conduta<textarea name="plano" rows={3}/></label>
          <p className="helper">Será registrada como evolução clínica no prontuário, com autoria e data.</p>
        </>}

        {type==='agendamento'&&<>
          <div className="form-grid">
            <label>Data<input type="date" name="data" required/></label>
            <label>Horário<input type="time" name="hora" required/></label>
          </div>
          <label>Motivo<input name="motivo" placeholder="Acompanhamento clínico"/></label>
          <label>Orientação para o paciente<textarea name="orientacao" rows={3} placeholder="O que o paciente precisa saber antes do atendimento?"/></label>
          <p className="helper">O agendamento será incluído no histórico clínico compartilhado.</p>
        </>}

        {type==='medicacao'&&<>
          <div>
            <label style={{marginBottom:'6px',display:'block',fontWeight:600}}>Atalhos Rápidos de Cuidados Paliativos (Hospice HEG / RENAME):</label>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'12px'}}>
              {atalhosHospice.map(a=>(
                <button key={a.nome} type="button" className="button button-quiet" style={{fontSize:'12.5px',padding:'6px 10px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'6px'}} onClick={()=>aplicarAtalho(a)}>
                  + {a.nome}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <label>Nome do Medicamento *
              <input name="nome" required value={medNome} onChange={e=>setMedNome(e.target.value)} placeholder="Ex.: Morfina 10mg" />
            </label>
            <label>Dose / Posologia *
              <input name="dose" required value={medDose} onChange={e=>setMedDose(e.target.value)} placeholder="Ex.: 1 comprimido (10mg)" />
            </label>
          </div>

          <div className="form-grid">
            <label>Horário da 1ª Dose
              <input type="time" name="horario" value={medHorario} onChange={e=>setMedHorario(e.target.value)} />
            </label>
            <label>Frequência / Intervalo
              <input name="frequencia" value={medFreq} onChange={e=>setMedFreq(e.target.value)} placeholder="Ex.: A cada 8 horas, 1x ao dia..." />
            </label>
          </div>

          <div className="form-grid">
            <label>Vigência da Receita
              <input name="vigencia" value={medVigencia} onChange={e=>setMedVigencia(e.target.value)} placeholder="Ex.: 30 dias / Uso contínuo" />
            </label>
            <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',marginTop:'24px'}}>
              <input type="checkbox" name="eh_dose_resgate" checked={medResgate} onChange={e=>setMedResgate(e.target.checked)} style={{width:'18px',height:'18px'}} />
              <span style={{fontSize:'14px',fontWeight:600,color:'var(--danger)'}}>⚡ É Dose de Resgate (Crise de Dor)</span>
            </label>
          </div>

          <label>Orientações de Uso da Receita e Recomendações
            <textarea name="observacao" rows={3} value={medObs} onChange={e=>setMedObs(e.target.value)} placeholder="Ex.: Tomar com um copo de água após refeição. Não mastigar. Se náusea, tomar antiemético 30 min antes." />
          </label>

          <p className="helper">A prescrição médica fica imediatamente disponível na aba 'Medicações e Receitas' do paciente e agenda os lembretes diários.</p>
        </>}

        {error&&<div className="notice notice-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="button button-secondary" onClick={close}>Cancelar</button>
          <button className="button button-primary" disabled={sending}>
            {sending?'Enviando…':type==='paciente'?'Cadastrar paciente':type==='medicacao'?'Salvar Prescrição no Prontuário':title}
          </button>
        </div>
      </form>
    </section>
  </div>;
}

function PatientArea({usuario,page,setPage,data,refresh,notice}:{usuario:Usuario;page:PatientPage;setPage:(p:PatientPage)=>void;data:{esas:ESAS[];medicacoes:Medicacao[];orientacoes:Orientacao[];dor:LocalDor[]};refresh:()=>Promise<void>;notice:(kind:Notice['kind'],text:string)=>void}){
  const [loading,setLoading]=useState(false);
  const [step,setStep]=useState(0);
  const [scores,setScores]=useState<Record<string,number|null>>(()=>Object.fromEntries(symptomRows.map(s=>[s.key,null])));
  const [mapRegion,setMapRegion]=useState('');
  const [mapType,setMapType]=useState('dor');
  const [mapScore,setMapScore]=useState(5);
  const [mapNote,setMapNote]=useState('');
  const [chatbotDor,setChatbotDor]=useState<number>(8);
  const [medAba,setMedAba]=useState<'hoje'|'receitas'>('hoje');
  const [modalResgate,setModalResgate]=useState(false);
  const [resgateNome,setResgateNome]=useState('Morfina 10mg');
  const [resgateObs,setResgateObs]=useState('');



  const last=data.esas[0];
  const lastScoreMax=last?Math.max(last.dor,last.cansaco,last.nausea,last.depressao,last.ansiedade,last.sonolencia,last.apetite,last.mal_estar,last.falta_de_ar,last.constipacao||0):0;
  const temGraveRecente=lastScoreMax>=7;

  // Próximo remédio a tomar hoje
  const remediosOrdenados=[...data.medicacoes].sort((a,b)=>(a.horario||'').localeCompare(b.horario||''));
  const proximoRemedio=remediosOrdenados.find(m=>m.status!=='tomada')||remediosOrdenados[0];

  async function tomarRemedio(m:Medicacao){
    setLoading(true);
    try{
      const nowHora=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      const obsAtual=m.observacao?`${m.observacao} · Confirmado às ${nowHora}`:`Confirmado às ${nowHora}`;
      await api.atualizarMedicacao(usuario.id,m.id,{status:'tomada',observacao:obsAtual});
      await refresh();
      notice('success',`Dose de ${m.nome} confirmada com sucesso às ${nowHora}!`);
    }catch(err){
      notice('error',err instanceof Error?err.message:'Não foi possível confirmar a dose.');
    }finally{
      setLoading(false);
    }
  }

  async function reabrirRemedio(m:Medicacao){
    setLoading(true);
    try{
      await api.atualizarMedicacao(usuario.id,m.id,{status:'agendada'});
      await refresh();
      notice('success',`Status de ${m.nome} reaberto.`);
    }catch(err){
      notice('error',err instanceof Error?err.message:'Erro ao atualizar medicação.');
    }finally{
      setLoading(false);
    }
  }

  async function registrarDoseResgate(e:FormEvent){
    e.preventDefault();
    if(!resgateNome.trim()){
      notice('error','Informe o nome do medicamento de resgate.');
      return;
    }
    setLoading(true);
    try{
      const nowHora=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      await api.criarMedicacao(usuario.id,{
        nome:resgateNome.trim(),
        dose:'1 dose de resgate',
        horario:nowHora,
        frequencia:'Uso pontual para crise de dor aguda',
        observacao:resgateObs?`Dose de resgate tomada às ${nowHora}. Obs: ${resgateObs}`:`Dose de resgate tomada às ${nowHora}`,
        status:'tomada',
        eh_dose_resgate:true,
        medico_prescritor:'Prescrição de resgate do paciente'
      });
      await refresh();
      setModalResgate(false);
      setResgateObs('');
      notice('success',`Dose de resgate (${resgateNome}) registrada às ${nowHora} no prontuário!`);
    }catch(err){
      notice('error',err instanceof Error?err.message:'Não foi possível registrar a dose de resgate.');
    }finally{
      setLoading(false);
    }
  }

  async function enviarESAS(){
    if(symptomRows.some(s=>scores[s.key]===null)){
      notice('error','Responda aos dez sintomas antes de enviar.');
      return;
    }
    setLoading(true);
    try{
      const maxScore=Math.max(...Object.values(scores).map(v=>Number(v)||0));
      const temGrave=maxScore>=7;
      const dorScore=Number(scores.dor)||maxScore;
      await api.registrarESAS(usuario.id,{...scores,observacao:temGrave?'Gatilho de intensidade severa acionado':''});
      await refresh();
      setStep(0);
      setScores(Object.fromEntries(symptomRows.map(s=>[s.key,null])));
      if(temGrave){
        setChatbotDor(dorScore);
        setPage('chatbot');
        notice('success',`Avaliação enviada. Como você indicou intensidade forte (${dorScore}/10), abrimos o Chatbot Zelo para cuidar do seu alívio agora.`);
      }else{
        setPage('inicio');
        notice('success','Avaliação ESAS enviada com sucesso para a equipe do Hospice.');
      }
    }catch(e){
      notice('error',(e as Error).message);
    }finally{
      setLoading(false);
    }
  }

  async function enviarMapa(e:FormEvent){
    e.preventDefault();
    setLoading(true);
    try{
      await api.registrarMapaDor(usuario.id,{regiao_anatomica:mapRegion,tipo_ocorrencia:mapType,intensidade:mapScore,observacao:mapNote||null});
      await refresh();
      setMapRegion('');
      setMapNote('');
      notice('success','Local e intensidade registrados no mapa de dor.');
    }catch(err){
      notice('error',(err as Error).message);
    }finally{
      setLoading(false);
    }
  }

  return <section>
    {page==='inicio'&&<>
      <PageHeading kicker="ÁREA DO PACIENTE & CUIDADOR" title={`Olá, ${usuario.nome.split(' ')[0]}.`} description="Acompanhe seus horários de remédios, avisos da equipe médica e envie seus sintomas diários." action={<div className="button-row"><button className="button button-primary" onClick={()=>setPage('esas')}>Avaliar Sintomas (ESAS)</button><button className="button button-secondary" onClick={()=>setModalResgate(true)}>+ Tomei Dose de Resgate</button></div>}/>
      
      {/* 1. SEÇÃO DE AVISOS E RETORNOS DA EQUIPE MÉDICA */}
      <article className="record-card record-wide" style={{marginBottom:'24px',borderLeft:'5px solid var(--green)'}}>
        <div className="section-title" style={{marginTop:0}}>
          <div>
            <span className="eyebrow">RETORNO DA EQUIPE DE CUIDADOS</span>
            <h2>Avisos e Orientações Médicas</h2>
          </div>
          <button className="button button-secondary" onClick={()=>setPage('orientacoes')}>Ver todos os avisos ({data.orientacoes.length})</button>
        </div>
        {data.orientacoes.length===0?<Empty title="Nenhum aviso novo no momento" text="Sua equipe médica e de enfermagem acompanha seus registros continuamente. Quando enviarem orientações, elas aparecerão aqui."/>:<div className="remedy-schedule-list">{data.orientacoes.slice(0,3).map(o=><div key={o.id} className="history-item" style={{background:'#fcfbf8',padding:'14px 16px',borderRadius:'10px',border:'1px solid var(--border)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'8px',flexWrap:'wrap'}}><b style={{color:'var(--green)',fontSize:'16px'}}>🩺 {o.titulo}</b><span className={`pill ${o.prioridade==='alta'?'severity-high':''}`}>Prioridade {o.prioridade} · {date(o.atualizada_em)}</span></div><p style={{margin:'6px 0 0',fontSize:'15px',color:'var(--ink)',lineHeight:1.55}}>{o.descricao}</p></div>)}</div>}
      </article>

      {/* 2. SEÇÃO DE ALERTA DE REMÉDIOS E HORÁRIOS */}
      <div className="remedy-alert-card">
        <div className="remedy-alert-top">
          <div>
            <span className="eyebrow" style={{color:'var(--green)'}}>LEMBRETE E ALERTA DE MEDICAÇÃO</span>
            <h2 style={{margin:'4px 0',fontSize:'22px',color:'var(--ink)'}}>Próximo Remédio Programado</h2>
          </div>
          {proximoRemedio&&<span className="remedy-time-badge">⏰ {proximoRemedio.horario||'Horário flexível'}</span>}
        </div>
        {proximoRemedio?(
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={{fontSize:'16px',lineHeight:1.5}}>
              <strong>{proximoRemedio.nome}</strong> · {proximoRemedio.dose} · ({proximoRemedio.frequencia})
              {proximoRemedio.eh_dose_resgate&&<span className="pill" style={{marginLeft:'8px',background:'var(--danger-soft)',color:'var(--danger)'}}>⚡ Resgate</span>}
              {proximoRemedio.observacao&&<p style={{margin:'6px 0 0',fontSize:'14px',color:'var(--muted)',background:'var(--paper)',padding:'8px 12px',borderRadius:'8px',border:'1px solid var(--border)'}}>📋 <b>Orientação de uso:</b> {proximoRemedio.observacao}</p>}
            </div>
            <div className="button-row" style={{marginTop:'6px'}}>
              {proximoRemedio.status==='tomada'?(
                <span className="pill" style={{background:'#eaf5ec',color:'#1e6b47',fontSize:'14px',padding:'8px 14px'}}>✓ Esta dose já foi confirmada hoje</span>
              ):(
                <button className="button button-primary" onClick={()=>tomarRemedio(proximoRemedio)} disabled={loading}>
                  {loading?'Confirmando…':`✓ Confirmar que já tomei ${proximoRemedio.nome}`}
                </button>
              )}
              <button className="button button-secondary" onClick={()=>setModalResgate(true)}>+ Registrar Dose de Resgate Extra</button>
              <button className="button button-quiet" onClick={()=>setPage('medicacoes')}>Ver todos os horários e receitas ›</button>
            </div>
          </div>
        ):(
          <div>
            <p className="muted" style={{margin:'0 0 12px'}}>Nenhum medicamento ativo registrado pela sua equipe médica para hoje. Se precisar de alívio para dor aguda, você pode registrar uma dose de resgate prescrita.</p>
            <button className="button button-secondary" onClick={()=>setModalResgate(true)}>+ Registrar Dose de Resgate</button>
          </div>
        )}
      </div>

      {/* 3. ALERTA ESAS E GATILHO CHATBOT SE HOUVER DOR SEVERA */}
      {temGraveRecente&&(
        <div className="notice notice-error" style={{padding:'18px 20px',borderRadius:'12px',marginBottom:'22px',flexDirection:'column',alignItems:'flex-start',gap:'10px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'22px'}}>⚠️</span>
            <div>
              <strong style={{fontSize:'16px'}}>Aviso Clínico: Sua última avaliação registrou sintoma intenso (Nota {lastScoreMax}/10)</strong>
              <p style={{margin:'3px 0 0',fontSize:'14px'}}>Nossa equipe especializada do Hospice foi notificada. O Chatbot Zelo está pronto para direcionar seu alívio imediato.</p>
            </div>
          </div>
          <div className="button-row">
            <button className="button button-primary" onClick={()=>{setChatbotDor(last.dor||lastScoreMax);setPage('chatbot');}} style={{background:'var(--danger)',borderColor:'var(--danger)',color:'#ffffff'}}>
              Abrir Chatbot Zelo para Cuidado da Dor ›
            </button>
            <a href="tel:4130000000" className="button button-secondary" style={{borderColor:'var(--danger)',color:'var(--danger)'}}>
              📞 Ligar para o Hospice HEG: (41) 3000-0000
            </a>
          </div>
        </div>
      )}

      {/* Cards de Resumo e Ações Rápidas */}
      <div className="metric-grid">
        <Metric label="Avaliações ESAS" value={data.esas.length}/>
        <Metric label="Medicações ativas" value={data.medicacoes.length}/>
        <Metric label="Avisos da equipe" value={data.orientacoes.length}/>
        <Metric label="Locais de dor" value={data.dor.length}/>
      </div>

      <article className="record-card record-wide">
        <div className="section-title" style={{marginTop:0}}>
          <div>
            <h2>Última Avaliação ESAS Enviada</h2>
            <p>{last?`Enviada em ${date(last.data_registro)} · Gravidade: ${last.gravidade_maxima}`:'Nenhuma avaliação registrada ainda.'}</p>
          </div>
          <button className="button button-primary" onClick={()=>setPage('esas')}>Fazer Nova Avaliação ESAS</button>
        </div>
        {last&&<div className="score-grid">{symptomRows.map(s=><div className="score" key={s.key}><span>{s.label}</span><b className={Number(last[s.key]||0)>=7?'score-high':''}>{last[s.key]??'—'}/10</b></div>)}</div>}
      </article>

      <div className="quick-links" style={{marginTop:'20px'}}>
        <button className="quick-link" onClick={()=>{setPage('medicacoes');setMedAba('hoje');}}>
          <span><b>💊</b> Verificar Medicamentos e Horários</span><b>›</b>
        </button>
        <button className="quick-link" onClick={()=>setPage('mapa')}>
          <span><b>◎</b> Registrar Mapa do Corpo / Lesão</span><b>›</b>
        </button>
        <button className="quick-link" onClick={()=>setPage('orientacoes')}>
          <span><b>i</b> Consultar Todas as Orientações</span><b>›</b>
        </button>
      </div>
    </>}

    {/* TELA DE MEDICAÇÕES, RECEITAS E ORIENTAÇÕES DE USO DO PACIENTE */}
    {page==='medicacoes'&&<>
      <PageHeading kicker="TRATAMENTO PRESCRITO" title="Medicações e Receitas" description="Consulte os remédios prescritos pela sua equipe médica, verifique os horários de hoje e confirme as doses tomadas." action={<div className="button-row"><button className="button button-primary" onClick={()=>setModalResgate(true)}>+ Registrar Dose de Resgate</button></div>}/>

      {/* Sub-navegação em Abas para o Paciente */}
      <div className="sub-nav-tabs" role="tablist">
        <button className={`sub-nav-btn ${medAba==='hoje'?'active':''}`} onClick={()=>setMedAba('hoje')} role="tab" aria-selected={medAba==='hoje'}>
          ⏰ Horários de Hoje & Lembretes ({data.medicacoes.length})
        </button>
        <button className={`sub-nav-btn ${medAba==='receitas'?'active':''}`} onClick={()=>setMedAba('receitas')} role="tab" aria-selected={medAba==='receitas'}>
          📋 Receitas Prescritas & Orientações de Uso
        </button>
      </div>

      {/* ABA 1: HORÁRIOS DE HOJE & VERIFICAR MEDICAMENTOS */}
      {medAba==='hoje'&&<div className="remedy-schedule-list">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'10px',marginBottom:'8px',flexWrap:'wrap'}}>
          <p className="muted" style={{margin:0}}>Toque em <b>Confirmar que já tomei</b> para registrar a dose no seu prontuário diário.</p>
          <button className="button button-secondary" onClick={()=>setModalResgate(true)}>⚡ Tomou remédio de resgate fora da hora?</button>
        </div>
        {data.medicacoes.length===0?<Empty title="Nenhum medicamento cadastrado" text="Sua equipe médica ainda não cadastrou medicamentos neste prontuário."/>:data.medicacoes.map(m=>(
          <article className="remedy-schedule-item" key={m.id}>
            <div className="remedy-info">
              <div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
                <span className="remedy-time-badge" style={{fontSize:'16px',padding:'4px 10px'}}>⏰ {m.horario||'Horário flexível'}</span>
                <b>{m.nome}</b> · <span style={{color:'var(--ink)',fontWeight:700}}>{m.dose}</span>
                {m.eh_dose_resgate&&<span className="pill" style={{background:'var(--danger-soft)',color:'var(--danger)'}}>⚡ Resgate</span>}
                {m.status==='tomada'?<span className="pill" style={{background:'#eaf5ec',color:'#1e6b47'}}>✓ Dose tomada hoje</span>:<span className="pill" style={{background:'#fef3c7',color:'#92400e'}}>⏳ Pendente</span>}
              </div>
              <span>Frequência: {m.frequencia||'Conforme prescrição'} {m.medico_prescritor?`· Prescritor: ${m.medico_prescritor}`:''}</span>
              {m.observacao&&<p>📋 <b>Orientações de uso:</b> {m.observacao}</p>}
            </div>
            <div className="button-row">
              {m.status==='tomada'?(
                <button className="button button-quiet" onClick={()=>reabrirRemedio(m)} disabled={loading} title="Marcar como pendente novamente se tocou por engano">Desfazer</button>
              ):(
                <button className="button button-primary" onClick={()=>tomarRemedio(m)} disabled={loading} style={{minHeight:'48px'}}>
                  {loading?'Salvando…':'✓ Confirmar que já tomei'}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>}

      {/* ABA 2: MINHAS RECEITAS & ORIENTAÇÕES DE USO */}
      {medAba==='receitas'&&<div className="remedy-schedule-list">
        <p className="muted">Relação completa de receitas médicas e orientações de uso vinculadas ao seu plano de cuidado:</p>
        {data.medicacoes.length===0?<Empty title="Nenhuma receita registrada" text="Nenhuma receita prescrita pela equipe médica no momento."/>:data.medicacoes.map(m=><article className="record-card" key={m.id} style={{marginBottom:'12px'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'10px',flexWrap:'wrap'}}><h3 style={{margin:0,fontSize:'18px',color:'var(--green)'}}>💊 {m.nome} · {m.dose}</h3><span className="pill">{m.vigencia||'Receita ativa'}</span></div><div className="data-grid" style={{marginTop:'12px'}}><Data label="Posologia e Horários" value={`${m.frequencia} (Horário base: ${m.horario})`}/><Data label="Finalidade" value={m.eh_dose_resgate?'Dose de resgate para crise de dor':'Uso fixo contínuo'}/><Data label="Médico Prescritor" value={m.medico_prescritor||'Equipe do Hospice'}/><Data label="Instruções e Orientações de Uso" value={m.observacao||'Tomar com água conforme prescrição médica.'}/></div></article>)}
      </div>}

      </>}

    {/* TELA DE AVALIAÇÃO ESAS (WIZARD DE 10 SINTOMAS) */}
    {page==='esas'&&<>
      <PageHeading kicker="ESCALA ESAS" title="Avaliação de Sintomas" description="Escolha uma nota de 0 a 10 para cada sintoma. Notas 7 ou mais acionam o direcionamento imediato do Chatbot Zelo."/>
      <div className="wizard-card">
        <div className="wizard-progress">
          <span>Sintoma {step+1} de {symptomRows.length} · {symptomRows[step].label}</span>
          <div><i style={{width:`${((step+1)/symptomRows.length)*100}%`}}/></div>
        </div>
        <h2>{symptomRows[step].label}</h2>
        <p>Como o senhor(a) está se sentindo em relação a <b>{symptomRows[step].label.toLowerCase()}</b> neste momento?</p>
        
        <div className="rating-groups" role="radiogroup" aria-label={`Nota de ${symptomRows[step].label}`}>
          {[{label:'Sem sintoma a Leve (0 a 3)',values:[0,1,2,3]},{label:'Moderado (4 a 6)',values:[4,5,6]},{label:'Forte a Pior Possível (7 a 10)',values:[7,8,9,10]}].map(group=>(
            <div className="rating-group" key={group.label}>
              <div className="rating-label">{group.label}</div>
              <div className="rating-row">
                {group.values.map(n=>(
                  <button type="button" key={n} aria-checked={scores[symptomRows[step].key]===n} role="radio" className={`${scores[symptomRows[step].key]===n?'selected':''} ${n>=7?'score-btn-high':''}`} onClick={()=>setScores(old=>({...old,[symptomRows[step].key]:n}))}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="range-captions">
          <span>0 · Ausência do sintoma</span>
          <span>10 · Pior intensidade possível</span>
        </div>

        <div className="button-row wizard-actions">
          <button className="button button-secondary" disabled={!step} onClick={()=>setStep(v=>Math.max(0,v-1))}>Voltar</button>
          {step<symptomRows.length-1?(
            <button className="button button-primary" disabled={scores[symptomRows[step].key]===null} onClick={()=>setStep(v=>v+1)}>Próximo sintoma ›</button>
          ):(
            <button className="button button-primary" disabled={scores[symptomRows[step].key]===null||loading} onClick={enviarESAS}>
              {loading?'Gravando e validando…':'Finalizar e Enviar Avaliação'}
            </button>
          )}
        </div>
      </div>
      <h2 className="section-heading">Avaliações anteriores</h2>
      {data.esas.slice(0,4).map(e=><p className="history-line" key={e.id}>{date(e.data_registro)} · Dor {e.dor}/10 · Cansaço {e.cansaco}/10 · {e.gravidade_maxima}</p>)}
    </>}

    {/* CHATBOT ZELO: DIRECIONAMENTO DE CUIDADO (IVC 0,95) */}
    {page==='chatbot'&&<ChatbotZeloScreen usuario={usuario} dorInicial={chatbotDor} onConcluir={()=>setPage('inicio')} notice={notice} refresh={refresh}/>}

    {/* MAPA DA DOR */}
    {page==='mapa'&&<>
      <PageHeading kicker="MAPA CORPORAL" title="Registrar Local de Dor ou Lesão" description="Informe a região anatômica e a intensidade para avaliação da equipe."/>
      <form className="record-card form-stack map-form" onSubmit={enviarMapa}>
        <label>Região do corpo<select required value={mapRegion} onChange={e=>setMapRegion(e.target.value)}><option value="">Selecione uma região</option>{['Cabeça','Pescoço','Ombro direito','Ombro esquerdo','Tórax anterior','Abdômen superior','Abdômen inferior','Costas superior','Região lombar / Sacra','Quadril','Braço direito','Braço esquerdo','Perna direita','Perna esquerda','Outra região'].map(r=><option key={r}>{r}</option>)}</select></label>
        <label>Tipo de ocorrência<select value={mapType} onChange={e=>setMapType(e.target.value)}><option value="dor">Dor</option><option value="edema">Inchaço (Edema)</option><option value="lesao">Ferida ou Lesão na pele</option></select></label>
        <label>Intensidade: {mapScore}/10<input type="range" min="0" max="10" value={mapScore} onChange={e=>setMapScore(Number(e.target.value))}/></label>
        <label>Observação e cuidados<textarea rows={3} value={mapNote} onChange={e=>setMapNote(e.target.value)} placeholder="Descreva se piora ao movimentar, se tomou remédio ou se há vermelhidão..."/></label>
        <button className="button button-primary" disabled={loading}>{loading?'Enviando…':'Gravar no Mapa do Corpo'}</button>
      </form>
      <h2 className="section-heading">Registros corporais anteriores</h2>
      {data.dor.length?data.dor.map(d=><div className="history-item" key={d.id}><b>{d.regiao_anatomica} · {d.tipo_ocorrencia} · {d.intensidade}/10</b><span>{date(d.criado_em)}</span>{d.observacao&&<p>{d.observacao}</p>}</div>):<Empty title="Nenhum local registrado" text="Seus apontamentos no mapa corporal aparecerão aqui."/>}
    </>}

    {/* ORIENTAÇÕES DA EQUIPE */}
    {page==='orientacoes'&&<>
      <PageHeading kicker="EQUIPE DE CUIDADOS" title="Avisos e Orientações Médicas" description="Comunicações e recomendações clínicas enviadas pela equipe do Hospice Erasto Gaertner para o seu cuidado domiciliar."/>
      {data.orientacoes.length===0?<Empty title="Nenhuma orientação recebida" text="Quando a equipe médica ou de enfermagem emitir um parecer ou orientação, ela aparecerá aqui."/>:data.orientacoes.map(o=><article className="record-card" key={o.id} style={{marginBottom:'14px',borderLeft:`4px solid ${o.prioridade==='alta'?'var(--danger)':'var(--green)'}`}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'10px',flexWrap:'wrap'}}><h3 style={{margin:0,fontSize:'18px',color:'var(--ink)'}}>🩺 {o.titulo}</h3><span className={`pill ${o.prioridade==='alta'?'severity-high':''}`}>Prioridade {o.prioridade} · {date(o.atualizada_em)}</span></div><p style={{margin:'10px 0 0',fontSize:'15.5px',lineHeight:1.6,color:'var(--ink)',whiteSpace:'pre-line'}}>{o.descricao}</p></article>)}
    </>}

    {/* MODAL DE DOSE DE RESGATE RÁPIDA */}
    {modalResgate&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModalResgate(false);}}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-resgate-title">
        <div className="modal-head">
          <div>
            <span className="eyebrow" style={{color:'var(--danger)'}}>REGISTRO DE URGÊNCIA</span>
            <h2 id="modal-resgate-title">⚡ Registrar Dose de Resgate Extra</h2>
          </div>
          <button className="icon-button" onClick={()=>setModalResgate(false)} aria-label="Fechar">×</button>
        </div>
        <form onSubmit={registrarDoseResgate} className="form-stack">
          <p className="muted" style={{margin:0}}>Informe a medicação de resgate tomada para crise aguda de dor fora dos horários habituais:</p>
          <label>Qual remédio de resgate você tomou? *
            <select value={resgateNome} onChange={e=>setResgateNome(e.target.value)} required>
              <option value="Morfina 10mg comprimido">Morfina 10mg comprimido</option>
              <option value="Morfina em gotas">Morfina em gotas</option>
              <option value="Codeína 30mg">Codeína 30mg</option>
              <option value="Dipirona 1g">Dipirona 1g</option>
              <option value="Outro analgésico de resgate prescrito">Outro analgésico prescrito</option>
            </select>
          </label>
          <label>Observação (como está a dor agora?)
            <textarea rows={3} value={resgateObs} onChange={e=>setResgateObs(e.target.value)} placeholder="Ex.: Crise de dor forte após almoçar. Tomei 1 comprimido de morfina conforme orientado pelo médico."/>
          </label>
          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={()=>setModalResgate(false)}>Cancelar</button>
            <button type="submit" className="button button-primary" style={{background:'var(--danger)',borderColor:'var(--danger)',color:'#ffffff'}} disabled={loading}>
              {loading?'Salvando…':'Confirmar Dose de Resgate'}
            </button>
          </div>
        </form>
      </section>
    </div>}
  </section>;
}

// COMPONENTE DO CHATBOT ZELO INTERATIVO (IVC 0,95)
function ChatbotZeloScreen({usuario,dorInicial,onConcluir,notice,refresh}:{usuario:Usuario;dorInicial:number;onConcluir:()=>void;notice:(k:Notice['kind'],t:string)=>void;refresh:()=>Promise<void>}){
  const [etapa,setEtapa]=useState(0);
  const [historicoEtapas,setHistoricoEtapas]=useState<number[]>([]);
  const [emergencia,setEmergencia]=useState(false);
  const [carac,setCarac]=useState('somatica');
  const [cronica,setCronica]=useState(true);
  const [resgate,setResgate]=useState(false);
  const [efetivo,setEfetivo]=useState(true);
  const [solicitarContato,setSolicitarContato]=useState(false);
  const [salvando,setSalvando]=useState(false);
  const [concluido,setConcluido]=useState(false);

  function avancar(novaEtapa:number){
    setHistoricoEtapas(old=>[...old,etapa]);
    setEtapa(novaEtapa);
  }

  function voltar(){
    if(historicoEtapas.length>0){
      const prev=historicoEtapas[historicoEtapas.length-1];
      setHistoricoEtapas(old=>old.slice(0,-1));
      setEtapa(prev);
    }
  }

  async function finalizarTriagem(pediuContato:boolean){
    setSalvando(true);
    setSolicitarContato(pediuContato);
    try{
      await api.registrarTriagem(usuario.id,{
        intensidade_dor:Math.max(7,dorInicial||8),
        caracteristica_dor:carac,
        mais_de_duas_semanas:cronica,
        tipo_dor:cronica?'cronica':'aguda',
        fez_dose_resgate:resgate,
        medicamentos_efetivos:efetivo,
        em_acompanhamento:true,
        tem_sintoma_acompanhante:false,
        sintoma_acompanhante_desc:null,
        tem_fator_piora:false,
        fator_piora_desc:null,
        alerta_sinais_alarme_exibido:true,
        medidas_nao_farmacologicas_exibidas:true,
        solicitou_agendamento:pediuContato
      });
      await refresh();
      setConcluido(true);
      notice('success','Triagem de dor registrada no prontuário e enviada para a equipe do Hospice!');
    }catch(err){
      notice('error',err instanceof Error?err.message:'Não foi possível salvar a triagem.');
    }finally{
      setSalvando(false);
    }
  }

  return <div className="chatbot-shell">
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
      <div>
        <span className="eyebrow">DIRECIONAMENTO DE CUIDADO</span>
        <h1 style={{margin:'4px 0',fontSize:'26px'}}>Assistente Zelo · Apoio para Dor</h1>
      </div>
      <a href="tel:4130000000" className="button button-secondary" style={{borderColor:'var(--danger)',color:'var(--danger)'}}>
        📞 Central Hospice: (41) 3000-0000
      </a>
    </div>

    <div className="chat-stream">
      {/* Mensagem 0: Acolhimento Inicial */}
      <div className="chat-bubble chat-bubble-zelo">
        <strong>Enfermeira Virtual Zelo · Hospice Erasto Gaertner</strong>
        Olá, {usuario.nome}. Você informou <b>Dor nota {dorInicial}/10</b> na escala ESAS. Já comunicamos a equipe de plantão do Hospice. Vamos fazer algumas perguntas rápidas para orientar o conforto e alívio no seu domicílio.
      </div>

      {/* ETAPA 1: VERIFICAÇÃO DE EMERGÊNCIA */}
      {etapa>=1&&<div className="chat-bubble chat-bubble-zelo" style={{borderLeft:'4px solid var(--danger)'}}>
        <strong style={{color:'var(--danger)'}}>⚠️ Triagem de Segurança e Sinais de Alarme</strong>
        Antes de prosseguirmos, confira se está acontecendo alguma destas 3 situações agora:
        <ul style={{margin:'8px 0 4px',paddingLeft:'20px'}}>
          <li>Teve alguma <b>queda recente</b> ou suspeita de fratura?</li>
          <li>Apresenta <b>perda de movimentos ou sensibilidade</b> nas pernas ou pés?</li>
          <li>Está com <b>sonolência profunda</b> ou difícil de acordar após ingerir Morfina?</li>
        </ul>
      </div>}

      {etapa>=2&&!emergencia&&<div className="chat-bubble chat-bubble-user">
        Não aconteceu nenhuma dessas situações.
        <small>Verificação de segurança confirmada</small>
      </div>}

      {/* ALERTA DE EMERGÊNCIA BLOQUEANTE */}
      {emergencia&&<div className="notice notice-error" style={{padding:'20px',borderRadius:'12px',flexDirection:'column',gap:'12px',alignItems:'flex-start'}}>
        <h3 style={{margin:0,fontSize:'18px'}}>🚨 ATENÇÃO: Situação de Emergência Médica Detectada</h3>
        <p style={{margin:0,fontSize:'15px',lineHeight:1.55}}>
          Diante desses sinais de alarme, é fundamental entrar em contato imediatamente com o plantão do Hospice Erasto Gaertner ou dirigir-se ao pronto atendimento referenciado.
        </p>
        <div className="button-row">
          <a href="tel:4130000000" className="button button-primary" style={{background:'var(--danger)',borderColor:'var(--danger)',color:'#ffffff',fontSize:'16px',padding:'12px 22px'}}>
            📞 Ligar Imediatamente para o Hospice: (41) 3000-0000
          </a>
          <button className="button button-secondary" onClick={()=>{setEmergencia(false);setEtapa(1);}}>Voltar e rever resposta</button>
          <button className="button button-quiet" onClick={onConcluir}>Voltar ao Início</button>
        </div>
      </div>}

      {/* ETAPA 2: SEMIOLOGIA DA DOR */}
      {etapa>=2&&!emergencia&&<div className="chat-bubble chat-bubble-zelo">
        <strong>Enfermeira Virtual Zelo</strong>
        Entendido. Dentre as opções abaixo, como você descreve melhor a sensação dessa dor?
      </div>}

      {etapa>=3&&!emergencia&&<div className="chat-bubble chat-bubble-user">
        Sensação descrita: {carac==='visceral'?'Cólica ou dor espalhada por dentro':carac==='neuropatica'?'Queimação, choque ou formigamento':carac==='somatica'?'Pontada, aperto ou sensação de facada':'Outra sensação'}
      </div>}

      {/* ETAPA 3: DURAÇÃO DA DOR */}
      {etapa>=3&&!emergencia&&<div className="chat-bubble chat-bubble-zelo">
        <strong>Enfermeira Virtual Zelo</strong>
        Essa dor começou há mais de 2 semanas (dor contínua/crônica) ou começou há poucos dias/hoje (dor aguda)?
      </div>}

      {etapa>=4&&!emergencia&&<div className="chat-bubble chat-bubble-user">
        {cronica?'Começou há mais de 2 semanas (Crônica)':'Começou há poucos dias ou hoje (Aguda)'}
      </div>}

      {/* ETAPA 4: MANEJO FARMACOLÓGICO E RESGATE */}
      {etapa>=4&&!emergencia&&<div className="chat-bubble chat-bubble-zelo">
        <strong>Enfermeira Virtual Zelo</strong>
        Você já fez uso da <b>dose de resgate</b> (medicamento extra prescrito para alívio rápido da crise) hoje? E os remédios habituais estão conseguindo controlar a dor?
      </div>}

      {etapa>=5&&!emergencia&&<div className="chat-bubble chat-bubble-user">
        Resgate tomado: {resgate?'Sim, já tomei a dose de resgate':'Ainda não tomei'}. Remédios fixos: {efetivo?'Estão ajudando':'Não estão aliviando adequadamente'}.
      </div>}

      {/* ETAPA 5: ORIENTAÇÕES DE CONFORTO */}
      {etapa>=5&&!emergencia&&<div className="chat-bubble chat-bubble-zelo" style={{background:'#fcfdfd',borderLeft:'4px solid var(--green)'}}>
        <strong>Enfermeira Virtual Zelo · Medidas de Conforto Não Farmacológicas</strong>
        Enquanto a medicação age, adote estas medidas práticas validadas para diminuir a dor:
        <ul style={{margin:'8px 0',paddingLeft:'20px',lineHeight:1.6}}>
          <li>🛋️ <b>Posicionamento do corpo:</b> Use travesseiros sob as pernas ou costas para aliviar pontos de pressão.</li>
          <li>🌬️ <b>Respiração suave:</b> Puxe o ar devagar pelo nariz contando até 3 e solte suavemente pela boca.</li>
          <li>🌿 <b>Ambiente calmo:</b> Diminua luzes diretas, reduza ruídos e coloque uma música suave para relaxar.</li>
          <li>💧 <b>Hidratação e apoio:</b> Mantenha um familiar cuidador próximo para apoio e água à mão.</li>
        </ul>
        {!resgate&&<p style={{margin:'6px 0 0',fontWeight:700,color:'var(--green)'}}>Dica clínica: Se o seu médico prescreveu medicação de resgate para dor, este é o momento de fazer uso conforme a receita.</p>}
      </div>}

      {/* ETAPA 6: CONCLUSÃO E TRANSMISSÃO */}
      {concluido&&<div className="chat-bubble chat-bubble-zelo" style={{background:'#eaf5ec',border:'1.5px solid #b9d8c4'}}>
        <strong style={{color:'#1e6b47'}}>✓ Orientações Registradas com Sucesso!</strong>
        Suas respostas foram salvas no prontuário do Hospice. A equipe multiprofissional foi notificada {solicitarContato?'com pedido de contato prioritário':'para monitoramento contínuo'}.
        <div style={{marginTop:'14px'}} className="button-row">
          <button className="button button-primary" onClick={onConcluir} style={{minHeight:'50px'}}>Concluir e Voltar ao Início</button>
          <a href="tel:4130000000" className="button button-secondary">Ligar para o Hospice: (41) 3000-0000</a>
        </div>
      </div>}
    </div>

    {/* PAINEL DE CONTROLES E RESPOSTAS FECHADAS DO CHATBOT */}
    {!concluido&&!emergencia&&(
      <div className="chat-controls">
        {etapa===0&&<div className="chat-actions-row">
          <button className="button button-primary button-wide" onClick={()=>avancar(1)}>Iniciar Triagem e Orientações de Alívio ›</button>
        </div>}

        {etapa===1&&<div className="chat-options-grid">
          <button type="button" className="chat-option-btn" onClick={()=>{setEmergencia(true);}} style={{borderColor:'#f5c2bc',background:'#fff9f8'}}>
            ⚠️ Sim, alguma dessas 3 situações graves está acontecendo
          </button>
          <button type="button" className="chat-option-btn" onClick={()=>{setEmergencia(false);avancar(2);}}>
            ✓ Não aconteceu nenhuma dessas situações (Continuar)
          </button>
        </div>}

        {etapa===2&&<div className="chat-options-grid">
          <button type="button" className="chat-option-btn" onClick={()=>{setCarac('somatica');avancar(3);}}>
            👉 Parece uma pontada, aperto no corpo ou sensação de facada
          </button>
          <button type="button" className="chat-option-btn" onClick={()=>{setCarac('neuropatica');avancar(3);}}>
            ⚡ Parece queimação, choque elétrico ou formigamento
          </button>
          <button type="button" className="chat-option-btn" onClick={()=>{setCarac('visceral');avancar(3);}}>
            🌊 Parece uma cólica ou dor espalhada por dentro
          </button>
          <button type="button" className="chat-option-btn" onClick={()=>{setCarac('outra');avancar(3);}}>
            ❓ Outra sensação / Não consigo definir exatamente
          </button>
        </div>}

        {etapa===3&&<div className="chat-options-grid">
          <button type="button" className="chat-option-btn" onClick={()=>{setCronica(true);avancar(4);}}>
            📅 Sim, essa dor começou há mais de 2 semanas (Crônica)
          </button>
          <button type="button" className="chat-option-btn" onClick={()=>{setCronica(false);avancar(4);}}>
            ⏱️ Não, começou há poucos dias ou hoje (Aguda)
          </button>
        </div>}

        {etapa===4&&<div className="chat-options-grid">
          <button type="button" className="chat-option-btn" onClick={()=>{setResgate(true);setEfetivo(false);avancar(5);}}>
            💊 Já tomei a dose de resgate, mas a dor continua
          </button>
          <button type="button" className="chat-option-btn" onClick={()=>{setResgate(false);setEfetivo(false);avancar(5);}}>
            ⏳ Ainda não tomei a dose de resgate
          </button>
          <button type="button" className="chat-option-btn" onClick={()=>{setResgate(true);setEfetivo(true);avancar(5);}}>
            ✓ Tomei o resgate e estou começando a sentir alívio
          </button>
        </div>}

        {etapa===5&&<div className="chat-options-grid">
          <p style={{margin:'0 0 4px',fontWeight:700}}>Deseja solicitar contato prioritário da equipe do Hospice?</p>
          <button type="button" className="button button-primary" onClick={()=>finalizarTriagem(true)} disabled={salvando} style={{minHeight:'50px'}}>
            {salvando?'Salvando triagem…':'📞 Sim, solicitar contato prioritário da equipe'}
          </button>
          <button type="button" className="button button-secondary" onClick={()=>finalizarTriagem(false)} disabled={salvando} style={{minHeight:'50px'}}>
            {salvando?'Salvando…':'✓ Não, vou aplicar as medidas de conforto e aguardar'}
          </button>
        </div>}

        {etapa>0&&<div className="chat-actions-row">
          <button type="button" className="button button-quiet" onClick={voltar}>↺ Corrigir / Voltar à pergunta anterior</button>
        </div>}
      </div>
    )}
  </div>;
}
