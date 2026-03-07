# DIAG-20260307-001 · 02 — GAP-1: Gestão da Equipe e Protocolo de Handoff IA↔Humano

**Diagnóstico:** [DIAG-20260307-001](../DIAG-20260307-001_composicao-squad-gap-analysis.md) | **Índice:** [00_indice.md](00_indice.md)  
**Prioridade:** **P1** | **Emitido por:** Diretor de Squads | **Data:** 07/03/2026

---

## Diagnóstico

O `SKILL-responsabilidades.md` fornece uma RACI estática e de alta granularidade, mas **não existe um protocolo de handoff vivo**. Os problemas são sistêmicos:

| Problema | Evidência |
|----------|-----------|
| Nenhum agente declara explicitamente "de quem recebo" e "para quem entrego" | Os `.md` de agentes descrevem *o que fazem*, nunca *como transitam* |
| Ausência de "Handoff Card" — artefato mínimo obrigatório em cada passagem | Gates têm aprovação por comentário, mas sem checklist estruturado |
| Sem SLA por gate | Gate 3 pode ficar indefinidamente aguardando Tech Lead + Arquiteto |
| Sem escalation ladder formalizado entre Gestor de Squads → Diretor de Squads → humano responsável | SKILL-pipeline menciona `risk_level == CRITICAL → escalar para humano`, mas não define *qual* humano |
| A RACI não cobre os novos agentes de governança (Gestor de Squads, Diretor de Squads, Governador de Prompts) | Foram criados depois da RACI original |
| O Gestor de Squads monitora handoffs mas não tem instrumentos formalizados para registrá-los | `workingDirectory: docs/squad/gestores` sem template de handoff report |

**Impacto:** Demandas podem ficar em limbo entre IA e humano sem visibilidade ou SLA. A rastreabilidade existe no Audit Ledger mas o *estado de handoff* não é um cidadão de primeira classe da governança.

---

## Recomendações

### R1.1 — Criar `SKILL-handoff.md`

Conteúdo obrigatório:
- Protocolo por gate (G1..G5 + Checkpoint A): artefato obrigatório de entrada, revisor humano responsável, SLA máximo, critério de escalada automática
- Estrutura padrão do **"Handoff Card"**: campos obrigatórios que o agente IA deve preencher antes de transferir
- Escalation ladder formal: `DOM-XX (IA)` → `Gestor de Squads` → `Diretor de Squads` → `[papel humano responsável pelo gate]`

### R1.2 — Estender a RACI para cobrir os agentes de governança

Os seguintes agentes atualmente **não aparecem na matriz RACI** e precisam ser incluídos:
- Gestor de Squads
- Diretor de Squads
- Governador de Prompts
- QA Comportamental
- Risk Arbiter (proposto)
- Python AI Engineer (proposto)

### R1.3 — Adicionar seção `## Protocolo de Handoff` em cada agente operacional

Campos obrigatórios para cada agente:

```markdown
## Protocolo de Handoff
- recebo_de: <gate de entrada e artefato esperado>
- entrego_para: <gate de saída e artefato produzido>
- escalo_quando: <condições concretas com ação>
- sla_máximo: <tempo máximo antes de escalar automaticamente>
```

---

## Checklist de Execução — Gestor de Squads

- [ ] Criar `architecture/skills/SKILL-handoff.md` com protocolo por gate G1..G5 + Checkpoint A
- [ ] Definir estrutura padrão do Handoff Card (campos obrigatórios)
- [ ] Definir Escalation Ladder formal e documentar no SKILL
- [ ] Adicionar seção `## Protocolo de Handoff` no agente: `Analista de Negócios`
- [ ] Adicionar seção `## Protocolo de Handoff` no agente: `Arquiteto Corporativo`
- [ ] Adicionar seção `## Protocolo de Handoff` no agente: `Backend Java Júnior`
- [ ] Adicionar seção `## Protocolo de Handoff` no agente: `Backend Java Pleno`
- [ ] Adicionar seção `## Protocolo de Handoff` no agente: `Backend Java Sênior`
- [ ] Adicionar seção `## Protocolo de Handoff` no agente: `UX Engineer`
- [ ] Adicionar seção `## Protocolo de Handoff` no agente: `Tech Lead`
- [ ] Adicionar seção `## Protocolo de Handoff` no agente: `Validador UX`
- [ ] Adicionar seção `## Protocolo de Handoff` no agente: `QA Comportamental`
- [ ] Atualizar `SKILL-responsabilidades.md` — incluir agentes de governança na RACI

---

*← [Ecossistema Atual](01_ecosistema-atual.md) | [Índice](00_indice.md) | Próximo: [GAP-2 — Agentes Faltantes](03_GAP-02_agentes-faltantes.md) →*
