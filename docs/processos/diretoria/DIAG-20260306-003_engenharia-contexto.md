---
doc_id: DIAG-20260306-003
tipo: Diagnóstico Estratégico
titulo: "GAP Crítico — Engenharia de Contexto da Fábrica deep-ion"
origem: DIAG-20260306-001 (G-01, G-05, G-07)
emitido_em: "2026-03-06"
emitido_por: "Diretor de Processos"
status: EMITIDO
dependencia: DIAG-20260306-002 deve ser iniciado antes (versionamento de prompts é pré-requisito)
---

# Diagnóstico Estratégico — GAP Crítico: Engenharia de Contexto

## Contexto Analisado

Foram lidos os seguintes artefatos:

- `architecture/skills/SKILL-pipeline.md` — fluxo de gates e responsabilidades
- `architecture/skills/SKILL-agentes.md` — especificação DOM-01..DOM-05b
- `architecture/skills/SKILL-processos.md` — PROC-001..PROC-007
- `architecture/skills/SKILL-responsabilidades.md` — RACI e responsabilidades
- `architecture/skills/SKILL-convencoes.md` — contratos de saída e padrões técnicos
- `architecture/skills/SKILL-scaffold.md` — protocolo de scaffolding
- `.github/agents/` — 6 system prompts (como os agentes são instruídos)
- `agents-engine/src/deep_ion/agents_engine/` — estrutura atual do agents-engine
- `DIAG-20260306-001_maturidade-global-processos.md` — diagnóstico estratégico global
- `DIAG-20260306-002_gestao-prompts.md` — diagnóstico de gestão de prompts

---

## Definição do Problema

**Engenharia de Contexto** é a disciplina que define **o que um agente LLM recebe como entrada** para produzir um artefato: quais documentos, em qual versão, em qual ordem, com qual limite de tokens, e com qual estratégia de priorização quando o conteúdo excede a janela de contexto.

Em fábricas de software autônomas, a qualidade do artefato produzido é diretamente proporcional à qualidade do contexto injetado. Um agente recebendo contexto incorreto, incompleto ou desatualizado produzirá artefatos incorretos — independentemente de quão bom seja o modelo de linguagem ou quão bem escrito seja o system prompt.

---

## Estado Atual

A engenharia de contexto da fábrica deep-ion é **completamente informal e ad-hoc**. Não existe nenhum documento, protocolo, esquema ou mecanismo que defina como o contexto de um agente é montado. O que existe atualmente:

### Mecanismo de Contexto Vigente

Os agentes VS Code (modos customizados) recebem contexto de três formas:
1. **System prompt** (`.github/agents/*.md`) — define comportamento e restrições
2. **Instrução global** (`.github/arquiteto-instructions.md`) — auto-injetada em todos os agentes
3. **Mensagem do usuário** — inclui @-mentions de arquivos, texto livre e resultados de busca

Não existe um `ContextPacket` estruturado. O analista humano decide manualmente quais arquivos mencionar na mensagem. Isso significa que dois analistas diferentes executando o mesmo workflow podem gerar artefatos diferentes porque injetaram contextos diferentes.

### Problema por Agente

| Agente | O que deveria receber | O que recebe atualmente |
|--------|----------------------|-------------------------|
| **DOM-01** (Discovery) | Issue original + RN-01..07 + SKILL-classificacao | Depende do que o usuário mencionar |
| **DOM-02** (Requirements) | BAR aprovado + RN snapshot + SKILL-pipeline | Depende do que o usuário mencionar |
| **DOM-03** (Architecture) | UC aprovadas + ADR parcial + blueprint + RNs | Não implementado ainda |
| **DOM-04** (Dev) | ADR + esqueleto + TestPlan + SKILL-convencoes | Não implementado ainda |
| **DOM-05a** (QA Negocial) | BAR + UC + critérios de aceite | Não implementado ainda |
| **DOM-05b** (QA Técnico) | Código produzido + TestPlan + SKILL-convencoes | Não implementado ainda |

---

## Frameworks de Referência Aplicados

| Framework | Razão de Aplicação |
|-----------|--------------------|
| **RAG (Retrieval-Augmented Generation)** | Padrão de engenharia de contexto mais difundido — separa retrieval de generation |
| **CMMI L3 — Defined Process** | Um processo definido tem entradas especificadas; entradas ad-hoc = processo L1 |
| **PMBOK — Scope Management** | O "escopo" do contexto precisa ser definido, verificado e controlado como qualquer escopo de projeto |
| **Lean — Standardized Work** | A produção consistente de artefatos de qualidade requer padronização das entradas, não apenas das saídas |
| **Six Sigma — Input-Process-Output (IPO)** | Variância na saída frequentemente é explicada por variância não controlada na entrada |

---

## GAPs Identificados

| # | GAP | Categoria | Impacto | Prioridade |
|---|-----|-----------|---------|------------|
| GC-01 | **Ausência de ContextPacket por agente** — não existe especificação formal do conjunto mínimo de artefatos que cada agente deve receber. O analista humano decide empiricamente o que incluir em cada sessão. Resultado: comportamento não-determinístico entre execuções do mesmo workflow. | Especificação | Crítico | **P0** |
| GC-02 | **Sem Budget de Tokens documentado** — nenhuma SKILL nem agent spec define qual é o limite de tokens disponível para o contexto de cada agente, qual porcentagem é reservada para system prompt vs. contexto de entrada vs. saída esperada. Conteúdo é truncado silenciosamente. | Budget | Crítico | **P0** |
| GC-03 | **Context Drift entre fases do pipeline** — quando DOM-05a gera um TestPlan baseado no BAR v1 e esse BAR é revisado entre Gate 2 e Gate 3, DOM-03/DOM-04 operam sobre uma versão diferente da que DOM-05a auditou. Não existe mecanismo de "freeze de contexto" por gate. | Integridade | Crítico | **P1** |
| GC-04 | **SKILL files podem mudar mid-session** — as SKILLs são carregadas por path relativo no system prompt. Se um arquivo SKILL for editado durante uma sessão em andamento, o agente passa a operar com o novo contexto sem nenhum aviso ou detecção. | Integridade | Alto | **P1** |
| GC-05 | **Sem estratégia de priorização de contexto** — quando o contexto disponível excede o budget (ex: BAR extenso + múltiplas UCs + 7 RNs + SKILL-convencoes + blueprint), qual conteúdo é incluído e qual é descartado? Não existe política de prioridade (ex: RNs > blueprint > histórico de issue). | Budget | Alto | **P1** |
| GC-06 | **Sem verificação de integridade de artefatos injetados** — quando DOM-04 "lê o ADR aprovado", não existe verificação de que a versão lida é exatamente a aprovada no Gate 3 (com hash SHA-256 correspondente ao DecisionRecord). Um ADR editado após a aprovação pode ser injetado sem detecção. | Integridade | Alto | **P1** |
| GC-07 | **Contexto de RNs sem snapshot por demanda** — as Regras de Negócio (RN-01..RN-07) são globais e mutáveis. Uma demanda iniciada com RN-03 v1.0 pode ser concluída com RN-03 v1.1 se as RNs forem atualizadas entre gates. Não existe snapshot de RNs por demanda. | Integridade | Alto | **P2** |
| GC-08 | **DOM-01 injeta resultado de busca semântica sem critério documentado** — o Discovery Agent realiza buscas para classificar a demanda, mas os critérios de quais resultados de busca são injetados no contexto de decisão são implícitos. Decisões T0→T3 com contexto de busca diferente produzem scores diferentes para a mesma demanda. | Consistência | Médio | **P2** |
| GC-09 | **agents-engine nascendo sem um Context Assembly Layer** — o scaffold do `agents-engine` está sendo construído agora (PLAN-20260304-001), mas não existe uma especificação de uma camada de "montagem de contexto" que os agentes Python usarão. Cada agente implementará sua própria escolha ad-hoc sobre o que injetar no prompt. | Arquitetura | Alto | **P1** |
| GC-10 | **Sem validação de completude do contexto antes da execução** — não existe nenhum mecanismo que verifique se o ContextPacket mínimo foi satisfeito antes de um agente iniciar a geração. Um agente pode executar com contexto vazio ou incompleto sem nenhum erro. | Validação | Alto | **P1** |

---

## Análise Técnica Aprofundada

### O Problema do Token Budget

A janela de contexto de Claude Sonnet 4.6 é de 200.000 tokens. Parece muito, mas em um pipeline multi-agente especializado:

| Componente | Tokens Estimados |
|------------|-----------------|
| System prompt de agente médio | ~3.000–5.000 |
| Instrução global (`arquiteto-instructions.md`) | ~1.500 |
| Instructions scoped (eventuais) | ~1.000 |
| 1 SKILL completo (ex: SKILL-pipeline.md) | ~4.000–8.000 |
| Todas as 7 SKILLs | ~35.000–56.000 |
| BAR detalhado | ~3.000–5.000 |
| 5 UCs completas | ~10.000–15.000 |
| 7 RNs completas | ~5.000–8.000 |
| ADR de um módulo complexo | ~5.000–10.000 |
| Histórico de comments de Issue | ~2.000–10.000 |
| Blueprint YAML | ~3.000–5.000 |
| **Total hipotético (DOM-04)** | **~70.000–120.000 tokens** |

Isso ainda está dentro da janela de 200K, mas: (a) 120K tokens têm custo de inferência significativo, (b) estudos de LLMs mostram degradação de qualidade com contexto muito extenso ("lost in the middle"), e (c) sem controle, um agente pode facilmente ultrapassar 200K ao incluir arquivos de código ou logs.

**Sem budget management, o custo pode escalar de forma não linear e o comportamento pode degradar silenciosamente.**

### O Problema do Context Drift — Exemplo Concreto

```
Sprint 1, Dia 1: DOM-05a gera TestPlan baseado em BAR v1.0 (Gate 2 aprovado)
Sprint 1, Dia 3: Stakeholder pede pequena correção no BAR → salvo como v1.1 
Sprint 1, Dia 4: DOM-03 gera esqueleto baseado em BAR v1.1 (sem saber que TestPlan usa v1.0)
Sprint 1, Dia 5: DOM-04 implementa baseado em ADR que cita BAR v1.1
Sprint 1, Dia 6: DOM-05a audita conformidade: TestPlan diz "Deve aceitar X" (v1.0),
                 código implementa "Deve aceitar X e Y" (v1.1) → FALSO NEGATIVO
```

Sem Context Freeze por Gate, **a rastreabilidade entre artefatos de fases diferentes é uma ilusão**.

### O Context Assembly Layer

O `agents-engine` precisa de um componente arquitetural dedicado à montagem de contexto. Esboço conceitual:

```python
# Ausente no agents-engine atual
class ContextAssembler:
    def assemble(
        self,
        agent_id: str,          # DOM-01, DOM-02, etc.
        demand_id: str,          # Issue ID
        gate_snapshot: GateSnapshot  # artefatos frozen no gate anterior
    ) -> ContextPacket:
        """
        1. Recupera o GateSnapshot aprovado (hash verificado)
        2. Monta o ContextPacket segundo a spec do agente
        3. Calcula o budget disponível
        4. Prioriza fontes conforme política de prioridade
        5. Trunca ou resume se necessário, segundo política documentada
        6. Valida completude (ContextPacket mínimo satisfeito?)
        7. Registra sha256 de cada fonte no RecordContext
        """
```

Sem esse componente, cada agente implementará sua própria lógica ad-hoc de montagem de contexto — ou delegará ao analista humano integralmente.

---

## Recomendações Estratégicas

> ⚠️ **Pré-requisito:** As recomendações abaixo pressupõem que DIAG-20260306-002 (Gestão de Prompts) foi iniciado, pois um ContextPacket só pode ser especificado com precisão se os prompts que ele alimenta possuem versões definidas.

**R-01 — Criar `SKILL-context-engineering.md`** *(P0 — endereça GC-01, GC-02, GC-05)*
Documento central que define:
- **Taxonomia de fontes de contexto**: `mandatory`, `conditional`, `forbidden`
- **ContextPacket por agente**: tabela especificando exatamente quais fontes cada DOM-xx deve receber
- **Budget policy**: percentual máximo de tokens por categoria (system / contexto / output)
- **Prioridade de fontes**: em caso de conflito de budget, qual fonte é truncada/sumarizada primeiro
- **Política de truncamento**: `semantic-summary` vs. `hard-truncate` vs. `error`

**R-02 — Implementar GateSnapshot no pipeline** *(P1 — endereça GC-03, GC-06)*
Ao fechar um gate, criar um `GateSnapshot`:
```yaml
gate: A  # Checkpoint A (após BAR aprovado)
demand_id: "#123"
timestamp: "2026-03-06T14:30:00Z"
artefatos:
  bar:
    path: "docs/business/contextos/feature-123/BAR-123.md"
    sha256: "abc123..."
    version: "1.0"
  rn_snapshot:
    path: "architecture/skills/SKILL-regras-negociais.md"
    sha256: "def456..."
```
Os agentes das fases seguintes **leem apenas os artefatos referenciados no GateSnapshot anterior**, não a versão atual do arquivo.

**R-03 — Definir ContextPacket formal para DOM-01 e DOM-02** *(P1 — endereça GC-01)*
Esses são os dois agentes mais próximos de ter implementação real. Antes de qualquer outro agente ser implementado, especificar seu ContextPacket completo como parte da SKILL-context-engineering:

```
DOM-01 ContextPacket (mínimo viável):
  MANDATORY:
    - issue_body (texto da demanda do usuário)
    - rn_snapshot (SKILL-regras-negociais.md na versão corrente)
    - skill_classificacao (SKILL-modelo-classificacao.md)
  CONDITIONAL:
    - issue_comments (se houver discussão relevante)
    - linked_issues (se houver dependências declaradas)
  FORBIDDEN:
    - código-fonte (irrelevante para classificação)
    - ADRs anteriores (risco de contaminação de contexto)
```

**R-04 — Implementar Context Assembly Layer no agents-engine** *(P1 — endereça GC-09, GC-10)*
Criar o componente `ContextAssembler` no `agents-engine` como uma responsabilidade de primeira classe, não como lógica ad-hoc dentro de cada agente. Este componente deve: montar, validar completude, calcular hash, registrar no Audit Ledger e aplicar budget policy.

**R-05 — SKILL snapshot por demanda** *(P2 — endereça GC-04, GC-07)*
No início do processamento de cada demanda (Gate 0 — recebimento da Issue), tirar um snapshot SHA-256 de todas as SKILLs relevantes para aquela demanda. Esse snapshot é o que todos os agentes do pipeline daquela demanda usarão — qualquer atualização de SKILL não afeta demandas em andamento.

**R-06 — Documentar política de context injection para VS Code agents** *(P2 — endereça GC-01, GC-04)*
Enquanto os agentes VS Code (modos customizados) não têm um `ContextAssembler` programático, documentar em cada agent spec quais arquivos o analista humano DEVE incluir como @-mentions para cada workflow. Exemplo no frontmatter do agent:

```yaml
required_context:
  - "@architecture/skills/SKILL-pipeline.md"
  - "@architecture/skills/SKILL-regras-negociais.md"
```

Isso não resolve o problema estruturalmente, mas reduz a variância de contexto até que a solução programática esteja disponível.

---

## Plano de Evolução — Engenharia de Contexto

```
PRÉ-REQUISITO → Iniciar DIAG-20260306-002 (Gestão de Prompts)
  └── Ao menos: definir versões dos prompts de DOM-01 e DOM-02

FASE 1 — Especificação (≤ 1 sprint)
  ├── R-01: SKILL-context-engineering.md (taxonomia + budget policy + ContextPackets DOM-01/02)
  └── R-06: required_context nos frontmatter dos agents VS Code (mitigação imediata)

FASE 2 — Freeze de Contexto por Gate (≤ 2 sprints)
  ├── R-02: GateSnapshot implementado (estrutura YAML + hash calculation)
  ├── R-05: SKILL snapshot por demanda no Gate 0
  └── R-03: ContextPackets formais para DOM-03, DOM-04, DOM-05a/b

FASE 3 — Context Assembly Layer (≤ 2 sprints)
  └── R-04: ContextAssembler no agents-engine com validação, hash e Audit Ledger
```

---

## Relação com outros GAPs

| GAP Relacionado | Como se Conecta |
|-----------------|-----------------|
| **G-02 (Gestão de Prompts)** | **Pré-requisito direto.** Um ContextPacket que inclui um prompt deve referenciar uma versão específica desse prompt. Sem versionamento de prompts, o ContextPacket é incompleto. |
| **G-03 (Output Schema)** | **Downstream.** Um ContextPacket bem definido reduz alucinações de conteúdo; o Output Schema valida que o formato da saída é correto. Ambos são necessários para saídas confiáveis. |
| **G-06 (Confidence Calibration)** | **Relacionado.** O confidence score do DOM-01 depende da completude do contexto injetado. Um ContextPacket incompleto gera scores inconsistentes — o problema de calibração pode ser parcialmente um problema de contexto. |
| **G-08 (Behavioral Tests)** | **Interdependente.** Um golden test de comportamento só é reprodutível se o contexto de entrada é idêntico entre execuções. Sem ContextPacket versionado, golden tests não são reprodutíveis. |

---

## Maturidade Atual vs. Alvo

| Dimensão | Nível Atual | Evidência | Nível Alvo | Delta |
|----------|------------|-----------|------------|-------|
| Definição de ContextPacket | **L1 — Inexistente** | Nenhum agente tem ContextPacket especificado | L3 — Definido por agente | Crítico |
| Budget de tokens | **L1 — Inexistente** | Nenhuma política documentada | L3 — Budget policy definida | Crítico |
| Context Freeze por gate | **L1 — Inexistente** | Artefatos mutáveis durante o pipeline | L3 — GateSnapshot com hash | Alto |
| SKILL versioning por demanda | **L1 — Inexistente** | SKILLs mutáveis mid-session | L3 — Snapshot por demanda | Alto |
| Context Assembly Layer | **L1 — Inexistente** | agents-engine sem componente dedicado | L3 — ContextAssembler definido | Alto |
| Validação de completude | **L1 — Inexistente** | Nenhuma validação de contexto mínimo | L3 — Validação antes da execução | Alto |

---

## Síntese Executiva

A Engenharia de Contexto é a disciplina que determina **se os agentes da fábrica trabalham com informação correta ou com informação imaginada**. Atualmente, a fábrica não possui nenhum mecanismo formal nessa dimensão.

O risco não é teórico: DOM-01 já está em operação classificando demandas com contexto determinado pelo analista humano em cada sessão — o que significa que a mesma demanda pode ser classificada T1 ou T2 dependendo de qual analista abriu a sessão e quais arquivos incluiu na mensagem. Isso não é determinismo, é variância oculta.

Antes de implementar DOM-03, DOM-04 e DOM-05b, a fábrica precisa responder uma pergunta fundamental: *"O que exatamente esse agente lê antes de produzir um artefato?"* Sem uma resposta formal e versionada a essa pergunta, cada agente implementado será uma caixa-preta com entradas indefinidas — e quaisquer problemas de qualidade nos artefatos serão praticamente indiagnosticáveis.
