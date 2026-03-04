---
agent: agent
description: "Criar brief de descoberta (DRAFT) para uma funcionalidade do roadmap. Requer o ID do item de roadmap (ex: RM-F07)."
name: "di-brief-new"
argument-hint: "Informe o ID do item de roadmap (ex: RM-F07) e descreva a necessidade em linguagem natural"
---

Assuma o papel de **Analista de Negócios**.

Siga obrigatoriamente:
- `docs/ai/templates/brief-descoberta-template.md`
- `docs/business/deep-ion/deep-ion-roadmap.md` ← **fonte de verdade para validação do ID**

Entrada esperada:
- **ID do item de roadmap** no formato `RM-F{NN}` (obrigatório).
- Necessidade do usuário em linguagem natural.
- Tema da pasta em `docs/business/<tema>/`.

## Fluxo obrigatório

### Passo 0 — Validar o ID de roadmap (BLOQUEANTE)

Antes de qualquer outra ação, execute a seguinte validação:

1. Leia o arquivo `docs/business/deep-ion/deep-ion-roadmap.md`.
2. Verifique se o ID informado existe na tabela de funcionalidades do roadmap.
3. Aplique as regras abaixo:

| Condição | Ação obrigatória |
|----------|-----------------|
| ID não informado pelo usuário | **BLOQUEAR** — solicitar o ID antes de prosseguir; não gerar nenhum artefato |
| ID não encontrado no roadmap | **BLOQUEAR** — informar que a funcionalidade não está no roadmap; orientar o usuário a atualizar o roadmap primeiro via gate com o Product Owner |
| ID encontrado com status "Won't Have" / "Fora do Escopo v1" | **BLOQUEAR** — informar que o item foi explicitamente excluído do escopo v1; orientar escalada ao Product Owner para inclusão em versão futura |
| ID encontrado e elegível (Must / Should / Could, sem restrição de escopo) | **PROSSEGUIR** — registrar o ID e o título da funcionalidade no brief e continuar para o Passo 1 |

> ⛔ **Se o Passo 0 resultar em BLOQUEAR, interrompa o fluxo imediatamente.** Não gere nem salve nenhum artefato. Apresente ao usuário uma mensagem clara indicando o motivo do bloqueio e a ação corretiva necessária.

Exemplo de mensagem de bloqueio (ID fora de escopo):
```
❌ Brief não criado.

Motivo: o ID "RM-F22" corresponde a um item explicitamente fora do escopo v1 (Won't Have).

Ação necessária: para propor a inclusão desta funcionalidade em uma versão futura, escale ao Product Owner para revisão do roadmap antes de abrir um brief.
```

Exemplo de mensagem de bloqueio (ID inexistente):
```
❌ Brief não criado.

Motivo: o ID "RM-F99" não foi encontrado no roadmap de funcionalidades (docs/business/deep-ion/deep-ion-roadmap.md).

Ação necessária: verifique o ID informado ou solicite ao Product Owner a inclusão da funcionalidade no roadmap antes de abrir um brief.
```

### Passo 1 — Gerar o brief inicial com status DRAFT

Preencha o brief conforme o template, adicionando no cabeçalho do arquivo (bloco de metadados no topo, antes de qualquer título):

```
status: DRAFT
versão: 1
ciclo-refinamento: 0
data-criação: <data atual>
roadmap-id: <ID validado no Passo 0, ex: RM-F07>
```

Durante o preenchimento, identifique todas as informações incertas, ambíguas ou ausentes e registre-as como **questões em aberto**.

### Passo 2 — Criar lista de tarefas com questões em aberto

Ao final do brief, inclua a seção `## Questões em Aberto` com uma checklist das questões identificadas:

```markdown
## Questões em Aberto

<!-- STATUS: DRAFT — brief permanece em rascunho até todas as questões serem respondidas ou finalização explícita pelo usuário -->

- [ ] QA-01: <descrição da questão>
- [ ] QA-02: <descrição da questão>
...
```

Cada questão deve ter:
- Identificador único (`QA-NN`)
- Descrição objetiva do que precisa ser esclarecido
- Impacto no brief se não respondida

### Passo 3 — Registrar histórico de alterações

Inclua a seção `## Histórico` no brief:

```markdown
## Histórico

| Versão | Data | Tipo | Descrição | Responsável |
|--------|------|------|-----------|-------------|
| 1 | <data atual> | CRIAÇÃO | Brief inicial gerado — status DRAFT | Copilot |
```

### Passo 4 — Salvar o artefato DRAFT

Salve o arquivo imediatamente sem aguardar validação do usuário:
- Criar subpasta do tema se não existir: `docs/business/<tema>/`.
- Salvar o brief em: `docs/business/<tema>/<tema>-brief.md`.
- Formato obrigatório: Markdown (`.md`).

O cabeçalho do arquivo deve conter:

```
status: DRAFT
versão: 1
ciclo-refinamento: 0
data-criação: <data atual>
roadmap-id: <ID validado no Passo 0, ex: RM-F07>
```

### Passo 5 — Apresentar resumo ao usuário

Após salvar, exiba:
1. Resumo objetivo das decisões tomadas no brief.
2. Lista das questões em aberto identificadas.
3. Orientação: "Use o prompt `/di-brief-refine` para responder as questões e atualizar o brief. Após todas as questões respondidas, o status será alterado para FINAL automaticamente. São permitidos até **3 ciclos de refinamento** — após isso nenhuma nova questão será proposta. Você também pode solicitar a finalização a qualquer momento."
4. Hiperlink para o artefato salvo.

## Regras de status

- O brief nasce sempre como **DRAFT**.
- Permanece **DRAFT** enquanto houver questões em aberto não respondidas.
- Transita para **FINAL** apenas quando:
  - Todas as questões da checklist forem marcadas como `[x]`, **ou**
  - O usuário solicitar explicitamente a finalização (mesmo com questões em aberto).
- Ao finalizar, registrar no `## Histórico` com tipo `FINALIZAÇÃO`.

## Restrições
- Responder em português-BR.
- Não gerar código, apenas artefatos de análise.
