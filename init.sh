#!/bin/bash

echo "=== Go 文档中文版项目初始化 ==="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未安装 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "Node.js 版本: $(node -v)"
echo ""

# 安装依赖
echo "安装依赖..."
npm install
echo ""

# 创建必要目录
echo "创建目录结构..."
mkdir -p docs/en docs/zh site glossary
echo ""

# 检查配置
if [ ! -f "config.json" ]; then
    echo "错误: 未找到 config.json"
    exit 1
fi

echo "=== 初始化完成 ==="
echo ""
echo "下一步:"
echo "1. 编辑 config.json 配置翻译 API"
echo "2. 运行 npm run sync 同步上游文档"
echo "3. 运行 npm run translate 翻译文档"
echo "4. 运行 npm run build 构建站点"
echo ""
echo "详细说明请查看 SETUP.md"
