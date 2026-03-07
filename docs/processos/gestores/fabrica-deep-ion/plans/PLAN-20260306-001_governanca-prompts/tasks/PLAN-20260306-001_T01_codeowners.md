---
plan_id: PLAN-20260306-001
task_id: T01
title: "Criar .github/CODEOWNERS para proteção dos system prompts críticos"
fase: "FASE 0 — Contenção Imediata"
agent: DOM-04
status: PENDENTE
depends_on: []
parallel_with: []
gaps: [GP-01, GP-04]
recomendacao: R-03
prioridade: P0
---

## Tarefa T01 — `.github/CODEOWNERS`

**Plano pai:** [PLAN-20260306-001](../PLAN-20260306-001_governanca-prompts.md)  
**Fase:** FASE 0 — Contenção Imediata  
**Agente executor:** DOM-04  
**Depende de:** —  
**Paralelo com:** —  
**Prioridade:** P0 — execução imediata antes de qualquer outra tarefa

---

### Objetivo

Eliminar o risco imediato de alteração silenciosa dos artefatos mais críticos da fábrica — os 6 system prompts de agentes e a instrução global — exigindo revisão humana obrigatória (Tech Lead ou PO) para qualquer modificação nesses arquivos via mecanismo nativo do GitHub: `CODEOWNERS`.

Este é o maior quick-win do plano: custo próximo de zero, impacto máximo. Sem este controle, toda a FASE 1 corre o risco de ser desfeita por um commit não revisado.

**GAPs endereçados:**
- **GP-01** — System prompts sem controle de mudança
- **GP-04** — Instrução global sem versionamento com impacto transversal

---

### Contexto

Os 7 artefatos abaixo são os únicos da fábrica cujo impacto é **imediato, silencioso e transversal**:

| Arquivo | Tipo | Impacto |
|---------|------|---------|
| `.github/agents/arquiteto-corporativo.md` | system-prompt | Comportamento do Arquiteto Corporativo |
| `.github/agents/analista-negocios.md` | system-prompt | Comportamento do Analista de Negócios |
| `.github/agents/diretor-processos.md` | system-prompt | Comportamento do Diretor de Processos |
| `.github/agents/gestor-processos.md` | system-prompt | Comportamento do Gestor de Processos |
| `.github/agents/ux-engineer.md` | system-prompt | Comportamento do UX Engineer |
| `.github/agents/validador-ux.md` | system-prompt | Comportamento do Validador UX |
| `.github/arquiteto-instructions.md` | instruction-global | Carregado automaticamente em TODOS os agentes |

Uma linha alterada em qualquer desses arquivos entra em "produção" na próxima sessão de chat, sem qualquer aviso.

---

### Especificação do Artefato

Criar o arquivo `.github/CODEOWNERS` com o seguinte conteúdo:

```
# CODEOWNERS — Proteção de artefatos críticos da fábrica deep-ion
# Toda alteração nos caminhos abaixo exige aprovação do Tech Lead ou PO antes do merge.
# Referência: PLAN-20260306-001 / R-03 / DIAG-20260306-002 (GP-01, GP-04)

# System prompts de agentes — comportamento de TODOS os agentes autônomos
.github/agents/                 @<tech-lead-github-handle>  @<po-github-handle>

# Instrução global — carregada automaticamente em TODOS os agentes
.github/arquiteto-instructions.md  @<tech-lead-github-handle>  @<po-github-handle>

# Instruções de domínio scoped — controle de ciclo de vida de planos
.github/instructions/              @<tech-lead-github-handle>
```

> **Atenção:** Substituir `<tech-lead-github-handle>` e `<po-github-handle>` pelos handles reais do repositório. Se o repositório ainda não tiver esses papéis formalizados no GitHub, usar o handle do owner principal.

---

### Riscos Específicos

- **R-T01-1** — Se o repositório for público ou o GitHub plan não suportar CODEOWNERS, o mecanismo não funciona. Verificar configuração do repo antes de executar.
- **R-T01-2** — Handles incorretos silenciam a proteção (sem erro, sem revisão obrigatória). Validar handles com `gh api /repos/{owner}/{repo}/collaborators` antes do commit.

---

### Artefatos de Saída

- `.github/CODEOWNERS` — arquivo criado com proteção dos 7 artefatos críticos

---

### Critérios de Aceite

- [ ] Arquivo `.github/CODEOWNERS` existe no repositório
- [ ] Os 6 caminhos `.github/agents/*.md` estão mapeados para ≥1 reviewer humano
- [ ] O caminho `.github/arquiteto-instructions.md` está mapeado para ≥1 reviewer humano
- [ ] Um PR de teste modificando `.github/agents/gestor-processos.md` exige revisão do owner designado antes do merge
- [ ] Nenhum outro arquivo fora dos paths críticos foi adicionado ao CODEOWNERS (escopo mínimo)
