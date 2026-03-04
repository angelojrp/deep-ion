# Docs Viewer (Módulo Independente)

Este módulo existe para visualizar os arquivos Markdown das pastas `../docs` e `../architecture` no navegador.

## Requisitos

- Node.js 18+

## Como executar

```bash
cd docs-viewer
npm install
npm run dev
```

Abra no navegador:

- http://localhost:3030

## O que ele faz

- Lista todos os arquivos `.md` das pastas `docs` e `architecture`
- Permite abrir qualquer arquivo na interface web
- Renderiza o conteúdo Markdown como HTML
- Resolve links relativos para protótipos `.html/.htm` e abre no navegador

## Observações

- O módulo é independente dos blueprints e não participa do build Maven principal.
- O acesso a arquivos é restrito aos diretórios `docs` e `architecture`.
