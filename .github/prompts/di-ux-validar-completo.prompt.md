---
agent: validador-ux
description: "Auditoria completa ponta-a-ponta do DOM-04-UX: spec, prompts, modelos, policy, skills, testes, workflow — validação de todas as dimensões"
name: "di-ux-validar-completo"
argument-hint: "Opcional: foco em dimensão específica (ex: 'completude', 'consistência', 'arquitetura')"
---

Assuma o papel de **Auditor de Qualidade Completo do DOM-04-UX**.

> Seu objetivo é executar uma auditoria ponta-a-ponta de TODOS os artefatos do DOM-04-UX, verificando completude, consistência, conformidade arquitetural e qualidade dos prompts.

---

## Artefatos para leitura obrigatória

Leia TODOS os arquivos abaixo antes de emitir qualquer finding. Use a ferramenta `codebase` para ler cada um:

### Spec
- `deep-ion-agents/agents_specs/DOM-04-UX_SPEC.md`

### Prompts LLM
- `src/deep_ion/dom_04_frontend/prompts/ux_analysis_v1.txt`
- `src/deep_ion/dom_04_frontend/prompts/ux_prototype_v1.txt`
- `src/deep_ion/dom_04_frontend/prompts/ux_component_v1.txt`
- `src/deep_ion/dom_04_frontend/prompts/ux_review_v1.txt`
- `src/deep_ion/dom_04_frontend/prompts/ux_context_v1.txt`

### Modelos de Domínio
- `src/deep_ion/dom_04_frontend/domain/ux_analysis_result.py`
- `src/deep_ion/dom_04_frontend/domain/ux_prototype_result.py`
- `src/deep_ion/dom_04_frontend/domain/ux_component_result.py`
- `src/deep_ion/dom_04_frontend/domain/ux_policy.py`

### Skills
- `src/deep_ion/dom_04_frontend/skill_dev_fe_ux_00.py`
- `src/deep_ion/dom_04_frontend/skill_dev_fe_ux_01.py`
- `src/deep_ion/dom_04_frontend/skill_dev_fe_ux_02.py`
- `src/deep_ion/dom_04_frontend/skill_dev_fe_ux_03.py`

### Infraestrutura
- `src/deep_ion/dom_04_frontend/infrastructure/template_reader.py`
- `src/deep_ion/dom_04_frontend/infrastructure/github_client.py`
- `src/deep_ion/dom_04_frontend/audit/frontend_ledger.py`

### Workflow
- `.github/workflows/fe-ux-agent.yml`

### Testes
- `tests/dom_04_frontend/domain/test_ux_analysis_result.py`
- `tests/dom_04_frontend/domain/test_ux_prototype_result.py`
- `tests/dom_04_frontend/domain/test_ux_component_result.py`
- `tests/dom_04_frontend/domain/test_ux_policy.py`
- `tests/dom_04_frontend/integration/test_ux_skills_integration.py`

### Referências Cruzadas
- `architecture/blueprints/frontend-react-spa.yaml`
- `docs/ai/templates/prototipo-screen-template.html`
- `.github/copilot-instructions.md`

---

## Protocolo de Execução

Execute as seguintes fases **em ordem**. Não avance para a próxima fase sem concluir a anterior.

### Fase 1 — Leitura

Leia todos os artefatos listados acima. Confirme quantos foram lidos com sucesso antes de prosseguir.

### Fase 2 — Completude (C1–C7)

| # | Check | Verificação |
|---|-------|-------------|
| C1 | Spec → Skills | Todo skill listado na spec (UX-00, UX-01, UX-02, UX-03) tem implementação em `skill_dev_fe_ux_*.py` |
| C2 | Spec → Prompts | Todo skill tem prompt correspondente em `prompts/ux_*_v1.txt` |
| C3 | Spec → Modelos | Todo output descrito (UxAnalysisResult, UxPrototypeResult, UxComponentResult) existe no código |
| C4 | Spec → Testes | Os 10 cenários de eval da spec têm cobertura nos testes (unit + integration) |
| C5 | Spec → Labels | TODAS as labels no fluxo de labels da spec aparecem nos skills E no workflow |
| C6 | Spec → Audit | TODOS os campos do DecisionRecord JSON na spec existem no `frontend_ledger.py` |
| C7 | Prompt → Modelo | Cada campo solicitado no output do prompt tem campo correspondente no modelo de domínio |

### Fase 3 — Consistência (B1–B7)

| # | Check | Verificação |
|---|-------|-------------|
| B1 | IDs de checks | Compare literalmente: H1–H10, W1–W6, CS1–CS3, R1–R8 entre spec ↔ prompts ↔ ux_policy ↔ testes |
| B2 | Severidades | Os 3 níveis (blocker/warning/info) são idênticos em: spec, prompts, ux_policy.py, testes |
| B3 | Modelo/Tier | O modelo e tier na spec batem com o que o skill solicita ao ProviderFactory |
| B4 | confidence_score | O threshold 0.65 aparece identicamente em: spec, skills (code), testes |
| B5 | Labels | As labels hardcoded nos skills são EXATAMENTE as mesmas da spec e do workflow |
| B6 | Prefixos | `## UX-ANALISE-`, `## UX-PROTO-`, `## UX-COMP-`, `## UX-REVIEW-` iguais em spec, skills, testes |
| B7 | Design tokens | Tokens no ux_context_v1.txt batem com blueprint frontend-react-spa.yaml |

### Fase 4 — Conformidade Arquitetural (A1–A7)

| # | Check | Verificação |
|---|-------|-------------|
| A1 | Isolamento | Cada skill é invocável com `--issue N` ou `--pr N`, sem import cruzado entre skills |
| A2 | GitHub bus | Skills leem input de comentários e escrevem output como comentários — sem shared state |
| A3 | Policy determinística | WCAG checks, design token checks e component conventions estão em ux_policy.py (não no prompt LLM) |
| A4 | Escalação | Verificar no código de cada skill: `if confidence_score < 0.65 → escalate` (não resolver silenciosamente) |
| A5 | OutputPolicy | Skills UX-02 (componentes) usa OutputPolicy.strip_prose() para output de código |
| A6 | Reutilização | Skills usam GitHubClient, BlueprintReader, ProviderFactory existentes (não reimplementam) |
| A7 | Blueprint | Componentes no prompt UX-02 e context referem stack do blueprint (shadcn/ui, Tailwind, i18n) |

### Fase 5 — Qualidade dos Prompts (P1–P7)

Para CADA prompt individual + ux_context_v1.txt:

| # | Check | Verificação |
|---|-------|-------------|
| P1 | Formato output | Formato de saída explícito e parseável (JSON/code blocks) |
| P2 | Role claro | Sem ambiguidade no papel atribuído ao LLM |
| P3 | Guardrails | Inclui: não fabricar, não inferir, confidence_score, domínio fintech |
| P4 | Cobertura spec | Todos os checks da spec estão no prompt correspondente |
| P5 | Termos | Terminologia idêntica entre prompt e spec |
| P6 | Complemento | ux_context_v1.txt complementa sem contradizer |
| P7 | Tokens | Nenhum prompt excessivamente longo (> ~2000 palavras) |

### Fase 6 — Cobertura de Testes

- [ ] Modelos de domínio: testes para frozen fields, validações de score, computed properties
- [ ] ux_policy: testes para cada função (validate_wcag_compliance, validate_design_token_usage, validate_component_conventions, validate_pr_diff_ux)
- [ ] Integration: pelo menos 1 test por skill, incluindo happy path + escalação
- [ ] Edge cases: confidence_score < 0.65, PR sem arquivos frontend, resultado vazio

---

## Formato de Saída

Produza o relatório de auditoria completo usando o formato padrão do agente Validador UX, com **escopo = completo**.

Após o relatório padrão, inclua seções adicionais:

### Rastreabilidade Ponta-a-Ponta

Para cada skill, listar a cadeia completa:

```
SKILL-UX-XX
├── Spec: seção "SKILL-UX-XX" em DOM-04-UX_SPEC.md
├── Prompt: prompts/ux_*_v1.txt
├── Modelo: domain/ux_*_result.py
├── Policy: domain/ux_policy.py (funções: ...)
├── Infra: infrastructure/*.py (classes: ...)
├── Entry point: skill_dev_fe_ux_XX.py
├── Workflow: fe-ux-agent.yml (job: ...)
├── Labels: ux/...-solicitada → ux/...-em-andamento → ux/...-concluida
├── Tests unit: test_ux_*_result.py, test_ux_policy.py
└── Tests integration: test_ux_skills_integration.py::TestSkillUxXX
```

### Cobertura de Checks

Matriz completa de checks × artefatos:

| Check | Spec | Prompt | Policy | Teste Unit | Teste Integ |
|-------|------|--------|--------|------------|-------------|
| H1    | ✅   | ✅     | —      | —          | —           |
| W1    | ✅   | ✅     | ✅     | ✅         | —           |
| R1    | ✅   | ✅     | ✅     | ✅         | ✅          |
| ...   | ...  | ...    | ...    | ...        | ...         |

### Veredicto Final

- **✅ APROVADO** — todos os artefatos conformes, pipeline pronto para uso
- **⚠️ APROVADO COM RESSALVAS** — funcional mas com alertas listados
- **❌ REPROVADO** — falhas bloqueadoras que devem ser corrigidas

Para cada finding, inclua:
1. Arquivo e linha exata
2. Descrição precisa do problema
3. Sugestão concreta de correção
4. Classificação: ❌ falha | ⚠️ alerta | ℹ️ observação
