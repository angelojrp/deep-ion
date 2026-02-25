# DOM-05a — QA Negocial Agent

**Posição:** DOM-02 (SKILL-REQ-02) → **DOM-05a** → Gate 2 → DOM-03  
**Disparo:** SKILL-REQ-02 concluído (label `gate/2-aguardando`)  
**Entrega:** QANegocialReport — auditoria de qualidade dos artefatos do DOM-02

---

## Princípios

1. **Atuação pré-Gate 2:** o agente audita os artefatos *antes* da revisão humana formal, tornando o Gate 2 mais qualificado. Problema detectado aqui é ordens de magnitude mais barato que problema detectado no DOM-03.
2. **Processo independente:** script Python isolado, sem acesso direto ao DOM-02. Lê os artefatos exclusivamente via GitHub API (comentários da Issue).
3. **Autonomia proporcional à classe:** T0 bloqueia automaticamente se detectar falha crítica. T1/T2/T3 reporta e escala para o humano no Gate 2.
4. **Nunca resolve ambiguidade:** falha detectada é registrada e escalada — nunca corrigida silenciosamente.

---

## Posicionamento no Pipeline

```
SKILL-REQ-02 conclui UCs + Matriz
  → label: gate/2-aguardando
    → DOM-05a dispara (automático)
      → publica QANegocialReport na Issue
        → [T0] falha crítica → BLOQUEIO automático (label: qa/bloqueado)
        → [T1/T2/T3] falha crítica → alerta no relatório, Gate 2 decide
        → sem falhas críticas → label: qa/aprovado
          → Gate 2 humano (PO + Tech Lead) com relatório em mãos
            → gate/2-aprovado → DOM-03 inicia
```

---

## Skills

### SKILL-QAN-00 — Artifact Completeness Checker

| | |
|---|---|
| **Trigger** | Label `gate/2-aguardando` aplicado |
| **Input** | Todos os comentários da Issue (BAR + UCs + Matriz) |
| **Output** | Relatório de completude — seção do QANegocialReport |
| **Tempo máximo** | 45s |

**Verificações obrigatórias:**

| # | Verificação | Critério de falha | Bloqueante T0? |
|---|---|---|---|
| C1 | Schema do UC completo | Qualquer seção ausente sem N/A justificado | Sim |
| C2 | Gherkin presente por UC | Ausência de cenário feliz ou de FE obrigatório | Sim |
| C3 | FEs determinísticos gerados | RN acionada no BAR sem FE correspondente na tabela abaixo | Sim |
| C4 | Matriz de Rastreabilidade completa | Linha faltando para combinação Issue × RN × UC × Cenário | Sim |
| C5 | RNFs com métricas | Atributo de RNF sem métrica quantificável | Não (alerta) |
| C6 | Módulos declarados no BAR cobertos nos UCs | UC referencia módulo não declarado em A4 do BAR | Não (alerta) |

**Mapeamento determinístico RN → FE obrigatório (codificado, não inferido pelo LLM):**

| RN | FE obrigatório |
|---|---|
| RN-01 | Saldo Insuficiente |
| RN-02 | Falha na atomicidade da transferência |
| RN-03 | Tentativa de exclusão de transação confirmada |
| RN-04 | Período inválido para cálculo de orçamento |
| RN-05 | Nenhum FE — verificar presença de `MetaAtingidaEvent` no fluxo principal |
| RN-06 | Tentativa de exclusão de categoria padrão |
| RN-07 | Transação não confirmada excluída do relatório |

---

### SKILL-QAN-01 — Business Consistency Analyzer

| | |
|---|---|
| **Trigger** | SKILL-QAN-00 concluído |
| **Input** | BAR + UCs + Matriz + catálogo RN-01..RN-07 |
| **Output** | Relatório de consistência negocial — seção do QANegocialReport |
| **Tempo máximo** | 90s |
| **Confiança mínima** | `confidence_score < 0.65` → registra dúvida explicitamente, não infere |

**Análises obrigatórias:**

| # | Análise | Critério de falha | Bloqueante T0? |
|---|---|---|---|
| B1 | Rastreabilidade Issue → UC | UC sem origem rastreável na Issue original | Sim |
| B2 | Consistência BAR → UC | UC contradiz ou extrapola escopo declarado no BAR | Sim |
| B3 | Cobertura de RNs | RN acionada no BAR sem representação em nenhum fluxo de UC | Sim |
| B4 | Conflito entre UCs | Dois UCs com pós-condições mutuamente exclusivas | Sim |
| B5 | Ambiguidade residual | Ambiguidade listada no BAR não adereçada nos UCs | Não (alerta) |
| B6 | Invariantes ausentes | UC toca RN sem declarar invariante correspondente | Não (alerta) |
| B7 | Escopo de LGPD | UC manipula dado pessoal sem RNF de LGPD declarado | Sim (sempre) |

---

### SKILL-QAN-02 — Test Plan Generator

| | |
|---|---|
| **Trigger** | SKILL-QAN-01 concluído sem bloqueio crítico |
| **Input** | Matriz de Rastreabilidade + UCs aprovados |
| **Output** | Plano de Testes publicado como comentário na Issue |
| **Tempo máximo** | 120s |

**O plano de testes gerado é o contrato que o DOM-05b vai verificar.** Cada item deve ser verificável objetivamente — sem ambiguidade sobre o que constitui "passou" ou "falhou".

**Estrutura do Plano de Testes:**

```
## TestPlan-{ID}: Plano de Testes
**Issue:** #{N} | **Classificação:** T{N} | **Data:** {ISO-8601}
**UCs cobertos:** UC-{N}, UC-{N+1}

### Testes Unitários Obrigatórios
| Teste | Classe | Método | Cenário | RN |
|-------|--------|--------|---------|-----|
| UT-01 | ContaServiceTest | deveRejeitarDebitoSemSaldo | FE-01 | RN-01 |

### Testes de Integração Obrigatórios
| Teste | Escopo | Cenário | Pré-condição |
|-------|--------|---------|--------------|
| IT-01 | conta + transacao | Transferência atômica | Duas contas ativas |

### Verificações Arquiteturais
| Verificação | Critério |
|-------------|----------|
| ModulithArchitectureTest | Deve passar sem exceções |
| Fronteiras de módulo | Nenhuma dependência direta entre módulos |

### Critérios de Bloqueio para Gate 4
- Cobertura mínima: 80% nas classes alteradas
- Zero falhas em testes unitários mapeados neste plano
- ModulithArchitectureTest verde
- Todos os cenários Gherkin com teste correspondente implementado
```

---

## QANegocialReport — Formato Final

Publicado como comentário na Issue após as três skills concluírem.

```
## QANegocialReport-{ID}
**Issue:** #{N} | **Classificação:** T{N} | **Data:** {ISO-8601}
**Resultado Geral:** [BLOQUEADO | APROVADO COM ALERTAS | APROVADO]
**Agente:** DOM-05a | **Autonomia de bloqueio:** [ativa T0 | escalada T1+]

### Completude dos Artefatos (SKILL-QAN-00)
| Check | Status | Detalhe |
|-------|--------|---------|
| C1 — Schema UC | ✅ / ❌ | |
| C2 — Gherkin | ✅ / ❌ | |
| C3 — FEs determinísticos | ✅ / ❌ | |
| C4 — Matriz completa | ✅ / ❌ | |
| C5 — RNFs com métricas | ✅ / ⚠️ | |
| C6 — Módulos cobertos | ✅ / ⚠️ | |

### Consistência Negocial (SKILL-QAN-01)
| Check | Status | Detalhe |
|-------|--------|---------|
| B1 — Rastreabilidade | ✅ / ❌ | |
| B2 — BAR → UC | ✅ / ❌ | |
| B3 — Cobertura RNs | ✅ / ❌ | |
| B4 — Conflito UCs | ✅ / ❌ | |
| B5 — Ambiguidade residual | ✅ / ⚠️ | |
| B6 — Invariantes | ✅ / ⚠️ | |
| B7 — LGPD | ✅ / ❌ | |

### Plano de Testes (SKILL-QAN-02)
[link para comentário TestPlan-{ID}]
Testes unitários mapeados: N
Testes de integração mapeados: N
Verificações arquiteturais: N

### Decisão do Agente
**{BLOQUEADO | APROVADO}** — {justificativa}
*Falhas críticas detectadas:* {lista ou "nenhuma"}
*Alertas para revisão humana no Gate 2:* {lista ou "nenhum"}
```

---

## Regras de Bloqueio por Classe

| Falha detectada | T0 | T1 | T2 | T3 |
|---|---|---|---|---|
| C1/C2/C3/C4 — Completude crítica | Bloqueia auto | Alerta Gate 2 | Alerta Gate 2 | Alerta Gate 2 |
| B1/B2/B3/B4 — Consistência crítica | Bloqueia auto | Alerta Gate 2 | Alerta Gate 2 | Alerta Gate 2 |
| B7 — LGPD | Bloqueia auto | Bloqueia auto | Bloqueia auto | Bloqueia auto |
| C5/C6/B5/B6 — Alertas | Alerta | Alerta | Alerta | Alerta |

> **LGPD é bloqueante em todas as classes.** Dado pessoal sem tratamento declarado nunca é autônomo.

---

## Condições de Bloqueio Automático

| # | Condição | Skill | Ação |
|---|---|---|---|
| B1 | UC sem Gherkin completo (qualquer classe) | QAN-00 (C2) | BLOQUEIO T0 / alerta T1+ |
| B2 | RN acionada sem FE correspondente | QAN-00 (C3) | BLOQUEIO T0 / alerta T1+ |
| B3 | UC extrapola escopo declarado no BAR | QAN-01 (B2) | BLOQUEIO T0 / alerta T1+ |
| B4 | Dado pessoal sem RNF LGPD | QAN-01 (B7) | BLOQUEIO todas as classes |
| B5 | Conflito entre pós-condições de UCs distintos | QAN-01 (B4) | BLOQUEIO T0 / alerta T1+ |

---

## Fluxo de Labels

```
gate/2-aguardando
  → qa/em-analise               (DOM-05a iniciado)
    → qa/aprovado               (sem falhas críticas — Gate 2 pode prosseguir)
    → qa/aprovado-com-alertas   (alertas registrados — Gate 2 decide)
    → qa/bloqueado              (falha crítica T0 — requer correção antes do Gate 2)
```

---

## Estrutura de Arquivos

```
.github/
├── qa_negocial/
│   ├── skill_qan_00.py          # Artifact Completeness Checker
│   ├── skill_qan_01.py          # Business Consistency Analyzer
│   ├── skill_qan_02.py          # Test Plan Generator
│   ├── rn_catalog.py            # Catálogo RN-01..RN-07 + FEs determinísticos (compartilhado com DOM-02)
│   └── prompts/
│       ├── consistency_check.md # Prompt para SKILL-QAN-01
│       └── test_plan.md         # Prompt para SKILL-QAN-02
└── workflows/
    └── qa-negocial-trigger.yml  # Dispara DOM-05a quando gate/2-aguardando é aplicado
```

Cada skill invocada como processo isolado:
```bash
python .github/qa_negocial/skill_qan_00.py --issue 42
python .github/qa_negocial/skill_qan_01.py --issue 42
python .github/qa_negocial/skill_qan_02.py --issue 42
```

---

## Audit Ledger — DecisionRecord

```json
{
  "record_id": "DR-QAN-{UUID}",
  "agent": "DOM-05a",
  "skill": "SKILL-QAN-00 | SKILL-QAN-01 | SKILL-QAN-02",
  "issue_id": "{numero}",
  "timestamp": "{ISO-8601}",
  "classification": "T0 | T1 | T2 | T3",
  "decision_type": "block | alert | approve",
  "decision": "bloquear | alertar | aprovar",
  "confidence_score": 0.87,
  "autonomous_block": true,
  "failures_critical": ["C2 — UC-03 sem Gherkin FE-01"],
  "failures_warning": ["C5 — RNF performance sem métrica"],
  "rn_triggered": ["RN-01", "RN-03"],
  "lgpd_scope": false,
  "test_plan_id": "TestPlan-{ID}",
  "justification": "{obrigatório para block}",
  "artifacts_consumed": ["BAR-{ID}", "UC-{ID}", "UC-{ID+1}"],
  "artifacts_produced": ["QANegocialReport-{ID}", "TestPlan-{ID}"]
}
```

---

## Evals — Casos de Teste

| # | Issue | Classe | Comportamento esperado DOM-05a |
|---|---|---|---|
| 1 | Alterar texto do botão "Salvar" | T0 | QAN-00: LIMPO. QAN-01: LIMPO. QAN-02: 1 teste unitário, 0 integração. Auto-aprovado. |
| 2 | Campo CNPJ com caracteres inválidos | T1 | QAN-00: verificar FE RN-06. QAN-01: consistência shared module. Alerta Gate 2 se B6 ausente. |
| 3 | Limite de crédito emergencial | T2 | QAN-00: FE RN-01 obrigatório. QAN-01: B3 crítico se RN-01 sem cobertura. Plano com IT de atomicidade. |
| 4 | Reativação de fornecedor inativo | T2/T3 | QAN-01: B5 — ambiguidade "inativo" deve estar adereçada. B4 — verificar conflito de estados. |

---

## Métricas de Qualidade

| Métrica | Meta | Mínimo | Medição |
|---|---|---|---|
| FEs determinísticos auditados corretamente | 100% | 100% (zero-fault) | Script de validação |
| Falsos negativos em consistência (B1-B4) | 0% | 0% (zero-fault) | Auditoria pós-Gate 2 |
| LGPD não detectado | 0% | 0% (zero-fault) | Auditoria pós-Gate 5 |
| Tempo SKILL-QAN-00 | < 45s | < 90s | Audit Ledger |
| Tempo SKILL-QAN-01 | < 90s | < 180s | Audit Ledger |
| Tempo SKILL-QAN-02 | < 120s | < 240s | Audit Ledger |
| Falhas detectadas pós-Gate 2 que deveriam ter sido bloqueadas | < 5% | < 10% | Retro pós-Gate 4 |
