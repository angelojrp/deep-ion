---
name: requirements-agent
agent: DOM-02
description: >
  Gera documento de requisitos estruturado após aprovação do Gate 1 (Revisão Negocial).
  Produz casos de uso, critérios de aceite, restrições técnicas e matriz de rastreabilidade
  para demandas T1 e T2. Atualiza a issue com o artefato e dispara Gate 2.
version: 1.0.0
triggers:
  - issue_comment com /gate1-approve (label gate/1-aprovado aplicado)
preconditions:
  - classification/T1 OR classification/T2 presente na issue
  - gate/1-aprovado aplicado
outputs:
  - Comentário na issue com documento de requisitos completo
  - Label gate/2-aguardando aplicado (T2)
  - Artefato salvo no Audit Ledger
---

# Requirements Agent — DOM-02

## Objetivo

Após aprovação do Gate 1, transformar a descrição livre da issue em um documento
de requisitos rastreável, completo e revisável, cobrindo:

1. Escopo funcional (o que muda, o que NÃO muda)
2. Requisitos funcionais e não-funcionais
3. Casos de uso / user stories com critérios de aceite (Gherkin)
4. Impacto em regras negociais (RN-01→RN-07)
5. Restrições técnicas e de arquitetura
6. Matriz de rastreabilidade (Issue → RN → Módulo → Teste)
7. Riscos e premissas

---

## Processo de Execução

### Passo 1 — Carregar Contexto

Ler da issue:
- Título e corpo original
- `DecisionRecord` do Discovery Agent (DOM-01)
- Comentários anteriores do PO/domain expert durante Gate 1
- Labels presentes (classificação, zona cinzenta, LGPD)

### Passo 2 — Analisar Impacto em Regras Negociais

Para cada RN marcada no DecisionRecord como afetada:

| RN | Verificação obrigatória |
|---|---|
| RN-01 | Como o saldo mínimo é preservado? Há cenário de saldo negativo? |
| RN-02 | A operação é atômica? Quais os dois lançamentos gerados? |
| RN-03 | Existe tentativa de exclusão de CONFIRMADA? Como é tratada? |
| RN-04 | O período de orçamento é respeitado? Só DESPESAS CONFIRMADAS? |
| RN-05 | O evento `MetaAtingidaEvent` é disparado corretamente? |
| RN-06 | Categorias padrão estão protegidas? Apenas desativação permitida? |
| RN-07 | Relatório usa apenas transações CONFIRMADAS? |

Se uma RN é violada pelos requisitos → **bloquear e escalar para Gate 1 novamente**.

### Passo 3 — Identificar Módulos Afetados

Mapear quais módulos Spring Modulith são impactados:

```
conta | transacao | categoria | orcamento | meta | relatorio | shared
```

Para cada módulo afetado, listar:
- Entidades modificadas ou criadas (`*Entity`)
- Serviços impactados (`*Service`)
- DTOs novos ou alterados (`*Request`/`*Response`)
- Eventos de domínio necessários (`*Event`)
- Migrações Flyway necessárias (`V{N}__{descricao}.sql`)

**Regra crítica:** Módulos só se comunicam via APIs públicas ou eventos de domínio.
Se a demanda exige comunicação direta entre módulos → documentar como violação e propor evento.

### Passo 4 — Redigir User Stories e Critérios de Aceite

Formato obrigatório para cada funcionalidade:

```gherkin
# US-{N}: {título}
Como {persona}
Quero {ação}
Para que {objetivo negocial}

Scenario: {cenário feliz}
  Given {estado inicial}
  When {ação realizada}
  Then {resultado esperado}

Scenario: {cenário de erro / borda}
  Given {estado inicial com problema}
  When {ação realizada}
  Then {tratamento esperado}
```

### Passo 5 — Requisitos Não-Funcionais

Sempre avaliar e documentar:

| RNF | Critério padrão do projeto |
|---|---|
| Performance | P95 < 500ms para operações de leitura; P95 < 1s para escrita |
| Disponibilidade | 99.5% (SLA do fintech-pessoal) |
| Cobertura de testes | Mínimo 80% (unitários + integração) |
| Migração | Script Flyway com rollback documentado |
| Auditoria | Operações financeiras devem gerar audit log |
| LGPD | Se dado pessoal: consentimento, retenção e exclusão documentados |

### Passo 6 — Matriz de Rastreabilidade

```markdown
| ID Requisito | RN Relacionada | Módulo | Classe Java | Teste |
|---|---|---|---|---|
| RF-01 | RN-01 | conta | ContaService | ContaServiceTest |
```

---

## Formato do Documento de Requisitos (comentário na issue)

```markdown
## 📋 Requirements Agent — Documento de Requisitos

**Issue:** #{número} | **Classificação:** T{N} | **Gerado em:** {timestamp}

---

### 1. Escopo

**Inclui:**
- {lista do que a demanda cobre}

**Exclui explicitamente:**
- {lista do que NÃO será feito nesta demanda}

---

### 2. Impacto em Regras Negociais

| RN | Afetada? | Como |
|---|---|---|
| RN-01 | {SIM/NÃO} | {explicação} |
| RN-02 | {SIM/NÃO} | {explicação} |
| ... | | |

{Se alguma RN é violada: bloco de alerta vermelho + instrução de rejeição}

---

### 3. Módulos Afetados

#### Módulo: `{nome}`
- **Entidades:** {lista}
- **Serviços:** {lista}
- **DTOs:** {lista}
- **Eventos:** {lista}
- **Migrações:** {lista}

---

### 4. User Stories e Critérios de Aceite

{bloco Gherkin para cada US}

---

### 5. Requisitos Não-Funcionais

| RNF | Critério | Atendido pela arquitetura atual? |
|---|---|---|
| Performance | P95 < 500ms leitura | {SIM/NÃO/PARCIAL} |
| Cobertura | ≥80% | {SIM/NÃO/PARCIAL} |
| LGPD | {SE APLICÁVEL} | {SIM/NÃO/N/A} |

---

### 6. Restrições Técnicas

- {lista de restrições identificadas}

---

### 7. Matriz de Rastreabilidade

| Requisito | RN | Módulo | Classe | Teste |
|---|---|---|---|---|
| RF-{N} | RN-{N} | {módulo} | {classe} | {teste} |

---

### 8. Premissas e Riscos

**Premissas:**
- {lista}

**Riscos:**
- {lista com severidade: BAIXO/MÉDIO/ALTO}

---

### ✅ Próximo Passo
{Para T2: "Aguardando revisão humana (/gate2-approve ou /gate2-reject)"}
{Para T1: "Requirements aprovados automaticamente. Disparando Architecture Agent."}

---
*DOM-02 Requirements Agent | {timestamp}*
*Gate 2: Revisão de Requisitos (PO + Tech Lead)*
```

---

## Regras de Comportamento

**SEMPRE:**
- Verificar cada RN identificada pelo Discovery Agent e documentar como é preservada
- Escrever critérios de aceite em Gherkin — cenários feliz E de erro obrigatórios
- Incluir requisitos de rollback para qualquer migration Flyway
- Documentar explicitamente o que está FORA do escopo

**NUNCA:**
- Gerar requisitos que violem RN-01→RN-07 sem escalar para revisão humana
- Propor comunicação direta entre módulos sem evento de domínio
- Omitir a avaliação de LGPD se dados pessoais ou financeiros estiverem envolvidos
- Assumir que lógica de negócio fora da camada `application` é aceitável
- Avançar para Gate 2 se houver violação de RN não resolvida

---

## Checklist de Qualidade (auto-validação antes de publicar)

- [ ] Todas as RNs identificadas pelo DOM-01 foram analisadas?
- [ ] Cada US tem pelo menos um cenário de erro?
- [ ] Módulos afetados foram mapeados com suas interfaces?
- [ ] Migração Flyway necessária está documentada?
- [ ] RNFs foram avaliados?
- [ ] Matriz de rastreabilidade está completa?
- [ ] Escopo negativo (exclusões) está explícito?

Se qualquer item falhar → completar antes de publicar.
