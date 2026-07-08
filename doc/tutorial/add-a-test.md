<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>add-a-test - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
    "Title": "添加测试",
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
    "Title": "添加测试",
    "Breadcrumb": true
}-->

<p>
  现在您的代码已经稳定运行（顺便说一句，做得很好），
  是时候添加测试了。在开发过程中测试代码可以发现那些在修改过程中引入的错误。本节中，我们将为
  <code>Hello</code> 函数添加测试。
</p>

<aside class="Note">
  <strong>注意：</strong> 本节是多部分教程的一部分，该教程从
  <a href="/doc/tutorial/create-module.html">创建Go模块</a>开始。
</aside>

<p>
  Go 语言内置的测试支持使得在开发过程中测试更加便捷。
  具体来说，通过命名约定、Go 的 <code>testing</code> 包以及
  <code>go test</code> 命令，您可以快速编写和执行测试。
</p>

<ol>
  <li>
    在 greetings 目录下，创建一个名为 greetings_test.go 的文件。

<pre><code>&lt;p&gt;
  文件名以 _test.go 结尾会告诉 &lt;code&gt;go test&lt;/code&gt; 命令
  此文件包含测试函数。
&lt;/p&gt;
</code></pre>
  </li>

  <li>
    在 greetings_test.go 中粘贴以下代码并保存文件。

<pre><code>&lt;pre&gt;
</code></pre>
<p>package greetings</p>
<p>import (<br>    &quot;testing&quot;<br>    &quot;regexp&quot;<br>)</p>
<p>// TestHelloName calls greetings.Hello with a name, checking<br>// for a valid return value.<br>func TestHelloName(t *testing.T) {<br>    name := &quot;Gladys&quot;<br>    want := regexp.MustCompile(<code>\b</code>+name+<code>\b</code>)<br>    msg, err := Hello(&quot;Gladys&quot;)<br>    if !want.MatchString(msg) || err != nil {<br>        t.Errorf(<code>Hello(&quot;Gladys&quot;) = %q, %v, want match for %#q, nil</code>, msg, err, want)<br>    }<br>}</p>
<p>// TestHelloEmpty calls greetings.Hello with an empty string,<br>// checking for an error.<br>func TestHelloEmpty(t *testing.T) {<br>    msg, err := Hello(&quot;&quot;)<br>    if msg != &quot;&quot; || err == nil {<br>        t.Errorf(<code>Hello(&quot;&quot;) = %q, %v, want &quot;&quot;, error</code>, msg, err)<br>    }<br>}<br></pre
    ></p>
<pre><code>&lt;p&gt;
  在此代码中，您：
&lt;/p&gt;

&lt;ul&gt;
  &lt;li&gt;
    在与被测代码相同的包中实现测试函数。
  &lt;/li&gt;
  &lt;li&gt;
    创建两个测试函数来测试 &lt;code&gt;greetings.Hello&lt;/code&gt;
    函数。测试函数名称采用 &lt;code&gt;Test&lt;em&gt;名称&lt;/em&gt;&lt;/code&gt; 形式，
    其中 &lt;em&gt;名称&lt;/em&gt; 说明了具体测试内容。此外，测试
    函数接受一个指向 &lt;code&gt;testing&lt;/code&gt; 包的
    &lt;a href=&quot;/pkg/testing/#T&quot;&gt;&lt;code&gt;testing.T&lt;/code&gt;
    类型&lt;/a&gt;的指针作为参数。您可以使用此参数的方法从测试中报告
    和记录信息。
  &lt;/li&gt;
  &lt;li&gt;
    实现两个测试：

    &lt;ul&gt;
      &lt;li&gt;
        &lt;code&gt;TestHelloName&lt;/code&gt; 调用 &lt;code&gt;Hello&lt;/code&gt; 函数，
        传入一个 &lt;code&gt;name&lt;/code&gt; 值，该函数应能
        返回有效的响应消息。如果调用返回错误或意外的响应消息（未包含
        您传入的名称），则使用 &lt;code&gt;t&lt;/code&gt; 参数的
        &lt;a href=&quot;/pkg/testing/#T.Errorf&quot;&gt;
        &lt;code&gt;Errorf&lt;/code&gt; 方法&lt;/a&gt;将消息打印到控制台。
      &lt;/li&gt;
      &lt;li&gt;
        &lt;code&gt;TestHelloEmpty&lt;/code&gt; 使用空字符串调用 &lt;code&gt;Hello&lt;/code&gt; 函数。
        此测试旨在确认您的错误处理是否有效。如果调用返回非空字符串或未返回
        错误，则使用 &lt;code&gt;t&lt;/code&gt; 参数的
        &lt;a href=&quot;/pkg/testing/#T.Errorf&quot;&gt;&lt;code&gt;Errorf
        &lt;/code&gt; 方法&lt;/a&gt;将消息打印到控制台。
      &lt;/li&gt;
    &lt;/ul&gt;
  &lt;/li&gt;
&lt;/ul&gt;
</code></pre>
  </li>

  <li>
    在 greetings 目录的命令行中，运行
    <a href="/cmd/go/#hdr-Test_packages"
      ><code>go test</code> 命令</a
    >
    以执行测试。

<pre><code>&lt;p&gt;
  &lt;code&gt;go test&lt;/code&gt; 命令执行测试文件（文件名以 _test.go 结尾）中的
  测试函数（函数名以 &lt;code&gt;Test&lt;/code&gt; 开头）。您可以添加 &lt;code&gt;-v&lt;/code&gt;
  标志以获取详细输出，列出所有测试及其结果。
&lt;/p&gt;

&lt;p&gt;
  测试应通过。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go test<br>PASS<br>ok      example.com/greetings   0.364s</p>
<p>$ go test -v<br>=== RUN   TestHelloName<br>--- PASS: TestHelloName (0.00s)<br>=== RUN   TestHelloEmpty<br>--- PASS: TestHelloEmpty (0.00s)<br>PASS<br>ok      example.com/greetings   0.372s<br></pre
    ><br>  </li></p>
  <li>
    故意破坏 <code>greetings.Hello</code> 函数以查看测试失败情况。

<pre><code>&lt;p&gt;
  &lt;code&gt;TestHelloName&lt;/code&gt; 测试函数检查您作为 &lt;code&gt;Hello&lt;/code&gt;
  函数参数指定的名称的返回值。要查看测试失败结果，请更改 &lt;code&gt;greetings.Hello&lt;/code&gt;
  函数，使其不再包含该名称。
&lt;/p&gt;

&lt;p&gt;
  在 greetings/greetings.go 中，用以下代码替换 &lt;code&gt;Hello&lt;/code&gt;
  函数。请注意，高亮显示的行更改了函数的返回值，就好像
  &lt;code&gt;name&lt;/code&gt; 参数被意外删除了一样。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>// Hello returns a greeting for the named person.<br>func Hello(name string) (string, error) {<br>    // If no name was given, return an error with a message.<br>    if name == &quot;&quot; {<br>        return name, errors.New(&quot;empty name&quot;)<br>    }<br>    // Create a message using a random format.<br>    <ins>// message := fmt.Sprintf(randomFormat(), name)<br>    message := fmt.Sprint(randomFormat())</ins><br>    return message, nil<br>}<br></pre><br>  </li></p>
  <li>
    在 greetings 目录的命令行中，运行 <code>go test</code> 以
    执行测试。

<pre><code>&lt;p&gt;
  这次，运行 &lt;code&gt;go test&lt;/code&gt; 时不带 &lt;code&gt;-v&lt;/code&gt; 标志。输出将
  仅包含失败测试的结果，这在您有大量测试时非常有用。
  &lt;code&gt;TestHelloName&lt;/code&gt; 测试应失败 -- &lt;code&gt;TestHelloEmpty&lt;/code&gt; 仍会通过。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go test<br>--- FAIL: TestHelloName (0.00s)<br>    greetings_test.go:15: Hello(&quot;Gladys&quot;) = &quot;Hail, %v! Well met!&quot;, &lt;nil&gt;, want match for <code>\bGladys\b</code>, nil<br>FAIL<br>exit status 1<br>FAIL    example.com/greetings   0.182s<br></pre
    ><br>  </li></p>
</ol>

<p>
  在下一节（也是最后一节）中，您将了解如何编译和安装代码以在本地运行。
</p>

<p class="Navigation">
  <a class="Navigation-prev" href="/doc/tutorial/greetings-multiple-people.html"
    >&lt; 返回为多人返回问候</a
  >
  <a class="Navigation-next" href="/doc/tutorial/compile-install.html"
    >编译并安装应用程序 &gt;</a
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