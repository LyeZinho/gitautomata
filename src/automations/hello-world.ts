import { Automation, GitHubWebhookEvent, GitHubClient } from '../core/automation';

/**
 * Automação simples de Hello World
 * Demonstra a estrutura básica de uma automação
 */
export const helloWorldAutomation: Automation = {
  name: 'hello-world',
  description: 'Automação de exemplo que demonstra a estrutura básica',

  // Execução manual
  async run(github: GitHubClient, message?: string): Promise<void> {
    console.log('🤖 Hello World do gitautomata!');
    
    if (message) {
      console.log(`📨 Mensagem: ${message}`);
    }

    // Exemplo de uso da API do GitHub
    try {
      const user = await github.octokit.rest.users.getAuthenticated();
      console.log(`👤 Usuário autenticado: ${user.data.login}`);
    } catch (error) {
      console.log('❌ Erro ao obter usuário:', error);
    }
  },

  // Reage a eventos de push
  async onPush(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const { repository, ref, pusher } = event;
    
    console.log('📤 Push detectado!');
    console.log(`  Repositório: ${repository?.full_name}`);
    console.log(`  Branch: ${ref}`);
    console.log(`  Autor: ${pusher?.name || 'Desconhecido'}`);
    
    // Exemplo: comentar no commit
    if (event.head_commit) {
      console.log(`  Commit: ${event.head_commit.message}`);
    }
  },

  // Reage a eventos de Pull Request
  async onPullRequest(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const { action, pull_request, repository } = event;
    
    console.log('🔀 Pull Request detectado!');
    console.log(`  Ação: ${action}`);
    console.log(`  Repositório: ${repository?.full_name}`);
    console.log(`  PR #${pull_request?.number}: ${pull_request?.title}`);
    console.log(`  Autor: ${pull_request?.user?.login}`);
    
    // Exemplo: adicionar comentário de boas-vindas para novos PRs
    if (action === 'opened' && pull_request && repository) {
      const welcomeMessage = `🤖 Olá @${pull_request.user?.login}! 

Obrigado por contribuir com o ${repository.name}! 

Este PR será revisado em breve. 🚀`;

      try {
        await github.addComment(
          repository.owner.login,
          repository.name,
          pull_request.number,
          welcomeMessage
        );
        console.log('✅ Comentário de boas-vindas adicionado!');
      } catch (error) {
        console.log('❌ Erro ao adicionar comentário:', error);
      }
    }
  },

  // Reage a eventos de issues
  async onIssues(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const { action, issue, repository } = event;
    
    console.log('🐛 Issue detectada!');
    console.log(`  Ação: ${action}`);
    console.log(`  Repositório: ${repository?.full_name}`);
    console.log(`  Issue #${issue?.number}: ${issue?.title}`);
    console.log(`  Autor: ${issue?.user?.login}`);
  },
};