/**
 * Níveis de log
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * Configuração do logger
 */
export interface LoggerConfig {
  level: LogLevel;
  enableColors: boolean;
  enableTimestamp: boolean;
}

/**
 * Logger simples para o gitautomata
 */
export class Logger {
  private name: string;
  private config: LoggerConfig;

  constructor(name: string, config: Partial<LoggerConfig> = {}) {
    this.name = name;
    this.config = {
      level: LogLevel.INFO,
      enableColors: true,
      enableTimestamp: true,
      ...config,
    };
  }

  /**
   * Log de erro
   */
  error(message: string, ...args: any[]): void {
    if (this.config.level >= LogLevel.ERROR) {
      this.log('ERROR', message, ...args);
    }
  }

  /**
   * Log de warning
   */
  warn(message: string, ...args: any[]): void {
    if (this.config.level >= LogLevel.WARN) {
      this.log('WARN', message, ...args);
    }
  }

  /**
   * Log de informação
   */
  info(message: string, ...args: any[]): void {
    if (this.config.level >= LogLevel.INFO) {
      this.log('INFO', message, ...args);
    }
  }

  /**
   * Log de debug
   */
  debug(message: string, ...args: any[]): void {
    if (this.config.level >= LogLevel.DEBUG) {
      this.log('DEBUG', message, ...args);
    }
  }

  /**
   * Método interno para log
   */
  private log(level: string, message: string, ...args: any[]): void {
    const timestamp = this.config.enableTimestamp 
      ? `[${new Date().toISOString()}]` 
      : '';
    
    const prefix = this.config.enableColors 
      ? this.colorize(level, `${timestamp} [${level}] [${this.name}]`)
      : `${timestamp} [${level}] [${this.name}]`;

    console.log(`${prefix} ${message}`, ...args);
  }

  /**
   * Adiciona cores ao log
   */
  private colorize(level: string, text: string): string {
    const colors: Record<string, string> = {
      ERROR: '\x1b[31m', // Vermelho
      WARN: '\x1b[33m',  // Amarelo
      INFO: '\x1b[36m',  // Ciano
      DEBUG: '\x1b[37m', // Branco
    };

    const reset = '\x1b[0m';
    return `${colors[level] || ''}${text}${reset}`;
  }

  /**
   * Cria um logger com configuração global
   */
  static create(name: string): Logger {
    const level = process.env.LOG_LEVEL?.toUpperCase() as keyof typeof LogLevel;
    const logLevel = level ? LogLevel[level] : LogLevel.INFO;

    return new Logger(name, {
      level: logLevel,
      enableColors: process.env.NODE_ENV !== 'production',
      enableTimestamp: true,
    });
  }
}