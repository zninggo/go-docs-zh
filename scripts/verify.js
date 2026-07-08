#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
const GLOSSARY_FILE = path.join(__dirname, '..', 'glossary', 'go-terms.json');
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'zh');
const EN_DIR = path.join(__dirname, '..', 'docs', 'en');

async function loadJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

function loadGlossary() {
  try {
    return require(GLOSSARY_FILE);
  } catch {
    return {};
  }
}

function resolveEnvVars(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
      const envVar = value.slice(2, -1);
      result[key] = process.env[envVar] || '';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = resolveEnvVars(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function callVerifyAPI(original, translated, glossary, config) {
  const { api_url, api_key, model, timeout, max_retries } = config.translation;

  const glossaryPrompt = Object.entries(glossary)
    .map(([en, zh]) => `${en} -> ${zh}`)
    .join('\n');

  const systemPrompt = `你是一个专业的技术文档翻译审核专家。你的任务是检查中文翻译的准确性。

审核规则：
1. 对比英文原文和中文翻译
2. 检查是否有漏译、错译、过度意译
3. 检查专业术语是否准确
4. 检查代码块是否被错误翻译
5. 检查格式是否完整保留
6. 只报告问题，如果翻译正确则返回 "PASS"

术语表：
${glossaryPrompt}

返回格式：
- 如果翻译正确：PASS
- 如果有问题：列出具体问题（最多3个）`;

  const userPrompt = `请审核以下翻译：

【英文原文】
${original.slice(0, 3000)}

【中文翻译】
${translated.slice(0, 3000)}`;

  for (let attempt = 1; attempt <= max_retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${api_url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api_key}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 500
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      if (attempt === max_retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function scanFiles(dir, basePath = '') {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await scanFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.html'))) {
      files.push(relativePath);
    }
  }

  return files;
}

async function main() {
  try {
    console.log('=== 开始翻译验证 ===\n');

    const rawConfig = await loadJSON(CONFIG_PATH);
    const config = resolveEnvVars(rawConfig);
    const glossary = loadGlossary();

    const zhFiles = await scanFiles(DOCS_DIR);
    console.log(`找到 ${zhFiles.length} 个翻译文件\n`);

    if (zhFiles.length === 0) {
      console.log('没有找到翻译文件，退出');
      return;
    }

    const results = { pass: 0, fail: 0, errors: [] };

    for (const file of zhFiles) {
      const zhPath = path.join(DOCS_DIR, file);
      const enPath = path.join(EN_DIR, file);

      try {
        await fs.access(enPath);
      } catch {
        console.log(`跳过 ${file}（无对应原文）`);
        continue;
      }

      console.log(`验证: ${file}`);

      const zhContent = await fs.readFile(zhPath, 'utf-8');
      const enContent = await fs.readFile(enPath, 'utf-8');

      if (zhContent.length < 50) {
        console.log('  跳过（内容过短）');
        continue;
      }

      try {
        const result = await callVerifyAPI(enContent, zhContent, glossary, config);

        if (result.includes('PASS')) {
          console.log('  ✓ 通过');
          results.pass++;
        } else {
          console.log(`  ✗ 问题: ${result.slice(0, 100)}`);
          results.fail++;
          results.errors.push({ file, issues: result });
        }
      } catch (error) {
        console.log(`  ! 验证失败: ${error.message}`);
        results.errors.push({ file, issues: error.message });
      }
    }

    console.log('\n=== 验证完成 ===');
    console.log(`通过: ${results.pass} 个`);
    console.log(`有问题: ${results.fail} 个`);

    if (results.errors.length > 0) {
      console.log('\n问题详情:');
      for (const err of results.errors) {
        console.log(`\n  ${err.file}:`);
        console.log(`    ${err.issues.slice(0, 200)}`);
      }
    }

  } catch (error) {
    console.error('验证失败:', error.message);
    process.exit(1);
  }
}

main();
