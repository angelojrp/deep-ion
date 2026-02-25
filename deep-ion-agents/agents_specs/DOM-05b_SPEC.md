# DOM-05b — QA Técnico Agent

**Posição:** DOM-04 (PR aberto) → **DOM-05b** → Gate 4 (Code Review Tech Lead)  
**Disparo:** PR aberto pelo DOM-04 (evento `pull_request.opened` ou `pull_request.synchronize`)  
**Entrega:** QATechReport — auditoria técnica do código produzido pelo DOM-04

---

## Princípios

1. **Atuação no PR, antes do Gate 4:** o agente audita o código antes do Tech Lead revisar. O Gate 4 recebe o relatório junto com o PR — não analisa às cegas.
2. **Contrato de entrada é o TestPlan:** o DOM-05b não decide o que testar. Ele verifica se o que o DOM-04 implementou cobre o que o DOM-05a especificou no TestPlan-{ID}.
3. **Processo independente:** script Python isolado, acionado pelo evento de PR via GitHub Actions. Não tem acesso direto ao DOM-04.
4. **Autonomia proporcional à classe:** T0/T1 bloqueia o PR automaticamente se detectar falha crítica. T2/T3 reporta e escala para o Tech Lead no Gate 4.
5. **Nunca corrige código:** detecta, reporta, bloqueia se necessário. Geração de correção é responsabilidade do DOM-04.

---

## Posicionamento no Pipeline

```
DOM-04 abre PR
  → DOM-05b dispara (automático via pull_request event)
    → lê TestPlan-{ID} da Issue vinculada ao PR
      → executa verificações técnicas
        → publica QATechReport como review no PR
          → [T0/T1] falha crítica → REQUEST_CHANGES (bloqueia merge)
          → [T2/T3] falha crítica → comentário de alerta, Gate 4 decide
          → sem falhas críticas → APPROVE (ou COMMENT se apenas alertas)
            → Gate 4: Tech Lead revisa PR + QATechReport
              → gate/4-aprovado → pipeline de deploy
```

---

## Skills

### SKILL-QAT-00 — Test Coverage Verifier

| | |
|---|---|
| **Trigger** | PR aberto ou atualizado pelo DOM-04 |
| **Input** | Código do PR + TestPlan-{ID} da Issue vinculada |
| **Output** | Relatório de cobertura — seção do QATechReport |
| **Tempo máximo** | 60s |

**Verificações obrigatórias:**

| # | Verificação | Critério de falha | Bloqueante T0/T1? |
|---|---|---|---|
| T1 | Cobertura mínima geral | < 80% nas classes alteradas pelo PR | Sim |
| T2 | Testes unitários do TestPlan implementados | Teste listado no plano ausente no PR | Sim |
| T3 | Cenários Gherkin cobertos | Scenario do UC sem teste correspondente | Sim |
| T4 | Testes de integração do TestPlan implementados | Teste de integração listado no plano ausente | Sim |
| T5 | Cobertura por RN acionada | RN mapeada no TestPlan sem teste de FE correspondente | Sim |
| T6 | Ausência de testes de produção (smoke) | Testes que dependem de infra externa sem mock | Não (alerta) |

**Como vincular PR ao TestPlan:**
```python
# DOM-05b lê a Issue vinculada ao PR via GitHub API
# Busca comentário com prefixo "## TestPlan-" na Issue
# Extrai lista de testes obrigatórios (UT-XX e IT-XX)
def get_test_plan(pr_number: int) -> TestPlan:
    issue = get_linked_issue(pr_number)   # via PR body: "Closes #NNN"
    comments = github_client.get_issue_comments(issue.number)
    plan_comment = next(c for c in comments if c.body.startswith("## TestPlan-"))
    return parse_test_plan(plan_comment.body)
```

---

### SKILL-QAT-01 — Architecture Compliance Checker

| | |
|---|---|
| **Trigger** | SKILL-QAT-00 concluído |
| **Input** | Código do PR + resultado do ModulithArchitectureTest |
| **Output** | Relatório de conformidade arquitetural — seção do QATechReport |
| **Tempo máximo** | 90s |

**Verificações obrigatórias:**

| # | Verificação | Critério de falha | Bloqueante T0/T1? |
|---|---|---|---|
| A1 | ModulithArchitectureTest | Qualquer falha no teste de arquitetura | Sim (todas as classes) |
| A2 | Fronteiras de módulo | Dependência direta entre módulos sem evento de domínio | Sim (todas as classes) |
| A3 | Convenções de nomenclatura | Entidade sem sufixo `Entity`, Service sem sufixo `Service`, etc. | Não (alerta) |
| A4 | Lógica de negócio fora da camada correta | Regra de negócio em Controller ou Repository | Sim |
| A5 | Eventos de domínio | Módulos comunicando-se sem `ApplicationEventPublisher` | Sim |
| A6 | Migration Flyway | Alteração de schema sem arquivo `V{N}__{descricao}.sql` | Sim |
| A7 | Rollback de migration documentado | Migration irreversível sem rollback documentado | Não (alerta T0/T1, bloqueio T2/T3) |

**Execução do ModulithArchitectureTest:**
```bash
# Executado como step da GitHub Action
./mvnw test -pl . -Dtest=ModulithArchitectureTest -q 2>&1
```

---

### SKILL-QAT-02 — RN Implementation Auditor

| | |
|---|---|
| **Trigger** | SKILL-QAT-01 concluído |
| **Input** | Código do PR + catálogo RN-01..RN-07 + UCs da Issue |
| **Output** | Relatório de conformidade de RNs — seção do QATechReport |
| **Tempo máximo** | 90s |
| **Confiança mínima** | `confidence_score < 0.65` → registra dúvida, não infere conformidade |

**Verificações obrigatórias — uma por RN acionada no TestPlan:**

| RN | O que verificar no código |
|---|---|
| RN-01 | `podeDebitar()` invocado antes de qualquer débito. Saldo nunca alterado diretamente. |
| RN-02 | Transferência dentro de `@Transactional`. Dois lançamentos gerados atomicamente. |
| RN-03 | Exclusão de `TransacaoEntity` verifica status `CONFIRMADA` antes de prosseguir. |
| RN-04 | Cálculo de orçamento filtra apenas `status = CONFIRMADA` no período. |
| RN-05 | `MetaAtingidaEvent` publicado via `ApplicationEventPublisher` quando meta atingida. |
| RN-06 | Exclusão de categoria verifica `padrao = true` antes de prosseguir. |
| RN-07 | Relatório de fluxo de caixa filtra apenas `status = CONFIRMADA`. |

| # | Verificação | Critério de falha | Bloqueante? |
|---|---|---|---|
| R1 | RN implementada conforme especificação | Lógica diverge do comportamento definido na RN | Sim (todas as classes) |
| R2 | FE testado com asserção correta | Teste do FE não verifica o comportamento esperado da RN | Sim |
| R3 | Ausência de bypass de RN | Caminho de código que contorna a verificação da RN | Sim (todas as classes) |

> **R1, R2 e R3 são zero-fault em todas as classes.** RN violada em código é risco de negócio direto, independente da classificação da demanda.

---

## QATechReport — Formato Final

Publicado como PR Review (não como comentário simples — usa a GitHub Review API para poder bloquear o merge).

```
## QATechReport-{ID}
**PR:** #{N} | **Issue:** #{N} | **Classificação:** T{N} | **Data:** {ISO-8601}
**Resultado Geral:** [BLOQUEADO | APROVADO COM ALERTAS | APROVADO]
**TestPlan de referência:** TestPlan-{ID}

### Cobertura de Testes (SKILL-QAT-00)
| Check | Status | Detalhe |
|-------|--------|---------|
| T1 — Cobertura geral | ✅ 84% / ❌ 71% | Mínimo: 80% |
| T2 — UTs do TestPlan | ✅ / ❌ | UT-02 ausente: ContaServiceTest#deveX |
| T3 — Gherkin coberto | ✅ / ❌ | Scenario FE-01 sem teste |
| T4 — ITs do TestPlan | ✅ / ❌ | |
| T5 — FEs por RN | ✅ / ❌ | RN-01 sem teste de FE |
| T6 — Testes de produção | ✅ / ⚠️ | |

### Conformidade Arquitetural (SKILL-QAT-01)
| Check | Status | Detalhe |
|-------|--------|---------|
| A1 — ModulithArchitectureTest | ✅ / ❌ | |
| A2 — Fronteiras de módulo | ✅ / ❌ | |
| A3 — Nomenclatura | ✅ / ⚠️ | |
| A4 — Lógica na camada correta | ✅ / ❌ | |
| A5 — Eventos de domínio | ✅ / ❌ | |
| A6 — Migration Flyway | ✅ / ❌ | |
| A7 — Rollback documentado | ✅ / ⚠️ | |

### Conformidade de RNs (SKILL-QAT-02)
| RN | Check | Status | Detalhe |
|----|-------|--------|---------|
| RN-01 | R1 — Implementação | ✅ / ❌ | |
| RN-01 | R2 — FE testado | ✅ / ❌ | |
| RN-01 | R3 — Sem bypass | ✅ / ❌ | |

### Decisão do Agente
**{REQUEST_CHANGES | APPROVE | COMMENT}**
*Falhas críticas:* {lista ou "nenhuma"}
*Alertas:* {lista ou "nenhum"}
*Ação requerida:* {o que o DOM-04 deve corrigir antes do Gate 4, se houver}
```

---

## Regras de Bloqueio por Classe

| Falha detectada | T0 | T1 | T2 | T3 |
|---|---|---|---|---|
| T1/T2/T3/T4/T5 — Cobertura/testes | REQUEST_CHANGES auto | REQUEST_CHANGES auto | COMMENT + alerta Gate 4 | COMMENT + alerta Gate 4 |
| A1/A2 — Modulith/fronteiras | REQUEST_CHANGES (todas) | REQUEST_CHANGES (todas) | REQUEST_CHANGES (todas) | REQUEST_CHANGES (todas) |
| A4/A5 — Lógica/eventos | REQUEST_CHANGES auto | REQUEST_CHANGES auto | COMMENT + alerta Gate 4 | COMMENT + alerta Gate 4 |
| A6 — Migration sem Flyway | REQUEST_CHANGES (todas) | REQUEST_CHANGES (todas) | REQUEST_CHANGES (todas) | REQUEST_CHANGES (todas) |
| R1/R2/R3 — RNs | REQUEST_CHANGES (todas) | REQUEST_CHANGES (todas) | REQUEST_CHANGES (todas) | REQUEST_CHANGES (todas) |
| A3/A7/T6 — Alertas | COMMENT | COMMENT | COMMENT | COMMENT |

> **A1, A2, A6, R1, R2, R3 bloqueiam em todas as classes.** São invariantes da plataforma — não têm exceção por classificação.

---

## Condições de Bloqueio Automático

| # | Condição | Skill | Ação |
|---|---|---|---|
| B1 | ModulithArchitectureTest falhou | QAT-01 (A1) | REQUEST_CHANGES — todas as classes |
| B2 | Dependência direta entre módulos detectada | QAT-01 (A2) | REQUEST_CHANGES — todas as classes |
| B3 | RN implementada incorretamente | QAT-02 (R1) | REQUEST_CHANGES — todas as classes |
| B4 | Bypass de RN detectado | QAT-02 (R3) | REQUEST_CHANGES — todas as classes |
| B5 | Schema alterado sem migration Flyway | QAT-01 (A6) | REQUEST_CHANGES — todas as classes |
| B6 | Cobertura < 80% ou teste do TestPlan ausente | QAT-00 (T1-T5) | REQUEST_CHANGES T0/T1, alerta T2/T3 |
| B7 | Lógica de negócio fora de camada correta | QAT-01 (A4) | REQUEST_CHANGES T0/T1, alerta T2/T3 |

---

## Fluxo de Labels no PR

```
PR aberto pelo DOM-04
  → qa-tech/em-analise
    → qa-tech/aprovado              (APPROVE — Gate 4 pode prosseguir)
    → qa-tech/aprovado-com-alertas  (COMMENT — Gate 4 decide)
    → qa-tech/bloqueado             (REQUEST_CHANGES — DOM-04 deve corrigir)
```

---

## Estrutura de Arquivos

```
.github/
├── qa_tecnico/
│   ├── skill_qat_00.py          # Test Coverage Verifier
│   ├── skill_qat_01.py          # Architecture Compliance Checker
│   ├── skill_qat_02.py          # RN Implementation Auditor
│   ├── rn_catalog.py            # Catálogo RN-01..RN-07 (compartilhado)
│   └── prompts/
│       ├── coverage_check.md    # Prompt para QAT-00
│       ├── arch_check.md        # Prompt para QAT-01
│       └── rn_audit.md          # Prompt para QAT-02
└── workflows/
    └── qa-tecnico-trigger.yml   # Dispara DOM-05b em pull_request.opened/synchronize
```

Cada skill invocada como processo isolado:
```bash
python .github/qa_tecnico/skill_qat_00.py --pr 87
python .github/qa_tecnico/skill_qat_01.py --pr 87
python .github/qa_tecnico/skill_qat_02.py --pr 87
```

---

## Audit Ledger — DecisionRecord

```json
{
  "record_id": "DR-QAT-{UUID}",
  "agent": "DOM-05b",
  "skill": "SKILL-QAT-00 | SKILL-QAT-01 | SKILL-QAT-02",
  "issue_id": "{numero}",
  "pr_id": "{numero}",
  "timestamp": "{ISO-8601}",
  "classification": "T0 | T1 | T2 | T3",
  "test_plan_id": "TestPlan-{ID}",
  "decision_type": "block | alert | approve",
  "decision": "request_changes | comment | approve",
  "autonomous_block": true,
  "coverage_pct": 84,
  "failures_critical": ["A1 — ModulithArchitectureTest falhou"],
  "failures_warning": ["A3 — CategoriaController sem sufixo correto"],
  "rn_audited": ["RN-01", "RN-03"],
  "rn_violations": [],
  "justification": "{obrigatório para request_changes}",
  "artifacts_consumed": ["TestPlan-{ID}", "UC-{ID}"],
  "artifacts_produced": ["QATechReport-{ID}"]
}
```

---

## Evals — Casos de Teste

| # | Issue | Classe | Comportamento esperado DOM-05b |
|---|---|---|---|
| 1 | Alterar texto do botão "Salvar" | T0 | QAT-00: 1 UT simples. QAT-01: Modulith verde. QAT-02: nenhuma RN. APPROVE automático. |
| 2 | Campo CNPJ com caracteres inválidos | T1 | QAT-00: UT de validação + FE RN-06 se aplicável. QAT-01: verificar shared module. REQUEST_CHANGES se cobertura < 80%. |
| 3 | Limite de crédito emergencial | T2 | QAT-02: RN-01 — podeDebitar() obrigatório, bypass = REQUEST_CHANGES. IT de atomicidade obrigatório. |
| 4 | Reativação de fornecedor inativo | T2/T3 | QAT-01: fronteiras de módulo (estado do fornecedor). QAT-02: RN-03 se transação envolvida. Alerta Gate 4 se T2/T3. |

---

## Métricas de Qualidade

| Métrica | Meta | Mínimo | Medição |
|---|---|---|---|
| RNs auditadas corretamente | 100% | 100% (zero-fault) | Auditoria pós-Gate 4 |
| ModulithArchitectureTest não detectado como falho | 0% | 0% (zero-fault) | Automático |
| Bypass de RN não detectado | 0% | 0% (zero-fault) | Auditoria pós-produção |
| Tempo SKILL-QAT-00 | < 60s | < 120s | Audit Ledger |
| Tempo SKILL-QAT-01 | < 90s | < 180s | Audit Ledger |
| Tempo SKILL-QAT-02 | < 90s | < 180s | Audit Ledger |
| REQUEST_CHANGES revertidos pelo Tech Lead no Gate 4 | < 10% | < 20% | GitHub Actions log |
| Defeitos escapando para Gate 5 detectáveis no Gate 4 | < 5% | < 10% | Retro pós-deploy |
