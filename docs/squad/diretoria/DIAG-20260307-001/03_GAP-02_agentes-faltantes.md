# DIAG-20260307-001 · 03 — GAP-2: Agentes Faltantes para Cobertura Completa

**Diagnóstico:** [DIAG-20260307-001](../DIAG-20260307-001_composicao-squad-gap-analysis.md) | **Índice:** [00_indice.md](00_indice.md)  
**Prioridade:** **P1 (Risk Arbiter, Python AI Engineer), P2 (DevOps), P3 (Security, Release)** | **Data:** 07/03/2026

---

## Diagnóstico — Mapeamento de Cobertura por Etapa do Pipeline

| Etapa do Pipeline | DOM Automatizado | Agente Copilot disponível | Cobertura |
|-------------------|------------------|--------------------------|----------|
| Discovery (DOM-01) | ✅ Script Python | ❌ Nenhum agente Copilot | 🔴 Gap |
| Requisitos (DOM-02) | 📋 Especificado | ✅ Analista de Negócios (parcial) | 🟡 Parcial |
| QA Negocial (DOM-05a) | 📋 Especificado | ❌ Nenhum agente Copilot | 🔴 Gap |
| Arquitetura (DOM-03) | 🔜 Planejado | ✅ Arquiteto Corporativo (parcial) | 🟡 Parcial |
| Dev Backend Java | 🔜 Planejado | ✅ Júnior/Pleno/Sênior + Tech Lead | 🟢 Coberto |
| Dev Frontend | 🔜 Planejado | ✅ UX Engineer + Tech Lead | 🟢 Coberto |
| Dev Python/AI (agents-engine) | 🔜 Planejado | ❌ **Nenhum agente** | 🔴 **Gap crítico** |
| QA Técnico (DOM-05b) | 📋 Especificado | ❌ Nenhum agente Copilot | 🔴 Gap |
| Segurança (OWASP / SAST) | ❌ Inexistente | ❌ Inexistente | 🔴 **Gap crítico** |
| CI/CD / DevOps | ❌ Inexistente | ❌ Inexistente | 🔴 **Gap crítico** |
| Release / Versioning | ❌ Inexistente | ❌ Inexistente | 🔴 Gap |
| Risk Arbiter (árbitro) | ❌ Referenciado mas inexistente | ❌ Inexistente | 🔴 **Gap crítico** |
| Kickoff de Projeto | ❌ Inexistente | ❌ Inexistente | 🔴 Gap |

---

## Agentes Propostos — Por Prioridade

---

### P1 · `risk-arbiter.md` — Risk Arbiter

| Campo | Definição |
|-------|----------|
| **Responsabilidade** | Tomar decisões de desbloqueio quando `confidence_score < 0.65` ou `risk_level == CRITICAL`. Árbitro final antes do humano. |
| **Gatilho** | Chamado por qualquer DOM-XX quando limite de confiança é atingido |
| **Tipo** | Universal (agnóstico de projeto) |
| **Tools** | `read`, `fetch`, `search` |
| **Restrições** | Nunca executa código; nunca aprova gates; produz apenas pareceres de desbloqueio ou escalada |
| **Relacionamentos** | Receptor de escaladas de DOM-01..DOM-05b; entrega decisão ao agente originador ou ao humano responsável |

---

### P1 · `python-ai-engineer.md` — Python AI Engineer

| Campo | Definição |
|-------|----------|
| **Responsabilidade** | Desenvolver e manter o módulo `agents-engine/` (Python 3.12, LangChain/LangGraph, pytest) |
| **Gatilho** | Feature ou bugfix no módulo de agentes Python |
| **Tipo** | Especialista de Projeto — template parametrizável |
| **Tools** | `codebase`, `editFiles`, `runInTerminal`, `search`, `problems`, `usages` |
| **Restrições** | Escreve exclusivamente em `agents-engine/`; nunca altera `backoffice/` ou `frontend/` |
| **Relacionamentos** | Par do Backend Java para integrações; consumidor das specs DOM-XX produzidas pelo Arquiteto |

---

### P2 · `devops-engineer.md` — DevOps Engineer

| Campo | Definição |
|-------|----------|
| **Responsabilidade** | Gerenciar CI/CD (GitHub Actions), Docker, configurações de infra, scripts de deploy |
| **Gatilho** | Criação ou alteração de pipeline, configuração de ambiente, integração de novo serviço |
| **Tipo** | Universal com template parametrizável |
| **Tools** | `codebase`, `editFiles`, `runInTerminal`, `search`, `fetch` |
| **Restrições** | Nunca altera código de aplicação (`.java`, `.py`, `.ts`); confirma com Tech Lead antes de alterar infra de produção |
| **Escopo de escrita** | `.github/workflows/`, `docker-compose*.yml`, `Dockerfile`, scripts de CI |
| **Relacionamentos** | Parceiro do Tech Lead; receptor de requisitos do QA Técnico e do Arquiteto |

---

### P3 · `security-auditor.md` — Security Auditor

| Campo | Definição |
|-------|----------|
| **Responsabilidade** | Auditar conformidade OWASP Top 10 em PRs, validar dependências (CVEs), revisar configurações de segurança (JWT, CORS, secrets) |
| **Gatilho** | PRs abertos, novos endpoints, alterações em configuração de segurança, adição de dependências |
| **Tipo** | Universal — agnóstico de stack (Java, Python, TypeScript) |
| **Tools** | `codebase`, `search`, `fetch`, `problems`, `usages` |
| **Restrições** | Somente leitura e relatórios; nunca corrige código (delega ao responsável da stack); bloqueia quando identifica vulnerabilidade crítica (OWASP A1-A10) |
| **Relacionamentos** | Age em paralelo ao DOM-05b; reporta ao Tech Lead; alimenta o Audit Ledger |

---

### P3 · `release-manager.md` — Release Manager

| Campo | Definição |
|-------|----------|
| **Responsabilidade** | Gerenciar ciclo de release: branching strategy, bumping de versão (semver), geração de changelog, criação de release notes, tagging |
| **Gatilho** | Gate 4 aprovado + milestone atingido |
| **Tipo** | Universal com template parametrizável |
| **Tools** | `codebase`, `editFiles`, `runInTerminal`, `search` |
| **Restrições** | Nunca altera código de aplicação; confirma com PO antes de release em produção |
| **Relacionamentos** | Acionado pelo Tech Lead após Gate 4; entrega release notes para o PO validar no Gate 5 |

---

## Checklist de Execução — Gestor de Squads

**P1 — Urgente**
- [ ] Criar `.github/agents/risk-arbiter.md`
- [ ] Criar `.github/agents/python-ai-engineer.md`

**P2 — Alta prioridade**
- [ ] Criar `.github/agents/devops-engineer.md`

**P3 — Média prioridade**
- [ ] Criar `.github/agents/security-auditor.md`
- [ ] Criar `.github/agents/release-manager.md`

---

*← [GAP-1 — Handoff](02_GAP-01_handoff-protocolo.md) | [Índice](00_indice.md) | Próximo: [GAP-3 — Acoplamento](04_GAP-03_acoplamento-projeto.md) →*
