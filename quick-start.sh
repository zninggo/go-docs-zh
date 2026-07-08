#!/bin/bash

echo "=== Go 文档中文版快速启动 ==="
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "首次运行，安装依赖..."
    npm install
    echo ""
fi

# 同步上游文档
echo "步骤 1/3: 同步上游文档..."
node scripts/sync-upstream.js
echo ""

# 检查是否有待翻译文件
if [ -f "translation-queue.json" ]; then
    FILE_COUNT=$(node -e "const q = require('./translation-queue.json'); console.log(q.files.filter(f => f.status === 'pending').length)")

    if [ "$FILE_COUNT" -gt 0 ]; then
        echo "步骤 2/3: 翻译文档 ($FILE_COUNT 个文件)..."
        node scripts/translate.js
    else
        echo "步骤 2/3: 没有待翻译文件"
    fi
else
    echo "步骤 2/3: 没有待翻译文件"
fi
echo ""

# 构建站点
echo "步骤 3/3: 构建站点..."
node scripts/build.js
echo ""

echo "=== 启动完成 ==="
echo ""
echo "本地预览:"
echo "  cd site && npx serve"
echo ""
echo "或运行:"
echo "  npm start"
