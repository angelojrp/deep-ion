# Architecture Blueprints

Blueprints são **documentos normativos YAML** que definem as decisões arquiteturais, convenções de código e regras de conformidade de cada stack tecnológica do projeto. Eles são a fonte de verdade que orienta agentes de IA e desenvolvedores humanos — qualquer geração de código, revisão ou análise deve estar em conformidade com o blueprint correspondente.

> **Regra fundamental:** toda implementação começa pelo blueprint. Se uma decisão de projeto não está refletida aqui, ela não é oficial.

---

## Blueprints disponíveis

| Arquivo | Stack | Projeto-alvo | Status |
|---|---|---|---|
| [modulith-api-first.yaml](modulith-api-first.yaml) | Java 21 · Spring Boot 3 · Spring Modulith · React 18 | `fintech-pessoal` | ✅ Vigente |
| [python-agent-first.yaml](python-agent-first.yaml) | Python 3.12 · GitHub Actions · AI provider-agnóstico | `deep-ion-agents` | ✅ Vigente |
| [frontend-react-spa.yaml](frontend-react-spa.yaml) | React 18 · TypeScript 5 · Tailwind CSS 4 · react-i18next | `fintech-pessoal` (frontend) | ✅ Vigente |

---

## Estrutura de um blueprint

Cada arquivo segue o seguinte esquema de seções:

```
blueprintName        → identificador único do blueprint
description          → propósito e contexto da stack
variables            → variáveis reutilizadas ao longo do arquivo
llm_behavior         → como agentes de IA devem processar este blueprint
architecture/
  conventions/       → nomeação, estilo, tipagem, anotações obrigatórias
  project_structure/ → layout de diretórios e regras de organização
  modules/layers/    → responsabilidades e regras por camada
  testing/           → framework, cobertura mínima, tipos de teste
  security/          → autenticação, autorização, LGPD
  observability/     → logging, audit ledger, rastreabilidade
  github_actions/    → triggers, labels, invocação de skills (Python)
documentation/       → localização e seções obrigatórias da documentação
```

---

## Como ler e aplicar um blueprint

### 1. Identifique a stack do que está sendo implementado

- Código Java / Spring no `fintech-pessoal` → use `modulith-api-first.yaml`
- Script Python / agente no `deep-ion-agents` → use `python-agent-first.yaml`

### 2. Consulte a seção `architecture.conventions` primeiro

Ela define as regras de menor granularidade que se aplicam a **todo** arquivo criado naquela stack: nomeação, tipagem, estilo, anotações obrigatórias. Violações aqui são bloqueantes em qualquer classificação de impacto.

### 3. Localize a camada correta em `modules.layers`

Cada camada tem um `purpose` declarado e uma lista de `rules`. Antes de criar ou modificar um arquivo, verifique:

- O arquivo pertence à camada correta?
- As dependências permitidas para essa camada estão sendo respeitadas?
- As classes obrigatórias da camada existem?

### 4. Verifique as regras de teste antes de submeter código

A seção `testing` define cobertura mínima (80% global, 100% para `domain`), tipos de teste obrigatórios e convenções de nomeação. O CI rejeita PRs que não atendam ao `--cov-fail-under`.

### 5. Nunca contorne as regras de `security` e `lgpd`

Essas seções não admitem exceções. Qualquer demanda que envolva dados pessoais força escalation para gate humano, independente da classificação T0–T3.

---

## Decisões arquiteturais documentadas nos blueprints

### `modulith-api-first.yaml` — Java / Spring Modulith

| Decisão | Justificativa |
|---|---|
| **API First com OpenAPI contracts** | Contrato de API versionado e independente da implementação; permite geração de interfaces e DTOs sem acoplamento. |
| **Spring Modulith para isolamento de domínio** | Garante fronteiras explícitas entre módulos de negócio dentro de um único artefato deployável, sem a complexidade operacional de microsserviços. |
| **Comunicação entre módulos via eventos de domínio** | Elimina acoplamento direto; módulos publicam `ApplicationEventPublisher` e nunca importam classes uns dos outros. |
| **MapStruct para mapeamento DTO ↔ Domain ↔ JPA** | Mapeamento em tempo de compilação, sem reflexão em runtime; erros detectados antes de chegar em produção. |
| **Lombok restrito por tipo de classe** | `@Data` apenas em POJOs puros; entidades JPA usam `@Getter/@Setter` explícitos para evitar geração de `equals/hashCode` sobre coleções lazy. |
| **Configuração centralizada em `config` package** | Módulos de feature nunca definem `SecurityFilterChain` ou `@ConfigurationProperties` próprios — elimina conflitos de contexto Spring. |
| **OAuth2 Authorization Code + PKCE obrigatório** | Fluxo seguro para SPA sem client secret; Implicit flow e ROPC são explicitamente proibidos. |
| **Flyway para migrações de schema** | Toda mudança de banco rastreada em VCS; sem mudanças manuais em ambiente algum. |
| **`ROLE_ROOT` como sentinela de endpoint não autorizado** | Endpoint sem declaração explícita de autorização recebe `ROLE_ROOT` (impossível de atribuir a usuários reais) — falha segura por padrão. |

### `python-agent-first.yaml` — Python / Agentes

| Decisão | Justificativa |
|---|---|
| **Processo OS isolado por skill** | Elimina estado compartilhado entre skills; falha em uma skill não propaga para outras; modelo mental simples para CI. |
| **GitHub como único message bus** | Comentários de Issue/PR são o canal de comunicação; não há fila, banco ou arquivo intermediário — auditoria nativa e gratuita via GitHub. |
| **src-layout obrigatório** | Previne importações acidentais do diretório raiz durante desenvolvimento local, garantindo que o pacote instalado seja sempre o testado. |
| **`uv` como gerenciador de dependências** | Resolução determinística via `uv.lock`, instalação rápida; elimina ambiguidade de `requirements.txt`. |
| **Factory pattern para AI providers** | Nenhum SDK de provider importado incondicionalmente; troca de provider sem alteração de código via `AI_PROVIDER` env var. |
| **`confidence_score < 0.65` sempre escala** | Ambiguidade nunca é resolvida silenciosamente pelo agente; o humano decide quando a confiança é baixa. |
| **Camada `domain` com 100% de cobertura** | Toda a lógica determinística de RNs vive aqui; zero LLM inference nas regras de negócio críticas. |
| **Audit Ledger append-only como comentário GitHub** | Rastreabilidade completa de todas as decisões sem infraestrutura adicional; imutabilidade garantida pela API do GitHub. |
| **`ruff` como único linter/formatter** | Substitui flake8 + isort + black com uma única ferramenta; configuração centralizada em `pyproject.toml`. |
| **LGPD bloqueia em todas as classes** | Dados pessoais nunca são processados autonomamente, independente do score T0–T3; conformidade regulatória é invariante. |

---

## Adicionando um novo blueprint

1. Crie o arquivo `{nome-do-blueprint}.yaml` neste diretório.
2. Siga o esquema de seções descrito acima.
3. Preencha obrigatoriamente: `blueprintName`, `description`, `architecture.conventions`, `architecture.modules.layers`, `testing`, `security`, `documentation`.
4. Adicione uma linha na tabela de **Blueprints disponíveis** neste README.
5. Abra uma Issue no repositório com label `req/blueprint` e classifique o impacto via DOM-01.

> Blueprints são documentos T2 — toda alteração requer Gate 2 (PO + Tech Lead) e produz um ADR correspondente em `architecture/decisions/`.

---

## Relação com outros artefatos de arquitetura

```
architecture/
  blueprints/     ← você está aqui — convenções e regras por stack
  decisions/      ← ADRs: decisões pontuais com contexto, alternativas e consequências
  plans/          ← Planos de Execução gerados pelo Arquiteto Corporativo
```

- **Blueprint** responde: *"Como todo código desta stack deve ser escrito?"*
- **ADR** responde: *"Por que esta decisão específica foi tomada neste momento?"*
- **Plano de Execução** responde: *"O que precisa ser feito agora e quem faz?"*
