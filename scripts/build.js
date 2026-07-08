#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'zh');
const OUTPUT_DIR = path.join(__dirname, '..', 'site');

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - Go 语言官方文档中文版</title>
  <meta name="description" content="{{description}}">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"></script>
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <a href="/" class="logo">Go 文档中文版</a>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="搜索文档...">
      </div>
    </div>
  </nav>

  <main class="container">
    <article class="content">
      {{content}}
    </article>
  </main>

  <footer class="footer">
    <div class="container">
      <p>Go 语言官方文档中文版 - 基于 <a href="https://go.dev/doc/">go.dev/doc</a> 翻译</p>
    </div>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>`;

const INDEX_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Go 语言官方文档中文版</title>
  <meta name="description" content="Go 语言官方文档的中文翻译版本，包含教程、文章等">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <a href="/" class="logo">Go 文档中文版</a>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="搜索文档...">
      </div>
    </div>
  </nav>

  <main class="container">
    <header class="hero">
      <h1>Go 语言官方文档中文版</h1>
      <p>基于 <a href="https://go.dev/doc/">go.dev/doc</a> 官方文档翻译</p>
    </header>

    <section class="doc-section">
      <h2>教程</h2>
      <div class="doc-grid">
        {{tutorials}}
      </div>
    </section>

    <section class="doc-section">
      <h2>文章</h2>
      <div class="doc-grid">
        {{articles}}
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>Go 语言官方文档中文版 - 持续更新中</p>
    </div>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>`;

async function loadConfig() {
  const content = await fs.readFile(CONFIG_PATH, 'utf-8');
  return JSON.parse(content);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function scanDocs(dir, basePath = '') {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await scanDocs(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.html'))) {
      const content = await fs.readFile(fullPath, 'utf-8');
      const stat = await fs.stat(fullPath);
      const ext = path.extname(entry.name);

      let title = entry.name.replace(ext, '');
      let description = '';

      if (ext === '.md') {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          title = titleMatch[1];
        }

        const descMatch = content.match(/^(.+?)(?:\n\n|\n#)/s);
        if (descMatch) {
          description = descMatch[1].replace(/[*_`]/g, '').slice(0, 150);
        }
      } else {
        const titleMatch = content.match(/<title>([^<]+)<\/title>/i) || content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (titleMatch) {
          title = titleMatch[1];
        }

        const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        if (descMatch) {
          description = descMatch[1].slice(0, 150);
        }
      }

      files.push({
        path: relativePath,
        title,
        description,
        category: relativePath.includes('tutorial') ? 'tutorial' : 'article',
        mtime: stat.mtime.toISOString()
      });
    }
  }

  return files;
}

function renderMarkdown(content) {
  marked.setOptions({
    gfm: true,
    breaks: true,
    highlight: function(code, lang) {
      return code;
    }
  });

  return marked(content);
}

async function generateDocPage(file) {
  const content = await fs.readFile(path.join(DOCS_DIR, file.path), 'utf-8');
  const ext = path.extname(file.path);

  let htmlContent;
  if (ext === '.md') {
    htmlContent = renderMarkdown(content);
  } else {
    htmlContent = content;
  }

  const page = HTML_TEMPLATE
    .replace('{{title}}', file.title)
    .replace('{{description}}', file.description)
    .replace('{{content}}', htmlContent);

  const outputPath = path.join(OUTPUT_DIR, file.path);
  await ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, page);

  return outputPath;
}

function generateDocCard(file) {
  const url = '/' + file.path.replace('.md', '.html');
  return `
    <a href="${url}" class="doc-card">
      <h3>${file.title}</h3>
      <p>${file.description}</p>
    </a>
  `;
}

async function generateIndex(files) {
  const tutorials = files
    .filter(f => f.category === 'tutorial')
    .map(generateDocCard)
    .join('\n');

  const articles = files
    .filter(f => f.category === 'article')
    .map(generateDocCard)
    .join('\n');

  const index = INDEX_TEMPLATE
    .replace('{{tutorials}}', tutorials)
    .replace('{{articles}}', articles);

  await fs.writeFile(path.join(OUTPUT_DIR, 'index.html'), index);
}

async function generateSearchIndex(files) {
  const searchIndex = files.map(f => ({
    title: f.title,
    description: f.description,
    path: '/' + f.path.replace('.md', '.html'),
    category: f.category
  }));

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'search-index.json'),
    JSON.stringify(searchIndex, null, 2)
  );
}

async function copyStaticAssets() {
  const cssDir = path.join(OUTPUT_DIR, 'css');
  const jsDir = path.join(OUTPUT_DIR, 'js');

  await ensureDir(cssDir);
  await ensureDir(jsDir);

  const css = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #00ADD8;
  --secondary: #5DC9E2;
  --text: #333;
  --bg: #fff;
  --code-bg: #f5f5f5;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
  color: var(--text);
  background: var(--bg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar {
  background: var(--primary);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.search-box input {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  width: 300px;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 0 0 20px 20px;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero a {
  color: white;
}

.doc-section {
  margin-bottom: 3rem;
}

.doc-section h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
}

.doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.doc-card {
  display: block;
  padding: 1.5rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text);
  transition: transform 0.2s, box-shadow 0.2s;
}

.doc-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.doc-card h3 {
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.doc-card p {
  font-size: 0.9rem;
  color: #666;
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

.content h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--primary);
}

.content h2 {
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.content p {
  margin-bottom: 1rem;
}

.content code {
  background: var(--code-bg);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9em;
}

.content pre {
  background: var(--code-bg);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.content pre code {
  background: none;
  padding: 0;
}

.content a {
  color: var(--primary);
  text-decoration: none;
}

.content a:hover {
  text-decoration: underline;
}

.footer {
  background: #f5f5f5;
  padding: 2rem 0;
  text-align: center;
  margin-top: 3rem;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 1.8rem;
  }

  .search-box input {
    width: 200px;
  }

  .doc-grid {
    grid-template-columns: 1fr;
  }
}
`;

  const js = `
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');

  if (searchInput) {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(index => {
        searchInput.addEventListener('input', function(e) {
          const query = e.target.value.toLowerCase();

          if (query.length < 2) {
            document.querySelectorAll('.doc-card').forEach(card => {
              card.style.display = '';
            });
            return;
          }

          const results = index.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
          );

          document.querySelectorAll('.doc-card').forEach(card => {
            const href = card.getAttribute('href');
            const found = results.some(r => r.path === href);
            card.style.display = found ? '' : 'none';
          });
        });
      });
  }

  document.querySelectorAll('pre code').forEach(block => {
    if (typeof hljs !== 'undefined') {
      hljs.highlightElement(block);
    }
  });
});
`;

  await fs.writeFile(path.join(cssDir, 'style.css'), css);
  await fs.writeFile(path.join(jsDir, 'main.js'), js);
}

async function main() {
  try {
    console.log('=== 开始构建站点 ===\n');

    const config = await loadConfig();

    await ensureDir(OUTPUT_DIR);
    await ensureDir(DOCS_DIR);

    console.log('扫描文档文件...');
    const files = await scanDocs(DOCS_DIR);
    console.log(`找到 ${files.length} 个文档`);

    if (files.length === 0) {
      console.log('没有找到文档文件，退出');
      return;
    }

    console.log('\n生成文档页面...');
    for (const file of files) {
      await generateDocPage(file);
      console.log(`  ${file.path}`);
    }

    console.log('\n生成索引页面...');
    await generateIndex(files);

    console.log('\n生成搜索索引...');
    await generateSearchIndex(files);

    console.log('\n复制静态资源...');
    await copyStaticAssets();

    console.log('\n=== 构建完成 ===');
    console.log(`输出目录: ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('构建失败:', error.message);
    process.exit(1);
  }
}

main();
