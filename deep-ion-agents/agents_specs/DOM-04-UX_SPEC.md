# DOM-04-UX — Frontend UX Specialist Agent

**Posição:** Sub-pipeline dentro do DOM-04, **sob demanda** (não sequencial na pipeline principal)  
**Disparo:** Labels `ux/analise-solicitada`, `ux/prototipo-solicitado`, `ux/componente-solicitado`, `ux/review-solicitado`  
**Entrega:** Análise heurística UX, protótipos HTML, componentes React reutilizáveis, revisão de conformidade UX em PRs

---

## Princípios

1. **Consultor, não implementador:** o agente UX **não gera features completas** — analisa, propõe melhorias e cria componentes-base/padrões que facilitam a equipe de development frontend.
2. **Sob demanda:** acionado por labels, não bloqueia a pipeline principal. Qualquer membro da equipe pode solicitar análise UX a qualquer momento.
3. **Processo isolado:** cada skill é um script Python separado, comunicação exclusiva via GitHub API (comentários + labels). Reutiliza a infraestrutura existente do DOM-04 (GitHubClient, BlueprintReader, ProviderFactory).
4. **Heurísticas determinísticas + LLM:** checks de WCAG e consistência visual são determinísticos. Análise de heurísticas de Nielsen e sugestões de UX usam LLM com `confidence_score` rastreado.
5. **`confidence_score < 0.65` sempre escala** — nunca infere silenciosamente.
6. **Design system first:** todas as saídas respeitam os design tokens e componentes do blueprint `frontend-react-spa.yaml`.

---

## Posicionamento no Pipeline

```
[Qualquer momento — sob demanda]
  → label: ux/*-solicitada aplicado na Issue/PR
    → Skill UX correspondente dispara
      → Publica relatório/protótipo/componente como comentário
        → Transição de label: ux/*-concluido | ux/*-bloqueado | ux/*-escalado
```

> O agente UX **não é um gate** — seus outputs são informativos/consultivos. A decisão final é sempre da equipe humana.

---

## Skills

### SKILL-UX-00 — UX Analysis (Análise Heurística)

| | |
|---|---|
| **Trigger** | Label `ux/analise-solicitada` |
| **Input** | Issue body + comentários existentes (ADR-FE, UC, descrição) |
| **Output** | Relatório `## UX-ANALISE-{issue_id}` com violações heurísticas, WCAG, consistência |
| **Tempo máximo** | 90s |
| **Modelo** | Claude Opus 4.6 (tier SENIOR) |
| **Confiança mínima** | `confidence_score < 0.65` → escalar com label `ux/analise-escalada` |

**Verificações obrigatórias:**

| # | Verificação | Tipo | Critério de falha |
|---|---|---|---|
| H1 | Visibilidade do status do sistema | Nielsen #1 | Feedback ausente para ações do usuário |
| H2 | Correspondência sistema-mundo real | Nielsen #2 | Terminologia técnica exposta ao usuário |
| H3 | Controle e liberdade do usuário | Nielsen #3 | Ausência de undo/cancel em operações destrutivas |
| H4 | Consistência e padrões | Nielsen #4 | Componentes similares com comportamentos divergentes |
| H5 | Prevenção de erros | Nielsen #5 | Ausência de validação inline / confirmação em operações críticas |
| H6 | Reconhecimento vs. memória | Nielsen #6 | Informações contextuais ausentes, dependência de memorização |
| H7 | Flexibilidade e eficiência | Nielsen #7 | Ausência de atalhos ou fluxos alternativos |
| H8 | Design estético e minimalista | Nielsen #8 | Excesso de informação, ruído visual |
| H9 | Ajuda ao reconhecimento de erros | Nielsen #9 | Mensagens de erro genéricas ou ausentes |
| H10 | Ajuda e documentação | Nielsen #10 | Fluxos complexos sem guia contextual |
| W1 | Alt text em imagens/ícones | WCAG 1.1.1 | Imagem sem `alt` ou `aria-label` |
| W2 | Hierarquia de headings | WCAG 1.3.1 | Heading levels pulados (h1 → h3) |
| W3 | Contraste de cores | WCAG 1.4.3 | Ratio < 4.5:1 texto normal, < 3:1 texto grande |
| W4 | Navegação por teclado | WCAG 2.1.1 | Elemento interativo sem foco via Tab |
| W5 | Labels em inputs | WCAG 1.3.1 | Input sem `label` ou `aria-label` associado |
| W6 | Indicadores de foco | WCAG 2.4.7 | Foco não visível em elementos interativos |
| CS1 | Uso de design tokens | Consistência | Cor/espaçamento hardcoded vs. variável CSS |
| CS2 | Padrões shadcn/ui | Consistência | Componente customizado onde shadcn/ui equivalente existe |
| CS3 | i18n compliance | Consistência | Texto hardcoded no JSX |

---

### SKILL-UX-01 — Prototype Generator (Geração de Protótipos)

| | |
|---|---|
| **Trigger** | Label `ux/prototipo-solicitado` |
| **Input** | Issue body + `## UX-ANALISE-{id}` (se existir) + template HTML base |
| **Output** | Comentário `## UX-PROTO-{issue_id}` com protótipos HTML low-fidelity |
| **Tempo máximo** | 120s |
| **Modelo** | Claude Opus 4.6 (tier SENIOR) |

**Regras:**

1. Usar design tokens CSS do template `prototipo-screen-template.html`
2. Gerar um protótipo HTML por tela/estado identificado
3. Estados obrigatórios por tela: loading, empty, data, error
4. Mobile-first (430px base) com indicações de responsividade
5. Cada protótipo HTML deve ser self-contained (inline CSS com design tokens)
6. Navegação entre telas indicada via links/botões com `data-flow` attribute

---

### SKILL-UX-02 — Component & Pattern Generator (Componentes e Padrões)

| | |
|---|---|
| **Trigger** | Label `ux/componente-solicitado` |
| **Input** | Issue body + `## UX-ANALISE-` + `## UX-PROTO-` (se existirem) + blueprint |
| **Output** | Comentário `## UX-COMP-{issue_id}` com componentes React + documentação de padrões |
| **Tempo máximo** | 120s |
| **Modelo** | Claude Opus 4.6 (tier SENIOR) |

**Regras para componentes gerados:**

1. **shadcn/ui + Tailwind CSS v4** — usar `cn()` helper para merge de classes
2. **TypeScript strict** — interface de props explícita, sem `any`
3. **i18n obrigatório** — `useTranslation()` para todo texto visível
4. **WCAG 2.1 AA** — `aria-label`, `role`, foco gerenciado
5. **Apenas `presentation/components/`** — componentes gerados pertencem à camada de apresentação
6. **Sem lógica de negócio** — componentes são puramente visuais/interativos
7. **Documentação inline** — cada componente acompanhado de: props interface, exemplo de uso, design rationale
8. **Output via `OutputPolicy.strip_prose()`** — código em fenced blocks, zero prose

---

### SKILL-UX-03 — PR UX Review (Revisão de UX em PRs)

| | |
|---|---|
| **Trigger** | Label `ux/review-solicitado` em PR |
| **Input** | Diff do PR (arquivos `.tsx`, `.ts`, `.css`, `.html`) |
| **Output** | Comentário `## UX-REVIEW-{pr_id}` com findings tabelados |
| **Tempo máximo** | 90s |
| **Modelo** | Claude Opus 4.6 (tier SENIOR) |

**Checks no diff:**

| # | Check | Severidade | Critério |
|---|---|---|---|
| R1 | WCAG violations | blocker | Elemento interativo sem aria-label/alt |
| R2 | Hardcoded colors/spacing | warning | Valor CSS literal onde token existe |
| R3 | Missing i18n | blocker | String literal em JSX (exceto pontuação) |
| R4 | Inconsistência com shadcn/ui | warning | Componente manual onde shadcn/ui cobre o caso |
| R5 | Responsividade ausente | warning | Ausência de breakpoints em componentes de layout |
| R6 | Estado de loading ausente | warning | Fetch sem indicação de loading state |
| R7 | Estado de erro ausente | warning | Fetch sem tratamento de erro visível |
| R8 | Foco em modais | blocker | Modal sem focus trap |

**Decisão:**
- 1+ blockers → label `ux/review-bloqueado`
- Somente warnings → label `ux/review-aprovado-com-alertas`
- Sem findings → label `ux/review-aprovado`

---

## Regras de Bloqueio por Classe

| Falha detectada | T0 | T1 | T2 | T3 |
|---|---|---|---|---|
| WCAG violation (W1–W6, R1, R8) | Alerta | Alerta | Alerta | Alerta |
| Missing i18n (CS3, R3) | Alerta | Alerta | Alerta | Alerta |
| Design token inconsistency (CS1, R2) | Info | Info | Alerta | Alerta |
| Nielsen heuristic violation (H1–H10) | Info | Alerta | Alerta | Alerta |

> **O agente UX é consultivo** — seus bloqueios são em nível de **recomendação**. A decisão final é da equipe humana. Exceção: SKILL-UX-03 (PR Review) marca labels `ux/review-bloqueado` que a equipe pode optar por exigir antes do merge.

---

## Fluxo de Labels

```
[SKILL-UX-00]
ux/analise-solicitada
  → ux/analise-em-andamento
    → ux/analise-concluida
    → ux/analise-escalada        (confidence < 0.65)

[SKILL-UX-01]
ux/prototipo-solicitado
  → ux/prototipo-em-andamento
    → ux/prototipo-concluido

[SKILL-UX-02]
ux/componente-solicitado
  → ux/componente-em-andamento
    → ux/componente-concluido

[SKILL-UX-03]
ux/review-solicitado
  → ux/review-em-andamento
    → ux/review-aprovado
    → ux/review-aprovado-com-alertas
    → ux/review-bloqueado
```

---

## Estrutura de Arquivos

```
src/deep_ion/dom_04_frontend/
├── domain/
│   ├── ux_analysis_result.py      # Resultado da análise UX (heurísticas + WCAG)
│   ├── ux_prototype_result.py     # Resultado da geração de protótipos
│   ├── ux_component_result.py     # Resultado de geração de componentes UX
│   └── ux_policy.py               # Validações determinísticas de UX (WCAG, tokens, conventions)
├── infrastructure/
│   └── template_reader.py         # Lê template HTML e extrai design tokens
├── prompts/
│   ├── ux_analysis_v1.txt         # Prompt: análise heurística UX
│   ├── ux_prototype_v1.txt        # Prompt: geração de protótipos HTML
│   ├── ux_component_v1.txt        # Prompt: geração de componentes React
│   ├── ux_review_v1.txt           # Prompt: revisão UX de PRs
│   └── ux_context_v1.txt          # Contexto UX compartilhado entre prompts
├── skill_dev_fe_ux_00.py          # UX Analysis entry point
├── skill_dev_fe_ux_01.py          # Prototype Generator entry point
├── skill_dev_fe_ux_02.py          # Component Generator entry point
└── skill_dev_fe_ux_03.py          # PR UX Review entry point
```

---

## Audit Ledger — DecisionRecord

Reutiliza `FrontendDecisionRecord` existente com `decision_type` expandido:

```json
{
  "record_id": "DR-FE-{UUID}",
  "agent": "DOM-04",
  "skill": "skill_dev_fe_ux_00 | skill_dev_fe_ux_01 | skill_dev_fe_ux_02 | skill_dev_fe_ux_03",
  "issue_id": "{numero}",
  "timestamp": "{ISO-8601}",
  "decision_type": "ux_analysis | ux_prototype | ux_component | ux_review",
  "decision": "approve | block | escalate",
  "confidence_score": 0.87,
  "tier": "SENIOR",
  "model_used": "claude-opus-4.6",
  "output_tokens_used": 1250,
  "rn_triggered": [],
  "justification": "{motivo do bloqueio/escalação}",
  "lgpd_scope": false,
  "blueprint_hash": "{sha256[:12]}",
  "prompt_version": "v1",
  "blocks_detected": ["W1 — alt text ausente", "H5 — confirmação ausente"],
  "complexity_score": 0.0,
  "ux_score": 7.5,
  "wcag_violations_count": 2
}
```

---

## Evals — Casos de Teste

| # | Cenário | Skill | Comportamento esperado |
|---|---|---|---|
| 1 | Issue com componente de saldo simples | UX-00 | Análise limpa, score alto, 0 violations WCAG |
| 2 | Issue sem alt text em ícones | UX-00 | W1 detectado, score reduzido, sugestão de correção |
| 3 | Issue de tela de transferência | UX-01 | 4 protótipos (loading/empty/data/error), mobile-first |
| 4 | Issue com UC de orçamento mensal | UX-01 | Protótipo com gráfico placeholder, estados de período inválido (RN-04) |
| 5 | Request de botão de confirmação | UX-02 | Componente React com shadcn/ui Button, i18n, aria-label, example |
| 6 | Request de card financeiro | UX-02 | Card com cn(), props interface, design rationale documentado |
| 7 | PR com input sem label | UX-03 | R1 blocker detectado, label `ux/review-bloqueado` |
| 8 | PR com cores hardcoded | UX-03 | R2 warning, label `ux/review-aprovado-com-alertas` |
| 9 | PR limpo com i18n e WCAG | UX-03 | Sem findings, label `ux/review-aprovado` |
| 10 | Issue com confidence < 0.65 | UX-00 | Escalação automática, label `ux/analise-escalada` |

---

## Métricas de Qualidade

| Métrica | Meta | Mínimo | Medição |
|---|---|---|---|
| WCAG violations detectadas (precision) | > 90% | > 80% | Auditoria manual pós-review |
| Falsos positivos em análise heurística | < 15% | < 25% | Sample de reports vs. revisão humana |
| Protótipos com 4 estados obrigatórios | 100% | 100% | Validação automática no script |
| Componentes com i18n + aria-label | 100% | 100% | `ux_policy.validate_component_conventions()` |
| Tempo SKILL-UX-00 | < 90s | < 180s | Audit Ledger |
| Tempo SKILL-UX-01 | < 120s | < 240s | Audit Ledger |
| Tempo SKILL-UX-02 | < 120s | < 240s | Audit Ledger |
| Tempo SKILL-UX-03 | < 90s | < 180s | Audit Ledger |
| confidence_score < 0.65 erroneamente não escalado | 0% | 0% | Audit Ledger |
