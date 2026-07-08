#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
const UPSTREAM_DIR = path.join(__dirname, '..', 'docs', 'en');
const HASH_FILE = path.join(__dirname, '..', 'docs', '.file-hashes.json');

async function loadConfig() {
  const content = await fs.readFile(CONFIG_PATH, 'utf-8');
  return JSON.parse(content);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function cloneOrUpdateRepo(repo, branch, targetDir) {
  const repoUrl = `https://github.com/${repo}.git`;

  try {
    await fs.access(path.join(targetDir, '.git'));
    console.log(`更新仓库 ${repo}...`);
    execSync(`git -C "${targetDir}" fetch origin`, { stdio: 'inherit' });
    execSync(`git -C "${targetDir}" reset --hard origin/${branch}`, { stdio: 'inherit' });
  } catch {
    console.log(`克隆仓库 ${repo}...`);
    execSync(`git clone --depth 1 --branch ${branch} ${repoUrl} "${targetDir}"`, { stdio: 'inherit' });
  }
}

function getFileHash(filePath) {
  const content = require('fs').readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

async function scanFiles(dir, basePath = '') {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      if (!['.git', 'images', 'node_modules'].includes(entry.name)) {
        const subFiles = await scanFiles(fullPath, relativePath);
        files.push(...subFiles);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.html', '.md'].includes(ext)) {
        const stat = await fs.stat(fullPath);
        files.push({
          path: relativePath,
          fullPath,
          ext,
          size: stat.size,
          mtime: stat.mtime.toISOString(),
          hash: getFileHash(fullPath)
        });
      }
    }
  }

  return files;
}

async function loadHashes() {
  try {
    const content = await fs.readFile(HASH_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveHashes(hashes) {
  await ensureDir(path.dirname(HASH_FILE));
  await fs.writeFile(HASH_FILE, JSON.stringify(hashes, null, 2));
}

function getChangedFiles(currentFiles, oldHashes) {
  const changed = [];
  const currentHashes = {};

  for (const file of currentFiles) {
    currentHashes[file.path] = file.hash;
    if (!oldHashes[file.path] || oldHashes[file.path] !== file.hash) {
      changed.push(file);
    }
  }

  const deleted = Object.keys(oldHashes).filter(p => !currentHashes[p]);

  return { changed, deleted, currentHashes };
}

async function generateTranslationQueue(changedFiles, config) {
  const queueFile = path.join(__dirname, '..', 'translation-queue.json');
  const queue = {
    timestamp: new Date().toISOString(),
    files: changedFiles.map(f => ({
      source: f.path,
      target: f.path.replace(/\.(html|md)$/, '.md'),
      type: f.ext === '.html' ? 'html' : 'markdown',
      status: 'pending'
    }))
  };

  await fs.writeFile(queueFile, JSON.stringify(queue, null, 2));
  console.log(`生成翻译队列: ${queue.files.length} 个文件`);

  return queue;
}

async function main() {
  try {
    const config = await loadConfig();
    const { repo, branch, content_path, docs_paths } = config.upstream;

    const tempDir = path.join(__dirname, '..', '.upstream-temp');

    console.log('=== 开始同步上游仓库 ===');
    await cloneOrUpdateRepo(repo, branch, tempDir);

    console.log('\n=== 扫描文档文件 ===');
    const allFiles = [];

    for (const docsPath of docs_paths) {
      const fullPath = path.join(tempDir, content_path, docsPath);
      try {
        await fs.access(fullPath);
        const files = await scanFiles(fullPath, docsPath);
        allFiles.push(...files);
        console.log(`[${docsPath}] 找到 ${files.length} 个文件`);
      } catch {
        console.log(`[${docsPath}] 目录不存在，跳过`);
      }
    }

    console.log(`\n总计: ${allFiles.length} 个文档文件`);

    console.log('\n=== 检测文件变更 ===');
    const oldHashes = await loadHashes();
    const { changed, deleted, currentHashes } = getChangedFiles(allFiles, oldHashes);

    console.log(`新增/修改: ${changed.length} 个文件`);
    console.log(`删除: ${deleted.length} 个文件`);

    if (changed.length === 0 && deleted.length === 0) {
      console.log('\n没有检测到变更，无需翻译');
      return;
    }

    console.log('\n=== 复制变更文件 ===');
    await ensureDir(UPSTREAM_DIR);

    for (const file of changed) {
      const targetPath = path.join(UPSTREAM_DIR, file.path);
      await ensureDir(path.dirname(targetPath));
      await fs.copyFile(file.fullPath, targetPath);
      console.log(`复制: ${file.path}`);
    }

    for (const deletedPath of deleted) {
      const targetPath = path.join(UPSTREAM_DIR, deletedPath);
      try {
        await fs.unlink(targetPath);
        console.log(`删除: ${deletedPath}`);
      } catch {}
    }

    await saveHashes(currentHashes);

    if (changed.length > 0) {
      await generateTranslationQueue(changed, config);
    }

    console.log('\n=== 同步完成 ===');

  } catch (error) {
    console.error('同步失败:', error.message);
    process.exit(1);
  }
}

main();
