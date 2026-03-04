---
status: FINAL
versão: 7
ciclo-refinamento: 3
data-criação: 2026-03-02
tema: deep-ion
---

# Documento de Visão — deep-ion: Fábrica de Software Autônoma

---

## 1. Identificação do Projeto

| Campo | Valor |
|---|---|
| Nome do Projeto | deep-ion — Fábrica de Software Autônoma |
| Marca / Domínio | `deep-ion` · `deepion.net` |
| Tema (slug) | `deep-ion` |
| Responsável | Angelo (Owner / Product Owner) |
| Data de Criação | 2026-03-02 |
| Versão | 7 |
| Status | FINAL |
| Licença | Proprietária — projeto privado |

---

## 2. Declaração da Visão

> Para **organizações e profissionais de software de qualquer porte**, que **precisam entregar software com qualidade, rastreabilidade e governança sem a complexidade e o custo de grandes equipes especializadas**, o **deep-ion** (deepion.net) é uma **plataforma SaaS multi-tenant de agentes de IA orquestrados** que **automatiza o ciclo completo de desenvolvimento de software — do brief de descoberta até o merge do PR — para múltiplos projetos e clientes em um único ambiente gerenciado**. Diferente de **assistentes de codificação ad-hoc ou pipelines CI/CD convencionais**, nossa solução **opera como uma fábrica autônoma baseada em pipeline estruturado, com squads configuráveis por projeto, gates humanos em pontos críticos, audit ledger imutável e conformidade contínua contra blueprints arquiteturais declarativos**.

---

## 3. Objetivo Estratégico

### Problema / Oportunidade

O desenvolvimento de software em contextos modernos exige multidisciplinaridade crescente: análise de requisitos, modelagem de domínio, arquitetura de sistema, implementação, testes, revisão de código e governança de qualidade. Organizações de todos os portes enfrentam dois problemas opostos:

1. **Velocidade vs. Qualidade:** a pressão por entrega rápida compromete rastreabilidade, cobertura de testes e conformidade arquitetural.
2. **Overhead de processo:** metodologias pesadas (gates, auditorias, ADRs) elevam a carga cognitiva e retardam o ciclo.

### Solução e Impacto Esperado

O deep-ion resolve esse paradoxo operando como uma **plataforma multi-tenant de fábricas de software autônomas**, onde cada cliente (tenant) cadastra seus próprios projetos e squads, e agentes de IA assumem os papéis de Analista de Negócios, Arquiteto, Desenvolvedor e QA — orquestrados por um pipeline deterministicamente controlado internamente pela plataforma deep-ion via MCP Servers. Os humanos participam como **tomadores de decisão estratégica** nos gates configuráveis, não como executores operacionais.

**Impacto esperado (métricas-alvo):**
- Redução de ≥ 60% do tempo entre brief aprovado e PR gerado para demandas T0/T1.
- 100% dos PRs gerados com cobertura de testes ≥ 80% (conforme blueprint).
- Zero não-conformidades arquiteturais não detectadas chegando ao merge.
- Rastreabilidade end-to-end: toda linha de código rastreável ao caso de uso e à regra de negócio original.
- Suporte a múltiplos tenants e projetos simultâneos em uma única instância da plataforma.

### Alinhamento Estratégico

- Habilita desde squads solo até times maiores a operarem com a cadência e qualidade de grandes organizações.
- Modelo SaaS multi-tenant cria um produto comercialmente viável com base de clientes diversificada.
- O pipeline e os blueprints são generalizáveis para qualquer projeto cadastrado na plataforma.
- Posiciona o deep-ion como plataforma proprietária de referência no segmento "AI-native software factory".

### Roadmap de Alto Nível

| Marco | Agentes / Funcionalidades | Prazo |
|-------|--------------------------|-------|
| **Marco 1 — Core Pipeline** | DOM-01 (Descoberta) + DOM-02 (Requisitos) + DOM-03 (Arquitetura) operacionais | 2 meses (Mai/2026) |
| **Marco 2 — Pipeline Completo** | DOM-04 (Dev) + DOM-05a (QA Negocial) + DOM-05b (QA Técnico) + Gates 1–4 completos | 6 meses (Set/2026) |
| **Marco 3 — Plataforma Multi-Tenant** | Frontend de controle + gestão de tenants + cadastro de projetos e squads | 6 meses (Set/2026) |

### Modelo de Negócio

O deep-ion adota o modelo **SaaS com cobrança por tenant**, baseado em três parâmetros:

| Parâmetro de Cobrança | Descrição |
|----------------------|-----------|
| **Quantidade de usuários** | Número de membros ativos nas squads do tenant |
| **Número de projetos** | Total de projetos ativos cadastrados pelo tenant |
| **Tamanho dos projetos** | Volume/complexidade de cada projeto (métrica detalhada a definir na fase comercial) |

> _O custo de uso das APIs de LLM **não** é gerenciado pelo deep-ion — cada tenant utiliza sua própria conta no provedor de IA escolhido e arca diretamente com os custos do provedor._

---

## 4. Partes Interessadas (Stakeholders)

| ID | Nome / Grupo | Papel | Interesse Principal | Nível de Influência |
|----|-------------|-------|--------------------|--------------------|
| STK-01 | Angelo (Owner) | Product Owner / Mantenedor da plataforma | Velocidade, qualidade e autonomia do pipeline; crescimento da base de tenants | Alto |
| STK-02 | Administrador de Tenant (cliente da plataforma) | Gestor da conta e dos projetos do cliente | Cadastrar projetos, montar squads e acompanhar o desempenho da fábrica | Alto |
| STK-03 | Membros da Squad por Projeto | Usuário final — atores primários do pipeline | Executar suas responsabilidades (PO, Arquiteto, Dev, QA) com suporte dos agentes | Alto |
| STK-04 | Gate Keepers / Revisores humanos | Auditor nos pontos de decisão do pipeline | Garantir que decisões críticas permanecem sob controle humano | Alto |
| STK-05 | GitHub / Microsoft (plataforma) | Fornecedor de repositórios de código e LLM | Disponibilidade da API GitHub (repositório, PRs, Copilot) | Médio |
| STK-06 | Analista de Negócios (DOM-02) | Responsável pela manutenção e validação dos briefs e documento de visão | Garantir que os artefatos negociais estejam completos, consistentes e prontos para avançar no pipeline | Alto |
| STK-07 | Analista de Requisitos | Responsável pela manutenção dos casos de uso e regras de negócio | Assegurar rastreabilidade entre requisitos, casos de uso e critérios de aceite ao longo do ciclo de desenvolvimento | Alto |
| STK-08 | Analista de UX | Membro humano de squad responsável pela **aprovação** dos protótipos de UX gerados pela plataforma (WEB + Mobile) | Garantir que os protótipos reflitam a experiência do usuário esperada antes da implementação; atua como Gate Keeper do passo de prototipação | Médio |

---

## 5. Usuários-Alvo (Perfis)

| ID | Perfil | Descrição | Principal Necessidade |
|----|--------|-----------|----------------------|
| USR-01 | Administrador de Tenant | Responsável pela conta do cliente na plataforma; cadastra projetos e define squads | Gerenciar múltiplos projetos, convidar membros e configurar papéis por projeto |
| USR-02 | Product Owner do Projeto | Define requisitos, valida artefatos negociais e aprova gates de negócio | Ter visibilidade e controle nos gates sem precisar dominar detalhes de implementação |
| USR-03 | Arquiteto de Software | Define e mantém blueprints e decisões arquiteturais do projeto | Garantir que todas as implementações geradas pelos agentes estejam em conformidade com padrões definidos |
| USR-04 | Desenvolvedor (Solo ou em equipe) | Executa ou supervisiona a implementação; atua no Gate 4 | Ter código gerado que segue os blueprints, com cobertura de testes adequada, sem precisar iniciar do zero |
| USR-05 | QA / Auditor de Qualidade | Valida artefatos negociais e técnicos antes de cada gate | Ter evidências auditáveis e rastreáveis de cada decisão do pipeline |
| USR-06 | Membro de Squad Solo | Desenvolvedor que acumula todos os papéis (PO + Arquiteto + Dev + QA) em um único projeto | Executar o ciclo completo de desenvolvimento com qualidade sem overhead de processo manual |
| USR-07 | Analista de Negócios | Membro humano de squad responsável pela criação e validação dos briefs e do documento de visão do projeto | Ter artefatos negociais completos, consistentes e rastreáveis, prontos para alimentar o pipeline |
| USR-08 | Analista de Requisitos | Membro humano de squad responsável pela modelagem e manutenção dos casos de uso e regras de negócio | Assegurar rastreabilidade entre requisitos, casos de uso e critérios de aceite ao longo do ciclo de desenvolvimento |
| USR-09 | Analista de UX | Membro humano de squad responsável pela aprovação dos protótipos de UX gerados pela plataforma | Garantir que os protótipos reflitam a experiência do usuário esperada antes da implementação |

---

## 6. Escopo do Produto — Funcionalidades de Alto Nível

### Plataforma e Multi-Tenancy

| ID | Funcionalidade | Prioridade MoSCoW | Marco | Observações |
|----|---------------|-------------------|-------|-------------|
| F-01 | Gestão de tenants (clientes): cadastro, autenticação (SSO via Keycloak) e isolamento de dados | Must | 2 | Cada tenant é isolado; dados de projetos e pipelines não se cruzam entre tenants. Cobrança por tenant conforme parâmetros: quantidade de usuários, número de projetos, tamanho dos projetos |
| F-02 | Gestão de projetos por tenant: cadastro, configuração de blueprint e vinculação a repositório GitHub | Must | 2 | Cada tenant pode ter N projetos; projeto vincula-se a um repositório GitHub |
| F-03 | Gestão de squads por projeto: adição de membros e atribuição de papéis (PO, Arquiteto, Dev, QA, Gate Keeper, Analista de Negócios, Analista de Requisitos, Analista de UX) | Must | 2 | Suporta configuração Solo (1 pessoa acumula todos os papéis) ou multi-pessoa; Analista de UX atua como Gate Keeper do passo de aprovação de protótipos |
| F-04 | Frontend de controle da plataforma (painel de gerenciamento de tenants e projetos) | Must | 2 | Esqueleto inicial já existe em `frontend/`; em desenvolvimento |
| F-05 | Painel operacional por projeto: status do pipeline, gates pendentes, métricas de qualidade | Should | 2 | Visualização do estado de cada demanda ativa no pipeline do projeto |

### Pipeline de Agentes

| ID | Funcionalidade | Prioridade MoSCoW | Marco | Observações |
|----|---------------|-------------------|-------|-------------|
| F-06 | Pipeline orquestrado de agentes — orquestração 100% interna à plataforma deep-ion | Must | 1 | Pipeline base: `DOM-01 → DOM-02 → [F-20: geração de protótipo UX] → [Gate UX] → DOM-05a → Gate 2 → DOM-03 → DOM-04 → DOM-05b → Gate 4`. O Gate UX é ativado apenas quando F-20 (geração de protótipos UX) estiver habilitado no projeto; exige aprovação do Analista de UX antes de avançar para DOM-05a. Todos os agentes são orquestrados internamente via MCP Servers, sem dependência de GitHub Actions. O repositório GitHub do projeto é usado exclusivamente para gerenciamento de código (commits, PRs, revisão humana no Gate 4) |
| F-07 | Agente de Descoberta (DOM-01): classificação T0–T3 | Must | 1 | Entrada do pipeline; determina nível de autonomia e gates ativos |
| F-08 | Agente de Requisitos (DOM-02): BAR + Use Cases + Traceability Matrix | Must | 1 | Produz artefatos negociais rastreáveis |
| F-09 | Agente de Arquitetura (DOM-03): ADR + esqueleto de código | Must | 1 | Projeta solução técnica conforme blueprints do projeto |
| F-10 | Agente de QA Negocial (DOM-05a): completude, consistência, TestPlan | Must | 2 | Audita requisitos antes do Gate 2 |
| F-11 | Agente de Desenvolvimento (DOM-04): implementação + testes | Must | 2 | Gera código conforme blueprint e casos de uso aprovados |
| F-12 | Agente de QA Técnico (DOM-05b): cobertura, arquitetura, conformidade RN | Must | 2 | Audita PR antes do Gate 4 |
| F-13 | Sistema de classificação de impacto T0–T3 com controle de autonomia por projeto | Must | 1 | Define quais gates são humanos vs. autônomos; configurável por projeto |

### Governança e Qualidade

| ID | Funcionalidade | Prioridade MoSCoW | Marco | Observações |
|----|---------------|-------------------|-------|-------------|
| F-14 | Audit Ledger imutável (DecisionRecord JSON) por projeto | Must | 1 | Rastreabilidade de todas as decisões dos agentes; isolado por projeto/tenant |
| F-15 | Catálogo de Regras de Negócio com mapeamento determinístico para FEs | Must | 1 | Base para auditoria automatizada de conformidade |
| F-16 | Blueprints arquiteturais declarativos (YAML) — biblioteca e associação por projeto | Must | 1 | Biblioteca de blueprints reutilizáveis; cada projeto associa seu blueprint |
| F-17 | Suporte multi-provider de LLM com fallback determinístico | Must | 1 | GitHub Copilot → OpenAI → local determinístico; configuração de provedor e credenciais gerenciadas pelo próprio tenant na sua conta do provedor de IA |
| F-18 | Engine de prompts negociais (di-brief, di-uc, di-prototipar, etc.) | Should | 2 | Alimenta o analista de negócios com artefatos estruturados |
| F-19 | Detector de duplicatas e conflitos entre demandas (SKILL-REQ-00) | Should | 2 | Evita retrabalho e inconsistências no backlog do projeto |
| F-20 | Geração de protótipos UX automatizada (WEB + Mobile) | Could | 2 | Materializa casos de uso em wireframes navegáveis |
| F-21 | Exportação de pacote de artefatos negociais (.zip HTML) | Could | 2 | Facilita revisão offline e compartilhamento com stakeholders |
| F-22 | CLI standalone para execução local dos agentes fora da plataforma deep-ion | Won't | — | Fora do escopo v1 — os agentes são acionados e coordenados exclusivamente pela plataforma deep-ion via MCP Servers |

---

## 7. Fora do Escopo

- **Fora-01:** Suporte a stacks além de Spring Modulith (Java) e Python Agent na v1 — outros blueprints são expansão futura via catálogo de blueprints.
- **Fora-02:** Execução em infraestrutura própria (self-hosted LLM) na v1 — suporte apenas a providers externos.
- **Fora-03:** Integração com issue trackers que não sejam GitHub Issues (Jira, Linear, etc.) na v1.
- **Fora-04:** Fluxos de CI/CD de deploy em produção — o pipeline termina no Gate 4 (aprovação do PR); o deploy em produção é responsabilidade de pipelines externos ao deep-ion.
- **Fora-05:** Suporte a múltiplas organizações GitHub dentro de um único projeto — cada projeto vincula-se a um único repositório GitHub.
- **Fora-06:** Marketplace ou compartilhamento público de blueprints entre tenants — blueprints são privados por tenant na v1.
- **Fora-07:** Geração de documentação técnica automática em formatos além de Markdown.

---

## 8. Premissas e Dependências

### Premissas

- O repositório `deep-ion` é o projeto-pai que hospeda a implementação da plataforma; cada projeto de cada tenant tem seu próprio repositório GitHub.
- **Todo o pipeline de agentes (DOM-01 a DOM-05b) é orquestrado 100% internamente pela plataforma deep-ion** — sem dependência de GitHub Actions para o fluxo de agentes. O repositório GitHub do projeto do tenant é usado exclusivamente para gerenciamento de código (commits, PRs e revisão humana no Gate 4).
- A comunicação entre agentes dentro da plataforma é realizada exclusivamente via **MCP Servers** (Model Context Protocol); não há uso de GitHub Issues/PRs como barramento de mensagens entre agentes.
- O `GITHUB_TOKEN` é suficiente para autenticar perante a API do GitHub Copilot — nenhum segredo adicional é necessário para o provider padrão.
- Cada tenant configura e gerencia sua própria conta no provedor de IA escolhido; o deep-ion não armazena, controla nem monitora credenciais ou gastos de LLM dos tenants.
- Um único `confidence_score < 0.65` em qualquer seção estrutural de um artefato obriga escalada — jamais resolução silenciosa.
- Os blueprints YAML são imutáveis durante o ciclo de desenvolvimento de uma demanda; mudanças de blueprint são demandas separadas.
- O modelo de isolamento multi-tenant garante que dados, artefatos e histórico de pipeline de um tenant são inacessíveis a outros tenants.
- Cada projeto pode ter uma configuração de squad diferente (Solo ou multi-pessoa), e os papéis dos membros são definidos no cadastro do projeto.

### Dependências Externas

| Dependência | Tipo | Impacto se indisponível |
|-------------|------|------------------------|
| MCP Servers (infraestrutura interna) | Barramento de comunicação e orquestração entre todos os agentes da plataforma | Pipeline de agentes totalmente inoperante |
| GitHub Repository / PR API | Gestão de código-fonte e revisão humana no Gate 4 | Commits, PRs e aprovação de Gate 4 impossibilitados |
| Keycloak | Provider de SSO da plataforma | Autenticação de tenants e usuários inoperante |
| GitHub Copilot API (`models.inference.ai.azure.com`) | Provider LLM primário | Fallback para OpenAI; se ambos indisponíveis, modo determinístico local |
| Python 3.12 + uv | Runtime dos agentes | Agentes não executam |

---

## 9. Restrições

### Técnicas

- **Linguagem dos agentes:** Python 3.12 exclusivamente (blueprint `python-agent-first`).
- **Runtime de orquestração:** 100% interno à plataforma deep-ion para todos os agentes (DOM-01 a DOM-05b) — sem suporte a GitHub Actions, Kubernetes, Airflow ou orquestradores externos na v1.
- **Barramento de comunicação entre agentes:** exclusivamente via MCP Servers (Model Context Protocol) — sem GitHub Issues/PRs como barramento de agentes, sem filas Kafka ou banco intermediário.
- **Autenticação:** via SSO (Keycloak) — não há sistema de autenticação próprio da plataforma (email/senha nativo) na v1.
- **Isolamento de processo:** cada skill é um processo Python independente — sem estado compartilhado em memória entre skills.
- **Isolamento de dados multi-tenant:** dados de projetos, artefatos e DecisionRecords devem ser isolados por tenant em todas as camadas.

### De Negócio

- **Projeto privado:** o código-fonte da plataforma deep-ion é proprietário; nenhuma parte do código será disponibilizada sob licença open-source.
- **Autonomia limitada por classificação:** demandas T3 nunca têm nenhuma etapa autônoma — o agente apenas acelera a análise humana.
- **LGPD:** qualquer demanda que envolva dados pessoais força escalada para gate humano, independente de T0–T3.
- **Audit Trail:** o DecisionRecord JSON é imutável e append-only — não pode ser alterado retroativamente.
- **Custo de LLM (responsabilidade do tenant):** cada tenant utiliza sua própria conta no provedor de IA escolhido e é responsável pelo controle de gastos diretamente no provedor. O deep-ion não armazena, gerencia nem monitora o budget de LLM dos tenants.

### De Design / Governança

- Todos os artefatos negociais devem ser em português-BR.
- Blueprints são a fonte de verdade — nenhuma geração de código pode contorná-los.
- Gates humanos são invioláveis — nenhum agente pode avançar o pipeline sem o comentário de aprovação correspondente do papel habilitado na squad do projeto.

---

## 10. Critérios de Sucesso / KPIs

| KPI | Linha de Base | Meta | Prazo |
|-----|--------------|------|-------|
| Marco 1 operacional (DOM-01 + DOM-02 + DOM-03) | Não iniciado | Pipeline básico funcional em 1 projeto piloto | Mai/2026 (2 meses) |
| Marco 2 operacional (pipeline completo + Gates 1–4) | Não iniciado | Pipeline end-to-end com gestão de tenants e squads | Set/2026 (6 meses) |
| Tempo entre brief aprovado e PR gerado (T0/T1) | Não medido | ≤ 30 minutos | Set/2026 |
| Cobertura de testes nos PRs gerados | ~40% (estimado) | ≥ 80% global, 100% domain | Set/2026 |
| Taxa de não-conformidades arquiteturais escapando para o Gate 4 | Não medido | 0% | Set/2026 |
| Taxa de rastreabilidade UC → código | 0% | ≥ 90% | Set/2026 |
| Número de ciclos de retrabalho por demanda T1 | Não medido | ≤ 2 ciclos | Set/2026 |
| `confidence_score` médio dos agentes em demandas T0/T1 | Não medido | ≥ 0.75 | Set/2026 |
| Custo médio de LLM por demanda T1 completa | N/A — gerenciado pelo tenant diretamente no provedor de IA escolhido | Responsabilidade do tenant | Contínuo |
| Disponibilidade do pipeline (uptime plataforma deep-ion + MCP Servers) | Não medido (plataforma em desenvolvimento) | ≥ 99% | Contínuo |

---

## 11. Riscos de Negócio

| ID | Risco | Probabilidade | Impacto | Mitigação |
|----|-------|--------------|---------|-----------|
| RNE-01 | Tenant ultrapassar o budget de LLM no seu provedor de IA e ter o serviço interrompido | Média | Médio | O deep-ion detecta erros de API do provedor e sinaliza o tenant com orientação; controle de gastos é responsabilidade do tenant diretamente no provedor de IA |
| RNE-02 | Mudança de API ou billing do GitHub Copilot inviabilizando o provider primário | Média | Alto | Fallback chain: Copilot → OpenAI → determinístico local; arquitetura multi-provider já prevista |
| RNE-03 | Geração de código com erros críticos de segurança não detectados pelos agentes | Média | Alto | Implementar step de SAST (Semgrep/Bandit) como gate adicional no DOM-05b; LGPD sempre escala para humano |
| RNE-04 | Falha no isolamento de dados entre tenants (vazamento de artefatos cross-tenant) | Baixa | Alto | Isolamento de dados validado em testes de integração; auditoria de segurança antes do lançamento multi-tenant |
| RNE-05 | Falha silenciosa de agente (`confidence_score` calculado incorretamente acima de 0.65) | Baixa | Alto | Auditoria periódica de DecisionRecords; threshold configurável; testes de unidade obrigatórios nos módulos de scoring |
| RNE-06 | Complexidade do cadastro de squads e papéis afastando usuários solo | Média | Médio | Oferecer template de squad "Solo" pré-configurado (1 pessoa, todos os papéis); onboarding guiado |
| RNE-07 | Scope creep na expansão de blueprints antes de estabilizar v1 | Alta | Médio | Congelar catálogo de blueprints v1; novos blueprints no roadmap v2; PRs de novo blueprint exigem Gate 3 humano |
| RNE-08 | Acúmulo excessivo de contexto nos MCP Servers durante execução de demandas longas, degradando qualidade das respostas dos agentes | Média | Médio | Implementar sumarização e truncamento de contexto no barramento MCP; definir limite máximo de contexto por sessão de pipeline com alerta automático ao tenant |
| RNE-09 | Violação de LGPD por agente gerando/logando dados pessoais nos artefatos | Baixa | Alto | Toda demanda com dado pessoal → escalada obrigatória; auditoria de prompts antes do deploy |

---

## 12. Alternativas Consideradas

| Alternativa | Motivo do Descarte |
|-------------|-------------------|
| **GitHub Copilot Workspace (produto GitHub)** | Foco em geração de código isolada, sem pipeline de governança multi-agente, sem audit ledger, sem gates, sem multi-tenancy ou rastreabilidade UC→código. Não permite customização do fluxo de trabalho. |
| **Orquestrador LangChain / LangGraph** | Abstraem o fluxo de orquestração em um framework externo, dificultando o controle determinístico dos gates, audit ledger e escaladas que o deep-ion exige. A plataforma deep-ion implementa sua própria camada de orquestração interna via MCP Servers, com controle total sobre o pipeline. |
| **Agentic frameworks (AutoGen, CrewAI)** | Frameworks de alto nível abstraem demais o fluxo; o deep-ion precisa de controle determinístico do pipeline, especialmente nos gates e no audit ledger, o que os frameworks não garantem. |
| **Plataforma BPM tradicional + LLM** | Overhead de licenciamento, infraestrutura própria e curva de aprendizado incompatíveis com o perfil de solo developer / squad enxuta. |
| **Scripts ad-hoc sem estrutura de agente** | Abordagem atual dos MVPs iniciais — funcional mas sem rastreabilidade, sem testes, sem conformidade de blueprint. Esse cenário é exatamente o que o deep-ion resolve. |

---

## 13. Glossário

| Termo | Definição |
|-------|-----------|
| **deep-ion** | Nome oficial da plataforma; domínio registrado: `deepion.net` |
| **Tenant** | Cliente da plataforma deep-ion; entidade isolada que pode ter múltiplos projetos e squads |
| **Projeto** | Unidade de trabalho de um tenant, vinculada a um repositório GitHub; possui blueprints, squad e pipeline próprios |
| **Squad** | Conjunto de membros de um projeto com papéis definidos (PO, Arquiteto, Dev, QA, Gate Keeper); pode ser Solo (1 pessoa) ou multi-pessoa |
| **Papel (Role)** | Função de um membro da squad em um projeto específico; determina quais gates o membro pode aprovar |
| **Agente / Agent** | Processo Python isolado que executa um conjunto de skills; coordenado pela plataforma deep-ion via MCP Servers |
| **Skill** | Script Python individual invocado com `--issue N` ou `--pr N`; unidade atômica de execução de um agente |
| **Pipeline** | Sequência ordenada de agentes: `DOM-01 → DOM-02 → [Gate UX, quando F-20 habilitado] → DOM-05a → Gate 2 → DOM-03 → DOM-04 → DOM-05b → Gate 4` |
| **Gate** | Ponto de controle no pipeline que exige aprovação explícita (comentário `/gate-approve`) do papel habilitado na squad antes de avançar |
| **Gate UX** | Gate opcional do pipeline, ativado quando F-20 (geração de protótipos UX) está habilitado no projeto; posicionado após a geração do protótipo e antes de DOM-05a; exige aprovação explícita do Analista de UX (STK-08 / USR-09) para avançar o pipeline |
| **Blueprint** | Documento YAML normativo que define arquitetura, convenções e regras de conformidade de uma stack tecnológica; associado a um ou mais projetos |
| **BAR** | Business Analysis Record — artefato estruturado de análise negocial produzido pelo DOM-02 |
| **UC** | Use Case — caso de uso modelado com fluxo principal, alternativo e regras de negócio associadas |
| **RN** | Regra de Negócio — restrição ou invariante de domínio catalogada com FE determinístico obrigatório |
| **FE** | Fluxo de Exceção — comportamento esperado do sistema quando uma RN é violada |
| **T0–T3** | Classificação de impacto de uma demanda: T0 (trivial/autônomo) → T3 (crítico/totalmente assistido) |
| **DecisionRecord** | JSON append-only emitido por cada agente a cada decisão; compõe o audit ledger imutável do pipeline; isolado por projeto/tenant |
| **confidence_score** | Valor 0.0–1.0 que representa a confiança do agente em uma decisão; < 0.65 obriga escalada humana |
| **DOM-0N** | Identificador de um agente da fábrica (ex: DOM-01 = Discovery, DOM-02 = Requirements, DOM-04 = Dev) |
| **Gate Keeper** | Papel de squad responsável por aprovar ou rejeitar um gate com base nos artefatos produzidos pelos agentes |
| **deep-ion-agents** | Subprojeto que contém as implementações dos agentes Python conformes ao blueprint `python-agent-first` |
| **SSO** | Single Sign-On — protocolo de autenticação centralizada que permite ao usuário acessar a plataforma com uma única identidade; implementado via Keycloak |
| **Keycloak** | Servidor de identidade e acesso open-source usado como provider de SSO da plataforma deep-ion; gerencia autenticação e autorização de tenants e usuários |
| **Provedor de IA (AI Provider)** | Serviço externo de LLM configurado pelo próprio tenant (ex: OpenAI, Azure OpenAI, GitHub Copilot); o tenant usa sua própria conta e arca com os custos diretamente |
| **MCP Server** | Instância de servidor que implementa o Model Context Protocol; na plataforma deep-ion, é o barramento de comunicação e orquestração entre todos os agentes do pipeline |
| **Model Context Protocol (MCP)** | Protocolo aberto para comunicação entre agentes de IA e ferramentas/serviços; adotado como barramento interno de orquestração da plataforma deep-ion |
| **Orquestração Interna** | Camada da plataforma deep-ion responsável por coordenar todos os agentes do pipeline (DOM-01 a DOM-05b) via MCP Servers, sem dependência de GitHub Actions |
| **Fábrica de Software Autônoma** | Modelo operacional onde agentes de IA executam papéis de engenharia de software sob supervisão humana nos gates, dentro de um projeto de um tenant |

---

## Questões em Aberto

<!-- STATUS: FINAL — todas as questões respondidas. Ciclo 3 concluído. -->

- [x] QV-01: Qual é o nome oficial do produto / marca que será comunicado externamente? O slug `deep-ion` é técnico — existe uma marca de produto ou continuará como nome técnico? — Impacto: Seções 1 (Identificação), 2 (Declaração da Visão), 13 (Glossário)
  > **Resposta:** Manter o nome deep-ion; domínio `deepion.net` já registrado. O nome técnico é também o nome de marca. *(respondida em 2026-03-02)*

- [x] QV-02: Existe prazo definido para a entrega da v1.0 do pipeline completo (DOM-01 → Gate 4 operacional)? — Impacto: Seção 10 (KPIs / Prazo) e priorização MoSCoW da Seção 6
  > **Resposta:** Marco 1 (DOM-01, DOM-02, DOM-03) em 2 meses (Mai/2026); pipeline completo em 6 meses (Set/2026). *(respondida em 2026-03-02)*

- [x] QV-03: O responsável (STK-01) tem expectativa de que o projeto seja aberto (open-source público) desde o início, ou há um período de desenvolvimento privado antes da abertura? — Impacto: Seção 4 (Stakeholders — STK-04), Seção 9 (Restrições), Seção 11 (RNE-03)
  > **Resposta:** Projeto privado, sem licença open-source. *(respondida em 2026-03-02)*

- [x] QV-04: O `fintech-pessoal` é o único projeto-alvo previsto para v1, ou há outros projetos-alvo já identificados que devem ser suportados pelo pipeline na v1? — Impacto: Seções 6 (Escopo), 7 (Fora do Escopo), 9 (Restrições Técnicas)
  > **Resposta:** Retirar referência a `fintech-pessoal`. O deep-ion é uma plataforma multi-tenant: cada cliente (tenant) pode cadastrar vários projetos. A plataforma gerencia múltiplos clientes e projetos simultaneamente. *(respondida em 2026-03-02)*

- [x] QV-05: O frontend de monitoramento (F-12 — painel de controle da fábrica) já existe como o projeto em `frontend/`? — Impacto: Seção 6 (prioridade de F-12)
  > **Resposta:** Existe apenas o esqueleto inicial em `frontend/`; está em estágio inicial de desenvolvimento. *(respondida em 2026-03-02)*

- [x] QV-06: Existe uma definição de "squad mínimo" para operar a fábrica? Ou o modelo prevê operação solo? — Impacto: Seção 5 (Perfis de Usuário), Seção 10 (KPIs de adoção)
  > **Resposta:** O cadastro de projetos contemplará a squad, podendo ser Solo (1 pessoa acumula todos os papéis) ou multi-pessoa. Cada ator terá seus papéis definidos por projeto. *(respondida em 2026-03-02)*

- [x] QV-07: Há restrições orçamentárias para uso de APIs pagas de LLM (OpenAI como fallback)? Existe um budget mensal definido? — Impacto: Seção 9 (Restrições de Negócio), Seção 11 (RNE-01)
  > **Resposta:** O deep-ion **não** controla nem monitora o budget de LLM dos tenants. Cada tenant utiliza sua própria conta no provedor de IA escolhido e é responsável pelo controle de gastos diretamente no provedor. *(respondida em 2026-03-02 — decisão consolidada pela resposta de QV-10)*

### Novas Questões — Ciclo 1

- [x] QV-08: O modelo de negócio da plataforma (deepion.net) prevê cobrança por tenant? Se sim, qual a granularidade: por projeto ativo, por agente executado, por demanda processada ou assinatura fixa mensal? — Impacto: Seção 3 (Objetivo Estratégico — modelo SaaS), Seção 10 (KPIs de negócio)
  > **Resposta:** Sim, cobrança por tenant. Parâmetros: quantidade de usuários, número de projetos e tamanho dos projetos. *(respondida em 2026-03-02)*

- [x] QV-09: O acesso à plataforma (deepion.net) será via identidade GitHub (OAuth) ou a plataforma terá seu próprio sistema de autenticação (email/senha, SSO)? — Impacto: Seção 6 (F-01 — gestão de tenants), Seção 9 (Restrições técnicas de segurança), Seção 13 (Glossário)
  > **Resposta:** SSO via Keycloak. *(respondida em 2026-03-02)*

- [x] QV-10: O controle de budget de LLM (QV-07) será global por tenant ou granular por projeto? Existe um valor de referência inicial (ex: R$ X/mês por projeto) para dimensionar os alertas? — Impacto: Seção 9 (Restrições de Negócio), Seção 10 (KPI de custo), Seção 11 (RNE-01)
  > **Resposta:** As configurações de LLM ficam no provedor de IA que o tenant cadastrar; o tenant utiliza a própria conta no provedor. O deep-ion não realiza esse controle. *(respondida em 2026-03-02)*

### Novas Questões — Ciclo 1 (Refinamento dos Stakeholders STK-06/07/08)

- [x] QV-13: Os papéis STK-06 (Analista de Negócios), STK-07 (Analista de Requisitos) e STK-08 (Analista de UX) representam **papéis de agentes de IA da plataforma**, **perfis humanos de membros de squad do tenant**, ou **ambos simultaneamente**? — Impacto: Seção 4 (Stakeholders — diferenciação agente vs. humano), Seção 5 (Usuários-Alvo — inclusão ou não de novos perfis USR-07/08/09)
  > **Resposta:** Perfis humanos — são membros de squad do tenant, não agentes de IA. Adicionados USR-07, USR-08 e USR-09 na Seção 5; descrições de STK-06/07/08 atualizadas para explicitar o papel humano. *(respondida em 2026-03-03)*

- [x] QV-14: Os novos papéis STK-06, STK-07 e STK-08 devem ser adicionados como papéis configuráveis na squad de um projeto (junto com PO, Arquiteto, Dev, QA, Gate Keeper já previstos em F-03)? — Impacto: Seção 6 (F-03 — gestão de squads por projeto), Seção 9 (Restrições — papéis habilitados por gate)
  > **Resposta:** Sim. F-03 atualizado para incluir Analista de Negócios, Analista de Requisitos e Analista de UX como papéis configuráveis. *(respondida em 2026-03-03)*

- [x] QV-15: O papel de Analista de UX (STK-08) está vinculado à funcionalidade F-20 (geração de protótipos UX), atualmente classificada como "Could" no Marco 2. Dado que agora há um stakeholder dedicado a essa função, a prioridade de F-20 deve ser elevada para "Should"? — Impacto: Seção 6 (F-20 — prioridade MoSCoW), Seção 3 (Roadmap de Alto Nível)
  > **Resposta:** Não elevar. O Analista de UX (STK-08) tem a função de **aprovar** os protótipos de UX gerados pela plataforma, não de gerá-los. F-20 permanece como "Could". STK-08 e USR-09 atualizados para refletir o papel de aprovação/Gate Keeper. *(respondida em 2026-03-03)*

### Novas Questões — Ciclo 2 (Re-análise pós QV-13/14/15)

- [x] QV-16: A aprovação de protótipos de UX pelo Analista de UX (STK-08) será formalizada como um **gate nomeado no pipeline** (ex.: "Gate UX" entre a geração do protótipo e o Gate 2), ou será uma etapa informal de revisão sem bloqueio do pipeline? — Impacto: Seção 6 (F-06 — pipeline de agentes, possível gate adicional), Seção 13 (Glossário — novo gate se formalizado)
  > **Resposta:** Gate formal no pipeline. Quando F-20 está habilitado no projeto, o Gate UX é inserido após a geração do protótipo e antes de DOM-05a, bloqueando o avanço até a aprovação explícita do Analista de UX. F-06 e Glossário atualizados. *(respondida em 2026-03-03)*

### Novas Questões — Ciclo 2

- [x] QV-11: A orquestração interna da plataforma (DOM-01, DOM-02, DOM-03) substituirá totalmente o GitHub Actions para esses agentes, ou o GitHub Actions permanece como alternativa/fallback? Está previsto migrar DOM-04, DOM-05a e DOM-05b para orquestração interna também em algum marco futuro? — Impacto: Seção 6 (F-06, F-11, F-12), Seção 8 (Premissas e Dependências), Seção 9 (Restrições Técnicas), Seção 3 (Roadmap)
  > **Resposta:** A orquestração será somente interna para todo o pipeline — GitHub Actions não será usado para nenhum agente. *(respondida em 2026-03-02)*

- [x] QV-12: Com DOM-01/02/03 orquestrados internamente à plataforma (sem GitHub Actions), qual é o mecanismo de comunicação entre esses agentes dentro da plataforma? GitHub Issues/PRs permanecem como barramento para esses agentes, ou haverá um barramento/estado interno à plataforma deep-ion? — Impacto: Seção 8 (Dependências Externas), Seção 9 (Restrições técnicas — barramento de mensagens), Seção 13 (Glossário)
  > **Resposta:** Utilização de MCP Servers (Model Context Protocol) como barramento de comunicação entre todos os agentes dentro da plataforma. *(respondida em 2026-03-02)*

---

## Histórico de Revisões

| Versão | Data | Tipo | Descrição | Responsável |
|--------|------|------|-----------|-------------|
| 1 | 2026-03-02 | CRIAÇÃO | Documento de Visão inicial — status DRAFT | GitHub Copilot (Analista de Negócios) |
| 2 | 2026-03-02 | REFINAMENTO | Ciclo 1. Questões respondidas: QV-01, QV-02, QV-03, QV-04, QV-05, QV-06, QV-07. Novas questões geradas: QV-08, QV-09, QV-10. Questões ainda abertas: QV-08, QV-09, QV-10. Impactos principais: adoção de modelo multi-tenant SaaS (QV-04), roadmap Mai/Set 2026 (QV-02), projeto privado (QV-03), gestão de squads por projeto (QV-06), controle de budget LLM (QV-07), deepion.net confirmado (QV-01). | GitHub Copilot (Analista de Negócios) |
| 3 | 2026-03-02 | REFINAMENTO | Ciclo 2. Questões respondidas: QV-08, QV-09, QV-10. Decisão de orquestração interna para DOM-01/02/03 incorporada (sem GitHub Actions). Novas questões geradas: QV-11, QV-12. Questões ainda abertas: QV-11, QV-12. Impactos principais: modelo de cobrança por tenant com parâmetros usuários/projetos/tamanho (QV-08), SSO via Keycloak (QV-09), LLM gerenciado pelo tenant no próprio provedor (QV-10), atualização de Seções 3, 6, 8, 9, 10, 11 e 13. | GitHub Copilot (Analista de Negócios) |
| 4 | 2026-03-02 | FINALIZAÇÃO | Todas as questões respondidas. Ciclo 3 — limite de refinamentos atingido. Questões respondidas: QV-11, QV-12. Decisão arquitetural central: orquestração 100% interna para todo o pipeline (nenhum agente usa GitHub Actions); barramento de comunicação inter-agente via MCP Servers. Impactos principais: Seções 2, 4, 6, 8, 9, 10, 12 e 13 atualizadas. Status alterado para FINAL. | GitHub Copilot (Analista de Negócios) |
| 5 | 2026-03-03 | REFINAMENTO | Ciclo 1. Re-análise do documento após adição dos stakeholders STK-06 (Analista de Negócios), STK-07 (Analista de Requisitos) e STK-08 (Analista de UX). Nenhuma questão respondida neste ciclo. Novas questões geradas: QV-13, QV-14, QV-15. Questões ainda abertas: QV-13, QV-14, QV-15. Impacto identificado nas Seções 4, 5, 6 e 9. Status mantido como DRAFT. | GitHub Copilot (Analista de Negócios) |
| 6 | 2026-03-03 | REFINAMENTO | Ciclo 2. Questões respondidas: QV-13, QV-14, QV-15. STK-06/07/08 confirmados como perfis humanos de squad; USR-07/08/09 adicionados à Seção 5; F-03 atualizado com novos papéis configuráveis; STK-08 e USR-09 redefinidos como Gate Keeper de aprovação de protótipos (não gerador). F-20 permanece "Could". Nova questão gerada: QV-16. Questões ainda abertas: QV-16. Seções atualizadas: 1, 4, 5, 6. Status mantido como DRAFT. | GitHub Copilot (Analista de Negócios) |
| 7 | 2026-03-03 | FINALIZAÇÃO | Ciclo 3 — limite de refinamentos atingido. Questão respondida: QV-16. Gate UX formalizado no pipeline como gate opcional (ativado quando F-20 está habilitado), posicionado entre a geração do protótipo e DOM-05a, com aprovação pelo Analista de UX. Seções atualizadas: 1, 6 (F-06), 13 (Glossário — Gate UX adicionado). Todas as questões respondidas. Status alterado para FINAL. | GitHub Copilot (Analista de Negócios) |
