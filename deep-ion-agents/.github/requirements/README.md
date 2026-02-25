# DOM-02 Requirements Agent

Guia rápido para executar localmente os scripts do DOM-02.

## Estrutura

- `skill_req_00.py` — Duplicate & Conflict Detector
- `skill_req_01.py` — Business Analyst Agent (gera BAR)
- `skill_req_02.py` — Use Case Modeler Agent (gera UCs + matriz)
- `rn_catalog.py` — catálogo RN-01..RN-07 + FE determinístico
- `uc_repository.py` — leitura de UCs e similaridade V1 (TF-IDF/keywords)
- `audit_ledger.py` — schema e serialização de DecisionRecord
- `github_api.py` — cliente GitHub Issues/Comments/Labels
- `ai_provider.py` — chamada abstrata ao provedor de IA

## Pré-requisitos

- Python 3.11+
- Acesso ao repositório no GitHub via token

## Variáveis de ambiente

Obrigatórias:

- `GITHUB_TOKEN` — token com permissão de leitura/escrita em issues
- `GITHUB_REPOSITORY` — formato `owner/repo`

Opcionais (REQ-01/REQ-02 com LLM):

- `OPENAI_API_KEY` ou `AI_PROVIDER_API_KEY`
- `AI_PROVIDER_MODEL` (default: `gpt-4o-mini`)
- `AI_PROVIDER_URL` (default: endpoint OpenAI Chat Completions)

Sem chave de IA, REQ-01/REQ-02 usam fallback determinístico local.

## Smoke tests (staging)

```bash
python3 .github/requirements/skill_req_00.py --issue <issue>
python3 .github/requirements/skill_req_01.py --issue <issue>
python3 .github/requirements/skill_req_02.py --issue <issue>
```

## Validação local de sintaxe

```bash
python3 -m py_compile .github/requirements/*.py
```

## Fluxo esperado de labels

- `gate/1-aprovado`
- `req/duplicatas-verificadas`
- `req/bar-aguardando`
- `req/bar-aprovado`
- `gate/2-aguardando`

Em bloqueios automáticos:

- `blocked/rn-violation`
- `qa/bloqueado`
