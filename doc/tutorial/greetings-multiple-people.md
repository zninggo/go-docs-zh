<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>greetings-multiple-people - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
    "Title": "为多人返回问候语",
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
    "Title": "为多人返回问候语",
    "Breadcrumb": true
}-->

<p>
  在您对模块代码进行的最后修改中，您将添加支持在一次请求中获取多人的问候语。换句话说，您将处理一个多值输入，然后将该输入中的值与多值输出配对。为此，您需要将一组名字传递给一个可以为每个名字返回问候语的函数。
</p>

<aside class="Note">
  <strong>注意：</strong>本主题是一个多部分教程的一部分，该教程从<a href="/doc/tutorial/create-module.html">创建 Go 模块</a>开始。
</aside>

<p>
  但是这里有一个障碍。将 <code>Hello</code> 函数的参数从单个名字改为一组名字会改变函数的签名。如果您已经发布了 <code>example.com/greetings</code> 模块，并且用户已经编写了调用 <code>Hello</code> 的代码，那么这个更改将会破坏他们的程序。
</p>

<p>
  在这种情况下，更好的选择是编写一个具有不同名称的新函数。新函数将接受多个参数。这样可以保留旧函数以维持向后兼容性。
</p>

<ol>
  <li>
    在 greetings/greetings.go 中，将您的代码修改为如下所示。

<pre><code>&lt;pre&gt;
</code></pre>
<p>package greetings</p>
<p>import (<br>    &quot;errors&quot;<br>    &quot;fmt&quot;<br>    &quot;math/rand&quot;<br>)</p>
<p>// Hello 返回针对指定人员的问候语。<br>func Hello(name string) (string, error) {<br>    // 如果未提供名字，则返回带消息的错误。<br>    if name == &quot;&quot; {<br>        return name, errors.New(&quot;empty name&quot;)<br>    }<br>    // 使用随机格式创建消息。<br>    message := fmt.Sprintf(randomFormat(), name)<br>    return message, nil<br>}</p>
<p><ins>// Hellos 返回一个映射，将每个指定人员与其问候消息关联起来。<br>func Hellos(names []string) (map[string]string, error) {<br>    // 一个用于将名字与消息关联的映射。<br>    messages := make(map[string]string)<br>    // 遍历接收到的名字切片，调用 Hello 函数<br>    // 为每个名字获取消息。<br>    for _, name := range names {<br>        message, err := Hello(name)<br>        if err != nil {<br>            return nil, err<br>        }<br>        // 在映射中，将检索到的消息与名字关联。<br>        messages[name] = message<br>    }<br>    return messages, nil<br>}</ins></p>
<p>// randomFormat 返回一组问候消息中的一个。返回的<br>// 消息是随机选择的。<br>func randomFormat() string {<br>    // 消息格式的切片。<br>    formats := []string{<br>        &quot;Hi, %v. Welcome!&quot;,<br>        &quot;Great to see you, %v!&quot;,<br>        &quot;Hail, %v! Well met!&quot;,<br>    }</p>
<pre><code>// 返回随机选择的一个消息格式。
return formats[rand.Intn(len(formats))]
</code></pre>
<p>}<br></pre></p>
<pre><code>&lt;p&gt;
  在这段代码中，您：
&lt;/p&gt;

&lt;ul&gt;
  &lt;li&gt;
    添加了一个 &lt;code&gt;Hellos&lt;/code&gt; 函数，其参数是名字的切片（slice）而不是单个名字。同时，您将其返回类型之一从 &lt;code&gt;string&lt;/code&gt; 改为 &lt;code&gt;map&lt;/code&gt;（映射），以便可以返回名字到问候消息的映射。
  &lt;/li&gt;
  &lt;li&gt;
    让新的 &lt;code&gt;Hellos&lt;/code&gt; 函数调用现有的 &lt;code&gt;Hello&lt;/code&gt; 函数。这有助于减少重复代码，同时保留两个函数。
  &lt;/li&gt;
  &lt;li&gt;
    创建一个 &lt;code&gt;messages&lt;/code&gt; 映射，将接收到的每个名字（作为键）与生成的消息（作为值）关联起来。在 Go 中，您可以使用以下语法初始化映射：&lt;code&gt;make(map[&lt;em&gt;key-type&lt;/em&gt;]&lt;em&gt;value-type&lt;/em&gt;)&lt;/code&gt;。您让 &lt;code&gt;Hellos&lt;/code&gt; 函数将此映射返回给调用者。有关映射的更多信息，请参阅 Go 博客上的&lt;a href=&quot;/blog/maps&quot;&gt;Go maps in action&lt;/a&gt;。
  &lt;/li&gt;
  &lt;li&gt;
    遍历您的函数接收到的名字，检查每个名字是否为非空值，然后将每个名字与一个消息关联起来。在这个 &lt;code&gt;for&lt;/code&gt; 循环中，&lt;code&gt;range&lt;/code&gt; 返回两个值：当前项在循环中的索引和该项值的副本。您不需要索引，因此使用 Go 空白标识符（下划线）来忽略它。有关更多信息，请参阅 Effective Go 中的&lt;a href=&quot;/doc/effective_go.html#blank&quot;&gt;The blank identifier&lt;/a&gt;。
  &lt;/li&gt;
&lt;/ul&gt;
</code></pre>
  </li>

  <li>
    在您的 hello/hello.go 调用代码中，传递一个名字切片，然后打印您得到的名字/消息映射的内容。

<pre><code>&lt;p&gt;
  在 hello.go 中，将您的代码修改为如下所示。
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>package main</p>
<p>import (<br>    &quot;fmt&quot;<br>    &quot;log&quot;</p>
<pre><code>&quot;example.com/greetings&quot;
</code></pre>
<p>)</p>
<p>func main() {<br>    // 设置预定义 Logger 的属性，包括日志条目前缀<br>    // 和一个用于禁用打印时间、源文件和行号的标志。<br>    log.SetPrefix(&quot;greetings: &quot;)<br>    log.SetFlags(0)</p>
<pre><code>&lt;ins&gt;// 名字切片。
names := []string{&quot;Gladys&quot;, &quot;Samantha&quot;, &quot;Darrin&quot;}

// 请求这些名字的问候消息。
messages, err := greetings.Hellos(names)&lt;/ins&gt;
if err != nil {
    log.Fatal(err)
}
&lt;ins&gt;// 如果没有返回错误，则将返回的消息映射打印到控制台。
fmt.Println(messages)&lt;/ins&gt;
</code></pre>
<p>}<br></pre></p>
<pre><code>&lt;p&gt;
  通过这些更改，您：
&lt;/p&gt;

&lt;ul&gt;
  &lt;li&gt;
    创建了一个 &lt;code&gt;names&lt;/code&gt; 变量，作为包含三个名字的切片类型。
  &lt;/li&gt;
  &lt;li&gt;
    将 &lt;code&gt;names&lt;/code&gt; 变量作为参数传递给 &lt;code&gt;Hellos&lt;/code&gt; 函数。
  &lt;/li&gt;
&lt;/ul&gt;
</code></pre>
  </li>

  <li>
    在命令行中，切换到包含 hello/hello.go 的目录，然后使用 <code>go run</code> 确认代码是否正常工作。

<pre><code>&lt;p&gt;
  输出应该是一个字符串形式的映射，显示名字到消息的关联，类似于以下内容：
&lt;/p&gt;

&lt;pre&gt;
</code></pre>
<p>$ go run .<br>map[Darrin:Hail, Darrin! Well met! Gladys:Hi, Gladys. Welcome! Samantha:Hail, Samantha! Well met!]<br></pre><br>  </li></p>
</ol>

<p>
  本主题介绍了用于表示键/值对的映射（map）。它还介绍了通过为模块中的新功能或更改的功能实现新函数来保持向后兼容性的理念。有关向后兼容性的更多信息，请参阅<a href="/blog/module-compatibility">Keeping your modules compatible</a>。
</p>

<p>接下来，您将使用 Go 的内置功能为您的代码创建单元测试。</p>

<p class="Navigation">
  <a class="Navigation-prev" href="/doc/tutorial/random-greeting.html"
    >&lt; 返回随机问候语</a
  >
  <a class="Navigation-next" href="/doc/tutorial/add-a-test.html">添加测试 &gt;</a>
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