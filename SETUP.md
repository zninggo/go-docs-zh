# 快速配置指南

## 1. 创建 GitHub 仓库

1. 在 GitHub 创建新仓库 `go-docs-zh`
2. 保持仓库为空（不要初始化 README）

## 2. 上传代码

```bash
cd /f/repos/go-docs-zh
git init
git add .
git commit -m "Initial commit: Go docs translation automation"
git remote add origin https://github.com/yourusername/go-docs-zh.git
git push -u origin main
```

## 3. 配置 GitHub Secrets

进入仓库 Settings > Secrets and variables > Actions，添加以下 secrets：

| Secret 名称 | 说明 |
|-------------|------|
| `TRANSLATION_API_URL` | 翻译 API 的 URL |
| `TRANSLATION_API_KEY` | 翻译 API 的密钥 |
| `TRANSLATION_MODEL` | 翻译模型名称 |

## 4. 启用 GitHub Pages

1. 进入 Settings > Pages
2. Source 选择 "GitHub Actions"
3. 保存

## 5. 配置翻译 API（可选）

编辑 `config.json` 修改翻译配置：

```json
{
  "translation": {
    "api_url": "${TRANSLATION_API_URL}",
    "model": "${TRANSLATION_MODEL}"
  }
}
```

## 6. 触发首次翻译

1. 进入 Actions 页面
2. 选择 "Sync and Translate" 工作流
3. 点击 "Run workflow"
4. 等待完成（约 30-60分钟）

## 7. 访问站点

部署完成后访问：`https://yourusername.github.io/go-docs-zh`

## 自定义域名（可选）

1. 在 `docs/` 目录创建 `CNAME` 文件，内容为你的域名
2. 在域名 DNS 设置中添加 CNAME 记录指向 `yourusername.github.io`
3. 在 GitHub Pages 设置中启用 HTTPS

## 日常维护

- **自动更新**：每日凌晨 2点自动检查上游更新
- **手动触发**：在 Actions 页面手动运行工作流
- **查看日志**：在 Actions 页面查看运行日志
- **修改配置**：编辑 `config.json` 后提交

## 故障排除

### 翻译失败

1. 检查 `TRANSLATION_API_KEY` 是否正确
2. 检查 API 额度是否充足
3. 查看 Actions 日志获取详细错误信息

### 部署失败

1. 确认 GitHub Pages 已启用
2. 确认 Source 设置为 "GitHub Actions"
3. 检查仓库权限设置

### 文档未更新

1. 检查上游仓库是否有更新
2. 查看 `translation-queue.json` 是否有待翻译文件
3. 手动触发工作流重新同步
