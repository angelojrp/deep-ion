# DOM-02 — Requirements Agent

**Posição:** DOM-01 → **DOM-02** → DOM-03  
**Disparo:** Gate 1 aprovado (`/gate1-approve`)  
**Entrega:** BusinessAnalysisRecord + Use Cases canônicos + Matriz de Rastreabilidade

---

## Princípios de Isolamento

1. **Processo independente:** cada skill é um script Python invocado como processo separado pela GitHub Action. Não existe instância compartilhada, estado em memória ou chamada direta entre skills.
2. **Orquestração por evento:** a sequência REQ-00 → REQ-01 → REQ-02 é governada por labels e comentários GitHub, não por código Python. O script não conhece o pipeline — conhece apenas seu input e seu output.
3. **Canal único:** skills se comunicam exclusivamente via comentários estruturados na Issue. O artefato publicado por uma skill é lido da Issue pela skill seguinte via GitHub API.

---

## Skills

### SKILL-REQ-00 — Duplicate & Conflict Detector

| | |
|---|---|
| **Trigger** | Imediatamente após Gate 1 aprovado |
| **Input** | DecisionRecord + repositório de UCs existentes + catálogo RN-01..RN-07 |
| **Output** | DuplicateReport (comentário Markdown na Issue) |
| **Tempo máximo** | 60s |

**Verificações:**

| # | Verificação | Bloqueante? |
|---|---|---|
| V1 | Duplicata de UC — similaridade semântica > 80% | Sim, se crítico |
| V2 | Conflito com RN — comportamento proibido sem override T2/T3 | Sim, sempre |
| V3 | Issue em paralelo no mesmo módulo (últimos 30 dias) | Não (alerta) |
| V4 | Dependência de UC não implementado | Não (alerta) |
| V5 | Classificação DOM-01 difere do impacto real em >= 1 nível | Não (sugere /reclassify) |

**Bloqueio automático apenas se:** mesma RN + mesmo módulo + mesmo fluxo principal (duplicata crítica).

---

### SKILL-REQ-01 — Business Analyst Agent

| | |
|---|---|
| **Trigger** | SKILL-REQ-00 concluído sem bloqueio |
| **Input** | DecisionRecord + DuplicateReport + Issue original + catálogo RN-01..RN-07 |
| **Output** | BusinessAnalysisRecord (BAR) — comentário na Issue |
| **Checkpoint** | Checkpoint A — `/ba-approve` \| `/ba-reject <motivo>` \| `/ba-revise <campo>=<valor>` |
| **Autonomia** | Nenhuma. Toda saída aguarda Checkpoint A antes de REQ-02 ser disparada |
| **Confiança mínima** | `confidence_score < 0.65` em qualquer dimensão → escala com dúvida explicitada |

**Análises obrigatórias em ordem:**

| # | Análise | Bloqueante? |
|---|---|---|
| A1 | Síntese da Necessidade — o que, por que, qual dor | Não |
| A2 | Delimitação de Escopo — dentro/fora/ambiguidades | Sim, se ambíguo |
| A3 | Mapeamento de RNs — cruzar cada ação do fluxo contra RN-01..RN-07 | Sim, se violação |
| A4 | Módulos Spring Modulith afetados — tipo de impacto + justificativa | Não |
| A5 | UCs identificados — provisórios com prioridade Must/Should/Could | Não |
| A6 | Pontos de Atenção — zonas cinzas do DOM-01 + novos riscos | Não |
| A7 | Recomendação — avançar \| revisar \| escalar. `confidence < 0.65` força escalar | Depende |

**Formato do BAR:**
```
## BAR-{ID}: Análise Negocial
**Issue:** #{N} | **Classificação:** T{N} (score: {X.X}) | **Data:** {ISO-8601}
**Confiança:** {alta|média|baixa} | **Agente:** SKILL-REQ-01 v{X.X}

### Síntese da Necessidade
### Escopo Delimitado
  - Dentro do escopo:
  - Fora do escopo (explícito):
  - Ambiguidades não resolvidas:        ← nunca omitir, nunca resolver com suposição
### Regras de Negócio Acionadas
  | RN | Impacto | Conflito? | Observação |
### Módulos Afetados
  | Módulo | Tipo de Impacto | Justificativa |
### Use Cases Identificados
  | UC | Nome Provisório | Prioridade | Dependência |
### Pontos de Atenção
### Recomendação do Agente
  {avançar|revisar|escalar} — {justificativa}
```

> **Regra crítica:** `Ambiguidades não resolvidas` nunca pode ser omitido ou substituído por suposição do LLM. Ambiguidades críticas (fluxo principal ou RN) bloqueiam o Checkpoint A automaticamente.

---

### SKILL-REQ-02 — Use Case Modeler Agent

| | |
|---|---|
| **Trigger** | Checkpoint A aprovado (`/ba-approve`) |
| **Input** | BAR aprovado **apenas** — o agente não lê a issue original |
| **Output** | 1..N Use Cases canônicos + Matriz de Rastreabilidade + RNFs com métricas |
| **Gate** | Gate 2 formal — PO + Tech Lead — `/gate2-approve` \| `/gate2-reject <motivo>` |

**Formato do Use Case canônico (schema fixo — nenhuma seção pode ser omitida sem N/A justificado):**
```
## UC-{ID}: {Nome}
**Módulo:** `{modulo}` | **Classificação:** T{N} | **Versão:** 1.0
**RNs Acionadas:** RN-{XX}, RN-{YY}
**Ator Principal:** {ator} | **Atores Secundários:** {lista ou N/A}

### Pré-condições
### Pós-condições de Sucesso
### Pós-condições de Falha
### Fluxo Principal
  | Passo | Ator | Ação | Resposta do Sistema |
### Fluxos Alternativos
  FA-{N}: {Nome} — Bifurca no Passo N
### Fluxos de Exceção
  FE-{N}: {Nome} — Bifurca no Passo N
  Gatilho: {condição}
  RN Violada: RN-{XX}
  Resposta do Sistema: {comportamento}
### Invariantes
### Critérios de Aceitação — Gherkin
  Scenario: Caminho feliz
  Scenario: FE-{N}         ← obrigatório para cada FE
### RNFs Aplicáveis
  | Atributo | Métrica | Fonte |
```

**Geração determinística de FEs por RN — não depende de inferência do LLM:**

| RN | FE gerado |
|---|---|
| RN-01 | FE: Saldo Insuficiente |
| RN-02 | FE: Falha na atomicidade da transferência |
| RN-03 | FE: Tentativa de exclusão de transação confirmada |
| RN-04 | FE: Período inválido para cálculo de orçamento |
| RN-05 | Sem FE — dispara evento `MetaAtingidaEvent` automaticamente |
| RN-06 | FE: Tentativa de exclusão de categoria padrão |
| RN-07 | FE: Transação não confirmada excluída do relatório |

---

## Matriz de Rastreabilidade

Artefato final do DOM-02. Consumido pelo DOM-03 e DOM-05. Uma linha por combinação Issue × RN × UC × Cenário.

| Issue | RN Acionada | UC | Módulo | Cenário Gherkin | Teste Esperado |
|---|---|---|---|---|---|
| #NNN | RN-01 | UC-N | `conta` | FE-01: Saldo insuficiente | `ContaServiceTest#deveRejeitarDebitoSemSaldo` |
| #NNN | RN-02 | UC-N | `transacao` | FE-02: Rollback atômico | `TransacaoServiceTest#deveExecutarTransferenciaAtomicamente` |
| #NNN | RN-03 | UC-N | `transacao` | FE-03: Exclusão bloqueada | `TransacaoServiceTest#deveBloquearExclusaoDeTransacaoConfirmada` |

---

## Condições de Bloqueio Automático

| # | Condição | Skill | Ação |
|---|---|---|---|
| B1 | Violação de RN sem escalonamento T2/T3 declarado | REQ-00 (V2) ou REQ-01 (A3) | BLOQUEIO + label `blocked/rn-violation` |
| B2 | Duplicata crítica: mesma RN + módulo + fluxo | REQ-00 (V1) | BLOQUEIO + referência à issue original |
| B3 | `confidence_score < 0.65` em dimensão crítica | REQ-01 (A7) | Escala com dúvida explicitada |
| B4 | Ambiguidade não resolvida em fluxo principal ou RN | REQ-01 (A2) | Checkpoint A bloqueado |
| B5 | Dado pessoal (LGPD) sem aprovação humana declarada | REQ-01 + REQ-02 | Escala obrigatória — never autonomous |

---

## Checkpoint A vs Gate 2

| | Checkpoint A | Gate 2 |
|---|---|---|
| **Objetivo** | Validar direção negocial | Validar completude e viabilidade técnica |
| **Quem aprova** | Analista / PO (sozinho) | PO + Tech Lead (os dois) |
| **Latência** | Horas (assíncrono, leve) | 1-2 dias úteis |
| **Comandos** | `/ba-approve` \| `/ba-reject` \| `/ba-revise` | `/gate2-approve` \| `/gate2-reject` |
| **Pergunta** | "É isso que queremos resolver?" | "Podemos passar para arquitetura?" |
| **approval_weight** | 0.4 | 1.0 |

> Dois Checkpoints A aprovados **não** equivalem a um Gate 2. O Gate 2 é o único que habilita o DOM-03.

---

## Fluxo de Labels (State Machine da Issue)

```
gate/1-aprovado
  → req/duplicatas-verificadas       (REQ-00 concluído)
    → req/bar-aguardando             (BAR publicado)
      → req/bar-aprovado             (Checkpoint A ok)
        → gate/2-aguardando          (UCs publicados)
          → gate/2-aprovado          (DOM-03 inicia)
    → blocked/rn-violation           (requer intervenção humana)
```

---

## Estrutura de Arquivos

```
.github/
├── requirements/
│   ├── skill_req_00.py              # Duplicate & Conflict Detector
│   ├── skill_req_01.py              # Business Analyst Agent
│   ├── skill_req_02.py              # Use Case Modeler Agent
│   ├── rn_catalog.py                # Catálogo RN-01..RN-07 + FEs determinísticos
│   ├── uc_repository.py             # Leitura de UCs existentes (para V1)
│   └── prompts/
│       ├── bar_generation.md        # Prompt estruturado para REQ-01
│       └── uc_generation.md         # Prompt estruturado para REQ-02
└── workflows/
    ├── requirements-trigger.yml     # Dispara REQ-00 após /gate1-approve
    └── checkpoint-automation.yml    # Processa /ba-approve, /ba-reject, /ba-revise
```

Cada skill é invocada como processo isolado:
```bash
python .github/requirements/skill_req_00.py --issue 42
python .github/requirements/skill_req_01.py --issue 42
python .github/requirements/skill_req_02.py --issue 42
```

---

## Audit Ledger — DecisionRecord

Toda decisão do DOM-02 gera um registro append-only. Cobertura de 100%.

```json
{
  "record_id": "DR-REQ-{UUID}",
  "agent": "DOM-02",
  "skill": "SKILL-REQ-00 | SKILL-REQ-01 | SKILL-REQ-02",
  "issue_id": "{numero}",
  "timestamp": "{ISO-8601}",
  "decision_type": "block | checkpoint | gate | alert | approve",
  "decision": "avançar | bloquear | escalar | alertar",
  "confidence_score": 0.82,
  "rn_triggered": ["RN-01", "RN-03"],
  "modules_affected": ["conta", "transacao"],
  "approval_weight": 0.4,
  "human_reviewer": "{username ou null}",
  "human_decision": "approve | reject | revise | null",
  "justification": "{obrigatório para block e escalar}",
  "artifacts_produced": ["BAR-{ID}", "UC-{ID}"],
  "lgpd_scope": false
}
```

---

## Evals — Casos de Teste

| # | Issue | Classe | Comportamento esperado | RN | UCs |
|---|---|---|---|---|---|
| 1 | Alterar texto do botão "Salvar" | T0 | REQ-00: LIMPO. REQ-01: 1 UC trivial, BAR auto-aprovável | Nenhuma | 1 (UI) |
| 2 | Campo CNPJ com caracteres inválidos | T1 | REQ-00: alerta V3. REQ-01: RN-06 potencial | RN-06 potencial | 1-2 |
| 3 | Limite de crédito emergencial por conta | T2 | REQ-00: alerta V2. REQ-01: BLOQUEIO se RN-01 sem override. FE determinístico gerado | RN-01 (crítica) | 2-3 + FEs |
| 4 | Reativação de fornecedor inativo | T2/T3 | REQ-00: alerta V5. REQ-01: máquina de estados. Ambiguidade esperada em "inativo" | RN-03 potencial | 3-4 |

---

## Métricas de Qualidade

| Métrica | Meta | Mínimo | Medição |
|---|---|---|---|
| RNs corretamente mapeadas | 100% | 100% (zero-fault) | Revisão humana nos evals |
| FEs determinísticos por RN acionada | 100% | 100% (zero-fault) | Script de validação automático |
| Ambiguidades críticas não listadas | 0% | 0% (zero-fault) | Auditoria pós-Gate 2 |
| Tempo SKILL-REQ-00 | < 30s | < 60s | Audit Ledger |
| Tempo SKILL-REQ-01 | < 90s | < 180s | Audit Ledger |
| Tempo SKILL-REQ-02 | < 120s/UC | < 240s/UC | Audit Ledger |
| Rejeições no Checkpoint A | < 20% | < 40% | GitHub Actions log |
| Rejeições no Gate 2 | < 15% | < 30% | GitHub Actions log |
