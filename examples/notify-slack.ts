import { Automation, GitHubWebhookEvent, GitHubClient } from '../src/core/automation';

/**
 * Exemplo: Notificação via Slack quando uma issue é aberta
 */
export const slackNotifierAutomation: Automation = {
  name: 'slack-notifier',
  description: 'Envia notificações para o Slack quando eventos importantes acontecem',

  async onIssues(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const { action, issue, repository } = event;

    if (action === 'opened' && issue && repository) {
      const message = {
        text: `🐛 Nova issue aberta!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Nova issue em ${repository.full_name}*\\n\\n*${issue.title}*\\n\\n${issue.body?.substring(0, 200)}${issue.body && issue.body.length > 200 ? '...' : ''}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Criada por: *${issue.user?.login}* | <${issue.html_url}|Ver issue>`,
              },
            ],
          },
        ],
      };

      // Aqui você enviaria para o Slack
      // await sendToSlack(message);
      console.log('📱 Enviaria para o Slack:', JSON.stringify(message, null, 2));
    }
  },

  async onPullRequest(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const { action, pull_request, repository } = event;

    if (action === 'opened' && pull_request && repository) {
      const message = {
        text: `🔀 Novo Pull Request!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Novo PR em ${repository.full_name}*\\n\\n*${pull_request.title}*\\n\\n${pull_request.body?.substring(0, 200)}${pull_request.body && pull_request.body.length > 200 ? '...' : ''}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Criado por: *${pull_request.user?.login}* | <${pull_request.html_url}|Ver PR>`,
              },
            ],
          },
        ],
      };

      console.log('📱 Enviaria para o Slack:', JSON.stringify(message, null, 2));
    }
  },
};

/**
 * Função helper para enviar mensagens para o Slack
 * Você precisaria implementar isso com a API do Slack
 */
async function sendToSlack(message: any): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error('SLACK_WEBHOOK_URL não configurada');
  }

  // Implementar chamada HTTP para o Slack
  // const response = await fetch(webhookUrl, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(message),
  // });
}