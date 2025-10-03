// Core exports
export { Automation, GitHubClient, GitHubWebhookEvent, AutomationConfig } from './core/automation';
export { AutomationRunner, AutomationResult } from './core/runner';
export { GitHub } from './core/github';
export { WebhookManager, WebhookConfig, WebhookHandler } from './core/webhook';

// Utils exports
export { Logger, LogLevel } from './utils';
export { getConfig, validateConfig } from './utils';

// Server exports
export { GitAutomataServer } from './server/app';

// Pre-built automations
export { helloWorldAutomation } from './automations/hello-world';
export { autoLabelAutomation } from './automations/auto-label';