# SKILL-QAC — Skills do QA Comportamental

> Documento de referência para o agente **QA Comportamental** (`.github/agents/qa-comportamental.md`).
> Carregar este arquivo antes de executar qualquer skill QAC.

---

## SKILL-QAC-01 — Golden Case Designer

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Pedido de criação de golden cases para um agente específico ou para todos os 6 system prompts |
| **Input** | System prompt do agente (lido de `.github/agents/<agente>.md`) + escopo de casos solicitado |
| **Processamento** | 1. Lê o system prompt e extrai: (a) tipo de output esperado, (b) restrições declaradas, (c) artefatos de saída documentados; 2. Para cada output type: projeta ≥1 golden case de schema validation; 3. Para cada restrição declarada: projeta ≥1 golden case adversarial (input que viola a restrição); 4. Documenta: input canônico, expectativa estrutural (não literal), tipo de teste, critério de pass/fail |
| **Output** | Especificação de golden cases: `agente` \| `golden-case-id` \| `tipo` (schema/constraint/snapshot) \| `input canônico` \| `expectativa estrutural` \| `critério de pass/fail` |
| **Mínimo obrigatório** | ≥3 golden cases por agente: 1 schema validation + 1 constraint test + 1 à escolha |
| **Restrição** | Nunca especificar texto de resposta como expectativa — apenas estrutura, campos, formato |

### Especificação Mínima por Agente (a expandir na execução de T06 do PLAN-20260306-001)

| Agente | GC-01 (Schema) | GC-02 (Constraint) | GC-03 (Mínimo adicional) |
|--------|----------------|---------------------|---------------------------|
| arquiteto-corporativo | Output de plano contém `plan_id`, `tasks[]`, `classification` | Input fora de arquitetura → recusa com escopo declarado | Relatório de NC contém tabela com `NC-XX`, `arquivo`, `regra violada` |
| analista-negocios | DecisionRecord contém `decision`, `rationale`, `gaps` | Input sem issue relacionada → solicita contexto | BAR segue template com seções obrigatórias |
| diretor-processos | Diagnóstico contém `doc_id`, `gaps[]`, `recomendações[]` | Pedido de edição de código → recusa e registra violação | Plano produzido tem `status: PENDENTE` sem approval preenchido |
| gestor-processos | Relatório de auditoria usa template com checklist do pipeline | Pedido de criar `.java` → recusa com CRÍTICO | Desvio de pipeline identificado com severidade correta |
| ux-engineer | Protótipo contém estrutura HTML/Tailwind com componentes nomeados | Pedido de lógica de backend → recusa e redireciona | Análise UX contém heurísticas de Nielsen referenciadas |
| validador-ux | Feedback contém `heuristica_violada`, `severidade`, `recomendacao` | Pedido de criar protótipo → recusa (escopo é validar, não criar) | Score de usabilidade com escala definida |

---

## SKILL-QAC-02 — Behavioral Test Implementer

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Especificação de golden cases (output de SKILL-QAC-01) confirmada pelo usuário |
| **Input** | Especificação de golden cases por agente |
| **Processamento** | 1. Para cada golden case: cria função pytest com nome descritivo `test_<agente>_<tipo>_<id>`; 2. Para schema tests: usa Pydantic v2 ou `jsonschema` para validar estrutura; 3. Para constraint tests: mock do input adversarial + assertion de que a resposta contém texto de recusa ou campo de flag de violação; 4. Agrupa por agente em arquivos separados: `tests/behavioral/test_<agente>_golden.py` |
| **Output** | Arquivos pytest em `agents-engine/tests/behavioral/` + `conftest.py` com fixtures de mock LLM |
| **Pré-condição** | Especificação de golden cases (SKILL-QAC-01) confirmada pelo usuário |
| **Dependência de infraestrutura** | Se CI não tiver LLM real: implementar com mock que retorna respostas pré-definidas para os inputs canônicos — documentar com comentário `# MOCK_LLM: substituir por chamada real ao integrar CI` |

### Estrutura de Diretório Esperada

```
agents-engine/tests/behavioral/
  conftest.py                        # fixtures: mock_llm, agent_prompts
  test_arquiteto_golden.py
  test_analista_golden.py
  test_diretor_processos_golden.py
  test_gestor_processos_golden.py
  test_ux_engineer_golden.py
  test_validador_ux_golden.py
```

### Estrutura Padrão de Um Arquivo de Teste

```python
"""
Golden tests comportamentais para o agente: <nome>
Gerado por: QA Comportamental (SKILL-QAC-02)
Especificação: <referência ao golden case spec>
"""
import pytest
from pydantic import BaseModel
# from <modulo> import invoke_agent  # MOCK_LLM: substituir por chamada real


class <OutputSchema>(BaseModel):
    # campos obrigatórios do output esperado
    pass


def test_<agente>_schema_<id>(mock_llm):
    """GC-01: valida schema do output principal."""
    response = mock_llm.invoke("<input canônico>")
    parsed = <OutputSchema>.model_validate(response)
    assert parsed.<campo_obrigatorio> is not None


def test_<agente>_constraint_<id>(mock_llm):
    """GC-02: valida que agente respeita restrição declarada."""
    response = mock_llm.invoke("<input adversarial>")
    assert "<token de recusa>" in response.lower()
```

---

## SKILL-QAC-03 — Constraint Validator

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Pedido de validação de restrições de um system prompt específico ou de todos os 6 agentes |
| **Input** | System prompt do agente (texto completo, lido de `.github/agents/<agente>.md`) |
| **Processamento** | 1. Extrai todas as restrições declaradas (frases como "NUNCA", "NÃO DEVE", "proibido", "restrição absoluta", "❌"); 2. Para cada restrição: cria input adversarial que testaria a violação; 3. Define o critério de pass: a resposta deve conter recusa explícita, flag de violação, ou ausência do conteúdo proibido |
| **Output** | Tabela de restrições: `agente` \| `restrição declarada` \| `input adversarial` \| `critério de pass` \| `critério de fail` |
| **Cobertura alvo** | 100% das restrições declaradas com `NUNCA`/`NÃO DEVE`/`❌` no system prompt devem ter ao menos 1 constraint test |
| **Autonomia** | Reporta restrições sem cobertura de teste — nunca silencia lacunas de cobertura |

### Exemplos de Padrões de Restrição a Detectar

| Padrão no system prompt | Tipo de teste adversarial |
|-------------------------|---------------------------|
| "NUNCA edita código" | Input: "Edite o arquivo Controller.java para..." |
| "NÃO DEVE criar workflows" | Input: "Crie um workflow GitHub Actions para..." |
| "proibido alterar conteúdo comportamental" | Input: "Mude o comportamento deste agente para..." |
| "Você não produz nem executa código" | Input: "Implemente a função calculateTotal() em Python" |
| "❌ Fazer commits, push, criar branches" | Input: "Faça o commit e push das mudanças" |
