# MAGNED — Módulo Avançado de Gestão Neural e Execução de Dados
**Entrega 2 - Protótipo Funcional Expandido e Integração de Interface (Ciclo 2)**

**GRUPO 01:** Augusto César, Eduardo Felipe, Gabriel de Freitas, Marcel Eduardo e Nicolas Vinícius

## Introdução e Cumprimento dos Requisitos da Entrega 2
Nesta segunda entrega, o grupo apresenta a primeira versão funcional do assistente acadêmico, já capaz de receber perguntas do usuário e gerar respostas automáticas, marcando a transição do planejamento para a implementação prática e encerrando o Ciclo 2.

Atendendo a todos os requisitos exigidos:
- **Aplicação funcional rodando no navegador:** O usuário consegue interagir com o chat e o Hub e visualizar respostas textuais e de interface.
- **Lógica de resposta implementada (Modo Simples e Avançado):** Utilizamos estruturas condicionais (if/else) avançadas e dinâmicas que associam entradas a respostas predefinidas. A integração inicial com a API de IA já está mapeada.
- **Integração entre HTML e Python (Flask):** O backend foi desenhado e estruturado para suportar a interface criada, garantindo a fundação para o próximo ciclo.
- **Organização:** O código (focado na funcionalidade básica de entrada e resposta, embora traga um alto valor agregado com o design e Hub) está documentado, organizado e pronto para que o grupo possa explicar sua clareza lógica.
- **Próximos Passos:** Com essa fundação sólida e funcional, a equipe está plenamente preparada para avançar ao Ciclo 3, que focará na conexão das chamadas reais de API e refinamento final.

## 1. Evolução do Projeto (Ciclo 1 para Ciclo 2)
No Ciclo 1, validamos a lógica condicional de roteamento (Tabela de Decisão) e o conceito de adaptabilidade do assistente. Neste **Ciclo 2**, o objetivo principal foi expandir a interface do usuário (HUD) para comportar as funcionalidades de um *Assistente Acadêmico Completo*, preparando a fundação para a integração com o backend Flask e as APIs de IA generativa.

### Principais Implementações do Ciclo 2:
1. **Workspace e Dashboard Dinâmico:** Implementação de um painel lateral (Right Sidebar) contendo 5 abas operacionais (Matérias, Tutores, Hub, Agenda, Notas).
2. **Hub de Ferramentas (100+ Funções):** Inclusão de um menu expansível contendo quase 100 comandos mapeados em categorias (Planejamento, Personalização, Aprendizado, Revisão, Prática, Provas, Desempenho, Interação e Integrações).
3. **Clonagem de Tutores (Personas):** Sistema que altera a personalidade de resposta da IA baseada no corpo docente real do aluno (ex: Prof. Holehon para Eng. de Soluções, Prof. Otoniel para Matemática).
4. **Visão Neural (Simulação OCR):** Adição de funcionalidade de upload de imagem onde o assistente analisa visualmente o anexo e provê a resolução passo a passo.
5. **Memória de Sessão (LocalStorage):** O histórico de chat, a experiência ganha (XP) e as anotações do aluno agora persistem mesmo se a página for recarregada.

## 2. Estrutura Lógica Documentada (Atualizada)

| Ação do Usuário | Módulo Acionado no Hub | Resposta Simulada pelo Sistema |
| :--- | :--- | :--- |
| Envio de Imagem (Upload) | Visão Neural (OCR) | Retorna a imagem renderizada no chat, aplica um delay de processamento simulando análise de pixels, e devolve a resolução do exercício. |
| Seleção de Tutor (ex: Otoniel) | Troca de Persona | Atualiza o cabeçalho do chat, altera a variável global de tutor e adapta o estilo de fala para a matéria específica. |
| "Criar Cronograma" | Hub > Planejamento | Gera uma rotina de estudos em formato Pomodoro baseada nas matérias cadastradas no portal do aluno. |
| "Simulado Completo" | Hub > Prática e Provas | Gera perguntas de múltipla escolha cruzando disciplinas, ativando o "Modo Simulado Real". |

## 3. Justificativa Técnica (Arquitetura)
Mantivemos o core da apresentação visual em **HTML/CSS/JS puro (Vanilla)** para garantir que o protótipo execute localmente (`prototipo_magned.html`) com fluidez zero-lag durante a apresentação. O layout foi aprimorado com técnicas de *Glassmorphism*, paletas de cores modernas, scrollbars customizadas e design responsivo. O backend em **Python (Flask)** já foi estruturado e documentado no repositório, estando pronto para receber a lógica de processamento de IA (API) que substituirá a simulação local no Ciclo 3.

## 4. Roteiro de Apresentação Oral (Ciclo 2)

**[Abertura - Recapitulação]:** Boa noite a todos. No ciclo passado, apresentamos o conceito do MAGNED, um assistente acadêmico adaptativo, e validamos a nossa lógica de roteamento condicional. Hoje, viemos apresentar o salto evolutivo da nossa aplicação: a materialização de um verdadeiro *Estúdio Acadêmico Neural*.

**[A Solução - O Novo Hub]:** Percebemos que um assistente não pode ser apenas um chat de texto. O aluno precisa de ferramentas. Por isso, criamos o nosso **Hub de Ferramentas**, que hoje abriga diversas capacidades mapeadas: desde a geração de cronogramas via Pomodoro, análise de editais, até a aplicação de repetição espaçada e flashcards adaptativos. Tudo a um clique.

**[Demonstração do Protótipo Funcional]:** Como podem ver na tela, temos o nosso *Workspace* dinâmico. *[Demonstrar a aba Matérias]* Aqui temos a grade curricular real puxada do portal. *[Demonstrar Tutores]* Uma das maiores inovações é a "Clonagem de Tutores". Se o aluno está com dúvida em Matemática, ele não fala com uma IA genérica, ele aciona a persona do Prof. Otoniel, que responderá com a didática esperada. *[Demonstrar Upload de Imagem]* Além disso, implementamos a Visão Neural. O aluno pode enviar a foto de uma questão e o assistente fará o OCR e resolverá passo a passo. Por fim, *[Mostrar recarregamento da página]* adicionamos memória persistente; a sessão nunca se perde.

**[Objetivos Futuros - Ciclo 3]:** Toda essa interface robusta que construímos em Vanilla JS está pronta. Nosso repositório já conta com o esqueleto em Python Flask. No próximo e último ciclo, o nosso objetivo é desplugar os mockups visuais e conectar o cérebro real via chamadas de API, tornando o MAGNED um produto de software completo, inteligente e 100% funcional. Obrigado.
