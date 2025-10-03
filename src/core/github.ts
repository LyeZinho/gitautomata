import { Octokit } from '@octokit/rest';
import { GitHubClient } from './automation';

/**
 * Wrapper para a GitHub API usando Octokit
 */
export class GitHub implements GitHubClient {
  public readonly octokit: Octokit;

  constructor(token: string, apiVersion = '2022-11-28') {
    this.octokit = new Octokit({
      auth: token,
      request: {
        version: apiVersion,
      },
    });
  }

  /**
   * Obtém informações de um repositório
   */
  async getRepo(owner: string, repo: string): Promise<any> {
    const response = await this.octokit.rest.repos.get({
      owner,
      repo,
    });
    return response.data;
  }

  /**
   * Cria uma nova issue
   */
  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string
  ): Promise<any> {
    const response = await this.octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
    });
    return response.data;
  }

  /**
   * Cria um novo Pull Request
   */
  async createPR(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ): Promise<any> {
    const response = await this.octokit.rest.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body,
    });
    return response.data;
  }

  /**
   * Adiciona labels a uma issue ou PR
   */
  async addLabel(
    owner: string,
    repo: string,
    issueNumber: number,
    labels: string[]
  ): Promise<any> {
    const response = await this.octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels,
    });
    return response.data;
  }

  /**
   * Cria uma nova release
   */
  async createRelease(
    owner: string,
    repo: string,
    tagName: string,
    name?: string,
    body?: string
  ): Promise<any> {
    const response = await this.octokit.rest.repos.createRelease({
      owner,
      repo,
      tag_name: tagName,
      name: name || tagName,
      body,
    });
    return response.data;
  }

  /**
   * Merge um Pull Request
   */
  async mergePR(
    owner: string,
    repo: string,
    pullNumber: number,
    commitTitle?: string,
    commitMessage?: string,
    mergeMethod: 'merge' | 'squash' | 'rebase' = 'merge'
  ): Promise<any> {
    const response = await this.octokit.rest.pulls.merge({
      owner,
      repo,
      pull_number: pullNumber,
      commit_title: commitTitle,
      commit_message: commitMessage,
      merge_method: mergeMethod,
    });
    return response.data;
  }

  /**
   * Adiciona comentário a uma issue ou PR
   */
  async addComment(
    owner: string,
    repo: string,
    issueNumber: number,
    body: string
  ): Promise<any> {
    const response = await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
    return response.data;
  }

  /**
   * Obtém o status de checks de um commit
   */
  async getCommitChecks(
    owner: string,
    repo: string,
    ref: string
  ): Promise<any> {
    const response = await this.octokit.rest.checks.listForRef({
      owner,
      repo,
      ref,
    });
    return response.data;
  }
}