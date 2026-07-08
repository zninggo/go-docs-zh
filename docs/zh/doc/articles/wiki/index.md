<!--{
	"Title": "编写 Web 应用",
	"Template": true,
	"Breadcrumb": true
}-->

<h2>简介</h2>

<p>
本教程涵盖以下内容：
</p>
<ul>
<li>创建带有加载和保存方法的数据结构</li>
<li>使用 <code>net/http</code> 包构建 Web 应用程序
<li>使用 <code>html/template</code> 包处理 HTML 模板</li>
<li>使用 <code>regexp</code> 包验证用户输入</li>
<li>使用闭包</li>
</ul>

<p>
预备知识：
</p>
<ul>
<li>编程经验</li>
<li>理解基本 Web 技术（HTTP、HTML）</li>
<li>具备一些 UNIX/DOS 命令行知识</li>
</ul>

<h2>开始</h2>

<p>
目前，你需要一台装有 FreeBSD、Linux、macOS 或 Windows 系统的机器来运行 Go。
我们将使用 <code>$</code> 表示命令行提示符。
</p>

<p>
安装 Go（请参阅<a href="/doc/install">安装说明</a>）。
</p>

<p>
在你的 <code>GOPATH</code> 内为本教程新建一个目录，并进入该目录：
</p>

<pre>
$ mkdir gowiki
$ cd gowiki
</pre>

<p>
创建一个名为 <code>wiki.go</code> 的文件，在你喜欢的编辑器中打开，并添加以下内容：
</p>

<pre>
package main

import (
    "fmt"
    "os"
)
</pre>

<p>
我们从 Go 标准库中导入了 <code>fmt</code> 和 <code>os</code> 包。稍后，随着我们实现更多功能，会向这个 <code>import</code> 声明中添加更多包。
</p>

<h2>数据结构</h2>

<p>
让我们从定义数据结构开始。一个 wiki 由一系列相互连接的页面组成，每个页面都有一个标题和一个正文（页面内容）。
在这里，我们将 <code>Page</code> 定义为一个结构体，其中包含表示标题和正文的两个字段。
</p>

{{code "part1.go" `/^type Page/` `/}/`}}

<p>
类型 <code>[]byte</code> 表示"一个 <code>byte</code> 切片"。
（有关切片的更多信息，请参阅<a href="/doc/articles/slices_usage_and_internals.html">切片：用法和内部原理</a>。）
<code>Body</code> 元素是 <code>[]byte</code> 而不是 <code>string</code>，因为这是我们稍后将使用的 <code>io</code> 库所期望的类型，你稍后会看到。
</p>

<p>
<code>Page</code> 结构体描述了页面数据在内存中的存储方式。
但是持久化存储呢？我们可以通过在 <code>Page</code> 上创建一个 <code>save</code> 方法来解决：
</p>

{{code "part1.go" `/^func.*Page.*save/` `/}/`}}

<p>
这个方法的签名可以解读为："这是一个名为 <code>save</code> 的方法，它的接收者 <code>p</code> 是指向 <code>Page</code> 的指针。它没有参数，返回一个 <code>error</code> 类型的值。"
</p>

<p>
这个方法将把 <code>Page</code> 的 <code>Body</code> 保存到一个文本文件中。为了简单起见，我们将使用 <code>Title</code> 作为文件名。
</p>

<p>
<code>save</code> 方法返回一个 <code>error</code> 值，因为这是 <code>WriteFile</code>（一个将字节切片写入文件的标准库函数）的返回类型。<code>save</code> 方法返回该错误值，以便在写入文件出现问题时让应用程序处理它。如果一切顺利，<code>Page.save()</code> 将返回 <code>nil</code>（指针、接口和某些其他类型的零值）。
</p>

<p>
作为第三个参数传递给 <code>WriteFile</code> 的八进制整数字面量 <code>0600</code>，表示该文件应仅对当前用户具有读写权限创建。（详情请参阅 Unix 手册页 <code>open(2)</code>。）
</p>

<p>
除了保存页面，我们还需要加载页面：
</p>

{{code "part1-noerror.go" `/^func loadPage/` `/^}/`}}

<p>
<code>loadPage</code> 函数根据标题参数构造文件名，将文件内容读入一个新变量 <code>body</code>，然后返回一个指向用正确的标题和正文值构造的 <code>Page</code> 字面量的指针。
</p>

<p>
函数可以返回多个值。标准库函数 <code>os.ReadFile</code> 返回 <code>[]byte</code> 和 <code>error</code>。在 <code>loadPage</code> 中，错误尚未被处理；下划线（<code>_</code>）符号代表的"空白标识符"被用来丢弃错误的返回值（实质上是将该值赋给空）。
</p>

<p>
但如果 <code>ReadFile</code> 遇到错误会怎样？例如，文件可能不存在。我们不应该忽略这样的错误。让我们修改函数以返回 <code>*Page</code> 和 <code>error</code>。
</p>

{{code "part1.go" `/^func loadPage/` `/^}/`}}

<p>
此函数的调用者现在可以检查第二个参数；如果它是 <code>nil</code>，则表示已成功加载一个 Page。如果不是，它将是一个 <code>error</code>，调用者可以对其进行处理（详情请参阅<a href="/ref/spec#Errors">语言规范</a>）。
</p>

<p>
至此，我们有了一个简单的数据结构以及保存到文件和从文件加载的能力。让我们编写一个 <code>main</code> 函数来测试我们写的内容：
</p>

{{code "part1.go" `/^func main/` `/^}/`}}

<p>
编译并执行此代码后，将创建一个名为 <code>TestPage.txt</code> 的文件，其中包含 <code>p1</code> 的内容。然后该文件将被读入结构体 <code>p2</code>，其 <code>Body</code> 元素将被打印到屏幕上。
</p>

<p>
你可以这样编译并运行程序：
</p>

<pre>
$ go build wiki.go
$ ./wiki
This is a sample Page.
</pre>

<p>
（如果你使用 Windows，必须输入 "<code>wiki</code>" 而不带 "<code>./</code>" 来运行程序。）
</p>

<p>
<a href="part1.go">点击查看我们目前编写的代码。</a>
</p>

<h2>引入 <code>net/http</code> 包（插曲）</h2>

<p>
这是一个简单 Web 服务器的完整可运行示例：
</p>

{{code "http-sample.go"}}

<p>
<code>main</code> 函数以调用 <code>http.HandleFunc</code> 开始，它告诉 <code>http</code> 包使用 <code>handler</code> 处理对 Web 根（<code>"/"</code>）的所有请求。
</p>

<p>
然后它调用 <code>http.ListenAndServe</code>，指定它应在所有接口（<code>":8080"</code>）上监听 8080 端口。（现在不用担心它的第二个参数 <code>nil</code>。）
此函数将阻塞直到程序终止。
</p>

<p>
<code>ListenAndServe</code> 总是返回一个错误，因为它只在发生意外错误时返回。
为了记录该错误，我们使用 <code>log.Fatal</code> 包装函数调用。
</p>

<p>
函数 <code>handler</code> 的类型是 <code>http.HandlerFunc</code>。
它接受一个 <code>http.ResponseWriter</code> 和一个 <code>http.Request</code> 作为参数。
</p>

<p>
一个 <code>http.ResponseWriter</code> 值组装 HTTP 服务器的响应；通过向它写入，我们将数据发送给 HTTP 客户端。
</p>

<p>
一个 <code>http.Request</code> 是一个表示客户端 HTTP 请求的数据结构。<code>r.URL.Path</code> 是请求 URL 的路径部分。末尾的 <code>[1:]</code> 表示"从第 1 个字符到末尾创建 <code>Path</code> 的一个子切片。"这会从路径名中删除开头的 "/"。
</p>

<p>
如果你运行此程序并访问 URL：
</p>
<pre>http://localhost:8080/monkeys</pre>
<p>
程序将显示一个包含以下内容的页面：
</p>
<pre>Hi there, I love monkeys!</pre>

<h2>使用 <code>net/http</code> 提供 wiki 页面服务</h2>

<p>
要使用 <code>net/http</code> 包，必须先导入它：
</p>

<pre>
import (
    "fmt"
    "os"
    "log"
    <b>"net/http"</b>
)
</pre>

<p>
让我们创建一个处理函数 <code>viewHandler</code>，它将允许用户查看一个 wiki 页面。它将处理以 "/view/" 为前缀的 URL。
</p>

{{code "part2.go" `/^func viewHandler/` `/^}/`}}

<p>
再次注意，这里使用 <code>_</code> 来忽略 <code>loadPage</code> 返回的 <code>error</code> 值。这样做是为了简单起见，通常被认为是不好的做法。我们稍后会处理这个问题。
</p>

<p>
首先，此函数从请求 URL 的路径部分 <code>r.URL.Path</code> 中提取页面标题。通过 <code>[len("/view/"):]</code> 对 <code>Path</code> 进行重新切片，以移除请求路径开头的 <code>"/view/"</code> 组件。这是因为路径总是以 <code>"/view/"</code> 开头，而该部分不属于页面标题。
</p>

<p>
随后，该函数加载页面数据，使用简单的 HTML 字符串格式化页面，并将其写入 <code>http.ResponseWriter</code> 类型的 <code>w</code>。
</p>

<p>
为了使用这个处理器，我们重写 <code>main</code> 函数，使用 <code>viewHandler</code> 初始化 <code>http</code>，以处理 <code>/view/</code> 路径下的所有请求。
</p>

{{code "part2.go" `/^func main/` `/^}/`}}

<p>
<a href="part2.go">点击此处查看我们目前编写的代码。</a>
</p>

<p>
接下来创建一些页面数据（保存为 <code>test.txt</code>），编译代码，并尝试提供一个 Wiki 页面服务。
</p>

<p>
在编辑器中打开 <code>test.txt</code> 文件，并保存字符串“Hello world”（不含引号）。
</p>

<pre>
$ go build wiki.go
$ ./wiki
</pre>

<p>
（如果使用 Windows，需输入 <code>wiki</code>（不含 <code>./</code>）来运行程序。）
</p>

<p>
运行此 Web 服务器后，访问 <code><a
href="http://localhost:8080/view/test">http://localhost:8080/view/test</a></code>
应显示标题为“test”、内容包含“Hello world”的页面。
</p>

<h2>编辑页面</h2>

<p>
没有编辑页面功能的 Wiki 不是真正的 Wiki。让我们创建两个新的处理器：一个名为 <code>editHandler</code> 用于显示“编辑页面”表单，另一个名为 <code>saveHandler</code> 用于保存通过表单提交的数据。
</p>

<p>
首先，将它们添加到 <code>main()</code> 中：
</p>

{{code "final-noclosure.go" `/^func main/` `/^}/`}}

<p>
函数 <code>editHandler</code> 加载页面（若不存在则创建一个空的 <code>Page</code> 结构体），并显示一个 HTML 表单。
</p>

{{code "notemplate.go" `/^func editHandler/` `/^}/`}}

<p>
此函数可以正常工作，但大量硬编码的 HTML 显得不够优雅。当然，有更好的方法。
</p>

<h2><code>html/template</code> 包</h2>

<p>
<code>html/template</code> 包是 Go 标准库的一部分。我们可以使用 <code>html/template</code> 将 HTML 保存在单独的文件中，从而在不修改底层 Go 代码的情况下更改编辑页面的布局。
</p>

<p>
首先，需要在导入列表中添加 <code>html/template</code>。由于不再使用 <code>fmt</code>，需将其移除。
</p>

<pre>
import (
    <b>"html/template"</b>
    "os"
    "net/http"
)
</pre>

<p>
创建一个包含 HTML 表单的模板文件。新建文件 <code>edit.html</code> 并添加以下内容：
</p>

{{code "edit.html"}}

<p>
修改 <code>editHandler</code> 以使用模板替代硬编码的 HTML：
</p>

{{code "final-noerror.go" `/^func editHandler/` `/^}/`}}

<p>
函数 <code>template.ParseFiles</code> 会读取 <code>edit.html</code> 的内容并返回一个 <code>*template.Template</code>。
</p>

<p>
方法 <code>t.Execute</code> 执行模板，将生成的 HTML 写入 <code>http.ResponseWriter</code>。带点标识符 <code>.Title</code> 和 <code>.Body</code> 分别引用 <code>p.Title</code> 和 <code>p.Body</code>。
</p>

<p>
模板指令用双花括号括起。指令 <code>printf "%s" .Body</code> 是一个函数调用，将 <code>.Body</code> 作为字符串（而非字节流）输出，效果等同于调用 <code>fmt.Printf</code>。<code>html/template</code> 包有助于确保模板操作仅生成安全、格式正确的 HTML。例如，它会自动转义大于号（<code>&gt;</code>），将其替换为 <code>&#x26;gt;</code>，以防止用户数据破坏表单 HTML。
</p>

<p>
既然现在使用了模板，我们也为 <code>viewHandler</code> 创建一个模板文件 <code>view.html</code>：
</p>

{{code "view.html"}}

<p>
相应地修改 <code>viewHandler</code>：
</p>

{{code "final-noerror.go" `/^func viewHandler/` `/^}/`}}

<p>
注意两个处理器中使用了几乎相同的模板代码。让我们通过将模板代码移至独立函数来消除这种重复：
</p>

{{code "final-template.go" `/^func renderTemplate/` `/^}/`}}

<p>
并修改处理器以使用该函数：
</p>

{{code "final-template.go" `/^func viewHandler/` `/^}/`}}
{{code "final-template.go" `/^func editHandler/` `/^}/`}}

<p>
若注释掉 <code>main</code> 中未实现的保存处理器的注册，我们可以再次编译并测试程序。<a href="part3.go">点击此处查看我们目前编写的代码。</a>
</p>

<h2>处理不存在的页面</h2>

<p>
如果访问 <a href="http://localhost:8080/view/APageThatDoesntExist">
<code>/view/APageThatDoesntExist</code></a> 会怎样？你将看到一个包含 HTML 的页面。这是因为它忽略了 <code>loadPage</code> 返回的错误值，仍尝试用空数据填充模板。实际上，若请求的页面不存在，应将客户端重定向到编辑页面以便创建内容：
</p>

{{code "part3-errorhandling.go" `/^func viewHandler/` `/^}/`}}

<p>
函数 <code>http.Redirect</code> 向 HTTP 响应中添加状态码 <code>http.StatusFound</code>（302）和 <code>Location</code> 头部。
</p>

<h2>保存页面</h2>

<p>
函数 <code>saveHandler</code> 将处理编辑页面表单的提交。在取消 <code>main</code> 中相关行的注释后，实现该处理器：
</p>

{{code "final-template.go" `/^func saveHandler/` `/^}/`}}

<p>
页面标题（由 URL 提供）和表单的唯一字段 <code>Body</code> 被存储到一个新的 <code>Page</code> 中。随后调用 <code>save()</code> 方法将数据写入文件，并将客户端重定向到 <code>/view/</code> 页面。
</p>

<p>
<code>FormValue</code> 返回的值是 <code>string</code> 类型。在存入 <code>Page</code> 结构体前，需将其转换为 <code>[]byte</code>。我们使用 <code>[]byte(body)</code> 进行转换。
</p>

<h2>错误处理</h2>

<p>
程序中有多处忽略了错误。这是不好的做法，尤其当错误发生时程序会出现意外行为。更好的解决方案是处理错误并向用户返回错误信息。这样，一旦出现问题，服务器能按预期运行，用户也能得到通知。
</p>

<p>
首先，处理 <code>renderTemplate</code> 中的错误：
</p>

{{code "final-parsetemplate.go" `/^func renderTemplate/` `/^}/`}}

<p>
函数 <code>http.Error</code> 发送指定的 HTTP 响应代码（此处为“内部服务器错误”）和错误信息。将此逻辑放在单独函数中已显现优势。
</p>

<p>
现在修复 <code>saveHandler</code>：
</p>

{{code "part3-errorhandling.go" `/^func saveHandler/` `/^}/`}}

<p>
<code>p.save()</code> 过程中发生的任何错误都将报告给用户。
</p>

<h2>模板缓存</h2>

<p>
当前代码存在效率问题：<code>renderTemplate</code> 每次渲染页面都会调用 <code>ParseFiles</code>。更好的方法是在程序初始化时调用一次 <code>ParseFiles</code>，将所有模板解析到单个 <code>*Template</code> 中。然后可以使用
<a href="/pkg/html/template/#Template.ExecuteTemplate"><code>ExecuteTemplate</code></a>
方法渲染特定模板。
</p>

<p>
首先，创建全局变量 <code>templates</code> 并用 <code>ParseFiles</code> 初始化。
</p>

{{code "final.go" `/var templates/`}}

<p>
<code>template.Must</code> 函数是一个便捷的封装器，当传入非空的 <code>error</code> 值时会触发 panic（恐慌），否则直接返回未修改的 <code>*Template</code>。此处使用 panic 是合适的；如果模板无法加载，唯一合理的选择就是终止程序。
</p>

<p>
<code>ParseFiles</code> 函数接收任意数量的字符串参数（用于指定模板文件路径），并将这些文件解析为以基础文件名命名的模板。如果向程序添加更多模板，只需将它们的名称添加到 <code>ParseFiles</code> 调用的参数中。
</p>

<p>
接下来修改 <code>renderTemplate</code> 函数，使其调用 <code>templates.ExecuteTemplate</code> 方法时传入对应的模板名称：
</p>

{{code "final.go" `/func renderTemplate/` `/^}/`}}

<p>
请注意模板名称即模板文件名，因此需要在 <code>tmpl</code> 参数后追加 <code>".html"</code>。
</p>

<h2>输入验证</h2>

<p>
你可能已经注意到，这个程序存在严重的安全漏洞：用户可以向服务器提供任意路径进行读写操作。为缓解此问题，我们可以编写一个函数使用正则表达式验证标题。
</p>

<p>
首先在 <code>import</code> 列表中添加 <code>"regexp"</code>。然后创建一个全局变量存储验证表达式：
</p>

{{code "final-noclosure.go" `/^var validPath/`}}

<p>
<code>regexp.MustCompile</code> 函数会解析并编译正则表达式，返回一个 <code>regexp.Regexp</code> 对象。<code>MustCompile</code> 与 <code>Compile</code> 的区别在于：当表达式编译失败时，<code>MustCompile</code> 会 panic，而 <code>Compile</code> 会返回第二个参数 <code>error</code>。
</p>

<p>
现在编写一个函数，使用 <code>validPath</code> 表达式验证路径并提取页面标题：
</p>

{{code "final-noclosure.go" `/func getTitle/` `/^}/`}}

<p>
如果标题有效，函数会返回标题值和一个 <code>nil</code> 错误值。若标题无效，函数会向 HTTP 连接写入"404 Not Found"错误并向处理器返回错误。要创建新错误，需要导入 <code>errors</code> 包。
</p>

<p>
在各个处理器中添加对 <code>getTitle</code> 的调用：
</p>

{{code "final-noclosure.go" `/^func viewHandler/` `/^}/`}}
{{code "final-noclosure.go" `/^func editHandler/` `/^}/`}}
{{code "final-noclosure.go" `/^func saveHandler/` `/^}/`}}

<h2>函数字面量与闭包</h2>

<p>
在每个处理器中捕获错误条件会导致大量重复代码。能否将每个处理器都封装在一个包含验证和错误检查功能的函数中？Go 语言的
<a href="/ref/spec#Function_literals">函数字面量（function literals）</a>提供了强大的功能抽象手段，正好可以解决这个问题。
</p>

<p>
首先修改各个处理器的函数定义，使其接收标题字符串参数：
</p>

<pre>
func viewHandler(w http.ResponseWriter, r *http.Request, title string)
func editHandler(w http.ResponseWriter, r *http.Request, title string)
func saveHandler(w http.ResponseWriter, r *http.Request, title string)
</pre>

<p>
接下来定义一个封装函数，它<i>接收一个上述类型的函数</i>，并返回一个 <code>http.HandlerFunc</code> 类型的函数（适用于传递给 <code>http.HandleFunc</code> 函数）：
</p>

<pre>
func makeHandler(fn func (http.ResponseWriter, *http.Request, string)) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // 此处将从请求中提取页面标题
        // 并调用提供的处理器 'fn'
    }
}
</pre>

<p>
返回的函数被称为闭包（closure），因为它封闭了外部定义的值。此处 <code>makeHandler</code> 的参数 <code>fn</code> 被闭包所封闭，它将是我们的 save、edit 或 view 处理器之一。
</p>

<p>
现在可以将 <code>getTitle</code> 中的代码移至此处（稍作修改）：
</p>

{{code "final.go" `/func makeHandler/` `/^}/`}}

<p>
<code>makeHandler</code> 返回的闭包是一个接收 <code>http.ResponseWriter</code> 和 <code>http.Request</code> 参数的函数（即 <code>http.HandlerFunc</code>）。该闭包从请求路径中提取 <code>title</code>，并使用 <code>validPath</code> 正则表达式进行验证。如果 <code>title</code> 无效，将通过 <code>http.NotFound</code> 函数向 <code>ResponseWriter</code> 写入错误。若 <code>title</code> 有效，则调用被封闭的处理器函数 <code>fn</code>，并将 <code>ResponseWriter</code>、<code>Request</code> 和 <code>title</code> 作为参数传递。
</p>

<p>
在 <code>main</code> 函数中，将处理器函数注册到 <code>http</code> 包之前，先用 <code>makeHandler</code> 进行封装：
</p>

{{code "final.go" `/func main/` `/^}/`}}

<p>
最后从处理器函数中移除对 <code>getTitle</code> 的调用，使代码更加简洁：
</p>

{{code "final.go" `/^func viewHandler/` `/^}/`}}
{{code "final.go" `/^func editHandler/` `/^}/`}}
{{code "final.go" `/^func saveHandler/` `/^}/`}}

<h2>运行测试</h2>

<p>
<a href="final.go">点击此处查看完整代码列表。</a>
</p>

<p>
重新编译代码并运行应用：
</p>

<pre>
$ go build wiki.go
$ ./wiki
</pre>

<p>
访问 <a href="http://localhost:8080/view/ANewPage">http://localhost:8080/view/ANewPage</a> 应显示页面编辑表单。输入文本后点击"Save"按钮，页面将重定向至新创建的页面。
</p>

<h2>其他任务</h2>

<p>
以下是一些可自行尝试的简单任务：
</p>

<ul>
<li>将模板存储在 <code>tmpl/</code> 目录，页面数据存储在 <code>data/</code> 目录。
<li>添加处理器使网站根目录重定向至 <code>/view/FrontPage</code>。</li>
<li>通过规范化 HTML 结构和添加 CSS 规则来优化页面模板。</li>
<li>实现页面间链接功能，将 <code>[PageName]</code> 实例转换为<br>
	<code>&lt;a href="/view/PageName"&gt;PageName&lt;/a&gt;</code>。
	（提示：可使用 <code>regexp.ReplaceAllFunc</code> 实现）
	</li>
</ul>