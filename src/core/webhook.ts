import { Request, Response } from 'express';
import { createHmac } from 'crypto';
import { GitHubWebhookEvent } from './automation';
import { Logger } from '../utils';

/**
 * Configuração do webhook
 */
export interface WebhookConfig {
  secret?: string;
  path?: string;
}

/**
 * Handler para eventos de webhook
 */
export type WebhookHandler = (
  eventType: string,
  event: GitHubWebhookEvent,
  req: Request,
  res: Response
) => Promise<void>;

/**
 * Gerenciador de webhooks do GitHub
 */
export class WebhookManager {
  private secret?: string;
  private logger = new Logger('WebhookManager');
  private handlers: WebhookHandler[] = [];

  constructor(config: WebhookConfig = {}) {
    this.secret = config.secret;
  }

  /**
   * Adiciona um handler para eventos de webhook
   */
  addHandler(handler: WebhookHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Remove um handler
   */
  removeHandler(handler: WebhookHandler): boolean {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Middleware Express para processar webhooks
   */
  middleware() {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        // Validar assinatura se secret estiver configurado
        if (this.secret && !this.validateSignature(req)) {
          this.logger.warn('Assinatura de webhook inválida');
          res.status(401).json({ error: 'Invalid signature' });
          return;
        }

        // Extrair tipo de evento
        const eventType = req.headers['x-github-event'] as string;
        if (!eventType) {
          this.logger.warn('Tipo de evento não encontrado no header');
          res.status(400).json({ error: 'Missing event type' });
          return;
        }

        // Extrair dados do evento
        const event: GitHubWebhookEvent = req.body;
        
        this.logger.info(`Webhook recebido: ${eventType}`, {
          action: event.action,
          repository: event.repository?.full_name,
        });

        // Executar handlers
        for (const handler of this.handlers) {
          try {
            await handler(eventType, event, req, res);
          } catch (error) {
            this.logger.error('Erro no handler de webhook:', error);
          }
        }

        res.status(200).json({ success: true });
      } catch (error) {
        this.logger.error('Erro no processamento do webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  /**
   * Valida a assinatura do webhook
   */
  private validateSignature(req: Request): boolean {
    if (!this.secret) return true;

    const signature = req.headers['x-hub-signature-256'] as string;
    if (!signature) return false;

    const body = JSON.stringify(req.body);
    const expectedSignature = `sha256=${createHmac('sha256', this.secret)
      .update(body)
      .digest('hex')}`;

    return signature === expectedSignature;
  }

  /**
   * Cria um webhook payload de teste
   */
  static createTestPayload(eventType: string, data: any = {}): GitHubWebhookEvent {
    const basePayload = {
      action: 'test',
      repository: {
        id: 1,
        full_name: 'test/repo',
        name: 'repo',
        owner: {
          login: 'test',
          id: 1,
        },
      },
      sender: {
        login: 'test-user',
        id: 1,
      },
    };

    return { ...basePayload, ...data };
  }
}