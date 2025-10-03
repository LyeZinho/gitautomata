# 📚 API Reference

Documentação completa da API do gitautomata.

## 🌐 REST API

### Base URL
```
http://localhost:3000
```

### Headers Comuns
```http
Content-Type: application/json
```

---

## 🏥 Health Check

### GET /health

Verifica se o servidor está funcionando.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "version": "0.1.0"
}
```

---

## 🤖 Automações

### GET /automations

Lista todas as automações registradas.

**Response:**
```json
{
  "automations": [
    {
      "name": "hello-world",
      "description": "Automação de exemplo que demonstra a estrutura básica",
      "events": ["push", "pull_request", "issues"],
      "hasManualRun": true
    }
  ]
}
```

### POST /automations/:name/run

Executa uma automação manualmente.

**Parameters:**
- `name` (string) - Nome da automação

**Body:**
```json
{
  "args": ["arg1", "arg2", "..."]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Automação executada com sucesso",
  "duration": 150
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Erro específico",
  "message": "Mensagem de erro detalhada"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/automations/hello-world/run \
  -H "Content-Type: application/json" \
  -d '{"args": ["Olá mundo!"]}'
```

---

## 🔗 Webhooks

### POST /webhook/github

Endpoint para receber webhooks do GitHub.

**Headers:**
```http
X-GitHub-Event: push|pull_request|issues|...
X-Hub-Signature-256: sha256=... (se webhook secret estiver configurado)
```

**Body:**
Payload do webhook do GitHub (varia por evento)

**Response:**
```json
{
  "success": true
}
```

---

## 💻 CLI Commands

### gitautomata list

Lista automações disponíveis.

```bash
npm run gitautomata list
```

**Output:**
```
📋 Automações disponíveis:

🤖 hello-world
   Automação de exemplo que demonstra a estrutura básica

🤖 auto-label
   Adiciona labels automaticamente baseado em regras configuradas
```

### gitautomata run <automation>

Executa uma automação manualmente.

```bash
npm run gitautomata run hello-world --args '["Olá!"]'
```

**Options:**
- `-a, --args <args>` - Argumentos para a automação (JSON)

### gitautomata init [name]

Cria uma nova automação a partir de um template.

```bash
npm run gitautomata init minha-automacao --template webhook
```

**Options:**
- `-t, --template <template>` - Template a usar (basic, webhook, manual)

**Templates Disponíveis:**
- `basic` - Automação básica com execução manual
- `webhook` - Automação que reage a eventos do GitHub
- `manual` - Automação para execução manual apenas

### gitautomata test

Executa os testes das automações.

```bash
npm run gitautomata test
```

---

## 🔧 Core Classes

### Automation Interface

Interface base para todas as automações.

```typescript
export interface Automation {
  name: string;
  description?: string;
  
  // Eventos de webhook (todos opcionais)
  onPush?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onPullRequest?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onIssues?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onRelease?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onWorkflowRun?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onCheckRun?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onStar?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onFork?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  
  // Execução manual (opcional)
  run?: (github: GitHubClient, ...args: any[]) => Promise<void>;
}
```

### GitHubClient Interface

Cliente para interagir com a API do GitHub.

```typescript
export interface GitHubClient {
  octokit: Octokit;
  
  // Métodos de conveniência
  getRepo(owner: string, repo: string): Promise<any>;
  createIssue(owner: string, repo: string, title: string, body?: string): Promise<any>;
  createPR(owner: string, repo: string, title: string, head: string, base: string, body?: string): Promise<any>;
  addLabel(owner: string, repo: string, issueNumber: number, labels: string[]): Promise<any>;
  createRelease(owner: string, repo: string, tagName: string, name?: string, body?: string): Promise<any>;
  mergePR(owner: string, repo: string, pullNumber: number, commitTitle?: string, commitMessage?: string, mergeMethod?: 'merge' | 'squash' | 'rebase'): Promise<any>;
  addComment(owner: string, repo: string, issueNumber: number, body: string): Promise<any>;
  getCommitChecks(owner: string, repo: string, ref: string): Promise<any>;
}
```

### AutomationRunner Class

Gerencia e executa automações.

```typescript
export class AutomationRunner {
  // Registrar automação
  register(automation: Automation): void;
  
  // Remover automação
  unregister(name: string): boolean;
  
  // Listar automações
  list(): Automation[];
  
  // Obter automação específica
  get(name: string): Automation | undefined;
  
  // Executar por webhook
  runWebhookEvent(eventType: string, event: GitHubWebhookEvent, github: GitHubClient): Promise<AutomationResult[]>;
  
  // Executar manualmente
  runManual(name: string, github: GitHubClient, ...args: any[]): Promise<AutomationResult>;
}
```

### AutomationResult Interface

Resultado da execução de uma automação.

```typescript
export interface AutomationResult {
  success: boolean;
  message?: string;
  error?: Error;
  duration: number;
}
```

---

## 🐙 GitHub API Examples

### Usando Octokit Diretamente

```typescript
// Listar repositórios do usuário
const repos = await github.octokit.rest.repos.listForAuthenticatedUser();

// Obter detalhes de um PR
const pr = await github.octokit.rest.pulls.get({
  owner: 'owner',
  repo: 'repo',
  pull_number: 123
});

// Criar um comentário
await github.octokit.rest.issues.createComment({
  owner: 'owner',
  repo: 'repo',
  issue_number: 123,
  body: 'Meu comentário'
});

// Listar commits de um PR
const commits = await github.octokit.rest.pulls.listCommits({
  owner: 'owner',
  repo: 'repo',
  pull_number: 123
});

// Adicionar reviewers a um PR
await github.octokit.rest.pulls.requestReviewers({
  owner: 'owner',
  repo: 'repo',
  pull_number: 123,
  reviewers: ['user1', 'user2']
});

// Criar um check run
await github.octokit.rest.checks.create({
  owner: 'owner',
  repo: 'repo',
  name: 'my-check',
  head_sha: 'sha123',
  status: 'completed',
  conclusion: 'success',
  output: {
    title: 'Check passou!',
    summary: 'Tudo está funcionando'
  }
});
```

---

## 🔒 Autenticação

### Personal Access Token

Configure um token no arquivo `.env`:

```env
GITHUB_TOKEN=ghp_seu_token_aqui
```

**Escopos necessários:**
- `repo` - Acesso completo a repositórios
- `issues` - Leitura/escrita de issues
- `pull_requests` - Leitura/escrita de PRs
- `workflow` - Acesso aos GitHub Actions

### Webhook Secret

Para validar webhooks, configure um secret:

```env
WEBHOOK_SECRET=seu_secret_super_seguro
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# GitHub
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_API_URL=https://api.github.com
GITHUB_API_VERSION=2022-11-28

# Webhook
WEBHOOK_SECRET=your_webhook_secret_here
WEBHOOK_PATH=/webhook/github

# Servidor
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

### AppConfig Interface

```typescript
export interface AppConfig {
  port: number;
  nodeEnv: string;
  github: {
    token: string;
    apiUrl: string;
    apiVersion: string;
  };
  webhook: {
    secret?: string;
    path: string;
  };
  cors: {
    origin: string;
  };
  log: {
    level: string;
  };
}
```

---

## 📊 Logging

### Logger Class

```typescript
export class Logger {
  constructor(name: string, config?: Partial<LoggerConfig>);
  
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  
  static create(name: string): Logger;
}
```

### Log Levels

```typescript
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}
```

**Configuração via ENV:**
```env
LOG_LEVEL=debug  # error, warn, info, debug
```

---

## 🧪 Testing

### Mock GitHub Client

```typescript
const mockGitHubClient: GitHubClient = {
  octokit: {} as any,
  getRepo: async () => ({}),
  createIssue: async () => ({}),
  createPR: async () => ({}),
  addLabel: async () => ({}),
  createRelease: async () => ({}),
  mergePR: async () => ({}),
  addComment: async () => ({}),
  getCommitChecks: async () => ({}),
};
```

### Test Webhook Payload

```typescript
const testEvent = WebhookManager.createTestPayload('push', {
  ref: 'refs/heads/main',
  repository: {
    full_name: 'test/repo',
    owner: { login: 'test' },
    name: 'repo'
  }
});
```

---

## 🚨 Error Handling

### HTTP Status Codes

- `200` - Sucesso
- `400` - Erro na requisição (automação falhou)
- `401` - Não autorizado (signature inválida)
- `404` - Endpoint/automação não encontrada
- `500` - Erro interno do servidor

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## 📈 Monitoring

### Métricas Básicas

O gitautomata registra automaticamente:
- Execuções de automações
- Duração das execuções
- Sucessos e falhas
- Eventos de webhook recebidos

### Health Check

Use o endpoint `/health` para monitorar o status do servidor:

```bash
curl http://localhost:3000/health
```

---

## 🔧 Extensões

### Adicionando Novos Tipos de Evento

1. Adicione o método na interface `Automation`:
```typescript
onMeuEvento?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
```

2. Adicione o mapeamento no `AutomationRunner`:
```typescript
private getEventMethodName(eventType: string): string {
  const eventMap: Record<string, string> = {
    // ...eventos existentes
    meu_evento: 'onMeuEvento',
  };
  // ...
}
```

### Middlewares Customizados

```typescript
// Adicionar middleware personalizado
this.app.use('/api', (req, res, next) => {
  // Sua lógica aqui
  next();
});
```

---

## 📝 Changelog

### v0.1.0
- Implementação inicial
- Core engine de automações
- Servidor webhook + API REST
- CLI básico
- Automações de exemplo
- Testes unitários
- Docker support
- Documentação completa

---

Para mais informações, consulte:
- [Getting Started](./getting-started.md)
- [Creating Automations](./creating-automations.md)
- [GitHub API Reference](../github-api-reference.md)