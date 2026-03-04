---
status: FINAL
versão: 2
data-criação: 2026-03-02
tema: deep-ion
origem: deep-ion-visao.md (v7 — FINAL)
---

# Roadmap de Funcionalidades — deep-ion: Fábrica de Software Autônoma

> **Fonte:** derivado do Documento de Visão `deep-ion-visao.md` (v7 — FINAL, 2026-03-03).  
> **Propósito:** este documento é a **fonte de verdade para abertura de briefs**. Nenhum brief pode ser criado para uma funcionalidade que não esteja listada aqui. Para propor uma nova funcionalidade, o roadmap deve ser atualizado primeiro (via gate negocial com o Product Owner).

---

## Como usar este roadmap

Cada funcionalidade possui um **ID único** (ex: `RM-F01`). Ao criar um novo brief usando o prompt `di-brief-new`, informe o ID correspondente. O prompt validará se o ID existe neste documento antes de prosseguir.

**Formato do ID:** `RM-F{NN}` — onde `NN` é o número de dois dígitos da funcionalidade.

---

## Marco 1 — Core Pipeline

**Prazo-alvo:** Mai/2026 (2 meses a partir de Mar/2026)  
**Objetivo:** Ter DOM-01, DOM-02 e DOM-03 operacionais em um projeto piloto, com governança básica e audit ledger.

| ID Roadmap | ID Visão | Funcionalidade | Prioridade | Status |
|------------|----------|---------------|------------|--------|
| RM-F06 | F-06 | Pipeline orquestrado de agentes — orquestração 100% interna via MCP Servers (`DOM-01 → DOM-02 → [Gate UX, quando F-20 habilitado] → DOM-05a → Gate 2 → DOM-03 → DOM-04 → DOM-05b → Gate 4`) | Must | Não iniciado |
| RM-F07 | F-07 | Agente de Descoberta (DOM-01): classificação T0–T3 | Must | Não iniciado |
| RM-F08 | F-08 | Agente de Requisitos (DOM-02): BAR + Use Cases + Traceability Matrix | Must | Não iniciado |
| RM-F09 | F-09 | Agente de Arquitetura (DOM-03): ADR + esqueleto de código conforme blueprint | Must | Não iniciado |
| RM-F13 | F-13 | Sistema de classificação de impacto T0–T3 com controle de autonomia por projeto | Must | Não iniciado |
| RM-F14 | F-14 | Audit Ledger imutável (DecisionRecord JSON) isolado por projeto/tenant | Must | Não iniciado |
| RM-F15 | F-15 | Catálogo de Regras de Negócio com mapeamento determinístico para Fluxos de Exceção (FE) | Must | Não iniciado |
| RM-F16 | F-16 | Blueprints arquiteturais declarativos (YAML) — biblioteca reutilizável e associação por projeto | Must | Não iniciado |
| RM-F17 | F-17 | Suporte multi-provider de LLM com fallback determinístico (Copilot → OpenAI → local) | Must | Não iniciado |

---

## Marco 2 — Pipeline Completo + Plataforma Multi-Tenant

**Prazo-alvo:** Set/2026 (6 meses a partir de Mar/2026)  
**Objetivo:** Pipeline end-to-end operacional (Gates 1–4), plataforma multi-tenant com frontend de controle, gestão de tenants/projetos/squads.

### 2a — Plataforma e Multi-Tenancy

| ID Roadmap | ID Visão | Funcionalidade | Prioridade | Status |
|------------|----------|---------------|------------|--------|
| RM-F01 | F-01 | Gestão de tenants: cadastro, autenticação SSO via Keycloak e isolamento de dados | Must | Não iniciado |
| RM-F02 | F-02 | Gestão de projetos por tenant: cadastro, configuração de blueprint e vinculação a repositório GitHub | Must | Não iniciado |
| RM-F03 | F-03 | Gestão de squads por projeto: adição de membros e atribuição de papéis (PO, Arquiteto, Dev, QA, Gate Keeper, Analista de Negócios, Analista de Requisitos, Analista de UX) | Must | Não iniciado |
| RM-F04 | F-04 | Frontend de controle da plataforma — painel de gerenciamento de tenants e projetos (esqueleto em `frontend/`) | Must | Em andamento |
| RM-F05 | F-05 | Painel operacional por projeto: status do pipeline, gates pendentes, métricas de qualidade | Should | Não iniciado |

### 2b — Agentes Restantes do Pipeline

| ID Roadmap | ID Visão | Funcionalidade | Prioridade | Status |
|------------|----------|---------------|------------|--------|
| RM-F10 | F-10 | Agente de QA Negocial (DOM-05a): completude, consistência e TestPlan | Must | Não iniciado |
| RM-F11 | F-11 | Agente de Desenvolvimento (DOM-04): implementação + testes conforme blueprint e UC aprovados | Must | Em andamento |
| RM-F12 | F-12 | Agente de QA Técnico (DOM-05b): cobertura, conformidade arquitetural e auditoria de RN | Must | Não iniciado |

### 2c — Governança Avançada e Ferramentas

| ID Roadmap | ID Visão | Funcionalidade | Prioridade | Status |
|------------|----------|---------------|------------|--------|
| RM-F18 | F-18 | Engine de prompts negociais (di-brief, di-uc, di-prototipar, etc.) integrada à plataforma | Should | Em andamento |
| RM-F19 | F-19 | Detector de duplicatas e conflitos entre demandas (SKILL-REQ-00) | Should | Não iniciado |
| RM-F20 | F-20 | Geração de protótipos UX automatizada (WEB + Mobile) | Could | Não iniciado |
| RM-F21 | F-21 | Exportação de pacote de artefatos negociais (.zip HTML) navegável | Could | Não iniciado |

---

## Fora do Escopo v1 (Won't Have)

| ID Roadmap | ID Visão | Funcionalidade | Justificativa |
|------------|----------|---------------|---------------|
| RM-F22 | F-22 | CLI standalone para execução local dos agentes fora da plataforma | Agentes são acionados exclusivamente pela plataforma via MCP Servers; CLI é expansão futura |

> **Atenção:** não é permitido abrir um brief com ID `RM-F22` ou qualquer outro item marcado como "Won't Have" ou "Fora do Escopo v1". Toda solicitação nesse sentido deve ser escalada ao Product Owner para avaliação de inclusão em versão futura.

---

## Itens Fora do Escopo Geral (sem ID de roadmap)

Estes itens foram explicitamente excluídos do produto e **não possuem ID de roadmap**. Nenhum brief pode ser aberto para eles sem revisão formal da visão:

- Suporte a stacks além de Spring Modulith (Java) e Python Agent na v1.
- Execução em infraestrutura própria (self-hosted LLM) na v1.
- Integração com issue trackers que não sejam GitHub Issues (Jira, Linear, etc.) na v1.
- Fluxos de CI/CD de deploy em produção (o pipeline termina no Gate 4).
- Suporte a múltiplas organizações GitHub dentro de um único projeto.
- Marketplace ou compartilhamento público de blueprints entre tenants na v1.
- Geração de documentação técnica em formatos além de Markdown.

---

## Regras de Governança deste Roadmap

1. **Nenhum brief pode ser criado para uma funcionalidade não listada neste documento.**
2. Para propor uma nova funcionalidade, o Product Owner deve aprovar a inclusão no roadmap antes da abertura do brief.
3. O status de cada item deve ser mantido atualizado conforme o pipeline avança.
4. Funcionalidades "Won't Have" não podem ter briefs abertos sem revisão formal da visão (`deep-ion-visao.md`).
5. IDs de roadmap são imutáveis — nunca reutilizar um ID após remoção de uma funcionalidade.

---

## Histórico de Revisões

| Versão | Data | Tipo | Descrição | Responsável |
|--------|------|------|-----------|-------------|
| 1 | 2026-03-02 | CRIAÇÃO | Roadmap inicial derivado de `deep-ion-visao.md` v4 FINAL | GitHub Copilot (Analista de Negócios) |
