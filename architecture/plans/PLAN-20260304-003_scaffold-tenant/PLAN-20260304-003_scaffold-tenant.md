# Plano de Execução — Scaffold: tenant

**Blueprint:** modulith-api-first v1.0  
**Classificação de Impacto:** T0  
**Data:** 2026-03-04  
**Agente alvo:** —

---

## Contexto

Criação do módulo `tenant` do zero, seguindo o padrão API-First com OpenAPI, Spring Modulith e MapStruct. O módulo implementa o provisionamento e gestão de tenants da plataforma deep-ion (multitenancy SaaS — infraestrutura compartilhada), conforme regras de negócio RN-001..RN-012 documentadas em `docs/business/tenants/tenants-regras.md`. Nenhum código base preexistente — scaffold completo de diretórios, contratos, camadas e testes.

---

## Variáveis Resolvidas

| Variável        | Valor resolvido                 |
|-----------------|---------------------------------|
| `basePackage`   | `net.deepion`                   |
| `moduleName`    | `tenant`                        |
| `ModuleName`    | `Tenant`                        |
| `apiPackage`    | `net.deepion.tenant.api`        |
| `modelPackage`  | `net.deepion.tenant.model`      |
| `configPackage` | `net.deepion.config`            |

---

## Estrutura de Diretórios e Arquivos

```
tenant/
├── pom.xml                                              ← aggregator (parent Maven)
│
├── tenant-contracts/                                    ← contrato OpenAPI (módulo Maven independente)
│   ├── pom.xml                                          ← openapi-generator plugin configurado
│   └── src/
│       └── main/
│           └── resources/
│               └── openapi/
│                   └── tenant.yaml                      ← spec OpenAPI 3.1 (único por módulo)
│
└── tenant-core/                                         ← Spring Modulith (depende de tenant-contracts)
    ├── pom.xml
    └── src/
        ├── main/
        │   ├── java/
        │   │   └── net/deepion/
        │   │       ├── config/                          ← configuração global (nunca depende de módulos)
        │   │       │   ├── SecurityConfig.java           ← SecurityFilterChain único, JWT/JWKs, stateless
        │   │       │   ├── OpenApiConfig.java            ← SecurityScheme global OpenAPI (oauth2 PKCE)
        │   │       │   └── properties/
        │   │       │       └── TenantProperties.java     ← @ConfigurationProperties + @Validated + @Data
        │   │       └── tenant/                           ← módulo Spring Modulith
        │   │           ├── package-info.java              ← @ApplicationModule
        │   │           ├── api/
        │   │           │   └── TenantController.java      ← implements TenantApi (gerada); @RestController @RequiredArgsConstructor
        │   │           ├── application/
        │   │           │   └── TenantService.java         ← @Service @RequiredArgsConstructor; use cases (UC-001..UC-005)
        │   │           ├── domain/
        │   │           │   ├── Tenant.java                ← @Data; sem JPA; sem infra deps
        │   │           │   ├── TenantStatus.java          ← enum: ATIVO, INATIVO
        │   │           │   ├── TenantRepository.java      ← interface (port); sem anotações Spring
        │   │           │   └── SlugGenerator.java         ← serviço de domínio para RN-003 (slug normalização)
        │   │           ├── infrastructure/
        │   │           │   ├── TenantJpaEntity.java       ← @Entity @Getter @Setter @NoArgsConstructor
        │   │           │   ├── JpaTenantRepository.java   ← @Repository; implements TenantRepository
        │   │           │   └── KeycloakTenantGateway.java ← integração Keycloak (RN-004, RN-006); interface de domínio + impl infra
        │   │           └── mapper/
        │   │               └── TenantMapper.java          ← @Mapper(componentModel="spring"); MapStruct
        │   └── resources/
        │       ├── application.yml                        ← sem valores hardcoded; refs a env/properties
        │       └── i18n/
        │           ├── messages_pt_BR.properties          ← locale padrão; msgs de RN-002, RN-008
        │           └── messages_en.properties
        └── test/
            └── java/
                └── net/deepion/
                    └── tenant/
                        ├── TenantModulithTest.java                    ← ApplicationModuleTest (obrigatório)
                        ├── api/
                        │   └── TenantControllerTest.java              ← @WebMvcTest
                        ├── application/
                        │   └── TenantServiceTest.java                 ← @ExtendWith(MockitoExtension)
                        ├── domain/
                        │   ├── TenantTest.java                        ← regras de domínio RN-001..RN-003
                        │   └── SlugGeneratorTest.java                 ← cobertura 100% da normalização RN-003
                        └── infrastructure/
                            └── JpaTenantRepositoryTest.java           ← @DataJpaTest com H2
```

---

## Tarefas

| #  | Tarefa                                                              | Agente     | Depende de | Paralelo com | Modelo          | Justificativa                                        |
|----|---------------------------------------------------------------------|------------|------------|--------------|-----------------|------------------------------------------------------|
| 1  | Criar estrutura de diretórios (ambos os módulos Maven)              | DOM-03/Dev | —          | #2           | GPT-4o          | Tarefa estrutural sem lógica                         |
| 2  | Gerar `pom.xml` aggregator + `tenant-contracts/pom.xml`             | DOM-03/Dev | —          | #1           | GPT-4o          | Configuração Maven + openapi-generator plugin        |
| 3  | Gerar `tenant.yaml` (spec OpenAPI 3.1)                              | DOM-03/Dev | #1, #2     | —            | GPT-5.1-Codex   | Contrato de interface; define toda a API surface     |
| 4  | Gerar `tenant-core/pom.xml`                                         | DOM-03/Dev | #2         | #3           | GPT-4o          | Depende de tenant-contracts; declara deps Spring     |
| 5  | Gerar `package-info.java` + domínio (`Tenant`, `TenantStatus`, `TenantRepository`, `SlugGenerator`) | DOM-03/Dev | #1, #3 | #6 | GPT-5.1-Codex | Entidade pura + RN-001/003; cobertura domain=100%  |
| 6  | Gerar `application/TenantService.java`                              | DOM-03/Dev | #1, #3     | #5           | GPT-5.1-Codex   | Use cases UC-001..UC-005; orquestra domínio e infra  |
| 7  | Gerar `api/TenantController.java`                                   | DOM-03/Dev | #3, #6     | —            | GPT-5.1-Codex   | Implementa interface gerada; @PreAuthorize ROLE_ROOT  |
| 8  | Gerar `infrastructure/TenantJpaEntity.java` + `JpaTenantRepository` | DOM-03/Dev | #5         | #9, #10      | GPT-5.1-Codex   | @Entity com `tenantId` indexado (RN-005); implements port |
| 9  | Gerar `infrastructure/KeycloakTenantGateway.java`                   | DOM-03/Dev | #5         | #8           | GPT-5.1-Codex   | Integração Keycloak: provisionar realm, invalidar sessões (RN-004, RN-006) |
| 10 | Gerar `mapper/TenantMapper.java`                                    | DOM-03/Dev | #5, #3     | #8           | GPT-5.1-Codex   | MapStruct DTO↔Domain↔JpaEntity                      |
| 11 | Gerar `config/` (SecurityConfig + OpenApiConfig + TenantProperties) | DOM-03/Dev | #4         | #5, #6       | GPT-5.1-Codex   | SecurityFilterChain + JWT claims `tenant_id` + `papel`|
| 12 | Gerar `application.yml` + `i18n/` properties                        | DOM-03/Dev | #1         | #5           | GPT-4o          | Externalização de config e mensagens (RN-002, RN-008) |
| 13 | Gerar suite de testes (ModulithTest + unit + infra)                  | DOM-03/Dev | #5..#11    | —            | GPT-5.1-Codex   | Espelha estrutura src/; domain=100%, geral≥80%       |
| 14 | Verificar conformidade do blueprint                                  | DOM-05b    | #1..#13    | —            | Claude Opus 4.6 | Auditoria multi-critério pós-scaffold                |

---

## Contratos de Interface (descrever — executor cria o código)

### `TenantController` — implementação da interface gerada

```
Anotações:      @RestController, @RequiredArgsConstructor
                @PreAuthorize("hasRole('ROLE_ADMIN')") em operações de escrita
                @PreAuthorize("hasRole('ROLE_ROOT')") como fallback padrão (sem autorização declarada)
Implementa:     TenantApi (gerada em target/generated-sources/openapi)
Dependências:   TenantService (injeção via construtor)
Responsabilidade: Delegar imediatamente ao TenantService; sem lógica de negócio; retornar ResponseEntity<T>
```

### `TenantService` — camada de use cases

```
Anotações:      @Service, @RequiredArgsConstructor, @Transactional (métodos de escrita)
Dependências:   TenantRepository (port — interface de domínio, não JPA)
                TenantMapper
                KeycloakTenantGateway (port — interface de domínio)
Use cases:
  - UC-001: listagem paginada (20 registros/página — RN-012); retorna Page<TenantResponse>
  - UC-002: provisionamento (gerar ULID — RN-001; gerar slug — RN-003; unicidade — RN-002; configurar Keycloak — RN-004)
  - UC-003: desativação (requerer confirmação prévia no controller — RN-008; invalidar sessões Keycloak — RN-006)
  - UC-004: reativação (toggle em tela de detalhe — RN-007)
  - UC-005: consulta de detalhe (slug e tenantId readonly — RN-001/002; membrosAtivos computado — RN-012)
Restrição:      Nunca retornar TenantJpaEntity; nunca expor lógica Keycloak ao controller
```

### `Tenant` — domain model

```
Anotações:      @Data (Lombok)
Restrições:     Sem @Entity, sem anotações Spring, sem infra deps
Campos:
  String tenantId      // ULID — gerado internamente, imutável (RN-001)
  String name          // max 100 chars
  String slug          // max 50 chars, único, imutável após criação (RN-002)
  TenantStatus status  // ATIVO | INATIVO
  LocalDateTime criadoEm
```

### `TenantStatus` — enum de domínio

```
Valores:        ATIVO, INATIVO
Restrição:      Usado apenas na camada domain; JpaEntity mapeia para coluna STATUS VARCHAR(10)
```

### `SlugGenerator` — serviço de domínio (RN-003)

```
Método:         String generate(String name)
Algoritmo:      lowercase → substituir espaços e especiais por hífens → remover não alfanumérico (exceto hífen)
                → colapsar hífens consecutivos → validar ao menos 1 char alfanumérico
Restrição:      Classe sem estado (stateless); sem anotações Spring; 100% testável sem contexto
```

### `TenantJpaEntity` — entidade JPA

```
Anotações:      @Entity, @Table(name="tenants"), @Getter, @Setter, @NoArgsConstructor
Restrições:     SEM @Data; equals/hashCode NÃO gerados automaticamente; sem lógica de negócio
Campos:
  @Id @GeneratedValue(strategy=IDENTITY) Long id
  @Column(unique=true, nullable=false) String tenantId    // ULID — RN-001
  @Column(nullable=false, length=100) String name
  @Column(unique=true, nullable=false, length=50) String slug  // RN-002
  @Enumerated(EnumType.STRING) TenantStatus status
  @Column(nullable=false) LocalDateTime criadoEm
Índices:        INDEX(tenant_id), INDEX(slug) — RN-005
```

### `TenantRepository` — port (interface de domínio)

```
Assinatura:     public interface TenantRepository
Métodos base:
  Optional<Tenant> findByTenantId(String tenantId)
  Optional<Tenant> findBySlug(String slug)
  boolean existsBySlug(String slug)                      // RN-002
  Page<Tenant> findAll(Pageable pageable)                // RN-012 — 20/página
  Tenant save(Tenant tenant)
Restrição:      Sem extends JpaRepository; sem anotações Spring; domínio puro
```

### `KeycloakTenantGateway` — port de integração Keycloak

```
Interface (domínio):  public interface KeycloakTenantGateway
Métodos:
  void provisionTenant(String tenantId, String adminEmail, String adminName)  // RN-004
  void invalidateAllSessions(String tenantId)                                  // RN-006
Implementação (infra): KeycloakTenantGatewayImpl — Keycloak Admin Client; falhas devem lançar TenantProvisioningException
Restrição:      Nenhum detalhe Keycloak vaza para domain ou application layer
```

### `TenantMapper` — MapStruct

```
Anotações:      @Mapper(componentModel = "spring")
Métodos:
  Tenant toDomain(TenantRequest request)
  TenantResponse toResponse(Tenant domain)
  TenantSummaryResponse toSummary(Tenant domain)
  TenantJpaEntity toEntity(Tenant domain)
  Tenant toDomain(TenantJpaEntity entity)
Restrição:      Sem lógica manual; campos incompatíveis declarados via @Mapping explícito
                tenantId jamais mapeado de request → domain (gerado internamente — RN-001)
```

### `SecurityConfig` — configuração centralizada

```
Localização:    net.deepion.config.SecurityConfig
Anotações:      @Configuration, @EnableWebSecurity, @RequiredArgsConstructor
Regras:         SecurityFilterChain único; CSRF explícito (desabilitado para API stateless)
                JWT resource server via JWKs; validação de issuer e audience
                Claims custom extraídos: tenant_id (RN-001) e papel (RN-004) do JWT
                Role mapping a partir de realm_access.roles do token Keycloak
                Nenhum endpoint com permitAll()
```

### `tenant.yaml` — contrato OpenAPI 3.1

```
securitySchemes:  oauth2 Authorization Code + PKCE (S256); realm deepion
schemas obrigatórios:
  TenantRequest:         name (string, max 100), slug (string, max 50, optional — gerado se ausente)
  TenantResponse:        tenantId, name, slug, status, criadoEm, membrosAtivos
  TenantSummaryResponse: tenantId, name, slug, status, membrosAtivos
  Page<TenantSummaryResponse>: content[], totalElements, totalPages, number, size
paths e operations:
  GET  /tenants                → listagem paginada (UC-001; RN-012: size fixo 20)
  POST /tenants                → provisionamento (UC-002; RN-001/002/003/004)
  GET  /tenants/{tenantId}     → detalhe (UC-005)
  PUT  /tenants/{tenantId}/deactivate  → desativação (UC-003; RN-006/008)
  PUT  /tenants/{tenantId}/reactivate  → reativação (UC-004; RN-007)
security:           declarado em cada operação; nenhuma operação sem security
Geração:            interfaceOnly=true, useSpringBoot3=true, generateApiTests=false
Output:             target/generated-sources/openapi
```

---

## Dependências a Declarar no `pom.xml` (tenant-core)

**Runtime:**
```xml
<!-- Spring Modulith -->
org.springframework.modulith:spring-modulith-starter-core
org.springframework.modulith:spring-modulith-starter-jpa

<!-- Spring Boot -->
org.springframework.boot:spring-boot-starter-web
org.springframework.boot:spring-boot-starter-data-jpa
org.springframework.boot:spring-boot-starter-security
org.springframework.boot:spring-boot-starter-oauth2-resource-server
org.springframework.boot:spring-boot-starter-validation

<!-- MapStruct -->
org.mapstruct:mapstruct:1.5.5.Final

<!-- Lombok -->
org.projectlombok:lombok

<!-- Keycloak Admin Client (para KeycloakTenantGatewayImpl) -->
org.keycloak:keycloak-admin-client

<!-- ULID (para geração de tenantId — RN-001) -->
com.github.f4b6a3:ulid-creator
```

**Dev / Teste:**
```xml
org.springframework.boot:spring-boot-starter-test
org.springframework.modulith:spring-modulith-test        ← ModulithArchitectureTest
org.springframework.security:spring-security-test
com.h2database:h2 (scope=test)
org.mapstruct:mapstruct-processor:1.5.5.Final            ← annotation processor
org.projectlombok:lombok (annotationProcessorPaths)
```

> **Aviso:** `mapstruct-processor` e `lombok` devem ser declarados em `annotationProcessorPaths` do `maven-compiler-plugin`, **nunca** como dependências de escopo compile isoladas.

---

## Checklist de Conformidade pós-geração

O agente executor deve verificar cada item antes de abrir PR:

**Estrutura e Build**
- [ ] `tenant-contracts` e `tenant-core` são módulos Maven distintos com `pom.xml` próprio
- [ ] `tenant-contracts` não depende de `tenant-core` nem de outros módulos core
- [ ] `tenant-core` declara dependência em `tenant-contracts`
- [ ] Projeto compila com `mvn clean install -pl tenant-contracts,tenant-core`

**Contratos OpenAPI**
- [ ] Um único arquivo YAML em `src/main/resources/openapi/tenant.yaml`
- [ ] `openapi-generator` configurado em `tenant-contracts/pom.xml`
- [ ] `interfaceOnly=true`, `useSpringBoot3=true`, `generateApiTests=false`
- [ ] Código gerado em `target/generated-sources/openapi` (não commitado)
- [ ] Todas as operações declaram `security` explicitamente (nenhuma sem security — RN-011)
- [ ] 5 endpoints presentes: GET /tenants, POST /tenants, GET /tenants/{id}, PUT /tenants/{id}/deactivate, PUT /tenants/{id}/reactivate

**Spring Modulith**
- [ ] `package-info.java` com `@ApplicationModule` presente em `net.deepion.tenant`
- [ ] `TenantModulithTest` usa `ApplicationModuleTest` e passa sem violações
- [ ] Nenhuma dependência cross-module direta (usar eventos se necessário)

**Camadas (Clean Architecture)**
- [ ] `TenantController` não contém lógica de negócio — somente delegação
- [ ] `TenantService` nunca retorna `TenantJpaEntity`
- [ ] `domain/Tenant.java` sem `@Entity`, sem deps de infra ou Spring
- [ ] `TenantRepository` (interface de domínio) sem `extends JpaRepository`
- [ ] `JpaTenantRepository` implements `TenantRepository` com `@Repository`
- [ ] `KeycloakTenantGateway` é interface de domínio — implementação apenas em infra

**Regras de Negócio (domínio)**
- [ ] `tenantId` gerado como ULID internamente — nunca aceito de request (RN-001)
- [ ] `slug` validado por unicidade antes de persistir — `existsBySlug` invocado (RN-002)
- [ ] `SlugGenerator.generate()` aplica normalização completa conforme RN-003
- [ ] `SlugGenerator` valida ausência de chars alfanuméricos após normalização (QA-03 — mitigação)
- [ ] Listagem paginada com `size=20` fixo (RN-012); não aceita `size` maior que 20 via query param
- [ ] `membrosAtivos` conta apenas membros com `status_convite = ATIVO` (RN-012)

**Integração Keycloak**
- [ ] `KeycloakTenantGatewayImpl` configura mapper de claim `tenant_id` no provisionamento (RN-004)
- [ ] `KeycloakTenantGatewayImpl` invalida todas as sessões ao desativar (RN-006)
- [ ] Falha do Keycloak no provisionamento lança `TenantProvisioningException` (QA-02 — compensação documentada)
- [ ] Falha na invalidação de sessões é registrada + alerta gerado; operação não fica silenciosa

**Lombok**
- [ ] `Tenant` (domain) usa `@Data`
- [ ] `TenantJpaEntity` usa `@Getter @Setter @NoArgsConstructor` — **sem** `@Data`
- [ ] Todos os Spring components usam `@RequiredArgsConstructor` + campos `final`
- [ ] Nenhum `@Autowired` em campo

**MapStruct**
- [ ] `TenantMapper` usa `@Mapper(componentModel = "spring")`
- [ ] Cobre os 5 mapeamentos: Request→Domain, Domain→Response, Domain→SummaryResponse, Domain↔JpaEntity
- [ ] `tenantId` explicitamente ignorado no mapeamento Request→Domain (`@Mapping(target="tenantId", ignore=true)`)
- [ ] Nenhuma lógica de mapeamento manual

**Segurança**
- [ ] `SecurityConfig` está em `net.deepion.config` (não dentro do módulo feature)
- [ ] Um único `SecurityFilterChain` declarado
- [ ] JWT resource server configurado com JWKs, issuer e audience
- [ ] Claims `tenant_id` e `papel` mapeados do JWT para o contexto de autorização (RN-004/RN-011)
- [ ] Nenhum endpoint com `permitAll()`
- [ ] Desativação e reativação exigem `ROLE_ADMIN` declarado explicitamente

**i18n**
- [ ] `messages_pt_BR.properties` e `messages_en.properties` presentes
- [ ] Mensagem "Este slug já está em uso" externalizada (RN-002 — FE-01)
- [ ] Mensagem do modal de confirmação de desativação externalizada (RN-008)
- [ ] Nenhuma mensagem user-facing hardcoded em Java

**Configuração**
- [ ] `application.yml` sem valores hardcoded (passwords, URLs absolutas de produção)
- [ ] `TenantProperties` usa `@ConfigurationProperties` + `@Validated` + `@Data`
- [ ] URL do Keycloak Admin configurada via properties; sem hardcode

**Testes**
- [ ] `TenantModulithTest` passa: `ApplicationModuleTest` verifica estrutura Modulith
- [ ] `SlugGeneratorTest` cobre todos os casos do RN-003 + cenários de borda (QA-03)
- [ ] `TenantServiceTest` cobre todos os 5 use cases com Mockito (sem contexto Spring)
- [ ] `JpaTenantRepositoryTest` usa `@DataJpaTest` com H2; valida índices de `tenantId` e `slug`
- [ ] Cobertura da camada `domain/` ≥ 100%
- [ ] Cobertura geral ≥ 80%

---

## Riscos e Condições de Bloqueio

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Conflito de nome com pacote `net.deepion.tenant` já existente | BLOQUEANTE | Verificar workspace antes de executar |
| `SecurityFilterChain` duplicado se já existe config global de outro módulo | ALTO | Confirmar que apenas um bean existe no contexto; unificar em `net.deepion.config` |
| Versão incompatível de MapStruct com Lombok (annotation processors) | MÉDIO | Fixar versões; declarar na ordem correta em `annotationProcessorPaths` |
| `tenant.yaml` sem operações: geração de interface vazia não compila | MÉDIO | Incluir todos os 5 endpoints antes de gerar |
| QA-02 — Keycloak cria usuário, banco falha: rollback não definido | ALTO | Implementar compensação na `TenantService`; documentar em ADR antes de PR |
| QA-03 — Colisão de slug gerado: comportamento não definido | MÉDIO | Implementar `SlugGenerator` com sufixo numérico automático como default; abrir spike em ADR |
| Dependência `keycloak-admin-client` conflita com Spring Security OAuth2 | MÉDIO | Fixar versão compatível com a versão do Keycloak em uso; verificar BOM |

---

## Gates Necessários

- **Gate T0 (obrigatório):** Revisão humana funcional do scaffold completo antes de iniciar desenvolvimento de features.
- **Gate de contrato:** Aprovação do `tenant.yaml` (OpenAPI spec) por Product Owner ou Tech Lead antes de gerar código dependente.
- **Gate de ADR:** Resolução documentada de QA-02 (rollback Keycloak↔banco) e QA-03 (colisão de slug) antes de implementar UC-002 (provisionamento).

---

## Artefatos Esperados

| Agente     | Artefato                         | Caminho / Descrição                                            |
|------------|----------------------------------|----------------------------------------------------------------|
| DOM-03/Dev | Módulo Maven contracts           | `tenant/tenant-contracts/`                                     |
| DOM-03/Dev | Módulo Maven core                | `tenant/tenant-core/`                                          |
| DOM-03/Dev | Especificação OpenAPI 3.1        | `tenant/tenant-contracts/src/main/resources/openapi/tenant.yaml` |
| DOM-03/Dev | Domínio + regras RN-001..RN-012  | `net.deepion.tenant.domain.*`                                  |
| DOM-03/Dev | Camadas application + api + infra| `net.deepion.tenant.{application,api,infrastructure,mapper}.*` |
| DOM-03/Dev | Suite de testes                  | `tenant-core/src/test/` — cobertura domain=100%, geral≥80%     |
| DOM-05b    | Relatório de conformidade        | Checklist preenchido acima; bloqueios sinalizados como issues   |
