import { describe, it, expect, beforeEach } from 'vitest';
import { AutomationRunner } from '../../src/core/runner';
import { Automation, GitHubClient } from '../../src/core/automation';

// Mock do GitHub client
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

// Automação de teste
const testAutomation: Automation = {
  name: 'test-automation',
  description: 'Automação para testes',
  
  async onPush(event, github) {
    // Mock implementation
  },
  
  async run(github, ...args) {
    return Promise.resolve();
  },
};

describe('AutomationRunner', () => {
  let runner: AutomationRunner;

  beforeEach(() => {
    runner = new AutomationRunner();
  });

  describe('register', () => {
    it('deve registrar uma automação', () => {
      runner.register(testAutomation);
      
      const automations = runner.list();
      expect(automations).toHaveLength(1);
      expect(automations[0].name).toBe('test-automation');
    });

    it('deve sobrescrever automação com mesmo nome', () => {
      const automation1: Automation = {
        name: 'same-name',
        description: 'First',
      };
      
      const automation2: Automation = {
        name: 'same-name',
        description: 'Second',
      };

      runner.register(automation1);
      runner.register(automation2);

      const automations = runner.list();
      expect(automations).toHaveLength(1);
      expect(automations[0].description).toBe('Second');
    });
  });

  describe('unregister', () => {
    it('deve remover uma automação', () => {
      runner.register(testAutomation);
      expect(runner.list()).toHaveLength(1);

      const removed = runner.unregister('test-automation');
      expect(removed).toBe(true);
      expect(runner.list()).toHaveLength(0);
    });

    it('deve retornar false para automação inexistente', () => {
      const removed = runner.unregister('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('get', () => {
    it('deve retornar automação existente', () => {
      runner.register(testAutomation);
      
      const automation = runner.get('test-automation');
      expect(automation).toBeDefined();
      expect(automation?.name).toBe('test-automation');
    });

    it('deve retornar undefined para automação inexistente', () => {
      const automation = runner.get('non-existent');
      expect(automation).toBeUndefined();
    });
  });

  describe('runManual', () => {
    it('deve executar automação manualmente', async () => {
      let executed = false;
      
      const automation: Automation = {
        name: 'manual-test',
        async run() {
          executed = true;
        },
      };

      runner.register(automation);
      
      const result = await runner.runManual('manual-test', mockGitHubClient);
      
      expect(result.success).toBe(true);
      expect(executed).toBe(true);
    });

    it('deve retornar erro para automação inexistente', async () => {
      const result = await runner.runManual('non-existent', mockGitHubClient);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('não encontrada');
    });

    it('deve retornar erro para automação sem método run', async () => {
      const automation: Automation = {
        name: 'no-run',
        // Sem método run
      };

      runner.register(automation);
      
      const result = await runner.runManual('no-run', mockGitHubClient);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('não suporta execução manual');
    });
  });

  describe('runWebhookEvent', () => {
    it('deve executar automações para evento push', async () => {
      let pushExecuted = false;
      
      const automation: Automation = {
        name: 'webhook-test',
        async onPush() {
          pushExecuted = true;
        },
      };

      runner.register(automation);
      
      const results = await runner.runWebhookEvent(
        'push',
        { ref: 'refs/heads/main' },
        mockGitHubClient
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(pushExecuted).toBe(true);
    });

    it('deve pular automações que não suportam o evento', async () => {
      const automation: Automation = {
        name: 'no-push',
        // Sem onPush
      };

      runner.register(automation);
      
      const results = await runner.runWebhookEvent(
        'push',
        { ref: 'refs/heads/main' },
        mockGitHubClient
      );
      
      expect(results).toHaveLength(0);
    });

    it('deve capturar erros em automações', async () => {
      const automation: Automation = {
        name: 'error-test',
        async onPush() {
          throw new Error('Test error');
        },
      };

      runner.register(automation);
      
      const results = await runner.runWebhookEvent(
        'push',
        { ref: 'refs/heads/main' },
        mockGitHubClient
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error?.message).toBe('Test error');
    });
  });
});