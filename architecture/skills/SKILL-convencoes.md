# SKILL — Convenções Técnicas

## Java / Spring Modulith (fintech-pessoal)

### Nomenclatura e Pacotes

| Artefato          | Sufixo obrigatório | Pacote          | Exemplo                         |
|-------------------|--------------------|------------------|---------------------------------|
| Entidade JPA      | `Entity`           | `domain`         | `ContaEntity`                   |
| DTO entrada       | `Request`          | `dto`            | `CriarTransacaoRequest`         |
| DTO saída         | `Response`         | `dto`            | `TransacaoResponse`             |
| Serviço           | `Service`          | `application`    | `TransacaoService`              |
| Repositório       | `Repository`       | `infrastructure` | `TransacaoRepository`           |
| Evento de domínio | `Event`            | `domain`         | `MetaAtingidaEvent`             |

### Regras Estruturais

- Repositórios estendem `JpaRepository<Entity, ID>`
- Eventos de domínio publicados via `ApplicationEventPublisher`
- Módulos comunicam-se **apenas** via APIs públicas (`@Exposed`) ou eventos de domínio
- Comunicação direta entre módulos internos = violação arquitetural
- Lógica de negócio **exclusivamente** na camada `application` (Services)
- `ModulithArchitectureTest` deve passar sempre — é gate automático do DOM-05b

### Migrations Flyway

```
Padrão: V{versao}__{descricao_snake_case}.sql
Exemplo: V20240315__adiciona_coluna_limite_especial_conta.sql
```

- Migrations são imutáveis após merge
- Rollback via nova migration — nunca editar migration existente

### Testes

| Tipo         | Framework                           | Cobertura mínima |
|--------------|-------------------------------------|------------------|
| Unitário     | JUnit 5 + Mockito                   | 80%              |
| Integração   | JUnit 5 + Testcontainers + PostgreSQL| 80% (combinado) |
| Arquitetura  | `ModulithArchitectureTest`          | 100% (obrigatório)|

---

## Python / Agentes (deep-ion-agents)

### Stack Obrigatória

- Python 3.12+
- **Sem** frameworks de agente (LangChain, CrewAI, AutoGen) — implementação direta
- Integração via camada de abstração de AI Provider própria
- Provider selecionado por `AI_PROVIDER` (`anthropic` | `copilot` | `openai`)

### Estrutura de cada Skill

```python
# Contrato de entrada — lido via GitHub API ou parâmetro
input_data = {
    "issue_id": str,
    "artefato": dict,        # artefato produzido pela skill anterior
    "classificacao": str,    # T0 | T1 | T2 | T3
}

# Contrato de saída — publicado via comentário estruturado na Issue
output_data = {
    "skill_id": str,
    "status": "OK" | "ALERTA" | "BLOQUEIO",
    "artefato": dict,
    "decision_record": dict,  # obrigatório — Audit Ledger
}
```

### Regras de Implementação

- Cada skill = script Python independente invocado pela GitHub Action correspondente
- Sem instância compartilhada ou chamada direta entre skills
- Toda decisão gera `DecisionRecord` no Audit Ledger (append-only)
- Ambiguidade crítica → publicar alerta na Issue, bloquear avanço

---

## GitHub Actions

### Triggers Padrão

```yaml
on:
  issues:
    types: [opened, edited]
  issue_comment:
    types: [created]
  pull_request:
    types: [opened, synchronize]
```

### Variáveis de Ambiente

```yaml
env:
  AI_PROVIDER: ${{ vars.AI_PROVIDER }}       # anthropic | copilot | openai
  AI_API_KEY: ${{ secrets.AI_API_KEY }}
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}  # retrocompatibilidade
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # fornecido automaticamente
```

### Controle de Gate por Label

```yaml
# Verificar label antes de executar agente
- name: Check gate label
  if: contains(github.event.issue.labels.*.name, 'gate/1-aprovado')
  run: python agents/dom02/skill_req_00.py
```

### Padrão de Comentário Estruturado (saída de skill)

```markdown
<!-- AGENT_OUTPUT: DOM-02/SKILL-REQ-01 -->
**Status:** ✅ OK | ⚠️ ALERTA | 🚫 BLOQUEIO
**Artefato:** BAR-{ISSUE_ID}
**Próxima ação:** /ba-approve ou /ba-reject
```