# gitautomata

**Source dev kit para criar automações usando a GitHub API.**  
Self-hosted, simples, extensível e feito para programadores que querem criar e rodar suas próprias automações em cima do GitHub.

---

## ✨ Principais ideias

- **Self-hosted** → você roda no seu próprio servidor, mantendo controle total.  
- **Automations** → crie scripts que reagem a eventos do GitHub (webhooks) ou rodem manualmente.  
- **Extensível** → adicione suas automações facilmente em JS/TS.  
- **KISS** → mantenha tudo simples.  
- **TDD-first** → sempre testes antes da implementação.  
- **Documentado** → exemplos claros e documentação prática.

---

## 🚀 Começando

### Pré-requisitos
- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### Instalação
Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/gitautomata.git
cd gitautomata
npm install
````

### Executando localmente

```bash
npm run dev
```

Isso inicia o servidor local que pode receber webhooks do GitHub.

---

## ⚙️ Estrutura do Projeto

```
gitautomata/
├── src/
│   ├── core/          # Núcleo (runner, github wrapper, webhooks)
│   ├── automations/   # Suas automações
│   ├── server/        # Servidor e rotas
│   └── utils/         # Helpers e configs
├── tests/             # Testes (TDD)
├── docs/              # Documentação
├── examples/          # Exemplos prontos de automações
└── README.md
```

---

## 📦 Uso básico

### Criando uma automação

Na pasta `src/automations/`, crie um arquivo, ex: `hello.js`:

```js
module.exports = {
  onPush: async (event, github) => {
    console.log("Push detectado!", event.ref);
  }
};
```

### Rodando manualmente

```bash
gitautomata run src/automations/hello.js
```

### Executando por Webhook

Configure o webhook do GitHub para apontar para:

```
http://seu-servidor.com/webhook/github
```

---

## 🧪 Testes

O projeto segue **TDD-first**. Para rodar os testes:

```bash
npm test
```

---

## 📖 Documentação

* [Getting Started](./docs/getting-started.md)
* [Criando automações](./docs/creating-automations.md)
* [API Reference](./docs/api-reference.md)

---

## 🛠 Roadmap

* [ ] Servidor básico com suporte a webhooks
* [ ] CLI (`gitautomata run`, `gitautomata init`)
* [ ] Exemplos de automações úteis (auto-label, auto-merge, release)
* [ ] Documentação completa
* [ ] Docker support

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📜 Licença

[MIT](./LICENSE) © 2025


