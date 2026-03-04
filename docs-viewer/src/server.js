import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const moduleRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(moduleRoot, '..');
const docsRoot = path.resolve(projectRoot, 'docs');
const architectureRoot = path.resolve(projectRoot, 'architecture');
const allowedRoots = {
  docs: docsRoot,
  architecture: architectureRoot,
};

const app = express();
const PORT = Number(process.env.PORT || 3030);

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false,
});

function encodePathForUrl(filePath) {
  return filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function parseHrefParts(href) {
  const hashIndex = href.indexOf('#');
  const pathAndQuery = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hashPart = hashIndex >= 0 ? href.slice(hashIndex) : '';

  const queryIndex = pathAndQuery.indexOf('?');
  const pathPart = queryIndex >= 0 ? pathAndQuery.slice(0, queryIndex) : pathAndQuery;
  const queryPart = queryIndex >= 0 ? pathAndQuery.slice(queryIndex) : '';

  return { pathPart, queryPart, hashPart };
}

function resolveRelativeDocPath(baseDocPath, hrefPath) {
  const normalizedInput = hrefPath.replace(/\\/g, '/');
  const baseDir = path.posix.dirname(baseDocPath);

  const resolved = normalizedInput.startsWith('/')
    ? path.posix.normalize(normalizedInput.slice(1))
    : path.posix.normalize(path.posix.join(baseDir, normalizedInput));

  if (!resolved || resolved.startsWith('..') || path.posix.isAbsolute(resolved)) {
    return null;
  }

  return resolved;
}

function isPrototypeHtmlLink(hrefPath) {
  const lower = hrefPath.toLowerCase();
  return lower.endsWith('.html') || lower.endsWith('.htm');
}

function isExternalLink(href) {
  return /^(https?:|mailto:|tel:|\/\/)/i.test(href);
}

function createRendererForDocument(docPath) {
  const renderer = new marked.Renderer();
  const originalLinkRenderer = renderer.link.bind(renderer);
  const originalCodeRenderer = renderer.code.bind(renderer);

  renderer.link = (token) => {
    const href = String(token.href || '').trim();

    if (!href || href.startsWith('#') || isExternalLink(href)) {
      return originalLinkRenderer(token);
    }

    const { pathPart, queryPart, hashPart } = parseHrefParts(href);
    if (!pathPart || !isPrototypeHtmlLink(pathPart)) {
      return originalLinkRenderer(token);
    }

    const resolvedDocPath = resolveRelativeDocPath(docPath, pathPart);
    if (!resolvedDocPath) {
      return originalLinkRenderer(token);
    }

    const rewrittenHref = `/docs-static/${encodePathForUrl(resolvedDocPath)}${queryPart}${hashPart}`;
    const rendered = originalLinkRenderer({ ...token, href: rewrittenHref });
    return rendered.replace('<a ', '<a target="_blank" rel="noopener noreferrer" ');
  };

  renderer.code = (token) => {
    const language = String(token.lang || '').trim().toLowerCase();

    if (language === 'mermaid') {
      return `<pre class="mermaid">${token.text}</pre>`;
    }

    return originalCodeRenderer(token);
  };

  return renderer;
}

function isPathInside(childPath, parentPath) {
  const relative = path.relative(parentPath, childPath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

async function getMarkdownTree(dirPath, basePath = '') {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nodes = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolutePath = path.join(dirPath, entry.name);
    const relativePath = path.posix.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const children = await getMarkdownTree(absolutePath, relativePath);
      if (children.length > 0) {
        nodes.push({
          type: 'directory',
          name: entry.name,
          path: relativePath,
          children,
        });
      }
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      nodes.push({
        type: 'file',
        name: entry.name,
        path: relativePath,
      });
    }
  }

  return nodes;
}

app.use('/assets', express.static(path.join(moduleRoot, 'public')));
app.use('/docs-static/docs', express.static(docsRoot, { index: false }));
app.use('/docs-static/architecture', express.static(architectureRoot, { index: false }));

app.get('/api/tree', async (_req, res) => {
  try {
    const treeEntries = await Promise.all(
      Object.entries(allowedRoots).map(async ([key, rootPath]) => {
        const children = await getMarkdownTree(rootPath, key);
        return {
          type: 'directory',
          name: key,
          path: key,
          children,
        };
      }),
    );

    const tree = treeEntries.filter((entry) => entry.children.length > 0);
    res.json({ tree });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar documentos.', details: String(error) });
  }
});

app.get('/api/doc', async (req, res) => {
  const requestedPath = String(req.query.path || '').trim();

  if (!requestedPath || !requestedPath.toLowerCase().endsWith('.md')) {
    return res.status(400).json({ message: 'Parâmetro path inválido.' });
  }

  const normalized = requestedPath.replace(/\\/g, '/').replace(/^\/+/, '');
  const [rootKey, ...rest] = normalized.split('/');
  const selectedRoot = allowedRoots[rootKey];

  if (!selectedRoot || rest.length === 0) {
    return res.status(400).json({ message: 'Parâmetro path inválido.' });
  }

  const relativePath = rest.join('/');
  const absolute = path.resolve(selectedRoot, relativePath);

  if (!isPathInside(absolute, selectedRoot)) {
    return res.status(403).json({ message: 'Acesso negado.' });
  }

  try {
    const markdown = await fs.readFile(absolute, 'utf-8');
    const renderer = createRendererForDocument(normalized);
    const html = marked.parse(markdown, { renderer });
    return res.json({
      title: path.basename(normalized),
      path: normalized,
      html,
    });
  } catch (error) {
    return res.status(404).json({ message: 'Documento não encontrado.', details: String(error) });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(moduleRoot, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Docs Viewer disponível em http://localhost:${PORT}`);
});
