---
tema: tenants
data-geração: 2026-03-02
fonte-base: Protótipo FINAL (`docs/business/tenants/tenants-prototipo-ux.md`)
status: EXECUTADO
data-aprovação: 2026-03-02
data-execução: 2026-03-02
qa-01-decisão: UC-006 EXCLUÍDO do escopo deste módulo (Opção B aprovada pelo usuário)
artefatos-criados: UC-001, UC-002, UC-003, UC-004, UC-005, tenants-regras.md
---

# Plano de Casos de Uso — Gestão de Tenants

---

## 1. Cabeçalho do plano

| Campo | Valor |
|---|---|
| **Tema** | `tenants` |
| **Data de geração** | 2026-03-02 |
| **Fonte base adotada** | **Protótipo FINAL** — `docs/business/tenants/tenants-prototipo-ux.md` (v4, ciclo-refinamento: 2) |
| **Nota sobre precedência** | O protótipo FINAL prevalece sobre o brief em caso de conflito. Elementos ausentes do protótipo não foram planejados como UCs independentes (salvo `UC-006` — ver QA-01). |
| **Status** | `EXECUTADO` |

---

## 2. Resumo executivo

- O escopo cobre o **painel do Administrador da Plataforma** para provisionamento e gestão de tenants (organizações clientes) no MVP da deep-ion.
- Inclui o ciclo completo de vida de um tenant: listagem → provisionamento → edição → desativação → reativação.
- Não inclui: gerenciamento de membros do squad (RM-F03), telas do Admin de Tenant, billing, infraestrutura dedicada ou SSO com provedores externos.
- O provisionamento integra obrigatoriamente com o **Keycloak** (realm único, claim `tenant_id` + `papel` no JWT) e com o **banco de dados compartilhado** (discriminador `tenant_id` em todas as tabelas).
- Autorização fina é responsabilidade exclusiva do **backend** — o Keycloak fornece apenas autenticação e claims.
- **6 UCs previstos**, **12 RNs identificadas**, **2 atores** (Admin da Plataforma, Admin de Tenant).

| Métrica | Valor |
|---|---|
| UCs previstos | 6 |
| RNs identificadas | 12 |
| Atores envolvidos | 2 (Admin da Plataforma, Admin de Tenant) |
| Questões em aberto | 3 (QA-01, QA-02, QA-03) |

---

## 3. Inventário de Casos de Uso

| ID Provisório | Nome | Módulo | Classificação (T0–T3) | Prioridade MoSCoW | Esforço | Ator Principal | RNs Acionadas | Dependências |
|---|---|---|---|---|---|---|---|---|
| UC-001 | Listar Tenants | `tenants` | T0 | Must | S | Admin da Plataforma | RN-010, RN-012 | — |
| UC-002 | Provisionar Tenant | `tenants`, `auth` | T2 | Must | L | Admin da Plataforma | RN-001, RN-002, RN-003, RN-004, RN-005, RN-010 | — |
| UC-003 | Desativar Tenant | `tenants`, `auth` | T2 | Must | M | Admin da Plataforma | RN-006, RN-008 | UC-001 ou UC-005 |
| UC-004 | Reativar Tenant | `tenants`, `auth` | T1 | Should | S | Admin da Plataforma | RN-007 | UC-005 |
| UC-005 | Visualizar e Editar Tenant | `tenants` | T1 | Must | M | Admin da Plataforma | RN-001, RN-002, RN-009 | UC-001 |
| UC-006 | Primeiro Login SSO do Admin de Tenant | `auth` | T2 | Must | M | Admin de Tenant | RN-004, RN-011 | UC-002 *(convite enviado)* |

> ⚠ **QA-01:** UC-006 tem `confidence_score ≈ 0.55` — ver Seção 7. O protótipo FINAL exclui explicitamente as telas do Admin de Tenant; o fluxo de primeiro login consta apenas na jornada ponta-a-ponta do brief. A inclusão deste UC como escopo deste módulo requer confirmação do usuário antes da Etapa 2.

---

## 4. Fichas de escopo por UC

---

### UC-001 — Listar Tenants

- **Necessidade:** O Admin da Plataforma precisa visualizar todos os tenants cadastrados, acompanhar seus status e iniciar ações de provisionamento, edição ou desativação sem ter que navegar por múltiplas telas.
- **Pré-condições resumidas:** Admin da Plataforma autenticado com JWT válido contendo `papel = ADMIN_PLATAFORMA`; endpoint de listagem de tenants disponível.
- **Pós-condições resumidas:**
  - *Sucesso:* Lista de tenants exibida com nome, slug, status, contagem de membros ativos e ações disponíveis.
  - *Falha:* Banner de erro exibido com opção de retry; lista não é exibida.
- **Fluxos previstos:**
  - FP: Carregar e exibir lista paginada (20 por página)
  - FA-01: Busca por nome ou slug
  - FA-02: Filtro por status (ATIVO / INATIVO)
  - FA-03: Estado vazio (0 tenants cadastrados)
  - FE-01: Erro de carregamento (falha de API)
- **Atributos-chave:**
  - `tenant_id` (ULID)
  - `nome` (string)
  - `slug` (string)
  - `status` (enum: ATIVO, INATIVO)
  - `criado_em` (datetime)
  - `membros_ativos` (count, inteiro ≥ 0)
- **Questões em aberto:** —

---

### UC-002 — Provisionar Tenant

- **Necessidade:** O Admin da Plataforma precisa criar um novo tenant na plataforma, vinculando-o ao Keycloak e ao banco de dados, e enviando o convite de acesso ao administrador inicial do tenant.
- **Pré-condições resumidas:** Admin da Plataforma autenticado; Keycloak e banco de dados disponíveis; `slug` informado ainda não cadastrado.
- **Pós-condições resumidas:**
  - *Sucesso:* Tenant criado com `tenant_id` gerado (ULID), registrado no banco com `status = ATIVO`; usuário admin do tenant criado no Keycloak com atributos `tenant_id` e `papel`; mapper de claim JWT configurado; convite enviado por e-mail ao admin inicial.
  - *Falha:* Tenant não é criado; nenhuma operação no Keycloak ou banco é persistida (rollback); mensagem de erro específica exibida.
- **Fluxos previstos:**
  - FP: Preencher formulário (nome, slug, email_admin, primeiro_nome_admin, sobrenome_admin, telefones_admin) → confirmar → provisionar
  - FA-01: Slug gerado automaticamente a partir do nome (editável antes de salvar)
  - FA-02: Adição de múltiplos telefones com código de país
  - FE-01: Slug duplicado (já em uso)
  - FE-02: E-mail inválido
  - FE-03: Falha no Keycloak (criar usuário/configurar mapper)
  - FE-04: Falha na persistência no banco de dados
  - FE-05: Falha no envio do convite por e-mail
- **Atributos-chave:**
  - `nome` (string, máx. 100 chars)
  - `slug` (string, máx. 50 chars, único, imutável após criação)
  - `email_admin` (string, RFC 5322)
  - `primeiro_nome_admin` (string, máx. 80 chars)
  - `sobrenome_admin` (string, máx. 80 chars)
  - `telefones_admin` (array\<string\>, opcional, formato `+CC XXXXXXXXX`)
  - `tenant_id` (ULID, gerado automaticamente)
  - `status` (enum, inicia como ATIVO)
  - `criado_em` (datetime, gerado automaticamente)
- **Questões em aberto:** QA-02 (atomicidade da operação Keycloak + DB)

---

### UC-003 — Desativar Tenant

- **Necessidade:** O Admin da Plataforma precisa bloquear o acesso de todos os membros de um tenant, invalidando imediatamente todas as sessões ativas, com proteção contra ação acidental.
- **Pré-condições resumidas:** Admin da Plataforma autenticado; tenant com `status = ATIVO` selecionado.
- **Pós-condições resumidas:**
  - *Sucesso:* `status` do tenant alterado para `INATIVO`; todas as sessões ativas (tokens JWT) dos membros invalidadas imediatamente no Keycloak; toast de sucesso exibido; item na lista atualizado.
  - *Falha:* Status do tenant não é alterado; sessões não são invalidadas; modal permanece aberto com mensagem de erro.
- **Fluxos previstos:**
  - FP: Acionar "Desativar" (via botão na listagem ou danger zone na Tela 04 ou toggle ATIVO→INATIVO na Tela 04) → Modal de Confirmação exibido → confirmar → executar desativação
  - FA-01: Cancelar no modal de confirmação (toggle retorna para LIGADO se acionado via toggle)
  - FE-01: Falha na invalidação de sessões no Keycloak
  - FE-02: Falha na atualização de status no banco de dados
- **Atributos-chave:**
  - `tenant_id` (ULID)
  - `status` (enum: ATIVO → INATIVO)
  - `membros_ativos` (count, para exibição no modal de confirmação)
- **Questões em aberto:** QA-03 (comportamento do toggle ao cancelar já está definido no protótipo; sem questão aberta)

---

### UC-004 — Reativar Tenant

- **Necessidade:** O Admin da Plataforma precisa restaurar o acesso de um tenant previamente desativado, habilitando novamente o login dos membros.
- **Pré-condições resumidas:** Admin da Plataforma autenticado; tenant com `status = INATIVO` selecionado na Tela 04.
- **Pós-condições resumidas:**
  - *Sucesso:* `status` do tenant alterado para `ATIVO`; membros podem realizar login normalmente; toast de sucesso exibido; toggle reflete estado ATIVO.
  - *Falha:* Status não alterado; mensagem de erro inline exibida.
- **Fluxos previstos:**
  - FP: Acessar Tela 04 com tenant INATIVO → mover toggle para LIGADO → reativar imediatamente (sem modal de confirmação)
  - FE-01: Falha na reativação no Keycloak ou no banco de dados
- **Atributos-chave:**
  - `tenant_id` (ULID)
  - `status` (enum: INATIVO → ATIVO)
- **Questões em aberto:** —

---

### UC-005 — Visualizar e Editar Tenant

- **Necessidade:** O Admin da Plataforma precisa consultar os dados completos de um tenant e editar o campo `nome` quando necessário, além de visualizar a contagem de membros ativos.
- **Pré-condições resumidas:** Admin da Plataforma autenticado; tenant selecionado na Tela 01.
- **Pós-condições resumidas:**
  - *Sucesso (visualização):* Dados do tenant exibidos (`tenant_id`, `nome`, `slug` readonly, `status`, `criado_em`, contagem de membros ativos).
  - *Sucesso (edição):* `nome` atualizado no banco de dados; toast de sucesso exibido.
  - *Falha (edição):* Alteração não persistida; banner de erro inline exibido.
- **Fluxos previstos:**
  - FP-visualização: Carregar e exibir dados do tenant
  - FP-edição: Editar campo `nome` → salvar
  - FA-01: Navegar para desativação (acionar Tela 03)
  - FA-02: Navegar para reativação (toggle)
  - FE-01: Erro ao carregar dados do tenant
  - FE-02: Erro ao salvar edição
- **Atributos-chave:**
  - `tenant_id` (ULID, readonly)
  - `nome` (string, editável)
  - `slug` (string, readonly e imutável)
  - `status` (enum, via toggle)
  - `criado_em` (datetime, readonly)
  - `membros_ativos` (count, readonly — Admin do Tenant é o único gestor dos membros)
- **Questões em aberto:** —

---

### UC-006 — Primeiro Login SSO do Admin de Tenant ⚠ QA-01

- **Necessidade:** O Admin de Tenant (representante do cliente) precisa acessar a plataforma pela primeira vez via SSO Keycloak, redefinir sua senha e confirmar que seu JWT contém os claims `tenant_id` e `papel` corretos.
- **Pré-condições resumidas:** UC-002 concluído com sucesso (tenant e usuário criados no Keycloak); convite por e-mail recebido pelo Admin do Tenant com URL de acesso e credenciais iniciais.
- **Pós-condições resumidas:**
  - *Sucesso:* Admin do Tenant autenticado com JWT válido contendo `tenant_id` correto e `papel = ADMIN_TENANT`; senha redefinida; acesso ao painel do tenant concedido.
  - *Falha:* Login não concluído; JWT não emitido ou emitido sem claims obrigatórios.
- **Fluxos previstos:**
  - FP: Acessar URL do convite → autenticar via Keycloak → receber JWT com `tenant_id` + `papel` → redefinir senha → acessar painel
  - FE-01: Token expirado ou inválido
  - FE-02: JWT emitido sem claim `tenant_id` (violação de RN-004)
  - FE-03: Falha no endpoint de redefinição de senha do Keycloak
- **Atributos-chave:**
  - `tenant_id` (ULID, claim JWT)
  - `papel` (enum, claim JWT)
  - `email_admin` (string, identidade no Keycloak)
- **Questões em aberto:** QA-01 (UC fora do escopo das telas do protótipo — requer confirmação)

---

## 5. Inventário de Regras de Negócio

| ID Provisório | Descrição resumida | Tipo | UCs Relacionados |
|---|---|---|---|
| RN-001 | O `tenant_id` é gerado como ULID automaticamente no cadastro, é imutável e propagado como claim no JWT | obrigatória | UC-002, UC-005 |
| RN-002 | O `slug` deve ser único na plataforma e é imutável após o cadastro do tenant | obrigatória | UC-002, UC-005 |
| RN-003 | O `slug` é gerado automaticamente a partir do `nome` (lowercase, sem caracteres especiais, hífens no lugar de espaços) e pode ser editado antes de salvar | obrigatória | UC-002 |
| RN-004 | O JWT emitido pelo Keycloak deve conter obrigatoriamente os claims `tenant_id` e `papel`; nenhum token pode ser emitido sem ambos os claims | obrigatória | UC-002, UC-006 |
| RN-005 | O `tenant_id` deve ser discriminador obrigatório e indexado em todas as tabelas do banco de dados compartilhado, sem exceção | obrigatória | UC-002 |
| RN-006 | A desativação de um tenant invalida imediatamente todas as sessões ativas (tokens JWT) dos membros | obrigatória | UC-003 |
| RN-007 | A reativação de tenant é exclusivamente via toggle na Tela de Detalhe (Tela 04) pelo Admin da Plataforma; não há ação de reativação na listagem | obrigatória | UC-004 |
| RN-008 | A desativação de tenant requer Modal de Confirmação antes de executar; ao cancelar no modal, nenhuma alteração é aplicada e o toggle retorna para LIGADO | obrigatória | UC-003 |
| RN-009 | O Admin da Plataforma apenas visualiza a contagem de membros ativos; o gerenciamento de membros (convite, remoção) é exclusivo do Admin de Tenant (módulo RM-F03) | obrigatória | UC-005 |
| RN-010 | Os papéis válidos por tenant são exclusivamente: PO, Arquiteto, Dev, QA, Gate Keeper — sem sub-papéis ou hierarquia adicional no MVP | obrigatória | UC-001, UC-002 |
| RN-011 | A autorização fina é responsabilidade exclusiva do backend, via combinação `tenant_id` + `papel` do JWT; o Keycloak fornece apenas autenticação e claims | obrigatória | UC-006 |
| RN-012 | A listagem de tenants é paginada com 20 registros por página; a contagem de membros exibida inclui apenas membros com `status_convite = ATIVO` | obrigatória | UC-001 |

---

## 6. Riscos e premissas do plano

### Riscos

| ID | Descrição | Impacto | Probabilidade |
|---|---|---|---|
| R-PL-01 | A configuração do mapper de claim `tenant_id` no Keycloak pode não cobrir todos os fluxos de autenticação (ex.: refresh token, token exchange), emitindo tokens sem o claim em casos de borda | Alto — compromete o isolamento de tenant | Média |
| R-PL-02 | O `slug` gerado automaticamente pode colidir com slugs existentes para nomes similares (ex.: "Acme Corp" e "Acme Corp." → mesmo slug `acme-corp`); a regra de geração não especifica desambiguação | Médio — bloqueia a Tela 02 com erro | Alta |
| R-PL-03 | O fluxo de envio de convite por e-mail não está totalmente especificado (provedor de e-mail, template, expiração do link); falha aqui bloqueia o onboarding do Admin de Tenant | Alto — UC-002 incompleto sem convite | Média |
| R-PL-04 | UC-006 (Primeiro Login SSO) tem escopo ambíguo entre este módulo (`tenants`) e um futuro módulo de `auth`; sem definição, pode haver retrabalho na Etapa 2 | Médio | Alta |

### Premissas

| ID | Descrição |
|---|---|
| P-PL-01 | O Keycloak opera com realm único para toda a plataforma; `tenant_id` e `papel` são armazenados como atributos de usuário e mapeados como claims customizados |
| P-PL-02 | Infraestrutura compartilhada no MVP — modelo dedicado é pós-MVP |
| P-PL-03 | O contrato dos claims JWT (`tenant_id`, `papel` — nomenclatura, formato, obrigatoriedade) será formalizado no ADR de arquitetura (RM-F09) antes da implementação |
| P-PL-04 | A URL canônica de tenant é `app.deepion.net/<slug>` |
| P-PL-05 | O Admin da Plataforma é sempre um usuário interno da equipe deep-ion — não há auto-cadastro de tenants no MVP |

---

## 7. Questões em aberto consolidadas

| ID | Questão | UC/RN Relacionado | Impacto se não resolvida | Status |
|---|---|---|---|---|
| QA-01 | UC-006 (Primeiro Login SSO do Admin de Tenant): o protótipo FINAL exclui explicitamente as "Telas de Administrador de Tenant". Este UC deve ser incluído no escopo do módulo `tenants` ou delegado a um módulo `auth` separado / RM-F03? `confidence_score ≈ 0.55` — **escalada obrigatória antes da Etapa 2**. | UC-006 | Se excluído, o fluxo de onboarding do Admin de Tenant fica sem UC formalizado; se mantido neste módulo, pode gerar sobreposição com RM-F03 | Aberta |
| QA-02 | A operação de provisionamento (criação no Keycloak + inserção no banco + envio de e-mail) deve ser **atômica** ou tolerante a falhas parciais? Se o Keycloak suceder mas o banco falhar (ou vice-versa), qual é o comportamento de rollback/compensação? | UC-002, RN-005 | Sem definição, risco de tenant em estado inconsistente (existe no Keycloak mas não no banco, ou vice-versa) | Aberta |
| QA-03 | A regra de geração automática de slug (RN-003) não especifica o comportamento em caso de **colisão** (slug gerado já existente): o sistema deve adicionar sufixo numérico (`acme-corp-2`), bloquear e exigir slug manual, ou outro comportamento? | UC-002, RN-002, RN-003 | Sem definição, o FE-01 de UC-002 fica sem fluxo de desambiguação — experiência de usuário quebrada | Aberta |

---

## 8. Arquivos a serem criados na Etapa 2

Ao executar `di-uc-exec tema=tenants`, os seguintes arquivos serão criados:

```
docs/business/tenants/tenants-regras.md
docs/business/tenants/use-cases/UC-001.md
docs/business/tenants/use-cases/UC-002.md
docs/business/tenants/use-cases/UC-003.md
docs/business/tenants/use-cases/UC-004.md
docs/business/tenants/use-cases/UC-005.md
docs/business/tenants/use-cases/UC-006.md  ← pendente resolução de QA-01
```

> Se QA-01 for resolvida com a **exclusão** de UC-006 deste módulo, o arquivo `UC-006.md` não será criado na Etapa 2.

**Total:** 1 arquivo de regras + 5 a 6 arquivos de UC = **6 ou 7 arquivos**.

---

## 9. Gate de aprovação

> **Plano de Casos de Uso gerado e salvo em `docs/business/tenants/tenants-plano-uc.md`.**
>
> Revise o inventário de UCs, as fichas de escopo e as questões em aberto acima.
>
> - Para **aprovar** e avançar para a criação dos artefatos, execute: `@di-uc-exec tema=tenants`
> - Para **solicitar ajustes** no plano, descreva as correções e reenvie este prompt.
> - Para **cancelar**, descarte o arquivo de plano.

---

> ⚠ **Atenção antes de aprovar:** As questões **QA-01**, **QA-02** e **QA-03** estão abertas. Em particular, **QA-01 tem `confidence_score < 0.65`** e requer resposta antes da criação de UC-006.md na Etapa 2.
