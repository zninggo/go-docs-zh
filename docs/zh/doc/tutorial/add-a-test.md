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

    <p>
      文件名以 _test.go 结尾会告诉 <code>go test</code> 命令
      此文件包含测试函数。
    </p>
  </li>

  <li>
    在 greetings_test.go 中粘贴以下代码并保存文件。

    <pre>
package greetings

import (
    "testing"
    "regexp"
)

// TestHelloName calls greetings.Hello with a name, checking
// for a valid return value.
func TestHelloName(t *testing.T) {
    name := "Gladys"
    want := regexp.MustCompile(`\b`+name+`\b`)
    msg, err := Hello("Gladys")
    if !want.MatchString(msg) || err != nil {
        t.Errorf(`Hello("Gladys") = %q, %v, want match for %#q, nil`, msg, err, want)
    }
}

// TestHelloEmpty calls greetings.Hello with an empty string,
// checking for an error.
func TestHelloEmpty(t *testing.T) {
    msg, err := Hello("")
    if msg != "" || err == nil {
        t.Errorf(`Hello("") = %q, %v, want "", error`, msg, err)
    }
}
</pre
    >

    <p>
      在此代码中，您：
    </p>

    <ul>
      <li>
        在与被测代码相同的包中实现测试函数。
      </li>
      <li>
        创建两个测试函数来测试 <code>greetings.Hello</code>
        函数。测试函数名称采用 <code>Test<em>名称</em></code> 形式，
        其中 <em>名称</em> 说明了具体测试内容。此外，测试
        函数接受一个指向 <code>testing</code> 包的
        <a href="/pkg/testing/#T"><code>testing.T</code>
        类型</a>的指针作为参数。您可以使用此参数的方法从测试中报告
        和记录信息。
      </li>
      <li>
        实现两个测试：

        <ul>
          <li>
            <code>TestHelloName</code> 调用 <code>Hello</code> 函数，
            传入一个 <code>name</code> 值，该函数应能
            返回有效的响应消息。如果调用返回错误或意外的响应消息（未包含
            您传入的名称），则使用 <code>t</code> 参数的
            <a href="/pkg/testing/#T.Errorf">
            <code>Errorf</code> 方法</a>将消息打印到控制台。
          </li>
          <li>
            <code>TestHelloEmpty</code> 使用空字符串调用 <code>Hello</code> 函数。
            此测试旨在确认您的错误处理是否有效。如果调用返回非空字符串或未返回
            错误，则使用 <code>t</code> 参数的
            <a href="/pkg/testing/#T.Errorf"><code>Errorf
            </code> 方法</a>将消息打印到控制台。
          </li>
        </ul>
      </li>
    </ul>
  </li>

  <li>
    在 greetings 目录的命令行中，运行
    <a href="/cmd/go/#hdr-Test_packages"
      ><code>go test</code> 命令</a
    >
    以执行测试。

    <p>
      <code>go test</code> 命令执行测试文件（文件名以 _test.go 结尾）中的
      测试函数（函数名以 <code>Test</code> 开头）。您可以添加 <code>-v</code>
      标志以获取详细输出，列出所有测试及其结果。
    </p>

    <p>
      测试应通过。
    </p>

    <pre>
$ go test
PASS
ok      example.com/greetings   0.364s

$ go test -v
=== RUN   TestHelloName
--- PASS: TestHelloName (0.00s)
=== RUN   TestHelloEmpty
--- PASS: TestHelloEmpty (0.00s)
PASS
ok      example.com/greetings   0.372s
</pre
    >
  </li>

  <li>
    故意破坏 <code>greetings.Hello</code> 函数以查看测试失败情况。

    <p>
      <code>TestHelloName</code> 测试函数检查您作为 <code>Hello</code>
      函数参数指定的名称的返回值。要查看测试失败结果，请更改 <code>greetings.Hello</code>
      函数，使其不再包含该名称。
    </p>

    <p>
      在 greetings/greetings.go 中，用以下代码替换 <code>Hello</code>
      函数。请注意，高亮显示的行更改了函数的返回值，就好像
      <code>name</code> 参数被意外删除了一样。
    </p>

    <pre>
// Hello returns a greeting for the named person.
func Hello(name string) (string, error) {
    // If no name was given, return an error with a message.
    if name == "" {
        return name, errors.New("empty name")
    }
    // Create a message using a random format.
    <ins>// message := fmt.Sprintf(randomFormat(), name)
    message := fmt.Sprint(randomFormat())</ins>
    return message, nil
}
</pre>
  </li>

  <li>
    在 greetings 目录的命令行中，运行 <code>go test</code> 以
    执行测试。

    <p>
      这次，运行 <code>go test</code> 时不带 <code>-v</code> 标志。输出将
      仅包含失败测试的结果，这在您有大量测试时非常有用。
      <code>TestHelloName</code> 测试应失败 -- <code>TestHelloEmpty</code> 仍会通过。
    </p>

    <pre>
$ go test
--- FAIL: TestHelloName (0.00s)
    greetings_test.go:15: Hello("Gladys") = "Hail, %v! Well met!", &lt;nil>, want match for `\bGladys\b`, nil
FAIL
exit status 1
FAIL    example.com/greetings   0.182s
</pre
    >
  </li>
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