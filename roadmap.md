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


