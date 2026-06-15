/**
 * MAGNED — Integração com Claude API
 *
 * Este módulo mostra como o MAGNED deve:
 * 1. Buscar o contexto acadêmico do aluno
 * 2. Injetar no system prompt do Claude
 * 3. Responder perguntas sobre a vida acadêmica do aluno
 *
 * Uso: node magnedClaude.js
 */

const axios = require("axios");

const INTEGRATION_SERVER = process.env.MAGNED_SERVER || "http://localhost:3333";
const CLAUDE_API = "https://api.anthropic.com/v1/messages";

/**
 * Busca contexto acadêmico consolidado do aluno.
 */
async function getContextoAluno(matricula) {
  const res = await axios.get(`${INTEGRATION_SERVER}/magned/contexto`, {
    params: { matricula },
    timeout: 60000, // Portal scraping pode demorar
  });
  return res.data.contextoParaClaude;
}

/**
 * Envia mensagem ao Claude com contexto acadêmico injetado.
 */
async function chatMagned({ matricula, mensagem, historico = [] }) {
  // 1. Puxa dados atuais do aluno
  let contextoAcademico = "";
  try {
    contextoAcademico = await getContextoAluno(matricula);
  } catch (err) {
    contextoAcademico = "⚠️ Não foi possível carregar dados acadêmicos agora. " + err.message;
  }

  // 2. Monta system prompt com contexto injetado
  const systemPrompt = `Você é o MAGNED, assistente acadêmico inteligente da UniEVANGÉLICA integrado ao Portal do Aluno e ao AVA (Moodle).

Você tem acesso aos dados acadêmicos ATUAIS do aluno, coletados agora mesmo das plataformas:

${contextoAcademico}

---

Com base nesses dados, responda as dúvidas do aluno de forma clara e útil.
- Se perguntarem sobre prazos, consulte as tarefas pendentes acima.
- Se perguntarem sobre notas, use os dados de notas das disciplinas.
- Se perguntarem sobre avisos ou eventos, cite os dados acima.
- Se não tiver a informação, diga que não encontrou nos dados disponíveis.
- Sempre seja direto e objetivo. Não invente dados que não estão acima.
- Quando relevante, mencione a data de coleta dos dados para o aluno saber se estão atualizados.`;

  // 3. Chama Claude API
  const response = await fetch(CLAUDE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        ...historico,
        { role: "user", content: mensagem },
      ],
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Claude API: ${data.error.message}`);
  }

  return {
    resposta: data.content[0]?.text ?? "",
    tokens: data.usage,
  };
}

// ─── Exemplo de uso ──────────────────────────────────────────────────────────

async function exemploDeUso() {
  const matricula = process.env.MATRICULA || "2024001234";

  // Primeiro: autenticar (só precisa fazer uma vez por sessão)
  console.log("1. Autenticando...");
  await axios.post(`${INTEGRATION_SERVER}/auth`, {
    matricula,
    senha: process.env.SENHA_PORTAL || "suasenha",
  });

  // Segundo: conversar com o MAGNED
  const perguntas = [
    "Quais são minhas tarefas pendentes esta semana?",
    "Como estão minhas notas até agora?",
    "Tem algum aviso importante da faculdade?",
  ];

  for (const pergunta of perguntas) {
    console.log(`\n👨‍🎓 Aluno: ${pergunta}`);
    const { resposta } = await chatMagned({ matricula, mensagem: pergunta });
    console.log(`🤖 MAGNED: ${resposta}`);
  }
}

// Roda o exemplo se executado diretamente
if (require.main === module) {
  exemploDeUso().catch(console.error);
}

module.exports = { chatMagned, getContextoAluno };
