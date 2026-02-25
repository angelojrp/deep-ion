# Fábrica de Software Autônoma — Skills dos Agentes

## Visão Geral

Skills são contratos comportamentais que definem **o que cada agente deve fazer,
como deve raciocinar, e o que nunca pode fazer**. São lidas pelo agente antes
de cada execução e funcionam como o "manual de operação" codificado.

---

## Mapa de Skills por Agente

| Agente | Código | Skill | Trigger | Gate de Saída |
|--------|--------|-------|---------|---------------|
| Discovery | DOM-01 | `discovery/SKILL.md` | Issue aberta/editada | `gate/1-aguardando` |
| Requirements | DOM-02 | `requirements/SKILL.md` | `gate/1-aprovado` | `gate/2-aguardando` |
| Architecture | DOM-03 | `architecture/SKILL.md` | `gate/2-aprovado` | `gate/3-aguardando` |
| Dev | DOM-04 | `dev/SKILL.md` | `gate/3-aprovado` | Pull Request + `gate/4-aguardando` |
| QA/Deploy | DOM-05 | `qa/SKILL.md` | `gate/4-aprovado` | Deploy staging ou `gate/5-aguardando` |

---

## Fluxo Completo por Classificação

```
Issue Criada
    ↓
DOM-01 Discovery → DecisionRecord + Classificação T0/T1/T2/T3

T0 ──────────────────────────────────────────────→ DOM-04 Dev → DOM-05 QA → Deploy (aprovação funcional)
T1 ──────────────────────→ DOM-02 Req → DOM-03 Arch → DOM-04 Dev → DOM-05 QA → Gate QA → Deploy
T2 → Gate 1 → Gate 2 → Gate 3 → DOM-02 → DOM-03 → Gate 4 → DOM-04 → Gate 5 → Deploy
          PO      PO+TL    TL+Arq                       TL         QA+PO
T3 → Pipeline totalmente humano. Agentes apenas aceleram análise em cada gate.
```

---

## Filosofia das Skills

### Separação de Responsabilidades

Cada skill define apenas o que **seu agente** faz. Nenhuma skill ultrapassa
a fronteira do agente — assim como os módulos Spring Modulith não importam
classes internas de outros módulos.

### Rastreabilidade Total

Todo output de agente inclui referência ao artefato anterior:
- DOM-02 referencia o DecisionRecord do DOM-01
- DOM-03 referencia o documento de requisitos do DOM-02
- DOM-04 referencia o ADR do DOM-03
- DOM-05 verifica contra os critérios Gherkin do DOM-02

### Regras Negociais como Invariantes

As RN-01→RN-07 são verificadas em **todas as skills**. Não existe stage
do pipeline onde uma violação de regra negocial pode passar despercebida.

---

## Como Usar as Skills

Em cada script Python de agente (`agent.py`), incluir no system prompt:

```python
with open(".github/skills/{agente}/SKILL.md", "r") as f:
    skill_content = f.read()

system_prompt = f"""
Você é o {Nome} Agent da Fábrica de Software Autônoma.
Siga rigorosamente as instruções da sua skill:

{skill_content}
"""
```

---

## Extensão e Manutenção

Para modificar o comportamento de um agente sem alterar o código Python:
1. Editar o `SKILL.md` correspondente
2. Fazer commit com mensagem descritiva
3. A próxima execução do agente já usará a versão atualizada

**Mudanças que exigem revisão T2+ antes de merge:**
- Alterar critérios de bloqueio do DOM-05
- Alterar thresholds de score do DOM-01
- Modificar as 5 análises de zona cinzenta
- Adicionar ou remover RNs da verificação obrigatória
