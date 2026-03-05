---
plan_id: PLAN-20260304-002
task_id: T13
title: "Verificar conformidade do blueprint"
agent: DOM-05b
model: Claude Opus 4.6
status: CONCLUIDO
completed_at: "2026-03-04T12:00:00Z"
completed_by: "Copilot"
depends_on: [T01, T02, T03, T04, T05, T06, T07, T08, T09, T10, T11, T12]
parallel_with: []
---

## Tarefa T13 — `auditoria de conformidade`

**Plano pai:** [PLAN-20260304-002](../PLAN-20260304-002_scaffold-backoffice.md)
**Agente executor:** DOM-05b
**Modelo sugerido:** `Claude Opus 4.6` — Auditoria multi-critério pós-scaffold
**Depende de:** T01, T02, T03, T04, T05, T06, T07, T08, T09, T10, T11, T12
**Paralelo com:** —

---

### Objetivo

Executar auditoria final do scaffold para comprovar aderência integral ao blueprint `modulith-api-first` e aos gates de qualidade definidos no plano.

---

### Contexto de Blueprint

Blueprint `modulith-api-first v1.0`; validação de contratos OpenAPI, Spring Modulith, clean architecture, segurança, i18n, configuração e testes.

---

### Especificação Técnica

Auditoria multi-critério cobrindo: estrutura Maven, contratos OpenAPI, Spring Modulith, camadas clean architecture, Lombok, MapStruct, segurança OAuth2/JWT, i18n, configuração externalizada e suíte de testes.

---

### Riscos Específicos

`SecurityFilterChain` duplicado se já existir configuração global (ALTO); incompatibilidade MapStruct/Lombok (MÉDIO); OpenAPI sem operações suficientes (MÉDIO).

---

### Artefatos de Saída

Relatório de auditoria de conformidade (inline abaixo).

---

### Critérios de Aceite

- Todos os itens do checklist de conformidade do plano verificados.
- Cada achado classificado por severidade.
- Achados críticos documentados com localização e correção sugerida.

---

## Relatório de Auditoria de Conformidade

**Blueprint:** `modulith-api-first v1.0`
**Data da auditoria:** 2026-03-04
**Executor:** Copilot (DOM-05b / Claude Opus 4.6)

---

### Estrutura e Build

| # | Critério | Status |
|---|----------|--------|
| 1 | `backoffice-contracts` e `backoffice-core` são módulos Maven distintos | ✅ PASS |
| 2 | `backoffice-contracts` não depende de `backoffice-core` | ✅ PASS |
| 3 | `backoffice-core` declara dependência em `backoffice-contracts` | ✅ PASS |
| 4 | Compilação `mvn clean install` | ⚠️ NÃO VERIFICÁVEL (sem terminal) |

---

### Contratos OpenAPI

| # | Critério | Status |
|---|----------|--------|
| 5 | Único YAML em `backoffice-contracts/src/main/resources/openapi/backoffice.yaml` | ✅ PASS |
| 6 | `openapi-generator` configurado em `backoffice-contracts/pom.xml` | ✅ PASS |
| 7 | `interfaceOnly=true`, `useSpringBoot3=true`, `generateApiTests=false` | ✅ PASS |
| 8 | Output em `target/generated-sources/openapi` | ✅ PASS |
| 9 | Todas as operações declaram `security` explicitamente (5/5) | ✅ PASS |
| 10 | OAuth2 Authorization Code com PKCE reference em securitySchemes | ✅ PASS |
| 11 | Schemas `BackofficeRequest`, `BackofficeResponse`, `BackofficePageResponse`, `ProblemDetails` | ✅ PASS |
| 12 | CRUD completo: GET list, POST create, GET by id, PUT update, DELETE | ✅ PASS |

---

### Spring Modulith

| # | Critério | Status |
|---|----------|--------|
| 13 | `package-info.java` com `@ApplicationModule` em `net.deepion.backoffice` | ✅ PASS |
| 14 | `BackofficeModulithTest` usa `ApplicationModules.of().verify()` | ✅ PASS |
| 15 | Nenhuma dependência cross-module direta | ✅ PASS |

---

### Camadas (Clean Architecture)

| # | Critério | Status |
|---|----------|--------|
| 16 | `BackofficeController` — delegação pura, sem lógica de negócio | ✅ PASS |
| 17 | `BackofficeService` — nunca retorna `BackofficeJpaEntity` | ✅ PASS |
| 18 | `Backoffice.java` — `@Data`, sem `@Entity`, sem deps Spring/infra | ✅ PASS |
| 19 | `BackofficeRepository` — interface domínio pura, sem `extends JpaRepository` | ✅ PASS |
| 20 | `JpaBackofficeRepository` implements `BackofficeRepository` + `@Repository` | ✅ PASS |
| 21 | `SpringDataBackofficeRepository` isolado em `infrastructure/` | ✅ PASS |

---

### Lombok

| # | Critério | Status |
|---|----------|--------|
| 22 | `Backoffice` usa `@Data` | ✅ PASS |
| 23 | `BackofficeJpaEntity` usa `@Getter @Setter @NoArgsConstructor` (sem `@Data`) | ✅ PASS |
| 24 | Todos os Spring components usam `@RequiredArgsConstructor` + campos `final` | ✅ PASS |
| 25 | Nenhum `@Autowired` em campo | ✅ PASS |

---

### MapStruct

| # | Critério | Status |
|---|----------|--------|
| 26 | `BackofficeMapper` usa `@Mapper(componentModel = "spring")` | ✅ PASS |
| 27 | 4 mapeamentos: DTO→Domain, Domain→DTO, Domain→Entity, Entity→Domain | ✅ PASS |
| 28 | Sem lógica manual de mapeamento | ✅ PASS |

---

### Segurança

| # | Critério | Status |
|---|----------|--------|
| 29 | `SecurityConfig` em `net.deepion.config` (fora do módulo feature) | ✅ PASS |
| 30 | Único `SecurityFilterChain` declarado | ✅ PASS |
| 31 | Nenhum módulo feature define seu próprio `SecurityFilterChain` | ✅ PASS |
| 32 | JWT resource server configurado com JWKs | ✅ PASS |
| 33 | `@PreAuthorize("hasRole('ROLE_ADMIN')")` no controller | ✅ PASS |
| 34 | `extractAuthorities()` extrai roles do JWT | ❌ **FAIL — F01** |
| 35 | Nenhum endpoint com `permitAll()` | ⚠️ **WARN — F04** |
| 36 | `OpenApiConfig.java` com SecurityScheme global | ❌ **FAIL — F03** |

---

### i18n

| # | Critério | Status |
|---|----------|--------|
| 37 | `messages_pt_BR.properties` e `messages_en.properties` presentes | ✅ PASS |
| 38 | Spring `MessageSource` configurado em `application.yml` | ✅ PASS |
| 39 | Nenhuma mensagem user-facing hardcoded em Java | ❌ **FAIL — F02** |

---

### Configuração

| # | Critério | Status |
|---|----------|--------|
| 40 | `application.yml` sem valores hardcoded | ✅ PASS |
| 41 | `BackofficeProperties` usa `@ConfigurationProperties` + `@Validated` + `@Data` | ✅ PASS |
| 42 | `@EnableConfigurationProperties` no application class | ✅ PASS |

---

### Testes

| # | Critério | Status |
|---|----------|--------|
| 43 | `BackofficeModulithTest` verifica estrutura Modulith | ✅ PASS |
| 44 | `BackofficeServiceTest` com Mockito (sem contexto Spring) | ✅ PASS |
| 45 | `JpaBackofficeRepositoryTest` com `@DataJpaTest` + H2 | ✅ PASS |
| 46 | Cobertura domain ≥ 100% | ⚠️ NÃO VERIFICÁVEL (sem execução) |
| 47 | Cobertura geral ≥ 80% | ⚠️ NÃO VERIFICÁVEL (sem execução) |

---

### Maven — Annotation Processors

| # | Critério | Status |
|---|----------|--------|
| 48 | `lombok` e `mapstruct-processor` em `annotationProcessorPaths` | ✅ PASS |
| 49 | Ordem: Lombok antes de MapStruct | ✅ PASS |

---

## Achados (Findings)

### F01 — CRÍTICO: `SecurityConfig.extractAuthorities()` retorna lista vazia sempre

- **Localização:** `backoffice-core/src/main/java/net/deepion/config/SecurityConfig.java` linhas 40-45
- **Problema:** Ambos os ramos do `if` retornam `Collections.emptyList()`. Nenhum role é jamais extraído do token JWT. Consequência: `@PreAuthorize("hasRole('ROLE_ADMIN')")` nega acesso a todo e qualquer request autenticado.
- **Regra violada:** Blueprint `security.springSecurity.configuration.rules` — "Role mapping must use token claims (realm or resource roles)"
- **Correção sugerida:** Implementar extração de roles a partir de `realm_access.roles` do JWT (Keycloak padrão):
  ```java
  @SuppressWarnings("unchecked")
  private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
      // Validate audience
      String audience = properties.getSecurity().getExpectedAudience();
      if (audience != null && !audience.isBlank()
              && (jwt.getAudience() == null || !jwt.getAudience().contains(audience))) {
          return Collections.emptyList();
      }
      // Extract realm roles from Keycloak token
      Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
      if (realmAccess == null || !realmAccess.containsKey("roles")) {
          return Collections.emptyList();
      }
      List<String> roles = (List<String>) realmAccess.get("roles");
      return roles.stream()
              .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
              .collect(Collectors.toList());
  }
  ```

### F02 — MÉDIO: Mensagens de exceção hardcoded em `BackofficeService`

- **Localização:** `backoffice-core/src/main/java/net/deepion/backoffice/application/BackofficeService.java` linhas 41, 55
- **Problema:** Usa string literal `"Backoffice not found"` em vez de chave i18n `backoffice.not-found` já definida nos arquivos de mensagens.
- **Regra violada:** Blueprint `internationalization.backend.rules` — "Must not hardcode user-facing messages", "Exception messages exposed to API must be localized"
- **Correção sugerida:** Injetar `MessageSource` e usar chave `backoffice.not-found`, ou criar exceção de domínio que carregue a chave de mensagem.

### F03 — BAIXO: `OpenApiConfig.java` ausente

- **Localização esperada:** `backoffice-core/src/main/java/net/deepion/config/OpenApiConfig.java`
- **Problema:** A estrutura de diretórios do plano prevê `OpenApiConfig.java` para definir `SecurityScheme` global do SpringDoc/Swagger UI. Arquivo ausente.
- **Regra violada:** Blueprint `security.openapi.rules` — "Security scheme must be defined globally"
- **Correção sugerida:** Criar classe `OpenApiConfig` com `@SecurityScheme` anotação global.

### F04 — BAIXO: `permitAll()` em `/actuator/health`

- **Localização:** `backoffice-core/src/main/java/net/deepion/config/SecurityConfig.java` linha 31
- **Problema:** `.requestMatchers("/actuator/health").permitAll()` — o checklist do plano diz "Nenhum endpoint com `permitAll()`".
- **Regra violada:** Checklist do plano (desvio intencional comum para health checks)
- **Impacto:** Mínimo. Health endpoints são tipicamente públicos para load balancers. Documentar como desvio aceite.

### F05 — INFORMATIVO: `BackofficeControllerTest` usa `@MockBean` (deprecated)

- **Localização:** `backoffice-core/src/test/java/net/deepion/backoffice/api/BackofficeControllerTest.java` linha 8
- **Problema:** `@MockBean` está deprecated no Spring Boot 3.4+. Deveria usar `@MockitoBean`.
- **Impacto:** Funcional, mas gerará warning de compilação.

---

## Resumo da Auditoria

| Severidade | Qtd | IDs |
|------------|-----|-----|
| CRÍTICO | 1 | F01 |
| MÉDIO | 1 | F02 |
| BAIXO | 2 | F03, F04 |
| INFORMATIVO | 1 | F05 |
| **Total de achados** | **5** | |

**Resultado geral:** Scaffold aderente ao blueprint em **42/47 critérios verificáveis** (89%). 2 critérios não verificáveis (compilação, cobertura) e 3 critérios com falha/desvio.

**Recomendação:** Corrigir F01 (CRÍTICO) e F02 (MÉDIO) antes de prosseguir com desenvolvimento de features. F03 e F04 podem ser endereçados em iteração subsequente.
