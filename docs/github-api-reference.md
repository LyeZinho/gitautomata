# 📚 GitHub API — Endpoints e Recursos Relevantes

## 🔑 Autenticação

* **[Personal Access Tokens (PAT)](https://docs.github.com/en/rest/overview/authenticating-to-the-rest-api)**
  Necessário para chamadas autenticadas à API.

  * Headers:

    ```http
    Authorization: Bearer <TOKEN>
    X-GitHub-Api-Version: 2022-11-28
    ```

---

## 🔔 Webhooks

Usados para disparar automações em tempo real.

* **Eventos principais para automações**:

  * `push` → novo commit em branch
  * `pull_request` → aberto, fechado, mergeado, atualizado
  * `issues` → criação, fechamento, comentários
  * `release` → criação de release/tag
  * `workflow_run` → execução de workflow (CI/CD)
  * `check_run` / `check_suite` → status de checks
  * `discussion` (se usar GitHub Discussions)
  * `star` / `fork` → interações da comunidade

📌 Referência: [Webhook Events](https://docs.github.com/en/webhooks/webhook-events-and-payloads)

---

## 📂 Repositories API

Gerenciar informações do repositório.

* **Obter info de um repo**
  `GET /repos/{owner}/{repo}`

* **Criar um repo (útil para automações infra)**
  `POST /user/repos`

* **Branches**

  * Listar branches: `GET /repos/{owner}/{repo}/branches`
  * Obter branch específica: `GET /repos/{owner}/{repo}/branches/{branch}`

📌 [Repos API](https://docs.github.com/en/rest/repos/repos)

---

## 🌿 Git / Commits API

Trabalhar diretamente com commits, refs e árvores.

* **Criar commit**
  `POST /repos/{owner}/{repo}/git/commits`

* **Atualizar branch (ref)**
  `PATCH /repos/{owner}/{repo}/git/refs/{ref}`

* **Criar tag anotada**
  `POST /repos/{owner}/{repo}/git/tags`

📌 [Git Data API](https://docs.github.com/en/rest/git)

---

## 🔀 Pull Requests API

Automação de fluxos de PR.

* **Listar PRs**
  `GET /repos/{owner}/{repo}/pulls`

* **Obter PR específico**
  `GET /repos/{owner}/{repo}/pulls/{pull_number}`

* **Criar PR**
  `POST /repos/{owner}/{repo}/pulls`

* **Atualizar PR**
  `PATCH /repos/{owner}/{repo}/pulls/{pull_number}`

* **Fazer merge automático**
  `PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge`

* **Reviews e status**

  * Criar review: `POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews`
  * Listar reviewers: `GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers`

📌 [Pull Requests API](https://docs.github.com/en/rest/pulls)

---

## 📝 Issues API

Gerenciar issues, labels e milestones.

* **Criar issue**
  `POST /repos/{owner}/{repo}/issues`

* **Adicionar labels**
  `POST /repos/{owner}/{repo}/issues/{issue_number}/labels`

* **Comentar em issue**
  `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`

* **Fechar issue**
  `PATCH /repos/{owner}/{repo}/issues/{issue_number}`

📌 [Issues API](https://docs.github.com/en/rest/issues)

---

## 🏷️ Labels API

Para automações de categorização.

* **Listar labels**
  `GET /repos/{owner}/{repo}/labels`

* **Criar label**
  `POST /repos/{owner}/{repo}/labels`

* **Adicionar/remover label em issue ou PR**
  `POST /repos/{owner}/{repo}/issues/{issue_number}/labels`

📌 [Labels API](https://docs.github.com/en/rest/issues/labels)

---

## 📦 Releases API

Gerenciar versões automáticas.

* **Criar release**
  `POST /repos/{owner}/{repo}/releases`

* **Obter releases**
  `GET /repos/{owner}/{repo}/releases`

* **Upload de asset para release**
  `POST /repos/{owner}/{repo}/releases/{release_id}/assets`

📌 [Releases API](https://docs.github.com/en/rest/releases)

---

## ✅ Checks & Status API

Automação de pipelines.

* **Criar check run**
  `POST /repos/{owner}/{repo}/check-runs`

* **Atualizar check run**
  `PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}`

* **Commit status (simples)**
  `POST /repos/{owner}/{repo}/statuses/{sha}`

📌 [Checks API](https://docs.github.com/en/rest/checks)

---

## 👤 Users & Orgs

Útil para automações de permissões e notificações.

* **Obter usuário autenticado**
  `GET /user`

* **Listar membros da org**
  `GET /orgs/{org}/members`

📌 [Users API](https://docs.github.com/en/rest/users) | [Orgs API](https://docs.github.com/en/rest/orgs)

---

## 🛠️ Outras APIs Úteis

* **Projects API** (para Kanban e automações de board)
* **Actions API** (para disparar ou monitorar workflows do GitHub Actions)

  * `POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`
  * `GET /repos/{owner}/{repo}/actions/runs`

---

# 🔗 Resumo — Recursos mais importantes para o gitautomata

1. **Webhooks** → push, PR, issues, releases
2. **Pull Requests API** → criar, atualizar, mergear automaticamente
3. **Issues/Labels API** → auto-label, auto-close, comentar
4. **Releases API** → gerar releases automáticas
5. **Checks/Statuses API** → validar automações e reportar resultados
6. **Git API** → manipular commits, branches e tags
7. **Actions API** → disparar workflows CI/CD
