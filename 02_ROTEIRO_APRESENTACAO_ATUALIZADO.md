# MAGNED: ROTEIRO TÉCNICO — APRESENTAÇÃO (10 Minutos)

*Instruções:* Este roteiro foi atualizado com a redistribuição de responsabilidades. Cada integrante terá aproximadamente **1 minuto e 40 segundos** de fala para totalizarmos os 10 minutos exigidos de apresentação.

---

## [AU] Augusto (00:00 - 01:40)
**Abertura · Arquitetura**

🖥️ *Ação: Abre index.html → Apresenta a estrutura geral do projeto*

**[FALA]**
"Nosso projeto é o MAGNED. A arquitetura é Client-Centric: tudo roda no navegador. São apenas 6 arquivos no total. Não existe backend próprio, o que torna o projeto de custo baixíssimo e latência zero.

**A Arquitetura Client-Centric**
Adotamos o padrão de arquitetura Client-Centric Hybrid. O frontend é um PWA com HTML, CSS e JavaScript puro. O motor de IA roda localmente via fallback JavaScript ou, quando online, chama a API do Google Gemini. O banco de dados é híbrido: localStorage offline e Firebase na nuvem quando conectado.

Esta escolha arquitetural permite que qualquer aluno da UniEVANGÉLICA use o sistema com um simples duplo-clique no index.html, sem precisar instalar nada."

---

## [MA] Marcel (01:40 - 03:20)
**Reconhecimento Facial · Banco na Nuvem**

🖥️ *Ação: Faz Login Facial ao vivo e mostra o Firebase*

**[FALA]**
"Vou mostrar as duas grandes inovações técnicas de segurança e persistência.

**Como funciona o Reconhecimento Facial (FaceID)**
Usamos a biblioteca `face-api.js`, construída sobre o TensorFlow.js. São 3 modelos de IA carregados que mapeiam 68 pontos do rosto e geram um vetor numérico (DNA facial). O loop de cadastro captura o rosto e salva esse vetor. No login, comparamos o rosto da câmera com o vetor salvo calculando a distância euclidiana. Se for menor que 0.5, loga automaticamente.

**Onde ficam os dados? (A grande atualização)**
Nós evoluímos o banco de dados. Antes era apenas local (`localStorage`). Agora, nós integramos globalmente usando o **Firebase Realtime Database**. Os dados e o cadastro não ficam mais presos na máquina: a função `saveDB()` envia o perfil do aluno para a nuvem em tempo real, permitindo que a coordenação visualize e audite os alunos de qualquer lugar do mundo."

---

## [GA] Gabriel (03:20 - 05:00)
**Motor de IA Híbrido · Fallback Silencioso**

🖥️ *Ação: Mostra o código do Motor Híbrido e desliga a internet (opcional)*

**[FALA]**
"O coração do MAGNED é o Motor Híbrido de IA. Temos dois caminhos: a API do **Gemini 1.5 Flash** na nuvem e um Motor Local em JavaScript puro.

**Como funciona (Gemini + Fallback Local)**
Caminho 1 (Nuvem): Quando o aluno envia uma mensagem, o sistema chama a API do Google via `fetch()`. Nós enviamos o boletim do aluno, o histórico e o prompt do tutor.
Caminho 2 (Fallback): Se a internet cair ou a cota da API acabar, um bloco `try/catch` aciona silenciosamente nossa classe JavaScript `MagnedAI` de 600 linhas. O usuário nunca vê tela de erro.

O nosso motor local normaliza a mensagem, classifica em 22 intenções (como notas, quizzes) e devolve a resposta. A experiência do aluno nunca é interrompida."

---

## [ED] Eduardo (05:00 - 06:40)
**Integração Lyceum Real · AVA · Contexto da IA**

🖥️ *Ação: Mostra a tela inicial de Matérias carregando a grade real.*

**[FALA]**
"A IA só é inteligente se tiver dados reais. E nós fizemos isso.

**A Sincronização Automática com o Lyceum**
Ao invés de dados falsos, nós embutimos o algoritmo de Sincronização Automática. Ao logar, o sistema percorre o array e carrega as **matérias reais** do Augusto (Engenharia de Dados, Engenharia de Soluções, Cidadania...) e os nomes dos nossos professores reais.

Calculamos matematicamente as médias e a porcentagem de faltas. Se a falta for alta, injetamos a tag `⚠️ RISCO DE REPROVAÇÃO` no contexto do robô, sem o aluno ver. Toda vez que você pergunta algo no chat, a IA já leu seu boletim real e responde de forma personalizada, integrando os compromissos do AVA com prazos de entrega urgentes."

---

## [NI] Nicolas (06:40 - 08:20)
**Sistema de Tutores · Gamificação · Painel de Administração**

🖥️ *Ação: Mostra a troca de tutores. Depois loga como Administrador para mostrar a tabela do Firebase.*

**[FALA]**
"A nossa IA adota personas. Criamos perfis dos nossos professores (Otoniel, Holehon, Leonardo). A função `selTutor()` funde as características do professor com as notas do aluno antes da IA responder. 

Além disso, toda interação gera **XP**, que enche uma barra progressiva gamificando o ensino.

**O Painel de Administração (Segurança RBAC)**
Mas também pensamos na instituição. Implementamos controle de acesso baseado em cargos. Estudantes não veem o painel administrativo. Mas se fizermos login como Administrador, o sistema lê os dados do **Firebase** na nuvem e lista todos os alunos matriculados, CPFs e cursos de forma unificada e segura."

---

## [DA] Davi (08:20 - 09:10)
**Quizzes · Flashcards · Mapas Mentais — Estudo Ativo**
*Responsável também pela parte original do Marcel (OCR, PWA, Pomodoro)*

🖥️ *Ação: Pede "gerar quiz de Python" ou abre a janela de Flashcards. Depois mostra OCR e Pomodoro.*

**[FALA]**
"Nosso diferencial é que a IA não cospe só texto. Ela gera componentes visuais interativos.

**Quizzes e Flashcards**
Nosso código possui um classificador de intenção. Ao pedir um quiz, o motor sorteia questões via `Math.random()` e injeta botões HTML no próprio chat. O aluno clica e já vê se errou ou acertou, tudo colorido via CSS.
Para revisão, geramos Flashcards em CSS 3D (`transform: rotateY`) simulando cartas de baralho. 

**OCR e PWA**
Com a biblioteca `Tesseract.js`, o aluno pode tirar foto do quadro e o sistema lê os pixels, extrai o texto e manda direto para a IA resolver. Além disso, criamos o manifesto PWA: o MAGNED pode ser 'baixado' no celular como app nativo."

---

## [MA] Marcel (09:10 - 10:00)
**Pomodoro · GitHub · Encerramento**

🖥️ *Ação: Mostra o Timer Pomodoro ou o código no GitHub.*

**[FALA]**
"Para fechar, apresento nossa estrutura final e o Pomodoro integrado:

**Pomodoro e GitHub**
Embutimos um timer focado no método Pomodoro, gamificando o tempo de estudo. E, o mais importante, todo o nosso código do Ciclo 3, incluindo o banco na nuvem e biometria, está hospedado no GitHub. O professor pode clonar o projeto e com um duplo-clique no `index.html` já estará testando a ferramenta, sem instalação de bibliotecas.

Muito obrigado a todos, estamos abertos a perguntas!"
