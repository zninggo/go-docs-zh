<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>fuzz - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
  "Template": true,
  "Title": "教程：模糊测试入门",
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
  "Template": true,
  "Title": "教程：模糊测试入门",
  "HideTOC": true,
  "Breadcrumb": true
}-->

<p>本教程介绍Go语言模糊测试的基础知识。模糊测试通过随机数据运行您的测试，以寻找漏洞或导致程序崩溃的输入。通过模糊测试可以发现的漏洞包括SQL注入、缓冲区溢出、拒绝服务攻击和跨站脚本攻击等。</p>
<p>在本教程中，您将为一个简单函数编写模糊测试，运行Go命令，并调试和修复代码中的问题。</p>
<p>如需了解本教程中使用的术语，请参阅<a href="/security/fuzz/#glossary">Go模糊测试词汇表</a>。</p>
<p>您将按以下章节逐步学习：</p>
<ol>
<li><a href="#create_folder">创建代码文件夹</a></li>
<li><a href="#code_to_test">添加待测试代码</a></li>
<li><a href="#unit_test">添加单元测试</a></li>
<li><a href="#fuzz_test">添加模糊测试</a></li>
<li><a href="#fix_invalid_string_error">修复两个错误</a></li>
<li><a href="#conclusion">探索更多资源</a></li>
</ol>
<p><strong>注意：</strong> 其他教程请参阅<a href="/doc/tutorial/index.html">教程合集</a>。</p>
<p><strong>注意：</strong> Go模糊测试目前支持部分内置类型，完整列表见<a href="/security/fuzz/#requirements">Go模糊测试文档</a>，未来将添加更多内置类型的支持。</p>
<h2>前提条件</h2>
<ul>
<li><strong>安装Go 1.18或更高版本。</strong> 安装说明请参阅<a href="/doc/install">安装Go</a>。</li>
<li><strong>代码编辑工具。</strong> 任何文本编辑器均可使用。</li>
<li><strong>命令行终端。</strong> Go在Linux和Mac的任意终端均可良好运行，在Windows系统中可使用PowerShell或cmd。</li>
<li><strong>支持模糊测试的环境。</strong> 目前带覆盖率检测的Go模糊测试仅支持AMD64和ARM64架构。</li>
</ul>
<h2>创建代码文件夹 {#create_folder}</h2>
<p>首先，为即将编写的代码创建一个文件夹。</p>
<ol>
<li><p>打开命令行终端并切换到用户主目录。</p>
<p>在Linux或Mac系统上：   ```<br>$ cd</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在 Windows 上:   ```<br>   C:&gt; cd %HOMEPATH%</p>
<pre><code>以下教程中会使用 $ 作为命令行提示符。这里使用的命令在 Windows 系统上同样适用。

2. 在命令行提示符下，为你的代码创建一个名为 fuzz 的目录。   ```
$ mkdir fuzz
$ cd fuzz
</code></pre>
<ol start="3">
<li><p>创建一个模块来存放你的代码。</p>
<p>运行 <code>go mod init</code> 命令，并指定新代码的模块路径（module path）。   ```<br>$ go mod init example/fuzz<br>go: creating new go.mod: module example/fuzz</p>
<pre><code>
</code></pre>
</li>
</ol>
<p><strong>注意：</strong> 对于生产环境代码，您应该根据实际需求指定更具体的模块路径。更多详情请参阅<a href="/doc/modules/managing-dependencies">管理依赖关系</a>。</p>
<p>接下来，我们将添加一段简单的字符串反转代码，以便之后对其进行模糊测试。</p>
<h2>添加待测试代码 {#code_to_test}</h2>
<p>在本步骤中，您将添加一个字符串反转函数。</p>
<h3>编写代码</h3>
<ol>
<li>使用文本编辑器，在 <code>fuzz</code> 目录下创建名为 <code>main.go</code> 的文件。</li>
<li>在 <code>main.go</code> 文件顶部粘贴以下包声明：    ```<br>package main<pre><code>
</code></pre>
</li>
</ol>
<p>一个独立程序（相对于库而言）始终位于 <code>main</code> 包中。</p>
<ol start="3">
<li>在包声明（package declaration）下方，粘贴以下函数声明（function declaration）。    ```<br> func Reverse(s string) string {<br> b := []byte(s)<br> for i, j := 0, len(b)-1; i {{raw &quot;&lt;&quot;}} len(b)/2; i, j = i+1, j-1 {<br>     b[i], b[j] = b[j], b[i]<br> }<br> return string(b)<br> }<pre><code>
</code></pre>
</li>
</ol>
<p>这个函数接受一个 <code>string</code> 类型参数，逐个字节遍历该字符串，最后返回反转后的字符串。</p>
<p><em>注意：</em> 此代码基于 golang.org/x/example 中的 <code>stringutil.Reverse</code> 函数实现。</p>
<ol start="4">
<li>在 main.go 文件顶部的包声明下方，粘贴以下 <code>main</code> 函数代码。该函数会初始化一个字符串，对其执行反转操作，打印输出结果，并重复执行此过程。</li>
</ol>
<pre><code class="language-go">func main() {
    fmt.Println(stringutil.Reverse(&quot;!selpmaxe oG ,olleH&quot;))
}
```    ```
    func main() {
        input := &quot;The quick brown fox jumped over the lazy dog&quot;
        rev := Reverse(input)
        doubleRev := Reverse(rev)
        fmt.Printf(&quot;original: %q\n&quot;, input)
        fmt.Printf(&quot;reversed: %q\n&quot;, rev)
        fmt.Printf(&quot;reversed again: %q\n&quot;, doubleRev)
    }
    ```
这个函数将执行几次`Reverse`操作，然后将结果输出到命令行。这有助于观察代码的实际运行效果，也可能用于调试目的。

5.  `main`函数使用了fmt包，因此你需要导入它。

    代码开头部分应如下所示：    ```
    package main

    import &quot;fmt&quot;
    ```
### 运行代码

在命令行中，进入包含main.go文件的目录，运行该代码。```
$ go run .
original: &quot;The quick brown fox jumped over the lazy dog&quot;
reversed: &quot;god yzal eht revo depmuj xof nworb kciuq ehT&quot;
reversed again: &quot;The quick brown fox jumped over the lazy dog&quot;
</code></pre>
<p>您可以看到原始字符串、反转后的结果，以及再次反转后的结果，这实际上等同于原始字符串。</p>
<p>现在代码已运行，是时候进行测试了。</p>
<h2>添加单元测试 {#unit_test}</h2>
<p>在本步骤中，您将为 <code>Reverse</code> 函数编写一个基础的单元测试（unit test）。</p>
<h3>编写代码</h3>
<ol>
<li><p>使用您的文本编辑器，在 fuzz 目录下创建一个名为 reverse_test.go 的文件。</p>
</li>
<li><p>将以下代码粘贴到 reverse_test.go 文件中。   ```<br>package main</p>
<p>import (<br>&quot;testing&quot;<br>)</p>
<p>func TestReverse(t *testing.T) {<br>testcases := []struct {<br>    in, want string<br>}{<br>    {&quot;Hello, world&quot;, &quot;dlrow ,olleH&quot;},<br>    {&quot; &quot;, &quot; &quot;},<br>    {&quot;!12345&quot;, &quot;54321!&quot;},<br>}<br>for _, tc := range testcases {<br>    rev := Reverse(tc.in)<br>    if rev != tc.want {<br>            t.Errorf(&quot;Reverse: %q, want %q&quot;, rev, tc.want)<br>    }<br>}<br>}</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>这个简单的测试将断言列出的输入字符串能被正确反转。</p>
<h3>运行代码</h3>
<p>使用 <code>go test</code> 命令运行单元测试```<br>$ go test<br>PASS<br>ok      example/fuzz  0.013s</p>
<pre><code>接下来，你将把单元测试转换为模糊测试。

## 添加模糊测试 {#fuzz_test}

单元测试存在局限性，即每个测试输入都必须由开发者手动添加到测试中。而模糊测试的优势在于它能为你的代码生成输入，并可能发现那些你原先设计的测试用例未能覆盖到的边界情况。

在本节中，你将把单元测试转换为模糊测试，从而能以更少的工作量生成更多测试输入！

请注意，你可以在同一个 `*_test.go` 文件中同时保留单元测试、基准测试和模糊测试，但在本示例中，我们将把单元测试转换为模糊测试。

### 编写代码

在你的文本编辑器中，将 `reverse_test.go` 中的单元测试替换为以下模糊测试：```
func FuzzReverse(f *testing.F) {
    testcases := []string{&quot;Hello, world&quot;, &quot; &quot;, &quot;!12345&quot;}
    for _, tc := range testcases {
        f.Add(tc)  // Use f.Add to provide a seed corpus
    }
    f.Fuzz(func(t *testing.T, orig string) {
        rev := Reverse(orig)
        doubleRev := Reverse(rev)
        if orig != doubleRev {
            t.Errorf(&quot;Before: %q, after: %q&quot;, orig, doubleRev)
        }
        if utf8.ValidString(orig) &amp;&amp; !utf8.ValidString(rev) {
            t.Errorf(&quot;Reverse produced invalid UTF-8 string %q&quot;, rev)
        }
    })
}
</code></pre>
<p>模糊测试也存在一些局限性。在单元测试中，你可以预测 <code>Reverse</code> 函数的预期输出，并验证实际输出是否符合预期。</p>
<p>例如，在测试用例 <code>Reverse(&quot;Hello, world&quot;)</code> 中，单元测试明确指定期望的返回值为 <code>&quot;dlrow ,olleH&quot;</code>。</p>
<p>而在模糊测试中，由于无法控制输入值，你无法预测预期输出。</p>
<p>不过，针对 <code>Reverse</code> 函数，你可以在模糊测试中验证一些固有属性。本次模糊测试将检查以下两个属性：</p>
<ol>
<li>对字符串进行两次反转操作应能还原原始值</li>
<li>反转后的字符串仍保持有效的 UTF-8 编码状态</li>
</ol>
<p>请注意单元测试与模糊测试的语法差异：</p>
<ul>
<li>函数名以 <code>FuzzXxx</code> 而非 <code>TestXxx</code> 开头，且参数类型为 <code>*testing.F</code> 而非 <code>*testing.T</code></li>
<li>原使用 <code>t.Run</code> 执行测试的位置，现在需使用 <code>f.Fuzz</code> 方法。该方法接受一个模糊目标函数作为参数，该目标函数的参数为 <code>*testing.T</code> 以及需要进行模糊测试的数据类型。原单元测试的输入数据通过 <code>f.Add</code> 转换为种子语料库输入。</li>
</ul>
<p>请确保已导入新的包 <code>unicode/utf8</code>。```<br>package main</p>
<p>import (<br>    &quot;testing&quot;<br>    &quot;unicode/utf8&quot;<br>)</p>
<pre><code>将单元测试转换为模糊测试后，现在需要再次运行测试。

### 运行代码

1. 先不执行模糊化操作运行模糊测试，确保种子输入（seed inputs）能够通过测试。   ```
   $ go test
   PASS
   ok      example/fuzz  0.013s
</code></pre>
<p>你也可以运行 <code>go test -run=FuzzReverse</code>（如果该文件中有其他测试，而你只想运行模糊测试）。</p>
<ol start="2">
<li>运行带模糊测试的 <code>FuzzReverse</code>，以查看是否有任何随机生成的字符串输入会导致失败。这需要通过 <code>go test</code> 命令配合新参数 <code>-fuzz</code>（设置为 <code>Fuzz</code>）来执行。请复制以下命令：    ```<br> $ go test -fuzz=Fuzz<pre><code>
</code></pre>
</li>
</ol>
<p>另一个实用的标志是 <code>-fuzztime</code>，用于限制模糊测试的持续时间。例如，在下面的测试中指定 <code>-fuzztime 10s</code> 意味着只要没有更早出现失败，默认情况下测试将在 10 秒后自动退出。其他测试标志请参阅 cmd/go 文档的<a href="https://pkg.go.dev/cmd/go#hdr-Testing_flags">这一章节</a>。</p>
<p>现在，请运行刚刚复制的命令。   ```<br>   $ go test -fuzz=Fuzz<br>   fuzz: elapsed: 0s, gathering baseline coverage: 0/3 completed<br>   fuzz: elapsed: 0s, gathering baseline coverage: 3/3 completed, now fuzzing with 8 workers<br>   fuzz: minimizing 38-byte failing input file...<br>   --- FAIL: FuzzReverse (0.01s)<br>       --- FAIL: FuzzReverse (0.00s)<br>           reverse_test.go:20: Reverse produced invalid UTF-8 string &quot;\x9c\xdd&quot;</p>
<pre><code>   Failing input written to testdata/fuzz/FuzzReverse/af69258a12129d6cbba438df5d5f25ba0ec050461c116f777e77ea7c9a0d217a
   To re-run:
   go test -run=FuzzReverse/af69258a12129d6cbba438df5d5f25ba0ec050461c116f777e77ea7c9a0d217a
</code></pre>
<p>   FAIL<br>   exit status 1<br>   FAIL    example/fuzz  0.030s</p>
<pre><code>在进行模糊测试（fuzzing）时发生错误，导致该问题的输入数据会被写入种子语料库文件。即使不使用 `-fuzz` 标志，下次执行 `go test` 命令时也会自动运行该文件。若要查看导致失败的输入内容，请用文本编辑器打开写入 testdata/fuzz/FuzzReverse 目录的语料库文件。您的种子语料库文件可能包含不同的字符串，但文件格式是相同的。   ```
go test fuzz v1
string(&quot;泃&quot;)
</code></pre>
<p>语料库文件的第一行指明编码版本。其后每一行代表构成语料库条目的各类型值。由于模糊测试目标仅接受单个输入，版本信息后仅存在一个值。</p>
<ol start="3">
<li>再次运行 <code>go test</code> 命令但不添加 <code>-fuzz</code> 标志；此时将使用新的失败种子语料库条目：   ```<br>$ go test<br>--- FAIL: FuzzReverse (0.00s)<br>--- FAIL: FuzzReverse/af69258a12129d6cbba438df5d5f25ba0ec050461c116f777e77ea7c9a0d217a (0.00s)<br>    reverse_test.go:20: Reverse produced invalid string<br>FAIL<br>exit status 1<br>FAIL    example/fuzz  0.016s<pre><code>
</code></pre>
</li>
</ol>
<p>既然测试已经失败，是时候进行调试了。</p>
<h2>修复无效字符串错误 {#fix_invalid_string_error}</h2>
<p>在本节中，你将调试失败的原因，并修复这个缺陷。</p>
<p>在继续之前，你可以花些时间思考并尝试自己修复这个问题。</p>
<h3>诊断错误</h3>
<p>有几种不同的方法可以调试这个错误。如果你使用 VS Code 作为文本编辑器，可以<a href="https://github.com/golang/vscode-go/blob/master/docs/debugging.md">设置调试器</a>进行排查。</p>
<p>在本教程中，我们将在终端记录有用的调试信息。</p>
<p>首先，查看 <a href="https://pkg.go.dev/unicode/utf8"><code>utf8.ValidString</code></a> 的文档。```<br>ValidString reports whether s consists entirely of valid UTF-8-encoded runes.</p>
<pre><code>当前的`Reverse`函数是逐字节（byte）反转字符串的，这正是问题的根源。为了保留原始字符串中经UTF-8编码的字符（rune），我们必须改为逐字符（rune）反转字符串。

要验证为何输入（例如中文字符`泃`）会导致`Reverse`函数反转后产生无效字符串，可以检查反转后字符串包含的字符（rune）数量。

#### 编写代码

在文本编辑器中，将`FuzzReverse`中的模糊测试目标（fuzz target）替换为以下内容：```
f.Fuzz(func(t *testing.T, orig string) {
    rev := Reverse(orig)
    doubleRev := Reverse(rev)
    t.Logf(&quot;Number of runes: orig=%d, rev=%d, doubleRev=%d&quot;, utf8.RuneCountInString(orig), utf8.RuneCountInString(rev), utf8.RuneCountInString(doubleRev))
    if orig != doubleRev {
        t.Errorf(&quot;Before: %q, after: %q&quot;, orig, doubleRev)
    }
    if utf8.ValidString(orig) &amp;&amp; !utf8.ValidString(rev) {
        t.Errorf(&quot;Reverse produced invalid UTF-8 string %q&quot;, rev)
    }
})
</code></pre>
<p>如果发生错误，或者使用 <code>-v</code> 参数执行测试时，这行 <code>t.Logf</code> 语句会将信息打印到命令行，这有助于调试特定问题。</p>
<h4>运行代码</h4>
<p>使用 <code>go test</code> 命令运行测试```<br>$ go test<br>--- FAIL: FuzzReverse (0.00s)<br>    --- FAIL: FuzzReverse/28f36ef487f23e6c7a81ebdaa9feffe2f2b02b4cddaa6252e87f69863046a5e0 (0.00s)<br>        reverse_test.go:16: Number of runes: orig=1, rev=3, doubleRev=1<br>        reverse_test.go:21: Reverse produced invalid UTF-8 string &quot;\x83\xb3\xe6&quot;<br>FAIL<br>exit status 1<br>FAIL    example/fuzz    0.598s</p>
<pre><code>整个种子语料库使用的字符串中，每个字符都是单字节。然而，诸如“泃”这样的字符可能需要多个字节。因此，如果逐字节反转字符串，将会破坏多字节字符的有效性。

**注意：** 若您想深入了解Go语言如何处理字符串，请阅读博文[Go语言中的字符串、字节、符文与字符](/blog/strings)以获得更深刻的理解。

在更好地理解该问题后，请修正`Reverse`函数中的错误。

### 修复错误

为修正`Reverse`函数，我们将采用按符文（rune）而非按字节（byte）遍历字符串的方式。

#### 编写代码

在您的文本编辑器中，将现有的`Reverse()`函数替换为以下代码：```
func Reverse(s string) string {
    r := []rune(s)
    for i, j := 0, len(r)-1; i {{raw &quot;&lt;&quot;}} len(r)/2; i, j = i+1, j-1 {
        r[i], r[j] = r[j], r[i]
    }
    return string(r)
}
</code></pre>
<p>关键区别在于<code>Reverse</code>现在遍历的是字符串中的每个<code>rune</code>（Unicode字符），而非每个<code>byte</code>（字节）。请注意这仅是示例，并未正确处理<a href="https://en.wikipedia.org/wiki/Combining_character">组合字符</a>。</p>
<h4>运行代码</h4>
<ol>
<li>使用<code>go test</code>运行测试   ```<br>$ go test<br>PASS<br>ok      example/fuzz  0.016s<pre><code>
</code></pre>
</li>
</ol>
<p>测试现在通过了！</p>
<ol start="2">
<li>使用 <code>go test -fuzz</code> 命令再次进行模糊测试，以检查是否还有新的错误。   ```<br>$ go test -fuzz=Fuzz<br>fuzz: elapsed: 0s, gathering baseline coverage: 0/37 completed<br>fuzz: minimizing 506-byte failing input file...<br>fuzz: elapsed: 0s, gathering baseline coverage: 5/37 completed<br>--- FAIL: FuzzReverse (0.02s)<br>--- FAIL: FuzzReverse (0.00s)<br>    reverse_test.go:33: Before: &quot;\x91&quot;, after: &quot;�&quot;<br><br>Failing input written to testdata/fuzz/FuzzReverse/1ffc28f7538e29d79fce69fef20ce5ea72648529a9ca10bea392bcff28cd015c<br>To re-run:<br>go test -run=FuzzReverse/1ffc28f7538e29d79fce69fef20ce5ea72648529a9ca10bea392bcff28cd015c<br>FAIL<br>exit status 1<br>FAIL    example/fuzz  0.032s<pre><code>
</code></pre>
</li>
</ol>
<p>可以观察到，字符串在经历两次反转后变得与原字符串不同。这次的输入本身包含非法的Unicode字符。如果我们使用的是字符串进行模糊测试，这种情况是如何发生的呢？</p>
<p>让我们再次进行调试。</p>
<h2>修复双重反转错误 {#fix_double_reverse_error}</h2>
<p>在本节中，您将调试双重反转失败的问题并修复该错误。</p>
<p>在继续之前，请先花些时间自行思考并尝试修复此问题。</p>
<h3>诊断错误</h3>
<p>与之前类似，调试此失败有多种方法。在这种情况下，使用<a href="https://github.com/golang/vscode-go/blob/master/docs/debugging.md">调试器</a>会是一个很好的方法。</p>
<p>在本教程中，我们将在<code>Reverse</code>函数中记录有用的调试信息。</p>
<p>仔细观察反转后的字符串以发现错误。在Go语言中，<a href="/blog/strings">字符串是只读的字节切片</a>，并且可以包含无效的UTF-8字节。原始字符串是一个单字节的字节切片，字节为<code>&#39;\x91&#39;</code>。当输入字符串被设置为<code>[]rune</code>时，Go会将字节切片编码为UTF-8，并用UTF-8字符�替换该字节。当我们比较替换后的UTF-8字符与输入的字节切片时，它们显然不相等。</p>
<h4>编写代码</h4>
<ol>
<li>在您的文本编辑器中，将<code>Reverse</code>函数替换为以下内容：   ```<br>func Reverse(s string) string {<br>fmt.Printf(&quot;input: %q\n&quot;, s)<br>r := []rune(s)<br>fmt.Printf(&quot;runes: %q\n&quot;, r)<br>for i, j := 0, len(r)-1; i {{raw &quot;&lt;&quot;}} len(r)/2; i, j = i+1, j-1 {<br>    r[i], r[j] = r[j], r[i]<br>}<br>return string(r)<br>}<pre><code>
</code></pre>
</li>
</ol>
<p>这有助于我们理解将字符串转换为 rune 切片（slice of runes）时出现的问题。</p>
<h4>运行代码</h4>
<p>这次，我们只想运行失败的测试以便检查日志。为此，我们将使用 <code>go test -run</code> 命令。</p>
<p>要运行 FuzzXxx/testdata 中的特定语料库条目，你可以向 <code>-run</code> 提供 {FuzzTestName}/{filename}。这在调试时很有帮助。<br>在本例中，请将 <code>-run</code> 标志设置为失败测试的确切哈希值。<br>从你的终端复制粘贴该唯一哈希值；<br>它会与下面这个不同。```<br>$ go test -run=FuzzReverse/28f36ef487f23e6c7a81ebdaa9feffe2f2b02b4cddaa6252e87f69863046a5e0<br>input: &quot;\x91&quot;<br>runes: [&#39;�&#39;]<br>input: &quot;�&quot;<br>runes: [&#39;�&#39;]<br>--- FAIL: FuzzReverse (0.00s)<br>    --- FAIL: FuzzReverse/28f36ef487f23e6c7a81ebdaa9feffe2f2b02b4cddaa6252e87f69863046a5e0 (0.00s)<br>        reverse_test.go:16: Number of runes: orig=1, rev=1, doubleRev=1<br>        reverse_test.go:18: Before: &quot;\x91&quot;, after: &quot;�&quot;<br>FAIL<br>exit status 1<br>FAIL    example/fuzz    0.145s</p>
<pre><code>已知输入为无效的 Unicode，让我们来修复 `Reverse` 函数中的错误。

### 修复错误

为解决此问题，如果传入 `Reverse` 的输入不是有效的 UTF-8，我们需要返回一个错误。

#### 编写代码

1. 在您的文本编辑器中，用以下代码替换现有的 `Reverse` 函数。   ```
   func Reverse(s string) (string, error) {
       if !utf8.ValidString(s) {
           return s, errors.New(&quot;input is not valid UTF-8&quot;)
       }
       r := []rune(s)
       for i, j := 0, len(r)-1; i {{raw &quot;&lt;&quot;}} len(r)/2; i, j = i+1, j-1 {
           r[i], r[j] = r[j], r[i]
       }
       return string(r), nil
   }
</code></pre>
<p>此更改将对输入字符串中包含无效 UTF-8 字符的情况返回错误。</p>
<ol>
<li>由于 Reverse 函数现在会返回错误，需要修改 <code>main</code> 函数以丢弃多余的错误值。将现有的 <code>main</code> 函数替换为以下内容：   ```<br>func main() {<br>input := &quot;The quick brown fox jumped over the lazy dog&quot;<br>rev, revErr := Reverse(input)<br>doubleRev, doubleRevErr := Reverse(rev)<br>fmt.Printf(&quot;original: %q\n&quot;, input)<br>fmt.Printf(&quot;reversed: %q, err: %v\n&quot;, rev, revErr)<br>fmt.Printf(&quot;reversed again: %q, err: %v\n&quot;, doubleRev, doubleRevErr)<br>}<pre><code>
</code></pre>
</li>
</ol>
<p>对 <code>Reverse</code> 函数的这些调用应返回 nil 错误（nil error），因为输入字符串是有效的 UTF-8 格式。</p>
<ol>
<li>您需要导入 errors 和 unicode/utf8 这两个包。<br>main.go 文件中的导入语句应如下所示：   ```<br>import (<br>&quot;errors&quot;<br>&quot;fmt&quot;<br>&quot;unicode/utf8&quot;<br>)<pre><code>
</code></pre>
</li>
<li>修改 reverse_test.go 文件以检查错误，如果通过返回操作产生了错误则跳过测试。   ```<br>func FuzzReverse(f *testing.F) {<br>testcases := []string {&quot;Hello, world&quot;, &quot; &quot;, &quot;!12345&quot;}<br>for _, tc := range testcases {<br>    f.Add(tc)  // Use f.Add to provide a seed corpus<br>}<br>f.Fuzz(func(t *testing.T, orig string) {<br>    rev, err1 := Reverse(orig)<br>    if err1 != nil {<br>        return<br>    }<br>    doubleRev, err2 := Reverse(rev)<br>    if err2 != nil {<br>         return<br>    }<br>    if orig != doubleRev {<br>        t.Errorf(&quot;Before: %q, after: %q&quot;, orig, doubleRev)<br>    }<br>    if utf8.ValidString(orig) &amp;&amp; !utf8.ValidString(rev) {<br>        t.Errorf(&quot;Reverse produced invalid UTF-8 string %q&quot;, rev)<br>    }<br>})<br>}<pre><code>
</code></pre>
</li>
</ol>
<p>无需返回，你也可以调用 <code>t.Skip()</code> 来停止执行该模糊测试输入。</p>
<h4>运行代码</h4>
<ol>
<li>使用 <code>go test</code> 运行测试   ```<br>$ go test<br>PASS<br>ok      example/fuzz  0.019s<pre><code>
</code></pre>
</li>
<li>使用 <code>go test -fuzz=Fuzz</code> 命令进行模糊测试，几秒钟后可通过 <code>ctrl-C</code> 停止测试。除非传递 <code>-fuzztime</code> 标志，否则模糊测试将运行至遇到失败输入为止。默认行为是在无故障时持续运行，并可通过 <code>ctrl-C</code> 中断进程。   ```<br>   $ go test -fuzz=Fuzz<br>   fuzz: elapsed: 0s, gathering baseline coverage: 0/38 completed<br>   fuzz: elapsed: 0s, gathering baseline coverage: 38/38 completed, now fuzzing with 4 workers<br>   fuzz: elapsed: 3s, execs: 86342 (28778/sec), new interesting: 2 (total: 35)<br>   fuzz: elapsed: 6s, execs: 193490 (35714/sec), new interesting: 4 (total: 37)<br>   fuzz: elapsed: 9s, execs: 304390 (36961/sec), new interesting: 4 (total: 37)<br>   ...<br>   fuzz: elapsed: 3m45s, execs: 7246222 (32357/sec), new interesting: 8 (total: 41)<br>   ^Cfuzz: elapsed: 3m48s, execs: 7335316 (31648/sec), new interesting: 8 (total: 41)<br>   PASS<br>   ok      example/fuzz  228.000s</li>
</ol>
<pre><code>3. 使用 `go test -fuzz=Fuzz -fuzztime 30s` 进行模糊测试，若未发现错误则默认持续运行 30 秒后自动退出。   ```
$ go test -fuzz=Fuzz -fuzztime 30s
fuzz: elapsed: 0s, gathering baseline coverage: 0/5 completed
fuzz: elapsed: 0s, gathering baseline coverage: 5/5 completed, now fuzzing with 4 workers
fuzz: elapsed: 3s, execs: 80290 (26763/sec), new interesting: 12 (total: 12)
fuzz: elapsed: 6s, execs: 210803 (43501/sec), new interesting: 14 (total: 14)
fuzz: elapsed: 9s, execs: 292882 (27360/sec), new interesting: 14 (total: 14)
fuzz: elapsed: 12s, execs: 371872 (26329/sec), new interesting: 14 (total: 14)
fuzz: elapsed: 15s, execs: 517169 (48433/sec), new interesting: 15 (total: 15)
fuzz: elapsed: 18s, execs: 663276 (48699/sec), new interesting: 15 (total: 15)
fuzz: elapsed: 21s, execs: 771698 (36143/sec), new interesting: 15 (total: 15)
fuzz: elapsed: 24s, execs: 924768 (50990/sec), new interesting: 16 (total: 16)
fuzz: elapsed: 27s, execs: 1082025 (52427/sec), new interesting: 17 (total: 17)
fuzz: elapsed: 30s, execs: 1172817 (30281/sec), new interesting: 17 (total: 17)
fuzz: elapsed: 31s, execs: 1172817 (0/sec), new interesting: 17 (total: 17)
PASS
ok      example/fuzz  31.025s
</code></pre>
<p>模糊测试通过！</p>
<p>除了 <code>-fuzz</code> 标志外，<code>go test</code> 还新增了多个标志选项，相关说明可查阅<a href="/security/fuzz/#custom-settings">文档</a>。</p>
<p>关于模糊测试输出中的术语解释，请参阅 <a href="/security/fuzz/#command-line-output">Go 模糊测试</a>文档。例如，“新有趣输入”指的是能扩大现有模糊测试语料库代码覆盖率的测试用例。在模糊测试开始时，“新有趣输入”的数量会快速增长，随着新代码路径的发现会出现多次突增，随后会随时间逐渐减少。</p>
<h2>结论 {#conclusion}</h2>
<p>完成得很好！您已成功体验了 Go 语言的模糊测试功能。</p>
<p>接下来请选择您代码中的某个函数进行模糊测试尝试！如果模糊测试发现了代码缺陷，欢迎将其添加到<a href="/wiki/Fuzzing-trophy-case">战果展示页面</a>。</p>
<p>如遇任何问题或有功能建议，欢迎<a href="/issue/new/?&labels=fuzz">提交问题报告</a>。</p>
<p>关于此功能的讨论与反馈，您也可以参与 Gophers Slack 的 <a href="https://gophers.slack.com/archives/CH5KV1AKE">#fuzzing 频道</a>。</p>
<p>更多资料请查阅 <a href="/security/fuzz/#requirements">go.dev/security/fuzz</a> 文档。</p>
<h2>完整代码</h2>
<p>--- main.go ---```<br>package main</p>
<p>import (<br>    &quot;errors&quot;<br>    &quot;fmt&quot;<br>    &quot;unicode/utf8&quot;<br>)</p>
<p>func main() {<br>    input := &quot;The quick brown fox jumped over the lazy dog&quot;<br>    rev, revErr := Reverse(input)<br>    doubleRev, doubleRevErr := Reverse(rev)<br>    fmt.Printf(&quot;original: %q\n&quot;, input)<br>    fmt.Printf(&quot;reversed: %q, err: %v\n&quot;, rev, revErr)<br>    fmt.Printf(&quot;reversed again: %q, err: %v\n&quot;, doubleRev, doubleRevErr)<br>}</p>
<p>func Reverse(s string) (string, error) {<br>    if !utf8.ValidString(s) {<br>        return s, errors.New(&quot;input is not valid UTF-8&quot;)<br>    }<br>    r := []rune(s)<br>    for i, j := 0, len(r)-1; i {{raw &quot;&lt;&quot;}} len(r)/2; i, j = i+1, j-1 {<br>        r[i], r[j] = r[j], r[i]<br>    }<br>    return string(r), nil<br>}</p>
<pre><code>--- reverse_test.go ---```
package main

import (
    &quot;testing&quot;
    &quot;unicode/utf8&quot;
)

func FuzzReverse(f *testing.F) {
    testcases := []string{&quot;Hello, world&quot;, &quot; &quot;, &quot;!12345&quot;}
    for _, tc := range testcases {
        f.Add(tc) // Use f.Add to provide a seed corpus
    }
    f.Fuzz(func(t *testing.T, orig string) {
        rev, err1 := Reverse(orig)
        if err1 != nil {
            return
        }
        doubleRev, err2 := Reverse(rev)
        if err2 != nil {
            return
        }
        if orig != doubleRev {
            t.Errorf(&quot;Before: %q, after: %q&quot;, orig, doubleRev)
        }
        if utf8.ValidString(orig) &amp;&amp; !utf8.ValidString(rev) {
            t.Errorf(&quot;Reverse produced invalid UTF-8 string %q&quot;, rev)
        }
    })
}
</code></pre>
<p><a href="#top">返回顶部</a></p>

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