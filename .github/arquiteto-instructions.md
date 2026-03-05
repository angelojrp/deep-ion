# Fábrica de Software Autônoma — Contexto Global

Este arquivo é carregado automaticamente em todos os agentes do repositório.
Contém apenas fatos estruturais do projeto — detalhes ficam nas skills especializadas.

---

## Repositórios

| Repo               | Stack                                                              | Propósito                              |
|--------------------|--------------------------------------------------------------------|----------------------------------------|
| `deep-ion-agents`  | Python 3.12 · AI Provider agnóstico                                | A fábrica em si — agentes e orquestração |



---

## Agentes da Fábrica

| ID      | Nome                  | Status       |
|---------|-----------------------|--------------|
| DOM-01  | Discovery Agent       | ✅ Implementado |
| DOM-02  | Requirements Agent    | 📋 Especificado |
| DOM-03  | Architecture Agent    | 🔜 Planejado    |
| DOM-04  | Dev Agent             | 🔜 Planejado    |
| DOM-05a | QA Negocial Agent     | 📋 Especificado |
| DOM-05b | QA Técnico Agent      | 📋 Especificado |

---

## Configuração de AI Provider

```
AI_PROVIDER=anthropic | copilot | openai   (variável de ambiente)
AI_API_KEY=...                              (credencial)
ANTHROPIC_API_KEY=...                       (compatibilidade retroativa)
```

Cada agente é AI Provider agnóstico. O provedor é selecionado em runtime.

---

## Fase Atual

**Iteração 1** — Discovery Agent + Classificação de Impacto + State Machine básica
**Próxima** — Iteração 2: DOM-02 Requirements Agent + DOM-05a QA Negocial

---

## Skills Disponíveis

Localização: `architecture/skills/`

| Arquivo                       | Conteúdo                                      |
|-------------------------------|-----------------------------------------------|
| SKILL-pipeline.md             | Pipeline completo T2, gates, comandos         |
| SKILL-regras-negociais.md     | RN-01..RN-07 com impacto e restrições         |
| SKILL-agentes.md              | Responsabilidades e specs DOM-01..DOM-05b     |
| SKILL-convencoes.md           | Convenções Java/Spring Modulith, Python, GHA  |
| SKILL-modelo-classificacao.md | T0→T3, scoring, autonomia por classe          |