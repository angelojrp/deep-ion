---
agent: agent
description: "Refinar brief de descoberta (DRAFT): responder questões em aberto e atualizar o artefato"
name: "di-brief-refine"
argument-hint: "Informe o tema do brief e forneça as respostas para as questões em aberto (ou solicite finalização)"
---

Assuma o papel de **Analista de Negócios**.

Entrada esperada:
- Tema do brief (`docs/business/<tema>/<tema>-brief.md`).
- Respostas do usuário para uma ou mais questões em aberto (referenciadas pelo ID, ex: `QA-01`), **ou**
- Solicitação explícita de finalização do brief mesmo com questões em aberto.

## Fluxo obrigatório

### Passo 1 — Carregar o brief existente

Leia o arquivo `docs/business/<tema>/<tema>-brief.md` e identifique:
- Status atual (`DRAFT` ou `FINAL`).
- Versão atual.
- **Ciclo de refinamento atual** (`ciclo-refinamento: N`). Se o campo não existir, assuma `0`.
- Todas as questões em aberto na seção `## Questões em Aberto` (itens com `- [ ]`).
- O `## Histórico` existente.

Se o brief já estiver com status `FINAL`, informe ao usuário e encerre sem alterar.

### Passo 2 — Processar as respostas

Para cada questão respondida pelo usuário:
1. Marque o item da checklist como `[x]`.
2. Adicione a resposta logo abaixo do item no seguinte formato:
   ```markdown
   - [x] QA-NN: <descrição original da questão>
     > **Resposta:** <resposta fornecida pelo usuário> *(respondida em <data atual>)*
   ```
3. Aplique o impacto da resposta nas seções relevantes do brief (atualize campos de contexto, objetivo, escopo, riscos etc. conforme necessário).

### Passo 3 — Re-análise e novas questões (limite de ciclos)

Após processar as respostas e atualizar as seções afetadas, **re-analise o brief completo** considerando o novo contexto incorporado:

- Verifique se as respostas revelaram lacunas, contradições ou ambiguidades que ainda não estão capturadas no brief.
- **Se `ciclo-refinamento` atual for menor que 3**: você pode propor novas questões. Adicione-as à checklist de `## Questões em Aberto` com IDs sequenciais (`QA-NN` continuando a numeração existente), cada uma com impacto descrito.
- **Se `ciclo-refinamento` atual for igual ou maior que 3**: **não proponha nenhuma nova questão**. Registre no histórico que o limite de refinamentos foi atingido. Documente quaisquer lacunas identificadas apenas como observações na seção `## Riscos e premissas`, sem transformá-las em questões abertas.

Incremente `ciclo-refinamento` em 1 no cabeçalho do arquivo.

### Passo 4 — Verificar status das questões

Após re-análise:
- Se **todas** as questões estiverem marcadas `[x]` **e** nenhuma nova questão foi adicionada → altere o status para `FINAL`.
- Se ainda houver questões abertas (`- [ ]`) → mantenha status `DRAFT`.
- Se o usuário solicitou **finalização explícita** → altere o status para `FINAL` independentemente das questões abertas. Registre no histórico que foi finalizado com questões em aberto.

### Passo 5 — Incrementar versão e registrar no histórico

Incremente a versão do brief (`versão: N+1`) e adicione uma linha ao `## Histórico`:

Para refinamento com novas questões geradas (ainda DRAFT):
```markdown
| <versão> | <data atual> | REFINAMENTO | Ciclo <N>. Questões respondidas: <lista de IDs>. Novas questões geradas: <lista de IDs>. Questões ainda abertas: <lista de IDs>. | Copilot |
```

Para refinamento sem novas questões (ainda DRAFT):
```markdown
| <versão> | <data atual> | REFINAMENTO | Ciclo <N>. Questões respondidas: <lista de IDs>. Questões ainda abertas: <lista de IDs>. | Copilot |
```

Para refinamento com limite de ciclos atingido:
```markdown
| <versão> | <data atual> | REFINAMENTO | Ciclo <N> — limite de refinamentos atingido. Nenhuma nova questão será proposta. Questões respondidas: <lista de IDs>. Questões ainda abertas: <lista de IDs>. | Copilot |
```

Para finalização com todas as questões respondidas:
```markdown
| <versão> | <data atual> | FINALIZAÇÃO | Todas as questões respondidas. Status alterado para FINAL. | Copilot |
```

Para finalização explícita com questões abertas:
```markdown
| <versão> | <data atual> | FINALIZAÇÃO | Finalização solicitada pelo usuário. Questões ainda abertas: <lista de IDs>. Status alterado para FINAL. | <usuário> |
```

### Passo 6 — Salvar o artefato atualizado

Sobrescreva o arquivo `docs/business/<tema>/<tema>-brief.md` com o conteúdo atualizado.

### Passo 7 — Apresentar resumo ao usuário

Exiba:
1. Questões respondidas nesta iteração (IDs e resumo das respostas).
2. Atualizações realizadas no brief (quais seções foram modificadas).
3. Novas questões adicionadas neste ciclo (se houver).
4. Ciclo de refinamento atual e ciclos restantes (ex: "Ciclo 2 de 3 — restam 1 ciclo de refinamento").
5. Status atual do brief (`DRAFT` ou `FINAL`).
6. Se ainda DRAFT: lista completa das questões que permanecem em aberto.
7. Se ainda DRAFT: orientação "Use novamente o prompt `/di-brief-refine` para responder as questões restantes, ou solicite a finalização com `finalizar brief mesmo com questões em aberto`."
8. Se ciclos esgotados (`ciclo-refinamento >= 3`) e ainda DRAFT: aviso de que nenhuma nova questão será proposta em refinamentos futuros.
9. Hiperlink para o artefato atualizado.

## Regras de histórico e rastreabilidade

- **Nunca remova** entradas do `## Histórico`.
- **Nunca remova** respostas já registradas nas questões (`> **Resposta:**`).
- As questões finalizadas (`[x]`) com suas respostas devem permanecer visíveis no arquivo para rastreabilidade.
- Ao finalizar, o `## Histórico` completo deve ser preservado mostrando toda a evolução do brief desde a criação.

## Restrições
- Responder em português-BR.
- Não gerar código, apenas artefatos de análise.
- Não alterar seções do brief que não foram impactadas pelas respostas fornecidas.
