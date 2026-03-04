---
agent: agent
description: "Refinar protótipo UX (DRAFT): responder questões em aberto, atualizar telas e evoluir para FINAL"
name: "di-refinar-prototipo-ux"
argument-hint: "Informe o tema do protótipo e forneça as respostas para as questões em aberto (ou solicite finalização)"
---

Assuma o papel de **Analista de Negócios / UX**.

Siga obrigatoriamente:
- `docs/ai/templates/prototipagem-ux-template.md`
- `docs/ai/templates/prototipo-screen-template.html`

Entrada esperada:
- Tema do protótipo (`docs/business/<tema>/DRAFT-<tema>-prototipo-ux.md`).
- Respostas do usuário para uma ou mais questões em aberto (referenciadas pelo ID, ex: `QP-01`), **ou**
- Solicitação explícita de **finalização** do protótipo mesmo com questões em aberto.

## Fluxo obrigatório

### Passo 1 — Carregar o protótipo existente

Leia o arquivo `docs/business/<tema>/DRAFT-<tema>-prototipo-ux.md` e identifique:
- Status atual (`DRAFT` ou `FINAL`).
- Versão atual.
- **Ciclo de refinamento atual** (`ciclo-refinamento: N`).
- Todas as questões em aberto na seção `## Questões em Aberto` (itens com `- [ ]`).
- O `## Histórico` existente.
- O `## Inventário de TODOs e Suposições` existente.

Leia também todos os HTMLs em `docs/business/<tema>/prototipos/DRAFT-*.html` para ter contexto completo das telas.

Se o protótipo já estiver com status `FINAL`, informe ao usuário e encerre sem alterar.

### Passo 2 — Processar as respostas do usuário

Para cada questão respondida pelo usuário:
1. Marque o item da checklist como `[x]` na seção `## Questões em Aberto`.
2. Adicione a resposta logo abaixo do item no seguinte formato:
   ```markdown
   - [x] QP-NN: <descrição original da questão> — **Impacto:** <tela(s) ou seção afetada>
     > **Resposta:** <resposta fornecida pelo usuário> *(respondida em <data atual>)*
   ```
3. Atualize a tabela `## Inventário de TODOs e Suposições`:
   - Altere o **Status** para `Resolvido`.
   - Preencha a coluna **Resolução / Pendência** com a resposta fornecida.

### Passo 3 — Atualizar artefato e telas com base nas respostas

Após processar as respostas, **aplique o impacto nas seções afetadas**:

1. **No artefato Markdown**: atualize seções de Contexto, Mapa de telas, Estados por tela, Diretrizes, Critérios de validação etc., conforme necessário.
2. **Nos HTMLs das telas afetadas**:
   - Substitua os blocos `<div class="ux-note"><strong>[SUPOSIÇÃO]</strong> …</div>` resolvidos pelo comportamento/valor correto.
   - Atualize labels, campos, validações, estados, mensagens e fluxos conforme as respostas.
   - Substitua `TODO:` remanescentes que agora possuem valor definido.
3. **Na tabela de definições de atributos**: atualize domínios, tipos e obrigatoriedades que foram esclarecidos.

### Passo 4 — Re-análise e novas questões (limite de 2 ciclos)

Após atualizar artefato e telas, **re-analise o documento completo e todas as telas** considerando o novo contexto incorporado:

- Verifique se as respostas revelaram lacunas, contradições ou ambiguidades que ainda não estão capturadas.
- **Se `ciclo-refinamento` atual for menor que 2**: você pode propor novas questões. Adicione-as à checklist de `## Questões em Aberto` com IDs sequenciais (`QP-NN` continuando a numeração existente), cada uma com impacto descrito. Adicione também à tabela de inventário com status `Pendente`.
- **Se `ciclo-refinamento` atual for igual ou maior que 2**: **não proponha nenhuma nova questão**. Registre no histórico que o limite de refinamentos foi atingido. Documente quaisquer lacunas identificadas apenas como observações na seção `## Critérios de validação UX > Riscos e ambiguidades`, sem transformá-las em questões abertas.

Incremente `ciclo-refinamento` em 1 no cabeçalho do arquivo.

### Passo 5 — Verificar status e transição para FINAL

Após re-análise:

**Caso A — Todas as questões respondidas (sem novas questões):**
1. Altere o status para `FINAL`.
2. Renomeie o artefato: `DRAFT-<tema>-prototipo-ux.md` → `<tema>-prototipo-ux.md`.
3. Renomeie os HTMLs: `DRAFT-NN-<slug>.html` → `NN-<slug>.html`.
4. Nos HTMLs: altere `data-mode="DRAFT"` para `data-mode="FINAL"` e remova `.mode-banner.draft` e `.screen-meta`.
5. Atualize os links relativos no artefato Markdown para refletir os novos nomes dos HTMLs.

**Caso B — Ainda há questões abertas:**
- Mantenha status `DRAFT`.
- Mantenha nomenclatura com prefixo `DRAFT-`.

**Caso C — Finalização explícita pelo usuário (com questões abertas):**
1. Altere o status para `FINAL`.
2. Execute a renomeação descrita no Caso A.
3. Nos HTMLs, mantenha os blocos `[SUPOSIÇÃO]` não resolvidos como documentação.
4. Registre no histórico que foi finalizado com questões em aberto (listando os IDs).

### Passo 6 — Incrementar versão e registrar no histórico

Incremente a versão (`versão: N+1`) e adicione uma linha ao `## Histórico`:

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
| <versão> | <data atual> | FINALIZAÇÃO | Todas as questões respondidas. Protótipo promovido para FINAL. Arquivos renomeados. | Copilot |
```

Para finalização explícita com questões abertas:
```markdown
| <versão> | <data atual> | FINALIZAÇÃO | Finalização solicitada pelo usuário. Questões ainda abertas: <lista de IDs>. Protótipo promovido para FINAL. Arquivos renomeados. | <usuário> |
```

### Passo 7 — Salvar artefatos atualizados

- Sobrescrever o artefato Markdown com o conteúdo atualizado (ou salvar com novo nome se promovido a FINAL).
- Sobrescrever os HTMLs das telas que foram modificadas.
- Se promovido a FINAL: deletar os arquivos com prefixo `DRAFT-` originais.

### Passo 8 — Apresentar resumo ao usuário

Exibir:
1. **Questões respondidas** nesta iteração (IDs e resumo das respostas).
2. **Atualizações realizadas** (quais seções do artefato e quais HTMLs foram modificados).
3. **Novas questões** adicionadas neste ciclo (se houver), com IDs e descrição.
4. **Ciclo de refinamento** atual e ciclos restantes (ex: *"Ciclo 1 de 2 — resta 1 ciclo de refinamento"*).
5. **Status atual** do protótipo (`DRAFT` ou `FINAL`).
6. Se ainda DRAFT: lista completa das questões que permanecem em aberto.
7. Se FINAL: confirmação de renomeação dos arquivos e remoção dos banners DRAFT.

## Seção de Respostas Históricas

O artefato deve manter um registro completo de todas as respostas fornecidas ao longo dos ciclos. A seção `## Questões em Aberto` funciona como registro vivo — questões respondidas ficam marcadas com `[x]` e a resposta fica indentada abaixo, preservando o histórico completo de decisões.

> Nunca remover questões respondidas da seção `## Questões em Aberto`. Apenas marcar como `[x]` e adicionar a resposta. Isso garante rastreabilidade.

Restrições:
- Responder em português-BR.
- Não gerar código de aplicação; apenas artefatos de UX e protótipos visuais.
- Máximo de **2 ciclos de refinamento** com novas questões. Após o ciclo 2, nenhuma nova questão deve ser proposta.
- Não alterar questões já respondidas (histórico é imutável).
- Se o artefato já for `FINAL`, encerrar sem alterações.
