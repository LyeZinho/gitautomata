import { GitAutomataServer } from './app';
import { Logger } from '../utils';

/**
 * Entry point do servidor
 */
async function main(): Promise<void> {
  const logger = Logger.create('Main');

  try {
    logger.info('Iniciando gitautomata...');

    const server = new GitAutomataServer();
    
    // Registrar automações aqui ou carregá-las dinamicamente
    // TODO: Implementar carregamento automático de automações
    
    await server.start();
    
    logger.info('gitautomata iniciado com sucesso!');
  } catch (error) {
    logger.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  const logger = Logger.create('Main');
  logger.info('Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  const logger = Logger.create('Main');
  logger.info('Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

// Executar se for o arquivo principal
if (require.main === module) {
  main().catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
}

export { GitAutomataServer };
export default main;