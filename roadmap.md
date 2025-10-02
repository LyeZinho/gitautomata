## 1. Estrutura do Projeto

```
gitautomata/
├── src/
│   ├── core/               # Núcleo do projeto (engine de automações)
│   │   ├── automation.ts   # Interface base para automações
│   │   ├── runner.ts       # Orquestrador que executa automações
│   │   ├── github.ts       # Wrapper para interagir com GitHub API
│   │   └── webhook.ts      # Gerenciamento de webhooks
│   │
│   ├── automations/        # Pasta onde usuários/programadores criam automações
│   │   ├── ci.js
│   │   ├── release.js
│   │   └── custom-example.js
│   │
│   ├── server/             # API e servidor self-hosted
│   │   ├── index.ts        # Entry point do servidor
│   │   └── routes.ts       # Endpoints REST (ex: /automations, /health, etc.)
│   │
│   └── utils/              # Helpers, logging, configs
│
├── tests/                  # TDD-first
│   ├── core/
│   ├── automations/
│   └── server/
│
├── docs/                   # Documentação
│   ├── getting-started.md
│   ├── creating-automations.md
│   └── api-reference.md
│
├── examples/               # Exemplos prontos de automações
│   ├── notify-slack.js
│   ├── auto-merge.js
│   └── label-issues.js
│
├── package.json
├── tsconfig.json           # Recomendo TypeScript para segurança
└── README.md
```

---

## 2. Conceitos-Chave

* **Engine de automações**:

  * Cada automação é um módulo (JS/TS) exportando funções/eventos (`onPush`, `onPullRequest`, etc).
  * O runner executa essas automações quando recebe eventos do GitHub (via webhooks ou API polling).

* **Wrapper GitHub API**:

  * Evita reinventar roda → pode usar [octokit/rest.js](https://github.com/octokit/rest.js).
  * Mas encapsular numa camada `core/github.ts` deixa flexível caso queira trocar de lib no futuro.

* **Webhooks**:

  * Servidor expõe endpoints (`/webhook/github`) para receber eventos.
  * Cada evento é roteado para automações registradas.

* **Execução Local**:

  * Além de webhooks, automações podem ser executadas manualmente via CLI:

    ```
    gitautomata run automations/ci.js
    ```

* **Self-Hosted**:

  * Rodar com `docker-compose` (Mongo/Postgres opcional, mas manter KISS → SQLite ou JSON primeiro).
  * Config via `.env`.

---

## 3. Principais Features (MVP)

1. **Servidor básico**:

   * Receber webhooks do GitHub.
   * Listar automações disponíveis.
   * Executar automações sob demanda.

2. **Sistema de automações**:

   * Modelo simples de automação (funções JS exportadas).
   * Exemplo: auto-label PRs, criar releases automáticas.

3. **CLI**:

   * `gitautomata init` → cria estrutura de automação.
   * `gitautomata run my-automation` → roda localmente.

4. **Testes (TDD)**:

   * Cada módulo com testes unitários (usando Jest ou Vitest).
   * Testes de integração simulando webhook.

---

## 4. Filosofia do Desenvolvimento

* **TDD**:
  Escreve-se o teste de uma automação/feature → só depois implementação.
* **KISS**:
  Nada de arquitetura pesada. O simples funciona melhor.
* **Documentação contínua**:
  Cada automação de exemplo deve servir também como documentação prática.
* **Extensibilidade**:
  O dev deve criar novas automações em minutos (ideal: copiar um exemplo e alterar).

---

## 5. Roadmap (primeiros passos)

1. **Setup básico do repo**: Node.js + TS + Jest/Vitest + ESLint/Prettier.
2. Criar **hello-world automation** que roda via CLI.
3. Criar **servidor básico** que recebe webhook e chama automação.
4. Criar 2 automações de exemplo (auto-label issue, auto-merge PR).
5. Escrever **docs de “como criar automações”**.
6. Criar CLI inicial (`run`, `init`).

---

# ✅ Checklist de Implementação — gitautomata

### 🔧 Infra & Setup

* [ ] Criar repositório inicial com Node.js + TypeScript
* [ ] Configurar `eslint` + `prettier`
* [ ] Configurar `jest` ou `vitest` para TDD
* [ ] Configurar CI/CD básico (lint + testes rodando no PR)
* [ ] Adicionar suporte a variáveis de ambiente (`dotenv`)
* [ ] Criar `Dockerfile` + `docker-compose.yml` (para self-hosted)

---

### 🧩 Core (engine do projeto)

* [ ] Implementar **wrapper da GitHub API** (baseado no `octokit`)
* [ ] Implementar **sistema de automations** (interface `onPush`, `onPR`, etc.)
* [ ] Implementar **runner** para executar automações (manual e via webhook)
* [ ] Implementar **servidor webhook** (`/webhook/github`)
* [ ] Criar **roteador de eventos** (eventos GitHub → automações registradas)
* [ ] Suporte para rodar automações localmente via CLI

---

### 💻 CLI

* [ ] Comando `gitautomata init` → cria estrutura inicial de automação
* [ ] Comando `gitautomata run <automation>` → executa script local
* [ ] Comando `gitautomata list` → lista automações disponíveis
* [ ] Comando `gitautomata test` → roda testes de automações

---

### 🧪 Testes

* [ ] Testes unitários para core (`runner`, `github`, `webhook`)
* [ ] Testes de integração (simulação de webhook com eventos reais do GitHub)
* [ ] Testes end-to-end para execução de automações completas

---

### 📖 Documentação

* [ ] `README.md` inicial (visão geral + como rodar local)
* [ ] `docs/getting-started.md` (setup rápido)
* [ ] `docs/creating-automations.md` (como criar automações passo a passo)
* [ ] `docs/api-reference.md` (funções do wrapper GitHub + CLI)
* [ ] Exemplos prontos em `examples/`

---

### 🤖 Automations (exemplos iniciais)

* [ ] **Auto-label issues** (adiciona labels com base no título ou conteúdo)
* [ ] **Auto-merge PRs** (merge automático se todos os checks passarem)
* [ ] **Release notes** (gera release automaticamente no GitHub a cada tag)
* [ ] **Slack/Discord notifier** (notifica em canais externos ao receber PR/Issue)
* [ ] **Hello-world automation** (demonstração básica de evento → ação)
* [ ] **Script run on demand** (demonstração de Scripts acionados com eventos pre-configurados )

---

### 🔮 Futuro / Extras (talvez seja implementado)

* [ ] Dashboard web (opcional) para visualizar automações rodando
* [ ] Suporte a banco de dados (SQLite/Postgres) para armazenar histórico
* [ ] Hooks customizados (além do GitHub, permitir gatilhos externos)
* [ ] Suporte multi-repo com configuração centralizada
* [ ] Plugins da comunidade
