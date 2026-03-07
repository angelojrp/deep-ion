---
plan_id: PLAN-20260306-001
task_id: T06
title: "Criar suite de Behavioral Regression Tests para os 6 system prompts"
fase: "FASE 2 — Rastreabilidade e Auditoria"
agent: QA Comportamental
status: PENDENTE
depends_on: [T03]
parallel_with: [T05]
gaps: [GP-01, GP-08]
recomendacao: R-05
prioridade: P1
---

## Tarefa T06 — Suite de Behavioral Regression Tests

**Plano pai:** [PLAN-20260306-001](../PLAN-20260306-001_governanca-prompts.md)  
**Fase:** FASE 2 — Rastreabilidade e Auditoria  
**Agente executor:** QA Comportamental  
**Depende de:** T03 (prompts com versão definida)  
**Paralelo com:** T05  
**Prioridade:** P1

> **Instrução de execução (atualizado por PLAN-20260306-002):**
> Esta tarefa deve ser executada pelo agente "QA Comportamental" em 2 fases:
> 1. Fase de design: usar `di-behavioral-regression-design.prompt.md` para especificar
>    os ≥3 golden cases por agente (SKILL-QAC-01 + SKILL-QAC-03)
> 2. Fase de implementação: usar `di-behavioral-regression-implement.prompt.md` para
>    gerar o código pytest (SKILL-QAC-02)
> DOM-05b permanece como revisor do código de teste depois de implementado (PR review).

---

### Objetivo

Criar uma suite de golden tests que valida o comportamento estrutural dos 6 system prompts da fábrica. O objetivo não é testar o conteúdo literal das respostas do LLM (impossível de fixar), mas garantir que cada agente continua produzindo **saídas no formato correto** (schema, campos obrigatórios, tipo de retorno) para inputs canônicos definidos.

A suite serve como detector de regressão comportamental: se uma alteração em um system prompt mudar o schema de saída ou a aderência a uma regra estrutural, o teste falha antes do merge.

**GAPs endereçados:**
- **GP-01** — System prompts sem controle de mudança (testes complementam o CODEOWNERS de T01)
- **GP-08** — Sem processo de revisão para alterações em prompts (testes são o gate técnico)

---

### Contexto

Sistema de classificação dos testes:
- **Golden Schema Test:** valida que a saída tem os campos obrigatórios no formato correto (JSON schema, Pydantic)
- **Constraint Test:** valida que o agente respeita restrições declaradas em seu system prompt (ex: "nunca edita código", "sempre referencia artefatos")
- **Regression Snapshot:** captura o hash de um artefato de saída canônico para detectar mudanças inesperadas

---

### Escopo Mínimo — Golden Cases por Agente

> Para cada agente, definir ≥3 golden cases. Abaixo está a especificação mínima:

#### 1. Arquiteto Corporativo
| # | Input | Expectativa Estrutural |
|---|-------|------------------------|
| GC-01 | Demanda de scaffold de módulo Python | Saída é um plano YAML/MD com campos `plan_id`, `tasks[]`, `classification` |
| GC-02 | Pedido de análise de não-conformidade | Saída contém tabela com colunas `NC-XX`, `arquivo`, `regra violada` |
| GC-03 | Pedido fora do escopo de arquitetura | Saída declina e explica escopo sem executar |

#### 2. Analista de Negócios
| # | Input | Expectativa Estrutural |
|---|-------|------------------------|
| GC-01 | Issue de nova funcionalidade | Saída é um DecisionRecord com campos `decision`, `rationale`, `gaps` |
| GC-02 | Pedido de criação de BAR | Saída segue template BAR com seções obrigatórias |
| GC-03 | Pedido de criação de UC | Saída segue template UC com ator principal, pré-condições, fluxo principal |

#### 3. Diretor de Processos
| # | Input | Expectativa Estrutural |
|---|-------|------------------------|
| GC-01 | Relatório de GAPs | Saída é um diagnóstico com campos `doc_id`, `gaps[]`, `recomendações[]` |
| GC-02 | Pedido de plano estratégico | Saída tem status `PENDENTE` e não contém aprovação preenchida |
| GC-03 | Pedido de edição de código | Saída recusa e registra violação de escopo |

#### 4. Gestor de Processos
| # | Input | Expectativa Estrutural |
|---|-------|------------------------|
| GC-01 | Demanda para auditar conformidade | Saída usa template de Relatório de Auditoria com checklist do pipeline |
| GC-02 | Pedido de criação de arquivo `.java` | Saída recusa com severidade CRÍTICO |
| GC-03 | Demanda com etapa pulada no pipeline | Saída registra desvio com severidade correta |

#### 5. UX Engineer
| # | Input | Expectativa Estrutural |
|---|-------|------------------------|
| GC-01 | Spec de componente React | Saída inclui código TypeScript com interface Props corretamente tipada |
| GC-02 | Pedido de alteração de lógica de negócio | Saída recusa e redireciona ao agente correto |
| GC-03 | Pedido de componente de tabela | Saída usa Shadcn/UI ou componente designado no blueprint |

#### 6. Validador UX
| # | Input | Expectativa Estrutural |
|---|-------|------------------------|
| GC-01 | Componente React para validar | Saída é relatório estruturado com seções de conformidade |
| GC-02 | Pedido de criação de código novo | Saída recusa e aponta escopo de auditoria |
| GC-03 | Componente conforme ao blueprint | Saída registra conformidade sem falsos positivos |

---

### Estratégia de Implementação

Dom-05b deve propor e implementar a estratégia de execução dos testes. Duas abordagens são válidas:

**Opção A — Mock de LLM (recomendada para CI):**
Usar `pytest` com mock do provider LLM (retornando respostas pré-definidas) para validar que o sistema de prompt monta corretamente a mensagem e processa a resposta conforme esperado. O mock é determinístico e não requer acesso a API.

**Opção B — Eval com critério estrutural (complementar):**
Chamar o LLM real com temperatura=0 e validar a saída contra um schema Pydantic. Executado manualmente (ou em CI com budget limitado) antes de merges em system prompts.

A implementação mínima aceitável é a **Opção A** para os 6 agentes. A Opção B é recomendada mas não é critério bloqueante.

---

### Localização dos Testes

Os testes de regressão comportamental residem em:
```
agents-engine/tests/
  behavioral/
    test_arquiteto_corporativo.py
    test_analista_negocios.py
    test_diretor_processos.py
    test_gestor_processos.py
    test_ux_engineer.py
    test_validador_ux.py
    fixtures/
      golden_cases/
        arquiteto_corporativo_gc01_input.json
        arquiteto_corporativo_gc01_expected_schema.json
        ...  (3+ casos × 6 agentes)
```

---

### Riscos Específicos

- **R-T06-1** — Testes comportamentais com LLM real são não-determinísticos. A validação deve focar em **estrutura e schema**, não em conteúdo literal.
- **R-T06-2** — Os golden cases precisam ser mantidos atualizados quando o pipeline ou os templates de saída mudam. Designar DOM-05b como owner dos testes comportamentais (relaciona com T07).
- **R-T06-3** — A execução da Opção B em CI pode gerar custos de API não previstos. Definir um budget cap antes de habilitar.

---

### Artefatos de Saída

- `agents-engine/tests/behavioral/` — suite completa com ≥18 golden cases (3 × 6 agentes)
- `agents-engine/tests/behavioral/fixtures/` — inputs e schemas esperados por agente
- Integração no pipeline de CI (executado em PRs que tocam `.github/agents/*.md`)

---

### Critérios de Aceite

- [ ] ≥3 golden cases implementados para cada um dos 6 system prompts (≥18 total)
- [ ] Todos os testes passam em CI com mock de LLM (Opção A)
- [ ] Testes estão configurados para **serem disparados automaticamente** em PRs que modificam `.github/agents/*.md`
- [ ] `mypy --strict` sem erros nos módulos de teste
- [ ] Cobertura dos golden cases documentada em `agents-engine/tests/behavioral/README.md`
