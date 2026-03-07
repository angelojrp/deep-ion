---
prompt_id: TP-di-behavioral-regression-implement
version: 1.0.0
type: task-prompt
owner: tech-lead
consumers:
  - QA Comportamental
related_proc: PROC-011
status: active
last_reviewed: "2026-03-06"
sha256: ""
agent: agent
description: "Implementar golden cases de regressão comportamental como código pytest. Pré-condição: especificação confirmada via di-behavioral-regression-design. Usa o QA Comportamental."
name: "di-behavioral-regression-implement"
argument-hint: "Informe o agente ou spec de referência. Pré-condição: especificação de golden cases confirmada (output de di-behavioral-regression-design)."
---

Assuma o papel de **QA Comportamental**.

Carregue obrigatoriamente o arquivo `architecture/skills/SKILL-QAC.md` antes de prosseguir.

## Pré-condições Obrigatórias

> ⛔ **BLOQUEANTE:** A especificação de golden cases DEVE estar confirmada pelo usuário antes de gerar qualquer código. Se a especificação ainda não foi produzida, execute primeiro `di-behavioral-regression-design`.

## Parâmetros de Entrada

- **Agente(s) alvo:** `${input:agents:Nome do agente ou 'todos'}`
- **Referência da especificação:** `${input:specRef:Descreva ou cole a especificação confirmada de golden cases}`
- **Modo LLM:** `${input:llmMode:mock | real — se 'mock', implementar com respostas pré-definidas; se 'real', usar cliente LLM real}`

## Fluxo Obrigatório

### Passo 1 — Validar Especificação

1. Confirmar que a especificação de golden cases foi aceita pelo usuário.
2. Verificar que cada golden case possui: agente, tipo, input canônico, expectativa estrutural, critério de pass/fail.
3. Se algum golden case estiver incompleto: bloquear e solicitar complemento.

### Passo 2 — Implementar Testes (SKILL-QAC-02)

Para cada agente:
1. Criar `agents-engine/tests/behavioral/conftest.py` se não existir (fixtures mock_llm e agent_prompts).
2. Criar `agents-engine/tests/behavioral/test_<slug-agente>_golden.py`.
3. Para cada golden case:
   - Schema test: usar Pydantic v2 `model_validate()` ou `jsonschema.validate()`.
   - Constraint test: mock de input adversarial + assert de recusa.
   - Snapshot test: capturar schema de saída e comparar contra estrutura esperada.
4. Se `llmMode = mock`: adicionar comentário `# MOCK_LLM: substituir por chamada real ao integrar CI` em cada chamada.

### Passo 3 — Relatório de Implementação

| Arquivo criado | Agente | Golden cases implementados | Usa mock LLM? |
|----------------|--------|----------------------------|--------------|

**Nota de fidelidade de CI:**
- `mock`: testes passam localmente, mas não detectam regressões reais de LLM — indicado para bootstrap.
- `real`: requerem API key e aumentam custo de CI — indicado para pipeline de qualidade contínua.

### Passo 4 — Verificação Final

- [ ] `conftest.py` presente com fixtures adequadas
- [ ] Um arquivo por agente com nomenclatura `test_<slug>_golden.py`
- [ ] Todos os golden cases da especificação implementados
- [ ] Modo LLM documentado em cada arquivo de teste
