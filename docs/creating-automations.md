# 🤖 Criando Automações

Este guia explica como criar suas próprias automações para o gitautomata.

## 📝 Estrutura Básica

Toda automação deve implementar a interface `Automation`:

```typescript
import { Automation, GitHubWebhookEvent, GitHubClient } from '../core/automation';

export const minhaAutomacao: Automation = {
  name: 'minha-automacao',
  description: 'Descrição da automação',

  // Eventos de webhook (opcionais)
  async onPush(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    // Código executado quando há um push
  },

  async onPullRequest(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    // Código executado para eventos de PR
  },

  // Execução manual (opcional)
  async run(github: GitHubClient, ...args: any[]): Promise<void> {
    // Código executado manualmente via CLI ou API
  },
};
```

## 🎯 Eventos Suportados

### Push (`onPush`)
Executado quando há novos commits:

```typescript
async onPush(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
  const { repository, ref, commits } = event;
  
  console.log(`Push em ${repository?.full_name}`);
  console.log(`Branch: ${ref}`);
  console.log(`Commits: ${commits?.length || 0}`);
  
  // Exemplo: verificar se é push na main
  if (ref === 'refs/heads/main') {
    console.log('Push na branch principal!');
  }
}
```

### Pull Request (`onPullRequest`)
Executado para eventos de PR:

```typescript
async onPullRequest(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
  const { action, pull_request, repository } = event;
  
  switch (action) {
    case 'opened':
      console.log(`Novo PR: ${pull_request?.title}`);
      break;
    case 'closed':
      if (pull_request?.merged) {
        console.log('PR mergeado!');
      } else {
        console.log('PR fechado sem merge');
      }
      break;
    case 'synchronize':
      console.log('PR atualizado com novos commits');
      break;
  }
}
```

### Issues (`onIssues`)
Executado para eventos de issues:

```typescript
async onIssues(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
  const { action, issue, repository } = event;
  
  if (action === 'opened') {
    console.log(`Nova issue: ${issue?.title}`);
    
    // Exemplo: adicionar label automática
    if (issue?.title?.toLowerCase().includes('bug')) {
      await github.addLabel(
        repository.owner.login,
        repository.name,
        issue.number,
        ['🐛 bug']
      );
    }
  }
}
```

### Outros Eventos
- `onRelease` - Criação de releases
- `onWorkflowRun` - Execução de workflows (CI/CD)
- `onCheckRun` - Completação de checks
- `onStar` - Repositório recebeu estrela
- `onFork` - Repositório foi forkado

## 🛠️ Usando a API do GitHub

O parâmetro `github` fornece acesso à API do GitHub:

### Métodos de Conveniência

```typescript
// Obter informações do repositório
const repo = await github.getRepo('owner', 'repo');

// Criar issue
const issue = await github.createIssue('owner', 'repo', 'Título', 'Descrição');

// Criar Pull Request
const pr = await github.createPR('owner', 'repo', 'Título', 'feature-branch', 'main', 'Descrição');

// Adicionar labels
await github.addLabel('owner', 'repo', 123, ['bug', 'urgent']);

// Criar release
await github.createRelease('owner', 'repo', 'v1.0.0', 'Release 1.0.0', 'Changelog...');

// Adicionar comentário
await github.addComment('owner', 'repo', 123, 'Comentário');

// Fazer merge de PR
await github.mergePR('owner', 'repo', 123, 'Merge title', 'Merge message', 'squash');
```

### Acesso Direto ao Octokit

Para funcionalidades avançadas, use `github.octokit`:

```typescript
// Listar PRs
const prs = await github.octokit.rest.pulls.list({
  owner: 'owner',
  repo: 'repo',
  state: 'open'
});

// Obter checks de um commit
const checks = await github.octokit.rest.checks.listForRef({
  owner: 'owner',
  repo: 'repo',
  ref: 'sha123'
});

// Listar reviews de um PR
const reviews = await github.octokit.rest.pulls.listReviews({
  owner: 'owner',
  repo: 'repo',
  pull_number: 123
});
```

## 📋 Exemplos Práticos

### 1. Auto-labeling Inteligente

```typescript
export const smartLabelAutomation: Automation = {
  name: 'smart-label',
  description: 'Adiciona labels baseado no conteúdo',

  async onPullRequest(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const { action, pull_request, repository } = event;
    
    if (action !== 'opened' || !pull_request || !repository) return;

    const title = pull_request.title.toLowerCase();
    const labels: string[] = [];

    // Detectar tipo de mudança
    if (title.includes('feat') || title.includes('feature')) {
      labels.push('✨ enhancement');
    }
    if (title.includes('fix') || title.includes('bug')) {
      labels.push('🐛 bug');
    }
    if (title.includes('docs') || title.includes('documentation')) {
      labels.push('📚 documentation');
    }
    if (title.includes('test')) {
      labels.push('🧪 tests');
    }

    // Detectar prioridade
    if (title.includes('urgent') || title.includes('critical')) {
      labels.push('🚨 priority: high');
    }

    if (labels.length > 0) {
      await github.addLabel(
        repository.owner.login,
        repository.name,
        pull_request.number,
        labels
      );
    }
  }
};
```

### 2. Notificação de Deploy

```typescript
export const deployNotificationAutomation: Automation = {
  name: 'deploy-notification',
  description: 'Notifica sobre deploys bem-sucedidos',

  async onWorkflowRun(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const { action, workflow_run, repository } = event;
    
    if (action !== 'completed' || workflow_run?.conclusion !== 'success') return;
    
    // Verificar se é workflow de deploy
    if (workflow_run.name?.includes('deploy') || workflow_run.name?.includes('production')) {
      console.log(`🚀 Deploy realizado com sucesso em ${repository?.full_name}`);
      
      // Aqui você poderia enviar notificações para Slack, Discord, etc.
      // await sendSlackNotification(`Deploy realizado em ${repository?.full_name}`);
    }
  }
};
```

### 3. Automação de Limpeza

```typescript
export const cleanupAutomation: Automation = {
  name: 'cleanup',
  description: 'Limpa branches antigas e issues fechadas',

  async run(github: GitHubClient, owner: string, repo: string): Promise<void> {
    console.log(`🧹 Iniciando limpeza em ${owner}/${repo}`);

    // Listar branches mergeadas
    const branches = await github.octokit.rest.repos.listBranches({
      owner,
      repo
    });

    for (const branch of branches.data) {
      if (branch.name !== 'main' && branch.name !== 'master') {
        // Verificar se branch foi mergeada
        try {
          const comparison = await github.octokit.rest.repos.compareCommits({
            owner,
            repo,
            base: 'main',
            head: branch.name
          });

          if (comparison.data.status === 'behind') {
            console.log(`🗑️ Branch ${branch.name} pode ser removida (já mergeada)`);
            // await github.octokit.rest.git.deleteRef({
            //   owner,
            //   repo,
            //   ref: `heads/${branch.name}`
            // });
          }
        } catch (error) {
          console.log(`Erro ao verificar branch ${branch.name}:`, error);
        }
      }
    }
  }
};
```

## 📊 Tratamento de Erros

Sempre trate erros nas suas automações:

```typescript
export const robustAutomation: Automation = {
  name: 'robust-example',
  
  async onPush(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    try {
      // Sua lógica aqui
      const repo = await github.getRepo('owner', 'repo');
      console.log(`Stars: ${repo.stargazers_count}`);
    } catch (error) {
      console.error('Erro na automação:', error);
      // Não relançar o erro para não quebrar outras automações
    }
  }
};
```

## 🧪 Testando Automações

### Teste Manual
```bash
# Executar via CLI
npm run gitautomata run minha-automacao -- arg1 arg2

# Executar via API
curl -X POST http://localhost:3000/automations/minha-automacao/run \
  -H "Content-Type: application/json" \
  -d '{"args": ["arg1", "arg2"]}'
```

### Teste com Webhook Simulado
```bash
curl -X POST http://localhost:3000/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{
    "ref": "refs/heads/main",
    "repository": {
      "full_name": "test/repo",
      "owner": {"login": "test"},
      "name": "repo"
    }
  }'
```

## 📦 Registrando Automações

### No Servidor (app.ts)
```typescript
import { minhaAutomacao } from '../automations/minha-automacao';

// No método registerAutomations()
this.runner.register(minhaAutomacao);
```

### Carregamento Dinâmico
```typescript
// Carregar todas as automações de uma pasta
const automationFiles = fs.readdirSync('./src/automations');
for (const file of automationFiles) {
  if (file.endsWith('.ts') || file.endsWith('.js')) {
    const automation = require(`./automations/${file}`);
    this.runner.register(automation.default || automation);
  }
}
```

## 💡 Dicas e Boas Práticas

1. **Use nomes descritivos** para suas automações
2. **Sempre adicione descrições** explicando o que a automação faz
3. **Trate erros graciosamente** para não quebrar outras automações
4. **Use console.log** para debug e monitoramento
5. **Verifique se os dados existem** antes de usar (pull_request, repository, etc.)
6. **Teste localmente** antes de colocar em produção
7. **Documente automações complexas** com comentários
8. **Use TypeScript** para melhor segurança de tipos

## 🔧 Configuração Avançada

### Automações com Configuração
```typescript
interface MeuConfig {
  maxRetries: number;
  notificationChannels: string[];
}

export const configurableAutomation: Automation = {
  name: 'configurable',
  
  async run(github: GitHubClient, configPath?: string): Promise<void> {
    const config: MeuConfig = configPath 
      ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
      : { maxRetries: 3, notificationChannels: ['#general'] };
      
    // Usar configuração...
  }
};
```

### Automações com Estado Persistente
```typescript
// Para automações que precisam lembrar de dados entre execuções
const automationState = new Map<string, any>();

export const statefulAutomation: Automation = {
  name: 'stateful',
  
  async onPush(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const repoKey = event.repository?.full_name;
    if (!repoKey) return;
    
    const lastPush = automationState.get(repoKey) || 0;
    const now = Date.now();
    
    if (now - lastPush < 60000) { // 1 minuto
      console.log('Push muito recente, ignorando...');
      return;
    }
    
    automationState.set(repoKey, now);
    console.log('Processando push...');
  }
};
```

Agora você está pronto para criar automações poderosas! 🚀