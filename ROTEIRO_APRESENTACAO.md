# 🎤 ROTEIRO OFICIAL DE APRESENTAÇÃO - MAGNED AI (Ciclo 3)
**Equipe (Grupo 01):** Augusto, Gabriel, Eduardo, Nicolas, Davi e Marcel.

---

## 1. Abertura e Visão Geral (Fala do AUGUSTO)
**Ação na tela:** Abre a Landing Page (index.html).
* "Bom dia/boa noite a todos. Nós somos o Grupo 01 e hoje apresentamos a versão final do **MAGNED - Estúdio Acadêmico Neural**."
* "O MAGNED nasceu para resolver o problema da fragmentação e da ansiedade acadêmica. Não é apenas um ChatGPT, é uma plataforma *Client-Centric* focada no aluno."
* "Destacamos nossas 4 pilares: IA Adaptativa, Login Facial Biométrico, PWA Offline e OCR Vision."
* **Demonstração:** *Augusto clica em Entrar e realiza o Login Facial Biométrico ao vivo.* 
* "Como podem ver, o sistema usa ace-api.js para ler minha biometria e já vincula meu Nome, CPF e Matrícula diretamente no sistema de forma segura."

## 2. Motor de IA e Arquitetura (Fala do GABRIEL)
**Ação na tela:** Chat aberto.
* "Um dos grandes diferenciais técnicos que implementamos foi o nosso Motor Híbrido de IA."
* "Nós usamos a API do Gemini 2.0 Flash para processamento em nuvem, mas o que acontece se a cota do Google cair ou ficarmos sem internet na faculdade?"
* "Nós criamos um **Fallback Silencioso**. Temos uma classe MagnedAI rodando localmente no navegador (Offline-First). Se a API externa falhar, nosso motor interno assume o controle instantaneamente. O usuário nunca vê uma tela vermelha de erro."
* **Demonstração:** *Gabriel mostra o código no GitHub onde o 	ry/catch aciona o motor local silenciosamente.*

## 3. Integração com o Lyceum (Fala do EDUARDO)
**Ação na tela:** Clica na aba Clássicas > Lyceum.
* "A IA só é útil se ela tiver contexto. Por isso, integramos o MAGNED com os dados do Lyceum."
* "A IA puxa o CPF e o RA do aluno (que o Augusto acabou de logar) e injeta silenciosamente nos prompts."
* "O sistema calcula matematicamente as **Porcentagens Reais** de falta. Se a falta passar de 25%, a IA entra em alerta."
* **Demonstração:** *Eduardo abre o chat e digita "Como estão minhas notas?". A IA responde o boletim e avisa sobre o risco real de reprovação nas matérias.*

## 4. Integração com o AVA e Calendário (Fala do NICOLAS)
**Ação na tela:** Clica na aba Clássicas > AVA.
* "Além das notas, a maior dor do aluno são os prazos. Nós puxamos o calendário completo do AVA para dentro da plataforma."
* "A IA não só lê essas datas, mas entende a linha do tempo. Ela sabe o que é 'Hoje', o que é 'Amanhã' e o que está atrasado."
* **Demonstração:** *Nicolas adiciona um evento no calendário e digita no chat: "O que eu tenho para entregar essa semana?". A IA avisa sobre os prazos urgentes.*

## 5. Módulo de Estudos Avançados (Fala do DAVI)
**Ação na tela:** Chat interativo.
* "Com o contexto acadêmico montado, a IA atua como um Tutor. Nós criamos geradores visuais de estudo."
* "Ao invés de só cuspir texto, o MAGNED gera interfaces."
* **Demonstração 1:** *Davi pede "Gerar quiz de Python". Mostra o Quiz com botões interativos e os Flashcards animados embaixo.*
* **Demonstração 2:** *Davi pede "Mapa mental de Banco de Dados". Mostra o diagrama gerado.*
* "Isso aplica os conceitos de Estudo Ativo e Repetição Espaçada diretamente na rotina do aluno."

## 6. Ferramentas Extras e GitHub (Fala do MARCEL)
**Ação na tela:** Ferramentas > OCR e GitHub do projeto.
* "Para finalizar as features, temos o **OCR Vision**. Usando Tesseract.js, o aluno pode mandar a foto do quadro ou de um caderno, o sistema extrai o texto e resolve o exercício."
* "E temos o módulo **Pomodoro** para controle de tempo, com notificações nativas do navegador."
* **Apresentação do GitHub:** "Todo esse código, incluindo os Fallbacks, o motor local em JavaScript Vanilla e as integrações, está versionado e documentado no nosso repositório no GitHub."
* *Marcel mostra a aba do GitHub com os commits recentes (ex: "UI Updates", "Fix Syntax"), provando a colaboração contínua da equipe.*
* "Muito obrigado! Estamos abertos a perguntas sobre qualquer parte da arquitetura."
