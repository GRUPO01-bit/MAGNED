# MAGNED — Integração Portal + AVA

Sistema que conecta o **Portal do Aluno** e o **AVA (Moodle)** da UniEVANGÉLICA ao backend Claude do MAGNED.

## Arquitetura

```
Aluno
  │
  ▼
MAGNED Chat (frontend)
  │
  ▼
magnedClaude.js ──── Claude API (claude-sonnet-4-6)
  │                        ▲
  │                        │ system prompt com contexto
  │
  ▼
server.js (porta 3333)
  ├── GET /magned/contexto ──► contexto consolidado
  ├── GET /ava/all         ──► moodleApi.js
  └── GET /portal/all      ──► portalScraper.js
         ├── Moodle REST API (token)
         └── Puppeteer scraping (headless Chrome)
```

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Instalar Chromium (para scraping do Portal)

```bash
# Ubuntu/Debian
sudo apt-get install -y chromium-browser

# macOS
brew install --cask google-chrome
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
# edite o .env com seus dados
```

### 4. Rodar o servidor

```bash
node server.js
```

---

## Como funciona

### Moodle (AVA) — Opção 3: API REST nativa

O Moodle tem uma API REST nativa. A autenticação é via token:

```
GET https://avagrad.unievangelica.edu.br/login/token.php
  ?username=SUA_MATRICULA
  &password=SUA_SENHA
  &service=moodle_mobile_app
```

Esse token é usado em todas as chamadas seguintes. Dados disponíveis:
- Cursos matriculados
- Tarefas e prazos
- Notas
- Avisos dos fóruns
- Calendário/eventos

### Portal do Aluno — Opção 2: Scraping autenticado

O Portal é uma SPA Angular que não tem API pública. O scraping funciona assim:

1. Puppeteer (Chrome headless) abre o portal
2. Preenche login + senha automaticamente
3. Navega para as seções (avisos, horário, financeiro)
4. Extrai o DOM e retorna os dados

---

## Fluxo de uma conversa

```
1. Aluno abre o MAGNED
2. MAGNED chama POST /auth com matrícula + senha
3. Sessão fica em cache por 10 minutos
4. Aluno faz uma pergunta
5. MAGNED chama GET /magned/contexto
6. Servidor busca dados do Moodle + Portal em paralelo
7. Dados são consolidados em texto
8. Texto é injetado no system prompt do Claude
9. Claude responde com base nos dados reais do aluno
```

---

## Problemas comuns

**"Login falhou" no Portal:** O seletor do campo de login mudou. Inspecione o DOM do portal e atualize os seletores em `portalScraper.js > loginPortal()`.

**"Moodle auth error: invalid_token":** O serviço `moodle_mobile_app` pode estar desabilitado pela TI da UniEVANGÉLICA. Nesse caso, contate o suporte ou use o scraping também para o AVA.

**Puppeteer não encontra o Chrome:** Atualize `CHROMIUM_PATH` no `.env` com o caminho correto do Chrome instalado.

**Dados desatualizados:** O cache expira em 10 minutos. Para forçar atualização, chame `POST /auth` novamente.
