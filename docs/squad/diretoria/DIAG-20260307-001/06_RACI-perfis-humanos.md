# DIAG-20260307-001 · 06 — Matriz RACI Estendida e Perfis Humanos

**Diagnóstico:** [DIAG-20260307-001](../DIAG-20260307-001_composicao-squad-gap-analysis.md) | **Índice:** [00_indice.md](00_indice.md)  
**Emitido por:** Diretor de Squads | **Data:** 07/03/2026

---

## Matriz RACI Estendida — Proposta (IA × Humano × Novos Agentes)

| Atividade | Agente IA | Papel Humano | Tipo |
|-----------|-----------|--------------|------|
| Decisão de desbloqueio (confidence < 0.65) | **Risk Arbiter** (R) | PO / TL (A) | Novo |
| Desenvolvimento agents-engine | **Python AI Engineer** (R) | Tech Lead (A) | Novo |
| CI/CD e infraestrutura | **DevOps Engineer** (R) | Tech Lead (A) | Novo |
| Auditoria OWASP / CVEs | **Security Auditor** (R) | Tech Lead (A) | Novo |
| Release e versioning | **Release Manager** (R) | PO (A) | Novo |
| Handoff IA→Humano | Agente DOM-XX (R) | **Gestor de Squads** (C) | Formalizar |
| Kickoff de nova squad | **Diretor de Squads** (R) | PO + TL (A) | Novo processo |
| Aprovação Gate 1 (Discovery) | Analista de Negócios (C) | **Domain Expert** (A) | Existente |
| Aprovação Gate 3 (Arquitetura) | Arquiteto Corporativo (C) | **TL + Arquiteto** (A) | Existente |
| Aprovação Gate 5 (Homologação) | QA Comportamental (C) | **QA Humano + PO** (A) | Existente |

---

## Perfis Humanos — Gaps Identificados

| Papel | Status | Gap |
|-------|--------|-----|
| Product Owner | Referenciado na RACI | ✅ Coberto conceitualmente |
| Tech Lead | ✅ Existe como agente IA + definido na RACI | Dupla natureza (IA + humano) — precisa clareza |
| Arquiteto | Referenciado | ✅ Coberto conceitualmente |
| Domain Expert | Referenciado (Gate 1) | ⚠️ Perfil não detalhado — sem descrição de competências esperadas |
| QA (Homologação) | Referenciado (Gate 5) | ⚠️ Perfil não detalhado |
| **Analista de Segurança** | ❌ Ausente | Necessário para validar output do Security Auditor |
| **Scrum Master / Facilitador** | ❌ Ausente | Nenhum papel humano coordena as cerimônias/sprints da squad |
| **Desenvolvedor Sênior Humano** | ❌ Ausente | Não há definição de quando o humano cobre o que a IA não consegue |

---

## Perfis Humanos a Detalhar

### Domain Expert

- **Responsabilidades exclusivas:** Validaão de regras de negócio no Gate 1; responde por correções de interpretação de domínio
- **Gates obrigatórios:** Gate 1 (Discovery), Checkpoint A (validação de requisitos)
- **Competências:** Conhecimento profundo do domínio de negócio; capacidade de validar artefatos técnicos com impacto no negócio
- **Senioridade:** Sênior ou superior, autonomia decisional plena

### QA Humano (Homologação)

- **Responsabilidades exclusivas:** Aprovação final no Gate 5; validação de critérios de aceitação com o PO
- **Gates obrigatórios:** Gate 5 (Homologação)
- **Competências:** Testes manuais exploratórios, validação de UX, leitura de relatórios de QA Comportamental
- **Senioridade:** Pleno ou superior

### Analista de Segurança *(papel ausente — criar)*

- **Responsabilidades exclusivas:** Validação final de relatórios do Security Auditor; decisão sobre aceitação de risco residual
- **Gates obrigatórios:** Gate 4 (antes do deploy/release)
- **Competências:** OWASP, pentest, leitura de SAST/DAST reports, CVE triage
- **Senioridade:** Sênior; poder de veto em release

### Scrum Master / Facilitador *(papel ausente — criar)*

- **Responsabilidades exclusivas:** Organização de sprints, facilitação de cerimônias, remoção de impedimentos não resolvidos por IA
- **Gates obrigatórios:** Checkpoint A (planejamento de sprint)
- **Competências:** Scrum/Kanban, facilitação, leitura de métricas de squad
- **Senioridade:** Pleno; papel de facilitador, sem poder de aprovação

---

## Checklist de Execução — Gestor de Squads

- [ ] Detalhar perfil de `Domain Expert` em `SKILL-responsabilidades.md`
- [ ] Detalhar perfil de `QA Humano (Homologação)` em `SKILL-responsabilidades.md`
- [ ] Propor criação do papel `Analista de Segurança` ao Diretor de Squads
- [ ] Propor criação do papel `Scrum Master / Facilitador` ao Diretor de Squads
- [ ] Esclarecer dupla natureza IA+humano do `Tech Lead` no SKILL-responsabilidades.md
- [ ] Atualizar RACI com os novos agentes propostos (após criação dos agentes em GAP-2)

---

*← [GAP-4 — Kickoff](05_GAP-04_kickoff-templates.md) | [Índice](00_indice.md) | Próximo: [Resumo de Prioridades](07_resumo-prioridades.md) →*
