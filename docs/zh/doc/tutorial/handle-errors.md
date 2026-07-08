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

    <p>
      如果不知道该问候谁，发送问候就毫无意义。如果名字为空，请向调用方返回一个错误。将以下代码复制到 greetings.go 中并保存文件。
    </p>

    <pre>
package greetings

import (
    <ins>"errors"</ins>
    "fmt"
)

// Hello 为指定的人返回问候语。
func Hello(name string) <ins>(</ins>string<ins>, error)</ins> {
    <ins>// 如果未提供名字，则返回带消息的错误。
    if name == "" {
        return "", errors.New("empty name")
    }</ins>

    // 如果收到了名字，则返回一个将名字嵌入问候消息中的值。
    message := fmt.Sprintf("Hi, %v. Welcome!", name)
    return message<ins>, nil</ins>
}
</pre>

    <p>
      在此代码中，您：
    </p>

    <ul>
      <li>
        更改了函数，使其返回两个值：一个 <code>string</code> 和一个 <code>error</code>。您的调用方将检查第二个值以查看是否发生了错误。（任何 Go 函数都可以返回多个值。更多信息，请参阅 <a href="/doc/effective_go.html#multiple-returns">Effective Go</a>。）
      </li>
      <li>
        导入了 Go 标准库的 <code>errors</code> 包，以便可以使用其 <a href="https://pkg.go.dev/errors/#example-New"><code>errors.New</code> 函数</a>。
      </li>
      <li>
        添加了一个 <code>if</code> 语句来检查无效请求（名字应为字符串但实际为空），并在请求无效时返回错误。<code>errors.New</code> 函数返回一个包含您消息的 <code>error</code>。
      </li>
      <li>
        在成功的返回值中添加了 <code>nil</code>（表示无错误）作为第二个值。这样，调用方就能知道函数成功执行了。
      </li>
    </ul>
  </li>

  <li>
    在您的 hello/hello.go 文件中，现在处理 <code>Hello</code> 函数返回的错误以及非错误值。

    <p>
      将以下代码粘贴到 hello.go 中。
    </p>

    <pre>
package main

import (
    "fmt"
    <ins>"log"</ins>

    "example.com/greetings"
)

func main() {
    <ins>// 设置预定义 Logger 的属性，包括日志条目前缀和一个标志，
    // 用于禁用打印时间、源文件和行号。
    log.SetPrefix("greetings: ")
    log.SetFlags(0)</ins>

    // 请求一个问候消息。
    <ins>message, err := greetings.Hello("")</ins>
    <ins>// 如果返回了错误，则将其打印到控制台并退出程序。
    if err != nil {
        log.Fatal(err)
    }

    // 如果未返回错误，则将返回的消息打印到控制台。</ins>
    fmt.Println(message)
}
</pre>

    <p>
      在此代码中，您：
    </p>

    <ul>
      <li>
        配置了 <a href="https://pkg.go.dev/log/"><code>log</code> 包</a>，以便在其日志消息的开头打印命令名称（"greetings: "），而不带时间戳或源文件信息。
      </li>
      <li>
        将 <code>Hello</code> 的两个返回值（包括 <code>error</code>）都赋给了变量。
      </li>
      <li>
        将 <code>Hello</code> 的参数从 Gladys 的名字更改为空字符串，以便可以测试您的错误处理代码。
      </li>
      <li>
        查找非 nil 的 <code>error</code> 值。在这种情况下继续执行没有意义。
      </li>
      <li>
        使用标准库 <code>log 包</code>中的函数输出错误信息。如果遇到错误，您使用该 <code>log</code> 包的 <a href="https://pkg.go.dev/log?tab=doc#Fatal"><code>Fatal</code> 函数</a>打印错误并停止程序。
      </li>
    </ul>
  </li>

  <li>
    在 <code>hello</code> 目录下的命令行中，运行 hello.go 以确认代码是否工作。

    <p>
      现在您传入了一个空名字，将会得到一个错误。
    </p>

    <pre>
$ go run .
greetings: empty name
exit status 1
</pre
    >
  </li>
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