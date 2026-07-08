<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>govulncheck - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
  "Title": "教程：使用 govulncheck 查找并修复存在漏洞的依赖",
  "HideTOC": true,
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
  "Title": "教程：使用 govulncheck 查找并修复存在漏洞的依赖",
  "HideTOC": true,
  "Breadcrumb": true
}-->

<p>govulncheck 是一款低噪音工具，可帮助您查找并修复 Go 项目中的存在漏洞的依赖项。它的工作原理是扫描项目的依赖项以识别已知漏洞，然后定位代码中对这些漏洞的直接或间接调用。</p>
<p>在本教程中，您将学习如何使用 govulncheck 扫描一个简单程序是否存在漏洞。您还将学习如何优先处理和评估漏洞，以便能够首先专注于修复最重要的漏洞。</p>
<p>若要了解更多关于 govulncheck 的信息，请参阅 <a href="https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck">govulncheck 文档</a> 以及这篇关于 <a href="/blog/vuln">Go 漏洞管理的博文</a>。我们也非常期待 <a href="/s/govulncheck-feedback">收到您的反馈</a>。</p>
<h2>前置条件</h2>
<ul>
<li><strong>Go。</strong> 我们建议使用最新版本的 Go 来跟随本教程操作。（安装说明请参阅<a href="/doc/install">安装 Go</a>。）</li>
<li><strong>代码编辑器。</strong> 您拥有的任何编辑器均可使用。</li>
<li><strong>命令终端。</strong> Go 在 Linux 和 Mac 上的任何终端中以及 Windows 上的 PowerShell 或 cmd 中均可良好运行。</li>
</ul>
<p>本教程将引导您完成以下步骤：</p>
<ol>
<li>创建一个包含存在漏洞依赖的示例 Go 模块</li>
<li>安装并运行 govulncheck</li>
<li>评估漏洞</li>
<li>升级存在漏洞的依赖</li>
</ol>
<h2>创建包含存在漏洞依赖的示例 Go 模块</h2>
<p><strong>步骤 1.</strong> 首先，创建一个名为 <code>vuln-tutorial</code> 的新文件夹并初始化一个 Go 模块。（如果您是 Go 模块新手，请查看 <a href="/doc/tutorial/create-module">go.dev/doc/tutorial/create-module</a>）。</p>
<p>例如，在您的主目录下，运行以下命令：```<br>$ mkdir vuln-tutorial<br>$ cd vuln-tutorial<br>$ go mod init vuln.tutorial</p>
<pre><code>**第二步.** 在 `vuln-tutorial` 文件夹内创建名为 `main.go` 的文件，并将以下代码复制其中：```
package main

import (
        &quot;fmt&quot;
        &quot;os&quot;

        &quot;golang.org/x/text/language&quot;
)

func main() {
        for _, arg := range os.Args[1:] {
                tag, err := language.Parse(arg)
                if err != nil {
                        fmt.Printf(&quot;%s: error: %v\n&quot;, arg, err)
                } else if tag == language.Und {
                        fmt.Printf(&quot;%s: undefined\n&quot;, arg)
                } else {
                        fmt.Printf(&quot;%s: tag %s\n&quot;, arg, tag)
                }
        }
}
</code></pre>
<p>该示例程序接收命令行参数中的语言标签列表，并为每个标签输出解析结果：解析成功、标签未定义，或解析过程中发生错误。</p>
<p><strong>步骤 3.</strong> 运行 <code>go mod tidy</code> 命令，该命令会将上一步在 <code>main.go</code> 中添加的代码所需的全部依赖项填入 <code>go.mod</code> 文件。</p>
<p>在 <code>vuln-tutorial</code> 文件夹下执行：```<br>$ go mod tidy</p>
<pre><code>您应该会看到如下输出：```
go: finding module for package golang.org/x/text/language
go: downloading golang.org/x/text v0.9.0
go: found golang.org/x/text/language in golang.org/x/text v0.9.0
</code></pre>
<p><strong>步骤4.</strong> 打开您的 <code>go.mod</code> 文件，确认其内容与以下示例一致：```<br>module vuln.tutorial</p>
<p>go 1.20</p>
<p>require golang.org/x/text v0.9.0</p>
<pre><code>**步骤 5.** 将 `golang.org/x/text` 包的版本降级至包含已知漏洞的 v0.3.5 版本。执行命令：```
$ go get golang.org/x/text@v0.3.5
</code></pre>
<p>你应该会看到这样的输出：```<br>go: downgraded golang.org/x/text v0.9.0 =&gt; v0.3.5</p>
<pre><code>现在 `go.mod` 文件应显示为：```
module vuln.tutorial

go 1.20

require golang.org/x/text v0.3.5
</code></pre>
<p>现在，让我们看看 govulncheck 的实际使用。</p>
<h2>安装并运行 govulncheck</h2>
<p><strong>步骤 6.</strong> 使用 <code>go install</code> 命令安装 govulncheck：```<br>$ go install golang.org/x/vuln/cmd/govulncheck@latest</p>
<pre><code>**步骤七。** 从您要分析的文件夹（本例中为 `vuln-tutorial`）运行：```
$ govulncheck ./...
</code></pre>
<p>您应该能看到如下输出：```<br>govulncheck is an experimental tool. Share feedback at <a href="https://go.dev/s/govulncheck-feedback">https://go.dev/s/govulncheck-feedback</a>.</p>
<p>Using go1.20.3 and <a href="mailto:govulncheck@v0.0.0">govulncheck@v0.0.0</a> with<br>vulnerability data from <a href="https://vuln.go.dev">https://vuln.go.dev</a> (last modified 2023-04-18 21:32:26 +0000 UTC).</p>
<p>Scanning your code and 46 packages across 1 dependent module for known vulnerabilities...<br>Your code is affected by 1 vulnerability from 1 module.</p>
<p>Vulnerability #1: GO-2021-0113<br>  Due to improper index calculation, an incorrectly formatted<br>  language tag can cause Parse to panic via an out of bounds read.<br>  If Parse is used to process untrusted user inputs, this may be<br>  used as a vector for a denial of service attack.</p>
<p>  More info: <a href="https://pkg.go.dev/vuln/GO-2021-0113">https://pkg.go.dev/vuln/GO-2021-0113</a></p>
<p>  Module: golang.org/x/text<br>    Found in: golang.org/x/<a href="mailto:text@v0.3.5">text@v0.3.5</a><br>    Fixed in: golang.org/x/<a href="mailto:text@v0.3.7">text@v0.3.7</a></p>
<pre><code>Call stacks in your code:
  main.go:12:29: vuln.tutorial.main calls golang.org/x/text/language.Parse
</code></pre>
<p>=== Informational ===</p>
<p>Found 1 vulnerability in packages that you import, but there are no call<br>stacks leading to the use of this vulnerability. You may not need to<br>take any action. See <a href="https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck">https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck</a><br>for details.</p>
<p>Vulnerability #1: GO-2022-1059<br>  An attacker may cause a denial of service by crafting an<br>  Accept-Language header which ParseAcceptLanguage will take<br>  significant time to parse.<br>  More info: <a href="https://pkg.go.dev/vuln/GO-2022-1059">https://pkg.go.dev/vuln/GO-2022-1059</a><br>  Found in: golang.org/x/<a href="mailto:text@v0.3.5">text@v0.3.5</a><br>  Fixed in: golang.org/x/<a href="mailto:text@v0.3.8">text@v0.3.8</a></p>
<pre><code>### 解读输出结果

&lt;font size=&quot;2&quot;&gt;  *注意：如果您未使用最新版本的 Go，可能会看到标准库中额外的漏洞信息。*&lt;/font&gt;

我们的代码受一个漏洞影响：
[GO-2021-0113](https://pkg.go.dev/vuln/GO-2021-0113)，因为代码直接调用了
`golang.org/x/text/language` 中存在漏洞的版本（v0.3.5）的 `Parse` 函数。

另一个漏洞 [GO-2022-1059](https://pkg.go.dev/vuln/GO-2022-1059) 存在于 `golang.org/x/text` 模块的 v0.3.5 版本中。但由于我们的代码从未（直接或间接）调用其任何易受攻击的函数，该漏洞被报告为&quot;信息性&quot;漏洞。

现在，让我们评估这些漏洞并确定应采取的措施。

### 评估漏洞

a. 评估漏洞。

首先，阅读漏洞描述，判断它是否确实适用于您的代码和使用场景。如需更多信息，请访问&quot;更多信息&quot;链接。

根据描述，漏洞 GO-2021-0113 可能在使用 `Parse` 处理不可信的用户输入时导致恐慌（panic）。假设我们的程序需要承受不可信输入，且我们关注拒绝服务攻击，那么该漏洞很可能适用。

GO-2022-1059 可能不影响我们的代码，因为我们的代码没有调用该报告中的任何易受攻击的函数。

b. 决定采取的措施。

为了缓解 GO-2021-0113 漏洞，我们有几个选项：
- **选项 1：升级到已修复的版本。** 如果存在可用的修复，我们可以通过将模块升级到已修复的版本来移除易受攻击的依赖项。
- **选项 2：停止使用易受攻击的符号。** 我们可以选择移除代码中对易受攻击函数的所有调用。
  我们需要找到替代方案或自行实现。

在本例中，存在可用的修复，且 `Parse` 函数是我们程序的核心部分。让我们将依赖项升级到&quot;已在 v0.3.7 版本中修复&quot;的版本。

我们决定暂时不优先修复信息性漏洞 GO-2022-1059，但由于它与 GO-2021-0113 位于同一模块中，且其已在 v0.3.8 版本中修复，因此我们可以通过升级到 v0.3.8 轻松地同时移除这两个漏洞。

## 升级易受攻击的依赖项

幸运的是，升级易受攻击的依赖项非常简单。

**步骤 8.** 将 `golang.org/x/text` 升级到 v0.3.8：```
$ go get golang.org/x/text@v0.3.8
</code></pre>
<p>您应该看到如下输出：```<br>go: upgraded golang.org/x/text v0.3.5 =&gt; v0.3.8</p>
<pre><code>（需要注意的是，我们也可以选择升级到`latest`版本，或v0.3.8之后的任何其他版本）。

**步骤9.** 现在再次运行govulncheck工具：```
$ govulncheck ./...
</code></pre>
<p>您现在将看到以下输出：```<br>govulncheck is an experimental tool. Share feedback at <a href="https://go.dev/s/govulncheck-feedback">https://go.dev/s/govulncheck-feedback</a>.</p>
<p>Using go1.20.3 and <a href="mailto:govulncheck@v0.0.0">govulncheck@v0.0.0</a> with<br>vulnerability data from <a href="https://vuln.go.dev">https://vuln.go.dev</a> (last modified 2023-04-06 19:19:26 +0000 UTC).</p>
<p>Scanning your code and 46 packages across 1 dependent module for known vulnerabilities...<br>No vulnerabilities found.</p>
<pre><code>最终，govulncheck确认未发现任何漏洞。

通过定期使用govulncheck命令扫描依赖项，您可以识别、优先级排序并修复漏洞，从而确保代码库安全。
</code></pre>

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