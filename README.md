# gitautomata

**Source dev kit para criar automações usando a GitHub API.**  
Self-hosted, simples, extensível e feito para programadores que querem criar e rodar suas próprias automações em cima do GitHub.

---

## ✨ Principais ideias

- **Self-hosted** → você roda no seu próprio servidor, mantendo controle total.  
- **Automations** → crie scripts que reagem a eventos do GitHub (webhooks) ou rodem manualmente.  
- **Extensível** → adicione suas automações facilmente em JS/TS.  
- **KISS** → mantenha tudo simples.  
- **TDD-first** → sempre testes antes da implementação.  
- **Documentado** → exemplos claros e documentação prática.

---

## 🚀 Começando

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Token de acesso pessoal do GitHub

### Instalação Rápida
```bash
git clone https://github.com/LyeZinho/gitautomata.git
cd gitautomata
npm install

# Configure o token do GitHub
cp .env.example .env
# Edite .env com seu GITHUB_TOKEN

# Inicie o servidor
npm run dev
```

### Docker (Recomendado para Produção)
```bash
# Clone e configure
git clone https://github.com/LyeZinho/gitautomata.git
cd gitautomata
cp .env.example .env
# Configure seu .env

# Suba com Docker Compose
docker-compose up -d
```

---

## ⚙️ Estrutura do Projeto

```
gitautomata/
├── src/
│   ├── core/          # Núcleo (runner, github wrapper, webhooks)
│   │   ├── automation.ts    # Interfaces base
│   │   ├── runner.ts        # Motor de execução
│   │   ├── github.ts        # Cliente GitHub API
│   │   └── webhook.ts       # Gerenciador de webhooks
│   │
│   ├── automations/   # Suas automações
│   │   ├── hello-world.ts   # Exemplo básico
│   │   └── auto-label.ts    # Auto-labeling
│   │
│   ├── server/        # Servidor Express
│   │   ├── app.ts          # Aplicação principal
│   │   └── index.ts        # Entry point
│   │
│   ├── utils/         # Helpers e configs
│   │   ├── logger.ts       # Sistema de logging
│   │   └── config.ts       # Configuração
│   │
│   └── cli.ts         # Interface de linha de comando
│
├── tests/             # Testes (Vitest)
├── docs/              # Documentação
├── examples/          # Exemplos avançados
├── Dockerfile         # Containerização
└── docker-compose.yml
```

---

## 📦 Uso

### CLI (Interface de Linha de Comando)

```bash
# Listar automações disponíveis
npm run gitautomata list

# Executar automação manualmente
npm run gitautomata run hello-world --args '["Olá mundo!"]'

# Criar nova automação
npm run gitautomata init minha-automacao --template webhook

# Executar testes
npm run gitautomata test
```

### API REST

```bash
# Health check
curl http://localhost:3000/health

# Listar automações
curl http://localhost:3000/automations

# Executar automação
curl -X POST http://localhost:3000/automations/hello-world/run \
  -H "Content-Type: application/json" \
  -d '{"args": ["teste"]}'
```

### Webhooks do GitHub

Configure seu repositório para enviar webhooks para:
```
https://seu-servidor.com/webhook/github
```

Eventos suportados:
- `push` → novos commits
- `pull_request` → PRs abertos/fechados/atualizados  
- `issues` → issues criadas/editadas
- `release` → releases criadas
- `workflow_run` → CI/CD completos
- E muitos outros!

---

## 🤖 Criando Automações

### Estrutura Básica

```typescript
import { Automation, GitHubWebhookEvent, GitHubClient } from '../core/automation';

export const minhaAutomacao: Automation = {
  name: 'minha-automacao',
  description: 'Descrição da automação',

  // Execução manual
  async run(github: GitHubClient, ...args: any[]): Promise<void> {
    console.log('Executando manualmente!');
  },

  // Reação a eventos de webhook
  async onPush(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    console.log('Push detectado!', event.repository?.full_name);
  },

  async onPullRequest(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const { action, pull_request } = event;
    if (action === 'opened') {
      // Adicionar comentário de boas-vindas
      await github.addComment(
        event.repository.owner.login,
        event.repository.name,
        pull_request.number,
        'Obrigado pela contribuição! 🎉'
      );
    }
  },
};
```

### Automações Pré-construídas

#### 🏷️ Auto-Label
Adiciona labels automaticamente baseado no título/conteúdo:

```typescript
import { autoLabelAutomation } from './src/automations/auto-label';
// Detecta "fix", "feat", "docs" etc. e adiciona labels correspondentes
```

#### 👋 Hello World  
Demonstração básica de todos os eventos:

```typescript
import { helloWorldAutomation } from './src/automations/hello-world';
// Exemplos de como reagir a push, PR, issues, etc.
```

---

## 🧪 Testando

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm test -- --coverage
```

### Teste Manual
```bash
# Testar webhook localmente (use ngrok ou similar)
curl -X POST http://localhost:3000/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref": "refs/heads/main", "repository": {"full_name": "test/repo"}}'
```

---

## 🚀 Deploy em Produção

### Docker Compose (Recomendado)

```bash
# 1. Configure .env
cp .env.example .env
# Edite GITHUB_TOKEN, WEBHOOK_SECRET, etc.

# 2. Suba os serviços
docker-compose up -d

# 3. Verifique logs
docker-compose logs -f gitautomata

# 4. Teste
curl http://localhost:3000/health
```

### Variáveis de Ambiente Essenciais

```env
GITHUB_TOKEN=ghp_seu_token_aqui
WEBHOOK_SECRET=seu_secret_super_seguro
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📖 Documentação Completa

- 📚 [Getting Started](./docs/getting-started.md) - Tutorial passo a passo
- 🛠️ [API Reference](./docs/api-reference.md) - Documentação técnica
- 💡 [Exemplos Avançados](./examples/) - Auto-merge, Slack, etc.
- 🔧 [GitHub API Reference](./github-api-reference.md) - Endpoints úteis

---

## 🛠 Roadmap

### ✅ Implementado
- [x] Core engine de automações
- [x] Servidor webhook + API REST
- [x] CLI básico
- [x] Automações de exemplo
- [x] Testes unitários
- [x] Docker support
- [x] Documentação

### 🔄 Em Andamento
- [ ] Loader automático de automações
- [ ] Dashboard web (opcional)
- [ ] Mais exemplos (auto-merge, release notes)

### 🚀 Próximas Features
- [ ] Plugins da comunidade
- [ ] Suporte multi-repo
- [ ] Integração com bancos de dados
- [ ] Métricas e monitoramento

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Estrutura de Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova automação de auto-merge
fix: corrige webhook handler para issues
docs: atualiza README com exemplos
test: adiciona testes para runner
```

---

## ⚡ Exemplos Rápidos

### Auto-merge PRs de Dependabot
```bash
# Usar o exemplo examples/auto-merge.ts
# Configura merge automático para PRs aprovados
```

### Notificações no Slack
```bash
# Usar o exemplo examples/notify-slack.ts  
# Envia notificações para Slack em eventos importantes
```

### Labels Inteligentes
```bash
# Usar automação auto-label
# Detecta "feat:", "fix:", "docs:" e adiciona labels
```

---

## 📜 Licença

[MIT](./LICENSE) © 2025 Pedro Kaleb

---

## 💬 Suporte e Comunidade

- 🐛 [Issues](https://github.com/LyeZinho/gitautomata/issues) - Bugs e requests
- 💡 [Discussions](https://github.com/LyeZinho/gitautomata/discussions) - Ideias e dúvidas
- 📧 Email: [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

---

**⭐ Se o gitautomata foi útil, deixe uma estrela no repositório!**


