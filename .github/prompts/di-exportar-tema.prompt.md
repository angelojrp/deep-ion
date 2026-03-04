---
agent: agent
description: "Exportar uma funcionalidade (tema) como pacote HTML estático navegável e compactado (.zip)"
name: "di-exportar-tema"
argument-hint: "Informe o tema da funcionalidade a exportar (ex: cadastro-cartoes-credito)"
---

Assuma o papel de **Engenheiro de Documentação Técnica**.

## Objetivo

Exportar todos os artefatos de uma funcionalidade (tema) — arquivos Markdown e protótipos HTML — em um pacote HTML estático, totalmente navegável no navegador, entregue como um arquivo `.zip` compactado.

## Entrada esperada

- Nome do tema no padrão kebab-case (ex: `cadastro-cartoes-credito`).
- Pasta base: `docs/business/<tema>/`.

## Pré-condições

- Verificar se a pasta `docs/business/<tema>/` existe; se não existir, abortar com mensagem de erro clara.
- Listar recursivamente **todos** os arquivos dentro de `docs/business/<tema>/`:
  - Arquivos `.md` (Markdown) → converter para HTML.
  - Arquivos `.html` (protótipos existentes) → incluir sem alteração.
  - Ignorar outros tipos de arquivo.

---

## Fluxo obrigatório (nesta ordem)

### 1. Descoberta de artefatos

Listar todos os arquivos encontrados na pasta do tema, separando por tipo:

```
Markdown (.md):
  - <tema>-brief.md
  - <tema>-regras.md
  - <tema>-prototipo-ux.md
  - use-cases/US-XXX.md (um por arquivo)
  - (outros .md encontrados)

Protótipos HTML (.html):
  - prototipos/NN-<slug>.html
  - (outros .html encontrados)
```

Apresentar a lista ao usuário e confirmar antes de prosseguir.

### 2. Definição da estrutura de exportação

A pasta de saída será criada em:

```
.export/<tema>/
```

Estrutura interna do pacote:

```
.export/<tema>/
├── index.html             ← navegação principal (gerado neste passo)
├── docs/
│   ├── <tema>-brief.html
│   ├── <tema>-regras.html
│   ├── <tema>-prototipo-ux.html
│   └── use-cases/
│       └── US-XXX.html
└── prototipos/
    ├── 01-<slug>.html
    └── (outros HTMLs copiados)
```

### 3. Conversão de Markdown para HTML

Para cada arquivo `.md` encontrado:

- Converter o conteúdo Markdown para HTML semântico.
- Embutir o CSS de estilização diretamente no `<head>` (sem dependências externas — o HTML deve funcionar offline).
- Usar o layout abaixo como base para cada página convertida:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>[TÍTULO DO DOCUMENTO] — <tema></title>
  <style>
    /* Reset e tipografia */
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fb;
      color: #142033;
      padding: 32px 16px;
    }
    .page {
      max-width: 860px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #d9e2f0;
      border-radius: 12px;
      padding: 32px 40px;
    }
    .back-link {
      display: inline-block;
      margin-bottom: 24px;
      font-size: 13px;
      color: #4778d9;
      text-decoration: none;
    }
    .back-link:hover { text-decoration: underline; }
    h1, h2, h3 { color: #0f2040; margin-top: 1.4em; }
    h1 { font-size: 1.6rem; margin-top: 0; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    pre {
      background: #101828;
      color: #e5ecf8;
      border-radius: 10px;
      padding: 14px 16px;
      overflow-x: auto;
      font-size: 13px;
    }
    code:not(pre code) {
      background: #f0f4fc;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #dbe3f1; padding: 8px 10px; text-align: left; }
    th { background: #f2f6fc; }
    blockquote {
      border-left: 4px solid #4778d9;
      margin: 1em 0;
      padding: 8px 16px;
      background: #f0f5ff;
      border-radius: 0 8px 8px 0;
      color: #2f4266;
    }
    a { color: #4778d9; }
    ul, ol { padding-left: 1.5em; }
    li { margin: 4px 0; }
    hr { border: none; border-top: 1px solid #d9e2f0; margin: 2em 0; }
  </style>
</head>
<body>
  <div class="page">
    <a class="back-link" href="../index.html">← Voltar ao índice</a>
    <!-- CONTEÚDO MARKDOWN CONVERTIDO AQUI -->
  </div>
</body>
</html>
```

> **Regra:** links internos entre arquivos `.md` devem ser reescritos para apontar para os `.html` correspondentes dentro da pasta `export/`.

### 4. Cópia dos protótipos HTML

- Copiar cada arquivo `.html` de `docs/business/<tema>/prototipos/` para `export/prototipos/`.
- **Não alterar** o conteúdo interno dos protótipos.
- Adicionar no início do `<body>` de cada protótipo copiado (após a primeira tag após `<body>`) um banner de navegação mínimo:

```html
<div style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#1e40af;color:#fff;
            padding:6px 16px;font-family:sans-serif;font-size:13px;display:flex;align-items:center;gap:12px;">
  <a href="../index.html" style="color:#93c5fd;text-decoration:none;">← Índice</a>
  <span style="opacity:.5">|</span>
  <span>Protótipo: [NOME DO ARQUIVO]</span>
</div>
<div style="height:34px;"></div>
```

### 5. Geração do `index.html`

Criar `export/index.html` com o layout navegável abaixo.

O arquivo deve ser **100% autocontido** (sem CDN, sem scripts externos).

Requisitos do `index.html`:

- Cabeçalho com nome do tema e data de exportação (`YYYY-MM-DD`).
- Seção **Documentação** listando todos os HTMLs gerados a partir de `.md`, com link, nome amigável e tipo (Brief / Regras de Negócio / Protótipo UX / Caso de Uso / Outro).
- Seção **Protótipos de Tela** listando todos os HTMLs copiados de `prototipos/`, com link, número da tela e slug.
- Rodapé com `Gerado por: di-exportar-tema` e o tema exportado.

Estrutura de referência:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exportação — <tema></title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fb;
      color: #142033;
      padding: 32px 16px;
    }
    .page {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      background: #1e40af;
      color: #fff;
      border-radius: 12px;
      padding: 24px 32px;
      margin-bottom: 28px;
    }
    header h1 { margin: 0 0 4px; font-size: 1.5rem; }
    header p  { margin: 0; opacity: .8; font-size: 14px; }
    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f2040;
      border-bottom: 2px solid #d9e2f0;
      padding-bottom: 6px;
      margin: 32px 0 16px;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
    }
    .card {
      background: #fff;
      border: 1px solid #d9e2f0;
      border-radius: 10px;
      padding: 16px;
      text-decoration: none;
      color: inherit;
      transition: box-shadow 120ms;
    }
    .card:hover { box-shadow: 0 4px 14px rgba(30,64,175,.12); border-color: #4778d9; }
    .card-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .05em;
      color: #4778d9;
      margin-bottom: 6px;
    }
    .card-title { font-weight: 600; font-size: 14px; color: #0f2040; }
    .card-sub   { font-size: 12px; color: #5e6d88; margin-top: 4px; }
    footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #d9e2f0;
      font-size: 12px;
      color: #8494b0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <h1>📦 <NOME_AMIGAVEL_DO_TEMA></h1>
      <p>Exportação gerada em <DATA_YYYY-MM-DD></p>
    </header>

    <p class="section-title">📄 Documentação</p>
    <div class="card-grid">
      <!-- Um .card por arquivo .md convertido -->
      <a class="card" href="docs/<arquivo>.html">
        <div class="card-label"><TIPO></div>
        <div class="card-title"><TÍTULO></div>
        <div class="card-sub"><arquivo>.html</div>
      </a>
    </div>

    <p class="section-title">🖥️ Protótipos de Tela</p>
    <div class="card-grid">
      <!-- Um .card por arquivo .html em prototipos/ -->
      <a class="card" href="prototipos/<arquivo>.html">
        <div class="card-label">Tela <NN></div>
        <div class="card-title"><SLUG_AMIGAVEL></div>
        <div class="card-sub"><arquivo>.html</div>
      </a>
    </div>

    <footer>
      Gerado por <strong>di-exportar-tema</strong> · Tema: <strong><tema></strong>
    </footer>
  </div>
</body>
</html>
```

### 6. Compactação do pacote

Após criar todos os arquivos em `.export/<tema>/`, compactar a pasta inteira em um arquivo ZIP:

- Caminho de saída: `.export/<tema>-export.zip`
- O ZIP deve conter o diretório `export/` como raiz (não o caminho absoluto completo).
- Usar o comando:

```bash
cd .export && zip -r <tema>-export.zip <tema>/
```

### 7. Sumário final

Ao concluir, exibir um sumário com:

```
✅ Exportação concluída
─────────────────────────────────────────
Tema         : <tema>
Arquivos .md convertidos  : N
Protótipos incluídos      : N
Total de arquivos no ZIP  : N
─────────────────────────────────────────
📂 Pasta   : .export/<tema>/
📦 ZIP     : .export/<tema>-export.zip
─────────────────────────────────────────
Para visualizar: abrir .export/<tema>/index.html no navegador.
```

---

## Regras gerais

- Todos os HTMLs gerados devem funcionar **offline** (sem dependências externas).
- Links internos entre documentos devem ser relativos (ex: `../index.html`, `docs/brief.html`).
- Não modificar os arquivos originais em `docs/business/<tema>/` — apenas criar conteúdo dentro de `.export/<tema>/`.
- Se a pasta `.export/<tema>/` já existir, perguntar ao usuário se deseja sobrescrever antes de prosseguir.
- Não criar arquivos de sumário ou changelogs adicionais além do solicitado.
