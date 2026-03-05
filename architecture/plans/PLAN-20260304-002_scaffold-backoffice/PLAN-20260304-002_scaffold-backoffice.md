---
plan_id: PLAN-20260304-002
title: "Scaffold: backoffice"
classification: T0
created_at: "2026-03-04T00:00:00Z"
created_by: ""
status: CONCLUIDO
closed_at: "2026-03-04T12:00:00Z"
closed_by: "Copilot"
approval:
  approved_by: "Angelo Pereira"
  approved_at: "2026-03-04T00:00:00Z"
  rejection_reason: ""
linked_issue: ""
linked_pr: ""
---

# Plano de Execução — Scaffold: backoffice

**Blueprint:** modulith-api-first v1.0  
**Classificação de Impacto:** T0  
**Data:** 2026-03-04  
**Agente alvo:** —

---

## Contexto

Criação do módulo `backoffice` do zero, seguindo o padrão API-First com OpenAPI, Spring Modulith e MapStruct. Nenhum código base preexistente — scaffold completo de diretórios, contratos, camadas e testes.

---

## Variáveis Resolvidas

| Variável       | Valor resolvido               |
|----------------|-------------------------------|
| `basePackage`  | `net.deepion`                 |
| `moduleName`   | `backoffice`                  |
| `ModuleName`   | `Backoffice`                  |
| `apiPackage`   | `net.deepion.backoffice.api`  |
| `modelPackage` | `net.deepion.backoffice.model`|
| `configPackage`| `net.deepion.config`          |

---

## Estrutura de Diretórios e Arquivos

```
backoffice/
├── pom.xml                                          ← aggregator (parent Maven)
│
├── backoffice-contracts/                            ← contrato OpenAPI (módulo Maven independente)
│   ├── pom.xml                                      ← openapi-generator plugin configurado
│   └── src/
│       └── main/
│           └── resources/
│               └── openapi/
│                   └── backoffice.yaml              ← spec OpenAPI 3.1 (único por módulo)
│
└── backoffice-core/                                 ← Spring Modulith (depende de backoffice-contracts)
    ├── pom.xml
    └── src/
        ├── main/
        │   ├── java/
        │   │   └── net/deepion/
        │   │       ├── config/                      ← configuração global (nunca depende de módulos)
        │   │       │   ├── SecurityConfig.java       ← SecurityFilterChain único, JWT/JWKs, stateless
        │   │       │   ├── OpenApiConfig.java        ← SecurityScheme global OpenAPI
        │   │       │   └── properties/
        │   │       │       └── BackofficeProperties.java  ← @ConfigurationProperties + @Validated + @Data
        │   │       └── backoffice/                  ← módulo Spring Modulith
        │   │           ├── package-info.java         ← @ApplicationModule
        │   │           ├── api/
        │   │           │   └── BackofficeController.java   ← implements gerada interface; @RestController @RequiredArgsConstructor
        │   │           ├── application/
        │   │           │   └── BackofficeService.java      ← @Service @RequiredArgsConstructor; use cases
        │   │           ├── domain/
        │   │           │   ├── Backoffice.java              ← @Data; sem JPA; sem infra deps
        │   │           │   └── BackofficeRepository.java    ← interface (port); sem anotações Spring
        │   │           ├── infrastructure/
        │   │           │   ├── BackofficeJpaEntity.java     ← @Entity @Getter @Setter @NoArgsConstructor
        │   │           │   └── JpaBackofficeRepository.java ← @Repository; implements BackofficeRepository
        │   │           └── mapper/
        │   │               └── BackofficeMapper.java        ← @Mapper(componentModel="spring"); MapStruct
        │   └── resources/
        │       ├── application.yml                  ← sem valores hardcoded; refs a env/properties
        │       └── i18n/
        │           ├── messages_pt_BR.properties    ← locale padrão
        │           └── messages_en.properties
        └── test/
            └── java/
                └── net/deepion/
                    └── backoffice/
                        ├── BackofficeModulithTest.java        ← ModulithArchitectureTest (obrigatório)
                        ├── api/
                        │   └── BackofficeControllerTest.java  ← @WebMvcTest
                        ├── application/
                        │   └── BackofficeServiceTest.java     ← @ExtendWith(MockitoExtension)
                        └── infrastructure/
                            └── JpaBackofficeRepositoryTest.java ← @DataJpaTest
```

---

## Tarefas

| #  | Tarefa                                                      | Agente     | Depende de | Paralelo com | Modelo            | Justificativa                                  |
|----|-------------------------------------------------------------|------------|------------|--------------|-------------------|------------------------------------------------|
| 1  | Criar estrutura de diretórios (ambos os módulos Maven) ([PLAN-20260304-002_T01_criar-estrutura-de-diretorios-ambos-os-modulos-maven.md](tasks/PLAN-20260304-002_T01_criar-estrutura-de-diretorios-ambos-os-modulos-maven.md)) | DOM-03/Dev | —          | #2           | GPT-4o            | Tarefa estrutural sem lógica                   |
| 2  | Gerar `pom.xml` aggregator + `backoffice-contracts/pom.xml` ([PLAN-20260304-002_T02_gerar-pom-xml-aggregator-backoffice-contracts-pom-xml.md](tasks/PLAN-20260304-002_T02_gerar-pom-xml-aggregator-backoffice-contracts-pom-xml.md)) | DOM-03/Dev | —          | #1           | GPT-4o            | Configuração Maven + openapi-generator plugin  |
| 3  | Gerar `backoffice.yaml` (spec OpenAPI 3.1) ([PLAN-20260304-002_T03_gerar-backoffice-yaml-spec-openapi-3-1.md](tasks/PLAN-20260304-002_T03_gerar-backoffice-yaml-spec-openapi-3-1.md)) | DOM-03/Dev | #1, #2     | —            | GPT-5.1-Codex     | Contrato de interface; define API surface       |
| 4  | Gerar `backoffice-core/pom.xml` ([PLAN-20260304-002_T04_gerar-backoffice-core-pom-xml.md](tasks/PLAN-20260304-002_T04_gerar-backoffice-core-pom-xml.md)) | DOM-03/Dev | #2         | #3           | GPT-4o            | Depende de backoffice-contracts; deps Spring    |
| 5  | Gerar `package-info.java` + camada `domain/` ([PLAN-20260304-002_T05_gerar-package-info-java-camada-domain.md](tasks/PLAN-20260304-002_T05_gerar-package-info-java-camada-domain.md)) | DOM-03/Dev | #1, #3     | #6           | GPT-5.1-Codex     | Modelos Pydantic-equivalent (Lombok @Data)      |
| 6  | Gerar `application/BackofficeService.java` ([PLAN-20260304-002_T06_gerar-application-backoffice-service-java.md](tasks/PLAN-20260304-002_T06_gerar-application-backoffice-service-java.md)) | DOM-03/Dev | #1, #3     | #5           | GPT-5.1-Codex     | Use cases orquestrando domínio                 |
| 7  | Gerar `api/BackofficeController.java` ([PLAN-20260304-002_T07_gerar-api-backoffice-controller-java.md](tasks/PLAN-20260304-002_T07_gerar-api-backoffice-controller-java.md)) | DOM-03/Dev | #3, #6     | —            | GPT-5.1-Codex     | Implementa interface gerada pelo openapi-gen    |
| 8  | Gerar `infrastructure/` (JpaEntity + JpaRepository) ([PLAN-20260304-002_T08_gerar-infrastructure-jpa-entity-jpa-repository.md](tasks/PLAN-20260304-002_T08_gerar-infrastructure-jpa-entity-jpa-repository.md)) | DOM-03/Dev | #5         | #9           | GPT-5.1-Codex     | Persistência isolada do domínio                |
| 9  | Gerar `mapper/BackofficeMapper.java` ([PLAN-20260304-002_T09_gerar-mapper-backoffice-mapper-java.md](tasks/PLAN-20260304-002_T09_gerar-mapper-backoffice-mapper-java.md)) | DOM-03/Dev | #5, #3     | #8           | GPT-5.1-Codex     | MapStruct DTO↔Domain↔JpaEntity               |
| 10 | Gerar `config/` (SecurityConfig + BackofficeProperties) ([PLAN-20260304-002_T10_gerar-config-security-config-backoffice-properties.md](tasks/PLAN-20260304-002_T10_gerar-config-security-config-backoffice-properties.md)) | DOM-03/Dev | #4         | #5, #6       | GPT-5.1-Codex     | SecurityFilterChain + @ConfigurationProperties  |
| 11 | Gerar `application.yml` + `i18n/` properties ([PLAN-20260304-002_T11_gerar-application-yml-i18n-properties.md](tasks/PLAN-20260304-002_T11_gerar-application-yml-i18n-properties.md)) | DOM-03/Dev | #1         | #5           | GPT-4o            | Externalização de config e mensagens           |
| 12 | Gerar suite de testes (ModulithTest + unit + infra) ([PLAN-20260304-002_T12_gerar-suite-de-testes-modulith-test-unit-infra.md](tasks/PLAN-20260304-002_T12_gerar-suite-de-testes-modulith-test-unit-infra.md)) | DOM-03/Dev | #5..#10    | —            | GPT-5.1-Codex     | Espelha estrutura src/; coverage domain=100%   |
| 13 | Verificar conformidade do blueprint ([PLAN-20260304-002_T13_verificar-conformidade-do-blueprint.md](tasks/PLAN-20260304-002_T13_verificar-conformidade-do-blueprint.md)) | DOM-05b    | #1..#12    | —            | Claude Opus 4.6   | Auditoria multi-critério pós-scaffold           |

---

## Contratos de Interface (descrever — executor cria o código)

### `BackofficeController` — implementação da interface gerada

```
Anotações:      @RestController, @RequiredArgsConstructor, @PreAuthorize("hasRole('ROLE_ADMIN')")
Implementa:     BackofficeApi (gerada em target/generated-sources/openapi)
Dependências:   BackofficeService (injeção via construtor)
Responsabilidade: Delegar imediatamente ao service; sem lógica de negócio; retornar ResponseEntity<T>
```

### `BackofficeService` — use case layer

```
Anotações:      @Service, @RequiredArgsConstructor, @Transactional (métodos de escrita)
Dependências:   BackofficeRepository (port — domain interface, não JPA)
                BackofficeMapper
Responsabilidade: Orquestrar domain + infra; lançar exceções de domínio; nunca expor JpaEntity
```

### `Backoffice` — domain model

```
Anotações:      @Data (Lombok)
Restrições:     Sem @Entity, sem anotações Spring, sem infra deps
Campos base:    Long id; String name; (expandir conforme regras de negócio)
```

### `BackofficeJpaEntity` — entidade JPA

```
Anotações:      @Entity, @Table(name="backoffice"), @Getter, @Setter, @NoArgsConstructor
Restrições:     SEM @Data; equals/hashCode NÃO gerados automaticamente; sem lógica de negócio
Campos:         @Id @GeneratedValue(strategy=IDENTITY) Long id; String name;
```

### `BackofficeMapper` — MapStruct

```
Anotações:      @Mapper(componentModel = "spring")
Métodos:        Backoffice toDomain(BackofficeDto dto);
                BackofficeDto toDto(Backoffice domain);
                BackofficeJpaEntity toEntity(Backoffice domain);
                Backoffice toDomain(BackofficeJpaEntity entity);
Restrição:      Sem lógica manual; campos incompatíveis declarados via @Mapping explícito
```

### `BackofficeRepository` — port (domain interface)

```
Assinatura:     public interface BackofficeRepository
Métodos base:   Optional<Backoffice> findById(Long id);
                List<Backoffice> findAll();
                Backoffice save(Backoffice backoffice);
                void deleteById(Long id);
Restrição:      Sem extends JpaRepository; sem anotações Spring; domínio puro
```

### `SecurityConfig` — configuração centralizada

```
Localização:    net.deepion.config.SecurityConfig
Anotações:      @Configuration, @EnableWebSecurity, @RequiredArgsConstructor
Regras:         SecurityFilterChain único; CSRF explícito (desabilitado para API stateless)
                JWT resource server via JWKs; validação de issuer e audience
                Role mapping a partir de claims do token (realm_access.roles)
                Nenhum módulo feature define seu próprio SecurityFilterChain
```

### `backoffice.yaml` — contrato OpenAPI 3.1

```
Componentes obrigatórios:
  securitySchemes:  oauth2 Authorization Code + PKCE (S256)
  schemas:          BackofficeRequest, BackofficeResponse
  paths:            CRUD básico (/backoffice, /backoffice/{id})
  security:         declarado em cada operação (nenhuma operação sem security)
Geração:            interfaceOnly=true, useSpringBoot3=true, generateApiTests=false
Output:             target/generated-sources/openapi
```

---

## Dependências a Declarar no `pom.xml` (backoffice-core)

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

<!-- i18n / messages -->
<!-- (via Spring MessageSource — sem dep extra) -->
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

**Aviso:** `mapstruct-processor` e `lombok` devem ser declarados em `annotationProcessorPaths` do `maven-compiler-plugin`, **nunca** apenas como dependências de escopo compile.

---

## Checklist de Conformidade pós-geração

O agente executor deve verificar cada item antes de abrir PR:

**Estrutura e Build**
- [ ] `backoffice-contracts` e `backoffice-core` são módulos Maven distintos com `pom.xml` próprio
- [ ] `backoffice-contracts` não depende de `backoffice-core` nem de outros módulos core
- [ ] `backoffice-core` declara dependência em `backoffice-contracts`
- [ ] Projeto compila com `mvn clean install -pl backoffice-contracts,backoffice-core`

**Contratos OpenAPI**
- [ ] Um único arquivo YAML em `src/main/resources/openapi/backoffice.yaml`
- [ ] `openapi-generator` configurado em `backoffice-contracts/pom.xml`
- [ ] `interfaceOnly=true`, `useSpringBoot3=true`, `generateApiTests=false`
- [ ] Código gerado em `target/generated-sources/openapi` (não commitado)
- [ ] Todas as operações declaram `security` explicitamente

**Spring Modulith**
- [ ] `package-info.java` com `@ApplicationModule` presente em `net.deepion.backoffice`
- [ ] `BackofficeModulithTest` usa `ApplicationModuleTest` e passa sem violações
- [ ] Nenhuma dependência cross-module direta (usar eventos se necessário)

**Camadas (Clean Architecture)**
- [ ] `BackofficeController` não contém lógica de negócio — somente delegação
- [ ] `BackofficeService` nunca retorna `BackofficeJpaEntity`
- [ ] `domain/Backoffice.java` sem `@Entity`, sem deps de infra ou Spring
- [ ] `BackofficeRepository` (interface de domínio) sem `extends JpaRepository`
- [ ] `JpaBackofficeRepository` implements `BackofficeRepository` com `@Repository`

**Lombok**
- [ ] `Backoffice` (domain) usa `@Data`
- [ ] `BackofficeJpaEntity` usa `@Getter @Setter @NoArgsConstructor` — **sem** `@Data`
- [ ] Todos os Spring components usam `@RequiredArgsConstructor` + campos `final`
- [ ] Nenhum `@Autowired` em campo

**MapStruct**
- [ ] `BackofficeMapper` usa `@Mapper(componentModel = "spring")`
- [ ] Cobre os 4 mapeamentos: DTO↔Domain e Domain↔JpaEntity
- [ ] Nenhuma lógica de mapeamento manual

**Segurança**
- [ ] `SecurityConfig` está em `net.deepion.config` (não dentro do módulo feature)
- [ ] Um único `SecurityFilterChain` declarado
- [ ] Nenhum módulo define seu próprio `SecurityFilterChain`
- [ ] JWT resource server configurado com JWKs, issuer e audience
- [ ] Nenhum endpoint com `permitAll()`
- [ ] Todas as operações `@PreAuthorize` com role explícito; default `ROLE_ROOT` para segurança máxima

**i18n**
- [ ] `messages_pt_BR.properties` e `messages_en.properties` presentes
- [ ] Nenhuma mensagem user-facing hardcoded em Java
- [ ] Exceções de API retornam chave de mensagem localizada

**Configuração**
- [ ] `application.yml` sem valores hardcoded (passwords, URLs absolutas de produção)
- [ ] `BackofficeProperties` usa `@ConfigurationProperties` + `@Validated` + `@Data`

**Testes**
- [ ] `BackofficeModulithTest` passa: `ApplicationModuleTest` verifica estrutura Modulith
- [ ] `BackofficeServiceTest` cobre use cases com Mockito (sem contexto Spring)
- [ ] `JpaBackofficeRepositoryTest` usa `@DataJpaTest` com H2
- [ ] Cobertura da camada `domain/` ≥ 100%
- [ ] Cobertura geral ≥ 80%

---

## Riscos e Condições de Bloqueio

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Conflito de nome com pacote `net.deepion.backoffice` já existente | BLOQUEANTE | Verificar workspace antes de executar |
| `SecurityFilterChain` duplicado se já existe config global | ALTO | Confirmar que apenas um bean existe no contexto |
| Versão incompatível de MapStruct com Lombok (annotation processors) | MÉDIO | Fixar versões; declarar na ordem correta em `annotationProcessorPaths` |
| `backoffice.yaml` sem operações: geração de interface vazia não compila | MÉDIO | Incluir ao menos 2 operações CRUD como placeholder |

---

## Gates Necessários

- **Gate T0 (obrigatório):** Revisão humana funcional do scaffold completo antes de iniciar desenvolvimento de features.
- **Gate de contrato:** Aprovação do `backoffice.yaml` (OpenAPI spec) por Product Owner ou Tech Lead antes de gerar código dependente.
