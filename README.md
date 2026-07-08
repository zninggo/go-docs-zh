# Go 语言官方文档中文版

基于 [golang/website](https://github.com/golang/website) 仓库自动翻译的 Go 语言官方文档中文版本。

## 特性

- 🔄 **自动同步**：每日自动检查上游仓库更新
- 🤖 **自动翻译**：使用 AI 自动翻译文档内容
- 📖 **双语支持**：保留原文格式，专业术语标注英文
- 🔍 **全文搜索**：支持文档标题和内容搜索
- 📱 **响应式设计**：支持桌面和移动端访问
- 🚀 **自动部署**：GitHub Pages 自动部署

## 访问地址

**https://yourusername.github.io/go-docs-zh**

## 文档来源

翻译内容来自 Go 官方仓库：

- `_content/doc/articles/` - Go 语言文章
- `_content/doc/tutorial/` - Go 语言教程

## 技术栈

- **翻译引擎**：OpenAI 兼容 API
- **站点生成**：Node.js + Marked.js
- **部署平台**：GitHub Pages
- **自动化**：GitHub Actions

## 本地开发

### 安装依赖

```bash
npm install
```

### 同步上游文档

```bash
npm run sync
```

### 翻译文档

```bash
# 需要先配置环境变量 TRANSLATION_API_KEY
npm run translate
```

### 构建站点

```bash
npm run build
```

### 本地预览

```bash
npm start
```

## 配置说明

### 环境变量

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中配置：

| 变量名 | 说明 |
|--------|------|
| `TRANSLATION_API_URL` | 翻译 API 的 URL |
| `TRANSLATION_API_KEY` | 翻译 API 的密钥 |
| `TRANSLATION_MODEL` | 翻译模型名称 |

### 配置文件

编辑 `config.json` 修改配置：

```json
{
  "translation": {
    "api_url": "${TRANSLATION_API_URL}",
    "model": "${TRANSLATION_MODEL}"
  }
}
```

## 工作流程

```
检查上游更新 → 有更新? → 同步文档 → 翻译文档 → 构建站点 → 部署到 GitHub Pages
```

## 目录结构

```
go-docs-zh/
├── .github/workflows/              # 自动化工作流
├── scripts/
│   ├── sync-upstream.js            # 上游同步脚本
│   ├── translate.js                # 翻译脚本
│   └── build.js                    # 站点构建脚本
├── docs/
│   ├── en/                         # 英文原文（自动同步）
│   └── zh/                         # 中文翻译（自动生成）
├── glossary/go-terms.json          # 术语表
├── site/                           # 静态站点（自动生成）
├── config.json                     # 配置文件
└── package.json                    # 依赖管理
```

## 术语表

`glossary/go-terms.json` 包含 Go 语言专业术语的统一翻译：

```json
{
  "goroutine": "goroutine（协程）",
  "channel": "channel（通道）",
  "slice": "slice（切片）"
}
```

## 常见问题

### Q: 如何手动触发翻译？

在 GitHub Actions 页面点击 "Run workflow"。

### Q: 翻译失败怎么办？

查看 GitHub Actions 日志，通常是因为 API Key 无效或额度不足。

### Q: 如何添加新的文档源？

编辑 `config.json` 的 `upstream.docs_paths` 数组。

## 许可证

MIT License
