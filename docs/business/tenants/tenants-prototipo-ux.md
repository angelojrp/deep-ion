# Protótipo UX: Gestão de Tenants

```yaml
status: FINAL
versão: 4
ciclo-refinamento: 2
data-criação: 2026-03-02
tema: tenants
```

---

## Contexto

- **Tema:** Gestão de Tenants (`tenants`)
- **Objetivo do protótipo:** Visualizar e validar as telas do painel de controle do Administrador da Plataforma para o provisionamento, listagem, edição e desativação de tenants no MVP da plataforma deep-ion.
- **Escopo (inclui):**
  - Listagem de tenants com busca e filtro por status
  - Cadastro de novo tenant (nome + slug único)
  - Confirmação de desativação (ação destrutiva)
  - Detalhe/edição de tenant (identificação, status, membros do squad)
- **Escopo (exclui):**
  - Infraestrutura dedicada por tenant (pós-MVP)
  - Self-service de cadastro (provisionamento é sempre manual no MVP)
  - Billing e controle de consumo
  - SSO com provedores externos
  - Fluxo de convite de membros (pertence ao módulo RM-F03)
  - Telas de Administrador de Tenant (acesso ao painel do próprio tenant)
- **Casos de uso vinculados:** N/A — brief MVP sem UC formalizados
- **Regras de negócio vinculadas:** N/A na camada de UX (autorização é responsabilidade exclusiva do backend via `tenant_id` + `papel` no JWT)

---

## Usuários e jornada

- **Persona principal:** Administrador da Plataforma deep-ion (equipe interna) — provisiona e gerencia os tenants.
- **Persona secundária:** Administrador de Tenant (representante do cliente) — receberá convite após provisionamento; telas de seu painel não estão incluídas neste protótipo.
- **Cenário de uso:** O Admin da Plataforma acessa o painel de controle para cadastrar um novo tenant (organização cliente), configurar o administrador inicial e acompanhar o status dos tenants existentes.
- **Jornada ponta a ponta (resumo):**
  1. Admin da Plataforma acessa **Listagem de Tenants** → busca/filtra tenants existentes ou inicia novo cadastro.
  2. Clica em **"+ Novo Tenant"** → acessa **Cadastro de Tenant** → preenche nome, slug e e-mail do admin inicial → confirma provisionamento.
  3. Sistema provisiona o tenant no Keycloak (realm único) e registra `tenant_id` no banco de dados.
  4. Admin do Tenant recebe convite por e-mail, realiza primeiro login SSO, recebe JWT com claims `tenant_id` + `papel`.
  5. Admin da Plataforma pode acessar o **Detalhe do Tenant** para editar nome, gerenciar membros ou **desativar** o tenant.
  6. Ao **desativar**, um **Modal de Confirmação** protege a ação destrutiva.

---

## Tabela de definições de atributos

| Descrição | Nome | Tipo | Domínio | Obrigatoriedade |
|---|---|---|---|---|
| Identificador único do tenant | `tenant_id` | ULID | Gerado automaticamente no cadastro | Obrigatório (não editável) |
| Nome da organização cliente | `nome` | string | Texto livre, máx. 100 chars | Obrigatório |
| Slug único do tenant | `slug` | string | Minúsculas, números, hífens; máx. 50 chars; único na plataforma | Obrigatório (imutável após cadastro) |
| Status do tenant | `status` | enum | `ATIVO`, `INATIVO` | Obrigatório |
| Data de criação | `criado_em` | datetime | ISO-8601 UTC | Obrigatório (gerado automaticamente) |
| E-mail do administrador inicial | `email_admin` | string (email) | Formato RFC 5322 | Obrigatório no cadastro |
| Primeiro nome do administrador inicial | `primeiro_nome_admin` | string | Texto livre, máx. 80 chars; armazenado como `firstName` no Keycloak e no banco de dados | Obrigatório no cadastro |
| Sobrenome do administrador inicial | `sobrenome_admin` | string | Texto livre, máx. 80 chars; armazenado como `lastName` no Keycloak e no banco de dados | Obrigatório no cadastro |
| Telefones do administrador inicial | `telefones_admin` | array\<string\> | Lista de números com código de país; padrão `+55`; zero ou mais entradas; formato `+CC XXXXXXXXX` | Opcional no cadastro |
| E-mail do membro do squad | `email_membro` | string (email) | Formato RFC 5322 | Obrigatório no convite |
| Papel do membro no squad | `papel` | enum | `PO`, `Arquiteto`, `Dev`, `QA`, `Gate Keeper` | Obrigatório no convite |
| Status do convite | `status_convite` | enum | `PENDENTE`, `ATIVO` | Obrigatório |

---

## Mapa de telas e fluxo

| # | Tela | Objetivo | Entrada principal | Saída esperada | UC vinculado | Protótipo Mobile | Protótipo Web |
|---|------|----------|-------------------|----------------|-------------|-----------------|---------------|
| 01 | Listagem de Tenants | Visualizar, buscar e filtrar tenants existentes; iniciar cadastro ou desativação | Navegação ao painel / URL direta | Tenant selecionado ou ação iniciada | N/A | [01-mobile-listagem-tenants.html](prototipos/01-mobile-listagem-tenants.html) | [01-web-listagem-tenants.html](prototipos/01-web-listagem-tenants.html) |
| 02 | Cadastro de Tenant | Provisionar novo tenant com nome, slug e e-mail do admin inicial | Clique em "+ Novo Tenant" | Tenant provisionado; convite enviado ao admin | N/A | [02-mobile-cadastro-tenant.html](prototipos/02-mobile-cadastro-tenant.html) | [02-web-cadastro-tenant.html](prototipos/02-web-cadastro-tenant.html) |
| 03 | Confirmação de Desativação | Confirmar ação destrutiva de desativação do tenant | Clique em "Desativar" na Tela 01 ou Tela 04, ou ao mover o toggle de status para INATIVO na Tela 04 | Tenant desativado; acesso de membros bloqueado; toast de sucesso | N/A | [03-mobile-confirmacao-desativacao.html](prototipos/03-mobile-confirmacao-desativacao.html) | [03-web-confirmacao-desativacao.html](prototipos/03-web-confirmacao-desativacao.html) |
| 04 | Detalhe / Edição de Tenant | Visualizar e editar dados do tenant; gerenciar membros do squad; desativar | Clique em "Ver detalhes" ou "Editar" na Tela 01 | Dados atualizados; membro removido/convidado; ou navegação para Tela 03 | N/A | [04-mobile-detalhe-tenant.html](prototipos/04-mobile-detalhe-tenant.html) | [04-web-detalhe-tenant.html](prototipos/04-web-detalhe-tenant.html) |

---

## Estados por tela

### Tela 01 — Listagem de Tenants

- **Estado carregando:** Skeleton cards (mobile) / skeleton rows de tabela (web) com animação shimmer.
- **Estado vazio (0 tenants):** Empty state com ícone 🏢, mensagem "Nenhum tenant encontrado" e botão "+ Provisionar Primeiro Tenant".
- **Estado com dados:** Lista de cards (mobile) / tabela (web) com avatar de iniciais, nome, slug, status badge (ATIVO/INATIVO), ações (ver detalhes, editar, desativar — reativação exclusiva via toggle na Tela 04).
- **Estado com filtro ativo:** Lista/tabela filtrada; chip de filtro destacado; contagem atualizada na summary bar.
- **Estado de erro de carregamento:** Banner inline `danger` com mensagem "Erro ao carregar tenants — tente novamente" e botão de retry.
- **Mensagens ao usuário (pt-BR):**
  - Vazio: *"Nenhum tenant cadastrado. Provisione o primeiro tenant para começar."*
  - Erro: *"Não foi possível carregar os tenants. Verifique a conexão e tente novamente."*
  - Busca sem resultado: *"Nenhum tenant encontrado para "[termo]"."*

### Tela 02 — Cadastro de Tenant

- **Estado inicial:** Formulário vazio; botão "Provisionar Tenant" desabilitado até campos obrigatórios preenchidos.
- **Estado com rascunho:** Slug sendo gerado automaticamente conforme nome é digitado; preview de URL atualizado em tempo real.
- **Estado de validação inline:** Campo `slug` — erro se formato inválido ou já em uso; campo `email_admin` — erro se formato inválido; campo `primeiro_nome_admin` — erro se vazio; campo `sobrenome_admin` — erro se vazio; entradas de `telefones_admin` — validação de código de país + número se preenchidas.
- **Estado de envio:** Botão em loading (spinner); campos desabilitados.
- **Estado de sucesso:** Navegação para Listagem + toast de sucesso "Tenant provisionado com sucesso. Convite enviado para admin@acmecorp.com."
- **Estado de erro de API:** Banner inline `danger` com mensagem de erro específica (ex.: slug já em uso).
- **Mensagens ao usuário (pt-BR):**
  - Sucesso: *"Tenant [Nome] provisionado. Convite enviado para [e-mail]."*
  - Slug duplicado: *"Este slug já está em uso. Escolha um slug diferente."*
  - Erro genérico: *"Não foi possível provisionar o tenant. Tente novamente."*

### Tela 03 — Confirmação de Desativação

- **Estado inicial (modal aberto):** Modal/bottom-sheet exibido sobre listagem desfocada; nome do tenant destacado em vermelho.
- **Estado de envio:** Botão "Desativar Tenant" em loading; botão "Cancelar" desabilitado temporariamente.
- **Estado de sucesso:** Modal fechado; toast de sucesso "Tenant desativado com sucesso."; item na lista atualizado para INATIVO.
- **Estado de erro:** Modal permanece aberto; banner `danger` com mensagem de erro.
- **Mensagens ao usuário (pt-BR):**
  - Confirmação: *"Desativar tenant invalidará imediatamente todas as sessões ativas dos X membros."*
  - Sucesso: *"[Nome] foi desativado. O acesso dos membros foi bloqueado."*
  - Erro: *"Não foi possível desativar o tenant. Tente novamente."*

### Tela 04 — Detalhe / Edição de Tenant

- **Estado de leitura:** Dados carregados; slug e tenant_id readonly; status toggle refletindo estado atual (toggle LIGADO = ATIVO; toggle DESLIGADO = INATIVO).
- **Estado de reativação via toggle:** Quando tenant está INATIVO, toggle exibido desligado. Ao ligar o toggle, tenant é reativado imediatamente sem modal de confirmação (ação não-destrutiva).
- **Estado de desativação via toggle:** Ao mover o toggle para DESLIGADO (ATIVO → INATIVO), o Modal de Confirmação (Tela 03) é exibido antes de executar a desativação. O toggle não executa a ação diretamente — aguarda confirmação. Ao cancelar no modal, o toggle retorna para LIGADO sem alterar o status do tenant.
- **Estado de edição:** Campo `nome` editável; botão "Salvar Alterações" habilitado após mudança.
- **Estado de contagem de membros:** Painel readonly exibindo apenas a contagem de membros ativos. Gerenciamento de membros é exclusivo do Administrador do Tenant (módulo RM-F03) — o Admin da Plataforma apenas visualiza a contagem.
- **Estado de erro de salvamento:** Banner inline `danger` com mensagem específica.
- **Mensagens ao usuário (pt-BR):**
  - Sucesso: *“Alterações salvas com sucesso.”*
  - Erro: *“Não foi possível salvar. Verifique os campos e tente novamente.”*

---

## Diretrizes de conteúdo e interação

### Hierarquia de informação
- **Web/Desktop:** Layout em 2 colunas (identificação + status na esquerda; membros + danger zone na direita) com sidebar de navegação permanente. Tabela para listagem com paginação.
- **Mobile:** Layout linear (single-column), cards para listagem, bottom-navigation com 3 itens, FAB para ação primária.

### Diferenças de comportamento entre plataformas
| Componente | Mobile | Web (Desktop) |
|---|---|---|
| Listagem de tenants | Cards (avatar, nome, slug, badge, ações) | Tabela com colunas (Tenant, ID, Status, Membros, Criado em, Ações) |
| Navegação | Bottom navigation (tabs) + FAB | Sidebar fixa com itens de menu |
| Modal de confirmação | Bottom sheet (desliza do rodapé) | Dialog centralizado com overlay |
| Formulário de cadastro | Single-column, full-width | 2-column grid com cards por seção |
| Ação primária | FAB "+" | Botão "+" no header da página |

### Labels e microcopy críticos
- Slug: *“Apenas letras minúsculas, números e hífens. Gerado automaticamente (lowercase, espaços → hífens, sem especiais) — editável antes de salvar.”*
- Tenant ID: *“Gerado automaticamente (ULID). Propagado como claim `tenant_id` no JWT.”*
- Slug readonly: *“🔒 O slug não pode ser alterado após o cadastro.”*
- Infraestrutura: *“No MVP, todos os tenants operam em infraestrutura compartilhada.”*
- URL do tenant: *“app.deepion.net/&lt;slug&gt;”* — exibida no preview do campo slug no cadastro.
- Desativar: *"Desativar invalida imediatamente todas as sessões ativas dos membros."*
- Reativar (toggle ON): *"Reativar habilitará o acesso dos membros imediatamente."*
- Desativar (toggle OFF): *"Ao desligar, o sistema solicitará confirmação antes de desativar o tenant."*

### Feedbacks imediatos (sucesso/erro)
- Toast de sucesso: padrão `toast--success`, aparece no topo, auto-dismiss em 5s.
- Erros de validação: inline, abaixo do campo afetado, com ícone ⚠.
- Ações destrutivas: sempre com modal de confirmação antes de executar.

### Regras de acessibilidade essenciais
- `aria-required="true"` em todos os campos obrigatórios.
- `role="alert"` e `hidden` alternado em mensagens de erro inline.
- `aria-live="polite"` no preview do slug (atualização dinâmica).
- `aria-current="page"` no item de navegação ativo.
- `aria-modal="true"` e `aria-labelledby` no modal de confirmação.
- Contraste mínimo 4.5:1 em todos os textos (design tokens mantidos).
- Foco gerenciado ao abrir/fechar modais.

---

## Critérios de validação UX

- **Hipótese a validar:** O fluxo de provisionamento (listagem → cadastro → confirmação) é compreensível e eficiente para o Administrador da Plataforma sem necessidade de instruções externas.
- **Métrica de sucesso:** Tempo de conclusão do cadastro ≤ 2 minutos; taxa de erro no slug ≤ 10% (geração automática reduz erros).
- **Critério de aprovação:** Admin da Plataforma consegue provisionar um tenant completo (nome + slug + admin inicial) em menos de 3 interações após chegar no formulário.
- **Riscos e ambiguidades:**
  - Geração automática do slug a partir do nome pode gerar conflitos em slugs similares (ex.: "Acme Corp" → "acme-corp" já em uso).
  - Fluxo de envio de convite ao admin do tenant não está totalmente mapeado — pertence ao backend e ao módulo de e-mail.
  - A tela de detalhe mistura edição de dados do tenant e gestão de membros — pode precisar de separação em abas em versões futuras.

---

## Decisão de uso do Stitch

- **Uso de MCP Google Stitch autorizado?** `Não`
- **Confirmado por:** Usuário
- **Data/hora da confirmação:** 2026-03-02
- **Observação sobre limite de API:** Usuário optou por não utilizar o Stitch para evitar consumo do limite de API. HTMLs locais foram gerados seguindo o fallback obrigatório.
- **Projetos Stitch listados ao usuário:** N/A (não autorizado)
- **Projeto Stitch escolhido pelo usuário:** N/A

---

## Integração MCP Google Stitch

- **Status:** `Não conectado`
- N/A — fallback ativado.

---

## Fallback (sem MCP)

- **Protótipos produzidos:** 8 arquivos HTML (4 telas × 2 plataformas — mobile e web) em `docs/business/tenants/prototipos/`, gerados a partir de `docs/ai/templates/prototipo-screen-template.html`.
- **Decisões de UX registradas:**
  - Mobile: layout de card com avatar de iniciais colorido; bottom navigation com 3 itens (Dashboard, Tenants, Config); FAB para criação; bottom sheet para modal de confirmação.
  - Web: sidebar fixa de 220px com navegação; tabela de dados para listagem; dialog centralizado para modal; layout 2-colunas no detalhe.
  - Design tokens do template mantidos integralmente (variáveis CSS `--color-*`, `--radius-*`).
  - Todas as suposições marcadas com `<div class="ux-note"><strong>[SUPOSIÇÃO]</strong>…</div>`.
- **Pendências para evolução visual futura:**
  - Integração com Stitch para versão navegável interativa.
  - Tela de "Painel do Admin de Tenant" (fora do escopo deste protótipo).
  - Tela de convite de membros (módulo RM-F03).
  - Estados intermediários de provisionamento (loading com etapas: criando no Keycloak → registrando no banco → enviando convite).

---

## Persistência

- **Artefato UX:** `docs/business/tenants/tenants-prototipo-ux.md` ✓ FINAL
- **Protótipos HTML:** `docs/business/tenants/prototipos/`
- **Formatos:** Markdown (`.md`) para artefato; HTML (`.html`) para protótipos.

---

## Questões em Aberto

- [x] QP-01: O slug deve ser imutável após o cadastro do tenant? Se sim, qual a mensagem de justificativa ao admin? — **Impacto:** Tela 04 (detalhe), microcopy do campo slug readonly.
  > **Resposta:** Será imutável. *(respondida em 2026-03-02)*

- [x] QP-02: O e-mail do administrador inicial faz parte do formulário de cadastro (Tela 02) ou é solicitado em etapa separada após o provisionamento? — **Impacto:** Tela 02 (cadastro), fluxo de provisionamento.
  > **Resposta:** Faz parte do cadastro. *(respondida em 2026-03-02)*

- [x] QP-03: Qual o formato exato do Tenant ID para exibição no frontend? (ex.: UUID v4, ULID, com prefixo "t_"?) — **Impacto:** Tela 01 (listagem), Tela 04 (detalhe), semântica do `tenant_id` em todas as telas.
  > **Resposta:** ULID. *(respondida em 2026-03-02)*

- [x] QP-04: Ao desativar um tenant, sessões ativas (tokens JWT em uso) são invalidadas imediatamente ou apenas novos logins são bloqueados? — **Impacto:** Tela 03 (confirmação), microcopy de "impacto imediato".
  > **Resposta:** Desativar todas as sessões ativas. *(respondida em 2026-03-02)*

- [x] QP-05: A operação de desativação de tenant é reversível (reativação disponível)? Se sim, quem pode reativar — somente o Admin da Plataforma? — **Impacto:** Tela 01 (ação de reativar no card/row), Tela 04 (toggle de status).
  > **Resposta:** Sim, pelo administrador da plataforma. *(respondida em 2026-03-02)*

- [x] QP-06: A geração automática do slug a partir do nome segue qual regra exata? (ex.: lowercase, espaços → hífens, acentos removidos, caracteres especiais removidos?) — **Impacto:** Tela 02 (comportamento dinâmico do campo slug).
  > **Resposta:** lowercase, sem caracteres especiais, hífen no lugar de espaços. *(respondida em 2026-03-02)*

- [x] QP-07: O preview de URL do tenant no formulário (ex.: `app.deep-ion.io/acme-corp`) reflete o padrão real de URL da plataforma? — **Impacto:** Tela 02 (campo slug, preview de URL).
  > **Resposta:** app.deepion.net/\<slug\>. *(respondida em 2026-03-02)*

- [x] QP-08: A contagem de "membros" exibida na listagem deve incluir convites pendentes ou apenas membros com acesso ativo? — **Impacto:** Tela 01 (coluna/campo "membros").
  > **Resposta:** Apenas ativos. *(respondida em 2026-03-02)*

- [x] QP-09: O Admin da Plataforma pode remover membros diretamente nesta tela (Tela 04), ou o gerenciamento de membros é exclusivo do módulo RM-F03 (Admin do Tenant)? — **Impacto:** Tela 04 (seção "Membros do Squad", ações de remoção).
  > **Resposta:** Somente o administrador do tenant tem acesso a visualizar ou manter os membros. O administrador da plataforma apenas visualiza a quantidade de membros ativos. *(respondida em 2026-03-02)*

- [x] QP-10: Existe paginação na listagem de tenants? Se sim, qual o tamanho de página padrão? — **Impacto:** Tela 01 (componente de paginação).
  > **Resposta:** 20 registros por página. *(respondida em 2026-03-02)*

- [x] QP-11: O campo `nome_completo_admin` adicionado ao Cadastro de Tenant (Tela 02) deve ser armazenado como atributo de usuário no Keycloak (`firstName` + `lastName`) ou apenas como metadado de contato no banco de dados? — **Impacto:** Tela 02 (campo único "Nome completo" vs. dois campos "Primeiro nome" + "Sobrenome"; integração com Keycloak).
  > **Resposta:** Armazenar na DB e no Keycloak, dois campos separados (`Primeiro nome` + `Sobrenome`). *(respondida em 2026-03-02)*

- [x] QP-12: "Telefones" é plural — o formulário de cadastro (Tela 02) deve suportar múltiplos números por administrador (ex.: celular + comercial), ou apenas um único campo? Existe validação de formato esperada (ex.: `(DD) 9XXXX-XXXX`)? — **Impacto:** Tela 02 (quantidade de campos de telefone e validação inline).
  > **Resposta:** Múltiplos números com opção internacional; código de país `+55` como padrão. *(respondida em 2026-03-02)*

- [x] QP-13: A reativação de tenant (QP-05: disponível pelo Admin da Plataforma) utilizará o toggle de status na Tela 04 — ou haverá uma ação dedicada "Reativar" na Tela 01 (card/row do tenant inativo)? — **Impacto:** Tela 01 (interação no card do tenant inativo), Tela 04 (toggle de status para tenant inativo).
  > **Resposta:** Toggle na Tela 04. *(respondida em 2026-03-02)*

- [x] QP-14: Ao mover o toggle para INATIVO na Tela 04, o sistema abre o Modal de Confirmação (Tela 03) antes de executar a desativação — ou a desativação ocorre diretamente, sem modal? — **Impacto:** Tela 04 (comportamento do toggle de status ao desativar), Tela 03 (se o modal é disparado pelo toggle além do botão "Desativar Tenant" na danger zone).
  > **Resposta:** Usar modal de confirmação. O toggle ao mover para INATIVO aciona o mesmo Modal de Confirmação (Tela 03) que o botão "Desativar Tenant" na danger zone. Ao cancelar no modal, o toggle retorna para LIGADO. *(respondida em 2026-03-02)*

---

## Inventário de TODOs e Suposições

| # | ID | Arquivo | Trecho | Tipo | Status | Resolução / Pendência |
|---|-----|---------|--------|------|--------|-----------------------|
| 1 | QP-03 | 01-mobile-listagem-tenants.html | `ID: t_01HXYZ…` | Suposição | Resolvido | Formato confirmado: ULID. |
| 2 | QP-08 | 01-mobile-listagem-tenants.html | Contagem de "membros" | Suposição | Resolvido | Confirmado: apenas membros ativos (status ATIVO). |
| 3 | QP-03 | 01-web-listagem-tenants.html | `t_01HXYZ…` (coluna Tenant ID) | Suposição | Resolvido | Idem item 1. |
| 4 | QP-08 | 01-web-listagem-tenants.html | Coluna "Membros" | Suposição | Resolvido | Idem item 2. |
| 5 | QP-06 | 02-mobile-cadastro-tenant.html | Regra de geração do slug | Suposição | Resolvido | Regra confirmada: lowercase, sem caracteres especiais, hífen no lugar de espaços. |
| 6 | QP-07 | 02-mobile-cadastro-tenant.html | Preview de URL do slug | Suposição | Resolvido | URL confirmada: `app.deepion.net/<slug>`. |
| 7 | QP-02 | 02-mobile-cadastro-tenant.html | E-mail do admin no formulário | Suposição | Resolvido | Confirmado: faz parte do formulário de cadastro. |
| 8 | QP-06 | 02-web-cadastro-tenant.html | Regra de geração do slug | Suposição | Resolvido | Idem item 5. |
| 9 | QP-02 | 02-web-cadastro-tenant.html | E-mail do admin no formulário | Suposição | Resolvido | Idem item 7. |
| 10 | QP-04 | 03-mobile-confirmacao-desativacao.html | Sessões ativas invalidadas | Suposição | Resolvido | Confirmado: desativação invalida todas as sessões ativas imediatamente. |
| 11 | QP-05 | 03-mobile-confirmacao-desativacao.html | Reativação disponível | Suposição | Resolvido | Confirmado: reativação disponível, executada pelo Administrador da Plataforma. |
| 12 | QP-04 | 03-web-confirmacao-desativacao.html | Sessões ativas invalidadas | Suposição | Resolvido | Idem item 10. |
| 13 | QP-01 | 04-mobile-detalhe-tenant.html | Slug imutável após cadastro | Suposição | Resolvido | Confirmado: slug é imutável após cadastro. |
| 14 | QP-09 | 04-mobile-detalhe-tenant.html | Lista de membros individuais | Lacuna de negócio | Resolvido | Admin da plataforma vê apenas contagem de ativos. Lista individual removida da Tela 04. |
| 15 | QP-09 | 04-mobile-detalhe-tenant.html | Botão "Convidar Membro" e ações de remoção | Lacuna de negócio | Resolvido | Idem item 14. Botão e ações de remoção removidos. Gerenciamento é exclusivo do Admin do Tenant. |
| 16 | QP-01 | 04-web-detalhe-tenant.html | Slug imutável após cadastro | Suposição | Resolvido | Idem item 13. |
| 17 | QP-09 | 04-web-detalhe-tenant.html | Tabela de membros e ações | Lacuna de negócio | Resolvido | Idem item 14. Tabela substituída por painel de contagem. |
| 18 | QP-10 | 01-mobile-listagem-tenants.html | Ausência de paginação | Lacuna de UX | Resolvido | Confirmado: paginação com 20 registros por página. |
| 19 | QP-10 | 01-web-listagem-tenants.html | Paginação simulada | Lacuna de UX | Resolvido | Confirmado: 20 registros por página. |
| 20 | QP-11 | 02-mobile-cadastro-tenant.html, 02-web-cadastro-tenant.html | Campo `nome_completo_admin` adicionado | Lacuna técnica | Resolvido | Dois campos separados: `primeiro_nome_admin` (`firstName` no Keycloak + DB) e `sobrenome_admin` (`lastName` no Keycloak + DB). |
| 21 | QP-12 | 02-mobile-cadastro-tenant.html, 02-web-cadastro-tenant.html | Campo `telefone` adicionado (opcional) | Lacuna de UX | Resolvido | Múltiplos números com seletor de código de país internacional; padrão `+55`. |
| 22 | QP-13 | 01-mobile/web, 04-mobile/web | Reativação de tenant (QP-05 confirmada) | Lacuna de UX | Resolvido | Reativação exclusiva via toggle na Tela 04. Botão dedicado "Reativar" removido da Tela 01. |
| 23 | QP-14 | 04-mobile-detalhe-tenant.html, 04-web-detalhe-tenant.html, 03-mobile-confirmacao-desativacao.html, 03-web-confirmacao-desativacao.html | Toggle de status ao desativar (confirmação necessária?) | Lacuna de UX | Resolvido | Confirmado: ao mover o toggle para INATIVO, o Modal de Confirmação (Tela 03) é exibido. Cancelar no modal reverte o toggle para LIGADO. Modal é disparado tanto pelo botão na danger zone quanto pelo toggle. |

---

## Histórico

| Versão | Data | Ação | Detalhes | Autor |
|--------|------|------|----------|-------|
| 1 | 2026-03-02 | CRIAÇÃO | Protótipo DRAFT criado a partir do brief `tenants-brief.md` (status FINAL, v4). Fallback sem MCP Stitch autorizado pelo usuário. 8 HTMLs gerados (4 telas × 2 plataformas). Questões em aberto: QP-01, QP-02, QP-03, QP-04, QP-05, QP-06, QP-07, QP-08, QP-09, QP-10. | Copilot |
| 2 | 2026-03-02 | REFINAMENTO | Ciclo 1. Questões respondidas: QP-01, QP-02, QP-03, QP-04, QP-05, QP-06, QP-07, QP-08, QP-09, QP-10. Novas questões geradas: QP-11, QP-12, QP-13. Questões ainda abertas: QP-11, QP-12, QP-13. Nova solicitação: campos `nome_completo_admin` e `telefone` adicionados ao formulário de cadastro. | Copilot |
| 3 | 2026-03-02 | REFINAMENTO | Ciclo 2 — limite de refinamentos atingido. Nenhuma nova questão será proposta após este ciclo. Questões respondidas: QP-11, QP-12, QP-13. Novas questões geradas: QP-14. Questões ainda abertas: QP-14. Atualizações: Tela 02 (dois campos de nome + multi-telefone internacional), Tela 01 (botão reativar removido), Tela 04 (toggle cobre reativação). | Copilot |
| 4 | 2026-03-02 | FINALIZAÇÃO | Todas as questões respondidas. Protótipo promovido para FINAL. QP-14 respondida: toggle de desativação aciona Modal de Confirmação (Tela 03). Telas 03 e 04 atualizadas com comportamento confirmado. Banners DRAFT removidos de todos os 8 HTMLs. Arquivos renomeados (prefixo DRAFT- removido). | Copilot |
