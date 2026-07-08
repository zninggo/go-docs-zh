<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>compile-install - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
    "Title": "编译并安装应用程序",
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
    "Title": "编译并安装应用程序",
    "Breadcrumb": true
}-->

<p>
  在这最后一个主题中，您将学习几个新的 <code>go</code> 命令。虽然 <code>go run</code> 命令在频繁修改代码时是一个方便的快捷方式，用于编译和运行程序，但它不会生成二进制可执行文件。</p>

<p>
  本主题介绍另外两个用于构建代码的命令：
</p>

<ul>
  <li>
    <a href="/cmd/go/#hdr-Compile_packages_and_dependencies"><code>go
    build</code> 命令</a>会编译包及其依赖项，但不会安装编译结果。
  </li>
  <li>
    <a href="/ref/mod#go-install"><code>go
    install</code> 命令</a>会编译并安装包。
  </li>
</ul>

<aside class="Note">
  <strong>注意：</strong>本主题是一个多部分教程的一部分，该教程从<a href="create-module.html">创建一个 Go 模块</a>开始。
</aside>

<ol>
  <li>
    在 hello 目录的命令行中，运行 <code>go build</code> 命令，将代码编译成一个可执行文件。

<pre><code>&lt;pre&gt;$ go build&lt;/pre&gt;
</code></pre>
  </li>

  <li>
    在 hello 目录的命令行中，运行新的 <code>hello</code> 可执行文件，以确认代码工作正常。

<pre><code>&lt;p&gt;
  请注意，您的结果可能有所不同，这取决于您在测试后是否修改了 greetings.go 代码。
&lt;/p&gt;

&lt;ul&gt;
  &lt;li&gt;
    在 Linux 或 Mac 上：

    &lt;pre&gt;
</code></pre>
<p>$ ./hello<br>map[Darrin:Great to see you, Darrin! Gladys:Hail, Gladys! Well met! Samantha:Hail, Samantha! Well met!]<br></pre><br>      </li></p>
<pre><code>  &lt;li&gt;
    在 Windows 上：

    &lt;pre&gt;
</code></pre>
<p>$ hello.exe<br>map[Darrin:Great to see you, Darrin! Gladys:Hail, Gladys! Well met! Samantha:Hail, Samantha! Well met!]<br></pre><br>      </li><br>    </ul><br>    <p><br>      您已经将应用程序编译成了一个可执行文件，现在可以运行它了。但要运行它，您当前的命令提示符（命令行）要么需要位于该可执行文件所在的目录中，要么需要指定该可执行文件的路径。<br>    </p><br>    <p><br>      接下来，您将安装该可执行文件，以便无需指定其路径即可运行。<br>    </p><br>  </li></p>
  <li>
    探查 Go 的安装路径，<code>go</code> 命令将把当前包安装到此路径。

<pre><code>&lt;p&gt;
  您可以通过运行
  &lt;a href=&quot;/cmd/go/#hdr-List_packages_or_modules&quot;&gt;
    &lt;code&gt;go list&lt;/code&gt; 命令&lt;/a&gt;来查找安装路径，如下例所示：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go list -f &#39;{{.Target}}&#39;<br></pre></p>
<pre><code>&lt;p&gt;
  例如，该命令的输出可能是 &lt;code&gt;/home/gopher/bin/hello&lt;/code&gt;，这意味着二进制文件将被安装到 /home/gopher/bin。您将在下一步中用到此安装目录。
&lt;/p&gt;
</code></pre>
  </li>

  <li>
    将 Go 安装目录添加到系统的 shell 环境变量 PATH 中。

<pre><code>&lt;p&gt;
  这样，您就可以在不指定可执行文件位置的情况下运行您的程序。
&lt;/p&gt;

&lt;ul&gt;
  &lt;li&gt;
    在 Linux 或 Mac 上，运行以下命令：

    &lt;pre&gt;
</code></pre>
<p>$ export PATH=$PATH:/path/to/your/install/directory<br></pre><br>      </li></p>
<pre><code>  &lt;li&gt;
    在 Windows 上，运行以下命令：

    &lt;pre&gt;
</code></pre>
<p>$ set PATH=%PATH%;C:\path\to\your\install\directory<br></pre><br>      </li><br>    </ul></p>
<pre><code>&lt;p&gt;
  或者，如果您已经有一个像 &lt;code&gt;$HOME/bin&lt;/code&gt; 这样的目录在您的 shell 路径中，并且您想将 Go 程序安装到那里，您可以通过使用
  &lt;a href=&quot;/cmd/go/#hdr-Print_Go_environment_information&quot;&gt;
    &lt;code&gt;go env&lt;/code&gt; 命令&lt;/a&gt;设置 &lt;code&gt;GOBIN&lt;/code&gt; 变量来更改安装目标：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go env -w GOBIN=/path/to/your/bin<br></pre></p>
<pre><code>&lt;p&gt;
  或者
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go env -w GOBIN=C:\path\to\your\bin<br></pre><br>  </li></p>
  <li>
    更新 shell 路径后，运行 <code>go install</code> 命令来编译并安装该包。

<pre><code>&lt;pre&gt;$ go install&lt;/pre&gt;
</code></pre>
  </li>

  <li>
    只需输入程序名称即可运行您的应用程序。为了让这更有趣，请打开一个新的命令提示符，然后在其他任意目录中运行 <code>hello</code> 可执行文件名称。

<pre><code>&lt;pre&gt;
</code></pre>
<p>$ hello<br>map[Darrin:Hail, Darrin! Well met! Gladys:Great to see you, Gladys! Samantha:Hail, Samantha! Well met!]<br></pre><br>  </li></p>
</ol>

<p>
  这就是 Go 教程的全部内容！
</p>

<p class="Navigation">
  <a class="Navigation-prev" href="add-a-test.html">&lt; 添加测试</a>
  <a class="Navigation-next" href="module-conclusion.html">结论与更多资源链接 &gt;</a>
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