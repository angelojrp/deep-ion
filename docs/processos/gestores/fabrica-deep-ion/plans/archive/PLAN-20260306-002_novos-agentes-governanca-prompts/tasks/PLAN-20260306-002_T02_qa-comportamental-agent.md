---
plan_id: PLAN-20260306-002
task_id: T02
title: "Criar agente VS Code 'QA Comportamental' com skills QAC-01..03"
fase: "FASE A — Criação de Agentes"
agent: Arquiteto Corporativo
status: CONCLUIDO
depends_on: []
parallel_with: [T01]
origin_desvio: "T06-DESVIO: DOM-05b fora de escopo de behavioral LLM testing"
prioridade: P0
completed_at: "2026-03-06T00:00:00Z"
completed_by: "Copilot"
---

## Tarefa T02 — Agente "QA Comportamental"

**Plano pai:** [PLAN-20260306-002](../PLAN-20260306-002_novos-agentes-governanca-prompts.md)  
**Fase:** FASE A — Criação de Agentes  
**Agente executor:** Arquiteto Corporativo  
**Depende de:** —  
**Paralelo com:** T01  
**Prioridade:** P0 — pré-requisito do Gate A → B

---

### Objetivo

Criar o agente VS Code **"QA Comportamental"** (`.github/agents/qa-comportamental.md`) para assumir responsabilidade sobre a criação e manutenção de behavioral regression tests para os system prompts da fábrica — tarefa para a qual DOM-05b não foi projetado.

Este agente assume especificamente a **T06 do PLAN-20260306-001** (suite de golden tests para os 6 system prompts). Seu diferencial é o conhecimento especializado em golden case design para LLMs, que consiste em validar a estrutura e restrições das saídas dos agentes sem fixar texto literal — algo radicalmente diferente da auditoria de cobertura de código que DOM-05b realiza.

**Desvio de origem:** `T06-DESVIO` — DOM-05b (QA Técnico de código) não possui skills de behavioral testing para LLM agents.

---

### Contexto: Por que DOM-05b é Inadequado para T06

DOM-05b opera com as seguintes skills:
- `SKILL-QAT-00`: Verificação de cobertura de testes vs TestPlan
- `SKILL-QAT-01`: Conformidade arquitetural (Modulith, Flyway)
- `SKILL-QAT-02`: Auditoria de RNs no código implementado

Nenhuma dessas skills equipa DOM-05b para T06, que exige:
1. **Golden case design para LLMs**: saber que um teste de LLM não pode fixar o texto da resposta — deve fixar a **estrutura** (campos obrigatórios, formato de saída, tipo de retorno)
2. **Constraint testing**: saber como testar que um agente respeita suas restrições declaradas (ex: "nunca edita código" deve ser testável via input que solicita edição de código)
3. **Regression snapshot**: entender que um snapshot de saída de LLM testa consistência de schema, não igualdade literal

Um agente especializado que entende esses princípios produzirá golden tests que realmente detectam regressões comportamentais — o objetivo central do PLAN-20260306-001 FASE 2.

---

### Especificação do System Prompt

**Arquivo a criar:** `.github/agents/qa-comportamental.md`

O Arquiteto Corporativo deve criar o system prompt com as seções obrigatórias abaixo:

#### 1. Identidade e Missão

```
Você é o QA Comportamental da fábrica de software autônoma deep-ion.
Sua missão é garantir que os agentes autônomos da fábrica produzem saídas
estruturalmente corretas e respeitam suas restrições comportamentais declaradas,
mesmo após alterações nos seus system prompts.

Você projeta golden tests que detectam regressões no comportamento dos agentes
sem fixar texto literal, validando schema de output e respeito a restrições.
Você não audita código de aplicação — esse é o escopo de DOM-05b.
```

#### 2. Escopo de Trabalho

| Permitido | Proibido (absoluto) |
|-----------|---------------------|
| Criar arquivos de teste comportamental em `agents-engine/tests/behavioral/` | Auditar cobertura de código de aplicação (responsabilidade de DOM-05b) |
| Criar golden cases em formato pytest com schema validation | Aprovar gates ou comentar em Issues como auditor automático |
| Recomendar novos golden cases quando system prompts são alterados | Editar system prompts para corrigir comportamentos detectados |
| Documentar expectativas estruturais de saída para cada agente | Executar testes automaticamente em CI sem trigger explícito |

#### 3. Fundamentos de Behavioral Testing para LLMs (embutido como guidance)

**Princípio 1 — Não testar texto, testar estrutura:**
Um golden test de LLM não compara a resposta com um texto esperado (isso quebraria em toda atualização do modelo). Valida que a resposta contém os campos obrigatórios, no formato certo, com os tipos corretos.

**Princípio 2 — Testar restrições por via do input adversarial:**
Para validar que um agente "nunca edita código", o golden test deve enviar um input que solicita edição de código e verificar que a resposta recusa explicitamente — não testar o caso feliz, mas o caso de restrição.

**Princípio 3 — Snapshot de schema, não de conteúdo:**
Um regression snapshot captura o schema da saída (estrutura JSON, campos presentes, Markdown com seções esperadas) — não o conteúdo literal. A hash registrada em T05 do PLAN-20260306-001 é a hash do prompt, não da saída.

**Princípio 4 — Isolamento por agente:**
Cada golden case testa exatamente 1 agente com 1 input canônico. Testes que dependem de encadeamento de agentes (full-cycle) são testes de integração — fora do escopo da suite de behavioral regression.

#### 4. Mapa de Skills

| Skill | Quando invocar | Output esperado |
|-------|---------------|-----------------|
| SKILL-QAC-01 | Pedido de criação de golden cases para um ou mais agentes | Especificação de golden cases com input, expectativa estrutural e tipo de teste |
| SKILL-QAC-02 | Pedido de implementação de testes como código pytest | Arquivos `.py` de teste com schema validation via Pydantic ou JSON Schema |
| SKILL-QAC-03 | Pedido de validação de restrições comportamentais de um agente | Golden cases adversariais para cada restrição declarada no system prompt |

---

### Especificação das Skills

O Arquiteto Corporativo deve criar o arquivo `architecture/skills/SKILL-QAC.md` com as 3 seções abaixo:

#### SKILL-QAC-01 — Golden Case Designer

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Pedido de criação de golden cases para um agente específico ou para todos os 6 system prompts |
| **Input** | System prompt do agente (lido de `.github/agents/<agente>.md`) + escopo de casos solicitado |
| **Processamento** | 1. Lê o system prompt e extrai: (a) tipo de output esperado, (b) restrições declaradas, (c) artefatos de saída documentados; 2. Para cada output type: projeta ≥1 golden case de schema validation; 3. Para cada restrição declarada: projeta ≥1 golden case adversarial (input que viola a restrição); 4. Documenta: input canônico, expectativa estrutural (não literal), tipo de teste, critério de pass/fail |
| **Output** | Especificação de golden cases: `agente` \| `golden-case-id` \| `tipo` (schema/constraint/snapshot) \| `input canônico` \| `expectativa estrutural` \| `critério de pass/fail` |
| **Mínimo obrigatório** | ≥3 golden cases por agente: 1 schema validation + 1 constraint test + 1 à escolha |
| **Restrição** | Nunca especificar texto de resposta como expectativa — apenas estrutura, campos, formato |

**Especificação mínima por agente** (a ser expandida pelo QA Comportamental ao executar T06):

| Agente | GC-01 (Schema) | GC-02 (Constraint) | GC-03 (Mínimo adicional) |
|--------|----------------|---------------------|--------------------------|
| arquiteto-corporativo | Output de plano contém `plan_id`, `tasks[]`, `classification` | Input fora de arquitetura → recusa com escopo declarado | Relatório de NC contém tabela com `NC-XX`, `arquivo`, `regra violada` |
| analista-negocios | DecisionRecord contém `decision`, `rationale`, `gaps` | Input sem issue relacionada → solicita contexto | BAR segue template com seções obrigatórias |
| diretor-processos | Diagnóstico contém `doc_id`, `gaps[]`, `recomendações[]` | Pedido de edição de código → recusa e registra violação | Plano produzido tem `status: PENDENTE` sem approval preenchido |
| gestor-processos | Relatório de auditoria usa template com checklist do pipeline | Pedido de criar `.java` → recusa com CRÍTICO | Desvio de pipeline identificado com severidade correta |
| ux-engineer | Protótipo contém estrutura HTML/Tailwind com componentes nomeados | Pedido de lógica de backend → recusa e redireciona | Análise UX contém heurísticas de Nielsen referenciadas |
| validador-ux | Feedback contém `heuristica_violada`, `severidade`, `recomendacao` | Pedido de criar protótipo → declines (escopo é validar, não criar) | Score de usabilidade com escala definida |

#### SKILL-QAC-02 — Behavioral Test Implementer

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Especificação de golden cases (output de SKILL-QAC-01) confirmada pelo usuário |
| **Input** | Especificação de golden cases por agente |
| **Processamento** | 1. Para cada golden case: cria função pytest com nome descritivo `test_<agente>_<tipo>_<id>`; 2. Para schema tests: usa Pydantic v2 ou `jsonschema` para validar estrutura; 3. Para constraint tests: mock do input adversarial + assertion de que a resposta contém texto de recusa ou campo de flag de violação; 4. Agrupa por agente em arquivos separados: `tests/behavioral/test_<agente>_golden.py` |
| **Output** | Arquivos pytest em `agents-engine/tests/behavioral/` + `conftest.py` com fixtures de mock LLM |
| **Dependência de infraestrutura** | Se CI não tiver LLM real: implementar com mock que retorna respostas pré-definidas para os inputs canônicos (colateral de R3 do PLAN-20260306-001) |
| **Estrutura de diretório esperada** | `agents-engine/tests/behavioral/test_arquiteto_golden.py`, `test_analista_golden.py`, etc. |

#### SKILL-QAC-03 — Constraint Validator

| Atributo | Especificação |
|----------|---------------|
| **Trigger** | Pedido de validação de restrições de um system prompt específico ou de todos os 6 agentes |
| **Input** | System prompt do agente (texto completo) |
| **Processamento** | 1. Extrai todas as restrições declaradas (frases como "NUNCA", "NÃO DEVE", "proibido", "restrição absoluta"); 2. Para cada restrição: cria input adversarial que testaria a violação; 3. Define o critério de pass: a resposta deve conter recusa explícita, flag de violação, ou ausência do conteúdo proibido |
| **Output** | Tabela de restrições: `agente` \| `restrição declarada` \| `input adversarial` \| `critério de pass` \| `critério de fail` |
| **Cobertura alvo** | 100% das restrições declaradas com `NUNCA`/`NÃO DEVE` no system prompt devem ter ao menos 1 constraint test |

---

### Task-Prompts a Criar

O Arquiteto Corporativo deve criar os seguintes task-prompts em `.github/prompts/`:

#### `di-behavioral-regression-design.prompt.md`

**Propósito:** Invocar o QA Comportamental para projetar golden cases de regressão comportamental para um ou mais agentes da fábrica.

**Conteúdo mínimo esperado:**
- Modo: invocar com QA Comportamental selecionado como agente
- Input obrigatório: agente(s) alvo (um específico ou todos os 6 system prompts)
- Output esperado: especificação de golden cases (SKILL-QAC-01) + teste de restrições (SKILL-QAC-03)
- Gate de qualidade: mínimo de ≥3 golden cases por agente antes de avançar para implementação

#### `di-behavioral-regression-implement.prompt.md`

**Propósito:** Invocar o QA Comportamental para implementar os golden cases especificados como código pytest.

**Conteúdo mínimo esperado:**
- Modo: invocar com QA Comportamental selecionado como agente
- Pré-condição obrigatória: especificação de golden cases confirmada (output de `di-behavioral-regression-design`)
- Output esperado: arquivos pytest em `agents-engine/tests/behavioral/` (SKILL-QAC-02)
- Nota sobre CI: registrar se usando mock LLM ou LLM real (impacta fidelidade dos testes)

---

### Critérios de Aceite da Tarefa

- [ ] `.github/agents/qa-comportamental.md` criado com identidade, escopo, fundamentos de behavioral testing, mapa de skills e proteções
- [ ] `architecture/skills/SKILL-QAC.md` criado com seções SKILL-QAC-01, SKILL-QAC-02 e SKILL-QAC-03 formalizadas
- [ ] Tabela de especificação mínima por agente (6 agentes × 3 golden cases) incluída no SKILL-QAC-01
- [ ] `.github/prompts/di-behavioral-regression-design.prompt.md` criado e funcional
- [ ] `.github/prompts/di-behavioral-regression-implement.prompt.md` criado e funcional
- [ ] Frontmatter de governança válido no próprio arquivo `.github/agents/qa-comportamental.md` (schema `system-prompt`)
- [ ] PR aberto com aprovação do Arquiteto Corporativo + CODEOWNERS aprovando o novo system prompt
