# SKILL — Scaffold de Módulos e Projetos

## Papel desta Skill

Quando carregada, esta skill instrui o Arquiteto a produzir um **Plano de Execução de Scaffold** completo e executável, cobrindo estrutura de diretórios, arquivos-base, contratos de interface e checklist de conformidade do blueprint.

**O arquiteto não cria os arquivos.** O plano descreve exatamente o que o agente executor (DOM-03 ou humano) deve gerar.

---

## Blueprints Registrados

| Blueprint               | Localização                                     | Uso                                        |
|-------------------------|-------------------------------------------------|--------------------------------------------|
| `python-agent-first`    | `architecture/blueprints/python-agent-first.yaml` | Agentes Python da fábrica (DOM-XX)         |
| `modulith-api-first`    | `architecture/blueprints/modulith-api-first.yaml` | Módulos Java/Spring Modulith (fintech)     |

> Se o blueprint solicitado não estiver na tabela → sinalizar no plano como **risco de bloqueio** e solicitar registro antes de prosseguir.

---

## Protocolo de Leitura do Blueprint

Antes de gerar o plano, o arquiteto **deve** fazer fetch do blueprint referenciado e extrair:

1. `variables` → substitui `{basePackage}`, `{agentName}`, `{agentId}` em todos os paths
2. `project_structure.layout` → estrutura raiz de diretórios e arquivos obrigatórios
3. `package_structure.layout` → estrutura interna do pacote Python ou módulo Java
4. `dependency_management` → dependências runtime e dev obrigatórias
5. `entry_points` → padrão de nome e target dos scripts de entrada
6. `llm_behavior.default_mode` → se `execution_only`, o plano não inclui explicações nos arquivos gerados

---

## Estrutura do Plano de Scaffold

```markdown
## Plano de Execução — Scaffold: {moduleName}

**Blueprint:** {blueprintName} v{version}
**Classificação de Impacto:** T0
**Data:** {YYYY-MM-DD}

### Contexto
{1–2 linhas: o que está sendo criado e por quê}

### Variáveis Resolvidas
| Variável        | Valor resolvido         |
|-----------------|-------------------------|
| basePackage     | {valor}                 |
| agentName       | {valor}                 |
| agentId         | {valor}                 |

### Estrutura de Diretórios e Arquivos

```
{árvore completa gerada a partir do blueprint — todos os paths resolvidos}
```

### Tarefas

| #  | Tarefa                              | Agente     | Depende de | Paralelo | Modelo          | Justificativa              |
|----|-------------------------------------|------------|------------|----------|-----------------|----------------------------|
| 1  | Criar estrutura de diretórios       | DOM-03/Dev | —          | #2       | GPT-4o          | Tarefa estrutural simples  |
| 2  | Gerar pyproject.toml + uv.lock stub | DOM-03/Dev | —          | #1       | GPT-4o          | Geração de configuração    |
| 3  | Gerar entry points (skill_*.py)     | DOM-03/Dev | #1, #2     | —        | GPT-5.1-Codex   | Código com contratos tipados|
| 4  | Gerar camadas domain/infra/audit    | DOM-03/Dev | #1         | #3       | GPT-5.1-Codex   | Código com Protocols/Pydantic|
| 5  | Gerar testes base (unit + integration)| DOM-03/Dev | #3, #4   | —        | GPT-5.1-Codex   | Espelha estrutura src/     |
| 6  | Gerar justfile + pre-commit config  | DOM-03/Dev | #1, #2     | #3, #4   | GPT-4o          | Configuração de tooling    |
| 7  | Verificar conformidade do blueprint | DOM-05b    | #1..#6     | —        | Claude Opus 4.6 | Auditoria multi-critério   |

### Contratos de Interface (descrever, não implementar)

#### LLMProvider Protocol
{descrição textual da interface — o executor cria o código}

#### DecisionRecord (Pydantic)
{campos obrigatórios conforme blueprint}

#### CLI Entry Point (main)
{assinatura da função — argumentos, retorno, comportamento esperado}

### Dependências a Declarar no pyproject.toml

**Runtime:**
{lista extraída de blueprint.dependency_management.core_runtime_deps}

**Dev:**
{lista extraída de blueprint.dependency_management.core_dev_deps}

### Checklist de Conformidade pós-geração

O agente executor deve verificar cada item antes de abrir PR:

- [ ] `src-layout` aplicado: código em `src/{basePackage}/`
- [ ] `uv.lock` gerado e commitado
- [ ] `.python-version` presente com versão exata
- [ ] Todos entry points registrados em `[project.scripts]`
- [ ] `mypy --strict` passa sem erros
- [ ] `ruff check` passa sem erros
- [ ] `LLMProvider` é `typing.Protocol`, não ABC
- [ ] `DecisionRecord` é Pydantic v2 frozen model
- [ ] `AI_PROVIDER` env var controla seleção de provider
- [ ] Nenhum SDK importado incondicionalmente (factory pattern)
- [ ] `structlog` configurado; `logging` stdlib não importado
- [ ] Credenciais carregadas via `pydantic.SecretStr`
- [ ] `GITHUB_TOKEN` scope mínimo: issues=write, pull-requests=write, contents=read
- [ ] `ModulithArchitectureTest` passa (apenas para blueprint `modulith-api-first`)
- [ ] Cobertura domain ≥ 100%, geral ≥ 80%
- [ ] `justfile` com recipes obrigatórios: lint, format, typecheck, test, ci

### Riscos e Condições de Bloqueio
- Blueprint não registrado → bloquear até registro em `architecture/blueprints/`
- Nome de módulo conflita com pacote existente em `src/` → sinalizar antes de executar

### Gates Necessários
- Gate implícito T0: revisão humana funcional do scaffold antes de iniciar desenvolvimento
```

---

## Regras de Classificação de Scaffold

| Operação                                      | Classificação |
|-----------------------------------------------|---------------|
| Scaffold de novo módulo/agente (zero base)    | T0            |
| Scaffold com migração de código existente     | T1–T2         |
| Scaffold que altera fronteiras de módulo      | T2            |
| Scaffold em sistema com dados pessoais (LGPD) | T2+ obrigatório|

---

## Convenções de Naming (python-agent-first)

```
Módulo:        {agentName}                              → ex: dom_02
Pacote base:   {basePackage}.{agentName}                → ex: deep_ion.dom_02
Skill file:    skill_{agentId}_{N:02d}.py               → ex: skill_req_00.py
Entry point:   skill-{agentId}-{NN}                     → ex: skill-req-00
Target:        {basePackage}.{agentName}.skill_{agentId}_{NN}:main
Test file:     test_skill_{agentId}_{NN}.py             → ex: test_skill_req_00.py
```

---

## Exemplo de Árvore Resolvida (python-agent-first, agentName=dom_02)

```
deep-ion-agents/
├── pyproject.toml
├── uv.lock
├── .python-version                    # "3.12.9"
├── justfile
├── .pre-commit-config.yaml
├── README.md
├── src/
│   └── deep_ion/
│       └── dom_02/
│           ├── __init__.py
│           ├── skill_req_00.py        # entry: skill-req-00
│           ├── skill_req_01.py        # entry: skill-req-01
│           ├── skill_req_02.py        # entry: skill-req-02
│           ├── providers/
│           │   ├── __init__.py
│           │   ├── protocol.py        # LLMProvider Protocol
│           │   ├── factory.py         # ProviderFactory
│           │   ├── copilot.py
│           │   ├── openai.py
│           │   └── anthropic.py
│           ├── domain/
│           │   ├── __init__.py
│           │   ├── models.py          # Pydantic v2 entities
│           │   ├── rn_catalog.py      # RN rules — deterministic, 100% coverage
│           │   └── protocols.py       # Protocols consumed by skill layer
│           ├── infrastructure/
│           │   ├── __init__.py
│           │   ├── github_client.py   # GitHubClient
│           │   ├── issue_reader.py
│           │   ├── comment_publisher.py
│           │   └── label_manager.py
│           └── audit/
│               ├── __init__.py
│               ├── decision_record.py # Pydantic v2 frozen model
│               └── audit_ledger.py
├── tests/
│   ├── conftest.py
│   ├── unit/
│   │   └── dom_02/
│   │       ├── test_skill_req_00.py
│   │       ├── test_skill_req_01.py
│   │       ├── test_skill_req_02.py
│   │       └── domain/
│   │           └── test_rn_catalog.py
│   ├── integration/
│   │   └── dom_02/
│   │       └── test_github_client.py
│   └── e2e/
│       └── dom_02/
│           └── test_skill_req_e2e.py
└── docs/
    └── skills/
        └── dom_02/
            ├── skill_req_00.md
            ├── skill_req_01.md
            └── skill_req_02.md
```