<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>govulncheck-ide - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
  "Title": "教程：使用 VS Code Go 查找并修复易受攻击的依赖",
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
  "Title": "教程：使用 VS Code Go 查找并修复易受攻击的依赖",
  "Breadcrumb": true
}-->

<p><a href="/security">返回 Go 安全</a></p>
<p>您可以使用 Visual Studio Code 的 Go 扩展，直接在代码编辑器中扫描代码中的漏洞。</p>
<p>注意：有关下图中包含的漏洞修复的说明，请参阅 <a href="/doc/tutorial/govulncheck">govulncheck 教程</a>。</p>
<h2>前置条件：</h2>
<ul>
<li><strong>Go。</strong> 我们建议使用最新版本的 Go 来跟随本教程。有关安装说明，请参阅<a href="/doc/install">安装 Go</a>。</li>
<li><strong>VS Code</strong>，更新到最新版本。<a href="https://code.visualstudio.com/">在此处下载</a>。您也可以使用 Vim（详情请参见<a href="/security/vuln/editor#editor-specific-instructions">此处</a>），但本教程重点介绍 VS Code Go。</li>
<li><strong>VS Code Go 扩展</strong>，可以<a href="https://marketplace.visualstudio.com/items?itemName=golang.go">在此处下载</a>。</li>
<li><strong>编辑器特定的设置更改。</strong> 您需要根据<a href="/security/vuln/editor#editor-specific-instructions">这些规范</a>修改您的 IDE 设置，才能复现以下结果。</li>
</ul>
<h2>如何使用 VS Code Go 扫描漏洞</h2>
<p><strong>步骤 1.</strong> 运行 &quot;Go: Toggle Vulncheck&quot;</p>
<p><a href="https://github.com/golang/vscode-go/wiki/Commands#go-toggle-vulncheck">Toggle Vulncheck</a> 命令会显示您模块中列出的所有依赖的漏洞分析。要使用此命令，请在您的 IDE 中打开<a href="https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette">命令面板</a>（在 Linux/Windows 上按 Ctrl+Shift+P，在 Mac OS 上按 Cmd+Shift+P），然后运行 “Go: Toggle Vulncheck”。在您的 go.mod 文件中，您将看到代码中直接和间接使用的有漏洞依赖的诊断信息。</p>
<div class="image">
  <center>
    <img style="width: 100%" width="2110" height="952" src="editor_tutorial_1.png" alt="运行 Toggle Vulncheck"></img>
  </center>
</div>

<p>注意：要在您自己的编辑器上复现本教程，请将下面的代码复制到您的 main.go 文件中。```<br>// This program takes language tags as command-line<br>// arguments and parses them.</p>
<p>package main</p>
<p>import (<br>  &quot;fmt&quot;<br>  &quot;os&quot;</p>
<p>  &quot;golang.org/x/text/language&quot;<br>)</p>
<p>func main() {<br>  for _, arg := range os.Args[1:] {<br>    tag, err := language.Parse(arg)<br>    if err != nil {<br>      fmt.Printf(&quot;%s: error: %v\n&quot;, arg, err)<br>    } else if tag == language.Und {<br>      fmt.Printf(&quot;%s: undefined\n&quot;, arg)<br>    } else {<br>      fmt.Printf(&quot;%s: tag %s\n&quot;, arg, tag)<br>    }<br>  }<br>}</p>
<pre><code>然后，确保该程序对应的go.mod文件内容如下所示：```
module module1

go 1.18

require golang.org/x/text v0.3.5
</code></pre>
<p>现在，请运行 <code>go mod tidy</code> 命令以确保你的 go.sum 文件已更新。</p>
<p><strong>步骤 2.</strong> 通过代码操作运行 govulncheck。</p>
<p>使用代码操作运行 govulncheck 可以让你专注于代码中实际调用的依赖项。VS Code 中的代码操作以灯泡图标标识；将鼠标悬停在相关依赖项上可查看漏洞信息，然后选择“快速修复”会显示一个选项菜单。在其中选择“运行 govulncheck 进行验证”。这将在终端中返回相关的 govulncheck 输出。</p>
<div class="image">
  <center>
    <img style="width: 100%" width="2110" height="952" src="editor_tutorial_2.png" alt="govulncheck 代码操作"></img>
  </center>
</div>

<div class="image">
  <center>
    <img style="width: 100%" width="2110" height="952" src="editor_tutorial_3.png" alt="VS Code Go govulncheck 输出"></img>
  </center>
</div>

<p><strong>步骤 3</strong>. 将鼠标悬停在 go.mod 文件中列出的依赖项上。</p>
<p>你也可以通过将鼠标悬停在 go.mod 文件中的特定依赖项上来查看相关的 govulncheck 输出。要快速查看依赖项信息，此方法比使用代码操作更加高效。</p>
<div class="image">
  <center>
    <img style="width: 100%" width="2110" height="952" src="editor_tutorial_4.png" alt="悬停查看依赖项漏洞信息"></img>
  </center>
</div>

<p><strong>步骤 4.</strong> 升级到已修复漏洞的依赖项版本。</p>
<p>代码操作也可用于快速升级到已修复漏洞的依赖项版本。通过在代码操作下拉菜单中选择“升级”选项即可完成。</p>
<div class="image">
  <center>
    <img style="width: 100%" width="2110" height="952" src="editor_tutorial_5.png" alt="通过代码操作菜单升级到最新版本"></img>
  </center>
</div>

<h2>额外资源</h2>
<ul>
<li>有关 IDE 中漏洞扫描的更多信息，请参阅<a href="/security/vuln/editor">此页面</a>。特别是<a href="/security/vuln/editor#notes-and-caveats">“注意事项”章节</a>，讨论了漏洞扫描可能比上文示例更复杂的特殊情况。</li>
<li><a href="https://pkg.go.dev/vuln/">Go 漏洞数据库</a>包含来自多个现有来源的信息，以及 Go 软件包维护者直接向 Go 安全团队提交的报告。</li>
<li>参阅 <a href="/security/vuln/">Go 漏洞管理</a> 页面，了解用于检测、报告和管理漏洞的 Go 架构的高层概述。</li>
</ul>

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