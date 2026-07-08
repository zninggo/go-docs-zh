#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
const QUEUE_FILE = path.join(__dirname, '..', 'translation-queue.json');
const GLOSSARY_FILE = path.join(__dirname, '..', 'glossary', 'go-terms.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'zh');

async function loadJSON(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function saveJSON(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
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

function splitContentByBlocks(content, isHtml) {
  const blocks = [];
  let currentBlock = '';
  let inCodeBlock = false;
  let codeBlockContent = '';

  if (isHtml) {
    const codeRegex = /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }
      blocks.push({
        type: 'code',
        content: match[0]
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      blocks.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }
  } else {
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          codeBlockContent += line + '\n';
          blocks.push({
            type: 'code',
            content: codeBlockContent
          });
          codeBlockContent = '';
          inCodeBlock = false;
        } else {
          if (currentBlock.trim()) {
            blocks.push({
              type: 'text',
              content: currentBlock
            });
          }
          currentBlock = '';
          inCodeBlock = true;
          codeBlockContent = line + '\n';
        }
      } else if (inCodeBlock) {
        codeBlockContent += line + '\n';
      } else {
        currentBlock += line + '\n';
      }
    }

    if (currentBlock.trim()) {
      blocks.push({
        type: 'text',
        content: currentBlock
      });
    }
  }

  return blocks;
}

function splitTextIntoChunks(text, maxTokens = 2000) {
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    if ((currentChunk + '\n\n' + para).length > maxTokens * 4) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = para;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function callTranslationAPI(text, glossary, config) {
  const { api_url, api_key, model, timeout, max_retries } = config.translation;

  const glossaryPrompt = Object.entries(glossary)
    .map(([en, zh]) => `${en} -> ${zh}`)
    .join('\n');

  const systemPrompt = `你是一个专业的技术文档翻译专家，擅长将 Go 语言官方文档翻译成中文。

翻译规则：
1. 保持技术准确性
2. 使用自然流畅的中文表达
3. 专业术语参考术语表翻译，首次出现时标注英文原文
4. 保留 Markdown/HTML 格式标记
5. 代码块内容不翻译
6. 保持段落结构和层级关系

术语表：
${glossaryPrompt}`;

  const userPrompt = `请翻译以下内容为中文：

${text}`;

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
          temperature: 0.3,
          max_tokens: 4096
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`翻译尝试 ${attempt}/${max_retries} 失败:`, error.message);

      if (attempt === max_retries) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function translateFile(sourcePath, targetPath, fileType, glossary, config) {
  console.log(`\n翻译: ${sourcePath}`);

  const content = await fs.readFile(path.join(__dirname, '..', 'docs', 'en', sourcePath), 'utf-8');
  const isHtml = fileType === 'html';

  const blocks = splitContentByBlocks(content, isHtml);
  console.log(`  分析内容: ${blocks.length} 个代码块`);

  const translatedBlocks = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === 'code') {
      translatedBlocks.push(block.content);
      continue;
    }

    const chunks = splitTextIntoChunks(block.content);
    console.log(`  翻译文本块 ${i + 1}/${blocks.length}: ${chunks.length} 个分块`);

    const translatedChunks = [];
    for (const chunk of chunks) {
      const translated = await callTranslationAPI(chunk, glossary, config);
      translatedChunks.push(translated);
    }

    translatedBlocks.push(translatedChunks.join('\n\n'));
  }

  const translatedContent = translatedBlocks.join('');

  const targetFullPath = path.join(OUTPUT_DIR, targetPath);
  await fs.mkdir(path.dirname(targetFullPath), { recursive: true });
  await fs.writeFile(targetFullPath, translatedContent);

  console.log(`  完成: ${targetPath}`);
  return targetFullPath;
}

async function main() {
  try {
    console.log('=== 开始翻译任务 ===\n');

    const rawConfig = await loadJSON(CONFIG_PATH);
    const config = resolveEnvVars(rawConfig);
    const glossary = loadGlossary();

    let queue;
    try {
      queue = await loadJSON(QUEUE_FILE);
    } catch {
      console.log('没有找到翻译队列，退出');
      return;
    }

    const pendingFiles = queue.files.filter(f => f.status === 'pending');
    console.log(`待翻译文件: ${pendingFiles.length} 个`);

    if (pendingFiles.length === 0) {
      console.log('所有文件已翻译完成');
      return;
    }

    const results = {
      success: [],
      failed: []
    };

    for (const file of pendingFiles) {
      try {
        const targetPath = await translateFile(
          file.source,
          file.target,
          file.type,
          glossary,
          config
        );

        file.status = 'completed';
        file.translatedAt = new Date().toISOString();
        results.success.push(file.source);
      } catch (error) {
        console.error(`翻译失败: ${file.source}`, error.message);
        file.status = 'failed';
        file.error = error.message;
        results.failed.push(file.source);
      }
    }

    await saveJSON(QUEUE_FILE, queue);

    console.log('\n=== 翻译完成 ===');
    console.log(`成功: ${results.success.length} 个`);
    console.log(`失败: ${results.failed.length} 个`);

    if (results.failed.length > 0) {
      console.log('\n失败文件:');
      results.failed.forEach(f => console.log(`  - ${f}`));
    }

  } catch (error) {
    console.error('翻译任务失败:', error.message);
    process.exit(1);
  }
}

main();
