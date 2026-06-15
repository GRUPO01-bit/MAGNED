/**
 * MAGNED Integration Server
 * Servidor Express que unifica Portal do Aluno + Moodle AVA
 * e expõe endpoints prontos para o backend Claude API do MAGNED.
 *
 * Porta: 3333 (configurável via .env)
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { authenticateAndGetToken, getAllStudentData } = require("./moodleApi");
const { getAllPortalData } = require("./portalScraper");

const app = express();
app.use(cors());
app.use(express.json());

// Cache em memória por sessão (evita re-login a cada requisição)
const sessionCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

function getCacheKey(matricula) {
  return `session_${matricula}`;
}

function setCache(key, data) {
  sessionCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function getCache(key) {
  const entry = sessionCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    sessionCache.delete(key);
    return null;
  }
  return entry.data;
}

// ─── Health check ───────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Autenticação unificada ──────────────────────────────────────────────────

/**
 * POST /auth
 * Body: { matricula, senha }
 * Autentica em ambas as plataformas e salva sessão em cache.
 */
app.post("/auth", async (req, res) => {
  const { matricula, senha } = req.body;

  if (!matricula || !senha) {
    return res.status(400).json({ error: "matricula e senha são obrigatórios" });
  }

  try {
    // Autentica no Moodle (mais rápido, sem browser)
    const moodleToken = await authenticateAndGetToken(matricula, senha);

    // Salva credenciais criptadas na sessão para o Portal (scraping)
    const cacheKey = getCacheKey(matricula);
    setCache(cacheKey, {
      moodleToken,
      matricula,
      senha, // Em produção: criptografar com crypto.createCipheriv
    });

    res.json({
      success: true,
      message: "Autenticado com sucesso em ambas as plataformas",
      sessionExpiraEm: new Date(Date.now() + CACHE_TTL_MS).toLocaleString("pt-BR"),
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ─── Dados do Moodle (AVA) ───────────────────────────────────────────────────

/**
 * GET /ava/all?matricula=XXX
 * Retorna TODOS os dados do Moodle: cursos, notas, tarefas, avisos, eventos.
 */
app.get("/ava/all", async (req, res) => {
  const { matricula } = req.query;
  const cache = getCache(getCacheKey(matricula));

  if (!cache) {
    return res.status(401).json({ error: "Sessão não encontrada. Chame POST /auth primeiro." });
  }

  try {
    const data = await getAllStudentData(cache.moodleToken);
    res.json(data);
  } catch (err) {
    // Token pode ter expirado — limpa cache
    sessionCache.delete(getCacheKey(matricula));
    res.status(500).json({ error: err.message });
  }
});

// ─── Dados do Portal do Aluno ────────────────────────────────────────────────

/**
 * GET /portal/all?matricula=XXX
 * Faz scraping autenticado do Portal: avisos, horário, financeiro, perfil.
 */
app.get("/portal/all", async (req, res) => {
  const { matricula } = req.query;
  const cache = getCache(getCacheKey(matricula));

  if (!cache) {
    return res.status(401).json({ error: "Sessão não encontrada. Chame POST /auth primeiro." });
  }

  try {
    const data = await getAllPortalData(req.query.cpf || cache.matricula, cache.senha);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Endpoint principal — tudo de uma vez ───────────────────────────────────

/**
 * GET /magned/contexto?matricula=XXX
 *
 * ESSE é o endpoint que o Claude API do MAGNED deve chamar.
 * Retorna um objeto consolidado com TUDO que o aluno precisa,
 * formatado para injeção direta no system prompt do Claude.
 */
app.get("/magned/contexto", async (req, res) => {
  const { matricula } = req.query;
  const cache = getCache(getCacheKey(matricula));

  if (!cache) {
    return res.status(401).json({ error: "Sessão não encontrada. Chame POST /auth primeiro." });
  }

  try {
    // Busca paralela: Moodle + Portal ao mesmo tempo
    const [moodleResult, portalResult] = await Promise.allSettled([
      getAllStudentData(cache.moodleToken),
      getAllPortalData(req.query.cpf || cache.matricula, cache.senha),
    ]);

    const moodle = moodleResult.status === "fulfilled" ? moodleResult.value : null;
    const portal = portalResult.status === "fulfilled" ? portalResult.value : null;

    // Monta contexto consolidado para o Claude
    const contexto = buildContextoParaClaude(moodle, portal);

    res.json({
      raw: { moodle, portal },
      contextoParaClaude: contexto,
      coletadoEm: new Date().toLocaleString("pt-BR"),
      erros: {
        moodle: moodleResult.status === "rejected" ? moodleResult.reason?.message : null,
        portal: portalResult.status === "rejected" ? portalResult.reason?.message : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Builder de contexto para o Claude ──────────────────────────────────────

function buildContextoParaClaude(moodle, portal) {
  const linhas = [];

  // Perfil do aluno
  if (moodle?.aluno || portal?.perfil) {
    const nome = moodle?.aluno?.nome || portal?.perfil?.nome || "Aluno";
    linhas.push(`# Dados do Aluno`);
    linhas.push(`- Nome: ${nome}`);
    if (portal?.perfil?.matricula) linhas.push(`- Matrícula: ${portal.perfil.matricula}`);
    if (portal?.perfil?.curso) linhas.push(`- Curso: ${portal.perfil.curso}`);
    if (portal?.perfil?.periodo) linhas.push(`- Período: ${portal.perfil.periodo}`);
  }

  // Cursos ativos
  if (moodle?.cursos?.length) {
    linhas.push(`\n# Disciplinas Matriculadas (${moodle.cursos.length} disciplinas)`);
    moodle.cursos.forEach((c) => {
      linhas.push(`\n## ${c.nome}`);
      if (c.progresso !== null) linhas.push(`- Progresso: ${c.progresso?.toFixed(0)}%`);

      // Tarefas pendentes (prazo futuro)
      const agora = Math.floor(Date.now() / 1000);
      const tarefasPendentes = c.tarefas?.filter(
        (t) => t.prazoTimestamp && t.prazoTimestamp > agora
      );

      if (tarefasPendentes?.length) {
        linhas.push(`- Tarefas pendentes:`);
        tarefasPendentes.forEach((t) => {
          linhas.push(`  • ${t.nome} — prazo: ${t.prazo}`);
        });
      }

      // Notas
      const notasReais = c.notas?.filter((n) => n.nota !== null);
      if (notasReais?.length) {
        linhas.push(`- Notas:`);
        notasReais.forEach((n) => {
          linhas.push(`  • ${n.item}: ${n.notaFormatada}`);
        });
      }

      // Avisos do curso
      if (c.avisos?.length) {
        linhas.push(`- Últimos avisos:`);
        c.avisos.slice(0, 3).forEach((a) => {
          linhas.push(`  • [${a.data}] ${a.titulo}`);
        });
      }
    });
  }

  // Eventos próximos
  if (moodle?.eventosProximos?.length) {
    linhas.push(`\n# Eventos e Prazos Próximos (30 dias)`);
    moodle.eventosProximos
      .sort((a, b) => a.dataTimestamp - b.dataTimestamp)
      .slice(0, 10)
      .forEach((e) => {
        linhas.push(`- ${e.data}: ${e.nome}`);
      });
  }

  // Avisos do Portal
  if (portal?.avisos?.length) {
    linhas.push(`\n# Avisos Institucionais (Portal)`);
    portal.avisos.slice(0, 5).forEach((a) => {
      if (a.titulo) linhas.push(`- [${a.data || "sem data"}] ${a.titulo}`);
      if (a.descricao && a.descricao !== a.titulo) {
        linhas.push(`  ${a.descricao.slice(0, 150)}...`);
      }
    });
  }

  // Horário
  if (portal?.horarios?.length) {
    linhas.push(`\n# Horário de Aulas`);
    portal.horarios.slice(0, 20).forEach((h) => linhas.push(`- ${h}`));
  }

  if (linhas.length === 0) {
    return "Nenhum dado acadêmico disponível no momento.";
  }

  return linhas.join("\n");
}

// ─── Start ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`\n🎓 MAGNED Integration Server rodando em http://localhost:${PORT}`);
  console.log(`\nEndpoints disponíveis:`);
  console.log(`  POST /auth                    — autentica em ambas as plataformas`);
  console.log(`  GET  /ava/all?matricula=XXX   — dados completos do Moodle/AVA`);
  console.log(`  GET  /portal/all?matricula=XXX— dados do Portal do Aluno`);
  console.log(`  GET  /magned/contexto?matricula=XXX — contexto consolidado para o Claude\n`);
});

module.exports = app;
