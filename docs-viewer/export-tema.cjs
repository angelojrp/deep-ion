#!/usr/bin/env node
/**
 * di-exportar-tema — script de exportação HTML estático
 * Uso: node export-tema.js <tema>
 */
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const tema = process.argv[2];
if (!tema) { console.error('Uso: node export-tema.js <tema>'); process.exit(1); }

const WORKSPACE = path.resolve(__dirname, '..');
const TEMA_DIR   = path.join(WORKSPACE, 'docs', 'business', tema);
const EXPORT_DIR = path.join(TEMA_DIR, 'export');

if (!fs.existsSync(TEMA_DIR)) {
  console.error(`❌ Pasta não encontrada: ${TEMA_DIR}`);
  process.exit(1);
}

// ── CSS compartilhado ──────────────────────────────────────────────────────
const PAGE_CSS = `
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fb;
      color: #142033;
      padding: 32px 16px;
    }
    .page {
      max-width: 860px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #d9e2f0;
      border-radius: 12px;
      padding: 32px 40px;
    }
    .back-link {
      display: inline-block;
      margin-bottom: 24px;
      font-size: 13px;
      color: #4778d9;
      text-decoration: none;
    }
    .back-link:hover { text-decoration: underline; }
    h1, h2, h3, h4 { color: #0f2040; margin-top: 1.4em; }
    h1 { font-size: 1.6rem; margin-top: 0; }
    h2 { font-size: 1.25rem; border-bottom: 1px solid #e8eef7; padding-bottom: 4px; }
    h3 { font-size: 1.05rem; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    pre {
      background: #101828;
      color: #e5ecf8;
      border-radius: 10px;
      padding: 14px 16px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
    }
    code:not(pre code) {
      background: #f0f4fc;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 0.9em;
      color: #1e3a8a;
    }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 14px; }
    th, td { border: 1px solid #dbe3f1; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f2f6fc; font-weight: 600; }
    tr:nth-child(even) td { background: #fafbfe; }
    blockquote {
      border-left: 4px solid #4778d9;
      margin: 1em 0;
      padding: 8px 16px;
      background: #f0f5ff;
      border-radius: 0 8px 8px 0;
      color: #2f4266;
    }
    a { color: #4778d9; }
    ul, ol { padding-left: 1.5em; }
    li { margin: 4px 0; }
    hr { border: none; border-top: 1px solid #d9e2f0; margin: 2em 0; }
    input[type=checkbox] { accent-color: #4778d9; margin-right: 6px; }
    /* frontmatter badge */
    .frontmatter {
      display: inline-flex; gap: 8px; flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .badge {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      padding: 3px 8px; border-radius: 20px;
      border: 1px solid #dbeafe; background: #eff6ff; color: #1e40af;
    }
    .badge.final { background: #dcfce7; border-color: #bbf7d0; color: #15803d; }
    .badge.draft { background: #fef9c3; border-color: #fde047; color: #92400e; }
`;

// ── Helper: frontmatter YAML → badges ──────────────────────────────────────
function extractFrontmatter(mdContent) {
  const match = mdContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { badges: '', body: mdContent };

  const yamlBlock = match[1];
  const body = mdContent.slice(match[0].length);
  const pairs = {};
  yamlBlock.split('\n').forEach(line => {
    const [k, ...v] = line.split(':');
    if (k) pairs[k.trim()] = v.join(':').trim();
  });

  const statusClass = (pairs.status || '').toLowerCase() === 'final' ? 'final' : 'draft';
  let badges = '<div class="frontmatter">';
  if (pairs.status)  badges += `<span class="badge ${statusClass}">Status: ${pairs.status}</span>`;
  if (pairs['versão']) badges += `<span class="badge">v${pairs['versão']}</span>`;
  if (pairs['data-criação']) badges += `<span class="badge">Criado: ${pairs['data-criação']}</span>`;
  if (pairs['ciclo-refinamento']) badges += `<span class="badge">Ciclo: ${pairs['ciclo-refinamento']}</span>`;
  badges += '</div>';
  return { badges, body };
}

// ── Helper: reescrever links internos no HTML já renderizado ────────────────────
// docDepth: 1 = arquivo em export/docs/, 2 = export/docs/subdir/
function rewriteLinks(html, docDepth) {
  const prefix = '../'.repeat(docDepth);
  return html
    // prototipos/XX.html  →  ../prototipos/XX.html  (ou ../../ se subdir)
    .replace(/href="(prototipos\/[^"]+)"/g, `href="${prefix}$1"`)
    // links .md  →  .html, também ajustando o prefixo
    .replace(/href="([^"]*)\.md(["#])/g, (_, p, suf) => {
      // Se o link já é relativo a docs/ (sem prefixo de subida), manter como está
      return `href="${p}.html${suf}"`;
    });
}

// ── Helper: converter MD → HTML autocontido ──────────────────────────────────
function mdToHtml(mdContent, title, backPath, docDepth = 1) {
  const { badges, body } = extractFrontmatter(mdContent);

  // Fix checkbox markdown: - [ ] / - [x]
  const processedBody = body
    .replace(/- \[x\]/g, '- <input type="checkbox" checked disabled>')
    .replace(/- \[ \]/g, '- <input type="checkbox" disabled>');

  const htmlBody = rewriteLinks(marked.parse(processedBody), docDepth);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>${PAGE_CSS}</style>
</head>
<body>
  <div class="page">
    <a class="back-link" href="${backPath}">← Voltar ao índice</a>
    ${badges}
    ${htmlBody}
  </div>
</body>
</html>`;
}

// ── Date helper ────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0];
}

// ── Slug → label amigável ──────────────────────────────────────────────────
function slugToLabel(slug) {
  return slug
    .replace(/^\d+-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function fileTypeLabel(filename) {
  if (/brief/.test(filename)) return 'Brief de Descoberta';
  if (/prototipo-ux/.test(filename)) return 'Protótipo UX';
  if (/regras/.test(filename)) return 'Regras de Negócio';
  if (/US-/i.test(filename)) return 'Caso de Uso';
  return 'Documento';
}

function temaLabel(t) {
  return t.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── 1. Descoberta ───────────────────────────────────────────────────────────
console.log('\n🔍 Descobrindo artefatos...');

const mdFiles = [];
const htmlFiles = [];

function walkDir(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'export') continue; // skip export dir
      walkDir(full, rel);
    } else if (e.name.endsWith('.md')) {
      mdFiles.push({ rel, full });
    } else if (e.name.endsWith('.html')) {
      htmlFiles.push({ rel, full });
    }
  }
}

walkDir(TEMA_DIR);

console.log(`\n📄 Markdown (${mdFiles.length}):`);
mdFiles.forEach(f => console.log(`   ${f.rel}`));
console.log(`\n🖥️  Protótipos HTML (${htmlFiles.length}):`);
htmlFiles.forEach(f => console.log(`   ${f.rel}`));

// ── 2. Criar estrutura ──────────────────────────────────────────────────────
console.log('\n📁 Criando estrutura de export...');
[
  EXPORT_DIR,
  path.join(EXPORT_DIR, 'docs'),
  path.join(EXPORT_DIR, 'prototipos'),
].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ── 3. Converter Markdown → HTML ───────────────────────────────────────────
console.log('\n🔄 Convertendo Markdown → HTML...');

const docEntries = [];

for (const f of mdFiles) {
  const rawContent = fs.readFileSync(f.full, 'utf8');

  // Determine output path
  // All .md go flat into export/docs/ (preserving subdir for use-cases)
  const relWithHtml = f.rel.replace(/\.md$/, '.html');
  const outDir = relWithHtml.includes('/') 
    ? path.join(EXPORT_DIR, 'docs', path.dirname(relWithHtml))
    : path.join(EXPORT_DIR, 'docs');
  fs.mkdirSync(outDir, { recursive: true });

  const outFilename = path.basename(relWithHtml);
  const outPath = path.join(outDir, outFilename);

  // Depth for back-link
  const depth = relWithHtml.split('/').length; // 1 = root, 2 = subdir
  const backPath = depth > 1 ? '../../index.html' : '../index.html';
  // docDepth: quantos níveis acima está a raiz do export/ (para correção de links)
  const docDepth = depth; // 1 = export/docs/, 2 = export/docs/subdir/

  const titleBase = path.basename(f.rel, '.md');
  const title = `${fileTypeLabel(titleBase)} — ${temaLabel(tema)}`;

  const html = mdToHtml(rawContent, title, backPath, docDepth);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`   ✅ ${f.rel} → docs/${relWithHtml}`);

  docEntries.push({
    href: `docs/${relWithHtml}`,
    label: fileTypeLabel(path.basename(f.rel, '.md')),
    title: temaLabel(path.basename(f.rel, '.md').replace(tema + '-', '').replace(/-/g,' ')),
    filename: path.basename(relWithHtml),
  });
}

// ── 4. Copiar protótipos + injetar banner ──────────────────────────────────
console.log('\n📋 Copiando protótipos...');

const protoEntries = [];
const NAV_BANNER = (name) => `<div style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#1e40af;color:#fff;
            padding:6px 16px;font-family:sans-serif;font-size:13px;display:flex;align-items:center;gap:12px;">
  <a href="../index.html" style="color:#93c5fd;text-decoration:none;">← Índice</a>
  <span style="opacity:.5">|</span>
  <span>Protótipo: ${name}</span>
</div>
<div style="height:34px;"></div>`;

for (const f of htmlFiles) {
  let content = fs.readFileSync(f.full, 'utf8');
  const name = slugToLabel(path.basename(f.rel, '.html'));

  // Inject banner after <body> tag (and optional first element)
  content = content.replace(/(<body[^>]*>)/i, `$1\n${NAV_BANNER(name)}`);

  const outPath = path.join(EXPORT_DIR, 'prototipos', path.basename(f.rel));
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`   ✅ ${f.rel} → prototipos/${path.basename(f.rel)}`);

  const numMatch = path.basename(f.rel).match(/^(\d+)/);
  protoEntries.push({
    href: `prototipos/${path.basename(f.rel)}`,
    num: numMatch ? numMatch[1] : '?',
    title: name,
    filename: path.basename(f.rel),
  });
}

// ── 5. Gerar index.html ────────────────────────────────────────────────────
console.log('\n📰 Gerando index.html...');

const docCards = docEntries.map(e => `      <a class="card" href="${e.href}">
        <div class="card-label">${e.label}</div>
        <div class="card-title">${e.title}</div>
        <div class="card-sub">${e.filename}</div>
      </a>`).join('\n');

const protoCards = protoEntries.map(e => `      <a class="card" href="${e.href}">
        <div class="card-label">Tela ${e.num}</div>
        <div class="card-title">${e.title}</div>
        <div class="card-sub">${e.filename}</div>
      </a>`).join('\n');

const INDEX_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exportação — ${temaLabel(tema)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fb;
      color: #142033;
      padding: 32px 16px;
    }
    .page { max-width: 900px; margin: 0 auto; }
    header {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      color: #fff;
      border-radius: 12px;
      padding: 28px 32px;
      margin-bottom: 28px;
      box-shadow: 0 4px 20px rgba(30,64,175,.18);
    }
    header h1 { margin: 0 0 6px; font-size: 1.6rem; }
    header p  { margin: 0; opacity: .75; font-size: 14px; }
    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f2040;
      border-bottom: 2px solid #d9e2f0;
      padding-bottom: 6px;
      margin: 36px 0 16px;
    }
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 12px;
    }
    .card {
      background: #fff;
      border: 1px solid #d9e2f0;
      border-radius: 10px;
      padding: 16px 18px;
      text-decoration: none;
      color: inherit;
      transition: box-shadow 150ms, border-color 150ms, transform 150ms;
      display: block;
    }
    .card:hover {
      box-shadow: 0 6px 18px rgba(30,64,175,.14);
      border-color: #4778d9;
      transform: translateY(-2px);
    }
    .card-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: #4778d9;
      margin-bottom: 6px;
    }
    .card-title { font-weight: 600; font-size: 14px; color: #0f2040; }
    .card-sub   { font-size: 12px; color: #5e6d88; margin-top: 5px; }
    footer {
      margin-top: 56px;
      padding-top: 16px;
      border-top: 1px solid #d9e2f0;
      font-size: 12px;
      color: #8494b0;
      text-align: center;
    }
    @media (max-width: 600px) {
      header { padding: 20px; }
      .card-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <h1>📦 ${temaLabel(tema)}</h1>
      <p>Exportação gerada em ${today()} · ${docEntries.length} documento(s) · ${protoEntries.length} protótipo(s)</p>
    </header>

    <p class="section-title">📄 Documentação</p>
    <div class="card-grid">
${docCards}
    </div>

    <p class="section-title">🖥️ Protótipos de Tela</p>
    <div class="card-grid">
${protoCards}
    </div>

    <footer>
      Gerado por <strong>di-exportar-tema</strong> · Tema: <strong>${tema}</strong>
    </footer>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(EXPORT_DIR, 'index.html'), INDEX_HTML, 'utf8');
console.log('   ✅ export/index.html');

// ── 6. Compactar ────────────────────────────────────────────────────────────
const { execSync } = require('child_process');
const zipPath = path.join(TEMA_DIR, `${tema}-export.zip`);

console.log('\n📦 Compactando...');
try {
  // Tenta zip nativo; se não disponível, usa python3
  try {
    execSync('which zip', { stdio: 'ignore' });
    execSync(`cd "${TEMA_DIR}" && zip -r "${tema}-export.zip" export/`, { stdio: 'inherit' });
  } catch {
    const pyScript = [
      'import zipfile, os, pathlib',
      `export_dir = pathlib.Path('export')`,
      `zip_path = '${tema}-export.zip'`,
      `zf = zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED)`,
      `[zf.write(f, f) for f in sorted(export_dir.rglob('*')) if f.is_file()]`,
      `zf.close()`,
    ].join(';');
    execSync(`cd "${TEMA_DIR}" && python3 -c "${pyScript}"`, { stdio: 'inherit' });
  }
  const zipSize = Math.round(require('fs').statSync(zipPath).size / 1024);
  console.log(`   ✅ ${zipPath} (${zipSize} KB)`);
} catch (e) {
  console.error('   ❌ Erro ao compactar:', e.message);
}

// ── 7. Sumário ─────────────────────────────────────────────────────────────
const totalFiles = docEntries.length + protoEntries.length + 1; // +1 index.html
const zipSize = fs.existsSync(zipPath) ? Math.round(fs.statSync(zipPath).size / 1024) + ' KB' : '?';

console.log(`
✅ Exportação concluída
─────────────────────────────────────────
Tema                      : ${tema}
Arquivos .md convertidos  : ${docEntries.length}
Protótipos incluídos      : ${protoEntries.length}
Total de arquivos no ZIP  : ${totalFiles}
Tamanho do ZIP            : ${zipSize}
─────────────────────────────────────────
📂 Pasta   : docs/business/${tema}/export/
📦 ZIP     : docs/business/${tema}/${tema}-export.zip
─────────────────────────────────────────
Para visualizar: abrir export/index.html no navegador.
`);
