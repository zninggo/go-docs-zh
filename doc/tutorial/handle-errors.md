<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>handle-errors - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
    "Title": "返回并处理错误",
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
    "Title": "返回并处理错误",
    "Breadcrumb": true
}-->

<p>
  处理错误是编写健壮代码的核心功能。在本节中，您将添加一些代码以从 greetings 模块返回错误，并在调用方进行处理。
</p>

<aside class="Note">
  <strong>注意：</strong>本主题是一个多部分教程的一部分，该教程从 <a href="/doc/tutorial/create-module.html">创建 Go 模块</a> 开始。
</aside>

<ol>
  <li>
    在 greetings/greetings.go 中，添加下方高亮显示的代码。

<pre><code>&lt;p&gt;
  如果不知道该问候谁，发送问候就毫无意义。如果名字为空，请向调用方返回一个错误。将以下代码复制到 greetings.go 中并保存文件。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>package greetings</p>
<p>import (<br>    <ins>&quot;errors&quot;</ins><br>    &quot;fmt&quot;<br>)</p>
<p>// Hello 为指定的人返回问候语。<br>func Hello(name string) <ins>(</ins>string<ins>, error)</ins> {<br>    <ins>// 如果未提供名字，则返回带消息的错误。<br>    if name == &quot;&quot; {<br>        return &quot;&quot;, errors.New(&quot;empty name&quot;)<br>    }</ins></p>
<pre><code>// 如果收到了名字，则返回一个将名字嵌入问候消息中的值。
message := fmt.Sprintf(&quot;Hi, %v. Welcome!&quot;, name)
return message&lt;ins&gt;, nil&lt;/ins&gt;
</code></pre>
<p>}<br></pre></p>
<pre><code>&lt;p&gt;
  在此代码中，您：
&lt;/p&gt;

&lt;ul&gt;
  &lt;li&gt;
    更改了函数，使其返回两个值：一个 &lt;code&gt;string&lt;/code&gt; 和一个 &lt;code&gt;error&lt;/code&gt;。您的调用方将检查第二个值以查看是否发生了错误。（任何 Go 函数都可以返回多个值。更多信息，请参阅 &lt;a href=&quot;/doc/effective_go.html#multiple-returns&quot;&gt;Effective Go&lt;/a&gt;。）
  &lt;/li&gt;
  &lt;li&gt;
    导入了 Go 标准库的 &lt;code&gt;errors&lt;/code&gt; 包，以便可以使用其 &lt;a href=&quot;https://pkg.go.dev/errors/#example-New&quot;&gt;&lt;code&gt;errors.New&lt;/code&gt; 函数&lt;/a&gt;。
  &lt;/li&gt;
  &lt;li&gt;
    添加了一个 &lt;code&gt;if&lt;/code&gt; 语句来检查无效请求（名字应为字符串但实际为空），并在请求无效时返回错误。&lt;code&gt;errors.New&lt;/code&gt; 函数返回一个包含您消息的 &lt;code&gt;error&lt;/code&gt;。
  &lt;/li&gt;
  &lt;li&gt;
    在成功的返回值中添加了 &lt;code&gt;nil&lt;/code&gt;（表示无错误）作为第二个值。这样，调用方就能知道函数成功执行了。
  &lt;/li&gt;
&lt;/ul&gt;
</code></pre>
  </li>

  <li>
    在您的 hello/hello.go 文件中，现在处理 <code>Hello</code> 函数返回的错误以及非错误值。

<pre><code>&lt;p&gt;
  将以下代码粘贴到 hello.go 中。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>package main</p>
<p>import (<br>    &quot;fmt&quot;<br>    <ins>&quot;log&quot;</ins></p>
<pre><code>&quot;example.com/greetings&quot;
</code></pre>
<p>)</p>
<p>func main() {<br>    <ins>// 设置预定义 Logger 的属性，包括日志条目前缀和一个标志，<br>    // 用于禁用打印时间、源文件和行号。<br>    log.SetPrefix(&quot;greetings: &quot;)<br>    log.SetFlags(0)</ins></p>
<pre><code>// 请求一个问候消息。
&lt;ins&gt;message, err := greetings.Hello(&quot;&quot;)&lt;/ins&gt;
&lt;ins&gt;// 如果返回了错误，则将其打印到控制台并退出程序。
if err != nil {
    log.Fatal(err)
}

// 如果未返回错误，则将返回的消息打印到控制台。&lt;/ins&gt;
fmt.Println(message)
</code></pre>
<p>}<br></pre></p>
<pre><code>&lt;p&gt;
  在此代码中，您：
&lt;/p&gt;

&lt;ul&gt;
  &lt;li&gt;
    配置了 &lt;a href=&quot;https://pkg.go.dev/log/&quot;&gt;&lt;code&gt;log&lt;/code&gt; 包&lt;/a&gt;，以便在其日志消息的开头打印命令名称（&quot;greetings: &quot;），而不带时间戳或源文件信息。
  &lt;/li&gt;
  &lt;li&gt;
    将 &lt;code&gt;Hello&lt;/code&gt; 的两个返回值（包括 &lt;code&gt;error&lt;/code&gt;）都赋给了变量。
  &lt;/li&gt;
  &lt;li&gt;
    将 &lt;code&gt;Hello&lt;/code&gt; 的参数从 Gladys 的名字更改为空字符串，以便可以测试您的错误处理代码。
  &lt;/li&gt;
  &lt;li&gt;
    查找非 nil 的 &lt;code&gt;error&lt;/code&gt; 值。在这种情况下继续执行没有意义。
  &lt;/li&gt;
  &lt;li&gt;
    使用标准库 &lt;code&gt;log 包&lt;/code&gt;中的函数输出错误信息。如果遇到错误，您使用该 &lt;code&gt;log&lt;/code&gt; 包的 &lt;a href=&quot;https://pkg.go.dev/log?tab=doc#Fatal&quot;&gt;&lt;code&gt;Fatal&lt;/code&gt; 函数&lt;/a&gt;打印错误并停止程序。
  &lt;/li&gt;
&lt;/ul&gt;
</code></pre>
  </li>

  <li>
    在 <code>hello</code> 目录下的命令行中，运行 hello.go 以确认代码是否工作。

<pre><code>&lt;p&gt;
  现在您传入了一个空名字，将会得到一个错误。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go run .<br>greetings: empty name<br>exit status 1<br></pre
    ><br>  </li></p>
</ol>

<p>
  这就是 Go 中常见的错误处理方式：将错误作为值返回，以便调用方可以对其进行检查。
</p>

<p>
  接下来，您将使用 Go 切片来返回一个随机选择的问候语。
</p>

<p class="Navigation">
  <a class="Navigation-prev" href="/doc/tutorial/call-module-code.html"
    >&lt; 从另一个模块调用您的代码</a
  >
  <a class="Navigation-next" href="/doc/tutorial/random-greeting.html"
    >返回随机问候语 &gt;</a
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