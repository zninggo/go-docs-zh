<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>index - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
    "Title": "教程",
    "Breadcrumb": true
}-->">
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
      <!--{
    "Title": "教程",
    "Breadcrumb": true
}-->

<p>如果您对 Go 语言的某个部分不熟悉，请查看以下链接的教程。</p>

<p>
  如果您尚未安装 Go，请查看
  <a href="/doc/install">下载与安装</a>。
</p>

<table id="tutorials-list" class="DocTable">
  <thead>
    <tr class="DocTable-head">
      <th class="DocTable-cell" width="20%">教程</th>
      <th class="DocTable-cell">描述</th>
    </tr>
  </thead>
  <tbody>
    <tr class="DocTable-row">
      <td class="DocTable-cell">
        <a href="/doc/tutorial/getting-started.html">入门</a>
      </td>
      <td class="DocTable-cell">用 Go 编写 "Hello, World" 程序。</td>
    </tr>
    <tr class="DocTable-row">
      <td class="DocTable-cell">
        <a href="/doc/tutorial/create-module.html">创建模块</a>
      </td>
      <td class="DocTable-cell">
        一个多部分教程，从 Go 的角度介绍常见的编程语言特性。
      </td>
    </tr>
    <tr class="DocTable-row">
      <td class="DocTable-cell">
        <a href="/doc/tutorial/workspaces.html">多模块工作空间入门</a>
      </td>
      <td class="DocTable-cell">
        介绍在 Go 中创建和使用多模块工作空间的基础知识。
        多模块工作空间对于跨多个模块进行更改非常有用。
      </td>
    </tr>
    <tr class="DocTable-row">
        <td class="DocTable-cell">
          <a href="/doc/tutorial/database-access">访问关系型数据库</a>
        </td>
        <td class="DocTable-cell">介绍使用标准库访问数据库的基础知识。</td>
      </tr>
    <tr class="DocTable-row">
      <td class="DocTable-cell">
        <a href="/doc/tutorial/web-service-gin">使用 Go 和 Gin 开发 RESTful API</a>
      </td>
      <td class="DocTable-cell">介绍使用 Go 和 Gin Web 框架编写 RESTful Web 服务 API 的基础知识。</td>
    </tr>
    <tr class="DocTable-row">
      <td class="DocTable-cell">
        <a href="/doc/tutorial/generics">泛型入门</a>
      </td>
      <td class="DocTable-cell">介绍 Go 中泛型（generics）的基础知识。
          使用泛型，您可以声明和使用适用于调用代码提供的任何一组类型的函数或类型。</td>
    </tr>
    <tr class="DocTable-row">
      <td class="DocTable-cell">
        <a href="/doc/tutorial/fuzz">模糊测试入门</a>
      </td>
      <td class="DocTable-cell">介绍 Go 中模糊测试（fuzzing）的基础知识。
          模糊测试可以为您的测试生成输入，以捕获您可能遗漏的边界情况和安全问题。</td>
    </tr>
    <tr class="DocTable-row">
      <td class="DocTable-cell">
        <a href="/doc/tutorial/govulncheck">govulncheck 入门</a>
      </td>
      <td class="DocTable-cell">介绍如何使用 govulncheck 查找和修复漏洞。
          govulncheck 会报告影响 Go 代码的已知漏洞。</td>
    </tr>
    <tr class="DocTable-row">
      <td class="DocTable-cell">
        <a href="/doc/tutorial/govulncheck-ide">使用 VS Code Go 查找和修复易受攻击的依赖项</a>
      </td>
      <td class="DocTable-cell">介绍如何通过 VS Code Go 和 Vim 直接从您的 IDE 查找和修复易受攻击的依赖项。</td>
    </tr>
    <tr class="DocTable-row">
      <td class="DocTable-cell">
        <a href="/tour/">Go 语言之旅</a>
      </td>
      <td class="DocTable-cell">
        Go 的互动式介绍：基本语法和数据结构；方法和接口；以及 Go 的并发（concurrency）原语。
      </td>
    </tr>
  </tbody>
</table>
    </article>
  </main>

  <footer class="footer">
    <div class="container">
      <p>Go 语言官方文档中文版 - 基于 <a href="https://go.dev/doc/">go.dev/doc</a> 翻译</p>
    </div>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>