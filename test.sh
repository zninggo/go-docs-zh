#!/bin/bash

echo "=== 测试项目配置 ==="
echo ""

# 测试 Node.js
echo "1. 检查 Node.js..."
if command -v node &> /dev/null; then
    echo "   ✓ Node.js 版本: $(node -v)"
else
    echo "   ✗ 未安装 Node.js"
    exit 1
fi

# 测试 npm
echo "2. 检查 npm..."
if command -v npm &> /dev/null; then
    echo "   ✓ npm 版本: $(npm -v)"
else
    echo "   ✗ 未安装 npm"
    exit 1
fi

# 测试配置文件
echo "3. 检查配置文件..."
if [ -f "config.json" ]; then
    echo "   ✓ config.json 存在"
    # 验证 JSON 格式
    if node -e "require('./config.json')" 2>/dev/null; then
        echo "   ✓ config.json 格式正确"
    else
        echo "   ✗ config.json 格式错误"
    fi
else
    echo "   ✗ config.json 不存在"
fi

# 测试脚本文件
echo "4. 检查脚本文件..."
for script in sync-upstream.js translate.js build.js; do
    if [ -f "scripts/$script" ]; then
        echo "   ✓ scripts/$script 存在"
    else
        echo "   ✗ scripts/$script 不存在"
    fi
done

# 测试术语表
echo "5. 检查术语表..."
if [ -f "glossary/go-terms.json" ]; then
    echo "   ✓ glossary/go-terms.json 存在"
else
    echo "   ✗ glossary/go-terms.json 不存在"
fi

# 测试工作流
echo "6. 检查 GitHub Actions 工作流..."
if [ -f ".github/workflows/sync-and-translate.yml" ]; then
    echo "   ✓ sync-and-translate.yml 存在"
else
    echo "   ✗ sync-and-translate.yml 不存在"
fi

echo ""
echo "=== 测试完成 ==="
echo ""
echo "如果所有检查都通过，可以运行:"
echo "  ./quick-start.sh (Linux/Mac)"
echo "  quick-start.bat (Windows)"
