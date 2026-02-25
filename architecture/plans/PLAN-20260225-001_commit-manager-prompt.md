---
plan_id: PLAN-20260225-001
title: "Prompt de Gerenciamento Semântico de Commits"
classification: T0
created_at: "2026-02-25T00:00:00Z"
created_by: "Arquiteto Corporativo"
status: APROVADO
approval:
  approved_by: ""
  approved_at: ""
  rejection_reason: ""
linked_issue: ""
linked_pr: ""
---

<!--
  REGRA DE EXECUÇÃO:
  Nenhum agente ou workflow pode iniciar tarefas deste plano enquanto:
    status != "APROVADO"  OU  approval.approved_by == ""
  Em caso de violação → workflow aborta e comenta na Issue vinculada.
-->

## Plano de Execução — Prompt de Gerenciamento Semântico de Commits
**Classificação de Impacto:** T0

---

### Contexto

Demanda de tooling interno: criar um arquivo de prompt VS Code Copilot Chat
(`.github/prompts/commit-manager.prompt.md`) que, quando invocado pelo
desenvolvedor via `@workspace /commit-manager`, executa automaticamente o ciclo
completo de pré-validação de branch + commits semânticos organizados, **sem nunca
executar `git push`**.

O prompt **não** afeta pipeline do fintech-pessoal, regras negociais (RN-01..RN-07),
módulos Spring Modulith, dados persistidos ou conformidade LGPD.
Classificação T0 confirmada.

#### Comportamento esperado do prompt (contrato de input/output)

**Pré-condições (executadas na ordem indicada):**

```
1. git fetch origin
   → Atualiza todas as refs remotas sem alterar working tree

2. Verificação de sincronia com o remoto da branch atual:
   → git rev-parse --abbrev-ref --symbolic-full-name @{u}
   → Se o comando falhar (sem upstream configurado):
       ABORTAR e informar:
         "Branch sem upstream configurado. Configure com:
          git push --set-upstream origin <branch-atual>"
   → git rev-list HEAD..@{u} --count
   → Se count > 0 (branch local está ATRÁS do remoto):
       git pull --ff-only
       Se pull falhar (divergência) → ABORTAR e informar:
         "Branch local divergiu do remoto. Pull manual necessário antes de continuar."

3. Verificação de sincronia com origin/develop:
   → git ls-remote --heads origin develop
   → Se develop não existir no remoto: pular este passo com aviso
         "Branch origin/develop não encontrada. Passo de rebase ignorado."
   → git rev-list HEAD..origin/develop --count
   → Se count > 0 (branch está ATRÁS do develop):
       git rebase origin/develop
       Se rebase retornar conflito:
         git rebase --abort
         ABORTAR e informar:
           "Rebase em origin/develop gerou conflitos nos seguintes arquivos: <lista>.
            Resolva manualmente e execute: git rebase origin/develop"
```

**Análise de mudanças pendentes:**

```
4. git status --porcelain
   → Coletar todos os arquivos com estado: M (Modified), A (Added),
     D (Deleted), R (Renamed), ? (Untracked)

5. git diff HEAD -- <cada arquivo>
   → Analisar conteúdo para extrair:
     a. Módulo afetado:
          conta | transacao | categoria | orcamento |
          meta | relatorio | shared | agents | workflows | docs | root
     b. Tipo de mudança (Conventional Commits):
          feat     → nova funcionalidade
          fix      → correção de bug
          test     → adição/modificação de testes
          refactor → refatoração sem mudança de comportamento
          docs     → documentação
          chore    → manutenção, dependências, build
          ci       → GitHub Actions / workflows
          perf     → melhoria de performance
          style    → formatting, lint (sem mudança de lógica)
```

**Agrupamento semântico e commit:**

```
6. Agrupar arquivos por (tipo, módulo), criando N grupos independentes.
   Regras de agrupamento:
   - Arquivos do mesmo módulo e mesmo tipo → mesmo commit
   - Arquivos de tipos diferentes → commits separados, mesmo módulo
   - Migrations Flyway (*.sql) → sempre commit próprio: chore(db): <descricao>
   - Arquivos de workflow (.github/workflows/) → tipo: ci
   - Arquivos de prompt / specs / plans → tipo: docs

7. Para cada grupo, na ordem preferencial [ci → chore → feat → fix → refactor → test → docs]:
   a. git add <lista de arquivos do grupo>
   b. Propor mensagem no formato:
        <tipo>(<módulo>): <descrição imperativa em português, máx 72 chars>
      Exemplos:
        feat(conta): adicionar validação de saldo mínimo
        fix(transacao): corrigir atomicidade em transferência dual-entry
        test(orcamento): cobrir cenário de período inválido
        ci(workflows): adicionar trigger gate/2-aguardando
        chore(db): migration V5__adicionar_coluna_limite_cheque_especial
   c. Exibir ao usuário os arquivos do grupo e a mensagem proposta
   d. Aguardar confirmação (S / N / digitar mensagem alternativa)
   e. Se confirmado: git commit -m "<mensagem>"
   f. Se rejeitado ou editado: usar a mensagem fornecida pelo usuário

8. NUNCA executar git push em nenhuma circunstância.
   Ao finalizar todos os commits, exibir resumo:

     ## Commits realizados
     | # | Hash    | Mensagem               | Arquivos |
     |---|---------|------------------------|---------|
     | 1 | abc1234 | feat(conta): ...       | 3       |
     | 2 | def5678 | test(conta): ...       | 2       |

     ## Próximo passo
     Para enviar ao remoto, execute manualmente:
       git push origin <branch-atual>
     ⚠️ git push NÃO foi executado automaticamente.
```

---

### Zona Cinzenta — 5 Verificações

| Verificação | Resultado |
|---|---|
| **Consumer Analysis** | CLEAR — não referenciado por módulo algum do fintech-pessoal |
| **Business Rule Fingerprint** | CLEAR — nenhuma lógica condicional baseada em RN-01..RN-07 |
| **Data Persistence Check** | CLEAR — nenhum dado persistido afetado |
| **Contract Surface Check** | CLEAR — não expõe API pública |
| **Regulatory Scope Check** | CLEAR — sem dados pessoais ou financeiros |

---

### Tarefas

| # | Tarefa | Agente | Artefato de saída | Depende de | Paralelo com | Modelo sugerido | Justificativa do modelo |
|---|--------|--------|-------------------|------------|--------------|-----------------|-------------------------|
| 1 | Criar `.github/prompts/commit-manager.prompt.md` com frontmatter YAML (`mode: agent`, `tools: [terminal]`, `description`) e corpo em português-BR seguindo exatamente os passos 1–8 do contrato deste plano. Criar o diretório `.github/prompts/` se não existir. Incluir todos os comandos git literais, condições de aborto com mensagens de erro, regras de agrupamento semântico com tabela de tipos/escopos e regra explícita de ausência de `git push`. | DOM-04 | `.github/prompts/commit-manager.prompt.md` | — | — | `GPT-4o` | Geração de documento estruturado seguindo spec completamente descrita. Sem lógica de negócio. GPT-4o é suficiente para gerar texto estruturado com fidelidade à spec. |

---

### Riscos e Condições de Bloqueio

- **R1 — Diretório `.github/prompts/` ausente:** deve ser criado junto com o arquivo; verificar permissões do repositório.
- **R2 — `mode: agent` não disponível:** se o usuário executar o prompt em modo `ask`, os comandos git não serão executados pelo Copilot. O frontmatter `mode: agent` + `tools: [terminal]` é obrigatório para funcionamento automático.
- **R3 — Branch sem upstream configurado:** o passo 2 falha silenciosamente sem upstream. O prompt deve detectar via `git rev-parse --abbrev-ref --symbolic-full-name @{u}` e abortar com instrução clara.
- **R4 — `origin/develop` inexistente:** verificar com `git ls-remote --heads origin develop` antes de qualquer rebase; se ausente, pular o passo com aviso ao usuário.

---

### Gates Necessários

| Gate | Responsável | Condição de avanço |
|------|-------------|-------------------|
| **Aprovação deste plano** | Tech Lead | Preencher `approval.approved_by` + `approval.approved_at`; alterar `status: APROVADO` |
| **Smoke test manual** (após tarefa #1) | Dev | Invocar em branch com 3+ arquivos modificados em módulos distintos; verificar agrupamento semântico correto e ausência de `git push` |

---

### Histórico de Revisões

| Data | Autor | Alteração |
|------|-------|-----------|
| 2026-02-25 | Arquiteto Corporativo | Criação do plano |