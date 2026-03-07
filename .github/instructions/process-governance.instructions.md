---
applyTo: "architecture/plans/**"
description: "Governança de planos produzidos pelo Diretor de Processos. Define autoridade de aprovação e regras de ciclo de vida para planos estratégicos de evolução de processos."
---

# Governança de Planos de Evolução de Processos

## Autoridade de Aprovação

Planos produzidos pelo **Diretor de Processos** (`PLAN-*` em `architecture/plans/`) exigem aprovação explícita antes de qualquer execução.

| Tipo de plano | Aprovador obrigatório | Aprovador adicional |
|---------------|----------------------|---------------------|
| Evolução de processo operacional (PROC-001..PROC-007) | Gestor de Processos | — |
| Evolução de pipeline ou gates | Tech Lead | Arquiteto Corporativo |
| Evolução de responsabilidades de agentes autônomos | Tech Lead | — |
| Evolução de metodologia ou frameworks (mudança de modelo) | Direção / PO | Tech Lead |
| Plano de maturidade (CMMI, PMBOK, RUP baseline) | Direção / PO | Gestor de Processos |

## Regras de Ciclo de Vida

1. **PENDENTE** — Estado inicial de todo plano criado pelo Diretor de Processos. Nenhuma tarefa pode ser executada.
2. **APROVADO** — Requer comentário explícito do aprovador listado acima. Libera execução pelo Gestor de Processos ou agente designado.
3. **REJEITADO** — Requer motivo registrado. O Diretor de Processos pode revisitar a análise e criar um novo plano revisado.
4. **EM_EXECUÇÃO** — Atualizado pelo Gestor de Processos conforme tarefas são concluídas.
5. **CONCLUÍDO** — Todos os critérios de sucesso verificados. Fechamento formal pelo aprovador original.

## Restrições de Agentes

- O **Diretor de Processos** cria planos (`status: PENDENTE`) mas **nunca os aprova, executa ou modifica**.
- O **Gestor de Processos** executa planos aprovados mas **nunca cria planos estratégicos** — escala ao Diretor.
- Nenhum agente de desenvolvimento (DOM-04, UX Engineer) pode alterar planos em `architecture/plans/`.
- O **Arquiteto Corporativo** pode sugerir ajustes em planos via comentário, mas não edita diretamente planos do Diretor de Processos.

## Rastreabilidade

Todo plano de evolução de processo deve referenciar:
- Os GAPs que o motivaram (com origem no relatório do Diretor de Processos)
- O framework metodológico de referência utilizado na análise
- O arquivo de SKILL ou PROC que será impactado após aprovação
