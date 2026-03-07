---
doc_id: DIAG-20260306-001
tipo: Diagnóstico Estratégico
titulo: "Maturidade Global de Processos da Fábrica deep-ion"
emitido_em: "2026-03-06"
emitido_por: "Diretor de Processos"
status: EMITIDO
---

# Diagnóstico Estratégico — Maturidade Global de Processos da Fábrica deep-ion

## Contexto Analisado

Foram lidos os seguintes artefatos:

- `architecture/skills/SKILL-pipeline.md`
- `architecture/skills/SKILL-agentes.md`
- `architecture/skills/SKILL-processos.md`
- `architecture/skills/SKILL-responsabilidades.md`
- `architecture/skills/SKILL-regras-negociais.md`
- `architecture/skills/SKILL-convencoes.md`
- `architecture/skills/SKILL-modelo-classificacao.md`
- `architecture/skills/SKILL-scaffold.md`
- `architecture/plans/PLAN-20260302-001_requirements-module-blueprint-conformance.md`
- `architecture/plans/PLAN-20260303-001_tenants-module-design-patterns.md`
- `architecture/plans/PLAN-20260304-001_agents-engine-scaffold/PLAN-20260304-001_agents-engine-scaffold.md`

---

## Estado Atual

A fábrica opera em **nível de maturidade CMMI L2 com aspectos pontuais de L3**. Os processos estão definidos textualmente nas SKILLs, os artefatos são rastreáveis de Issue→BAR→UC→ADR→PR, existe RACI formalizada e há critérios de bloqueio automático. Porém, a implementação real dos agentes está incompleta: apenas DOM-01 está implementado, DOM-02 e DOM-05a estão especificados, e DOM-03/04/05b são planejados. O `agents-engine` (biblioteca compartilhada) está sendo scaffoldado agora.

---

## Frameworks de Referência Aplicados

| Framework | Razão de Aplicação |
|-----------|--------------------|
| **CMMI L1→L5** | Avaliação de maturidade geral do processo |
| **PMBOK** | Análise da completude do ciclo de vida (requisitos → entrega) |
| **ITIL v4** | Gestão de contexto como serviço e valor cocriado pelos agentes |
| **Lean/Six Sigma** | Identificação de desperdício por falta de contexto (retrabalho por alucinação) |
| **BPM/BPMN** | Análise de fluxo de controle, gateways e raias de responsabilidade |

---

## GAPs Identificados

| # | GAP | Domínio | Impacto | Prioridade |
|---|-----|---------|---------|------------|
| G-01 | **Engenharia de contexto sem protocolo formal** — nenhum SKILL define como o contexto é montado, delimitado e injetado nos prompts dos agentes. O token budget, o que é incluído/excluído e a estratégia de chunking são implícitos. Agentes podem operar com contexto incompleto ou irrelevante, gerando alucinações. | Todos os agentes | Alto | **P1** |
| G-02 | **Prompt Management ausente** — os prompts dos agentes (instruções de sistema) não são versionados, revisados ou testados como artefatos de primeiro nível. Não existe um repositório de prompts nem política de alteração. Uma mudança silenciosa de prompt pode alterar o comportamento de toda a fábrica. | Todos os agentes | Alto | **P1** |
| G-03 | **Sem mecanismo de validação de saída de agente (Output Schema Enforcement)** — o contrato de saída das skills é descrito em SKILL-convencoes.md como um dict Python, mas não há um esquema Pydantic obrigatório validado automaticamente antes de a saída ser publicada na Issue ou no Audit Ledger. Saídas malformadas passam silenciosamente. | DOM-01..05b | Alto | **P1** |
| G-04 | **Implementação real dos agentes está muito atrás do pipeline especificado** — DOM-03, DOM-04 e DOM-05b só existem como conceito. Isso cria um risco de "processo Potemkin": toda a governança formal existe no papel mas não é executada na prática. | DOM-03, DOM-04, DOM-05b | Alto | **P1** |
| G-05 | **Sem política de gestão de memória/contexto entre steps do pipeline** — quando DOM-02 executa SKILL-REQ-02, ele "lê o BAR aprovado". Mas: qual versão? Quem garante que o BAR lido é exatamente o aprovado no Checkpoint A? Não existe um contrato de imutabilidade ou hash de conteúdo rastreado. | DOM-02, DOM-05a | Alto | **P2** |
| G-06 | **Confidence score sem calibração definida** — o limiar `0.65` de escalada existe, mas não há processo documentado para calibrar esse score. Após N demandas, como sabemos se o DOM-01 está calculando corretamente? Não existe feedback loop de calibração. | DOM-01 | Médio | **P2** |
| G-07 | **Ausência de contrato de contexto para DOM-03 e DOM-04** — esses agentes receberão ADR + esqueleto + UCs, mas não existe uma especificação de "pacote de contexto" que define quais fragmentos de SKILL, quais regras ativas, qual versão do blueprint e qual trecho de código são injetados. Sem isso, DOM-04 codificará com contexto indeterminado. | DOM-03, DOM-04 | Alto | **P2** |
| G-08 | **Sem processo de teste de regressão de comportamento dos agentes** — não existe uma "test suite de comportamento de agente" (analogia: golden tests). Se o modelo de AI mudar ou o prompt for alterado, não há como detectar regressões comportamentais automaticamente. | Todos os agentes | Médio | **P2** |
| G-09 | **Processo de reclassificação pós-Gate 2 não está implementado operacionalmente** — a regra existe na SKILL, mas não há workflow GitHub Actions mapeado para o comando `/reclassify-Tx` com reabertura automática do fluxo. | Pipeline | Médio | **P3** |
| G-10 | **PROC-004 (DOM-03) sem especificação de como o agente acessa o contexto de blueprints** — a SKILL-scaffold descreve o protocolo para um arquiteto humano, mas não especifica como DOM-03 leria e interpretaria o blueprint YAML de forma estruturada e determinística. | DOM-03 | Médio | **P3** |
| G-11 | **SLA de Gate sem mecanismo de enforcement** — os indicadores definem ≤4h para T0/T1 e ≤8h para T2/T3, mas não existe alerta automático ou escalada quando um gate fica bloqueado além do SLA. | Processo Humano | Baixo | **P3** |
| G-12 | **PLAN-20260302-001 (DOM-02 conformance) está PENDENTE sem aprovador** — um plano crítico para conformidade do único agente já em funcionamento está sem aprovação. | DOM-02 | Alto | **P2** |

---

## Análise Focalizada: Engenharia de Contexto

Este é o GAP mais estrutural da fábrica. Abaixo um diagnóstico detalhado.

### O que falta

#### 1. Context Budget Protocol (G-01)

Não existe documento que defina: qual o limite de tokens por agente, quais fontes de contexto são obrigatórias vs. opcionais, em que ordem são injetadas, e o que acontece quando o contexto excede o budget (truncamento? seleção por relevância semântica?). No modelo atual, um agente como DOM-04 poderia receber o ADR inteiro + todas as UCs + o histórico de comments da Issue + as RNs — e simplesmente "ignorar silenciosamente" trechos por truncamento.

#### 2. Context Assembly Standard (G-07)

Cada agente deveria ter um `ContextPacket` definido e validado antes da execução. Por exemplo:

```
DOM-04 ContextPacket:
  - adr: ADR-{ID} (hash verificado = aprovado no Gate 3)
  - skeleton: path do esqueleto gerado por DOM-03 (hash)
  - test_plan: TestPlan-{ID} (hash verificado = gerado por DOM-05a)
  - rn_snapshot: RN-01..RN-07 na versão vigente na data de Gate 3
  - conventions: SKILL-convencoes.md (snapshot)
  - blueprint_ref: modulith-api-first.yaml v{versao}
```

Sem esse pacote estruturado, DOM-04 "inventa" o que não foi fornecido.

#### 3. Output Grounding (G-03)

Todo output de agente deve ser "ancorado" em artefatos de entrada. Isso significa que o DecisionRecord não deve registrar apenas "o que o agente decidiu", mas também "quais fragmentos de contexto embasaram a decisão". Sem rastreabilidade de contexto→decisão, alucinações são indetectáveis.

#### 4. Context Drift Between Steps (G-05)

Quando DOM-05a gera o TestPlan baseado no BAR v1 e, entre Gate 2 e Gate 3, o BAR é revisado (mesmo que minimamente), DOM-03 e DOM-04 operam com uma versão diferente do que DOM-05a auditou. Não existe um mecanismo de "freeze de contexto" por fase do pipeline.

#### 5. SKILL Loading sem garantia de versão (transversal)

Os agentes VS Code (modos customizados) carregam SKILLs por path. Se uma SKILL for editada durante uma sessão em andamento, o agente Mid-Session passa a operar com o novo contexto sem aviso. Não existe versionamento de SKILL com snapshot por demanda.

---

## Recomendações Estratégicas

**R-01 — Criar `SKILL-context-engineering.md`** *(P1 — endereça G-01, G-07)*
Definir um protocolo formal de engenharia de contexto contendo: `ContextPacket` por agente, regras de budget, política de truncamento, ordem de prioridade das fontes, e critério de "contexto mínimo viável". Sem esse documento, todos os agentes futuros serão implementados de forma ad-hoc.

**R-02 — Criar repositório de prompts versionado** *(P1 — endereça G-02)*
Cada instrução de sistema de agente deve ser um artefato versionado em `architecture/prompts/` com semver. Alterações de prompt devem passar por um gate próprio (pelo menos Tech Lead + review de comportamento). O prompt em produção deve ter seu hash registrado no Audit Ledger de cada execução.

**R-03 — Implementar Output Schema Enforcement** *(P1 — endereça G-03)*
Adicionar ao `agents-engine` um validador Pydantic obrigatório que toda skill deve usar antes de publicar saída. Nenhuma skill pode chamar a GitHub API com saída não validada. Isso é a última linha de defesa antes que alucinações de formato viajem pelo pipeline.

**R-04 — Context Freeze por fase do pipeline** *(P2 — endereça G-05)*
Ao transitar um Gate, criar um snapshot imutável dos artefatos vigentes naquele momento (com hash SHA-256) registrado no DecisionRecord do gate. Os agentes das fases seguintes leem **apenas o snapshot do gate anterior**, não a versão "atual" do artefato. Isso elimina context drift entre fases.

**R-05 — Behavioral Regression Tests para agentes** *(P2 — endereça G-08)*
Criar uma suite de "golden inputs → outputs esperados" para cada agente. A cada mudança de prompt ou de modelo, executar essa suite como gate de CI. Um agente só entra em produção se comportamento compatível com baseline for mantido.

**R-06 — Formalizar DOM-02 Spec e aprovar PLAN-20260302-001** *(P2 — endereça G-04, G-12)*
O único agente funcional da fábrica (DOM-02) tem 27 não-conformidades conhecidas e o plano de correção está pendente. Isso representa um risco de produção imediato. Priorizar aprovação e execução antes de avançar no roadmap de novos agentes.

**R-07 — Implementar SLA Watchdog** *(P3 — endereça G-11)*
Uma GitHub Action agendada (cron) que varre issues com labels `gate/*-aguardando` e, se o SLA foi ultrapassado, comenta automaticamente na issue e notifica o responsável. Baixo esforço, alto valor de governança.

**R-08 — Especificar `SKILL-dom03-spec.md` e `SKILL-dom04-spec.md`** *(P2 — endereça G-07, G-10)*
DOM-03 e DOM-04 não têm especificação análoga ao DOM-02_SPEC existente. Antes de implementá-los, produzir especificações que definam o ContextPacket de entrada, contrato de saída, critérios de bloqueio e regras de detecção de alucinação específicas para cada agente.

---

## Plano de Evolução — Roadmap de Governança e Contexto

```
FASE 1 — Fundação de Contexto (P1, ≤ 2 sprints)
  ├── R-01: SKILL-context-engineering.md
  ├── R-02: architecture/prompts/ + política de versionamento
  └── R-03: Output Schema Enforcement no agents-engine

FASE 2 — Anti-Drift e Calibração (P2, ≤ 3 sprints)
  ├── R-04: Context Freeze por Gate (snapshot + hash no DecisionRecord)
  ├── R-05: Behavioral Regression Test suite (golden tests)
  ├── R-06: Aprovação + execução PLAN-20260302-001
  └── R-08: DOM-03_SPEC + DOM-04_SPEC com ContextPacket formal

FASE 3 — Automação de Governança (P3, ≤ 2 sprints)
  └── R-07: SLA Watchdog (GitHub Action cron)
```

---

## Avaliação de Maturidade por Dimensão

| Dimensão | Nível Atual | Nível Alvo | Gap |
|----------|------------|------------|-----|
| Definição de processo | L3 — Processos definidos e documentados | L4 — Gerenciado quantitativamente | Calibração e métricas |
| Rastreabilidade de artefatos | L3 — Cadeia Issue→PR definida | L3+ — Com hash e freeze por gate | Context drift |
| Engenharia de contexto | **L1 — Informal/ad-hoc** | L3 — Definida e padronizada | **Gap crítico** |
| Gestão de prompts | **L1 — Inexistente** | L3 — Versionada e testada | **Gap crítico** |
| Validação de saída de agente | L2 — Parcialmente documentado | L3 — Enforced automaticamente | Output schema |
| Governança humana (gates) | L3 — Gates definidos e RACI clara | L3 — Mantido | Consolidar |
| Cobertura de implementação | **L1 — 1/6 agentes funcional** | L3 — Pipeline completo | Execução |

---

## Síntese Executiva

A fábrica possui uma **arquitetura de governança sofisticada no papel** — pipeline multi-gate, RACI clara, Audit Ledger, bloqueios automáticos — o que representa um diferencial real. O risco não está na estrutura de controle humano, que é bem desenhada. O risco está na **camada AI em si**, que opera atualmente sem três controles fundamentais:

1. **Contexto indeterminado** — nenhum agente tem seu ContextPacket formal definido
2. **Prompts não versionados** — o "DNA" de comportamento dos agentes não é rastreável
3. **Saídas não validadas por esquema** — alucinações de formato passam pelo pipeline silenciosamente

Esses três gaps são a raiz dos cenários de "caos" mencionados. A boa notícia é que o `agents-engine` está sendo construído agora (PLAN-20260304-001) — esse é o momento ideal para injetar esses controles **como contratos do `agents-engine`**, antes que qualquer novo agente seja implementado.
