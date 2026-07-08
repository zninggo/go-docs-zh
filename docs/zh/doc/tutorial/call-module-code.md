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

    <p>
      创建此目录后，你应该在层级结构中拥有同级的hello和greetings目录，如下所示：
    </p>
      <pre>&lt;home&gt;/
 |-- greetings/
 |-- hello/</pre>

    <p>
      例如，如果你的命令提示符在greetings目录中，你可以使用以下命令：
    </p>

    <pre>
cd ..
mkdir hello
cd hello
</pre
    >
  </li>

  <li>
    为你即将编写的代码启用依赖项跟踪。

    <p>
      要为你的代码启用依赖项跟踪，请运行
      <a
        href="/ref/mod#go-mod-init"
        ><code>go mod init</code>命令</a>，并提供你的代码将所属模块的名称。</p>

    <p>
        在本教程中，使用<code>example.com/hello</code>作为模块路径。
    </p>

    <pre>
$ go mod init example.com/hello
go: creating new go.mod: module example.com/hello
</pre>
  </li>

  <li>
    在你的文本编辑器中，在hello目录下创建一个文件用于编写代码，并将其命名为hello.go。
  </li>

  <li>
    编写代码来调用<code>Hello</code>函数，然后打印该函数的返回值。

    <p>
      为此，请将以下代码粘贴到hello.go中。
    </p>

    <pre>
package main

import (
    "fmt"

    "example.com/greetings"
)

func main() {
    // 获取问候消息并打印。
    message := greetings.Hello("Gladys")
    fmt.Println(message)
}
</pre>

    <p>
      在此代码中，你：
    </p>

    <ul>
      <li>
        声明了一个<code>main</code>包。在Go中，作为应用程序执行的代码必须位于<code>main</code>包中。
      </li>
      <li>
        导入了两个包：<code>example.com/greetings</code>和<a href="https://pkg.go.dev/fmt/"><code>fmt</code>包</a>。这使你的代码能够访问这些包中的函数。导入<code>example.com/greetings</code>（即你之前创建的模块中包含的包）使你可以访问<code>Hello</code>函数。你还导入了<code>fmt</code>，它提供了处理输入和输出文本的函数（例如将文本打印到控制台）。
      </li>
      <li>
        通过调用<code>greetings</code>包的<code>Hello</code>函数来获取问候语。
      </li>
    </ul>
  </li>

  <li>
    编辑<code>example.com/hello</code>模块以使用你本地的<code>example.com/greetings</code>模块。

    <p>
      对于生产用途，你会从仓库发布<code>example.com/greetings</code>模块（使用反映其发布位置的模块路径），Go工具可以在那里找到并下载它。目前，因为你还没有发布该模块，你需要调整<code>example.com/hello</code>模块，使其能够在本地文件系统上找到<code>example.com/greetings</code>代码。
    </p>

    <p>
      为此，请使用
      <a href="/ref/mod#go-mod-edit"><code>go
      mod edit</code>命令</a>来编辑<code>example.com/hello</code>模块，将Go工具从其模块路径（模块不在那里）重定向到本地目录（模块在那里）。
    </p>

    <ol>
      <li>
        在hello目录的命令提示符下，运行以下命令：

    <pre>
$ go mod edit -replace example.com/greetings=../greetings
</pre>

    <p>
      该命令指定为了定位依赖项，<code>example.com/greetings</code>应被替换为<code>../greetings</code>。运行该命令后，hello目录中的go.mod文件应包含一个<a href="/doc/modules/gomod-ref#replace"><code>replace</code>指令</a>：
    </p>

        <pre>
module example.com/hello

go 1.16

<ins>replace example.com/greetings => ../greetings</ins>
</pre>
      </li>

      <li>
        在hello目录的命令提示符下，运行
        <a href="/ref/mod#go-mod-tidy">
        <code>go mod tidy</code>命令</a>以同步<code>example.com/hello</code>模块的依赖项，添加代码所需但模块尚未跟踪的那些依赖项。

        <pre>$ go mod tidy
go: found example.com/greetings in example.com/greetings v0.0.0-00010101000000-000000000000
</pre>
        <p>
         命令完成后，<code>example.com/hello</code>模块的go.mod文件应如下所示：
        </p>

        <pre>module example.com/hello

go 1.16

replace example.com/greetings => ../greetings

<ins>require example.com/greetings v0.0.0-00010101000000-000000000000</ins></pre>

        <p>
          该命令在greetings目录中找到了本地代码，然后添加了一个<a href="/doc/modules/gomod-ref#require"><code>require</code>指令</a>，指定<code>example.com/hello</code>需要<code>example.com/greetings</code>。当你在hello.go中导入<code>greetings</code>包时，就创建了此依赖关系。
        </p>
        <p>
          模块路径后面的数字是一个<em>伪版本号</em>——一个生成的数字，用于代替语义版本号（该模块尚无语义版本号）。
        </p>
        <p>
          要引用一个<em>已发布</em>的模块，go.mod文件通常会省略<code>replace</code>指令，并使用末尾带有带标签版本号的<code>require</code>指令。
        </p>

        <pre>require example.com/greetings v1.1.0</pre>

        <p>有关版本号的更多信息，请参阅<a href="/doc/modules/version-numbers">模块版本编号</a>。</p>
      </li>
    </ol>
  <li>
    在<code>hello</code>目录的命令提示符下，运行你的代码以确认其是否正常工作。

    <pre>
$ go run .
Hi, Gladys. Welcome!
</pre>
  </li>
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