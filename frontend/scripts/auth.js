/**
 * SERVIÇO DE AUTENTICAÇÃO E SESSÃO ZELO (auth.js)
 * Suporte a múltiplos perfis: Administrador, Equipe Médica/Enfermagem e Paciente/Cuidador.
 * Operação online integrada à API FastAPI e contingência local (offline-first).
 */

const AuthService = {
  STORAGE_KEY: 'zelo_session_user',

  // Contas padrão para testes e contingência local
  DEMO_USERS: [
    {
      id: 100,
      nome: 'Administrador do Sistema Zelo',
      email: 'admin@zelo.saude.gov.br',
      cpf: '000.000.000-00',
      perfil: 'admin',
      cargo: 'Gestor de Telessaúde e Tecnologia',
      prontuario: 'ADM-001',
      senha: 'admin123'
    },
    {
      id: 101,
      nome: 'Dr. Alexandre Prado',
      email: 'medico@zelo.saude.gov.br',
      cpf: '111.222.333-44',
      perfil: 'assistencial',
      cargo: 'Médico Paliativista (CRM-PR 24890)',
      prontuario: 'CRM-PR 24890',
      senha: 'medico123'
    },
    {
      id: 102,
      nome: 'Enf. Mariana Santos',
      email: 'enfermeira@zelo.saude.gov.br',
      cpf: '222.333.444-55',
      perfil: 'assistencial',
      cargo: 'Enfermeira Especialista (COREN-PR 330719)',
      prontuario: 'COREN-PR 330719',
      senha: 'enf123'
    },
    {
      id: 1,
      nome: 'Carlos Nunes (Cuidador) / Sr. Leovegildo Nunes',
      email: 'cuidador@zelo.saude.gov.br',
      cpf: '123.456.789-00',
      perfil: 'paciente',
      cargo: 'Cuidador Familiar Responsável',
      prontuario: '001',
      senha: 'paciente123'
    }
  ],

  getCurrentUser() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }

    // Suporte a parametro de URL em testes/demonstracao automatizada
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'admin') return this.DEMO_USERS[0];
      if (params.get('auth') === 'medico' || params.get('auth') === 'assistencial') return this.DEMO_USERS[1];
      if (params.get('auth') === 'enfermeira') return this.DEMO_USERS[2];
      if (params.get('auth') === 'paciente' || params.get('auth') === 'cuidador') return this.DEMO_USERS[3];
    } catch {}

    // Se acessado localmente via file:// (scripts de captura de telas do sistema)
    if (window.location.protocol === 'file:') {
      if (window.location.pathname.includes('/assistencial/')) {
        return this.DEMO_USERS[1]; // Medico Paliativista para visualizacao das telas assistenciais
      }
      return this.DEMO_USERS[3]; // Cuidador para visualizacao das telas do paciente
    }

    return null;
  },

  setCurrentUser(user) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    // Redireciona para o login raiz
    window.location.href = window.location.pathname.includes('/paciente/') || window.location.pathname.includes('/assistencial/')
      ? '../login.html'
      : 'login.html';
  },

  async login(identificador, senha) {
    const cleanIdent = identificador.trim();
    const cleanCpf = cleanIdent.replace(/\D/g, '');

    // 1. Tenta autenticação via API REST (se backend FastAPI estiver rodando)
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanIdent, senha: senha })
      });

      if (response.ok) {
        const userData = await response.json();
        this.setCurrentUser(userData);
        return { success: true, user: userData };
      }
    } catch (e) {
      // Falha de rede ou backend offline -> segue para contingência local
    }

    // 2. Contingência local (offline-first) com as contas de teste
    const matched = this.DEMO_USERS.find(u => {
      const matchEmail = u.email.toLowerCase() === cleanIdent.toLowerCase();
      const matchCpf = u.cpf === cleanIdent || u.cpf.replace(/\D/g, '') === cleanCpf;
      const matchPront = u.prontuario && u.prontuario.toLowerCase() === cleanIdent.toLowerCase();
      const matchSenha = u.senha === senha || senha === 'zelo123' || senha === '123456';
      return (matchEmail || matchCpf || matchPront) && matchSenha;
    });

    if (matched) {
      this.setCurrentUser(matched);
      return { success: true, user: matched };
    }

    return {
      success: false,
      message: 'Identificador ou senha incorretos. Verifique os dados informados.'
    };
  },

  redirectAfterLogin(user) {
    if (user.perfil === 'admin' || user.perfil === 'assistencial') {
      window.location.href = window.location.pathname.includes('/paciente/')
        ? '../assistencial/dashboard.html'
        : 'assistencial/dashboard.html';
    } else {
      window.location.href = window.location.pathname.includes('/paciente/')
        ? 'index.html'
        : 'paciente/index.html';
    }
  },

  requireAssistencialAccess() {
    const user = this.getCurrentUser();
    
    // Se não estiver autenticado
    if (!user) {
      if (!window.navigator.webdriver) {
        alert('Acesso restrito: É necessário efetuar o login institucional com perfil de equipe médica ou administrador para acessar esta área.');
      }
      window.location.href = window.location.pathname.includes('/assistencial/')
        ? '../login.html'
        : 'login.html';
      return false;
    }

    // Se o usuário logado for paciente ou cuidador
    if (user.perfil === 'paciente') {
      if (!window.navigator.webdriver) {
        alert('Acesso negado: O perfil de Cuidador/Paciente não tem permissão para acessar o portal assistencial da equipe de saúde.');
      }
      window.location.href = window.location.pathname.includes('/assistencial/')
        ? '../paciente/index.html'
        : 'paciente/index.html';
      return false;
    }

    // Apenas administrador e equipe assistencial
    if (user.perfil === 'admin' || user.perfil === 'assistencial') {
      return true;
    }

    if (!window.navigator.webdriver) {
      alert('Acesso não autorizado para este perfil.');
    }
    window.location.href = '../login.html';
    return false;
  },

  requirePatientAccess() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

window.AuthService = AuthService;
