---
agent: agent
description: "[Etapa 2/2] Executar a criação dos casos de uso e regras de negócio a partir de um plano aprovado"
name: "di-uc-exec"
argument-hint: "Informe o tema: tema=<tema>"
---

Assuma o papel de **Analista de Negócios**.

> **Esta é a Etapa 2 de 2.** Nesta etapa, o plano aprovado em `di-uc-new` é executado: todos os casos de uso e regras de negócio são criados como artefatos Markdown persistidos em disco. Nenhuma decisão de escopo é tomada aqui — o plano é a fonte de verdade.

Referências obrigatórias (conformidade total exigida):
- `docs/ai/templates/use-cases-template.md`
- `docs/ai/templates/regras-negocio-template.md`

---

## Validação de entrada

- Entrada obrigatória: `tema=<tema>`.
- Verificar obrigatoriamente a existência de `docs/business/<tema>/<tema>-plano-uc.md`.
  - Se o arquivo não existir: **bloquear execução** e orientar o usuário a executar `di-uc-new` primeiro.
  - Se o arquivo existir mas o status não for `APROVADO`: **bloquear execução** e solicitar que o usuário aprove o plano antes de prosseguir.
- Este prompt **NÃO** aceita alterações de escopo em relação ao plano — qualquer divergência deve ser resolvida retornando ao `di-uc-new` para ajuste do plano.

---

## Verificação do status do plano

Ler o campo **status** do cabeçalho em `<tema>-plano-uc.md`:

| Status encontrado | Ação |
|---|---|
| `APROVADO` | Prosseguir com a execução |
| `AGUARDANDO APROVAÇÃO` | Bloquear — solicitar aprovação explícita do usuário |
| `EM REVISÃO` | Bloquear — aguardar ciclo de revisão ser concluído |
| Ausente / outro valor | Bloquear — orientar a reexecutar `di-uc-new` |

---

## Execução obrigatória

Para cada UC listado na seção **Inventário de Casos de Uso** do plano:

1. Criar o arquivo `docs/business/<tema>/use-cases/<ID>.md` (ex.: `UC-001.md`) seguindo **integralmente** o template `use-cases-template.md`.
2. Preencher todas as seções do template com base na ficha de escopo correspondente do plano:
   - Cabeçalho (módulo, classificação, prioridade, esforço, dependências, RNs acionadas, ator principal).
   - Tabela de definições de atributos (completa, com descrição, nome, tipo, domínio, obrigatoriedade).
   - Análise curta (3–6 bullets: necessidade, escopo, ambiguidades, RNs relevantes).
   - Fluxo principal (tabela passo a passo).
   - Fluxos alternativos (FA-NN com nome, bifurcação e descrição).
   - Fluxos de exceção (FE-NN com gatilho, RN violada e resposta do sistema).
   - Invariantes.
   - Ambiguidades remanescentes (ou "N/A").
   - Critérios de aceitação em Gherkin (mínimo: caminho feliz + 1 alternativo).

Para o arquivo de regras de negócio:

3. Criar `docs/business/<tema>/<tema>-regras.md` seguindo **integralmente** o template `regras-negocio-template.md`.
4. Para cada RN do **Inventário de Regras de Negócio** do plano, preencher:
   - Nome, descrição objetiva, justificativa de negócio.
   - Casos de uso impactados.
   - Dados de entrada e resultado esperado.
5. Incluir seções de cenários de borda, regras de priorização/conflito.

---

## Tratamento de ambiguidades durante a execução

- Se durante a elaboração de um UC surgir ambiguidade **não coberta** pelo plano:
  - `confidence_score ≥ 0.65`: registrar como `QA-NN` na seção de ambiguidades do UC e prosseguir.
  - `confidence_score < 0.65`: **pausar a execução**, listar a ambiguidade e solicitar esclarecimento antes de continuar.
- Nunca inferir silenciosamente dados não presentes no plano ou no brief.

---

## Atualização do plano após execução

Ao concluir todos os arquivos, atualizar o campo **status** em `<tema>-plano-uc.md` de `APROVADO` para `EXECUTADO` e adicionar a data de execução.

---

## Persistência obrigatória nesta etapa

- Criar subpasta `docs/business/<tema>/use-cases/` se não existir.
- Salvar **um arquivo `.md` por UC** em `docs/business/<tema>/use-cases/`.
- Salvar `docs/business/<tema>/<tema>-regras.md`.
- Atualizar `docs/business/<tema>/<tema>-plano-uc.md` (status → `EXECUTADO`).

---

## Saída final ao usuário

Após persistir todos os artefatos, exibir um sumário com:
1. Lista de arquivos criados (com hiperlinks relativos).
2. Quantidade de UCs criados, quantidade de RNs documentadas.
3. Questões em aberto `QA-NN` consolidadas (se houver).
4. Próximos passos recomendados.

---

## Restrições

- Responder em português-BR.
- Não gerar código, apenas artefatos de análise.
- Não alterar o escopo do plano aprovado durante a execução.
- Não criar arquivos fora de `docs/business/<tema>/`.

---

**Etapa concluída:** `di-uc-exec (Execução)` → **Próxima etapa:** `di-prioritize-us` ou `di-critique-us`
