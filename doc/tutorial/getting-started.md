<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>getting-started - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
    "Title": "教程：Go 语言入门指南",
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
    "Title": "教程：Go 语言入门指南",
    "Breadcrumb": true
}-->

<p>
  本教程将为你简要介绍 Go 语言编程。在此过程中，你将完成以下内容：
</p>

<ul>
  <li>安装 Go（如果尚未安装）。</li>
  <li>编写一些简单的 "Hello, world" 代码。</li>
  <li>使用 <code>go</code> 命令运行你的代码。</li>
  <li>
    使用 Go 包发现工具查找可以在自己代码中使用的包。
  </li>
  <li>调用外部模块的函数。</li>
</ul>

<aside class="Note">
  <strong>注意：</strong> 其他教程请参见
  <a href="/doc/tutorial/index.html">教程</a>。
</aside>

<h2 id="prerequisites">前提条件</h2>

<ul>
  <li>
    <strong>一定的编程经验。</strong> 这里的代码相当简单，但了解一些关于函数（function）的知识会有所帮助。
  </li>
  <li>
    <strong>一个用于编辑代码的工具。</strong> 你拥有的任何文本编辑器都可以正常工作。大多数文本编辑器对 Go 有良好的支持。最受欢迎的包括 VSCode（免费）、GoLand（付费）和 Vim（免费）。
  </li>
  <li>
    <strong>一个命令行终端。</strong> Go 在 Linux 和 Mac 的任何终端上都能很好地工作，在 Windows 上则可以使用 PowerShell 或 cmd。
  </li>
</ul>

<h2 id="install">安装 Go</h2>

<p>请按照 <a href="/doc/install">下载与安装</a> 步骤进行操作。</p>

<h2 id="code">编写一些代码</h2>

<p>
  从 Hello, World 开始吧。
</p>

<ol>
  <li>
    打开命令提示符，并 cd 到你的主目录。

<pre><code>&lt;p&gt;
  在 Linux 或 Mac 上：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>cd<br></pre
    ></p>
<pre><code>&lt;p&gt;
  在 Windows 上：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>cd %HOMEPATH%<br></pre
    ><br>  </li></p>
  <li>
    为你的第一个 Go 源代码创建一个 hello 目录。

<pre><code>&lt;p&gt;
  例如，使用以下命令：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>mkdir hello<br>cd hello<br></pre
    ><br>  </li></p>
  <li>
    为你的代码启用依赖跟踪。

<pre><code>&lt;p&gt;
  当你的代码导入其他模块（module）中包含的包（package）时，你需要通过代码自身的模块来管理这些依赖。该模块由一个 go.mod 文件定义，该文件跟踪提供这些包的模块。go.mod 文件会随你的代码一起保存，包括在你的源代码仓库中。
&lt;/p&gt;

&lt;p&gt;
  要通过创建 go.mod 文件来为你的代码启用依赖跟踪，请运行
  &lt;a href=&quot;/ref/mod#go-mod-init&quot;&gt;&lt;code&gt;go mod init&lt;/code&gt;&lt;/a&gt; 命令，并为其提供你的代码将位于的模块名称。该名称是模块的模块路径（module path）。
&lt;/p&gt;
&lt;p&gt;在实际开发中，模块路径通常是你的源代码将存放的仓库位置。例如，模块路径可能是 &lt;code&gt;github.com/mymodule&lt;/code&gt;。如果你计划发布你的模块供他人使用，模块路径&lt;em&gt;必须&lt;/em&gt;是 Go 工具可以下载你的模块的位置。关于使用模块路径命名模块的更多信息，请参阅&lt;a href=&quot;/doc/modules/managing-dependencies#naming_module&quot;&gt;管理依赖&lt;/a&gt;。
&lt;/p&gt;

  &lt;p&gt;在本教程中，请使用
      &lt;code&gt;example/hello&lt;/code&gt;。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go mod init example/hello<br>go: creating new go.mod: module example/hello<br></pre
    ><br>  </li></p>
  <li>
    <p>在你的文本编辑器中，创建一个名为 hello.go 的文件，用于编写你的代码。</p>
  </li>

  <li>
    <p>将以下代码粘贴到你的 hello.go 文件中并保存。</p>

<pre><code>&lt;pre&gt;
</code></pre>
<p>package main</p>
<p>import &quot;fmt&quot;</p>
<p>func main() {<br>    fmt.Println(&quot;Hello, World!&quot;)<br>}<br></pre
    ></p>
<pre><code>&lt;p&gt;
  这是你的 Go 代码。在这段代码中，你：
&lt;/p&gt;

&lt;ul&gt;
  &lt;li&gt;
    声明（declaration）了一个 &lt;code&gt;main&lt;/code&gt; 包（package）（包是一种将函数（function）分组的方式，它由同一目录下的所有文件组成）。
  &lt;/li&gt;
  &lt;li&gt;
    导入（import）了常用的
    &lt;a href=&quot;https://pkg.go.dev/fmt/&quot;&gt;&lt;code&gt;fmt&lt;/code&gt; 包&lt;/a&gt;，该包包含用于格式化文本的函数，包括打印到控制台。这个包是安装 Go 时获得的&lt;a href=&quot;https://pkg.go.dev/std&quot;&gt;标准库&lt;/a&gt;包之一。
  &lt;/li&gt;
  &lt;li&gt;
    实现了一个 &lt;code&gt;main&lt;/code&gt; 函数（function），用于向控制台打印一条消息。当你运行 &lt;code&gt;main&lt;/code&gt; 包时，&lt;code&gt;main&lt;/code&gt; 函数会默认执行。
  &lt;/li&gt;
&lt;/ul&gt;
</code></pre>
  </li>

  <li>
    <p>运行你的代码，查看问候消息。</p>

<pre><code>&lt;pre&gt;
</code></pre>
<p>$ go run .<br>Hello, World!<br></pre
    ></p>
<pre><code>&lt;p&gt;
  &lt;a href=&quot;/cmd/go/#hdr-Compile_and_run_Go_program&quot;
    &gt;&lt;code&gt;go run&lt;/code&gt;&lt;/a&gt; 命令是你将用来完成 Go 中各种任务的众多 &lt;code&gt;go&lt;/code&gt; 命令之一。使用以下命令可以获取其他命令的列表：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go help<br></pre
    ><br>  </li></p>
</ol>

<h2 id="call">调用外部包中的代码</h2>

<p>
  当你的代码需要实现某个可能已经被别人实现过的功能时，你可以查找一个包含可在你代码中使用的函数的包。
</p>

<ol>
  <li>
    使用一个外部模块中的函数，让你打印的消息更有趣一些。

<pre><code>&lt;ol&gt;
  &lt;li&gt;
    访问 pkg.go.dev 并&lt;a href=&quot;https://pkg.go.dev/search?q=quote&quot;&gt;搜索 &quot;quote&quot; 包&lt;/a&gt;。
  &lt;/li&gt;
  &lt;li&gt;
    在搜索结果中，找到并点击 &lt;code&gt;rsc.io/quote&lt;/code&gt; 包的 v1 版本（它应该列在 &lt;code&gt;rsc.io/quote/v4&lt;/code&gt; 的&quot;其他主要版本&quot;下）。
  &lt;/li&gt;
  &lt;li&gt;
    在&lt;strong&gt;文档&lt;/strong&gt;部分下的&lt;strong&gt;索引&lt;/strong&gt;中，注意列出的可以从你的代码中调用的函数。你将使用 &lt;code&gt;Go&lt;/code&gt; 函数。
  &lt;/li&gt;
  &lt;li&gt;
    在此页面顶部，请注意 &lt;code&gt;quote&lt;/code&gt; 包包含在 &lt;code&gt;rsc.io/quote&lt;/code&gt; 模块中。
  &lt;/li&gt;
&lt;/ol&gt;

&lt;p&gt;
  你可以使用 pkg.go.dev 网站来查找已发布的模块，这些模块的包具有你可以在自己代码中使用的函数。包是在模块中发布的——例如 &lt;code&gt;rsc.io/quote&lt;/code&gt;——其他人可以使用它们。模块会随着时间的推移通过新版本得到改进，你可以升级你的代码以使用改进的版本。
&lt;/p&gt;
</code></pre>
  </li>

  <li>
    在你的 Go 代码中，导入（import）<code>rsc.io/quote</code> 包，并添加对其 <code>Go</code> 函数的调用。

<pre><code>&lt;p&gt;
  添加高亮行后，你的代码应包含以下内容：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>package main</p>
<p>import &quot;fmt&quot;</p>
<p><ins>import &quot;rsc.io/quote&quot;</ins></p>
<p>func main() {<br>    <ins>fmt.Println(quote.Go())</ins><br>}<br></pre><br>  </li></p>
  <li>
    添加新的模块要求和校验和。

<pre><code>&lt;p&gt;
  Go 会将 &lt;code&gt;quote&lt;/code&gt; 模块添加为依赖项，并生成一个 go.sum 文件用于验证模块。更多信息，请参阅 Go Modules 参考中的&lt;a href=&quot;/ref/mod#authenticating&quot;&gt;验证模块&lt;/a&gt;。
&lt;/p&gt;
&lt;pre&gt;
</code></pre>
<p>$ go mod tidy<br>go: finding module for package rsc.io/quote<br>go: found rsc.io/quote in rsc.io/quote v1.5.2<br></pre
    ><br>  </li></p>
  <li>
    运行你的代码，查看由你调用的函数生成的消息。

<pre><code>&lt;pre&gt;
</code></pre>
<p>$ go run .<br>Don&#39;t communicate by sharing memory, share memory by communicating.<br></pre
    ></p>
<pre><code>&lt;p&gt;
  请注意，你的代码调用了 &lt;code&gt;Go&lt;/code&gt; 函数，打印了一条关于通信的巧妙消息。
&lt;/p&gt;

&lt;p&gt;
  当你运行 &lt;code&gt;go mod tidy&lt;/code&gt; 时，它定位并下载了包含你导入的包的 &lt;code&gt;rsc.io/quote&lt;/code&gt; 模块。默认情况下，它下载了最新版本——v1.5.2。
&lt;/p&gt;
</code></pre>
  </li>
</ol>

<h2 id="write-more">编写更多代码</h2>

<p>
  通过这个快速入门指南，你已经安装了 Go 并学习了一些基础知识。要编写更多代码并了解另一个教程，请查看<a href="/doc/tutorial/create-module.html">创建 Go 模块</a>。
</p>
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