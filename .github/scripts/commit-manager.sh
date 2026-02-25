#!/usr/bin/env bash
set -euo pipefail

# Commit Manager — Ciclo Completo de Pré-validação e Commits Semânticos
# Segue a ordem exata definida em .github/prompts/commit-manager.prompt.md
# NUNCA executa git push.

abort() {
  echo "$1" >&2
  exit 1
}

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

for cmd in git awk sed grep; do
  has_cmd "$cmd" || abort "Comando obrigatório não encontrado: $cmd"
done

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  abort "Diretório atual não é um repositório Git."
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"

# Passo 1 — Atualizar refs remotas
printf "\n[1/8] Atualizando refs remotas...\n"
git fetch origin

# Passo 2 — Verificar sincronia com upstream da branch atual
printf "\n[2/8] Verificando upstream da branch atual...\n"
set +e
upstream_ref="$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)"
status_upstream=$?
set -e
if [[ $status_upstream -ne 0 || -z "$upstream_ref" ]]; then
  abort "Branch sem upstream configurado. Configure com:
 git push --set-upstream origin ${current_branch}"
fi

ahead_remote_count="$(git rev-list HEAD..@{u} --count)"
if [[ "$ahead_remote_count" -gt 0 ]]; then
  printf "Branch local está atrás do remoto (%s commit(s)). Executando pull --ff-only...\n" "$ahead_remote_count"
  set +e
  pull_output="$(git pull --ff-only 2>&1)"
  pull_status=$?
  set -e
  if [[ $pull_status -ne 0 ]]; then
    printf "%s\n" "$pull_output" >&2
    abort "Branch local divergiu do remoto. Pull manual necessário antes de continuar."
  fi
else
  printf "Branch local sincronizada com upstream.\n"
fi

# Passo 3 — Verificar sincronia com origin/develop
printf "\n[3/8] Verificando sincronia com origin/develop...\n"
set +e
develop_head="$(git ls-remote --heads origin develop)"
status_develop=$?
set -e
if [[ $status_develop -ne 0 || -z "$develop_head" ]]; then
  echo "Branch origin/develop não encontrada. Passo de rebase ignorado."
else
  commits_behind_develop="$(git rev-list HEAD..origin/develop --count)"
  if [[ "$commits_behind_develop" -gt 0 ]]; then
    printf "Branch está atrás de origin/develop (%s commit(s)). Executando rebase...\n" "$commits_behind_develop"
    set +e
    rebase_output="$(git rebase origin/develop 2>&1)"
    rebase_status=$?
    set -e
    if [[ $rebase_status -ne 0 ]]; then
      conflict_files="$(git diff --name-only --diff-filter=U || true)"
      git rebase --abort >/dev/null 2>&1 || true
      if [[ -n "$conflict_files" ]]; then
        abort "Rebase em origin/develop gerou conflitos nos seguintes arquivos: ${conflict_files//$'\n'/, }.
 Resolva manualmente e execute: git rebase origin/develop"
      fi
      printf "%s\n" "$rebase_output" >&2
      abort "Rebase em origin/develop gerou conflitos nos seguintes arquivos: <lista>.
 Resolva manualmente e execute: git rebase origin/develop"
    fi
  else
    printf "Branch já está sincronizada com origin/develop.\n"
  fi
fi

# Passo 4 — Coletar arquivos com mudanças pendentes
printf "\n[4/8] Coletando mudanças pendentes...\n"
status_lines="$(git status --porcelain)"
if [[ -z "$status_lines" ]]; then
  echo "Nenhuma mudança pendente para commit."
  echo
  echo "## Commits realizados"
  echo
  echo "Nenhum commit foi criado."
  echo
  echo "## Próximo passo"
  echo "Para enviar ao remoto, execute manualmente:"
  echo "  git push origin ${current_branch}"
  echo
  echo "⚠️ git push NÃO foi executado automaticamente."
  exit 0
fi

# Mapas em arquivos temporários
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

files_list="$work_dir/files.txt"
groups_file="$work_dir/groups.tsv"
commits_file="$work_dir/commits.tsv"

# Filtra estados M/A/D/R/?
printf "%s\n" "$status_lines" | while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  x="${line:0:1}"
  y="${line:1:1}"
  path_part="${line:3}"

  if [[ "$x" == "R" || "$y" == "R" ]]; then
    # Formato: old -> new
    new_path="${path_part##* -> }"
    printf "%s\n" "$new_path"
    continue
  fi

  if [[ "$x" =~ [MAD\?] || "$y" =~ [MAD\?] ]]; then
    printf "%s\n" "$path_part"
  fi
done | awk '!seen[$0]++' > "$files_list"

if [[ ! -s "$files_list" ]]; then
  abort "Nenhum arquivo elegível (M/A/D/R/?) encontrado após filtro."
fi

scope_for_file() {
  local f="$1"
  case "$f" in
    .github/workflows/*) echo "workflows" ;;
    agents_specs/*|agents_skills/*|.github/requirements/*|.github/qa_negocial/*|.github/qa_tecnico/*) echo "agents" ;;
    docs/*|*.md|*.adoc|*.rst|*.txt|.github/prompts/*|plans/*|specs/*) echo "docs" ;;
    pom.xml|.gitignore|README*|Makefile|mvnw|mvnw.cmd|package.json|pyproject.toml|requirements.txt|setup.py) echo "root" ;;
    *conta*|*account*) echo "conta" ;;
    *transacao*|*transaçao*|*transaction*) echo "transacao" ;;
    *categoria*|*category*) echo "categoria" ;;
    *orcamento*|*orçamento*|*budget*) echo "orcamento" ;;
    *meta*|*goal*) echo "meta" ;;
    *relatorio*|*relatório*|*report*) echo "relatorio" ;;
    *) echo "shared" ;;
  esac
}

type_for_file() {
  local f="$1"
  # Regras explícitas
  if [[ "$f" == .github/workflows/* ]]; then
    echo "ci"
    return
  fi
  if [[ "$f" == *.sql ]]; then
    echo "chore"
    return
  fi
  if [[ "$f" == .github/prompts/* || "$f" == agents_specs/* || "$f" == docs/* || "$f" == *.md || "$f" == *.adoc || "$f" == *.rst ]]; then
    echo "docs"
    return
  fi

  # Heurística por diff
  local d
  d="$(git diff HEAD -- "$f" 2>/dev/null || true)"
  if [[ "$f" == *test* || "$f" == *Test* ]]; then
    echo "test"
  elif grep -Eiq '(^\+\s*fix|bug|corrig)' <<<"$d"; then
    echo "fix"
  elif grep -Eiq '(^\+\s*feat|nova funcionalidade|adiciona|adicionar)' <<<"$d"; then
    echo "feat"
  elif grep -Eiq '(^\+\s*refactor|refator)' <<<"$d"; then
    echo "refactor"
  elif grep -Eiq '(^\+\s*perf|otimiza|performance)' <<<"$d"; then
    echo "perf"
  elif grep -Eiq '^\+\s*(\{|\}|\)|\(|;)$' <<<"$d"; then
    echo "style"
  else
    echo "chore"
  fi
}

description_for_group() {
  local type="$1"
  local scope="$2"
  local files_csv="$3"

  if [[ "$scope" == "db" || "$files_csv" == *.sql* ]]; then
    local sql_file
    sql_file="$(tr ',' '\n' <<<"$files_csv" | grep -E '\.sql$' | head -n1 || true)"
    if [[ -n "$sql_file" ]]; then
      local base
      base="$(basename "$sql_file" .sql)"
      echo "migration ${base}"
      return
    fi
    echo "aplicar migration de banco"
    return
  fi

  case "$type" in
    ci) echo "atualizar pipeline de integração contínua" ;;
    chore) echo "ajustar manutenção do projeto" ;;
    feat) echo "adicionar melhorias no módulo" ;;
    fix) echo "corrigir comportamento no módulo" ;;
    refactor) echo "refatorar estrutura interna do módulo" ;;
    test) echo "ampliar cobertura de testes do módulo" ;;
    docs) echo "atualizar documentação do projeto" ;;
    perf) echo "otimizar desempenho do módulo" ;;
    style) echo "padronizar formatação do código" ;;
    *) echo "atualizar arquivos do módulo" ;;
  esac
}

# Passo 5/6 — Analisar e agrupar semanticamente
printf "\n[5/8] Analisando arquivos e classificando tipo/módulo...\n"
printf "\n[6/8] Agrupando por (tipo,módulo)...\n"
while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  # força diff para cumprir passo 5 (pode ser vazio para untracked)
  git diff HEAD -- "$file" >/dev/null 2>&1 || true

  if [[ "$file" == *.sql ]]; then
    type="chore"
    scope="db"
  else
    type="$(type_for_file "$file")"
    scope="$(scope_for_file "$file")"
  fi

  printf "%s\t%s\t%s\n" "$type" "$scope" "$file" >> "$groups_file"
done < "$files_list"

if [[ ! -s "$groups_file" ]]; then
  abort "Falha ao gerar grupos de commit."
fi

# Ordenação de tipos preferencial
order_of_type() {
  case "$1" in
    ci) echo 1 ;;
    chore) echo 2 ;;
    feat) echo 3 ;;
    fix) echo 4 ;;
    refactor) echo 5 ;;
    test) echo 6 ;;
    docs) echo 7 ;;
    perf) echo 8 ;;
    style) echo 9 ;;
    *) echo 99 ;;
  esac
}

sorted_groups="$work_dir/sorted_groups.tsv"
awk -F'\t' '{print $1"\t"$2"\t"$3}' "$groups_file" \
  | sort -t$'\t' -k1,1 -k2,2 -k3,3 > "$work_dir/grouped_raw.tsv"

# Constrói grupos únicos (tipo,scope) com lista de arquivos CSV
awk -F'\t' '
{
  key=$1"\t"$2
  if (files[key] == "") files[key]=$3
  else files[key]=files[key]","$3
}
END {
  for (k in files) print k"\t"files[k]
}
' "$work_dir/grouped_raw.tsv" > "$work_dir/groups_compact.tsv"

while IFS=$'\t' read -r type scope files_csv; do
  rank="$(order_of_type "$type")"
  printf "%s\t%s\t%s\t%s\n" "$rank" "$type" "$scope" "$files_csv"
done < "$work_dir/groups_compact.tsv" | sort -t$'\t' -k1,1n -k2,2 -k3,3 > "$sorted_groups"

# Passo 7 — Commit por grupo
printf "\n[7/8] Realizando commits por grupo semântico...\n"
idx=0
while IFS=$'\t' read -r _rank type scope files_csv; do
  [[ -z "$type" ]] && continue

  IFS=',' read -r -a files_arr <<< "$files_csv"

  # add
  git add -- "${files_arr[@]}"

  # mensagem
  desc="$(description_for_group "$type" "$scope" "$files_csv")"
  msg="${type}(${scope}): ${desc}"
  # limita para 72 chars no subject
  if [[ ${#msg} -gt 72 ]]; then
    msg="${msg:0:72}"
  fi

  # evita commit vazio
  if git diff --cached --quiet; then
    continue
  fi

  git commit -m "$msg" >/dev/null
  hash="$(git rev-parse --short HEAD)"
  file_count="${#files_arr[@]}"
  idx=$((idx + 1))
  printf "%s\t%s\t%s\t%s\n" "$idx" "$hash" "$msg" "$file_count" >> "$commits_file"
done < "$sorted_groups"

# Passo 8 — Resumo final
printf "\n[8/8] Resumo final\n\n"
echo "## Commits realizados"
echo
echo "| # | Hash    | Mensagem               | Arquivos |"
echo "|---|---------|------------------------|---------|"
if [[ -s "$commits_file" ]]; then
  while IFS=$'\t' read -r n h m c; do
    printf "| %s | %s | %s | %s |\n" "$n" "$h" "$m" "$c"
  done < "$commits_file"
else
  echo "| - | - | Nenhum commit criado | 0 |"
fi

echo
echo "## Próximo passo"
echo "Para enviar ao remoto, execute manualmente:"
echo "  git push origin ${current_branch}"
echo
echo "⚠️ git push NÃO foi executado automaticamente."
