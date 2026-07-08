@echo off
chcp 65001 >nul

echo === Go 文档中文版快速启动 ===
echo.

REM 检查依赖
if not exist "node_modules" (
    echo 首次运行，安装依赖...
    call npm install
    echo.
)

REM 同步上游文档
echo 步骤 1/3: 同步上游文档...
node scripts/sync-upstream.js
echo.

REM 检查是否有待翻译文件
if exist "translation-queue.json" (
    echo 步骤 2/3: 翻译文档...
    node scripts/translate.js
) else (
    echo 步骤 2/3: 没有待翻译文件
)
echo.

REM 构建站点
echo 步骤 3/3: 构建站点...
node scripts/build.js
echo.

echo === 启动完成 ===
echo.
echo 本地预览:
echo   cd site ^&^& npx serve
echo.
echo 或运行:
echo   npm start
