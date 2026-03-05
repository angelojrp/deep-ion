---
plan_id: PLAN-20260304-004
task_id: T01
title: "Corrigir extractAuthorities() em SecurityConfig (F01)"
agent: DOM-03/Dev
model: GPT-5.1-Codex
status: CONCLUIDO
depends_on: []
parallel_with: [T02, T03, T04, T05]
completed_at: "2026-03-04T00:00:00Z"
completed_by: "Copilot"
---

## Tarefa T01 — Corrigir `extractAuthorities()` em `SecurityConfig.java` (F01)

**Plano pai:** [PLAN-20260304-004](../PLAN-20260304-004_correcao-conformidade-backoffice.md)  
**Achado de origem:** F01 — CRÍTICO  
**Agente executor:** DOM-03/Dev  
**Modelo sugerido:** `GPT-5.1-Codex`  
**Depende de:** —  
**Paralelo com:** T02, T03, T04, T05

---

### Objetivo

Corrigir o método `extractAuthorities()` na classe `SecurityConfig`, que atualmente retorna `Collections.emptyList()` em ambos os ramos condicionais, impedindo que qualquer role seja extraída do token JWT. A consequência é que `@PreAuthorize("hasRole('ROLE_ADMIN')")` nega acesso a todo request autenticado.

---

### Localização

**Arquivo:** `backoffice-core/src/main/java/net/deepion/config/SecurityConfig.java`  
**Linhas afetadas:** 40–45 (método `extractAuthorities`)

---

### Especificação Técnica

Substituir o corpo do método `extractAuthorities(Jwt jwt)` pela implementação correta:

```java
@SuppressWarnings("unchecked")
private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
    // Validate audience if configured
    String audience = properties.getSecurity().getExpectedAudience();
    if (audience != null && !audience.isBlank()
            && (jwt.getAudience() == null || !jwt.getAudience().contains(audience))) {
        return Collections.emptyList();
    }
    // Extract realm roles from Keycloak token (realm_access.roles)
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

**Imports adicionais necessários** (se ainda não presentes):
- `org.springframework.security.core.authority.SimpleGrantedAuthority`
- `java.util.Map`
- `java.util.List`
- `java.util.stream.Collectors`

---

### Regra de Blueprint Reparada

`security.springSecurity.configuration.rules` → "Role mapping must use token claims (realm or resource roles)"

---

### Critérios de Aceite

- [ ] `extractAuthorities()` lê `realm_access.roles` do JWT
- [ ] Roles mapeadas com prefixo `ROLE_` + `toUpperCase()`
- [ ] Audiência validada quando configurada em `properties.getSecurity().getExpectedAudience()`
- [ ] `@PreAuthorize("hasRole('ROLE_ADMIN')")` funcional para token com role `admin`
- [ ] Sem duplicação de prefixo `ROLE_` (ex: `ROLE_ROLE_ADMIN`)
- [ ] Imports corretos adicionados

---

### Artefatos de Saída

- `SecurityConfig.java` com `extractAuthorities()` corrigido
