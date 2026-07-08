<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>workspaces - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
  "Title": "教程：多模块工作区入门",
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
  "Title": "教程：多模块工作区入门",
  "Breadcrumb": true
}-->

<p>本教程介绍 Go 语言中多模块工作区的基础知识。通过多模块工作区，您可以告知 Go 命令您正在同时编写多个模块中的代码，并能轻松地构建和运行这些模块中的代码。</p>
<p>在本教程中，您将在一个共享的多模块工作区中创建两个模块，跨模块进行修改，并在构建中查看这些修改的结果。</p>
<!-- 目录待补充 -->

<p><strong>注意：</strong> 其他教程请参见<a href="/doc/tutorial/index.html">教程</a>。</p>
<h2>前提条件</h2>
<ul>
<li><strong>已安装 Go 1.18 或更高版本。</strong></li>
<li><strong>一个代码编辑工具。</strong> 任何您拥有的文本编辑器都可以。</li>
<li><strong>一个命令终端。</strong> Go 在 Linux 和 Mac 的任何终端以及 Windows 的 PowerShell 或 cmd 中均能良好运行。</li>
</ul>
<p>本教程需要 go1.18 或更高版本。请确保您已通过 <a href="/dl">go.dev/dl</a> 的链接安装了 Go 1.18 或更高版本。</p>
<h2>为您的代码创建一个模块 {#create_folder}</h2>
<p>首先，为您将要编写的代码创建一个模块。</p>
<ol>
<li><p>打开命令提示符，并切换到您的主目录。</p>
<p>在 Linux 或 Mac 上：    ```<br>$ cd</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在 Windows 上：    <code>    C:\&gt; cd %HOMEPATH%    </code><br>本教程后续部分将以 $ 符号作为命令行提示符。您使用的命令在 Windows 系统中同样适用。</p>
<ol start="2">
<li><p>在命令提示符中，为您的代码创建一个名为 workspace 的目录。    ```<br> $ mkdir workspace<br> $ cd workspace</p>
<pre><code>
</code></pre>
</li>
<li><p>初始化模块</p>
<p>本示例将创建一个名为 <code>hello</code> 的新模块，该模块将依赖于 golang.org/x/example 模块。</p>
<p>创建 hello 模块：   ```<br>$ mkdir hello<br>$ cd hello<br>$ go mod init example.com/hello<br>go: creating new go.mod: module example.com/hello</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>通过使用 <code>go get</code> 命令添加对 <code>golang.org/x/example/hello/reverse</code> 包的依赖。   ```<br>   $ go get golang.org/x/example/hello/reverse</p>
<pre><code>在 hello 目录中创建 hello.go 文件，包含以下内容：   ```
package main

import (
    &quot;fmt&quot;

    &quot;golang.org/x/example/hello/reverse&quot;
)

func main() {
    fmt.Println(reverse.String(&quot;Hello&quot;))
}
</code></pre>
<p>现在，运行 hello 程序：   ```<br>   $ go run .<br>   olleH</p>
<pre><code>## 创建工作区

在本步骤中，我们将创建一个 `go.work` 文件来指定包含该模块的工作区。

#### 初始化工作区

在 `workspace` 目录中，运行以下命令：   ```
$ go work init ./hello
</code></pre>
<p><code>go work init</code> 命令指示 <code>go</code> 为包含 <code>./hello</code> 目录中模块的工作区创建一个 <code>go.work</code> 文件。</p>
<p>该命令会生成如下格式的 <code>go.work</code> 文件：   ```<br>   go 1.18</p>
<p>   use ./hello</p>
<pre><code>`go.work` 文件的语法与 `go.mod` 文件相似。

`go` 指令告知 Go 应该用哪个版本的 Go 来解析该文件。这类似于 `go.mod` 文件中的 `go` 指令。

`use` 指令告知 Go，在构建时 `hello` 目录中的模块应作为主模块（main modules）。

因此，在 `workspace` 的任何子目录中，该模块都将处于活动状态。

#### 在工作空间目录中运行程序

在 `workspace` 目录下，运行：   ```
$ go run ./hello
olleH
</code></pre>
<p>Go命令会将工作区中的所有模块都视为主模块。这使得我们可以在模块外部引用模块中的包。若在模块或工作区之外运行 <code>go run</code> 命令，将会出现错误，因为 <code>go</code> 命令无法确定应使用哪些模块。</p>
<p>接下来，我们将向工作区添加 <code>golang.org/x/example/hello</code> 模块的本地副本。该模块存储在 <code>go.googlesource.com/example</code> Git 仓库的子目录中。随后我们将向 <code>reverse</code> 包添加一个新函数，用来替代 <code>String</code> 函数。</p>
<h2>下载并修改 <code>golang.org/x/example/hello</code> 模块</h2>
<p>   在此步骤中，我们将克隆包含 <code>golang.org/x/example/hello</code> 模块的 Git 仓库副本，将其添加到工作区，然后为其添加一个将在 hello 程序中使用的新函数。</p>
<ol>
<li><p>克隆仓库</p>
<p>从工作区目录运行 <code>git</code> 命令来克隆仓库：   ```<br>$ git clone <a href="https://go.googlesource.com/example">https://go.googlesource.com/example</a><br>Cloning into &#39;example&#39;...<br>remote: Total 165 (delta 27), reused 165 (delta 27)<br>Receiving objects: 100% (165/165), 434.18 KiB | 1022.00 KiB/s, done.<br>Resolving deltas: 100% (27/27), done.</p>
<pre><code>
</code></pre>
</li>
<li><p>将模块添加到工作区</p>
<p>Git 仓库刚刚被检出到 <code>./example</code> 目录。<br><code>golang.org/x/example/hello</code> 模块的源代码位于 <code>./example/hello</code>。<br>将其添加到工作区：   ```<br>$ go work use ./example/hello</p>
<pre><code>
</code></pre>
</li>
</ol>
<p><code>go work use</code> 命令会向 go.work 文件添加一个新的模块。它现在将显示如下内容：   ```<br>   go 1.18</p>
<p>   use (<br>       ./hello<br>       ./example/hello<br>   )</p>
<pre><code>当前工作区同时包含 `example.com/hello` 模块与 `golang.org/x/example/hello` 模块，后者提供了 `golang.org/x/example/hello/reverse` 包。

这使我们能够使用即将在本地 `reverse` 包副本中编写的新代码，而非通过 `go get` 命令下载至模块缓存中的包版本。

3. 添加新函数

我们将向 `golang.org/x/example/hello/reverse` 包添加一个用于反转数字的新函数。

在 `workspace/example/hello/reverse` 目录下创建名为 `int.go` 的新文件，内容如下：   ```
package reverse

import &quot;strconv&quot;

// Int returns the decimal reversal of the integer i.
func Int(i int) int {
    i, _ = strconv.Atoi(String(strconv.Itoa(i)))
    return i
}
</code></pre>
<ol start="4">
<li><p>修改 hello 程序以使用该函数。</p>
<p>将 <code>workspace/hello/hello.go</code> 文件的内容修改为如下内容：   ```<br>package main</p>
<p>import (<br>&quot;fmt&quot;<br><br>&quot;golang.org/x/example/hello/reverse&quot;<br>)</p>
<p>func main() {<br>fmt.Println(reverse.String(&quot;Hello&quot;), reverse.Int(24601))<br>}</p>
<pre><code>
</code></pre>
</li>
</ol>
<h4>在工作区中运行代码</h4>
<p>   从工作区目录出发，运行   ```<br>   $ go run ./hello<br>   olleH 10642</p>
<pre><code>Go 命令在 `go.work` 文件指定的 `hello` 目录中找到命令行中指定的 `example.com/hello` 模块，并同样通过 `go.work` 文件解析 `golang.org/x/example/hello/reverse` 导入路径。

`go.work` 可用于替代在各模块中添加 [`replace`](/ref/mod#go-mod-file-replace) 指令的方式，以便跨多个模块进行开发。

由于这两个模块位于同一工作区中，因此很容易在一个模块中进行更改并在另一个模块中使用。

#### 后续步骤

现在，为了正确发布这些模块，我们需要发布 `golang.org/x/example/hello` 模块，例如发布 `v0.1.0` 版本。这通常通过在模块的版本控制仓库中对提交进行标记来完成。更多详情请参阅[模块发布工作流文档](/doc/modules/release-workflow)。发布完成后，我们可以在 `hello/go.mod` 中提升对 `golang.org/x/example/hello` 模块的依赖要求：   ```
cd hello
go get golang.org/x/example/hello@v0.1.0
</code></pre>
<p>这样，<code>go</code> 命令就能正确解析工作空间之外的模块。</p>
<h2>进一步了解工作空间</h2>
<p>除了前面教程中提到的 <code>go work init</code> 命令外，<code>go</code> 命令还提供了一些用于管理工作空间的子命令：</p>
<ul>
<li><code>go work use [-r] [dir]</code>：若指定目录 <code>dir</code> 存在，则向 <code>go.work</code> 文件中添加对应的 <code>use</code> 指令；若该目录不存在则移除相应条目。<code>-r</code> 标志可递归检查 <code>dir</code> 的子目录。</li>
<li><code>go work edit</code>：以类似 <code>go mod edit</code> 的方式编辑 <code>go.work</code> 文件</li>
<li><code>go work sync</code>：将工作空间构建列表中的依赖关系同步到每个工作空间模块中</li>
</ul>
<p>有关工作空间和 <code>go.work</code> 文件的详细信息，请参阅 Go Modules 参考文档中的<a href="/ref/mod#workspaces">工作空间</a>章节。</p>

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