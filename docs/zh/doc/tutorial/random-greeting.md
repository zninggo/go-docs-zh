<!--{
    "Title": "返回随机问候语",
    "Breadcrumb": true
}-->

<p>
  在本节中，你将修改你的代码，使其不再每次都返回固定的问候语，而是返回几条预设问候消息中的一条。
</p>

<aside class="Note">
  <strong>注意：</strong>本主题是一个多部分教程的一部分，该教程从<a href="/doc/tutorial/create-module.html">创建 Go 模块</a>开始。
</aside>

<p>
  为此，你将使用一个 Go 切片（slice）。切片类似于数组，但不同的是，它的大小会随着你添加或删除元素而动态变化。切片是 Go 中最有用的类型之一。
</p>

<p>
  你将添加一个包含三条问候消息的小切片，然后让你的代码随机返回其中一条消息。关于切片的更多信息，请参阅 Go 博客中的<a href="/blog/slices-intro">Go 切片</a>。
</p>

<ol>
  <li>
    在 greetings/greetings.go 文件中，将你的代码修改为如下所示。

    <pre>
package greetings

import (
    "errors"
    "fmt"
    <ins>"math/rand"</ins>
)

// Hello 为指定的姓名返回一条问候语。
func Hello(name string) (string, error) {
    // 如果没有提供姓名，则返回一个错误信息。
    if name == "" {
        return name, errors.New("empty name")
    }
    // 使用一个随机格式来创建消息。
    message := fmt.Sprintf(<ins>randomFormat()</ins>, name)
    return message, nil
}

<ins>// randomFormat 返回一组问候消息中的一条。返回的消息是随机选择的。
func randomFormat() string {
    // 一个消息格式切片。
    formats := []string{
        "Hi, %v. Welcome!",
        "Great to see you, %v!",
        "Hail, %v! Well met!",
    }

    // 通过为格式切片指定一个随机索引，返回随机选择的消息格式。
    return formats[rand.Intn(len(formats))]
}</ins>
</pre>

    <p>
      在这段代码中，你做了以下修改：
    </p>

    <ul>
      <li>
        添加了一个 <code>randomFormat</code> 函数，它返回一个随机选择的问候消息格式。请注意，<code>randomFormat</code> 以小写字母开头，因此只能被其所在包（package）内的代码访问（换句话说，它没有被导出（export））。
      </li>
      <li>
        在 <code>randomFormat</code> 中，声明了一个包含三种消息格式的 <code>formats</code> 切片。声明切片时，你在方括号中省略了其大小，像这样：<code>[]string</code>。这告诉 Go，该切片底层数组（array）的大小可以动态改变。
      </li>
      <li>
        使用 <a href="https://pkg.go.dev/math/rand/"><code>math/rand</code> 包</a>生成一个随机数，用于从切片中选择一个元素。
      </li>
      <li>
        在 <code>Hello</code> 函数中，调用 <code>randomFormat</code> 函数来获取一个用于返回消息的格式，然后将该格式与 <code>name</code> 值一起使用来创建消息。
      </li>
      <li>像之前一样返回消息（或错误）。</li>
    </ul>
  </li>

  <li>
    在 hello/hello.go 文件中，将你的代码修改为如下所示。
    <p>你只需要在 hello.go 中为 <code>Hello</code> 函数调用添加 "Gladys"（或其他你喜欢的名字）作为参数。</p>

    <pre>package main

import (
    "fmt"
    "log"

    "example.com/greetings"
)

func main() {
    // 设置预定义 Logger 的属性，包括日志条目前缀以及一个标志，用于禁用打印时间、源文件和行号。
    log.SetPrefix("greetings: ")
    log.SetFlags(0)

    // 请求一条问候消息。
    <ins>message, err := greetings.Hello("Gladys")</ins>
    // 如果返回了错误，则将其打印到控制台并退出程序。
    if err != nil {
        log.Fatal(err)
    }

    // 如果没有返回错误，则将返回的消息打印到控制台。
    fmt.Println(message)
}</pre>
  </li>

  <li>
    在命令行中，进入 hello 目录，运行 hello.go 以确认代码正常工作。多次运行它，观察问候语的变化。

    <pre>
$ go run .
Great to see you, Gladys!

$ go run .
Hi, Gladys. Welcome!

$ go run .
Hail, Gladys! Well met!
</pre>
  </li>
</ol>

<p>
  接下来，你将使用切片来问候多个人。
</p>

<p class="Navigation">
  <a class="Navigation-prev" href="/doc/tutorial/handle-errors.html"
    >&lt; 返回并处理错误</a
  >
  <a class="Navigation-next" href="/doc/tutorial/greetings-multiple-people.html"
    >返回给多人的问候 &gt;</a
  >
</p>