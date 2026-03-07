---
plan_id: PLAN-20260306-001
task_id: T05
title: "Integrar hash SHA-256 dos prompts no AuditLedger do agents-engine"
fase: "FASE 2 — Rastreabilidade e Auditoria"
agent: Tech Lead
status: PENDENTE
depends_on: [T02, T03]
parallel_with: [T06]
gaps: [GP-06, GP-07]
recomendacao: R-04
prioridade: P1
---

## Tarefa T05 — Hash SHA-256 no AuditLedger

**Plano pai:** [PLAN-20260306-001](../PLAN-20260306-001_governanca-prompts.md)  
**Fase:** FASE 2 — Rastreabilidade e Auditoria  
**Agente executor:** Tech Lead  
**Depende de:** T02 (taxonomia), T03 (prompts com frontmatter e version)  
**Paralelo com:** T06  
**Prioridade:** P1

---

### Objetivo

Garantir que toda execução de skill no `agents-engine` registre, no `DecisionRecord` e no `AuditLedger`, o hash SHA-256 calculado no momento da carga de cada prompt utilizado. Isso habilita auditoria retroativa: dado um `DecisionRecord`, é possível identificar exatamente qual versão de qual prompt gerou aquela decisão — mesmo se o prompt for alterado posteriormente.

Esta é a única forma de transformar "o agente usou esse prompt" em evidência verificável e reprodutível.

**GAPs endereçados:**
- **GP-06** — Nenhum artefato de execução registra o prompt utilizado
- **GP-07** — Ausência de hash de prompt no Audit Ledger

---

### Contexto

O scaffold do `agents-engine` (PLAN-20260304-001) define a estrutura base de `AuditLedger` e `DecisionRecord`. Esta tarefa modifica essa estrutura para incluir o rastreamento de prompts. A dependência em T03 é necessária porque o hash deve ser registrado junto com `prompt_id` e `version` do frontmatter — campos que T03 adiciona.

> **Bloqueio:** Esta tarefa não pode ser iniciada se o PLAN-20260304-001 não estiver com status `APROVADO` ou `EM_EXECUÇÃO`. Verificar antes de iniciar.

---

### Especificação Técnica

#### 1. Função de cálculo de hash

Adicionar ao módulo `agents-engine/src/deep_ion/agents_engine/audit/` uma função utilitária:

```python
import hashlib
from pathlib import Path

def compute_prompt_hash(prompt_path: Path) -> str:
    """Calcula SHA-256 do conteúdo de um arquivo de prompt.
    
    Args:
        prompt_path: Caminho absoluto do arquivo de prompt.
    
    Returns:
        String hexadecimal do hash SHA-256 (64 caracteres).
    
    Raises:
        FileNotFoundError: Se o arquivo não existir.
        PermissionError: Se o arquivo não puder ser lido.
    """
    content = prompt_path.read_bytes()
    return hashlib.sha256(content).hexdigest()
```

#### 2. Modelo PromptReference

Adicionar ao módulo de domínio do `agents-engine` um modelo Pydantic v2 para representar a referência ao prompt:

```python
from pydantic import BaseModel, Field
from datetime import datetime

class PromptReference(BaseModel, frozen=True):
    """Referência imutável a um prompt usado em uma execução de skill."""
    prompt_id: str          # ex: "SP-gestor-processos"
    version: str            # ex: "1.0.0"
    prompt_type: str        # ex: "system-prompt", "task-prompt", "runtime-prompt"
    file_path: str          # Caminho relativo à raiz do repositório
    sha256: str             # Hash SHA-256 calculado no momento da carga
    loaded_at: datetime = Field(default_factory=datetime.utcnow)
```

#### 3. Integração no DecisionRecord

Atualizar o modelo `DecisionRecord` no `agents-engine` para incluir lista de prompts utilizados:

```python
class DecisionRecord(BaseModel, frozen=True):
    # ... campos existentes ...
    prompts_used: list[PromptReference] = Field(default_factory=list)
    # Mantém retrocompatibilidade: campo opcional com default vazio
```

#### 4. Integração nos skills

Cada skill que carrega um prompt deve:
1. Chamar `compute_prompt_hash(prompt_path)` imediatamente após o carregamento do arquivo
2. Construir um `PromptReference` com os metadados do frontmatter + hash calculado
3. Incluir o `PromptReference` na lista `prompts_used` do `DecisionRecord` gerado

#### 5. Preenchimento do campo `sha256` no frontmatter

Como benefício secundário: após o cálculo inicial, o hash pode ser escrito de volta no campo `sha256` do frontmatter (campo adicionado por T03). Isso permite detecção rápida de divergência entre o hash em produção e o hash documentado no arquivo.

> ⚠️ Segurança: o hash é calculado sobre o conteúdo do arquivo em disco no momento da execução — não é uma assinatura criptográfica. Ele garante integridade de conteúdo, não autenticidade de origem.

---

### Riscos Específicos

- **R-T05-1** — Se o `agents-engine` não estiver scaffoldado (PLAN-20260304-001 não executado), esta tarefa não tem onde inserir o código. Verificar status antes de iniciar.
- **R-T05-2** — O campo `sha256` no frontmatter pode divergir do hash em disco se o arquivo for alterado após o frontmatter ser preenchido. Documentar esse comportamento esperado no PROC-010 (T04).
- **R-T05-3** — Em ambientes de CI sem acesso ao sistema de arquivos completo, os caminhos relativos de prompt devem ser resolvidos contra o diretório raiz do repositório. Garantir que a função `compute_prompt_hash` usa caminhos absolutos internamente.

---

### Artefatos de Saída

- `agents-engine/src/deep_ion/agents_engine/audit/prompt_hash.py` — função `compute_prompt_hash`
- `agents-engine/src/deep_ion/agents_engine/domain/prompt_reference.py` — modelo `PromptReference`
- Atualização de `DecisionRecord` com campo `prompts_used: list[PromptReference]`
- Testes unitários em `agents-engine/tests/unit/` cobrindo o cálculo de hash e o modelo

---

### Critérios de Aceite

- [ ] Função `compute_prompt_hash` implementada e testada com cobertura 100% na camada de domínio
- [ ] Modelo `PromptReference` imutável (`frozen=True`) com todos os campos obrigatórios
- [ ] `DecisionRecord` atualizado com campo `prompts_used` retrocompatível
- [ ] Pelo menos 1 skill existente integrado com o registry de hash (proof-of-concept)
- [ ] Testes unitários passando em CI
- [ ] `mypy --strict` sem erros nos módulos novos
