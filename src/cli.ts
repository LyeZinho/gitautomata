#!/usr/bin/env node

import { program } from 'commander';
import { AutomationRunner } from './core/runner';
import { GitHub } from './core/github';
import { getConfig, Logger } from './utils';

const logger = Logger.create('CLI');

program
  .name('gitautomata')
  .description('CLI para o gitautomata - automações para GitHub')
  .version('0.1.0');

program
  .command('run <automation>')
  .description('Executa uma automação manualmente')
  .option('-a, --args <args>', 'Argumentos para a automação (JSON)', '[]')
  .action(async (automationName: string, options) => {
    try {
      const config = getConfig();
      const github = new GitHub(config.github.token);
      const runner = new AutomationRunner();

      // Aqui você carregaria as automações registradas
      // Por agora, vamos simular
      logger.info(`Executando automação: ${automationName}`);
      
      const args = JSON.parse(options.args);
      const result = await runner.runManual(automationName, github, ...args);

      if (result.success) {
        logger.info(`✅ Automação executada com sucesso em ${result.duration}ms`);
        if (result.message) {
          console.log(result.message);
        }
      } else {
        logger.error(`❌ Erro na execução: ${result.message}`);
        if (result.error) {
          console.error(result.error);
        }
        process.exit(1);
      }
    } catch (error) {
      logger.error('Erro fatal:', error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('Lista todas as automações disponíveis')
  .action(async () => {
    try {
      const runner = new AutomationRunner();
      
      // Aqui você carregaria as automações registradas
      const automations = runner.list();

      if (automations.length === 0) {
        console.log('Nenhuma automação registrada.');
        return;
      }

      console.log('\\n📋 Automações disponíveis:\\n');
      
      for (const automation of automations) {
        console.log(`🤖 ${automation.name}`);
        if (automation.description) {
          console.log(`   ${automation.description}`);
        }
        console.log('');
      }
    } catch (error) {
      logger.error('Erro ao listar automações:', error);
      process.exit(1);
    }
  });

program
  .command('init [name]')
  .description('Cria uma nova automação')
  .option('-t, --template <template>', 'Template a usar (basic, webhook, manual)', 'basic')
  .action(async (name: string = 'nova-automacao', options) => {
    try {
      const automationName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const fileName = `src/automations/${automationName}.ts`;

      const templates = {
        basic: generateBasicTemplate(automationName),
        webhook: generateWebhookTemplate(automationName),
        manual: generateManualTemplate(automationName),
      };

      const template = templates[options.template as keyof typeof templates];
      if (!template) {
        logger.error(`Template '${options.template}' não encontrado. Use: basic, webhook, manual`);
        process.exit(1);
      }

      // Aqui você salvaria o arquivo
      console.log(`\\n📝 Template para automação '${automationName}':\\n`);
      console.log(`Arquivo: ${fileName}\\n`);
      console.log(template);
      console.log('\\n✅ Use este código para criar sua automação!');
    } catch (error) {
      logger.error('Erro ao criar automação:', error);
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Executa os testes das automações')
  .action(async () => {
    logger.info('Executando testes...');
    // Aqui você executaria os testes
    console.log('npm test');
  });

// Templates para diferentes tipos de automações
function generateBasicTemplate(name: string): string {
  return `import { Automation, GitHubWebhookEvent, GitHubClient } from '../core/automation';

export const ${name.replace(/-/g, '')}Automation: Automation = {
  name: '${name}',
  description: 'Descrição da automação ${name}',

  async run(github: GitHubClient, ...args: any[]): Promise<void> {
    console.log('🤖 Executando automação ${name}');
    
    // Sua lógica aqui
    
    console.log('✅ Automação ${name} concluída');
  },
};`;
}

function generateWebhookTemplate(name: string): string {
  return `import { Automation, GitHubWebhookEvent, GitHubClient } from '../core/automation';

export const ${name.replace(/-/g, '')}Automation: Automation = {
  name: '${name}',
  description: 'Automação que reage a eventos do GitHub',

  async onPush(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    console.log('📤 Push detectado:', event.repository?.full_name);
    
    // Sua lógica para push aqui
  },

  async onPullRequest(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    console.log('🔀 Pull Request:', event.action, event.pull_request?.number);
    
    // Sua lógica para PR aqui
  },

  async onIssues(event: GitHubWebhookEvent, github: GitHubClient): Promise<void> {
    console.log('🐛 Issue:', event.action, event.issue?.number);
    
    // Sua lógica para issues aqui
  },
};`;
}

function generateManualTemplate(name: string): string {
  return `import { Automation, GitHubClient } from '../core/automation';

export const ${name.replace(/-/g, '')}Automation: Automation = {
  name: '${name}',
  description: 'Automação para execução manual',

  async run(github: GitHubClient, owner: string, repo: string): Promise<void> {
    console.log(\`🤖 Executando \${this.name} em \${owner}/\${repo}\`);
    
    try {
      // Obter informações do repositório
      const repoInfo = await github.getRepo(owner, repo);
      console.log(\`📁 Repositório: \${repoInfo.full_name}\`);
      console.log(\`⭐ Stars: \${repoInfo.stargazers_count}\`);
      
      // Sua lógica aqui
      
      console.log('✅ Automação concluída com sucesso');
    } catch (error) {
      console.error('❌ Erro na automação:', error);
      throw error;
    }
  },
};`;
}

program.parse();