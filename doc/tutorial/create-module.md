<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>create-module - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
    "Title": "教程：创建一个Go模块",
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
    "Title": "教程：创建一个Go模块",
    "Breadcrumb": true
}-->

<p>
  本教程是系列教程的第一部分，将介绍 Go 语言的一些基本特性。如果你刚开始学习 Go，请务必查看<a href="/doc/tutorial/getting-started.html">教程：Go 快速入门</a>，其中介绍了 `go` 命令、Go 模块（module）以及非常简单的 Go 代码。
</p>

<p>
  在本教程中，你将创建两个模块。第一个是库（library），旨在被其他库或应用程序导入（import）。第二个是调用者应用程序（caller application），它将使用第一个模块。
</p>

<p>
  本教程的序列包含七个简短的主题，每个主题都展示了语言的不同部分。
</p>

<ol>
  <li>
    创建一个模块 -- 编写一个包含可以从另一个模块调用的函数的小模块。
  </li>
  <li>
    <a href="/doc/tutorial/call-module-code.html">从另一个模块调用你的代码</a> -- 导入并使用你的新模块。
  </li>
  <li>
    <a href="/doc/tutorial/handle-errors.html">返回并处理一个错误（error）</a> -- 添加简单的错误处理。
  </li>
  <li>
    <a href="/doc/tutorial/random-greeting.html">返回一个随机问候语</a> -- 在切片（slice，Go 的动态大小数组）中处理数据。
  </li>
  <li>
    <a href="/doc/tutorial/greetings-multiple-people.html">为多人返回问候语</a> -- 在映射（map）中存储键值对。
  </li>
  <li>
    <a href="/doc/tutorial/add-a-test.html">添加一个测试</a> -- 使用 Go 内置的单元测试功能来测试你的代码。
  </li>
  <li>
    <a href="/doc/tutorial/compile-install.html">编译并安装应用程序</a> -- 在本地编译并安装你的代码。
  </li>
</ol>

<aside class="Note">
  <strong>注意：</strong> 其他教程，请参阅<a href="/doc/tutorial/index.html">教程</a>。
</aside>

<h2 id="prerequisites">前提条件</h2>

<ul>
  <li>
    <strong>一定的编程经验。</strong> 这里的代码相当简单，但了解一些关于函数（function）、循环（loop）和数组（array）的知识会有所帮助。
  </li>
  <li>
    <strong>一个编辑代码的工具。</strong> 任何你拥有的文本编辑器都可以正常工作。大多数文本编辑器对 Go 都有很好的支持。最流行的是 VSCode（免费）、GoLand（付费）和 Vim（免费）。
  </li>
  <li>
    <strong>一个命令终端。</strong> Go 在 Linux 和 Mac 的任何终端以及 Windows 的 PowerShell 或 cmd 中都能很好地工作。
  </li>
</ul>

<h2 id="start">启动一个他人可以使用的模块</h2>

<p>
  首先创建一个 Go 模块（module）。在一个模块中，你将一个或多个相关的包（package）收集起来，形成一组离散且有用的函数。例如，你可以创建一个包含执行财务分析函数的包的模块，这样其他编写财务应用程序的开发者就可以使用你的工作成果。有关开发模块的更多信息，请参阅<a href="/doc/modules/developing">开发与发布模块</a>。
</p>

<p>
  Go 代码被组织成包（package），而包又被组织成模块（module）。你的模块指定了运行代码所需的依赖项，包括 Go 版本和它所需要的其他模块集合。
</p>

<p>
  当你在模块中添加或改进功能时，你会发布该模块的新版本。编写调用你的模块中函数的代码的开发者，可以导入该模块更新后的包，并在将其投入生产使用之前用新版本进行测试。
</p>

<ol>
  <li>
    打开命令提示符，并使用 `cd` 切换到你的主目录。

<pre><code>&lt;p&gt;
  在 Linux 或 Mac 上：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>cd<br></pre></p>
<pre><code>&lt;p&gt;
  在 Windows 上：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>cd %HOMEPATH%<br></pre><br>  </li></p>
  <li>
    为你的 Go 模块源代码创建一个 `greetings` 目录。

<pre><code>&lt;p&gt;
  例如，在你的主目录下使用以下命令：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>mkdir greetings<br>cd greetings<br></pre><br>  </li></p>
  <li>
    使用 <a href="/ref/mod#go-mod-init"><code>go mod init</code> 命令</a>来初始化你的模块。

<pre><code>&lt;p&gt;
  运行 `go mod init` 命令，并给出你的模块路径（module path）-- 这里使用 `example.com/greetings`。如果你要发布一个模块，这个路径&lt;em&gt;必须&lt;/em&gt;是一个 Go 工具可以从中下载你的模块的路径。那通常就是你的代码仓库（repository）。
&lt;/p&gt;

&lt;p&gt;
  有关使用模块路径命名模块的更多信息，请参阅&lt;a href=&quot;/doc/modules/managing-dependencies#naming_module&quot;&gt;管理依赖项&lt;/a&gt;。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go mod init example.com/greetings<br>go: creating new go.mod: module example.com/greetings<br></pre></p>
<pre><code>&lt;p&gt;
  `go mod init` 命令创建一个 `go.mod` 文件来跟踪你的代码的依赖项。到目前为止，该文件只包含你的模块名称和你的代码支持的 Go 版本。但随着你添加依赖项，`go.mod` 文件将列出你的代码所依赖的版本。这可以保持构建的可重现性，并让你直接控制使用哪个模块版本。
&lt;/p&gt;
</code></pre>
  </li>

  <li>
    在你的文本编辑器中，创建一个用于编写代码的文件，命名为 `greetings.go`。
  </li>

  <li>
    将以下代码粘贴到你的 `greetings.go` 文件中并保存。

<pre><code>&lt;pre&gt;
</code></pre>
<p>package greetings</p>
<p>import &quot;fmt&quot;</p>
<p>// Hello returns a greeting for the named person.<br>// Hello 返回一个针对指定人的问候语。<br>func Hello(name string) string {<br>    // Return a greeting that embeds the name in a message.<br>    // 返回一个将名字嵌入消息中的问候语。<br>    message := fmt.Sprintf(&quot;Hi, %v. Welcome!&quot;, name)<br>    return message<br>}<br></pre></p>
<pre><code>&lt;p&gt;
  这是你模块的第一段代码。它向任何请求问候的调用者返回一个问候语。你将在下一步编写调用此函数的代码。
&lt;/p&gt;

&lt;p&gt;
  在这段代码中，你：
&lt;/p&gt;

&lt;ul&gt;
  &lt;li&gt;
    声明（declare）了一个 `greetings` 包（package）来收集相关的函数。
  &lt;/li&gt;
  &lt;li&gt;
    实现（implement）了一个 `Hello` 函数来返回问候语。
    &lt;p&gt;
      该函数接受一个类型为 `string` 的 `name` 参数。该函数也返回一个 `string`。在 Go 中，名称以大写字母开头的函数可以被非同一包（package）中的函数调用。这在 Go 中被称为导出的名称（exported name）。有关导出的名称的更多信息，请参阅 Go 之旅中的&lt;a href=&quot;/tour/basics/3&quot;&gt;导出的名称&lt;/a&gt;。
    &lt;/p&gt;
    &lt;img src=&quot;images/function-syntax.png&quot; width=&quot;300px&quot; /&gt;
  &lt;/li&gt;

  &lt;li&gt;
    声明（declare）一个 `message` 变量（variable）来保存你的问候语。
    &lt;p&gt;
      在 Go 中，`:=` 操作符是一种在一行内声明并初始化（initialize）变量的快捷方式（Go 使用右侧的值来确定变量的类型）。如果用更长的方式，你可能会这样写：
    &lt;/p&gt;
    &lt;pre&gt;
</code></pre>
<p>var message string<br>message = fmt.Sprintf(&quot;Hi, %v. Welcome!&quot;, name)<br></pre><br>      </li></p>
<pre><code>  &lt;li&gt;
    使用 `fmt` 包的 &lt;a href=&quot;https://pkg.go.dev/fmt/#Sprintf&quot;&gt;&lt;code&gt;Sprintf&lt;/code&gt; 函数&lt;/a&gt;来创建一个问候消息。第一个参数是一个格式字符串（format string），`Sprintf` 将 `name` 参数的值替换（substitute）到 `%v` 格式动词（format verb）的位置。插入 `name` 参数的值就完成了问候文本。
  &lt;/li&gt;
  &lt;li&gt;将格式化后的问候文本返回给调用者。&lt;/li&gt;
&lt;/ul&gt;
</code></pre>
  </li>
</ol>

<p>
  在下一步中，你将从另一个模块调用此函数。
</p>

<p class="Navigation">
  <a class="Navigation-next" href="/doc/tutorial/call-module-code.html">从另一个模块调用你的代码 &gt;</a>
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