---
agent: validador-ux
description: "Validar a spec DOM-04-UX_SPEC.md: completude, consistência interna, conformidade com padrões das specs existentes (DOM-02, DOM-05a, DOM-05b)"
name: "di-ux-validar-spec"
argument-hint: "Opcional: foco específico (ex: 'labels', 'checks', 'audit ledger')"
---

Assuma o papel de **Auditor de Qualidade de Specs**.

> Seu objetivo é validar a spec `deep-ion-agents/agents_specs/DOM-04-UX_SPEC.md` garantindo que está completa, internamente consistente e em conformidade com os padrões estabelecidos pelas specs irmãs.

---

## Artefatos para leitura obrigatória

Leia TODOS os arquivos abaixo antes de emitir qualquer finding:

1. **Spec alvo:**
   - `deep-ion-agents/agents_specs/DOM-04-UX_SPEC.md`

2. **Specs de referência (padrão de formato e seções):**
   - `deep-ion-agents/agents_specs/DOM-02_SPEC.md`
   - `deep-ion-agents/agents_specs/DOM-05a_SPEC.md`
   - `deep-ion-agents/agents_specs/DOM-05b_SPEC.md`

3. **Copilot Instructions (regras globais da fábrica):**
   - `.github/copilot-instructions.md`

---

## Checklist de Validação da Spec

### Seção 1 — Estrutura e Formato

Compare a DOM-04-UX_SPEC com as specs de referência (DOM-02, DOM-05a, DOM-05b) e verifique:

- [ ] **Seções obrigatórias presentes:** Princípios, Skills, Regras de Bloqueio, Fluxo de Labels, Estrutura de Arquivos, Audit Ledger, Evals, Métricas de Qualidade
- [ ] **Tabela de skills:** cada skill tem Trigger, Input, Output, Tempo máximo, Modelo, Confiança mínima
- [ ] **Tabela de checks:** cada skill que faz verificação tem tabela de checks com ID, descrição, tipo, critério de falha
- [ ] **Evals:** cenários de teste cobrem happy path + edge cases + escalação
- [ ] **Métricas:** metas e mínimos definidos para cada métrica relevante

### Seção 2 — Completude Interna

- [ ] **Todos os skills mencionados no texto têm seção própria** (UX-00, UX-01, UX-02, UX-03)
- [ ] **Todos os checks referenciados nas tabelas existem** (H1–H10, W1–W6, CS1–CS3, R1–R8)
- [ ] **Numeração de checks é contínua** — sem gaps (ex: R1, R2, R3... R8 sem pular)
- [ ] **Labels de entrada e saída de cada skill estão documentados** no fluxo de labels
- [ ] **Todos os campos do DecisionRecord JSON estão descritos**
- [ ] **O número de evals cobre pelo menos 1 cenário por skill + 1 cenário de escalação**

### Seção 3 — Consistência Interna

- [ ] **Severidades:** os mesmos 3 níveis (blocker/warning/info) são usados em TODAS as tabelas
- [ ] **Modelos e tiers:** o tier e modelo são consistentes entre a tabela do skill e o texto narrativo
- [ ] **confidence_score:** o threshold 0.65 é mencionado consistentemente (não 0.6, não 0.7)
- [ ] **Prefixos de comentário:** `## UX-ANALISE-`, `## UX-PROTO-`, `## UX-COMP-`, `## UX-REVIEW-` referenciados corretamente
- [ ] **Tabela de bloqueio por classe (T0–T3):** valores da tabela não contradizem as severidades dos checks individuais

### Seção 4 — Conformidade com Regras Globais

Compare com `.github/copilot-instructions.md`:

- [ ] **Isolamento de processo:** spec descreve skills como scripts Python independentes
- [ ] **GitHub como bus:** comunicação via comentários/labels
- [ ] **confidence_score < 0.65 escala:** regra explicitada
- [ ] **LLM Provider:** spec referencia o provedor correto (Copilot/OpenAI)
- [ ] **Business Rules (RN-01..RN-07):** se alguma RN é referenciada, está corretamente mapeada

### Seção 5 — Comparação com DOM-02/DOM-05a/DOM-05b

- [ ] **Nível de detalhe compatível:** a DOM-04-UX tem profundidade de especificação similar às specs irmãs
- [ ] **Seções ausentes:** listar seções que existem nas specs irmãs mas faltam na DOM-04-UX
- [ ] **Seções extras justificadas:** seções que existem na DOM-04-UX mas não nas irmãs devem ser justificáveis pelo escopo diferente (UX vs QA vs Requisitos)

---

## Formato de Saída

Produza o relatório de auditoria usando o formato padrão do agente Validador UX (seção "Formato de Relatório de Auditoria" nas instruções do agente), com **escopo = spec**.

Após o relatório, inclua uma seção final:

### Veredicto

- **✅ APROVADA** — spec está pronta para uso, sem falhas
- **⚠️ APROVADA COM RESSALVAS** — spec funcional mas com alertas que deveriam ser corrigidos
- **❌ REPROVADA** — spec tem falhas que devem ser corrigidas antes de usar

Para cada finding ❌ ou ⚠️, inclua sugestão de correção **com referência exata ao trecho da spec** que deve ser alterado.
