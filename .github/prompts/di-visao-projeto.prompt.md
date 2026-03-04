```prompt
---
agent: agent
description: "Criar o Documento de Visão de um projeto (DRAFT → FINAL) com objetivo estratégico, partes interessadas, escopo, critérios de sucesso e riscos de negócio"
name: "di-visao-projeto"
argument-hint: "Informe o tema do projeto e uma descrição inicial da necessidade ou objetivo estratégico"
---

Assuma o papel de **Analista de Negócios**.

Siga obrigatoriamente:
- `docs/ai/templates/visao-projeto-template.md` (se existir)
- `docs/ai/templates/brief-descoberta-template.md` (como referência complementar)

Entrada esperada:
- Tema do projeto (`<tema>`) — usado como identificador de pasta e arquivo.
- Descrição inicial em linguagem natural: objetivo estratégico, problema a resolver ou oportunidade de negócio.
- (Opcional) Stakeholders conhecidos, público-alvo, restrições, prazo ou KPIs já identificados.

## Fluxo obrigatório

### Passo 1 — Verificar artefatos existentes

Antes de criar, verifique se já existe algum dos seguintes arquivos para o tema informado:
- `docs/business/<tema>/<tema>-brief.md`
- `docs/business/<tema>/<tema>-visao.md`

Se `<tema>-visao.md` já existir, **interromper** e orientar o usuário a usar o prompt `/di-uc-update` para incrementos ou solicitar confirmação explícita de sobrescrita antes de continuar.

Se `<tema>-brief.md` existir, utilizá-lo como fonte complementar para evitar redundância e manter consistência entre os artefatos.

### Passo 2 — Gerar o Documento de Visão com status DRAFT

Preencha o documento com as seções abaixo. Adicione no cabeçalho do arquivo (bloco de metadados, antes de qualquer título):

```
status: DRAFT
versão: 1
ciclo-refinamento: 0
data-criação: <data atual>
tema: <tema>
```

#### Seções obrigatórias do Documento de Visão

**1. Identificação do Projeto**
| Campo | Valor |
|---|---|
| Nome do Projeto | |
| Tema (slug) | `<tema>` |
| Responsável | |
| Data de Criação | `<data atual>` |
| Versão | 1 |
| Status | DRAFT |

**2. Declaração da Visão**
Elabore um parágrafo conciso (máx. 5 linhas) no formato:
> Para **[público-alvo]**, que **[necessidade ou problema]**, o **[nome do produto/feature]** é **[categoria de solução]** que **[principal benefício]**. Diferente de **[alternativa atual]**, nossa solução **[diferencial chave]**.

**3. Objetivo Estratégico**
- Problema ou oportunidade de negócio que justifica o projeto.
- Impacto esperado (quantitativo, quando possível).
- Alinhamento com objetivos organizacionais.

**4. Partes Interessadas (Stakeholders)**

| ID | Nome / Grupo | Papel | Interesse Principal | Nível de Influência |
|----|-------------|-------|--------------------|--------------------|
| STK-01 | | | | Alto / Médio / Baixo |

**5. Usuários-Alvo (Perfis)**

| ID | Perfil | Descrição | Principal Necessidade |
|----|--------|-----------|----------------------|
| USR-01 | | | |

**6. Escopo do Produto — Funcionalidades de Alto Nível**

Liste as macro-funcionalidades agrupadas por módulo ou domínio. Não detalhar casos de uso aqui (isso é feito em `di-uc-new`).

| ID | Funcionalidade | Prioridade MoSCoW | Observações |
|----|---------------|-------------------|-------------|
| F-01 | | Must / Should / Could / Won't | |

**7. Fora do Escopo**

Liste explicitamente o que **não** será tratado neste projeto, para evitar scope creep:
- Fora-01: ...
- Fora-02: ...

**8. Premissas e Dependências**
- Premissas assumidas como verdadeiras sem necessidade de validação adicional.
- Dependências externas (sistemas, APIs, decisões de terceiros) que impactam a execução.

**9. Restrições**
- Técnicas (plataforma, linguagem, infraestrutura existente).
- De negócio (prazo, orçamento, regulatório/LGPD).
- De design (marca, acessibilidade, internacionalização).

**10. Critérios de Sucesso / KPIs**

| KPI | Linha de Base | Meta | Prazo |
|-----|--------------|------|-------|
| | | | |

**11. Riscos de Negócio**

| ID | Risco | Probabilidade | Impacto | Mitigação |
|----|-------|--------------|---------|-----------|
| RNE-01 | | Alta/Média/Baixa | Alto/Médio/Baixo | |

**12. Alternativas Consideradas**
Descreva brevemente as alternativas avaliadas e o motivo pelo qual foram descartadas em favor desta abordagem.

**13. Glossário**
Defina termos de domínio relevantes para o projeto que possam gerar ambiguidade.

| Termo | Definição |
|-------|-----------|
| | |

### Passo 3 — Identificar questões em aberto

Registre todas as informações incertas ou ausentes na seção:

```markdown
## Questões em Aberto

<!-- STATUS: DRAFT — documento permanece em rascunho até todas as questões serem respondidas ou finalização explícita -->

- [ ] QV-01: <descrição da questão> — Impacto: <seção afetada>
- [ ] QV-02: ...
```

Cada questão deve ter:
- Identificador único (`QV-NN`)
- Descrição objetiva do que precisa ser esclarecido
- Seção do documento afetada se não respondida

Se `confidence_score < 0.65` para qualquer seção estrutural (Declaração da Visão, Escopo, Stakeholders ou Critérios de Sucesso): **escalar obrigatoriamente** — não inferir silenciosamente.

### Passo 4 — Registrar histórico

```markdown
## Histórico de Revisões

| Versão | Data | Tipo | Descrição | Responsável |
|--------|------|------|-----------|-------------|
| 1 | <data atual> | CRIAÇÃO | Documento de Visão inicial — status DRAFT | Copilot |
```

### Passo 5 — Salvar o artefato

Salve imediatamente sem aguardar validação do usuário:
- Criar subpasta do tema se não existir: `docs/business/<tema>/`.
- Salvar em: `docs/business/<tema>/<tema>-visao.md`.
- Formato obrigatório: Markdown (`.md`).

### Passo 6 — Apresentar resumo ao usuário

Após salvar, exiba:
1. **Declaração de Visão** gerada (parágrafo do Passo 2, item 2).
2. **Escopo resumido**: quantidade de funcionalidades por prioridade MoSCoW.
3. **Stakeholders identificados**: lista resumida.
4. **Questões em aberto**: lista `QV-NN` com seção afetada.
5. Orientação: "O Documento de Visão está em **DRAFT**. Use o prompt `/di-refinar-visao-projeto` para responder as questões e avançar para FINAL. São permitidos até **3 ciclos de refinamento** — após isso nenhuma nova questão será proposta. Você também pode solicitar a finalização a qualquer momento. Com o documento FINAL, inicie o brief detalhado com `/di-brief-new` ou o ciclo completo com `/di-full-cycle`."
6. Hiperlink para o artefato salvo.

## Regras de status

- O documento nasce sempre como **DRAFT**.
- Permanece **DRAFT** enquanto houver questões `QV-NN` em aberto não respondidas.
- Transita para **FINAL** apenas quando:
  - Todas as questões da checklist forem marcadas como `[x]`, **ou**
  - O usuário solicitar explicitamente a finalização (mesmo com questões pendentes).
- Ao finalizar, registrar no `## Histórico de Revisões` com tipo `FINALIZAÇÃO`.

## Relacionamento com outros artefatos

| Artefato | Relação |
|----------|---------|
| `<tema>-brief.md` | O brief expande o escopo funcional definido aqui — gerado com `/di-brief-new` |
| `<tema>-regras.md` | As RNs derivam das restrições e regras de negócio identificadas na visão |
| `<tema>-priorizacao.md` | A priorização MoSCoW do backlog deve ser consistente com as prioridades da visão |
| `<tema>-prototipo-ux.md` | O protótipo materializa as funcionalidades de escopo definidas aqui |

## Restrições
- Responder em português-BR.
- Não gerar código, apenas artefatos de análise de negócio.
- Não detalhar casos de uso — isso é responsabilidade do prompt `di-uc-new`.
- O documento de visão tem escopo **estratégico**; o brief tem escopo **tático/funcional**.

```
