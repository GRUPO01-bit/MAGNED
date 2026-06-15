/**
 * MAGNED — Scraping autenticado do Portal do Aluno UniEVANGÉLICA
 * URL: https://portal.unievangelica.edu.br/aluno/#/home/avisos
 *
 * Usa puppeteer-core com Brave/Chrome instalado no Windows.
 * Configure CHROMIUM_PATH no .env apontando para o executável.
 *
 * Fix Angular SPA: usa dispatchEvent('input') para acionar o ng-model
 * e remove o atributo disabled do botão Entrar antes de clicar.
 */

const puppeteer = require("puppeteer-core");

const PORTAL_URL = "https://portal.unievangelica.edu.br/aluno";
const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ||
  "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launchBrowser() {
  return puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1280,800",
    ],
  });
}

/**
 * Faz login no Portal do Aluno usando Angular-friendly typing.
 * O portal usa ng-model, então precisamos de dispatchEvent para
 * que o Angular reconheça o valor e libere o botão Entrar.
 */
async function loginPortal(page, matricula, senha) {
  await page.goto(`${PORTAL_URL}/#/login`, {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  // Aguarda o campo de usuário aparecer (selector real do portal)
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });

  // Preenche matrícula/CPF disparando eventos que o Angular escuta
  await page.evaluate((valor) => {
    const el = document.querySelector('input[name="username"]');
    if (!el) return;
    el.value = valor;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, matricula);

  // Preenche senha da mesma forma
  await page.evaluate((valor) => {
    const el = document.querySelector('input[name="password"], input[type="password"]');
    if (!el) return;
    el.value = valor;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, senha);

  // Dá um tempo para o Angular processar e habilitar o botão
  await sleep(1500);

  // Remove o disabled do botão e clica (Angular SPA workaround)
  await page.evaluate(() => {
    const btn = document.getElementById("button-login") ||
      document.querySelector('button[type="submit"]') ||
      document.querySelector("button.button-block");
    if (btn) {
      btn.removeAttribute("disabled");
      btn.click();
    }
  });

  // Aguarda navegação ou timeout (SPA pode não disparar evento de nav)
  try {
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 });
  } catch (e) {
    // Angular SPA: pode não disparar evento de navegação tradicional
    await sleep(4000);
  }

  // Verifica se o login foi bem-sucedido (URL não deve conter /login)
  const url = page.url();
  if (url.includes("/login")) {
    throw new Error("Login falhou — verifique matrícula e senha do Portal");
  }

  return true;
}

/**
 * Extrai avisos da home do Portal.
 */
async function getAvisos(page) {
  await page.goto(`${PORTAL_URL}/#/home/avisos`, {
    waitUntil: "networkidle2",
    timeout: 20000,
  });

  await sleep(3000);

  const avisos = await page.evaluate(() => {
    const cards = document.querySelectorAll(
      ".aviso-card, .card-aviso, .aviso-item, [class*='aviso'], .list-group-item"
    );

    if (cards.length === 0) {
      const items = document.querySelectorAll("ul li, .card, .panel");
      return Array.from(items)
        .slice(0, 20)
        .map((el) => ({
          titulo: el.querySelector("h3, h4, h5, strong, b")?.innerText?.trim() ?? "",
          descricao: el.innerText?.trim()?.slice(0, 400) ?? "",
          data: el.querySelector(".data, .date, small, [class*='date']")?.innerText?.trim() ?? "",
        }))
        .filter((a) => a.descricao.length > 10);
    }

    return Array.from(cards).map((card) => ({
      titulo: card.querySelector("h3, h4, h5, .titulo, strong")?.innerText?.trim() ?? card.innerText.split("\n")[0]?.trim(),
      descricao: card.querySelector("p, .descricao, .conteudo")?.innerText?.trim()?.slice(0, 400) ?? "",
      data: card.querySelector(".data, .date, small, time")?.innerText?.trim() ?? "",
    }));
  });

  return avisos.filter((a) => a.titulo || a.descricao);
}

/**
 * Extrai dados financeiros (mensalidades, situação).
 */
async function getDadosFinanceiros(page) {
  await page.goto(`${PORTAL_URL}/#/financeiro`, {
    waitUntil: "networkidle2",
    timeout: 20000,
  });

  await sleep(2000);

  return page.evaluate(() => {
    const items = document.querySelectorAll("tr, .boleto-item, .parcela, [class*='financ']");
    return Array.from(items)
      .slice(0, 20)
      .map((el) => el.innerText?.trim())
      .filter((t) => t && t.length > 5);
  });
}

/**
 * Extrai horário de aulas.
 */
async function getHorarios(page) {
  await page.goto(`${PORTAL_URL}/#/academico/horario`, {
    waitUntil: "networkidle2",
    timeout: 20000,
  });

  await sleep(2000);

  return page.evaluate(() => {
    const rows = document.querySelectorAll("tr, .horario-item, [class*='horario']");
    return Array.from(rows)
      .slice(0, 50)
      .map((el) => el.innerText?.trim())
      .filter((t) => t && t.length > 5);
  });
}

/**
 * Extrai dados do perfil do aluno.
 */
async function getDadosAluno(page) {
  await page.goto(`${PORTAL_URL}/#/home`, {
    waitUntil: "networkidle2",
    timeout: 20000,
  });

  await sleep(2000);

  return page.evaluate(() => {
    const nome =
      document.querySelector(".nome-aluno, .student-name, h2, .perfil-nome")?.innerText?.trim() ??
      document.title;

    const matricula =
      document.querySelector(".matricula, [class*='matric']")?.innerText?.trim() ?? "";

    const curso =
      document.querySelector(".curso, [class*='curso'], .course-name")?.innerText?.trim() ?? "";

    const periodo =
      document.querySelector(".periodo, [class*='period']")?.innerText?.trim() ?? "";

    return { nome, matricula, curso, periodo };
  });
}

/**
 * Coleta TUDO do Portal do Aluno em uma sessão única.
 */
async function getAllPortalData(matricula, senha) {
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // User agent realista
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Intercepta requests desnecessários para acelerar (imagens, fontes, mídia)
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const tipo = req.resourceType();
      if (["image", "media", "font"].includes(tipo)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Login
    await loginPortal(page, matricula, senha);

    // Coleta dados em sequência (portal SPA não suporta bem coleta paralela)
    const perfil    = await getDadosAluno(page).catch(e => ({ erro: e.message }));
    const avisos    = await getAvisos(page).catch(() => []);
    const horarios  = await getHorarios(page).catch(() => []);
    const financeiro = await getDadosFinanceiros(page).catch(() => []);

    return {
      coletadoEm: new Date().toLocaleString("pt-BR"),
      perfil,
      avisos,
      horarios,
      financeiro,
    };
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = {
  getAllPortalData,
  loginPortal,
  getAvisos,
  getHorarios,
  getDadosFinanceiros,
  getDadosAluno,
};
