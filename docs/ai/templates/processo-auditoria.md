# Template — Relatório de Auditoria de Processo

> **Instruções:** Preencha cada seção com dados verificáveis. Todo desvio deve ser referenciado com evidência (link de issue, PR, comentário ou label). Delete as instruções entre `>` ao preencher.

---

# Relatório de Auditoria — {ID da Demanda}

## Resumo Executivo

- **Demanda:** {título da issue}
- **ID:** #{número}
- **Classificação:** T{n} (score: {X.X})
- **Pipeline esperado:** {T0: autônomo | T1: semi-autônomo | T2: multi-gate | T3: assistido}
- **Status atual:** {gate/etapa atual}
- **Data de abertura:** {YYYY-MM-DD}
- **Data da auditoria:** {YYYY-MM-DD}
- **Conformidade geral:** {✅ Conforme | ⚠️ Desvios encontrados | ❌ Não conforme}

> Se houver desvios CRÍTICOS, insira aqui um bloco de alerta:
> ```
> ⚠️ ALERTA: {N} desvio(s) CRÍTICO(S) identificado(s). Ação imediata requerida.
> ```

---

## Checklist do Pipeline

> Marque ✅ para etapas cumpridas, ❌ para ausentes/com desvio, ➖ para não aplicáveis à classe T.

| # | Etapa | Agente/Responsável | Status | Artefato Esperado | Artefato Encontrado | Evidência |
|---|-------|-------------------|--------|-------------------|---------------------|-----------|
| 1 | Discovery | DOM-01 | | DecisionRecord | | |
| 2 | Gate 1 | PO / Domain Expert | | `/gate1-approve` | | |
| 3 | Detecção de duplicatas | SKILL-REQ-00 | | Relatório de conflitos | | |
| 4 | Produção do BAR | SKILL-REQ-01 | | BusinessAnalysisRecord | | |
| 5 | Checkpoint A | Analista / PO | | `/ba-approve` | | |
| 6 | Use Cases + Matriz | SKILL-REQ-02 | | UCs Gherkin + Matriz | | |
| 7 | Completude de artefatos | SKILL-QAN-00 | | Relatório de completude | | |
| 8 | Consistência negocial | SKILL-QAN-01 | | Relatório de consistência | | |
| 9 | Geração de TestPlan | SKILL-QAN-02 | | TestPlan-{ID} | | |
| 10 | Gate 2 | PO + Tech Lead | | `/gate2-approve` | | |
| 11 | ADR | DOM-03 | | ADR-{NNN} | | |
| 12 | Esqueleto de código | DOM-03 | | Código esqueleto | | |
| 13 | Gate 3 | Tech Lead + Arquiteto | | `/gate3-approve` | | |
| 14 | Implementação | DOM-04 | | Código + testes | | |
| 15 | PR | DOM-04 | | Pull Request | | |
| 16 | Cobertura de testes | SKILL-QAT-00 | | Relatório cobertura | | |
| 17 | Compliance arquitetural | SKILL-QAT-01 | | Relatório Modulith | | |
| 18 | Auditoria de RNs | SKILL-QAT-02 | | Relatório RNs | | |
| 19 | Gate 4 | Tech Lead | | `/gate4-approve` | | |
| 20 | Gate 5 (Homologação) | QA + PO | | Aceite funcional | | |

---

## Cadeia de Rastreabilidade

> Preencha cada elo da cadeia. Elos quebrados devem ser sinalizados com ❌.

```
Issue #{N}
  → DecisionRecord: {presente/ausente}
    → BAR: {presente/ausente}
      → Use Cases: {N UCs gerados}
        → Matriz de Rastreabilidade: {presente/ausente}
          → TestPlan-{ID}: {presente/ausente}
            → ADR-{NNN}: {presente/ausente}
              → PR #{N}: {presente/ausente}
                → Review DOM-05b: {presente/ausente}
```

**Integridade da cadeia:** {✅ Íntegra | ❌ Elos quebrados em: {etapas}}

---

## Análise RACI

> Verifique se os responsáveis corretos atuaram em cada gate.

| Gate | Responsável esperado | Responsável real | Conforme? | Observação |
|------|---------------------|-----------------|-----------|------------|
| Gate 1 | PO / Domain Expert | | | |
| Checkpoint A | Analista / PO | | | |
| Gate 2 | PO + Tech Lead | | | |
| Gate 3 | Tech Lead + Arquiteto | | | |
| Gate 4 | Tech Lead | | | |
| Gate 5 | QA + PO | | | |

---

## Desvios Encontrados

> Liste cada desvio com severidade, descrição e ação requerida.

| # | Severidade | Etapa | Descrição do Desvio | Evidência | Ação Requerida |
|---|------------|-------|---------------------|-----------|----------------|
| 1 | | | | | |

### Severidades:
- **CRÍTICO:** Gate obrigatório ignorado / RN violada / artefato obrigatório ausente
- **ALTO:** Etapa executada fora de ordem / responsável incorreto atuou no gate
- **MÉDIO:** Artefato gerado com campos incompletos / atraso significativo
- **BAIXO:** Nomenclatura fora do padrão / documentação incompleta mas não bloqueante

---

## Verificações Especiais

- [ ] Bloqueios automáticos de RN-01/RN-02/RN-03 foram respeitados
- [ ] LGPD: se dados pessoais envolvidos, aprovação humana registrada
- [ ] Escaladas executadas quando `confidence_score < 0.65`
- [ ] Nenhum agente atuou fora de seu escopo definido (SKILL-agentes.md)
- [ ] Audit Ledger com 100% de cobertura de decisões
- [ ] DOM-05b operou com TestPlan aprovado (contrato de entrada)

---

## Recomendações

### Ações Imediatas (desvios CRÍTICOS)
> {ação + responsável + prazo}

### Ações Corretivas (desvios ALTO/MÉDIO)
> {ação + responsável}

### Melhorias de Processo (desvios BAIXO + padrões)
> {sugestão para evitar recorrência}

---

*Relatório gerado pelo Gestor de Processos — Fábrica de Software Autônoma*
*Data: {YYYY-MM-DD}*
