# SKILL — Modelo de Classificação de Impacto (T0→T3)

## Tabela de Classes

| Classe | Score    | Pipeline                | Autonomia dos agentes                                          |
|--------|----------|-------------------------|----------------------------------------------------------------|
| **T0** | 1.0–2.5  | Totalmente autônomo     | Agente implementa → stage → aprovação humana funcional → prod  |
| **T1** | 2.6–4.5  | Semi-autônomo           | Gates: QA Review + Validação funcional                         |
| **T2** | 4.6–6.5  | Multi-gate              | 5 gates: Negocial → Requisitos → Arquitetural → Code → Homolog.|
| **T3** | 6.6–9.0  | Totalmente assistido    | Zero autonomia. Agente atua como acelerador de análise humana  |

---

## Dimensões de Score (DOM-01)

O Discovery Agent calcula o score por dimensão e pondera para o score final.

| Dimensão               | Peso  | Descrição                                                         |
|------------------------|-------|-------------------------------------------------------------------|
| Complexidade técnica   | 25%   | Número de módulos, integrações, camadas afetadas                  |
| Impacto negocial       | 30%   | Toca RNs? Afeta fluxo financeiro? Altera contratos?               |
| Reversibilidade        | 20%   | Rollback simples (T0) vs. irreversível com dados reais (T3)       |
| Exposição regulatória  | 15%   | Dados pessoais, LGPD, compliance                                  |
| Superfície de contrato | 10%   | APIs públicas, eventos de domínio, integrações externas           |

**Score final = Σ (nota_dimensão × peso_dimensão)**

---

## 5 Análises de Zona Cinzenta (obrigatórias no DOM-01)

Sinais que elevam a classificação para o próximo nível:

| #  | Análise                   | Gatilho de elevação                                               |
|----|---------------------------|-------------------------------------------------------------------|
| 1  | Consumer Analysis         | Campo referenciado em 2+ módulos distintos                        |
| 2  | Business Rule Fingerprint | Lógica condicional diretamente baseada no elemento alterado       |
| 3  | Data Persistence Check    | Dados existentes em produção seriam afetados pela mudança         |
| 4  | Contract Surface Check    | Elemento presente em contrato de API pública ou evento de domínio |
| 5  | Regulatory Scope Check    | Envolve dado pessoal identificável (CPF, nome, e-mail, endereço)  |

> **Qualquer resultado positivo no item 5 → LGPD obrigatório → aprovação humana em qualquer classe**

---

## Restrições por Classe

### T0 — Totalmente Autônomo
- Agentes podem implementar, testar e promover para staging sem aprovação prévia
- Gate final: aprovação humana **funcional** (não técnica) antes de produção
- DOM-05a falha crítica → **BLOQUEIO automático** (sem escalar para humano)
- DOM-05b falha crítica → **REQUEST_CHANGES automático**

### T1 — Semi-Autônomo
- Gates obrigatórios: QA Review + Validação funcional
- DOM-05a falha crítica → alerta, Gate 2 decide
- DOM-05b falha crítica → REQUEST_CHANGES automático

### T2 — Multi-Gate
- **5 gates obrigatórios** — nenhum pode ser pulado
- Cada gate tem responsável humano definido
- DOM-05a e DOM-05b produzem relatórios para auxiliar decisão humana

### T3 — Totalmente Assistido
- **Zero etapas autônomas**
- Agentes atuam como aceleradores: leem, analisam, resumem, sugerem
- Toda decisão é humana
- Use case típico: mudanças em RNs críticas, reestruturação de domínios, compliance

---

## Regras de Reclassificação

```
/reclassify-T0  →  Rebaixa para T0 (requer Gate 1 aprovado + justificativa)
/reclassify-T1  →  Reclassifica para T1
/reclassify-T2  →  Eleva para T2
/reclassify-T3  →  Eleva para T3 (máxima assistência)
```

**Importante:** reclassificação gera novo `DecisionRecord` no Audit Ledger.
Não é possível reclassificar uma demanda que já passou de Gate 2 sem reabrir o fluxo.

---

## Guia Rápido de Classificação

| Cenário                                                    | Classificação sugerida |
|------------------------------------------------------------|------------------------|
| Ajuste de texto em mensagem de erro                        | T0                     |
| Novo campo opcional em DTO sem lógica de negócio           | T0–T1                  |
| Nova regra de validação em módulo isolado                  | T1                     |
| Novo endpoint que agrega dados de 2+ módulos               | T1–T2                  |
| Mudança em cálculo de orçamento (toca RN-04)               | T2                     |
| Mudança na lógica de saldo (toca RN-01 ou RN-02)           | T2 (mínimo)            |
| Refatoração de módulo com migration Flyway em produção     | T2–T3                  |
| Alteração de RN crítica ou reestruturação de domínio       | T3                     |
| Qualquer mudança envolvendo dados pessoais (LGPD)          | T2+ com gate obrigatório|