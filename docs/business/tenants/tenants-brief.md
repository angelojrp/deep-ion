---
status: FINAL
versão: 4
ciclo-refinamento: 3
data-criação: 2026-03-02
roadmap-id: RM-F01
---

# Brief de Descoberta — Gestão de Tenants

## 1. Contexto

- **Problema do usuário:** cada cliente (organização) que adotar a plataforma deep-ion precisa operar em uma área completamente independente dos demais, garantindo que seus projetos, agentes, artefatos e dados não se misturem com os de outros clientes. Atualmente não existe nenhuma separação multitenancy implementada.
- **Dor atual observável:** a plataforma está construída como uma instância única; adicionar um segundo cliente resultaria em colisão de dados, exposição cruzada de artefatos e impossibilidade de personalização de infraestrutura por cliente.
- **Impacto no contexto da plataforma:** sem isolamento de tenant, a deep-ion não pode ser comercializada como SaaS; cada implantação exigiria uma instância dedicada e gerenciada manualmente, inviabilizando escala.

## 2. Objetivo de negócio

- **Resultado esperado:** qualquer organização cliente (tenant) pode ser provisionada e ter acesso exclusivo à sua área na plataforma, com suporte opcional a infraestrutura dedicada ("infra exclusiva") para clientes enterprise.
- **KPI principal:** tempo de provisionamento de um novo tenant (do cadastro até o primeiro login SSO funcional).
- **Baseline atual:** não existe; provisionamento é manual e ad-hoc.
- **Meta alvo:** a definir após refinamento (referência inicial: < 15 minutos para tenant padrão em modo compartilhado).

## 3. Público e personas

- **Persona principal:** Administrador da plataforma deep-ion (equipe interna) que provisiona novos clientes; e Administrador de tenant (representante do cliente) que gerencia usuários e projetos dentro do seu espaço.
- **Segmento:** empresas de software (PMEs a enterprises) que adoptam a deep-ion como fábrica de software autônoma.
- **Necessidade principal:** área independente por cliente, com autenticação centralizada (SSO) e garantia de isolamento total de dados e recursos.

## 4. Escopo

### Inclui (MVP)

- Cadastro de tenant (nome, slug único) — infraestrutura compartilhada; sem tipo "dedicated" no MVP.
- Propagação do `tenant_id` **e do `papel`** no JWT emitido pelo Keycloak como claims customizados, garantindo identificação do tenant e do papel do usuário em cada requisição.
- Autorização fina controlada **exclusivamente no backend**, combinando os claims `tenant_id` + `papel` do JWT — sem isolamento de papéis no lado do Keycloak.
- Isolamento de dados via discriminador `tenant_id` em todas as tabelas da base de dados compartilhada (shared database, shared schema).
- Autenticação SSO via Keycloak: **realm único** para toda a plataforma; configuração de mapper de atributo de usuário (`tenant_id`) para propagação como claim customizado no JWT; configuração de client OAuth2, login/logout.
- Listagem e gerenciamento básico de tenants no frontend de controle (RM-F04).
- Papéis no Keycloak por tenant exclusivamente os 5 definidos no roadmap: PO, Arquiteto, Dev, QA, Gate Keeper — sem sub-papéis ou hierarquia adicional no MVP.

### Não inclui (fora de escopo do MVP)

- Infraestrutura dedicada por tenant (banco exclusivo, namespace Kubernetes isolado, VM dedicada) — pós-MVP.
- Self-service de cadastro de tenants pelo próprio cliente — provisionamento é sempre manual pelo admin da plataforma.
- Billing e controle de consumo por tenant.
- SSO com provedores externos (ex.: Azure AD, Okta) — apenas Keycloak próprio.
- Migração de dados entre tenants.
- Requisitos específicos de LGPD (segregação geográfica, retenção, direito ao esquecimento) — não aplicável neste escopo.
- Sub-papéis ou hierarquia de permissões além dos 5 papéis padrão.

## 5. Fluxo principal do usuário

1. Administrador da plataforma acessa o painel de controle e inicia o cadastro de um novo tenant (nome, slug).
2. O sistema provisiona o tenant no Keycloak (realm único da plataforma): cria usuário/grupo vinculado ao novo `tenant_id`, atribui o atributo de usuário `tenant_id` e garante que o mapper esteja configurado para incluir o claim no JWT.
3. O sistema registra o tenant na base de dados compartilhada — o `tenant_id` gerado passa a ser o discriminador de todas as entidades do tenant.
4. Administrador da plataforma envia convite ao Administrador do tenant com URL de acesso e credenciais iniciais.
5. Administrador do tenant realiza primeiro login via SSO (Keycloak), recebe JWT contendo `tenant_id` + `papel`, redefine senha e acessa seu painel isolado.
6. Administrador do tenant configura membros do squad (convite por e-mail com atribuição de um dos 5 papéis padrão).

## 6. Dependências e integrações

- **Integrações externas:** Keycloak (IdP — Identity Provider); infraestrutura de banco de dados (PostgreSQL ou equivalente); GitHub Organizations/Apps (para vinculação de projetos — ver RM-F02).
- **Dependências internas:**
  - RM-F02 (Gestão de projetos por tenant) — consome a entidade Tenant criada aqui.
  - RM-F03 (Gestão de squads) — depende de tenant e papéis Keycloak definidos aqui.
  - RM-F04 (Frontend de controle) — interface de gerenciamento de tenants é parte deste escopo.
  - RM-F09 (Agente de Arquitetura / DOM-03) — esqueleto de código gerado deverá incluir configuração de multitenancy na camada de dados do Spring Modulith.

## 7. Riscos e premissas

- **Riscos:**
  - R1: A configuração do claim customizado `tenant_id` no Keycloak deve ser validada em todos os fluxos de autenticação para garantir que nenhum token seja emitido sem o claim — falha aqui compromete o isolamento.
  - R2 *(resolvido — QA-04)*: Estratégia definida: discriminador `tenant_id` em base de dados compartilhada (shared database, shared schema).
  - R3 *(descartado)*: Risco de infra dedicada removido — MVP opera exclusivamente em modo compartilhado.
  - R4 *(encerrado — QA-06)*: Sem requisitos específicos de LGPD neste escopo.
  - R5: O `tenant_id` no banco de dados deve ser obrigatório e indexado em todas as tabelas — ausência ou inconsistência pode causar vazamento de dados entre tenants (data leak).
  - R6 *(resolvido — QA-07)*: Realm único definido — `tenant_id` é claim customizado via mapper de atributo de usuário no Keycloak.
  - R7 *(resolvido — QA-08)*: Autorização fina é responsabilidade exclusiva do backend via combinação `tenant_id` + `papel` no JWT — sem isolamento de roles no Keycloak.
  - Obs. arquitetural: o contrato exato dos claims `tenant_id` e `papel` no JWT (nomenclatura, formato, obrigatoriedade) deve ser formalizado no ADR de arquitetura (RM-F09) antes da implementação.
- **Premissas:**
  - P1: No MVP, todos os tenants rodam em infraestrutura compartilhada; modelo dedicado é pós-MVP.
  - P2: O Keycloak opera com **realm único** para toda a plataforma; `tenant_id` e `papel` são armazenados como atributos de usuário e mapeados como claims customizados no JWT.
  - P3: O backend da plataforma é Spring Modulith (Java) — padrão definido no blueprint `modulith-api-first.yaml`.
  - P4: O `tenant_id` é gerado no cadastro, propagado como claim customizado no JWT e usado como discriminador em **todas** as consultas ao banco de dados — sem exceções.
  - P5: A autorização é responsabilidade exclusiva do backend — o Keycloak fornece apenas autenticação e os claims; nenhuma verificação de papel é feita no lado do IdP.

---

## Questões em Aberto

<!-- STATUS: FINAL — todas as questões respondidas -->

- [x] QA-01: Qual o modelo de infraestrutura para o tipo "dedicated"? (ex.: schema separado no mesmo cluster, banco de dados exclusivo, namespace Kubernetes isolado, VM dedicada?) **Impacto:** define o roadmap de infra e o esforço de provisionamento.
  > **Resposta:** Inicialmente será usado `tenant_id` tanto na base de dados como no JWT para identificar o cliente — infraestrutura compartilhada; modelo dedicado é pós-MVP. *(respondida em 2026-03-02)*

- [x] QA-02: O Keycloak será uma instância única compartilhada (realm por tenant) ou cada tenant "dedicated" terá sua própria instância Keycloak? **Impacto:** altera arquitetura de autenticação e custo operacional.
  > **Resposta:** Keycloak compartilhado; o `tenant_id` é propagado no JWT para identificação do cliente. A estrutura exata de realms ainda requer definição — ver QA-07. *(respondida em 2026-03-02)*

- [x] QA-03: O provisionamento de tenant será sempre manual (admin da plataforma) no MVP, ou haverá algum fluxo de auto-cadastro? **Impacto:** escopo da tela de cadastro e automação de backend.
  > **Resposta:** Manual — o admin da plataforma realiza o provisionamento; sem auto-cadastro no MVP. *(respondida em 2026-03-02)*

- [x] QA-04: Qual a estratégia de isolamento de dados no banco de dados? (schema por tenant / banco separado / RLS com discriminador de tenant) **Impacto:** decisão arquitetural crítica — afeta todos os módulos de dados.
  > **Resposta:** Discriminador `tenant_id` tanto na base de dados como no JWT — shared database, shared schema com `tenant_id` como coluna discriminadora em todas as tabelas. *(respondida em 2026-03-02)*

- [x] QA-05: Quais são os papéis mínimos obrigatórios no Keycloak por tenant além dos 5 já listados no roadmap? Há sub-papéis ou hierarquia de permissões? **Impacto:** modelagem de autorização e telas de gestão de squad (RM-F03).
  > **Resposta:** Somente os 5 papéis mapeados no roadmap (PO, Arquiteto, Dev, QA, Gate Keeper) — sem sub-papéis ou hierarquia adicional no MVP. *(respondida em 2026-03-02)*

- [x] QA-06: Existem requisitos específicos de LGPD/privacidade para dados de tenants (ex.: localização geográfica, retenção, direito ao esquecimento)? **Impacto:** pode adicionar requisitos legais ao escopo e impactar arquitetura de armazenamento.
  > **Resposta:** Não — sem requisitos específicos de LGPD neste escopo. *(respondida em 2026-03-02)*

- [x] QA-07: Qual será a estrutura de realms no Keycloak — um realm único para toda a plataforma (com `tenant_id` como claim customizado) ou um realm por tenant (onde o realm identifica implicitamente o tenant)? **Impacto:** define a configuração de provisionamento do Keycloak, o contrato do JWT e como o backend valida o `tenant_id` no token.
  > **Resposta:** Realm único para toda a plataforma, com `tenant_id` como claim customizado no JWT. *(respondida em 2026-03-02)*

- [x] QA-08: Com realm único no Keycloak, como os 5 papéis de cada tenant serão isolados para evitar que um membro de tenant A acesse recursos de tenant B com um papel indevido? (ex.: grupos Keycloak por tenant com papéis scoped ao grupo, client roles por tenant, ou controle exclusivamente no backend via `tenant_id` + papel no JWT) **Impacto:** define a estratégia de autorização fina por tenant e o escopo das telas de gestão de squad (RM-F03).
  > **Resposta:** Controle exclusivamente no backend via combinação `tenant_id` + `papel` no JWT — sem isolação de roles no Keycloak. *(respondida em 2026-03-02)*

---

## Histórico

| Versão | Data | Tipo | Descrição | Responsável |
|--------|------|------|-----------|-------------|
| 1 | 2026-03-02 | CRIAÇÃO | Brief inicial gerado — status DRAFT | Copilot |
| 2 | 2026-03-02 | REFINAMENTO | Ciclo 1. Questões respondidas: QA-01, QA-02, QA-03, QA-04, QA-05, QA-06. Novas questões geradas: QA-07. Questões ainda abertas: QA-07. | Copilot |
| 3 | 2026-03-02 | REFINAMENTO | Ciclo 2. Questões respondidas: QA-07. Novas questões geradas: QA-08. Questões ainda abertas: QA-08. | Copilot |
| 4 | 2026-03-02 | FINALIZAÇÃO | Todas as questões respondidas. Status alterado para FINAL. | Copilot |
