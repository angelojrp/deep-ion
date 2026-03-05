# SKILL — Regras Negociais (fintech-pessoal)

## RN-01..RN-07 — Regras Imutáveis

Alteração em qualquer RN exige revisão com impacto mínimo indicado na tabela.
**RN-01, RN-02, RN-03: violação = bloqueio automático em qualquer classe de impacto.**

| ID    | Regra                                                                      | Impacto mínimo | Bloqueio automático |
|-------|----------------------------------------------------------------------------|----------------|---------------------|
| RN-01 | Saldo nunca negativo sem limite de cheque especial explicitamente definido | T2             | ✅ Sim               |
| RN-02 | Transferência gera dois lançamentos atômicos (débito + crédito)            | T2             | ✅ Sim               |
| RN-03 | Transação CONFIRMADA não pode ser excluída — apenas estornada              | T2             | ✅ Sim               |
| RN-04 | Orçamento calculado exclusivamente sobre DESPESAS CONFIRMADAS no período   | T1             | ❌ Não               |
| RN-05 | Meta atingida dispara evento de domínio `MetaAtingidaEvent`                | T1             | ❌ Não               |
| RN-06 | Categorias padrão não podem ser excluídas — apenas desativadas             | T1             | ❌ Não               |
| RN-07 | Relatório de fluxo de caixa considera apenas transações CONFIRMADAS        | T1             | ❌ Não               |

---

## Mapeamento RN → Módulo

| RN    | Módulos afetados                        | Evento de domínio relacionado   |
|-------|-----------------------------------------|---------------------------------|
| RN-01 | `conta`, `transacao`                    | —                               |
| RN-02 | `transacao`, `conta`                    | —                               |
| RN-03 | `transacao`                             | —                               |
| RN-04 | `orcamento`, `transacao`                | —                               |
| RN-05 | `meta`                                  | `MetaAtingidaEvent`             |
| RN-06 | `categoria`                             | —                               |
| RN-07 | `relatorio`, `transacao`                | —                               |

---

## Estados de Transação

```
PENDENTE → CONFIRMADA → (apenas estorno possível)
         → CANCELADA
```

- Somente `CONFIRMADA` é considerada em RN-04 e RN-07
- `CONFIRMADA` jamais pode ser excluída (RN-03) — criar `ESTORNO` como novo registro

---

## Checklist ao Propor Mudanças no fintech-pessoal

Antes de classificar qualquer demanda, verificar:

1. **Consumer Analysis** — o campo/lógica é referenciado em múltiplos módulos?
2. **Business Rule Fingerprint** — há lógica condicional baseada no elemento alterado?
3. **Data Persistence Check** — há dados existentes que seriam afetados?
4. **Contract Surface Check** — o elemento está exposto em API pública?
5. **Regulatory Scope Check** — envolve dados pessoais (CPF, nome, email)? → LGPD obrigatório