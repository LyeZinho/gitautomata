import express, { Request, Response } from 'express';
import cors from 'cors';
import { AutomationRunner } from '../core/runner';
import { GitHub } from '../core/github';
import { WebhookManager } from '../core/webhook';
import { getConfig, validateConfig, Logger } from '../utils';

/**
 * Servidor principal do gitautomata
 */
export class GitAutomataServer {
  private app: express.Application;
  private config: ReturnType<typeof getConfig>;
  private logger: Logger;
  private runner: AutomationRunner;
  private github: GitHub;
  private webhookManager: WebhookManager;

  constructor() {
    this.config = getConfig();
    validateConfig(this.config);

    this.logger = Logger.create('Server');
    this.app = express();
    this.runner = new AutomationRunner();
    this.github = new GitHub(this.config.github.token, this.config.github.apiVersion);
    this.webhookManager = new WebhookManager({
      secret: this.config.webhook.secret,
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebhookHandler();
  }

  /**
   * Configura middlewares
   */
  private setupMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: this.config.cors.origin,
    }));

    // JSON parser
    this.app.use(express.json({
      limit: '10mb',
    }));

    // Raw body parser para webhooks
    this.app.use('/webhook', express.raw({ type: 'application/json' }));

    // Request logging
    this.app.use((req: Request, res: Response, next) => {
      this.logger.debug(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Configura rotas
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
      });
    });

    // Listar automações
    this.app.get('/automations', (req: Request, res: Response) => {
      const automations = this.runner.list().map(automation => ({
        name: automation.name,
        description: automation.description,
        hasRun: !!automation.run,
        events: this.getAutomationEvents(automation),
      }));

      res.json({ automations });
    });

    // Executar automação manualmente
    this.app.post('/automations/:name/run', async (req: Request, res: Response) => {
      try {
        const { name } = req.params;
        const { args = [] } = req.body;

        const result = await this.runner.runManual(name, this.github, ...args);

        if (result.success) {
          res.json({
            success: true,
            message: result.message,
            duration: result.duration,
          });
        } else {
          res.status(400).json({
            success: false,
            message: result.message,
            error: result.error?.message,
          });
        }
      } catch (error) {
        this.logger.error('Erro ao executar automação:', error);
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    });

    // Webhook do GitHub
    this.app.post(this.config.webhook.path, this.webhookManager.middleware());

    // Rota não encontrada
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.path,
      });
    });
  }

  /**
   * Configura handler de webhook
   */
  private setupWebhookHandler(): void {
    this.webhookManager.addHandler(async (eventType, event) => {
      try {
        const results = await this.runner.runWebhookEvent(eventType, event, this.github);
        
        this.logger.info(`Webhook processado: ${eventType}`, {
          results: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
        });
      } catch (error) {
        this.logger.error(`Erro no processamento do webhook ${eventType}:`, error);
      }
    });
  }

  /**
   * Obtém eventos suportados por uma automação
   */
  private getAutomationEvents(automation: any): string[] {
    const events: string[] = [];
    const eventMethods = [
      'onPush', 'onPullRequest', 'onIssues', 'onRelease',
      'onWorkflowRun', 'onCheckRun', 'onStar', 'onFork',
    ];

    for (const method of eventMethods) {
      if (automation[method]) {
        events.push(method.replace('on', '').toLowerCase());
      }
    }

    return events;
  }

  /**
   * Obtém o runner de automações
   */
  public getRunner(): AutomationRunner {
    return this.runner;
  }

  /**
   * Obtém o cliente GitHub
   */
  public getGitHub(): GitHub {
    return this.github;
  }

  /**
   * Inicia o servidor
   */
  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.config.port, () => {
        this.logger.info(`Servidor iniciado na porta ${this.config.port}`);
        this.logger.info(`Webhook endpoint: ${this.config.webhook.path}`);
        this.logger.info(`Environment: ${this.config.nodeEnv}`);
        resolve();
      });
    });
  }
}