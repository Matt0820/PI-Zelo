import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('docs/telas_sistema_real');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    defaultViewport: { width: 1366, height: 850, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Helper to click by button text
  async function clickButtonText(text) {
    const buttons = await page.$$('button, .nav-item, a');
    for (const b of buttons) {
      const t = await page.evaluate(el => el.textContent, b);
      if (t && t.toLowerCase().includes(text.toLowerCase())) {
        await b.click();
        await sleep(500);
        return true;
      }
    }
    return false;
  }

  // --- TELA 01: LOGIN ---
  console.log('1. Capturing Tela 01...');
  await page.goto('http://127.0.0.1:5173');
  await page.waitForSelector('.login-shell');
  await sleep(400);
  await page.screenshot({ path: path.join(outDir, 'tela_01_login.png') });

  // --- TELA 02: NOVO CADASTRO ---
  console.log('2. Capturing Tela 02...');
  const roleButtons = await page.$$('.role-switch button');
  if (roleButtons.length >= 2) {
    await roleButtons[1].click(); // Switch to Paciente
    await sleep(400);
  }
  await clickButtonText('Cadastrar paciente');
  await sleep(500);
  await page.screenshot({ path: path.join(outDir, 'tela_02_cadastro.png') });

  // Retorna para login da equipe
  await clickButtonText('Já tenho conta');
  await sleep(300);
  const roleButtonsBack = await page.$$('.role-switch button');
  if (roleButtonsBack.length >= 1) {
    await roleButtonsBack[0].click(); // Equipe
    await sleep(300);
  }

  // --- LOGIN COMO MÉDICO ---
  console.log('Logging in as Medico...');
  const inputs = await page.$$('.login-card input');
  if (inputs.length >= 2) {
    await inputs[0].click({ clickCount: 3 });
    await inputs[0].type('medico@zelo.saude.gov.br');
    await inputs[1].click({ clickCount: 3 });
    await inputs[1].type('medico123');
    await clickButtonText('Entrar no Zelo');
    await sleep(1500);
  }

  // --- TELA 03: PAINEL / DASHBOARD ASSISTENCIAL ---
  console.log('3. Capturing Tela 03...');
  await page.waitForSelector('.metric-grid');
  await sleep(500);
  await page.screenshot({ path: path.join(outDir, 'tela_03_dashboard.png') });

  // --- TELA 04: CARTEIRA DE PACIENTES ---
  console.log('4. Capturing Tela 04...');
  await clickButtonText('Pacientes');
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, 'tela_04_pacientes.png') });

  // --- TELA 05: CENTRAL DE ALERTAS ---
  console.log('5. Capturing Tela 05...');
  await clickButtonText('Alertas Clínicos');
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, 'tela_05_alertas.png') });

  // --- TELA 06: CATÁLOGO DE FÁRMACOS ---
  console.log('6. Capturing Tela 06...');
  await clickButtonText('Catálogo de Fármacos');
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, 'tela_06_catalogo.png') });

  // --- ENTRAR NO PRONTUÁRIO DE LEOVEGILDO ---
  console.log('Opening Prontuário...');
  await clickButtonText('Pacientes');
  await sleep(500);
  // Clica no card de Leovegildo
  const patientCards = await page.$$('.patient-card');
  if (patientCards.length > 0) {
    await patientCards[0].click();
    await sleep(1000);
  }

  // --- TELA 07: PRONTUÁRIO — CONTEXTO & DIAGNÓSTICO ---
  console.log('7. Capturing Tela 07...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  await page.screenshot({ path: path.join(outDir, 'tela_07_prontuario_contexto.png') });

  // --- TELA 08: CURVA DE TENDÊNCIA TEMPORAL ESAS ---
  console.log('8. Capturing Tela 08...');
  await page.evaluate(() => {
    const el = document.querySelector('.esas-trend-wrapper');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(500);
  await page.screenshot({ path: path.join(outDir, 'tela_08_tendencia_esas.png') });

  // --- TELA 09: AVALIAÇÃO ESAS RECENTE & HISTÓRICO ---
  console.log('9. Capturing Tela 09...');
  await page.evaluate(() => {
    const el = document.querySelector('.score-grid');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(outDir, 'tela_09_esas_recente.png') });

  // --- TELA 10: MAPA DA DOR E LESÕES ---
  console.log('10. Capturing Tela 10...');
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    const h = headings.find(el => el.textContent.includes('Mapa da dor'));
    if (h) h.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(outDir, 'tela_10_mapa_dor_prontuario.png') });

  // --- TELA 11: TRIAGENS DE DOR DO CHATBOT ---
  console.log('11. Capturing Tela 11...');
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    const h = headings.find(el => el.textContent.includes('Triagens de dor'));
    if (h) h.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(outDir, 'tela_11_triagens_chatbot.png') });

  // --- TELA 12: MODAL DE PRESCRIÇÃO COM AUTOCOMPLETE ---
  console.log('12. Capturing Tela 12...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await clickButtonText('+ Prescrever medicamento');
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, 'tela_12_prescricoes_modal.png') });

  // Fecha o modal
  await clickButtonText('Cancelar');
  await sleep(400);

  // --- TELA 13: ORIENTAÇÕES E EVOLUÇÕES ---
  console.log('13. Capturing Tela 13...');
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    const h = headings.find(el => el.textContent.includes('Evoluções') || el.textContent.includes('Orientações'));
    if (h) h.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(outDir, 'tela_13_evolucoes.png') });

  // --- TELA 20: CENTRAL DE ACESSIBILIDADE ---
  console.log('14. Capturing Tela 20...');
  await clickButtonText('Voltar para pacientes');
  await sleep(400);
  await clickButtonText('Acessibilidade');
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, 'tela_20_acessibilidade.png') });

  // --- TELA 21: MODO NOTURNO (ESCURO) ---
  console.log('15. Capturing Tela 21 (Modo Escuro)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Modo Noturno') || b.textContent.includes('Escuro'));
    if (btn) btn.click();
  });
  await sleep(500);
  await clickButtonText('Painel de Prioridades');
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, 'tela_21_modo_escuro.png') });

  // --- TELA 22: MODO ALTO CONTRASTE (WCAG AAA) ---
  console.log('16. Capturing Tela 22 (Alto Contraste)...');
  await clickButtonText('Acessibilidade');
  await sleep(400);
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Alto Contraste'));
    if (btn) btn.click();
  });
  await sleep(500);
  await clickButtonText('Alertas Clínicos');
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, 'tela_22_alto_contraste.png') });

  // Volta para modo padrão
  await clickButtonText('Acessibilidade');
  await sleep(400);
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Padrão'));
    if (btn) btn.click();
  });
  await sleep(400);

  // --- LOGOUT E LOGIN COMO PACIENTE ---
  console.log('Logging out from Medico and logging in as Paciente...');
  await clickButtonText('Sair do sistema');
  await sleep(600);

  // Switch to Paciente
  const roleBtns = await page.$$('.role-switch button');
  if (roleBtns.length >= 2) {
    await roleBtns[1].click();
    await sleep(400);
  }
  const patientInputs = await page.$$('.login-card input');
  if (patientInputs.length >= 2) {
    await patientInputs[0].click({ clickCount: 3 });
    await patientInputs[0].type('leovegildo.paciente@zelo.saude.gov.br');
    await patientInputs[1].click({ clickCount: 3 });
    await patientInputs[1].type('paciente123');
    await clickButtonText('Entrar no Zelo');
    await sleep(1500);
  }

  // --- TELA 14: INÍCIO ACOLHEDOR DO PACIENTE (HOME) ---
  console.log('17. Capturing Tela 14 (Paciente Home)...');
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, 'tela_14_paciente_home.png') });

  // --- TELA 15: AVALIAÇÃO GUIADA DE SINTOMAS ESAS ---
  console.log('18. Capturing Tela 15 (ESAS Wizard)...');
  await clickButtonText('Avaliação ESAS');
  await sleep(700);
  await page.screenshot({ path: path.join(outDir, 'tela_15_paciente_esas.png') });

  // Volta para Home
  await clickButtonText('Voltar para o início');
  await sleep(400);

  // --- TELA 16: MAPA DA DOR INTERATIVO ---
  console.log('19. Capturing Tela 16 (Mapa da Dor)...');
  await clickButtonText('Mapa da Dor');
  await sleep(700);
  await page.screenshot({ path: path.join(outDir, 'tela_16_paciente_mapa_dor.png') });

  // Volta para Home
  await clickButtonText('Voltar para o início');
  await sleep(400);

  // --- TELA 17: CHATBOT ZELO ---
  console.log('20. Capturing Tela 17 (Chatbot Zelo)...');
  await clickButtonText('Chatbot Zelo');
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, 'tela_17_paciente_chatbot.png') });

  // Volta para Home
  await clickButtonText('Voltar para o início');
  await sleep(400);

  // --- TELA 18: MEDICAÇÕES DO PACIENTE ---
  console.log('21. Capturing Tela 18 (Medicações)...');
  await clickButtonText('Medicações');
  await sleep(700);
  await page.screenshot({ path: path.join(outDir, 'tela_18_paciente_medicamentos.png') });

  // Volta para Home
  await clickButtonText('Voltar para o início');
  await sleep(400);

  // --- TELA 19: AVISOS E ORIENTAÇÕES ---
  console.log('22. Capturing Tela 19 (Orientações)...');
  await clickButtonText('Orientações');
  await sleep(700);
  await page.screenshot({ path: path.join(outDir, 'tela_19_paciente_orientacoes.png') });

  console.log('All real screens captured successfully!');
  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
