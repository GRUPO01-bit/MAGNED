/**
 * MAGNED — Integração Moodle REST API
 * Plataforma: avagrad.unievangelica.edu.br
 *
 * Como obter o token:
 *   1. Faça login no AVA
 *   2. Acesse: /login/token.php?username=SEU_LOGIN&password=SUA_SENHA&service=moodle_mobile_app
 *   3. Cole o token retornado no .env como MOODLE_TOKEN
 *
 * Ou use authenticateAndGetToken() abaixo para automatizar via credenciais.
 */

const axios = require("axios");

const MOODLE_BASE = "https://avagrad.unievangelica.edu.br";
const MOODLE_API = `${MOODLE_BASE}/webservice/rest/server.php`;

/**
 * Obtém token Moodle automaticamente via credenciais do aluno.
 * Guarda o token em memória — não precisa ser refeito a cada chamada.
 */
async function authenticateAndGetToken(username, password) {
  try {
    const res = await axios.get(`${MOODLE_BASE}/login/token.php`, {
      params: {
        username,
        password,
        service: "moodle_mobile_app",
      },
      timeout: 10000,
    });

    if (res.data.error) {
      throw new Error(`Moodle auth error: ${res.data.error}`);
    }

    return res.data.token;
  } catch (err) {
    throw new Error(`Falha ao autenticar no Moodle: ${err.message}`);
  }
}

/**
 * Chamada genérica à API REST do Moodle.
 */
async function moodleCall(token, wsfunction, params = {}) {
  const res = await axios.post(
    MOODLE_API,
    new URLSearchParams({
      wstoken: token,
      wsfunction,
      moodlewsrestformat: "json",
      ...params,
    }),
    { timeout: 15000 }
  );

  if (res.data.exception) {
    throw new Error(`Moodle API [${wsfunction}]: ${res.data.message}`);
  }

  return res.data;
}

/**
 * Retorna informações do aluno logado.
 */
async function getSiteInfo(token) {
  return moodleCall(token, "core_webservice_get_site_info");
}

/**
 * Retorna todos os cursos em que o aluno está matriculado.
 */
async function getEnrolledCourses(token, userId) {
  const courses = await moodleCall(token, "core_enrol_get_users_courses", {
    userid: userId,
  });

  return courses.map((c) => ({
    id: c.id,
    nome: c.fullname,
    nomeAbreviado: c.shortname,
    progresso: c.progress ?? null,
    dataInicio: c.startdate ? new Date(c.startdate * 1000).toLocaleDateString("pt-BR") : null,
    dataFim: c.enddate ? new Date(c.enddate * 1000).toLocaleDateString("pt-BR") : null,
    visivel: c.visible === 1,
  }));
}

/**
 * Retorna tarefas de um curso específico.
 */
async function getCourseAssignments(token, courseId) {
  const data = await moodleCall(token, "mod_assign_get_assignments", {
    "courseids[0]": courseId,
  });

  if (!data.courses || data.courses.length === 0) return [];

  return data.courses[0].assignments.map((a) => ({
    id: a.id,
    nome: a.name,
    descricao: a.intro?.replace(/<[^>]+>/g, "") ?? "",
    prazo: a.duedate ? new Date(a.duedate * 1000).toLocaleString("pt-BR") : "Sem prazo",
    prazoTimestamp: a.duedate,
    entregaAberta: a.allowsubmissionsfromdate
      ? new Date(a.allowsubmissionsfromdate * 1000).toLocaleString("pt-BR")
      : null,
    notaMaxima: a.grade,
  }));
}

/**
 * Retorna notas do aluno em um curso.
 */
async function getCourseGrades(token, courseId, userId) {
  const data = await moodleCall(token, "gradereport_user_get_grade_items", {
    courseid: courseId,
    userid: userId,
  });

  if (!data.usergrades || data.usergrades.length === 0) return [];

  return data.usergrades[0].gradeitems.map((g) => ({
    item: g.itemname ?? "Total do curso",
    nota: g.graderaw ?? null,
    notaFormatada: g.gradeformatted ?? "-",
    notaMinima: g.grademin,
    notaMaxima: g.grademax,
    feedback: g.feedback?.replace(/<[^>]+>/g, "") ?? "",
  }));
}

/**
 * Retorna avisos/notícias dos fóruns de notícias de todos os cursos.
 */
async function getCourseAnnouncements(token, courseId) {
  // Pega os fóruns do curso
  const forums = await moodleCall(token, "mod_forum_get_forums_by_courses", {
    "courseids[0]": courseId,
  });

  const newsForum = forums.find(
    (f) => f.type === "news" || f.name?.toLowerCase().includes("aviso") || f.name?.toLowerCase().includes("notícia")
  );

  if (!newsForum) return [];

  const discussions = await moodleCall(token, "mod_forum_get_forum_discussions", {
    forumid: newsForum.id,
    page: 0,
    perpage: 10,
  });

  return (discussions.discussions || []).map((d) => ({
    id: d.id,
    titulo: d.name,
    mensagem: d.message?.replace(/<[^>]+>/g, "").slice(0, 300) ?? "",
    autor: d.userfullname,
    data: new Date(d.timemodified * 1000).toLocaleDateString("pt-BR"),
  }));
}

/**
 * Retorna eventos/calendário próximos do aluno.
 */
async function getUpcomingEvents(token) {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDays = now + 30 * 24 * 60 * 60;

  const data = await moodleCall(token, "core_calendar_get_calendar_events", {
    "options[timestart]": now,
    "options[timeend]": thirtyDays,
    "options[limitnum]": 20,
  });

  return (data.events || []).map((e) => ({
    id: e.id,
    nome: e.name,
    descricao: e.description?.replace(/<[^>]+>/g, "").slice(0, 200) ?? "",
    data: new Date(e.timestart * 1000).toLocaleString("pt-BR"),
    dataTimestamp: e.timestart,
    tipo: e.eventtype,
    cursoId: e.courseid ?? null,
  }));
}

/**
 * Coleta TUDO de uma vez: cursos, tarefas, notas, avisos, eventos.
 * Esse é o método principal chamado pelo MAGNED.
 */
async function getAllStudentData(token) {
  const siteInfo = await getSiteInfo(token);
  const userId = siteInfo.userid;

  const courses = await getEnrolledCourses(token, userId);

  // Busca paralela de dados por curso
  const courseDetails = await Promise.allSettled(
    courses.map(async (course) => {
      const [assignments, grades, announcements] = await Promise.allSettled([
        getCourseAssignments(token, course.id),
        getCourseGrades(token, course.id, userId),
        getCourseAnnouncements(token, course.id),
      ]);

      return {
        ...course,
        tarefas: assignments.status === "fulfilled" ? assignments.value : [],
        notas: grades.status === "fulfilled" ? grades.value : [],
        avisos: announcements.status === "fulfilled" ? announcements.value : [],
      };
    })
  );

  const upcomingEvents = await getUpcomingEvents(token).catch(() => []);

  return {
    aluno: {
      id: userId,
      nome: siteInfo.fullname,
      site: siteInfo.siteurl,
      coletadoEm: new Date().toLocaleString("pt-BR"),
    },
    cursos: courseDetails
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value),
    eventosProximos: upcomingEvents,
  };
}

module.exports = {
  authenticateAndGetToken,
  getSiteInfo,
  getEnrolledCourses,
  getCourseAssignments,
  getCourseGrades,
  getCourseAnnouncements,
  getUpcomingEvents,
  getAllStudentData,
};
