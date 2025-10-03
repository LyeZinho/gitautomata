# 🚀 Começando com o gitautomata

Este guia irá te ajudar a configurar e rodar o gitautomata pela primeira vez.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18.0 ou superior
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Uma conta no GitHub com um [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

## Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/gitautomata.git
   cd gitautomata
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` e configure:
   ```env
   GITHUB_TOKEN=seu_token_aqui
   WEBHOOK_SECRET=seu_webhook_secret_aqui
   PORT=3000
   ```

## Configuração do GitHub Token

1. Vá para [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Clique em "Generate new token"
3. Selecione os seguintes escopos:
   - `repo` (acesso completo a repositórios)
   - `issues` (leitura/escrita de issues)
   - `pull_requests` (leitura/escrita de PRs)
   - `workflow` (acesso aos GitHub Actions)

## Primeiros Passos

### 1. Executar o servidor localmente

```bash
npm run dev
```

O servidor será iniciado na porta 3000 (ou a porta configurada no `.env`).

### 2. Testar a automação Hello World

```bash
curl -X POST http://localhost:3000/automations/hello-world/run \\
  -H "Content-Type: application/json" \\
  -d '{"args": ["Olá do gitautomata!"]}'
```

### 3. Verificar as automações disponíveis

```bash
curl http://localhost:3000/automations
```

## Configurando Webhooks do GitHub

Para que o gitautomata receba eventos em tempo real do GitHub:

1. Vá para o seu repositório no GitHub
2. Clique em **Settings** > **Webhooks** > **Add webhook**
3. Configure:
   - **Payload URL**: `https://seu-servidor.com/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: o mesmo valor configurado em `WEBHOOK_SECRET`
   - **Events**: Selecione os eventos que você quer monitorar
4. Clique em **Add webhook**

## Estrutura de Pastas

```
gitautomata/
├── src/
│   ├── core/           # Engine principal
│   ├── automations/    # Suas automações
│   ├── server/         # Servidor Express
│   └── utils/          # Utilities
├── tests/              # Testes
├── examples/           # Exemplos de automações
└── docs/               # Documentação
```

## Criando sua primeira automação

Crie um arquivo em `src/automations/minha-automacao.ts`:

```typescript
import { Automation, GitHubWebhookEvent, GitHubClient } from '../core/automation';

export const minhaAutomacao: Automation = {
  name: 'minha-automacao',
  description: 'Minha primeira automação',

  async onPush(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    console.log('Push recebido!', event.repository?.full_name);
  },

  async run(github: GitHubClient): Promise<void> {
    console.log('Executando manualmente!');
  },
};
```

## Próximos Passos

- Leia [Criando Automações](./creating-automations.md) para aprender mais sobre automações
- Veja [Exemplos](../examples/) para inspiração
- Consulte a [API Reference](./api-reference.md) para detalhes técnicos

## Solução de Problemas

### Erro de autenticação

Verifique se:
- O token do GitHub está correto no `.env`
- O token tem as permissões necessárias
- O token não expirou

### Webhook não funciona

Verifique se:
- A URL do webhook está correta
- O secret do webhook confere com o `.env`
- O servidor está acessível pela internet
- Os eventos corretos estão selecionados

### Porta já em uso

Se a porta 3000 estiver em uso, altere no `.env`:
```env
PORT=3001
```

## Suporte

- 📖 [Documentação completa](../docs/)
- 🐛 [Reportar bugs](https://github.com/seu-usuario/gitautomata/issues)
- 💬 [Discussões](https://github.com/seu-usuario/gitautomata/discussions)