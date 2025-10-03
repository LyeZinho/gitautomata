import { Octokit } from '@octokit/rest';

/**
 * Evento do webhook do GitHub
 */
export interface GitHubWebhookEvent {
  action?: string;
  [key: string]: any;
}

/**
 * Interface base para automações
 */
export interface Automation {
  name: string;
  description?: string;
  
  // Eventos de webhook
  onPush?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onPullRequest?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onIssues?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onRelease?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onWorkflowRun?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onCheckRun?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onStar?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  onFork?: (event: GitHubWebhookEvent, github: GitHubClient) => Promise<void>;
  
  // Execução manual
  run?: (github: GitHubClient, ...args: any[]) => Promise<void>;
}

/**
 * Cliente GitHub para automações
 */
export interface GitHubClient {
  octokit: Octokit;
  
  // Métodos de conveniência
  getRepo: (owner: string, repo: string) => Promise<any>;
  createIssue: (owner: string, repo: string, title: string, body?: string) => Promise<any>;
  createPR: (owner: string, repo: string, title: string, head: string, base: string, body?: string) => Promise<any>;
  addLabel: (owner: string, repo: string, issueNumber: number, labels: string[]) => Promise<any>;
  createRelease: (owner: string, repo: string, tagName: string, name?: string, body?: string) => Promise<any>;
  mergePR: (owner: string, repo: string, pullNumber: number, commitTitle?: string, commitMessage?: string, mergeMethod?: 'merge' | 'squash' | 'rebase') => Promise<any>;
  addComment: (owner: string, repo: string, issueNumber: number, body: string) => Promise<any>;
  getCommitChecks: (owner: string, repo: string, ref: string) => Promise<any>;
}

/**
 * Configuração de automação
 */
export interface AutomationConfig {
  name: string;
  enabled: boolean;
  events: string[];
  config?: Record<string, any>;
}