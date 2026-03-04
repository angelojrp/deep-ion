# Regras de Negócio — Gestão de Tenants

**Tema:** `tenants`  
**Data de geração:** 2026-03-02  
**Fonte base:** Plano de Casos de Uso `tenants-plano-uc.md` (status: APROVADO, 2026-03-02)  
**Escopo:** RN-001 a RN-012 (UC-001 a UC-005). UC-006 excluído do escopo deste módulo por decisão QA-01.

---

## Catálogo de Regras

---

### RN-001 — Imutabilidade e Propagação do `tenant_id`

- **Nome:** Imutabilidade e Propagação do `tenant_id`
- **Descrição objetiva:** O `tenant_id` deve ser gerado como ULID automaticamente no momento do cadastro do tenant (UC-002), nunca aceitar valor externo, ser imutável após a criação e ser propagado obrigatoriamente como claim no JWT de todo usuário pertencente ao tenant.
- **Justificativa de negócio:** Garantir a rastreabilidade e o isolamento de dados entre tenants no modelo de banco compartilhado; evitar adulteração de identidade de tenant via API.
- **Casos de uso impactados:** `UC-002` (geração), `UC-005` (exibição readonly)
- **Dados de entrada:** Campo `nome` e demais dados do formulário de provisionamento (o `tenant_id` é gerado internamente, não recebido como entrada).
- **Resultado esperado:** `tenant_id` ULID único gerado e persistido; imutável após criação; incluído em todos os JWTs de membros do tenant como claim `tenant_id`.

---

### RN-002 — Unicidade e Imutabilidade do `slug`

- **Nome:** Unicidade e Imutabilidade do `slug`
- **Descrição objetiva:** O `slug` deve ser único em toda a plataforma (sem distinção por tenant) e é imutável após a confirmação do cadastro do tenant. Tentativas de criar ou atualizar um tenant com `slug` já existente devem ser rejeitadas com erro de validação.
- **Justificativa de negócio:** O `slug` compõe a URL canônica do tenant (`app.deepion.net/<slug>`); duplicação ou alteração posterior gera inconsistência de URLs e potencial conflito de roteamento.
- **Casos de uso impactados:** `UC-002` (criação — FE-01 em caso de duplicata), `UC-005` (exibição readonly; edição do `slug` não é permitida)
- **Dados de entrada:** Valor do campo `slug` no momento da criação (Passo 7 do UC-002).
- **Resultado esperado:** Cadastro aceito apenas se o `slug` é único; rejeição com mensagem "Este slug já está em uso" se duplicado. Após criação, o campo `slug` é readonly em todos os contextos.

---

### RN-003 — Geração Automática do `slug` a Partir do `nome`

- **Nome:** Geração Automática do `slug`
- **Descrição objetiva:** O `slug` é gerado automaticamente a partir do `nome` do tenant seguindo a normalização: converter para lowercase, substituir espaços e caracteres especiais por hífens, remover caracteres não alfanuméricos (exceto hífens) e colapsar hífens consecutivos em um único. O campo `slug` gerado deve ser editável pelo Admin da Plataforma antes de salvar.
- **Justificativa de negócio:** Reduzir o esforço manual no cadastro e garantir consistência de formato nas URLs de tenant.
- **Casos de uso impactados:** `UC-002` (FA-01 — geração em tempo real durante preenchimento do `nome`)
- **Dados de entrada:** Valor digitado no campo `nome` (ex.: "Acme Corp" → "acme-corp").
- **Resultado esperado:** Campo `slug` preenchido automaticamente conforme o usuário digita o `nome`, editável antes de salvar, imutável após confirmação.

> ⚠ **QA-03 em aberto:** O comportamento em caso de colisão de `slug` gerado (ex.: "Acme Corp" e "Acme Corp." gerando o mesmo slug "acme-corp") não está definido. Ver seção de cenários de borda.

---

### RN-004 — Obrigatoriedade dos Claims `tenant_id` e `papel` no JWT

- **Nome:** Claims Obrigatórios no JWT (`tenant_id` + `papel`)
- **Descrição objetiva:** Nenhum token JWT pode ser emitido pelo Keycloak sem conter obrigatoriamente os claims `tenant_id` (ULID do tenant do usuário) e `papel` (papel do usuário dentro do tenant). O mapper de claim JWT deve ser configurado no provisionamento de cada tenant.
- **Justificativa de negócio:** A autorização fina do backend é baseada exclusivamente na combinação `tenant_id` + `papel` extraída do JWT. Tokens sem esses claims tornam impossível o isolamento de dados e o controle de acesso.
- **Casos de uso impactados:** `UC-002` (configuração do mapper — Passo 10)
- **Dados de entrada:** Atributos do usuário no Keycloak: `tenant_id` (ULID do tenant), `papel` (ex.: `ADMIN_TENANT`).
- **Resultado esperado:** Todo JWT emitido para usuários do tenant contém os claims `tenant_id` e `papel` com valores corretos.

> ℹ **Nota:** UC-006 (Primeiro Login SSO do Admin de Tenant) foi excluído do escopo deste módulo por decisão QA-01. A validação do JWT no contexto de login é responsabilidade do módulo `auth`.

---

### RN-005 — `tenant_id` como Discriminador em Todas as Tabelas

- **Nome:** Discriminador de Tenant no Banco de Dados
- **Descrição objetiva:** O `tenant_id` deve ser coluna obrigatória e indexada em todas as tabelas do banco de dados compartilhado que armazenam dados de qualquer tenant. Tabelas sem `tenant_id` como discriminador não são permitidas para entidades relacionadas a tenants.
- **Justificativa de negócio:** Garantir isolamento lógico de dados no modelo de infraestrutura compartilhada do MVP, permitindo queries seguras e auditáveis por tenant.
- **Casos de uso impactados:** `UC-002` (o `tenant_id` deve ser persistido e indexado no banco no momento do provisionamento — Passo 9)
- **Dados de entrada:** `tenant_id` ULID gerado no provisionamento.
- **Resultado esperado:** Registro do tenant persistido com `tenant_id` como chave discriminadora indexada; todas as entidades associadas ao tenant herdam этот discriminador.

---

### RN-006 — Invalidação Imediata de Sessões ao Desativar Tenant

- **Nome:** Invalidação Imediata de Sessões na Desativação
- **Descrição objetiva:** Ao desativar um tenant (`status = ATIVO` → `INATIVO`), o sistema deve invalidar imediatamente todas as sessões ativas (tokens JWT) dos membros do tenant no Keycloak. Não é permitida desativação apenas no banco de dados sem invalidação das sessões.
- **Justificativa de negócio:** Evitar que membros de um tenant desativado continuem com sessões válidas e acessem dados da plataforma, o que representaria uma falha de segurança e controle de acesso.
- **Casos de uso impactados:** `UC-003` (Passos 5–6 do FP)
- **Dados de entrada:** `tenant_id` do tenant sendo desativado.
- **Resultado esperado:** Após a desativação, qualquer requisição de membro do tenant com token antigo é rejeitada pelo Keycloak (token inválido/revogado).

---

### RN-007 — Reativação de Tenant Exclusiva via Toggle na Tela de Detalhe

- **Nome:** Reativação Exclusiva via Tela de Detalhe
- **Descrição objetiva:** A ação de reativar um tenant (`status = INATIVO` → `ATIVO`) está disponível exclusivamente via toggle na tela de detalhe do tenant (Tela 04), acionada pelo Admin da Plataforma. Não existe nenhum controle de reativação na listagem de tenants (Tela 01).
- **Justificativa de negócio:** Diferenciar deliberadamente a reativação (ação intencional na tela de detalhe) da desativação (disponível também na listagem), reduzindo o risco de reativação acidental em lote.
- **Casos de uso impactados:** `UC-004` (único ponto de entrada para reativação)
- **Dados de entrada:** Gesto de mover o toggle de DESLIGADO para LIGADO na tela de detalhe.
- **Resultado esperado:** A listagem (UC-001) NÃO exibe nenhuma ação de reativação para tenants INATIVO. A reativação em UC-004 é executada diretamente sem modal de confirmação.

---

### RN-008 — Modal de Confirmação Obrigatório na Desativação

- **Nome:** Confirmação Obrigatória na Desativação
- **Descrição objetiva:** A desativação de um tenant (UC-003) requer obrigatoriamente a exibição de um Modal de Confirmação antes de executar qualquer operação no backend. Ao cancelar no modal, nenhuma alteração é aplicada e, se a ação foi acionada via toggle, o toggle retorna visualmente para a posição LIGADO.
- **Justificativa de negócio:** Proteger contra desativação acidental — ação de alto impacto que bloqueia imediatamente o acesso de todos os membros do tenant.
- **Casos de uso impactados:** `UC-003` (FP — Passo 2; FA-01 — cancelar)
- **Dados de entrada:** Clique no botão "Desativar" ou movimento do toggle de LIGADO para DESLIGADO.
- **Resultado esperado:** Modal exibido com nome do tenant, contagem de membros impactados e call-to-action destrutivo. Ao cancelar: modal fechado, status inalterado, toggle retorna para LIGADO.

---

### RN-009 — Separação de Responsabilidades: Membros são Gerenciados pelo Admin de Tenant

- **Nome:** Leitura de Membros Apenas pelo Admin da Plataforma
- **Descrição objetiva:** O Admin da Plataforma pode visualizar apenas a contagem de `membros_ativos` de um tenant. Qualquer ação de gerenciamento de membros (convite, remoção, listagem individual) é responsabilidade exclusiva do Admin de Tenant, no módulo RM-F03.
- **Justificativa de negócio:** Separação clara de papéis: o Admin da Plataforma gerencia a existência do tenant (provisionar, ativar, desativar), enquanto o Admin de Tenant gerencia quem pertence ao tenant. Evita violação de privacidade e conflito de operações.
- **Casos de uso impactados:** `UC-005` (campo `membros_ativos` exibido como readonly sem controles de gerenciamento)
- **Dados de entrada:** Visualização da tela de detalhe do tenant.
- **Resultado esperado:** Na tela de detalhe, o campo `membros_ativos` exibe apenas a contagem numérica; nenhum botão de "Convidar membro", "Ver membros" ou equivalente está disponível para o Admin da Plataforma nesta tela.

---

### RN-010 — Papéis Válidos no MVP da Plataforma

- **Nome:** Enumeração de Papéis Válidos
- **Descrição objetiva:** Os papéis válidos para membros de qualquer tenant na plataforma são exclusivamente: `PO`, `Arquiteto`, `Dev`, `QA`, `Gate Keeper`. Papéis adicionais, sub-papéis ou hierarquias não estão previstos no MVP.
- **Justificativa de negócio:** Manter o modelo de autorização simples e auditável no MVP; expansão de papéis é pós-MVP.
- **Casos de uso impactados:** `UC-001` (contexto de exibição de membros), `UC-002` (contexto do `papel = ADMIN_TENANT` atribuído ao admin inicial)
- **Dados de entrada:** Qualquer atribuição de papel no sistema.
- **Resultado esperado:** O sistema rejeita atribuições de papéis fora da lista enumerada. O papel `ADMIN_TENANT` é um papel especial do sistema, diferente dos papéis operacionais listados acima.

---

### RN-011 — Autorização Fina é Responsabilidade Exclusiva do Backend

- **Nome:** Autorização Fina no Backend
- **Descrição objetiva:** O Keycloak fornece exclusivamente autenticação e emissão de claims (`tenant_id`, `papel`). A lógica de autorização fina (o que cada papel pode fazer em cada tenant) é responsabilidade exclusiva do backend, que valida a combinação `tenant_id` + `papel` em cada requisição.
- **Justificativa de negócio:** Manter o Keycloak desacoplado da lógica de negócio; centralizar autorização no backend facilita auditoria e evolução das regras sem alterações no IdP.
- **Casos de uso impactados:** Todos os UCs deste módulo (contexto geral de segurança)
- **Dados de entrada:** JWT recebido em qualquer requisição autenticada.
- **Resultado esperado:** O Keycloak valida apenas a autenticidade do token e fornece os claims; o backend é responsável por rejeitar ou permitir a operação com base nos claims recebidos.

> ℹ **Nota:** UC-006 (Primeiro Login SSO do Admin de Tenant, diretamente relacionado ao fluxo de autenticação e validação de claims em primeiro acesso) foi excluído do escopo deste módulo por decisão QA-01.

---

### RN-012 — Paginação da Listagem e Cálculo de Membros Ativos

- **Nome:** Paginação e Cálculo de `membros_ativos`
- **Descrição objetiva:** A listagem de tenants (UC-001) é paginada com exatamente 20 registros por página. A contagem `membros_ativos` exibida em cada linha e na tela de detalhe inclui apenas membros com `status_convite = ATIVO`; membros com outros status (ex.: `PENDENTE`, `REVOGADO`) não são contabilizados.
- **Justificativa de negócio:** Performance e UX na listagem (evitar carregamento de todos os registros); precisão do indicador de membros ativos (refletir apenas usuários com acesso efetivo ao tenant).
- **Casos de uso impactados:** `UC-001` (listagem paginada e exibição de `membros_ativos`), `UC-003` (exibição de `membros_ativos` no modal de confirmação)
- **Dados de entrada:** Parâmetros de paginação `page` e `size` na query string; status dos convites dos membros.
- **Resultado esperado:** Listagem retorna no máximo 20 registros por página. A coluna `membros_ativos` e o campo homônimo na tela de detalhe exibem apenas a contagem de membros com `status_convite = ATIVO`.

---

## Cenários de Borda

### Limites de valor
- **`nome` com 100 caracteres exatos:** deve ser aceito; com 101 caracteres deve ser rejeitado com validação de comprimento.
- **`slug` com 50 caracteres exatos:** deve ser aceito; com 51 caracteres deve ser rejeitado.
- **`membros_ativos = 0`:** listagem e modal de confirmação de desativação devem exibir "0 membros" sem erro de renderização.
- **`telefones_admin` vazio (array vazio):** deve ser aceito no provisionamento (campo opcional).

### Slugs e colisões (QA-03 — em aberto)
- **Colisão de slug gerado:** nomes como "Acme Corp" e "Acme Corp." geram o mesmo slug `acme-corp`. O comportamento de desambiguação (sufixo numérico automático vs. rejeição com edição manual) não está definido. **Impede a conclusão da FE-01 do UC-002 sem resolução.**
- **Slug com apenas hífens após normalização:** ex.: nome "---" → slug "---" → inválido. O sistema deve validar que o slug normalizado contém ao menos um caractere alfanumérico.

### Falhas de integração
- **Keycloak cria usuário, banco falha (QA-02 — em aberto):** tenant existe no Keycloak mas não no banco — estado inconsistente. O mecanismo de rollback/compensação não está definido.
- **Banco atualiza `status = INATIVO`, Keycloak falha ao invalidar sessões (UC-003 FE-01):** tenant fica em estado inconsistente — status `INATIVO` no banco mas sessões ainda ativas. Comportamento de compensação requer definição em ADR.
- **Envio de convite falha após provisionamento bem-sucedido (UC-002 FE-05):** o tenant e usuário Keycloak são mantidos; o sistema deve oferecer mecanismo de reenvio manual de convite na tela de detalhe.

### Datas
- Não há regras de data retroativa ou futura neste módulo — `criado_em` é sempre gerado pelo sistema no momento da criação.

### Paginação
- **Exatamente 20 registros:** deve exibir controle de paginação com "Página 1 de 1" (sem botão de próxima página).
- **21 registros:** deve exibir 2 páginas; a segunda página exibe apenas 1 registro.

---

## Regras de Priorização e Conflito

### Precedência entre regras
1. **RN-004** (claims obrigatórios no JWT) tem precedência sobre qualquer conveniência de fluxo: nenhum token pode ser emitido sem `tenant_id` e `papel`, mesmo que isso resulte em erro do fluxo de provisionamento.
2. **RN-005** (discriminador em todas as tabelas) é invariante arquitetural: novas tabelas que violem esta regra devem ser bloqueadas na revisão de arquitetura, independentemente do UC que as originou.
3. **RN-006** (invalidação de sessões na desativação) não pode ser omitida por motivos de performance: não existe "desativação rápida sem invalidar sessões".
4. **RN-008** (modal de confirmação na desativação) não pode ser removido de nenhuma superfície que acione a desativação, incluindo keyboards shortcuts ou APIs futuras.

### Comportamento em conflito
- **RN-002 vs. RN-003 (slug imutável vs. slug gerado automaticamente):** A imutabilidade (RN-002) aplica-se apenas após a confirmação do formulário. Antes de salvar, a geração automática (RN-003) e a edição manual são permitidas. Não há conflito em tempo de execução.
- **RN-007 (reativação apenas na tela de detalhe) vs. usabilidade:** Se um Admin da Plataforma clicar em um item de tenant INATIVO na listagem, o sistema deve navegar para a tela de detalhe (UC-005), onde o toggle de reativação estará disponível. A listagem não deve exibir atalhos de reativação.
- **RN-009 (Admin da Plataforma lê apenas contagem de membros) vs. futuras expansões:** Qualquer expansão que exponha lista individual de membros ao Admin da Plataforma requer revisão desta regra e do escopo do módulo `tenants` vs. `RM-F03`.
