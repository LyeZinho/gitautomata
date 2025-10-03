import { Automation, GitHubWebhookEvent, GitHubClient } from './automation';
import { Logger } from '../utils';

/**
 * Resultado da execução de uma automação
 */
export interface AutomationResult {
  success: boolean;
  message?: string;
  error?: Error;
  duration: number;
}

/**
 * Runner para executar automações
 */
export class AutomationRunner {
  private automations: Map<string, Automation> = new Map();
  private logger = new Logger('AutomationRunner');

  /**
   * Registra uma automação
   */
  register(automation: Automation): void {
    this.automations.set(automation.name, automation);
    this.logger.info(`Automação registrada: ${automation.name}`);
  }

  /**
   * Remove uma automação
   */
  unregister(name: string): boolean {
    const removed = this.automations.delete(name);
    if (removed) {
      this.logger.info(`Automação removida: ${name}`);
    }
    return removed;
  }

  /**
   * Lista todas as automações registradas
   */
  list(): Automation[] {
    return Array.from(this.automations.values());
  }

  /**
   * Obtém uma automação específica
   */
  get(name: string): Automation | undefined {
    return this.automations.get(name);
  }

  /**
   * Executa automações baseadas em evento de webhook
   */
  async runWebhookEvent(
    eventType: string,
    event: GitHubWebhookEvent,
    github: GitHubClient
  ): Promise<AutomationResult[]> {
    const results: AutomationResult[] = [];
    const methodName = this.getEventMethodName(eventType);

    for (const automation of this.automations.values()) {
      if (automation[methodName as keyof Automation]) {
        try {
          const startTime = Date.now();
          
          this.logger.info(
            `Executando automação '${automation.name}' para evento '${eventType}'`
          );

          await (automation[methodName as keyof Automation] as Function)(
            event,
            github
          );

          const duration = Date.now() - startTime;
          results.push({
            success: true,
            message: `Automação '${automation.name}' executada com sucesso`,
            duration,
          });

          this.logger.info(
            `Automação '${automation.name}' concluída em ${duration}ms`
          );
        } catch (error) {
          const duration = Date.now() - Date.now();
          const errorObj = error instanceof Error ? error : new Error(String(error));
          
          results.push({
            success: false,
            error: errorObj,
            message: `Erro na automação '${automation.name}': ${errorObj.message}`,
            duration,
          });

          this.logger.error(
            `Erro na automação '${automation.name}':`,
            errorObj
          );
        }
      }
    }

    return results;
  }

  /**
   * Executa uma automação manualmente
   */
  async runManual(
    name: string,
    github: GitHubClient,
    ...args: any[]
  ): Promise<AutomationResult> {
    const automation = this.automations.get(name);
    
    if (!automation) {
      return {
        success: false,
        error: new Error(`Automação '${name}' não encontrada`),
        message: `Automação '${name}' não encontrada`,
        duration: 0,
      };
    }

    if (!automation.run) {
      return {
        success: false,
        error: new Error(`Automação '${name}' não suporta execução manual`),
        message: `Automação '${name}' não suporta execução manual`,
        duration: 0,
      };
    }

    try {
      const startTime = Date.now();
      
      this.logger.info(`Executando automação '${name}' manualmente`);

      await automation.run(github, ...args);

      const duration = Date.now() - startTime;
      const result = {
        success: true,
        message: `Automação '${name}' executada com sucesso`,
        duration,
      };

      this.logger.info(`Automação '${name}' concluída em ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - Date.now();
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      const result = {
        success: false,
        error: errorObj,
        message: `Erro na automação '${name}': ${errorObj.message}`,
        duration,
      };

      this.logger.error(`Erro na automação '${name}':`, errorObj);
      return result;
    }
  }

  /**
   * Converte tipo de evento para nome do método
   */
  private getEventMethodName(eventType: string): string {
    const eventMap: Record<string, string> = {
      push: 'onPush',
      pull_request: 'onPullRequest',
      issues: 'onIssues',
      release: 'onRelease',
      workflow_run: 'onWorkflowRun',
      check_run: 'onCheckRun',
      star: 'onStar',
      fork: 'onFork',
    };

    return eventMap[eventType] || `on${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`;
  }
}