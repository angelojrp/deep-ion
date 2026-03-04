# Template: Caso de Uso

## UC-{ID}: {Nome}

**Módulo:** `{modulo}`  
**Classificação de Impacto:** T{N}  
**Prioridade:** `Must | Should | Could | Won't`  
**Esforço relativo:** `XS | S | M | L | XL`  
**Dependências:** {lista}  
**Regras de Negócio Acionadas:** RN-{XX}, RN-{YY}  
**Ator Principal:** {ator}  
**Pré-condições:** {lista}  
**Pós-condições de Sucesso:** {lista}  
**Pós-condições de Falha:** {lista}

## Tabela de definições de atributos (aplicável ao tema)

| Descrição | Nome | Tipo | Domínio | Obrigatoriedade |
|---|---|---|---|---|
| Identificador único da conta bancária do usuário | idConta | UUID | Gerado pelo sistema | Sim |
| Identificador do usuário titular no contexto da aplicação | idUsuario | UUID | Usuário autenticado | Sim |

### Análise curta (3-6 bullets)
- Necessidade:
- Escopo:
- Ambiguidades:
- RNs relevantes:

### Fluxo Principal

| Passo | Ator | Ação | Sistema |
|-------|------|------|---------|
| 1 | Usuário | ... | — |
| 2 | — | — | ... |

### Fluxos Alternativos

**FA-01: {Nome}** — Bifurca em Passo N  
...

### Fluxos de Exceção

**FE-01: {Nome}** — Bifurca em Passo N  
**Gatilho:** {condição}  
**RN Violada:** RN-{XX}  
**Resposta do Sistema:** {comportamento}

### Invariantes

- O sistema DEVE garantir {propriedade} durante toda a execução
- {Propriedade derivada de RN}

### Ambiguidades

- {Ambiguidade crítica identificada ou N/A}

### Critérios de Aceitação (Given/When/Then)

- **Cenário 1 — Caminho Feliz:** ...
- **Cenário 2 — FA-01:** ...
- **Cenário 3 — FE-01:** ...

## Persistência sugerida
- Pasta dos casos de uso: `docs/business/<tema>/use-cases/`
- Nome do arquivo: `US-XXX.md` (um arquivo por caso de uso)
- Formato: Markdown (`.md`)
