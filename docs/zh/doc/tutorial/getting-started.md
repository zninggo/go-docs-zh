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

    <p>
      在 Linux 或 Mac 上：
    </p>

    <pre>
cd
</pre
    >

    <p>
      在 Windows 上：
    </p>

    <pre>
cd %HOMEPATH%
</pre
    >
  </li>

  <li>
    为你的第一个 Go 源代码创建一个 hello 目录。

    <p>
      例如，使用以下命令：
    </p>

    <pre>
mkdir hello
cd hello
</pre
    >
  </li>

  <li>
    为你的代码启用依赖跟踪。

    <p>
      当你的代码导入其他模块（module）中包含的包（package）时，你需要通过代码自身的模块来管理这些依赖。该模块由一个 go.mod 文件定义，该文件跟踪提供这些包的模块。go.mod 文件会随你的代码一起保存，包括在你的源代码仓库中。
    </p>

    <p>
      要通过创建 go.mod 文件来为你的代码启用依赖跟踪，请运行
      <a href="/ref/mod#go-mod-init"><code>go mod init</code></a> 命令，并为其提供你的代码将位于的模块名称。该名称是模块的模块路径（module path）。
    </p>
    <p>在实际开发中，模块路径通常是你的源代码将存放的仓库位置。例如，模块路径可能是 <code>github.com/mymodule</code>。如果你计划发布你的模块供他人使用，模块路径<em>必须</em>是 Go 工具可以下载你的模块的位置。关于使用模块路径命名模块的更多信息，请参阅<a href="/doc/modules/managing-dependencies#naming_module">管理依赖</a>。
    </p>

      <p>在本教程中，请使用
          <code>example/hello</code>。
    </p>

    <pre>
$ go mod init example/hello
go: creating new go.mod: module example/hello
</pre
    >
  </li>

  <li>
    <p>在你的文本编辑器中，创建一个名为 hello.go 的文件，用于编写你的代码。</p>
  </li>

  <li>
    <p>将以下代码粘贴到你的 hello.go 文件中并保存。</p>

    <pre>
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
</pre
    >

    <p>
      这是你的 Go 代码。在这段代码中，你：
    </p>

    <ul>
      <li>
        声明（declaration）了一个 <code>main</code> 包（package）（包是一种将函数（function）分组的方式，它由同一目录下的所有文件组成）。
      </li>
      <li>
        导入（import）了常用的
        <a href="https://pkg.go.dev/fmt/"><code>fmt</code> 包</a>，该包包含用于格式化文本的函数，包括打印到控制台。这个包是安装 Go 时获得的<a href="https://pkg.go.dev/std">标准库</a>包之一。
      </li>
      <li>
        实现了一个 <code>main</code> 函数（function），用于向控制台打印一条消息。当你运行 <code>main</code> 包时，<code>main</code> 函数会默认执行。
      </li>
    </ul>
  </li>

  <li>
    <p>运行你的代码，查看问候消息。</p>

    <pre>
$ go run .
Hello, World!
</pre
    >

    <p>
      <a href="/cmd/go/#hdr-Compile_and_run_Go_program"
        ><code>go run</code></a> 命令是你将用来完成 Go 中各种任务的众多 <code>go</code> 命令之一。使用以下命令可以获取其他命令的列表：
    </p>

    <pre>
$ go help
</pre
    >
  </li>
</ol>

<h2 id="call">调用外部包中的代码</h2>

<p>
  当你的代码需要实现某个可能已经被别人实现过的功能时，你可以查找一个包含可在你代码中使用的函数的包。
</p>

<ol>
  <li>
    使用一个外部模块中的函数，让你打印的消息更有趣一些。

    <ol>
      <li>
        访问 pkg.go.dev 并<a href="https://pkg.go.dev/search?q=quote">搜索 "quote" 包</a>。
      </li>
      <li>
        在搜索结果中，找到并点击 <code>rsc.io/quote</code> 包的 v1 版本（它应该列在 <code>rsc.io/quote/v4</code> 的"其他主要版本"下）。
      </li>
      <li>
        在<strong>文档</strong>部分下的<strong>索引</strong>中，注意列出的可以从你的代码中调用的函数。你将使用 <code>Go</code> 函数。
      </li>
      <li>
        在此页面顶部，请注意 <code>quote</code> 包包含在 <code>rsc.io/quote</code> 模块中。
      </li>
    </ol>

    <p>
      你可以使用 pkg.go.dev 网站来查找已发布的模块，这些模块的包具有你可以在自己代码中使用的函数。包是在模块中发布的——例如 <code>rsc.io/quote</code>——其他人可以使用它们。模块会随着时间的推移通过新版本得到改进，你可以升级你的代码以使用改进的版本。
    </p>
  </li>

  <li>
    在你的 Go 代码中，导入（import）<code>rsc.io/quote</code> 包，并添加对其 <code>Go</code> 函数的调用。

    <p>
      添加高亮行后，你的代码应包含以下内容：
    </p>

    <pre>
package main

import "fmt"

<ins>import "rsc.io/quote"</ins>

func main() {
    <ins>fmt.Println(quote.Go())</ins>
}
</pre>
  </li>

  <li>
    添加新的模块要求和校验和。

    <p>
      Go 会将 <code>quote</code> 模块添加为依赖项，并生成一个 go.sum 文件用于验证模块。更多信息，请参阅 Go Modules 参考中的<a href="/ref/mod#authenticating">验证模块</a>。
    </p>
    <pre>
$ go mod tidy
go: finding module for package rsc.io/quote
go: found rsc.io/quote in rsc.io/quote v1.5.2
</pre
    >
  </li>

  <li>
    运行你的代码，查看由你调用的函数生成的消息。

    <pre>
$ go run .
Don't communicate by sharing memory, share memory by communicating.
</pre
    >

    <p>
      请注意，你的代码调用了 <code>Go</code> 函数，打印了一条关于通信的巧妙消息。
    </p>

    <p>
      当你运行 <code>go mod tidy</code> 时，它定位并下载了包含你导入的包的 <code>rsc.io/quote</code> 模块。默认情况下，它下载了最新版本——v1.5.2。
    </p>
  </li>
</ol>

<h2 id="write-more">编写更多代码</h2>

<p>
  通过这个快速入门指南，你已经安装了 Go 并学习了一些基础知识。要编写更多代码并了解另一个教程，请查看<a href="/doc/tutorial/create-module.html">创建 Go 模块</a>。
</p>