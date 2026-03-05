---
plan_id: PLAN-20260304-004
task_id: T03
title: "Criar OpenApiConfig.java com @SecurityScheme global (F03)"
agent: DOM-03/Dev
model: GPT-4o
status: CONCLUIDO
depends_on: []
parallel_with: [T01, T02, T04, T05]
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
---

## Tarefa T03 — Criar `OpenApiConfig.java` com `@SecurityScheme` global (F03)

**Plano pai:** [PLAN-20260304-004](../PLAN-20260304-004_correcao-conformidade-backoffice.md)  
**Achado de origem:** F03 — BAIXO  
**Agente executor:** DOM-03/Dev  
**Modelo sugerido:** `GPT-4o`  
**Depende de:** —  
**Paralelo com:** T01, T02, T04, T05

---

### Objetivo

Criar o arquivo `OpenApiConfig.java` ausente no pacote `net.deepion.config`, definindo o `SecurityScheme` global para o Swagger UI/SpringDoc com o fluxo OAuth2 Authorization Code + PKCE.

---

### Localização

**Arquivo a criar:** `backoffice-core/src/main/java/net/deepion/config/OpenApiConfig.java`

---

### Especificação Técnica

```java
package net.deepion.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.OAuthFlow;
import io.swagger.v3.oas.annotations.security.OAuthFlows;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
        name = "oauth2",
        type = SecuritySchemeType.OAUTH2,
        flows = @OAuthFlows(
                authorizationCode = @OAuthFlow(
                        authorizationUrl = "${springdoc.oauth2.authorization-url}",
                        tokenUrl = "${springdoc.oauth2.token-url}"
                )
        )
)
public class OpenApiConfig {
}
```

**Propriedades a adicionar em `application.yml`** (se ausentes):
```yaml
springdoc:
  oauth2:
    authorization-url: ${KEYCLOAK_URL}/realms/deepion/protocol/openid-connect/auth
    token-url: ${KEYCLOAK_URL}/realms/deepion/protocol/openid-connect/token
```

---

### Regra de Blueprint Reparada

`security.openapi.rules` → "Security scheme must be defined globally"

---

### Critérios de Aceite

- [ ] `OpenApiConfig.java` criado em `net.deepion.config`
- [ ] Anotação `@SecurityScheme` com `name = "oauth2"` presente
- [ ] Fluxo `authorizationCode` configurado
- [ ] URLs externalizadas via `application.yml` (sem valores hardcoded)
- [ ] Dependência `springdoc-openapi-starter-webmvc-ui` declarada no `backoffice-core/pom.xml`

---

### Artefatos de Saída

- `OpenApiConfig.java` — novo arquivo criado
- (Verificação) `application.yml` com propriedades springdoc
