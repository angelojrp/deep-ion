---
status: DRAFT
versão: 2
ciclo-refinamento: 1
data-criação: 2026-03-03
roadmap-id: RM-F02
---

# Brief de Descoberta — Gestão de Projetos por Tenant

## 1. Contexto

- **Problema do usuário:** um tenant provisionado na plataforma deep-ion precisa registrar e gerenciar seus projetos de software de forma independente — cada projeto com sua equipe, repositório de código, documentação e fornecedores de IA configurados. Hoje não existe essa camada de gestão de projetos dentro de um tenant.
- **Dor atual observável:** sem gestão de projetos, o pipeline de agentes não tem unidade de execução delimitada. É impossível vincular o repositório-alvo onde os agentes devem atuar, definir a equipe responsável ou configurar os provedores de IA utilizados.
- **Impacto no contexto da plataforma:** sem projetos, os agentes DOM-01 a DOM-05b não têm contexto de qual repositório acessar, qual equipe está envolvida nem quais fornecedores de IA utilizar — o pipeline completo do Marco 1 fica inoperante.

## 2. Objetivo de negócio

- **Resultado esperado:** um usuário com papel PO ou Administrador de tenant pode criar, configurar e gerenciar projetos dentro do seu tenant. Cada projeto reúne equipe, repositório de código, documentação e fornecedores de IA, tornando-se a unidade de execução do pipeline de agentes.
- **KPI principal:** tempo de criação e configuração de um projeto do zero até estar pronto para o primeiro ciclo de pipeline (do cadastro ao primeiro issue criado no repositório vinculado).
- **Baseline atual:** não existe; configuração de projeto é inexistente e feita de forma ad-hoc diretamente no código.
- **Meta alvo:** a definir após refinamento (referência inicial: < 5 minutos para criação completa de um projeto padrão).

## 3. Público e personas

- **Persona principal:** Product Owner (PO) do tenant — responsável por criar e configurar projetos, definir equipe e vincular repositórios.
- **Persona secundária:** Administrador do tenant — pode criar e arquivar projetos; gerencia configurações avançadas de integração (repositórios, fornecedores de IA).
- **Segmento:** equipes de desenvolvimento de software dentro de uma organização cliente (tenant) da plataforma deep-ion.
- **Necessidade principal:** área dedicada por projeto onde se defina a equipe, o repositório de código, a documentação e os fornecedores de IA para o pipeline de agentes.

## 4. Escopo

### Inclui (MVP)

- Cadastro de projeto com nome, descrição e identificador único dentro do tenant.
- Configuração da equipe do projeto com membros e papéis (um membro pode assumir múltiplos papéis).
- Configuração de repositório de código com suporte a múltiplos fornecedores (GitHub, GitLab, etc.) e opção de usar configuração global do tenant.
- Suporte a projetos multi-módulos (subpasta ou repositórios independentes).
- Configuração de documentação (embutida no repositório ou em repositório separado).
- Configuração de fornecedores de API de IA com suporte a múltiplos provedores.
- Listagem de projetos do tenant com status atual (ativo, aguardando configuração).
- Visualização dos detalhes de configuração de um projeto.
- Isolamento por tenant: um projeto pertence exclusivamente ao tenant que o criou.

### Não inclui (fora de escopo)

- Painel operacional de pipeline por projeto (RM-F05 — feature separada).
- Arquivamento e exclusão permanente de projetos (a definir em refinamento).
- Controle de orçamento de fornecedores de IA (gerenciado diretamente nos provedores).
- Integração com issue trackers além dos nativos de cada fornecedor de repositório.

## 5. Equipe do Projeto

Configuração dos membros e seus papéis dentro do projeto.

- **Seleção de membros:** escolher profissionais cadastrados no tenant para compor a equipe do projeto.
- **Atribuição de papéis:** cada membro pode assumir **um ou mais papéis** simultaneamente (ex.: um profissional pode ser PO e Arquiteto ao mesmo tempo).
- **Papéis disponíveis:** PO, Arquiteto, Tech Lead, Desenvolvedor, QA, DevOps, Analista de Negócios (lista extensível por tenant).
- **Validação:** o projeto deve ter ao menos um membro com papel PO ou Administrador atribuído.

## 6. Repositório

Configuração do repositório de código-fonte do projeto.

### 6.1 Fornecedor

- Permitir escolher entre vários fornecedores de repositório: **GitHub**, **GitLab**, **Bitbucket**, **Azure DevOps**, entre outros.

### 6.2 Configuração de conexão

- **Usar configuração global do tenant?**
  - **Sim** → Exibe a configuração global do tenant (token e informações sensíveis **mascaradas**).
  - **Não** → Abre o formulário de configuração de conexão específica para este projeto:
    - Fornecedor
    - URL do servidor (para instâncias self-hosted)
    - Token de acesso (armazenado de forma segura)

### 6.3 Projeto multi-módulos

- **O projeto possui múltiplos módulos?**
  - **Não** → Solicita o sufixo/caminho do repositório (ex.: `deep-ion/agents-ai`).
  - **Sim** → Define a estratégia de organização dos módulos:
    - **Subpasta** (monorepo) → Solicita o sufixo/caminho do repositório único (ex.: `deep-ion/agents-ai`). Todos os módulos residem em subpastas dentro do mesmo repositório.
    - **Repositórios independentes** → Informa que a configuração de repositório de cada módulo será realizada individualmente na seção **"Arquitetura"** do respectivo módulo.

## 7. Documentação

Configuração de onde a documentação do projeto será armazenada.

- **Documentação embutida no projeto?**
  - Esta opção está disponível **somente** quando o projeto utiliza um repositório único (mono-módulo ou multi-módulos em subpasta/monorepo).
  - Para projetos com repositórios independentes por módulo, a documentação exige um **repositório de documentação dedicado** (configurar fornecedor, URL e token de acesso).

> ⚠️ **Alerta de segurança:** ao optar por documentação embutida no repositório do projeto, **não é possível controlar o acesso de forma granular** — qualquer desenvolvedor com acesso ao repositório poderá visualizar e alterar a documentação diretamente. Se a documentação contiver informações sensíveis ou restritivas, recomenda-se utilizar um repositório de documentação separado com permissões independentes.

## 8. Fornecedores API IA

Configuração dos provedores de modelos de inteligência artificial utilizados pelo pipeline de agentes.

### 8.1 Configuração de conexão

- **Usar configuração global do tenant?**
  - **Sim** → Exibe os fornecedores configurados globalmente no tenant (API keys e informações sensíveis **mascaradas**).
  - **Não** → Abre o formulário para configuração específica deste projeto.

### 8.2 Seleção de fornecedores

- Permitir selecionar **múltiplos fornecedores** simultaneamente (ex.: OpenAI + Anthropic + Google).
- Para cada fornecedor selecionado, solicitar as informações de conexão:
  - Nome do fornecedor (ex.: OpenAI, Anthropic, Google AI, Azure OpenAI, AWS Bedrock)
  - URL do endpoint (quando aplicável, ex.: Azure OpenAI)
  - API Key / Token de acesso (armazenado de forma segura)
  - Modelo padrão preferido (ex.: `gpt-4o`, `claude-sonnet-4`, `gemini-2.0-flash`)
  - Limites de uso opcionais (tokens/min, requests/dia) — apenas para Rate Limiting interno

> ⚠️ **Aviso importante:** a plataforma deep-ion **não controla o orçamento financeiro** dos fornecedores de IA. O monitoramento e controle de custos de consumo de tokens/chamadas deve ser realizado **diretamente no painel do fornecedor** dos modelos LLM (ex.: painel da OpenAI, Console do Anthropic, etc.).

## 9. Fluxo principal do usuário

1. PO acessa o painel da plataforma autenticado via SSO no seu tenant (RM-F01).
2. Navega até a seção "Projetos" e aciona "Novo Projeto".
3. Preenche os dados básicos: nome, descrição e identificador (slug).
4. Configura a **equipe do projeto**: seleciona membros do tenant e atribui papéis (um membro pode ter vários papéis).
5. Configura o **repositório**: escolhe o fornecedor, decide se usa configuração global, define se é multi-módulos.
6. Configura a **documentação**: define se é embutida ou em repositório separado.
7. Configura os **fornecedores de API IA**: seleciona provedores e insere credenciais (ou usa configuração global).
8. A plataforma valida as conexões (repositório e fornecedores de IA) e confirma as vinculações.
9. O projeto é criado com status "ativo" e fica disponível como unidade de execução do pipeline.

## 10. Dependências e integrações

- **RM-F01 — Gestão de Tenants:** autenticação SSO e isolamento de dados por tenant devem estar operacionais. O projeto pertence a um tenant já provisionado. Configurações globais de repositório e fornecedores de IA são herdadas do tenant.
- **RM-F04 — Frontend de Controle:** o fluxo de criação e gestão de projetos é acessado via frontend (painel de controle da plataforma).
- **APIs de Fornecedores de Repositório:** GitHub API, GitLab API, Bitbucket API, etc. — necessárias para validar acesso ao repositório vinculado (write access, webhooks) e para que os agentes operem no repositório correto.
- **APIs de Fornecedores de IA:** OpenAI, Anthropic, Google AI, Azure OpenAI, AWS Bedrock, etc. — necessárias para que o pipeline de agentes execute prompts e gere artefatos.
- **RM-F06 — Pipeline orquestrado:** o projeto é a unidade que parametriza a execução do pipeline; sem projeto configurado, nenhum agente DOM pode ser acionado.

## 11. Riscos e premissas

- **Riscos:**
  - Gestão de credenciais de repositório por tenant/projeto: tokens podem expirar ou ser revogados; fluxo de renovação precisa ser definido.
  - Colisão de identificadores de projetos entre tenants (mitigado pelo isolamento por tenant, mas requer atenção na lógica de roteamento).
  - Repositório renomeado ou excluído pelo fornecedor quebra a vinculação sem aviso ao usuário.
  - Custos inesperados com fornecedores de IA: sem controle de orçamento na plataforma, um pipeline mal configurado pode gerar consumo elevado.
  - Múltiplos fornecedores de IA podem ter modelos de rate-limiting distintos, dificultando a orquestração de fallback.
  - Documentação embutida expõe conteúdo sensível a todos os colaboradores do repositório.

- **Premissas:**
  - A autenticação com fornecedores de repositório pode ser gerenciada no nível do tenant (configuração global) ou no nível do projeto.
  - A configuração de fornecedores de IA pode ser herdada do tenant ou customizada por projeto.
  - Somente usuários com papel PO ou Administrador dentro do tenant podem criar projetos.
  - Um membro da equipe pode assumir múltiplos papéis dentro do mesmo projeto.
  - O controle financeiro de consumo de IA é de responsabilidade do tenant, não da plataforma.

## Questões em Aberto

<!-- STATUS: DRAFT — brief permanece em rascunho até todas as questões serem respondidas ou finalização explícita pelo usuário -->

- [ ] QA-01: **Modelo de autenticação com repositórios** — a vinculação ao repositório usa OAuth App, GitHub App/GitLab App, ou PAT por tenant? Cada modelo tem implicações diferentes de permissões e revogação. *Impacto: define a arquitetura de integração e o fluxo de autorização no front.*
- [ ] QA-02: **Limite de projetos por tenant** — existe limite de projetos por tenant no MVP? Ou é ilimitado? *Impacto: requisito de pricing/planos e validações de cadastro.*
- [ ] QA-03: **Repositório renomeado/excluído** — como a plataforma detecta e notifica que o repositório vinculado não existe mais? Existe re-vinculação ou o projeto deve ser recriado? *Impacto: resiliência e experiência do usuário.*
- [ ] QA-04: **Projeto sem repositório** — é permitido criar um projeto sem vinculação a um repositório (ex.: para configurar a equipe primeiro e vincular o repo depois)? Ou a vinculação é obrigatória na criação? *Impacto: simplifica o fluxo de onboarding mas requer estado intermediário "aguardando repositório".*
- [ ] QA-05: **Fallback entre fornecedores de IA** — quando múltiplos fornecedores estão configurados, existe fallback automático em caso de indisponibilidade? Ou o pipeline falha e aguarda retry manual? *Impacto: resiliência do pipeline e experiência do usuário.*
- [ ] QA-06: **Papéis da equipe** — a lista de papéis disponíveis é fixa na plataforma ou extensível/customizável por tenant? *Impacto: flexibilidade de configuração e modelagem de dados.*
- [ ] QA-07: **Migração de fornecedor de repositório** — um projeto pode trocar de fornecedor de repositório (ex.: de GitHub para GitLab) após a criação? *Impacto: define mutabilidade das configurações e impacto nos agentes já configurados.*

## Histórico

| Versão | Data | Tipo | Descrição | Responsável |
|--------|------|------|-----------|-------------|
| 1 | 2026-03-03 | CRIAÇÃO | Brief inicial gerado — status DRAFT | Copilot |
| 2 | 2026-03-03 | REVISÃO | Removida seção Blueprint Arquitetural; adicionadas seções Equipe do Projeto, Repositório, Documentação e Fornecedores API IA | Copilot |
