```prompt
---
agent: agent
description: "Gerar e manter script de start para dev-resources a partir do application.yml"
name: "di-setup-dev-resources"
argument-hint: "Contexto opcional: servicos desejados, portas, restricoes"
---

Assuma o papel de engenheiro de plataforma.

Referencias obrigatorias:
- core/src/main/resources/application.yml
- core/src/main/resources/application-*.yml
- dev-resources/db/docker-compose.db.yml
- dev-resources/cache/docker-compose.cache.yml
- dev-resources/mq/docker-compose.mq.yml
- dev-resources/storage/docker-compose.storage.yml
- dev-resources/.env.example
- docs/ai/workflows.md

Objetivo:
- Ler configuracoes da aplicacao e identificar recursos externos (db, cache, mq, storage).
- Mapear cada recurso para compose files em dev-resources.
- Criar ou atualizar dev-resources/start-dev-resources.sh de forma idempotente.

Regras de execucao:
- Ler application.yml e qualquer application-*.yml existente.
- Inferir dependencias por chaves comuns (spring.datasource, spring.data.mongodb, spring.redis, spring.rabbitmq, minio).
- Nao usar .env, .env.local ou qualquer variacao de env para determinar recursos utilizados.
- Nao usar arquivos em dev-resources/, architecture/ ou docs/ para determinar recursos utilizados.
- Gerar script com:
  - set -euo pipefail
  - suporte a flags (--all, --db, --cache, --mq, --storage)
  - uso de docker compose com -f para cada stack
  - suporte a .env em dev-resources (usar --env-file .env se existir)
  - validacao da existencia dos compose files
  - output simples indicando stacks iniciadas
- Quando --all for usado, iniciar apenas as stacks configuradas no projeto.
- Se uma stack nao for detectada na configuracao, ela nao deve ser iniciada nem por --all.
- Se o script ja existir, atualizar conteudo mantendo nome e caminho.

Formato de saida obrigatorio:
- Secao 1: Diagnostico de dependencias (o que foi detectado e onde)
- Secao 2: Mapeamento de recursos -> compose
- Secao 3: Mudancas de arquivos (com caminho)
- Secao 4: Conteudo completo de dev-resources/start-dev-resources.sh

Persistencia obrigatoria:
- Criar ou atualizar dev-resources/start-dev-resources.sh.

Restricoes:
- Responder em portugues-BR, ASCII apenas.
- Nao alterar codigo da aplicacao.
- Nao executar comandos.
```
