import { Automation, GitHubWebhookEvent, GitHubClient } from '../core/automation';

/**
 * Configuração do auto-labeler
 */
interface AutoLabelConfig {
  rules: Array<{
    pattern: string;
    labels: string[];
    field: 'title' | 'body' | 'branch';
  }>;
}

/**
 * Automação para adicionar labels automaticamente
 * Baseado no título, corpo ou branch do PR/Issue
 */
export const autoLabelAutomation: Automation = {
  name: 'auto-label',
  description: 'Adiciona labels automaticamente baseado em regras configuradas',

  async onPullRequest(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const { action, pull_request, repository } = event;

    // Só processar quando PR é aberto ou atualizado
    if (!action || !['opened', 'synchronize', 'edited'].includes(action)) {
      return;
    }

    if (!pull_request || !repository) {
      return;
    }

    const config: AutoLabelConfig = {
      rules: [
        { pattern: 'fix|bug|hotfix', labels: ['🐛 bug'], field: 'title' },
        { pattern: 'feat|feature', labels: ['✨ enhancement'], field: 'title' },
        { pattern: 'docs|documentation', labels: ['📚 documentation'], field: 'title' },
        { pattern: 'test|testing', labels: ['🧪 tests'], field: 'title' },
        { pattern: 'refactor|cleanup', labels: ['♻️ refactor'], field: 'title' },
        { pattern: 'chore|maintenance', labels: ['🔧 chore'], field: 'title' },
        { pattern: 'breaking change', labels: ['💥 breaking change'], field: 'body' },
        { pattern: 'urgent|critical', labels: ['🚨 priority: high'], field: 'body' },
      ],
    };

    const labelsToAdd: string[] = [];
    const title = pull_request.title?.toLowerCase() || '';
    const body = pull_request.body?.toLowerCase() || '';
    const branch = pull_request.head?.ref?.toLowerCase() || '';

    // Aplicar regras
    for (const rule of config.rules) {
      const regex = new RegExp(rule.pattern, 'i');
      let textToCheck = '';

      switch (rule.field) {
        case 'title':
          textToCheck = title;
          break;
        case 'body':
          textToCheck = body;
          break;
        case 'branch':
          textToCheck = branch;
          break;
      }

      if (regex.test(textToCheck)) {
        labelsToAdd.push(...rule.labels);
      }
    }

    // Remover duplicatas
    const uniqueLabels = [...new Set(labelsToAdd)];

    if (uniqueLabels.length > 0) {
      try {
        await github.addLabel(
          repository.owner.login,
          repository.name,
          pull_request.number,
          uniqueLabels
        );

        console.log(`✅ Labels adicionadas ao PR #${pull_request.number}: ${uniqueLabels.join(', ')}`);
      } catch (error) {
        console.log(`❌ Erro ao adicionar labels ao PR #${pull_request.number}:`, error);
      }
    }
  },

  async onIssues(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    const { action, issue, repository } = event;

    // Só processar quando issue é aberta ou editada
    if (!action || !['opened', 'edited'].includes(action)) {
      return;
    }

    if (!issue || !repository) {
      return;
    }

    const config: AutoLabelConfig = {
      rules: [
        { pattern: 'bug|error|broken|not working', labels: ['🐛 bug'], field: 'title' },
        { pattern: 'feature|enhancement|improvement', labels: ['✨ enhancement'], field: 'title' },
        { pattern: 'question|help|how to', labels: ['❓ question'], field: 'title' },
        { pattern: 'documentation|docs', labels: ['📚 documentation'], field: 'title' },
        { pattern: 'good first issue|beginner', labels: ['👶 good first issue'], field: 'body' },
        { pattern: 'urgent|critical|important', labels: ['🚨 priority: high'], field: 'body' },
      ],
    };

    const labelsToAdd: string[] = [];
    const title = issue.title?.toLowerCase() || '';
    const body = issue.body?.toLowerCase() || '';

    // Aplicar regras
    for (const rule of config.rules) {
      const regex = new RegExp(rule.pattern, 'i');
      let textToCheck = '';

      switch (rule.field) {
        case 'title':
          textToCheck = title;
          break;
        case 'body':
          textToCheck = body;
          break;
        default:
          continue;
      }

      if (regex.test(textToCheck)) {
        labelsToAdd.push(...rule.labels);
      }
    }

    // Remover duplicatas
    const uniqueLabels = [...new Set(labelsToAdd)];

    if (uniqueLabels.length > 0) {
      try {
        await github.addLabel(
          repository.owner.login,
          repository.name,
          issue.number,
          uniqueLabels
        );

        console.log(`✅ Labels adicionadas à issue #${issue.number}: ${uniqueLabels.join(', ')}`);
      } catch (error) {
        console.log(`❌ Erro ao adicionar labels à issue #${issue.number}:`, error);
      }
    }
  },

  async run(github: GitHubClient, owner: string, repo: string, issueNumber: number): Promise<void> {
    try {
      // Obter detalhes da issue/PR
      const issue = await github.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      });

      console.log(`🏷️ Executando auto-label para ${owner}/${repo}#${issueNumber}`);
      
      // Simular evento para processar labels
      const mockEvent: GitHubWebhookEvent = {
        action: 'opened',
        issue: issue.data,
        repository: {
          owner: { login: owner },
          name: repo,
          full_name: `${owner}/${repo}`,
        },
      };

      if (issue.data.pull_request) {
        await this.onPullRequest!(mockEvent, github);
      } else {
        await this.onIssues!(mockEvent, github);
      }
    } catch (error) {
      console.log(`❌ Erro ao executar auto-label:`, error);
    }
  },
};