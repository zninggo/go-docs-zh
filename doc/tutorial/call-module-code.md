<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>call-module-code - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
    "Title": "从另一个模块调用你的代码",
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
    "Title": "从另一个模块调用你的代码",
    "Breadcrumb": true
}-->

<p>
  在<a href="/doc/tutorial/create-module.html">上一节</a>中，你创建了一个
  <code>greetings</code>模块。在本节中，你将编写代码来调用你刚才编写的模块中的<code>Hello</code>函数。你将编写可以作为应用程序执行的代码，该代码会调用<code>greetings</code>模块中的代码。
</p>

<aside class="Note">
  <strong>注意：</strong>本主题是多部分教程的一部分，该教程从<a href="/doc/tutorial/create-module.html">创建Go模块</a>开始。
</aside>

<ol>
  <li>
    为你的Go模块源代码创建一个<code>hello</code>目录。这将是你编写调用代码的地方。

<pre><code>&lt;p&gt;
  创建此目录后，你应该在层级结构中拥有同级的hello和greetings目录，如下所示：
&lt;/p&gt;
  &lt;pre&gt;&amp;lt;home&amp;gt;/
</code></pre>
<p> |-- greetings/<br> |-- hello/</pre></p>
<pre><code>&lt;p&gt;
  例如，如果你的命令提示符在greetings目录中，你可以使用以下命令：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>cd ..<br>mkdir hello<br>cd hello<br></pre
    ><br>  </li></p>
  <li>
    为你即将编写的代码启用依赖项跟踪。

<pre><code>&lt;p&gt;
  要为你的代码启用依赖项跟踪，请运行
  &lt;a
    href=&quot;/ref/mod#go-mod-init&quot;
    &gt;&lt;code&gt;go mod init&lt;/code&gt;命令&lt;/a&gt;，并提供你的代码将所属模块的名称。&lt;/p&gt;

&lt;p&gt;
    在本教程中，使用&lt;code&gt;example.com/hello&lt;/code&gt;作为模块路径。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go mod init example.com/hello<br>go: creating new go.mod: module example.com/hello<br></pre><br>  </li></p>
  <li>
    在你的文本编辑器中，在hello目录下创建一个文件用于编写代码，并将其命名为hello.go。
  </li>

  <li>
    编写代码来调用<code>Hello</code>函数，然后打印该函数的返回值。

<pre><code>&lt;p&gt;
  为此，请将以下代码粘贴到hello.go中。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>package main</p>
<p>import (<br>    &quot;fmt&quot;</p>
<pre><code>&quot;example.com/greetings&quot;
</code></pre>
<p>)</p>
<p>func main() {<br>    // 获取问候消息并打印。<br>    message := greetings.Hello(&quot;Gladys&quot;)<br>    fmt.Println(message)<br>}<br></pre></p>
<pre><code>&lt;p&gt;
  在此代码中，你：
&lt;/p&gt;

&lt;ul&gt;
  &lt;li&gt;
    声明了一个&lt;code&gt;main&lt;/code&gt;包。在Go中，作为应用程序执行的代码必须位于&lt;code&gt;main&lt;/code&gt;包中。
  &lt;/li&gt;
  &lt;li&gt;
    导入了两个包：&lt;code&gt;example.com/greetings&lt;/code&gt;和&lt;a href=&quot;https://pkg.go.dev/fmt/&quot;&gt;&lt;code&gt;fmt&lt;/code&gt;包&lt;/a&gt;。这使你的代码能够访问这些包中的函数。导入&lt;code&gt;example.com/greetings&lt;/code&gt;（即你之前创建的模块中包含的包）使你可以访问&lt;code&gt;Hello&lt;/code&gt;函数。你还导入了&lt;code&gt;fmt&lt;/code&gt;，它提供了处理输入和输出文本的函数（例如将文本打印到控制台）。
  &lt;/li&gt;
  &lt;li&gt;
    通过调用&lt;code&gt;greetings&lt;/code&gt;包的&lt;code&gt;Hello&lt;/code&gt;函数来获取问候语。
  &lt;/li&gt;
&lt;/ul&gt;
</code></pre>
  </li>

  <li>
    编辑<code>example.com/hello</code>模块以使用你本地的<code>example.com/greetings</code>模块。

<pre><code>&lt;p&gt;
  对于生产用途，你会从仓库发布&lt;code&gt;example.com/greetings&lt;/code&gt;模块（使用反映其发布位置的模块路径），Go工具可以在那里找到并下载它。目前，因为你还没有发布该模块，你需要调整&lt;code&gt;example.com/hello&lt;/code&gt;模块，使其能够在本地文件系统上找到&lt;code&gt;example.com/greetings&lt;/code&gt;代码。
&lt;/p&gt;

&lt;p&gt;
  为此，请使用
  &lt;a href=&quot;/ref/mod#go-mod-edit&quot;&gt;&lt;code&gt;go
  mod edit&lt;/code&gt;命令&lt;/a&gt;来编辑&lt;code&gt;example.com/hello&lt;/code&gt;模块，将Go工具从其模块路径（模块不在那里）重定向到本地目录（模块在那里）。
&lt;/p&gt;

&lt;ol&gt;
  &lt;li&gt;
    在hello目录的命令提示符下，运行以下命令：

&lt;pre&gt;
</code></pre>
<p>$ go mod edit -replace example.com/greetings=../greetings<br></pre></p>
<pre><code>&lt;p&gt;
  该命令指定为了定位依赖项，&lt;code&gt;example.com/greetings&lt;/code&gt;应被替换为&lt;code&gt;../greetings&lt;/code&gt;。运行该命令后，hello目录中的go.mod文件应包含一个&lt;a href=&quot;/doc/modules/gomod-ref#replace&quot;&gt;&lt;code&gt;replace&lt;/code&gt;指令&lt;/a&gt;：
&lt;/p&gt;

    &lt;pre&gt;
</code></pre>
<p>module example.com/hello</p>
<p>go 1.16</p>
<p><ins>replace example.com/greetings =&gt; ../greetings</ins><br></pre><br>      </li></p>
<pre><code>  &lt;li&gt;
    在hello目录的命令提示符下，运行
    &lt;a href=&quot;/ref/mod#go-mod-tidy&quot;&gt;
    &lt;code&gt;go mod tidy&lt;/code&gt;命令&lt;/a&gt;以同步&lt;code&gt;example.com/hello&lt;/code&gt;模块的依赖项，添加代码所需但模块尚未跟踪的那些依赖项。

    &lt;pre&gt;$ go mod tidy
</code></pre>
<p>go: found example.com/greetings in example.com/greetings v0.0.0-00010101000000-000000000000<br></pre><br>        <p><br>         命令完成后，<code>example.com/hello</code>模块的go.mod文件应如下所示：<br>        </p></p>
<pre><code>    &lt;pre&gt;module example.com/hello
</code></pre>
<p>go 1.16</p>
<p>replace example.com/greetings =&gt; ../greetings</p>
<p><ins>require example.com/greetings v0.0.0-00010101000000-000000000000</ins></pre></p>
<pre><code>    &lt;p&gt;
      该命令在greetings目录中找到了本地代码，然后添加了一个&lt;a href=&quot;/doc/modules/gomod-ref#require&quot;&gt;&lt;code&gt;require&lt;/code&gt;指令&lt;/a&gt;，指定&lt;code&gt;example.com/hello&lt;/code&gt;需要&lt;code&gt;example.com/greetings&lt;/code&gt;。当你在hello.go中导入&lt;code&gt;greetings&lt;/code&gt;包时，就创建了此依赖关系。
    &lt;/p&gt;
    &lt;p&gt;
      模块路径后面的数字是一个&lt;em&gt;伪版本号&lt;/em&gt;——一个生成的数字，用于代替语义版本号（该模块尚无语义版本号）。
    &lt;/p&gt;
    &lt;p&gt;
      要引用一个&lt;em&gt;已发布&lt;/em&gt;的模块，go.mod文件通常会省略&lt;code&gt;replace&lt;/code&gt;指令，并使用末尾带有带标签版本号的&lt;code&gt;require&lt;/code&gt;指令。
    &lt;/p&gt;

    &lt;pre&gt;require example.com/greetings v1.1.0&lt;/pre&gt;

    &lt;p&gt;有关版本号的更多信息，请参阅&lt;a href=&quot;/doc/modules/version-numbers&quot;&gt;模块版本编号&lt;/a&gt;。&lt;/p&gt;
  &lt;/li&gt;
&lt;/ol&gt;
</code></pre>
  <li>
    在<code>hello</code>目录的命令提示符下，运行你的代码以确认其是否正常工作。

<pre><code>&lt;pre&gt;
</code></pre>
<p>$ go run .<br>Hi, Gladys. Welcome!<br></pre><br>  </li></p>
</ol>

<p>
  恭喜！你已经编写了两个可运行的模块。
</p>

<p>
  在下一个主题中，你将添加一些错误处理。
</p>

<p class="Navigation">
  <a class="Navigation-prev" href="/doc/tutorial/create-module.html"
    >&lt; 创建Go模块</a
  >
  <a class="Navigation-next" href="/doc/tutorial/handle-errors.html"
    >返回并处理错误 &gt;</a
  >
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