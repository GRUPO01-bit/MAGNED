# 🎓 MAGNED AI - Manual de Execução para Avaliação

Prezado Professor,
Este documento serve como guia rápido para a avaliação do projeto **MAGNED (Módulo Avançado de Gestão Neural e Execução de Dados)**, desenvolvido pelo **Grupo 01**.

## 🚀 Como Executar o Projeto
O MAGNED foi desenvolvido utilizando a arquitetura *Client-Centric* com foco em performance e execução *Offline-First* direto no navegador. **Não é necessário rodar servidores locais complexos (Node/Python) para testar a interface!**

1. Abra a pasta Aplicacao.
2. Dê um duplo-clique no arquivo index.html.
3. O aplicativo abrirá no seu navegador padrão (Recomendamos Google Chrome ou Edge para compatibilidade total com a Câmera e OCR).
4. O repositório está versionado no **GitHub**, demonstrando nosso fluxo de commits e documentação.

## 🌟 Principais Inovações Avaliáveis

### 1. Motor Híbrido com Fallback Silencioso
O sistema está integrado à API do Gemini (Nuvem). No entanto, programamos uma rotina rigorosa de 	ry/catch. Caso a API sofra *timeout*, queda de internet, ou limite de cota excedido, o sistema **automaticamente intercepta a falha e redireciona a requisição para um Motor Local (JavaScript Vanilla)**. O usuário não percebe a queda, recebendo a resposta no chat sem telas vermelhas de erro.

### 2. Login Facial Biométrico Integrado
Usando a biblioteca ace-api.js, o aluno não digita senhas. O reconhecimento facial mapeia o rosto, gera o avatar e vincula a Matrícula e o CPF da sessão diretamente com as chamadas de banco de dados do Lyceum/AVA.

### 3. Matemática e Contexto (Lyceum e AVA)
A aba lateral possui as áreas do Lyceum e AVA. Os dados inseridos lá são injetados diretamente no contexto da IA. As **Porcentagens de Faltas e Risco de Reprovação** não são estáticas: são calculadas matematicamente em tempo real (Faltas / Total de Aulas * 100) para gerar insights precisos ao aluno caso ele pergunte "Como estão minhas notas?".

### 4. Estudo Visual (Quizzes, Flashcards e Mapas Mentais)
O chat não cospe apenas textos. Desenvolvemos renderizadores de HTML no JS que transformam a resposta da IA em componentes interativos (ex: digite *"gerar quiz de python"* para ver o widget de múltipla escolha e os flashcards animados gerados dinamicamente na tela).

### 5. OCR e PWA
- **OCR Vision:** Na aba de ferramentas, você pode anexar uma foto com texto. O Tesseract.js lê os pixels, extrai o texto e envia para a IA resolver automaticamente.
- **PWA:** O projeto atende aos requisitos de Progressive Web App, podendo ser instalado como aplicativo nativo no celular ou desktop.
