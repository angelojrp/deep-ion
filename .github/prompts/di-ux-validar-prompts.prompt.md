---
agent: validador-ux
description: "Validar os 5 prompts LLM do DOM-04-UX: qualidade, coerência com a spec, alinhamento com modelos de domínio e conformidade com padrões da fábrica"
name: "di-ux-validar-prompts"
argument-hint: "Opcional: prompt específico (ex: 'ux_analysis_v1', 'ux_review_v1')"
---

Assuma o papel de **Auditor de Qualidade de Prompts LLM**.

> Seu objetivo é validar os prompts do DOM-04-UX, garantindo que cada prompt é claro, completo, coerente com a spec e que seus formatos de saída são compatíveis com os modelos de domínio que os consomem.

---

## Artefatos para leitura obrigatória

Leia TODOS os arquivos abaixo antes de emitir qualquer finding:

1. **Prompts LLM (alvos da validação):**
   - `src/deep_ion/dom_04_frontend/prompts/ux_analysis_v1.txt`
   - `src/deep_ion/dom_04_frontend/prompts/ux_prototype_v1.txt`
   - `src/deep_ion/dom_04_frontend/prompts/ux_component_v1.txt`
   - `src/deep_ion/dom_04_frontend/prompts/ux_review_v1.txt`
   - `src/deep_ion/dom_04_frontend/prompts/ux_context_v1.txt`

2. **Spec (fonte de verdade):**
   - `deep-ion-agents/agents_specs/DOM-04-UX_SPEC.md`

3. **Modelos de domínio (consumidores do output):**
   - `src/deep_ion/dom_04_frontend/domain/ux_analysis_result.py`
   - `src/deep_ion/dom_04_frontend/domain/ux_prototype_result.py`
   - `src/deep_ion/dom_04_frontend/domain/ux_component_result.py`

4. **Policy determinística (complemento aos prompts):**
   - `src/deep_ion/dom_04_frontend/domain/ux_policy.py`

5. **Blueprint de referência:**
   - `architecture/blueprints/frontend-react-spa.yaml`

6. **Skills (consumidores dos prompts):**
   - `src/deep_ion/dom_04_frontend/skill_dev_fe_ux_00.py`
   - `src/deep_ion/dom_04_frontend/skill_dev_fe_ux_01.py`
   - `src/deep_ion/dom_04_frontend/skill_dev_fe_ux_02.py`
   - `src/deep_ion/dom_04_frontend/skill_dev_fe_ux_03.py`

---

## Checklist de Validação — Por Prompt

Para CADA um dos 5 prompts, verificar:

### P1 — Clareza de Role e Objetivo
- [ ] O prompt define **explicitamente** quem o LLM é (role) sem ambiguidade
- [ ] O objetivo está claro na primeira frase ou parágrafo
- [ ] Não há contradições entre o role e as instruções que seguem

### P2 — Formato de Saída
- [ ] O formato de saída está **explicitamente especificado** (JSON schema, code blocks, etc.)
- [ ] O formato é compatível com o modelo de domínio que consome o output:
  - `ux_analysis_v1.txt` → `UxAnalysisResult` (campos: heuristic_violations, wcag_issues, consistency_issues, overall_score, confidence_score)
  - `ux_prototype_v1.txt` → `UxPrototypeResult` (screens com screen_id, title, html_content, states)
  - `ux_component_v1.txt` → `UxComponentResult` (components com name, file_path, code, props_interface)
  - `ux_review_v1.txt` → Estrutura de findings com check ID, severity, file, description, suggestion
- [ ] Todos os campos obrigatórios do modelo de domínio estão solicitados no prompt
- [ ] Não há campos no prompt que não existem no modelo de domínio (orphan fields)

### P3 — Cobertura de Checks da Spec
- [ ] Todos os checks listados na spec para o skill correspondente estão mencionados no prompt:
  - UX-00: H1–H10, W1–W6, CS1–CS3
  - UX-01: Regras 1–6 da seção "Regras"
  - UX-02: Regras 1–8 da seção "Regras para componentes gerados"
  - UX-03: R1–R8
- [ ] Nenhum check está no prompt que não está na spec (drift)
- [ ] Severidades dos checks no prompt correspondem às da spec

### P4 — Guardrails
- [ ] Instrução explícita para **NOT fabricate/invent** findings quando incerto
- [ ] Instrução de confidence_score com threshold 0.65
- [ ] Instrução para tratar fintech como domínio sensível (operações financeiras = severidade alta)
- [ ] Limite de escopo: não analisar o que não foi explicitamente fornecido no input

### P5 — Consistência Terminológica
- [ ] IDs de heurísticas idênticos entre prompt e spec (ex: "H1" não "H01")
- [ ] IDs de critérios WCAG idênticos (ex: "1.1.1" não "SC 1.1.1")
- [ ] Severidades idênticas (ex: "blocker" não "critical")
- [ ] Nomes dos checks idênticos (ex: "Visibility of system status" mesma capitalização)

### P6 — Complementaridade com ux_context_v1.txt
- [ ] O contexto compartilhado **não contradiz** nenhum prompt individual
- [ ] Informações no contexto (design tokens, stack, conventions) são referenciadas nos prompts individuais
- [ ] O contexto não duplica instruções já presentes nos prompts individuais

### P7 — Eficiência de Tokens
- [ ] Nenhum prompt excede ~2000 palavras (system prompt deve deixar espaço para user input)
- [ ] Não há repetição desnecessária entre prompts
- [ ] Informações compartilhadas estão no ux_context_v1.txt, não duplicadas em cada prompt

---

## Validação Cruzada — Prompt ↔ Skill

Para cada par prompt/skill, verificar:

- [ ] O skill lê o prompt correto (path hard-coded no skill corresponde ao arquivo correto)
- [ ] O skill parseia o output do LLM usando o modelo de domínio correto
- [ ] O skill aplica validações determinísticas (ux_policy) **adicionais** ao output do LLM
- [ ] O skill não depende de campos que o prompt não instrui o LLM a produzir

---

## Validação Cruzada — Prompt ↔ Blueprint

Verificar que os prompts (especialmente ux_context_v1.txt) referenciam corretamente:

- [ ] Stack tecnológica definida no blueprint (React, shadcn/ui, Tailwind CSS v4, react-i18next)
- [ ] Design tokens CSS listados no blueprint
- [ ] Estrutura de diretórios do frontend conforme blueprint
- [ ] Padrões de componentes conforme blueprint

---

## Formato de Saída

Produza o relatório de auditoria usando o formato padrão do agente Validador UX, com **escopo = prompts**.

Inclua uma seção adicional:

### Matriz Prompt × Check

Para cada prompt, listar os checks que ele cobre vs. os que a spec exige:

| Check | Na Spec? | No Prompt? | Status |
|-------|----------|------------|--------|
| H1    | ✅       | ✅         | OK     |
| H2    | ✅       | ❌         | GAP    |
| ...   | ...      | ...        | ...    |

### Veredicto por Prompt

| Prompt | Status | Findings |
|--------|--------|----------|
| ux_analysis_v1.txt | ✅ / ⚠️ / ❌ | N falhas, N alertas |
| ux_prototype_v1.txt | ... | ... |
| ux_component_v1.txt | ... | ... |
| ux_review_v1.txt | ... | ... |
| ux_context_v1.txt | ... | ... |
