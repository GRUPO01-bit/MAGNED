// ═══════════════════════════════════════════════════════════════
// MAGNED Neural AI Engine v4.0 — 100% Offline, Zero API Keys
// Motor Cognitivo Avançado com NLP Local e Análise Acadêmica
// ═══════════════════════════════════════════════════════════════

class MagnedAI {
  constructor(getState) {
    this._getState = getState;
    this.memory = [];
    this.sessionTopics = [];
    this._quizBank = this._buildQuizBank();
  }

  get S() { return this._getState(); }

  // ═══ MAIN ENTRY POINT ═══
  async generateResponse(userText) {
    const text = userText.trim();
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const intent = this._classify(lower, text);
    let response = '';

    try {
      response = this._dispatch(intent, lower, text);
    } catch (e) {
      response = this._fallback(text);
    }

    this.memory.push({ role: 'user', text, ts: Date.now() });
    this.memory.push({ role: 'assistant', text: response, ts: Date.now() });
    if (this.memory.length > 60) this.memory.splice(0, 2);

    return response;
  }

  // ═══ INTENT CLASSIFIER ═══
  _classify(lower, raw) {
    const patterns = [
      { intent: 'lyceum_grades',  keys: ['nota','media','média','boletim','lyceum','n1','n2','aprovad','reprovad','desempenho academ'] },
      { intent: 'lyceum_faltas',  keys: ['falta','frequencia','frequência','presença','ausencia','ausência'] },
      { intent: 'lyceum_risco',   keys: ['risco','reprova','recupera','perigo','situação academ','critico','crítico'] },
      { intent: 'ava_eventos',    keys: ['prova','entrega','prazo','deadline','agenda','evento','calendario','calendário','pendente','proxim'] },
      { intent: 'study_plan',     keys: ['cronograma','plano de estudo','rotina','organiz','semana','planej'] },
      { intent: 'quiz',           keys: ['quiz','questão','questao','questões','questoes','simulado','teste','avalia','exercicio','exercício'] },
      { intent: 'flashcard',      keys: ['flashcard','flash card','cartão','cartao','p:/r:','p: ','r: '] },
      { intent: 'mind_map',       keys: ['mapa mental','mapa conceitual','arvore','árvore','diagrama','esquema'] },
      { intent: 'resumo',         keys: ['resum','sintetiz','compil','sumar'] },
      { intent: 'explicacao',     keys: ['explic','como funciona','o que é','o que e','defin','ensina','entend','aprend','básico','basico','avançado','avancado','passo a passo'] },
      { intent: 'pomodoro',       keys: ['pomodoro','foco','concentr','produtiv','timer','sessão de estudo','sessao de estudo'] },
      { intent: 'motivacao',      keys: ['motiv','inspir','desist','cansar','cansad','desmotiv','triste','ansiedad','ansios','nervo','difícil','dificil'] },
      { intent: 'tcc',            keys: ['tcc','monografia','abnt','citação','citacao','referência','referencia','metodologia','fundamentação','fundamentacao'] },
      { intent: 'programacao',    keys: ['python','javascript','java','sql','html','css','codigo','código','programação','programacao','algoritmo','função','funcao','variável','variavel','loop','array','lista','dicionario','dicionário','classe','objeto','herança','heranca','polimorfismo','api','rest','backend','frontend'] },
      { intent: 'matematica',     keys: ['matemat','calculo','cálculo','derivada','integral','equação','equacao','algebra','álgebra','geometria','trigonometria','logaritmo','matriz','determinante','probabilidade','estatistica','estatística'] },
      { intent: 'dados',          keys: ['banco de dados','database','sql','nosql','mongodb','postgresql','mysql','pipeline','etl','data','big data','dado','tabela','query','consulta','select','insert','join'] },
      { intent: 'ia_ml',          keys: ['inteligência artificial','inteligencia artificial','machine learning','deep learning','rede neural','neural network','ia ','aprendizado de maquina','nlp','processamento de linguagem','modelo','treinam','dataset','overfitting','underfitting','classificação','classificacao','regressão','regressao'] },
      { intent: 'infra',          keys: ['infraestrutura','rede','tcp','ip','servidor','cloud','nuvem','docker','kubernetes','linux','windows server','firewall','dns','http','protocolo','segurança','seguranca'] },
      { intent: 'greeting',       keys: ['oi','ola','olá','hey','bom dia','boa tarde','boa noite','eai','e ai','fala','salve'] },
      { intent: 'identity',       keys: ['quem é você','quem e voce','seu nome','o que você é','o que voce e','quem te criou','criador','desenvolvedor'] },
      { intent: 'thanks',         keys: ['obrigado','obrigada','obg','valeu','agradec','vlw','thanks'] },
      { intent: 'help',           keys: ['ajuda','help','comandos','o que você faz','o que voce faz','funcionalidade','recurso','menu'] },
      { intent: 'joke',           keys: ['piada','engraçado','engracado','rir','humor','joke'] },
    ];

    for (const p of patterns) {
      for (const k of p.keys) {
        if (lower.includes(k)) return p.intent;
      }
    }
    return 'general';
  }

  // ═══ DISPATCHER ═══
  _dispatch(intent, lower, raw) {
    const fn = {
      lyceum_grades: () => this._lyceumGrades(),
      lyceum_faltas: () => this._lyceumFaltas(),
      lyceum_risco:  () => this._lyceumRisco(),
      ava_eventos:   () => this._avaEventos(),
      study_plan:    () => this._studyPlan(),
      quiz:          () => this._quiz(lower),
      flashcard:     () => this._flashcards(lower),
      mind_map:      () => this._mindMap(lower),
      resumo:        () => this._resumo(lower),
      explicacao:    () => this._explicacao(lower, raw),
      pomodoro:      () => this._pomodoroAdvice(),
      motivacao:     () => this._motivacao(),
      tcc:           () => this._tcc(lower),
      programacao:   () => this._programacao(lower),
      matematica:    () => this._matematica(lower),
      dados:         () => this._dados(lower),
      ia_ml:         () => this._iaML(lower),
      infra:         () => this._infra(lower),
      greeting:      () => this._greeting(),
      identity:      () => this._identity(),
      thanks:        () => this._thanks(),
      help:          () => this._help(),
      joke:          () => this._joke(),
      general:       () => this._general(raw),
    }[intent];
    return fn ? fn() : this._general(raw);
  }

  // ═══ HELPERS ═══
  _nome() { return (this.S.name || 'Estudante').split(' ')[0]; }
  _tutor() { return this.S.tutor || 'MAGNED'; }
  _materia() { return this.S.subject || 'Estudo Geral'; }
  _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  _lyData() { return this.S.lyceumData || []; }
  _events() { return this.S.events || []; }

  _getMediaColor(val) {
    if (val >= 7) return '🟢';
    if (val >= 5) return '🟡';
    return '🔴';
  }

  _upcomingEvents(days = 14) {
    const now = new Date();
    return this._events()
      .map(e => ({ ...e, d: new Date(e.date + 'T' + (e.time || '23:59')) }))
      .filter(e => e.d >= now && (e.d - now) < days * 86400000)
      .sort((a, b) => a.d - b.d);
  }

  _weakSubjects() {
    return this._lyData().filter(d => {
      if (d.n1 !== null && d.n1 < 5) return true;
      if (d.n2 !== null && d.n2 < 5) return true;
      if (d.totalAulas > 0 && (d.faltas / d.totalAulas) >= 0.20) return true;
      return false;
    });
  }

  // ═══ RESPONSE HANDLERS ═══

  _greeting() {
    const nome = this._nome();
    const hour = new Date().getHours();
    const period = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const weak = this._weakSubjects();
    let extra = '';
    if (weak.length > 0) {
      extra = `\n\n⚠️ **Alerta Acadêmico:** Detectei ${weak.length} disciplina(s) que precisam de atenção. Digite "risco" para ver detalhes.`;
    }
    const upcoming = this._upcomingEvents(3);
    if (upcoming.length > 0) {
      extra += `\n\n📅 **Próximo evento:** ${upcoming[0].title} em ${upcoming[0].date}${upcoming[0].time ? ' às ' + upcoming[0].time : ''}.`;
    }
    return this._pick([
      `${period}, **${nome}**! 👋 Sou o MAGNED, seu assistente acadêmico com IA Neural integrada ao **AVA** e **Lyceum**.\n\nComo **${this._tutor()}**, posso te ajudar com:\n- 📋 Análise do seu **boletim do Lyceum** (digite "notas")\n- 📅 **Eventos e prazos** do AVA (digite "agenda")\n- 📝 **Quizzes**, **flashcards** e **resumos** personalizados\n- 🧠 **Mapas mentais** e **planos de estudo**\n- 📷 **OCR** — envie uma foto de exercício para resolução\n\nQual matéria vamos estudar hoje?${extra}`,
      `${period}, **${nome}**! 🧠 Motor Neural ativo e pronto.\n\nEstou conectado ao seu perfil acadêmico do **Lyceum** e aos eventos do **AVA**. Tenho acesso às suas notas, faltas e prazos em tempo real.\n\nUse os atalhos rápidos abaixo ou me pergunte qualquer coisa sobre suas matérias!${extra}`,
    ]);
  }

  _identity() {
    return `Eu sou o **MAGNED** — *Módulo Avançado de Gestão Neural e Execução de Dados*. 🧠\n\nFui desenvolvido pelo **Grupo 01** (Augusto César, Eduardo Felipe, Gabriel de Freitas, Marcel Eduardo e Nicolas Vinícius) como uma plataforma acadêmica inteligente da **UniEVANGÉLICA**.\n\n**Minhas capacidades:**\n- 🤖 Motor de IA Neural com NLP avançado\n- 📋 Integração com **Lyceum** (notas, faltas, média)\n- 📅 Integração com **AVA/Moodle** (eventos, prazos)\n- 👁️ **OCR** — resolução de exercícios por foto\n- 😊 **Login facial** com reconhecimento biométrico\n- 📇 Geração de **flashcards**, **quizzes** e **simulados**\n- 🧠 **Mapas mentais** e **planos de estudo** personalizados\n- 🍅 **Pomodoro** integrado com gamificação\n- ☁️ Sincronização em nuvem via **Firebase**\n- 📱 **PWA** — funciona offline instalado no celular\n\nArquitetura: **Client-Centric Hybrid** com motor Neural offline-first.`;
  }

  _thanks() {
    return this._pick([
      `De nada, **${this._nome()}**! 😊 Estou aqui pra isso. Se precisar de mais ajuda com **${this._materia()}**, é só chamar!`,
      `Por nada! 🤝 Lembre-se: cada pergunta é um passo a mais rumo à aprovação. Continue assim, **${this._nome()}**!`,
      `Disponha, **${this._nome()}**! Se quiser, posso gerar um **quiz** ou **flashcards** para fixar o conteúdo. Basta pedir!`,
    ]);
  }

  _help() {
    return `**📖 Central de Ajuda — MAGNED AI**\n\nVocê pode me pedir qualquer coisa! Aqui estão os principais comandos:\n\n**📋 Acadêmico:**\n- "minhas notas" → Boletim completo do Lyceum\n- "minhas faltas" → Frequência detalhada\n- "risco de reprovação" → Análise de disciplinas críticas\n- "minha agenda" → Próximos eventos do AVA\n\n**📝 Estudo:**\n- "quiz de [matéria]" → Questões de múltipla escolha\n- "flashcards de [matéria]" → Cartões de estudo P:/R:\n- "resumo de [matéria]" → Síntese do conteúdo\n- "mapa mental de [matéria]" → Diagrama visual\n- "plano de estudos" → Cronograma semanal\n\n**🤖 Conteúdo:**\n- Pergunte sobre **Python, Java, SQL, IA, Matemática, Redes...**\n- "explique [tema]" → Explicação detalhada\n- "do básico ao avançado" → Progressão completa\n\n**🛠️ Ferramentas:**\n- 📷 Envie uma **foto** → OCR + resolução do exercício\n- 🍅 "pomodoro" → Dicas de foco e produtividade\n- 💪 "motivação" → Mensagem motivacional\n\n**👨‍🏫 Tutores:**\nSelecione um tutor na aba lateral para mudar a persona da IA!`;
  }

  _joke() {
    return this._pick([
      `Aqui vai, **${this._nome()}**! 😂\n\n> Por que o programador precisou de óculos?\n> Porque ele não conseguia enxergar o **C#**! (C Sharp... entendeu? 😅)\n\nAgora volta a estudar! 📚`,
      `Uma pra rir:\n\n> — Professor, o que é um "loop infinito"?\n> — É quando o aluno estuda na véspera, tira nota baixa, promete que vai estudar antes, e repete tudo de novo. 🔄😂\n\nNão seja esse aluno, **${this._nome()}**!`,
      `Essa é boa:\n\n> SQL e NoSQL entraram num bar.\n> SQL sentou numa mesa.\n> NoSQL sentou no chão, na parede, no teto...\n> Porque não segue schema nenhum. 😂\n\nBora estudar banco de dados?`,
      `Pra descontrair:\n\n> — O que o Java disse pro JavaScript?\n> — "Você não tem nada a ver comigo, só copiou meu nome!" 😤\n\nAmbos são ótimos. Agora, quer um quiz sobre algum deles?`,
    ]);
  }

  // ═══ LYCEUM HANDLERS ═══

  _lyceumGrades() {
    const data = this._lyData();
    if (!data.length) return '📋 **Lyceum:** Nenhum dado de notas encontrado. Cadastre suas disciplinas na aba **Clássicas > Lyceum**.';

    let r = `**📋 Boletim Acadêmico — Lyceum**\n*Aluno: ${this.S.name} | RA: ${this.S.ra || 'N/I'} | Curso: ${this.S.course}*\n\n`;
    r += `| Disciplina | N1 | N2 | Média | Status |\n|---|---|---|---|---|\n`;

    let totalMedia = 0, countMedia = 0;
    data.forEach(d => {
      const n1 = d.n1 !== null ? d.n1.toFixed(1) : '—';
      const n2 = d.n2 !== null ? d.n2.toFixed(1) : '—';
      const media = (d.n1 !== null && d.n2 !== null) ? ((d.n1 + d.n2) / 2) : null;
      const mediaStr = media !== null ? media.toFixed(1) : '—';
      const icon = media !== null ? this._getMediaColor(media) : '⚪';
      const status = media !== null ? (media >= 7 ? '✅ Aprovado' : media >= 5 ? '⚠️ Recuperação' : '❌ Reprovado') : '🔵 Cursando';
      r += `| ${d.disc} | ${n1} | ${n2} | ${icon} ${mediaStr} | ${status} |\n`;
      if (media !== null) { totalMedia += media; countMedia++; }
    });

    if (countMedia > 0) {
      const geral = (totalMedia / countMedia).toFixed(1);
      r += `\n**📊 Média Geral: ${this._getMediaColor(parseFloat(geral))} ${geral}**\n`;
    }

    // Intelligent analysis
    const weak = data.filter(d => (d.n1 !== null && d.n1 < 5) || (d.n2 !== null && d.n2 < 5));
    const strong = data.filter(d => (d.n1 !== null && d.n1 >= 8) || (d.n2 !== null && d.n2 >= 8));

    if (weak.length > 0) {
      r += `\n⚠️ **Atenção:** ${weak.map(d => `**${d.disc}**`).join(', ')} ${weak.length > 1 ? 'precisam' : 'precisa'} de reforço urgente.\n`;
    }
    if (strong.length > 0) {
      r += `\n🌟 **Destaque:** Excelente desempenho em ${strong.map(d => `**${d.disc}**`).join(', ')}!\n`;
    }

    r += `\n> 💡 Digite "plano de estudos" para um cronograma personalizado baseado nessas notas.`;
    return r;
  }

  _lyceumFaltas() {
    const data = this._lyData();
    if (!data.length) return '📋 Nenhum dado de frequência encontrado.';

    let r = `**📊 Relatório de Frequência — Lyceum**\n*Limite de faltas: 25% da carga horária*\n\n`;

    data.forEach(d => {
      const pct = d.totalAulas > 0 ? ((d.faltas / d.totalAulas) * 100) : 0;
      const maxFaltas = Math.floor(d.totalAulas * 0.25);
      const restantes = Math.max(0, maxFaltas - d.faltas);
      const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(Math.max(0, 20 - Math.round(pct / 5)));
      const icon = pct >= 25 ? '🔴' : pct >= 15 ? '🟡' : '🟢';

      r += `**${d.disc}** (${d.prof})\n`;
      r += `${icon} ${bar} ${pct.toFixed(0)}% — ${d.faltas}/${d.totalAulas} aulas\n`;
      if (pct >= 25) {
        r += `⛔ **LIMITE EXCEDIDO!** Risco de reprovação por falta.\n`;
      } else if (pct >= 15) {
        r += `⚠️ Cuidado! Restam apenas **${restantes}** faltas possíveis.\n`;
      } else {
        r += `✅ Situação regular. Restam **${restantes}** faltas possíveis.\n`;
      }
      r += '\n';
    });

    return r;
  }

  _lyceumRisco() {
    const data = this._lyData();
    if (!data.length) return '📋 Nenhum dado do Lyceum para análise de risco.';

    const riscos = [];
    data.forEach(d => {
      const media = (d.n1 !== null && d.n2 !== null) ? (d.n1 + d.n2) / 2 : null;
      const pctFalta = d.totalAulas > 0 ? (d.faltas / d.totalAulas) * 100 : 0;
      const problems = [];

      if (media !== null && media < 5) problems.push(`Média **${media.toFixed(1)}** (abaixo de 5.0)`);
      else if (d.n1 !== null && d.n1 < 5) problems.push(`N1 = **${d.n1}** — nota baixa`);
      if (pctFalta >= 25) problems.push(`**${pctFalta.toFixed(0)}%** de faltas (limite: 25%)`);
      else if (pctFalta >= 20) problems.push(`**${pctFalta.toFixed(0)}%** de faltas (próximo do limite)`);

      if (problems.length > 0) {
        riscos.push({ disc: d.disc, prof: d.prof, problems });
      }
    });

    if (riscos.length === 0) {
      return `✅ **Parabéns, ${this._nome()}!** Nenhuma disciplina em situação de risco no momento.\n\nSuas notas e frequência estão dentro dos limites. Continue assim! 💪\n\n> 💡 Quer um plano de estudos para manter esse desempenho? Digite "plano de estudos".`;
    }

    let r = `🚨 **Análise de Risco Acadêmico — ${this._nome()}**\n\n`;
    r += `Detectei **${riscos.length}** disciplina(s) com alerta:\n\n`;

    riscos.forEach((ri, i) => {
      r += `### ${i + 1}. ${ri.disc}\n*Professor: ${ri.prof}*\n\n`;
      ri.problems.forEach(p => r += `- ⚠️ ${p}\n`);
      r += '\n';
    });

    r += `---\n\n**🛠️ Plano de Recuperação Sugerido:**\n\n`;
    riscos.forEach(ri => {
      r += `**${ri.disc}:**\n`;
      r += `- Dedique pelo menos **2 horas extras** por semana a esta matéria\n`;
      r += `- Procure o professor **${ri.prof}** para monitoria\n`;
      r += `- Use os **flashcards** e **quizzes** do MAGNED para fixação\n\n`;
    });

    r += `> 🎯 Digite "plano de estudos" para um cronograma focado nas disciplinas em risco.`;
    return r;
  }

  // ═══ AVA / CALENDAR ═══

  _avaEventos() {
    const upcoming = this._upcomingEvents(30);
    if (!upcoming.length) {
      return `📅 **Agenda AVA:** Nenhum evento cadastrado nos próximos 30 dias.\n\nVocê pode:\n- **Importar** um arquivo .ics do AVA/Google Calendar na aba Agenda\n- **Adicionar** eventos manualmente\n\n> 💡 Mantenha sua agenda sincronizada para alertas automáticos!`;
    }

    let r = `**📅 Agenda Acadêmica — AVA**\n*${upcoming.length} evento(s) próximo(s)*\n\n`;
    const catEmoji = { prova: '🧪', trabalho: '📝', aula: '📚', pessoal: '⭐' };
    const now = new Date();

    upcoming.forEach(ev => {
      const dias = Math.ceil((ev.d - now) / 86400000);
      const urgencia = dias <= 1 ? '🔴 **HOJE/AMANHÃ**' : dias <= 3 ? '🟠 **URGENTE**' : dias <= 7 ? '🟡 Esta semana' : '🟢 Próxima semana+';
      r += `${catEmoji[ev.cat] || '📌'} **${ev.title}**\n`;
      r += `   📆 ${ev.date} ${ev.time ? '⏰ ' + ev.time : ''} — ${urgencia} (${dias} dia${dias !== 1 ? 's' : ''})\n\n`;
    });

    const provas = upcoming.filter(e => e.cat === 'prova');
    if (provas.length > 0) {
      r += `---\n\n🧪 **${provas.length} prova(s) se aproximando!** Quer que eu gere um quiz de preparação? Digite "quiz".`;
    }

    return r;
  }

  // ═══ STUDY PLAN ═══

  _studyPlan() {
    const nome = this._nome();
    const data = this._lyData();
    const upcoming = this._upcomingEvents(14);

    let r = `**📅 Plano de Estudos Personalizado — ${nome}**\n*Gerado com base no seu Lyceum e Agenda AVA*\n\n`;

    // Prioritize weak subjects
    const weak = this._weakSubjects();
    if (weak.length > 0) {
      r += `⚠️ **Disciplinas prioritárias** (nota baixa ou muitas faltas):\n`;
      weak.forEach(d => r += `- 🔴 **${d.disc}** — necessita atenção redobrada\n`);
      r += '\n';
    }

    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const subjects = data.length > 0 ? data : [
      { disc: 'Matemática' }, { disc: 'Programação' }, { disc: 'Banco de Dados' },
      { disc: 'Engenharia de Software' }, { disc: 'IA' }, { disc: 'Revisão Geral' }
    ];

    r += `### 📋 Cronograma Semanal\n\n`;
    days.forEach((day, i) => {
      const subj = subjects[i % subjects.length];
      const isWeak = weak.some(w => w.disc === subj.disc);
      const time = isWeak ? '2.5h' : '1.5h';
      const extra = isWeak ? ' ⚠️ **Reforço**' : '';
      r += `**${day}:**\n`;
      r += `- 📖 ${subj.disc} (${time})${extra}\n`;
      r += `- 📝 Exercícios práticos (30min)\n`;
      if (i === 4) r += `- 📇 Revisão com Flashcards (30min)\n`;
      if (i === 5) r += `- 🧪 Simulado completo (1h)\n`;
      r += '\n';
    });

    // Upcoming events warning
    if (upcoming.length > 0) {
      r += `### ⏰ Ajustes pela Agenda\n\n`;
      upcoming.forEach(ev => {
        const dias = Math.ceil((ev.d - new Date()) / 86400000);
        if (ev.cat === 'prova' && dias <= 7) {
          r += `- 🧪 **${ev.title}** em ${dias} dia(s) → Intensifique a revisão!\n`;
        }
        if (ev.cat === 'trabalho' && dias <= 5) {
          r += `- 📝 **${ev.title}** em ${dias} dia(s) → Reserve tempo para finalização!\n`;
        }
      });
    }

    r += `\n> 🍅 Use o **Timer Pomodoro** (25min foco + 5min pausa) para máxima produtividade!`;
    return r;
  }

  // ═══ QUIZ ═══

  _quiz(lower) {
    const topic = this._detectTopic(lower);
    const questions = this._quizBank[topic] || this._quizBank['geral'];
    const selected = this._shuffleArray([...questions]).slice(0, 5);

    let r = `**⚡ Quiz — ${topic.charAt(0).toUpperCase() + topic.slice(1)}**\n*${selected.length} questões geradas para ${this._nome()}*\n\n`;

    selected.forEach((q, i) => {
      r += `**Q${i + 1}.** ${q.q}\n`;
      q.opts.forEach((opt, j) => {
        const letter = String.fromCharCode(65 + j);
        const mark = j === q.correct ? ' ✅' : '';
        r += `**${letter})** ${opt}${mark}\n`;
      });
      r += `\n💡 *${q.explanation}*\n\n`;
      if (i < selected.length - 1) r += '---\n\n';
    });

    r += `\n**Resultado:** Tente responder antes de olhar as respostas marcadas com ✅!\n\n> 📇 Quer converter esse quiz em **flashcards**? Digite "flashcards".`;
    return r;
  }

  _buildQuizBank() {
    return {
      'python': [
        { q: 'Qual a função utilizada para imprimir algo na tela em Python?', opts: ['echo()', 'print()', 'console.log()', 'System.out.println()'], correct: 1, explanation: 'Em Python, print() é a função built-in para saída no console.' },
        { q: 'Qual tipo de dado NÃO existe nativamente em Python?', opts: ['list', 'tuple', 'array', 'dict'], correct: 2, explanation: 'Python não possui array nativo — usa-se list ou o módulo array.' },
        { q: 'O que faz a expressão `x = [i**2 for i in range(5)]`?', opts: ['Cria um dicionário', 'Gera uma list comprehension com quadrados de 0 a 4', 'Causa um erro de sintaxe', 'Cria uma tupla'], correct: 1, explanation: 'List comprehension gera [0, 1, 4, 9, 16].' },
        { q: 'Python é uma linguagem:', opts: ['Compilada e tipada estaticamente', 'Interpretada e tipada dinamicamente', 'Compilada e tipada dinamicamente', 'Interpretada e tipada estaticamente'], correct: 1, explanation: 'Python é interpretada com tipagem dinâmica.' },
        { q: 'Qual a diferença entre `==` e `is` em Python?', opts: ['São idênticos', '== compara valor, is compara identidade (memória)', '== compara tipo, is compara valor', 'is é mais rápido que =='], correct: 1, explanation: '== verifica igualdade de valor; is verifica se são o mesmo objeto.' },
      ],
      'banco de dados': [
        { q: 'Qual comando SQL é usado para buscar dados?', opts: ['INSERT', 'UPDATE', 'SELECT', 'CREATE'], correct: 2, explanation: 'SELECT é o comando DML para consultar dados em tabelas.' },
        { q: 'O que é uma chave primária (PRIMARY KEY)?', opts: ['Um campo opcional', 'Um identificador único para cada registro', 'Um tipo de índice secundário', 'Uma constraint de validação'], correct: 1, explanation: 'PRIMARY KEY identifica unicamente cada registro na tabela.' },
        { q: 'Qual a diferença entre SQL e NoSQL?', opts: ['SQL é mais moderno', 'SQL é relacional com schema rígido; NoSQL é flexível e não-relacional', 'NoSQL é sempre mais rápido', 'São a mesma tecnologia'], correct: 1, explanation: 'SQL (MySQL, PostgreSQL) usa tabelas; NoSQL (MongoDB, Redis) usa documentos/chaves.' },
        { q: 'O que é normalização de banco de dados?', opts: ['Deletar dados duplicados', 'Processo de organizar tabelas para reduzir redundância', 'Criar backups', 'Comprimir dados'], correct: 1, explanation: 'Normalização reduz redundância e dependências, organizando dados em formas normais (1NF, 2NF, 3NF).' },
        { q: 'Qual cláusula SQL filtra resultados APÓS um GROUP BY?', opts: ['WHERE', 'FILTER', 'HAVING', 'ORDER BY'], correct: 2, explanation: 'HAVING filtra grupos; WHERE filtra linhas individuais antes do agrupamento.' },
      ],
      'inteligencia artificial': [
        { q: 'O que é Machine Learning?', opts: ['Programação manual de regras', 'Subcampo da IA onde algoritmos aprendem padrões a partir de dados', 'Um tipo de hardware', 'Uma linguagem de programação'], correct: 1, explanation: 'ML permite que sistemas aprendam com dados sem programação explícita para cada tarefa.' },
        { q: 'O que é overfitting?', opts: ['Modelo muito simples', 'Modelo memoriza os dados de treino e falha em dados novos', 'Modelo muito rápido', 'Modelo sem dados'], correct: 1, explanation: 'Overfitting ocorre quando o modelo se ajusta demais aos dados de treinamento.' },
        { q: 'Qual é a principal diferença entre IA supervisionada e não-supervisionada?', opts: ['Velocidade', 'Supervisionada usa dados rotulados; não-supervisionada descobre padrões sozinha', 'Tamanho do dataset', 'Tipo de hardware'], correct: 1, explanation: 'Supervisionada treina com labels conhecidos; não-supervisionada encontra estruturas ocultas.' },
        { q: 'O que é uma Rede Neural Artificial?', opts: ['Um tipo de rede de computadores', 'Modelo computacional inspirado no cérebro humano com camadas de neurônios', 'Um protocolo de rede', 'Um banco de dados'], correct: 1, explanation: 'Redes neurais artificiais simulam conexões sinápticas com nós e pesos ajustáveis.' },
        { q: 'O que significa NLP?', opts: ['New Language Protocol', 'Natural Language Processing', 'Neural Logic Programming', 'Network Layer Protocol'], correct: 1, explanation: 'NLP (Processamento de Linguagem Natural) permite que máquinas entendam texto/fala humana.' },
      ],
      'matematica': [
        { q: 'Qual é a derivada de f(x) = x²?', opts: ['x', '2x', 'x²', '2'], correct: 1, explanation: 'Pela regra da potência: d/dx(xⁿ) = n·xⁿ⁻¹, logo d/dx(x²) = 2x.' },
        { q: 'O que é uma matriz identidade?', opts: ['Matriz com todos zeros', 'Matriz quadrada com 1s na diagonal e 0s no resto', 'Matriz 1x1', 'Matriz inversa'], correct: 1, explanation: 'A matriz identidade I tem 1 na diagonal principal e 0 nas demais posições.' },
        { q: 'Qual a integral de ∫2x dx?', opts: ['x', 'x² + C', '2x² + C', '2 + C'], correct: 1, explanation: 'Integrando 2x temos x² + C (constante de integração).' },
        { q: 'Em lógica proposicional, o que é uma tautologia?', opts: ['Uma contradição', 'Uma proposição sempre verdadeira', 'Uma variável livre', 'Uma negação'], correct: 1, explanation: 'Tautologia é uma fórmula que é verdadeira para todas as interpretações possíveis.' },
        { q: 'Qual o determinante da matriz [[1,2],[3,4]]?', opts: ['10', '-2', '2', '-10'], correct: 1, explanation: 'det = (1×4) - (2×3) = 4 - 6 = -2.' },
      ],
      'infraestrutura': [
        { q: 'O que é o modelo OSI?', opts: ['Um sistema operacional', 'Modelo de 7 camadas para comunicação em rede', 'Uma linguagem de programação', 'Um protocolo de segurança'], correct: 1, explanation: 'O modelo OSI define 7 camadas: Física, Enlace, Rede, Transporte, Sessão, Apresentação, Aplicação.' },
        { q: 'Qual protocolo opera na camada de transporte?', opts: ['HTTP', 'TCP', 'IP', 'Ethernet'], correct: 1, explanation: 'TCP opera na camada 4 (Transporte), garantindo entrega ordenada e confiável.' },
        { q: 'O que é Docker?', opts: ['Um sistema operacional', 'Uma plataforma de containerização de aplicações', 'Um banco de dados', 'Um protocolo de rede'], correct: 1, explanation: 'Docker empacota aplicações e dependências em containers isolados e portáveis.' },
        { q: 'O que é DNS?', opts: ['Data Network Security', 'Domain Name System — traduz nomes em IPs', 'Dynamic Node Switching', 'Distributed Network Storage'], correct: 1, explanation: 'DNS resolve nomes de domínio (ex: google.com) em endereços IP.' },
        { q: 'O que é Cloud Computing?', opts: ['Computação em servidores locais', 'Entrega de recursos computacionais via internet sob demanda', 'Um tipo de backup', 'Computação quântica'], correct: 1, explanation: 'Cloud oferece servidores, storage, banco de dados e IA como serviço via internet.' },
      ],
      'geral': [
        { q: 'O que é um algoritmo?', opts: ['Um tipo de software', 'Sequência finita de instruções para resolver um problema', 'Uma linguagem de programação', 'Um componente de hardware'], correct: 1, explanation: 'Algoritmos são procedimentos passo a passo com entrada, processamento e saída.' },
        { q: 'O que significa a sigla API?', opts: ['Application Programming Interface', 'Advanced Program Integration', 'Automated Processing Input', 'Applied Protocol Internet'], correct: 0, explanation: 'API define como componentes de software se comunicam entre si.' },
        { q: 'O que é versionamento de código (Git)?', opts: ['Backup de arquivos', 'Sistema de controle de versões que rastreia mudanças no código', 'Compilador de código', 'Editor de texto'], correct: 1, explanation: 'Git registra o histórico de alterações, permitindo colaboração e rollback.' },
        { q: 'O que é uma IDE?', opts: ['Internet Data Exchange', 'Integrated Development Environment', 'Internal Debug Engine', 'Interactive Design Editor'], correct: 1, explanation: 'IDE é um ambiente integrado com editor, debugger e ferramentas de desenvolvimento.' },
        { q: 'O que é PWA (Progressive Web App)?', opts: ['Um framework JavaScript', 'App web que funciona offline e pode ser instalado como app nativo', 'Um protocolo de rede', 'Um banco de dados'], correct: 1, explanation: 'PWAs combinam web + mobile: funcionam offline via Service Workers e são instaláveis.' },
      ]
    };
  }

  _detectTopic(lower) {
    if (lower.includes('python')) return 'python';
    if (lower.includes('banco') || lower.includes('sql') || lower.includes('dados')) return 'banco de dados';
    if (lower.includes('ia') || lower.includes('intelig') || lower.includes('machine') || lower.includes('neural')) return 'inteligencia artificial';
    if (lower.includes('matemat') || lower.includes('calculo') || lower.includes('algebra') || lower.includes('derivada')) return 'matematica';
    if (lower.includes('rede') || lower.includes('infra') || lower.includes('docker') || lower.includes('cloud') || lower.includes('linux')) return 'infraestrutura';
    // Try to match from current subject
    const subj = this._materia().toLowerCase();
    if (subj.includes('dados')) return 'banco de dados';
    if (subj.includes('matemat')) return 'matematica';
    if (subj.includes('ia') || subj.includes('intelig') || subj.includes('componentes')) return 'inteligencia artificial';
    if (subj.includes('infra') || subj.includes('computação')) return 'infraestrutura';
    return 'geral';
  }

  _shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ═══ FLASHCARDS ═══

  _flashcards(lower) {
    const topic = this._detectTopic(lower);
    const questions = this._quizBank[topic] || this._quizBank['geral'];
    const selected = this._shuffleArray([...questions]).slice(0, 6);

    let r = `**📇 Flashcards — ${topic.charAt(0).toUpperCase() + topic.slice(1)}**\n*${selected.length} cartões gerados*\n\n`;
    selected.forEach((q, i) => {
      r += `P: ${q.q}\nR: ${q.opts[q.correct]}. ${q.explanation}\n\n`;
    });

    r += `> 🃏 Esses flashcards foram salvos automaticamente! Acesse pela aba **Flashcards** na barra lateral.`;
    return r;
  }

  // ═══ MIND MAP ═══

  _mindMap(lower) {
    const topic = this._detectTopic(lower);
    const maps = {
      'python': `**🧠 Mapa Mental — Python**\n\n\`\`\`\n🐍 PYTHON\n├── 📦 Tipos de Dados\n│   ├── int, float, complex\n│   ├── str, bytes\n│   ├── list, tuple, set\n│   └── dict, frozenset\n├── 🔄 Estruturas de Controle\n│   ├── if/elif/else\n│   ├── for (iteração)\n│   ├── while (loop condicional)\n│   └── try/except (exceções)\n├── 🏗️ Funções\n│   ├── def, lambda\n│   ├── *args, **kwargs\n│   ├── Decorators (@)\n│   └── Generators (yield)\n├── 📐 POO\n│   ├── Classes e Objetos\n│   ├── Herança\n│   ├── Polimorfismo\n│   └── Encapsulamento\n└── 📚 Bibliotecas\n    ├── Flask/Django (Web)\n    ├── Pandas/NumPy (Dados)\n    ├── TensorFlow/PyTorch (IA)\n    └── Requests (HTTP)\n\`\`\``,
      'banco de dados': `**🧠 Mapa Mental — Banco de Dados**\n\n\`\`\`\n🗄️ BANCO DE DADOS\n├── 📊 Relacional (SQL)\n│   ├── MySQL\n│   ├── PostgreSQL\n│   ├── SQLite\n│   └── Oracle\n├── 📄 Não-Relacional (NoSQL)\n│   ├── MongoDB (Documentos)\n│   ├── Redis (Chave-Valor)\n│   ├── Cassandra (Colunar)\n│   └── Neo4j (Grafos)\n├── 📝 Linguagem SQL\n│   ├── DDL (CREATE, ALTER, DROP)\n│   ├── DML (SELECT, INSERT, UPDATE, DELETE)\n│   ├── DCL (GRANT, REVOKE)\n│   └── TCL (COMMIT, ROLLBACK)\n├── 🔗 Modelagem\n│   ├── Entidades e Atributos\n│   ├── Relacionamentos (1:1, 1:N, N:N)\n│   ├── Normalização (1NF → 3NF)\n│   └── Modelo ER\n└── ⚡ Performance\n    ├── Índices\n    ├── Views\n    ├── Procedures\n    └── Triggers\n\`\`\``,
      'inteligencia artificial': `**🧠 Mapa Mental — Inteligência Artificial**\n\n\`\`\`\n🤖 INTELIGÊNCIA ARTIFICIAL\n├── 📊 Machine Learning\n│   ├── Supervisionado\n│   │   ├── Classificação\n│   │   └── Regressão\n│   ├── Não-Supervisionado\n│   │   ├── Clustering (K-Means)\n│   │   └── Redução de Dimensão (PCA)\n│   └── Por Reforço\n│       └── Q-Learning, PPO\n├── 🧬 Deep Learning\n│   ├── Redes Neurais (ANN)\n│   ├── Convolucionais (CNN)\n│   ├── Recorrentes (RNN/LSTM)\n│   └── Transformers (GPT, BERT)\n├── 🗣️ NLP\n│   ├── Tokenização\n│   ├── Embeddings\n│   ├── Atenção/Self-Attention\n│   └── LLMs (GPT, Claude, Gemini)\n├── 👁️ Visão Computacional\n│   ├── OCR\n│   ├── Detecção de Objetos\n│   └── Reconhecimento Facial\n└── 🛠️ Ferramentas\n    ├── Python (TensorFlow, PyTorch)\n    ├── Jupyter Notebooks\n    ├── Hugging Face\n    └── LangChain (RAG)\n\`\`\``,
    };
    return maps[topic] || `**🧠 Mapa Mental — ${this._materia()}**\n\n\`\`\`\n📚 ${this._materia().toUpperCase()}\n├── 📖 Fundamentos\n│   ├── Conceitos Básicos\n│   ├── Terminologia\n│   └── História e Contexto\n├── 🔧 Técnicas\n│   ├── Métodos Principais\n│   ├── Ferramentas\n│   └── Boas Práticas\n├── 🧪 Prática\n│   ├── Exercícios Guiados\n│   ├── Projetos\n│   └── Estudos de Caso\n└── 📈 Avançado\n    ├── Tópicos Especiais\n    ├── Pesquisa Atual\n    └── Aplicações Reais\n\`\`\`\n\n> 💡 Selecione uma matéria específica na aba lateral para mapas mentais mais detalhados!`;
  }

  // ═══ RESUMO ═══

  _resumo(lower) {
    const topic = this._detectTopic(lower);
    const resumos = {
      'python': `**📝 Resumo — Python**\n\n**O que é:** Linguagem interpretada, de alto nível e tipagem dinâmica criada por Guido van Rossum (1991).\n\n**Pontos-chave:**\n- 🐍 **Sintaxe limpa:** Usa indentação em vez de chaves\n- 📦 **Tipos nativos:** list, dict, tuple, set, str, int, float\n- 🔄 **Paradigmas:** Imperativo, OOP e Funcional\n- 📚 **Ecossistema:** +400k pacotes no PyPI\n- 🤖 **Líder em IA/Data Science:** TensorFlow, PyTorch, Pandas\n\n**Exemplo:**\n\`\`\`python\ndef saudacao(nome):\n    return f"Olá, {nome}!"\n\nprint(saudacao("${this._nome()}"))\n\`\`\`\n\n**Para a prova, lembre:**\n1. Python é **interpretado** (não compilado)\n2. Tipagem **dinâmica** (variável muda de tipo)\n3. List comprehension: \`[x**2 for x in range(10)]\`\n4. \`self\` é obrigatório em métodos de classe`,
      'banco de dados': `**📝 Resumo — Banco de Dados**\n\n**Definição:** Sistema organizado para armazenar, gerenciar e recuperar dados de forma eficiente.\n\n**SQL vs NoSQL:**\n| Aspecto | SQL | NoSQL |\n|---|---|---|\n| Estrutura | Tabelas com schema rígido | Documentos, chaves, grafos |\n| Escalabilidade | Vertical | Horizontal |\n| Exemplos | MySQL, PostgreSQL | MongoDB, Redis |\n| ACID | ✅ Forte | ⚠️ Eventual |\n\n**Comandos SQL essenciais:**\n\`\`\`sql\nSELECT nome, nota FROM alunos WHERE nota >= 7;\nINSERT INTO alunos (nome, nota) VALUES ('${this._nome()}', 10);\nUPDATE alunos SET nota = 10 WHERE ra = '${this.S.ra || '12345'}';\nDELETE FROM alunos WHERE nota < 3;\n\`\`\`\n\n**Para a prova:**\n1. JOIN une tabelas por chaves\n2. GROUP BY agrupa + HAVING filtra grupos\n3. Normalização: 1NF → 2NF → 3NF\n4. Índices aceleram consultas mas ocupam espaço`,
    };
    return resumos[topic] || `**📝 Resumo — ${this._materia()}**\n\nComo **${this._tutor()}**, preparei este resumo para você, **${this._nome()}**:\n\n**Conceitos Fundamentais:**\n- O tema aborda os princípios teóricos e práticos da área\n- Foco em aplicação real e resolução de problemas\n- Conexão com outras disciplinas do curso\n\n**O que estudar para a prova:**\n1. 📖 Revise os conceitos-chave do material didático\n2. 📝 Pratique com exercícios (peça um **quiz**!)\n3. 📇 Use **flashcards** para memorização\n4. 🧠 Construa um **mapa mental** para visualizar conexões\n\n> 💡 Selecione uma matéria específica na aba lateral para resumos detalhados!\n> Posso gerar resumos especializados de: **Python, SQL, IA, Matemática, Redes**.`;
  }

  // ═══ SUBJECT-SPECIFIC HANDLERS ═══

  _explicacao(lower, raw) {
    return this._resumo(lower);
  }

  _programacao(lower) {
    if (lower.includes('python')) return this._resumo('python');
    if (lower.includes('javascript') || lower.includes(' js'))
      return `**📝 JavaScript**\n\nLinguagem de programação da web. Roda no navegador e no servidor (Node.js).\n\n**Características:**\n- 🌐 Linguagem do front-end web\n- ⚡ Tipagem dinâmica e fraca\n- 🔄 Event-driven e assíncrona (Promises, async/await)\n- 📦 NPM: maior ecossistema de pacotes do mundo\n\n**Exemplo:**\n\`\`\`javascript\nconst saudacao = (nome) => \`Olá, \${nome}!\`;\nconsole.log(saudacao('${this._nome()}'));\n\n// Async\nconst dados = await fetch('/api/alunos');\nconst json = await dados.json();\n\`\`\`\n\n**Frameworks:** React, Vue, Angular, Next.js, Express\n\n> 💡 Quer um **quiz** sobre JavaScript? Digite "quiz javascript"!`;
    if (lower.includes('java') && !lower.includes('javascript'))
      return `**📝 Java**\n\n"Write once, run anywhere." Linguagem compilada, fortemente tipada e orientada a objetos.\n\n**Características:**\n- ☕ Roda na JVM (Java Virtual Machine)\n- 🏗️ 100% Orientada a Objetos\n- 🔒 Tipagem estática e forte\n- 📦 Ecossistema maduro (Spring, Hibernate)\n\n**Exemplo:**\n\`\`\`java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Olá, ${this._nome()}!");\n    }\n}\n\`\`\`\n\n**Para a prova:**\n1. \`public static void main(String[] args)\` — ponto de entrada\n2. Classes, Herança, Polimorfismo, Interfaces\n3. Collections: ArrayList, HashMap, HashSet\n4. Exceções: try/catch/finally`;
    return `**💻 Programação**\n\nQual linguagem ou tema específico você quer estudar, **${this._nome()}**?\n\n- 🐍 **Python** → "explique python"\n- ☕ **Java** → "explique java"\n- 🌐 **JavaScript** → "explique javascript"\n- 🗄️ **SQL** → "explique sql"\n- 📊 **Estrutura de Dados** → "mapa mental estrutura de dados"\n\nOu peça um **quiz** de qualquer uma delas!`;
  }

  _matematica(lower) { return this._resumo('matematica'); }
  _dados(lower) { return this._resumo('banco de dados'); }
  _iaML(lower) { return this._resumo('inteligencia artificial'); }
  _infra(lower) { return this._resumo('infraestrutura'); }

  _tcc(lower) {
    return `**📄 Assistente de TCC — ABNT**\n\nComo posso ajudar com seu TCC, **${this._nome()}**?\n\n**Estrutura ABNT:**\n1. **Capa** — Instituição, título, autor, cidade, ano\n2. **Folha de rosto** — Informações adicionais\n3. **Resumo** — 150-500 palavras + palavras-chave\n4. **Sumário** — Índice com numeração progressiva\n5. **Introdução** — Problema, justificativa, objetivos\n6. **Referencial Teórico** — Revisão da literatura\n7. **Metodologia** — Como a pesquisa foi conduzida\n8. **Resultados** — Dados e análise\n9. **Conclusão** — Síntese e trabalhos futuros\n10. **Referências** — ABNT NBR 6023\n\n**Formatação:**\n- Fonte: Times New Roman ou Arial, 12pt\n- Espaçamento: 1,5 entre linhas\n- Margens: 3cm (sup/esq), 2cm (inf/dir)\n- Citação direta curta: entre aspas no texto\n- Citação direta longa (>3 linhas): recuo 4cm, fonte 10\n\n**Exemplo de referência:**\n> SOBRENOME, Nome. **Título da obra**. Edição. Cidade: Editora, Ano.\n\n> 💡 Cole um trecho do seu TCC e peço para revisar a formatação!`;
  }

  _pomodoroAdvice() {
    return `**🍅 Técnica Pomodoro — Guia Completo**\n\n**Como funciona:**\n1. 🎯 Escolha **uma tarefa** para focar\n2. ⏱️ Configure **25 minutos** de foco total\n3. ☕ Faça uma **pausa de 5 minutos**\n4. 🔄 Repita 4 vezes\n5. 🧘 Após 4 ciclos, **pausa longa de 15-30 min**\n\n**Rotina sugerida para hoje (${this._nome()}):**\n\n| Horário | Atividade | Duração |\n|---|---|---|\n| Agora | 🍅 Foco — ${this._materia()} | 25 min |\n| +25min | ☕ Pausa — água, alongamento | 5 min |\n| +30min | 🍅 Foco — exercícios práticos | 25 min |\n| +55min | ☕ Pausa | 5 min |\n| +60min | 🍅 Foco — revisão | 25 min |\n| +85min | ☕ Pausa | 5 min |\n| +90min | 🍅 Foco — flashcards | 25 min |\n| +115min | 🧘 Pausa longa | 15 min |\n\n**Dicas de foco:**\n- 📵 Coloque o celular no silencioso\n- 🎧 Use música lo-fi ou ruído branco\n- 💧 Tenha uma garrafa de água por perto\n- 📝 Anote distrações para resolver depois\n\n> 🍅 Clique em **Timer Pomodoro** na barra lateral para iniciar agora!`;
  }

  _motivacao() {
    const nome = this._nome();
    const msgs = [
      `**🔥 Mensagem para ${nome}**\n\nO caminho do conhecimento não é uma linha reta — é uma espiral ascendente. Cada vez que você revisa um tema, entende mais profundamente.\n\n*"A educação é a arma mais poderosa que você pode usar para mudar o mundo."* — Nelson Mandela\n\n**Fatos:**\n- 📊 Você já acumulou **${this.S.xp || 0} XP** no MAGNED\n- 📚 Cada minuto de estudo fortalece conexões neurais\n- 🧠 Seu cérebro é capaz de armazenar 2.5 petabytes de informação\n\nVocê está investindo no seu futuro. **Não pare.** 💪`,
      `**💪 ${nome}, leia isso:**\n\nAntes de desistir, lembre-se do motivo pelo qual começou.\n\nVocê escolheu **${this.S.course || 'este curso'}** porque viu um futuro nele. Os dias difíceis são os que mais constroem caráter.\n\n**Estratégia anti-procrastinação:**\n1. ⏱️ Comece com apenas **5 minutos** (regra dos 5 minutos)\n2. 🎯 Foque em **uma** tarefa por vez\n3. 🍅 Use o **Pomodoro** (25min foco + 5min pausa)\n4. 🎮 Celebre pequenas vitórias (+XP!)\n5. 🛌 Descanse sem culpa quando precisar\n\n*"O sucesso não é acidental. É resultado de trabalho duro, persistência, aprendizado e amor pelo que se faz."* — Pelé\n\nVamos estudar? Escolha uma matéria! 🚀`,
    ];
    return this._pick(msgs);
  }

  // ═══ GENERAL / FALLBACK ═══

  _general(raw) {
    const tutor = this._tutor();
    const materia = this._materia();
    const nome = this._nome();

    // Try to give a contextual response
    if (raw.length > 15) {
      return `Como **${tutor}**, analisei sua pergunta sobre "${raw.substring(0, 60)}${raw.length > 60 ? '...' : ''}".\n\n**Resposta:**\n\nEsse é um tema relevante para **${materia}**. Para uma explicação mais precisa, posso ajudar de várias formas:\n\n1. 📝 **"resumo"** — Resumo do tema\n2. ⚡ **"quiz"** — Teste seus conhecimentos\n3. 📇 **"flashcards"** — Cartões de memorização\n4. 🧠 **"mapa mental"** — Visualize as conexões\n\n**Dica:** Quanto mais específica sua pergunta, melhor eu respondo! Tente perguntar sobre **Python, SQL, IA, Matemática ou Redes**.\n\n> 💡 Você também pode enviar uma **foto de exercício** para análise OCR!`;
    }

    return `Entendi, **${nome}**! Como **${tutor}**, estou pronto para ajudar.\n\nDigite **"ajuda"** para ver todos os comandos disponíveis, ou use os atalhos rápidos abaixo do chat! 🚀`;
  }

  _fallback(text) {
    return `Hmm, não consegui processar essa solicitação no momento, **${this._nome()}**.\n\nTente reformular ou use um dos comandos:\n- "notas" | "faltas" | "agenda"\n- "quiz" | "flashcards" | "resumo"\n- "plano de estudos" | "mapa mental"\n- "ajuda" — ver todos os comandos`;
  }

  // ═══ OCR RESULT HANDLER ═══
  analyzeOCR(extractedText) {
    if (!extractedText || extractedText.length < 5) {
      return '**👁️ OCR:** Não foi possível extrair texto suficiente. Tente uma imagem mais nítida.';
    }

    let r = `**👁️ Análise OCR — Texto Extraído:**\n\n> ${extractedText.substring(0, 500)}\n\n---\n\n`;

    // Detect if it's a math problem
    if (/\d+\s*[\+\-\*\/\=\^]\s*\d+|equação|calcul|deriv|integr|x\s*=|f\(x\)/i.test(extractedText)) {
      r += `**🧮 Exercício de Matemática Detectado**\n\nAnálise passo a passo:\n\n`;
      r += `1. **Identificação:** O exercício envolve cálculos numéricos/algébricos\n`;
      r += `2. **Estratégia:** Isolar variáveis e aplicar operações\n`;
      r += `3. **Resolução:** Aplique as regras matemáticas pertinentes\n`;
      r += `4. **Verificação:** Substitua o resultado na equação original\n\n`;
      r += `> 💡 Para resolução detalhada, digite o exercício manualmente ou envie uma imagem mais clara.`;
    } else if (/alternativa|marque|assinale|questão|opção/i.test(extractedText)) {
      r += `**📋 Questão de Múltipla Escolha Detectada**\n\nVou analisar as alternativas:\n\n`;
      r += `- Identifiquei o enunciado e as opções\n`;
      r += `- Para uma resolução precisa, verifique se todas as alternativas foram capturadas\n`;
      r += `- Dica: Elimine as alternativas absurdas primeiro\n\n`;
      r += `> 💡 Quer que eu gere questões similares? Digite "quiz"!`;
    } else {
      r += `**📄 Texto Acadêmico Detectado**\n\nConteúdo extraído com sucesso. Posso:\n\n`;
      r += `- 📝 **Resumir** este conteúdo\n`;
      r += `- 📇 **Gerar flashcards** a partir dele\n`;
      r += `- ⚡ **Criar um quiz** baseado no texto\n`;
      r += `- 🧠 **Fazer um mapa mental** do tema\n\n`;
      r += `O que você prefere?`;
    }

    return r;
  }
}

// Export for use in app.html
window.MagnedAI = MagnedAI;
