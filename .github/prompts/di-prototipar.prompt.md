---
agent: agent
description: "Prototipar UX nas versões WEB e Mobile (sempre gera DRAFT com questões em aberto) usando Stitch MCP e gerar artefatos"
name: "di-prototipar"
argument-hint: "Informe o tema da funcionalidade"
---

Assuma o papel de **Analista de Negócios / UX**.

Siga obrigatoriamente:
- `docs/ai/templates/prototipagem-ux-template.md`
- `docs/ai/templates/prototipo-screen-template.html` — template base obrigatório para todos os HTMLs gerados

Entrada esperada:
- Nome do tema e subpasta em `docs/business/<tema>/`.
- O artefato `<tema>-brief.md` deve existir na subpasta.

> **A primeira versão gerada é sempre DRAFT.** A transição para `FINAL` ocorre exclusivamente pelo prompt `di-refinar-prototipo-ux`, quando todas as questões em aberto forem respondidas ou o usuário solicitar finalização explícita.

Metadados obrigatórios no artefato gerado (inserir logo após o título `#`):

```yaml
status: DRAFT
versão: 1
ciclo-refinamento: 0
data-criação: <data atual YYYY-MM-DD>
tema: <tema>
```

Pré-condição:
- Ler o brief (`<tema>-brief.md`) antes de iniciar.
- Ler `docs/ai/templates/prototipo-screen-template.html` para internalizar tokens, classes e estrutura antes de gerar qualquer HTML.
- Extrair escopo (inclui/exclui), campos, validações e fluxos para embasar as telas.
- Usar somente o brief como fonte e marcar suposições explícitas.

Fluxo obrigatório (nesta ordem):

### 1. Autorização do Stitch MCP
- Perguntar explicitamente ao usuário se autoriza o uso do MCP Google Stitch.
- Registrar resposta, data/hora e observação sobre limite de API.
- Se **não** autorizado, seguir **fallback** (seção abaixo).

### 2. Seleção de projeto Stitch
- Listar projetos existentes no Stitch (`mcp_stitch_list_projects`).
- Apresentar ao usuário e pedir que escolha o projeto de destino.
- Registrar projeto escolhido (ID e nome).

### 3. Geração de telas
- Gerar cada tela no projeto escolhido via `mcp_stitch_generate_screen_from_text`.
- Usar como prompt o contexto extraído do brief.
- Usar o **ID numérico** do projeto (sem prefixo `projects/`).
- **Por padrão, gerar cada tela em duas versões:**
  - **Mobile** — `deviceType: MOBILE` (layout compacto, navegação por tabs/bottom-bar, toque).
  - **Web (Desktop)** — `deviceType: DESKTOP` (layout em colunas, navegação lateral/top-bar, mouse/teclado).
- Telas típicas a considerar:
  - Listagem (busca, filtro, paginação, ações).
  - Formulário de criação/edição (validações inline, campos obrigatórios/opcionais).
  - Modal de confirmação (ações destrutivas).
  - Lista com feedback (toast de sucesso, estados visuais como inativo).
- Registrar ID de cada tela gerada **por versão** (mobile e web).

### 3b. Geração de HTMLs locais (sempre obrigatório, independente do uso do Stitch)
- Para cada tela, gerar **dois** arquivos HTML a partir de `docs/ai/templates/prototipo-screen-template.html`: um para a versão **mobile** e outro para a versão **web (desktop)**.
- A versão web deve adaptar o layout para viewport amplo: sidebar ou top-navigation, grid de colunas, ações visíveis sem menu hambúrguer.
- **Obrigações ao usar o template:**
  - Copiar o template e substituir todos os `TODO:` pelos valores reais da tela.
  - Manter os design tokens (variáveis CSS `--color-*`, `--radius-*`, etc.) — não substituir por valores hardcoded.
  - Usar apenas as classes do template; não criar classes novas sem necessidade.
  - Remover os blocos comentados que não forem usados na tela.
  - Preencher `data-screen-id`, `data-mode="DRAFT"`, `data-feature` e **`data-platform="mobile"`** ou **`data-platform="web"`** no elemento `<html>`.
  - Adicionar `aria-label`, `aria-required`, `role` e `aria-live` nos elementos interativos.
  - Marcar todas as suposições com `<div class="ux-note"><strong>[SUPOSIÇÃO]</strong> …</div>`.
  - Manter `.mode-banner.draft` e `.screen-meta` em todos os HTMLs (é sempre DRAFT na primeira geração).
- Salvar com nomenclatura DRAFT diferenciada por plataforma (etapa 5).

## Tabela de definições de atributos
| Descrição | Nome | Tipo | Domínio | Obrigatoriedade |
|---|---|---|---|---|

### Regras de nomenclatura (DRAFT)
- Artefato: `docs/business/<tema>/DRAFT-<tema>-prototipo-ux.md`
- HTMLs mobile: `docs/business/<tema>/prototipos/DRAFT-01-mobile-<slug>.html`, `DRAFT-02-mobile-<slug>.html`, etc.
- HTMLs web: `docs/business/<tema>/prototipos/DRAFT-01-web-<slug>.html`, `DRAFT-02-web-<slug>.html`, etc.
- Título e seções devem indicar claramente que é versão DRAFT.

### 4. Criação do artefato de protótipo
- Criar o artefato `DRAFT-<tema>-prototipo-ux.md` seguindo o template `prototipagem-ux-template.md`.
- Preencher todas as seções: Contexto, Usuários e jornada, Mapa de telas e fluxo, Estados por tela, Diretrizes, Critérios de validação, Decisão Stitch, Integração Stitch.
- Incluir colunas **Protótipo Mobile** e **Protótipo Web** na tabela de Mapa de telas (links relativos para os HTMLs de cada plataforma; serão preenchidos na etapa 5).
- Documentar diferenças de comportamento e layout entre as versões na seção de Diretrizes.

### 5. Download dos HTMLs
- Para cada tela, obter o conteúdo HTML via `mcp_stitch_get_screen` **para ambas as versões** (mobile e web).
- Salvar em `docs/business/<tema>/prototipos/` com nomes sequenciais descritivos diferenciados por plataforma:
  - Mobile: `DRAFT-01-mobile-<slug>.html`, `DRAFT-02-mobile-<slug>.html`, etc.
  - Web: `DRAFT-01-web-<slug>.html`, `DRAFT-02-web-<slug>.html`, etc.
- Confirmar que os arquivos são `HTML document, UTF-8`.

### 6. Atualização de links
- Atualizar a tabela no artefato com links relativos para os HTMLs baixados.

### 7. Resolução de TODOs e Suposições

#### 7a. TODOs remanescentes nos HTMLs
- [ ] Buscar todos os `TODO:` nos HTMLs gerados em `docs/business/<tema>/prototipos/`.
- [ ] Para cada ocorrência:
  - [ ] Identificar o contexto (atributo, texto, label, valor de campo, etc.).
  - [ ] Consultar o brief para obter o valor correto.
  - [ ] Substituir o `TODO:` pelo valor real.
  - [ ] Se o valor não puder ser determinado pelo brief, registrar como suposição (`[SUPOSIÇÃO]`) com justificativa.

#### 7b. Suposições (`[SUPOSIÇÃO]`) nos HTMLs
- [ ] Listar todos os blocos `<div class="ux-note"><strong>[SUPOSIÇÃO]</strong> …</div>` em todos os HTMLs gerados.
- [ ] Para cada suposição:
  - [ ] Verificar se pode ser resolvida consultando o brief.
  - [ ] Se **resolvida**: substituir pelo comportamento/valor correto e remover o bloco `ux-note`.
  - [ ] Se **não resolvida**: manter o bloco e registrar como questão em aberto (etapa 8).

### 8. Inventário de TODOs e Suposições (Questões em Aberto)

Esta etapa é **obrigatória** e gera a lista de questões que mantém o artefato em DRAFT.

#### 8a. Identificação de questões em aberto
Analisar o brief e as telas geradas para identificar:
- Suposições não resolvidas nos HTMLs (etapa 7b).
- TODOs que não puderam ser preenchidos (etapa 7a).
- Lacunas de negócio: campos sem domínio definido, fluxos alternativos não cobertos, regras de validação ausentes.
- Lacunas de UX: comportamentos interativos indefinidos, estados não cobertos, mensagens de feedback ausentes.
- Ambiguidades no brief que impactam diretamente as telas.

#### 8b. Registro no artefato Markdown
Adicionar a seção **`## Questões em Aberto`** ao artefato `DRAFT-<tema>-prototipo-ux.md` com checklist numerada:

```markdown
## Questões em Aberto

- [ ] QP-01: <descrição da questão> — **Impacto:** <tela(s) ou seção afetada>
- [ ] QP-02: <descrição da questão> — **Impacto:** <tela(s) ou seção afetada>
- [ ] QP-03: ...
```

> Usar prefixo `QP-` (Questão de Protótipo) com numeração sequencial.

#### 8c. Tabela consolidada de inventário
Adicionar a seção **`## Inventário de TODOs e Suposições`** com tabela detalhada:

| # | ID | Arquivo | Trecho | Tipo | Status | Resolução / Pendência |
|---|-----|---------|--------|------|--------|-----------------------|
| 1 | QP-01 | DRAFT-01-xxx.html | `[SUPOSIÇÃO] ...` | Suposição | Pendente | — |
| 2 | QP-02 | artefato .md | Seção X | Lacuna | Pendente | — |

- **Tipo**: `TODO`, `Suposição`, `Lacuna de negócio`, `Lacuna de UX`, `Ambiguidade`.
- **Status**: `Pendente`, `Resolvido`, `Suposição mantida`.

### 9. Registro de Histórico

Adicionar a seção **`## Histórico`** ao final do artefato:

| Versão | Data | Ação | Detalhes | Autor |
|--------|------|------|----------|-------|
| 1 | <data atual> | CRIAÇÃO | Protótipo DRAFT criado a partir do brief. Questões em aberto: <lista de IDs QP-NN>. | Copilot |

### 10. Apresentar resumo ao usuário

Ao final, exibir:
1. Lista das telas geradas **por plataforma** (mobile e web), com links para os HTMLs e IDs do Stitch, se aplicável.
2. Quantidade de questões em aberto e lista resumida dos IDs.
3. Status do artefato: **DRAFT**.
4. Instrução clara: *"Para responder as questões em aberto e evoluir para FINAL, use o prompt `/di-refinar-prototipo-ux`."*

Fallback (sem MCP):
- Gerar HTMLs locais obrigatoriamente a partir de `docs/ai/templates/prototipo-screen-template.html` (etapa 3b), nas **duas versões** (mobile e web).
- Documentar decisões de UX e estados de cada tela no artefato Markdown.
- Registrar no artefato, seção **Fallback**, as decisões tomadas e pendências para evolução visual futura.

Saída obrigatória:
1. Artefato `DRAFT-<tema>-prototipo-ux.md` completo (com metadados, questões em aberto, inventário e histórico).
2. HTMLs das telas nas versões **mobile** e **web** em `prototipos/` (prefixo `DRAFT-`, sufixo de plataforma `-mobile-` / `-web-`).
3. Resumo ao usuário com próximos passos.

Persistência obrigatória:
- Criar subpasta `prototipos/` se não existir: `docs/business/<tema>/prototipos/`.
- Salvar artefato: `docs/business/<tema>/DRAFT-<tema>-prototipo-ux.md`.
- Salvar HTMLs em `docs/business/<tema>/prototipos/`.
- Formato obrigatório: Markdown (`.md`) para artefato, HTML (`.html`) para protótipos.

Restrições:
- Responder em português-BR.
- Não gerar código de aplicação; apenas artefatos de UX e protótipos visuais.
- Sempre pedir confirmação antes de usar o Stitch (API limitada).
- Não reutilizar projeto Stitch sem confirmação do usuário.
- A primeira geração é **sempre DRAFT**. Não existe modo FINAL neste prompt.
