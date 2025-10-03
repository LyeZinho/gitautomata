import { config } from 'dotenv';

// Carrega variáveis de ambiente
config();

/**
 * Configuração da aplicação
 */
export interface AppConfig {
  port: number;
  nodeEnv: string;
  github: {
    token: string;
    apiUrl: string;
    apiVersion: string;
  };
  webhook: {
    secret?: string;
    path: string;
  };
  cors: {
    origin: string;
  };
  log: {
    level: string;
  };
}

/**
 * Obtém a configuração da aplicação
 */
export function getConfig(): AppConfig {
  const requiredEnvs = ['GITHUB_TOKEN'];
  
  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      throw new Error(`Variável de ambiente obrigatória não encontrada: ${env}`);
    }
  }

  return {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    github: {
      token: process.env.GITHUB_TOKEN!,
      apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
      apiVersion: process.env.GITHUB_API_VERSION || '2022-11-28',
    },
    webhook: {
      secret: process.env.WEBHOOK_SECRET,
      path: process.env.WEBHOOK_PATH || '/webhook/github',
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
    },
    log: {
      level: process.env.LOG_LEVEL || 'info',
    },
  };
}

/**
 * Valida a configuração
 */
export function validateConfig(config: AppConfig): void {
  if (!config.github.token) {
    throw new Error('GitHub token é obrigatório');
  }

  if (config.port < 1 || config.port > 65535) {
    throw new Error('Porta deve estar entre 1 e 65535');
  }
}