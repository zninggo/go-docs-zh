<!--{
  "Template": true,
  "Title": "教程：模糊测试入门",
  "HideTOC": true,
  "Breadcrumb": true
}-->

本教程介绍Go语言模糊测试的基础知识。模糊测试通过随机数据运行您的测试，以寻找漏洞或导致程序崩溃的输入。通过模糊测试可以发现的漏洞包括SQL注入、缓冲区溢出、拒绝服务攻击和跨站脚本攻击等。

在本教程中，您将为一个简单函数编写模糊测试，运行Go命令，并调试和修复代码中的问题。

如需了解本教程中使用的术语，请参阅[Go模糊测试词汇表](/security/fuzz/#glossary)。

您将按以下章节逐步学习：

1. [创建代码文件夹](#create_folder)
2. [添加待测试代码](#code_to_test)
3. [添加单元测试](#unit_test)
4. [添加模糊测试](#fuzz_test)
5. [修复两个错误](#fix_invalid_string_error)
6. [探索更多资源](#conclusion)

**注意：** 其他教程请参阅[教程合集](/doc/tutorial/index.html)。

**注意：** Go模糊测试目前支持部分内置类型，完整列表见[Go模糊测试文档](/security/fuzz/#requirements)，未来将添加更多内置类型的支持。

## 前提条件

- **安装Go 1.18或更高版本。** 安装说明请参阅[安装Go](/doc/install)。
- **代码编辑工具。** 任何文本编辑器均可使用。
- **命令行终端。** Go在Linux和Mac的任意终端均可良好运行，在Windows系统中可使用PowerShell或cmd。
- **支持模糊测试的环境。** 目前带覆盖率检测的Go模糊测试仅支持AMD64和ARM64架构。

## 创建代码文件夹 {#create_folder}

首先，为即将编写的代码创建一个文件夹。

1. 打开命令行终端并切换到用户主目录。

   在Linux或Mac系统上：   ```
   $ cd
   ```
在 Windows 上:   ```
   C:\> cd %HOMEPATH%
   ```
以下教程中会使用 $ 作为命令行提示符。这里使用的命令在 Windows 系统上同样适用。

2. 在命令行提示符下，为你的代码创建一个名为 fuzz 的目录。   ```
   $ mkdir fuzz
   $ cd fuzz
   ```
3. 创建一个模块来存放你的代码。

   运行 `go mod init` 命令，并指定新代码的模块路径（module path）。   ```
   $ go mod init example/fuzz
   go: creating new go.mod: module example/fuzz
   ```
**注意：** 对于生产环境代码，您应该根据实际需求指定更具体的模块路径。更多详情请参阅[管理依赖关系](/doc/modules/managing-dependencies)。

接下来，我们将添加一段简单的字符串反转代码，以便之后对其进行模糊测试。

## 添加待测试代码 {#code_to_test}

在本步骤中，您将添加一个字符串反转函数。

### 编写代码

1.  使用文本编辑器，在 `fuzz` 目录下创建名为 `main.go` 的文件。
2.  在 `main.go` 文件顶部粘贴以下包声明：    ```
    package main
    ```
一个独立程序（相对于库而言）始终位于 `main` 包中。

3. 在包声明（package declaration）下方，粘贴以下函数声明（function declaration）。    ```
    func Reverse(s string) string {
        b := []byte(s)
        for i, j := 0, len(b)-1; i {{raw "<"}} len(b)/2; i, j = i+1, j-1 {
            b[i], b[j] = b[j], b[i]
        }
        return string(b)
    }
    ```
这个函数接受一个 `string` 类型参数，逐个字节遍历该字符串，最后返回反转后的字符串。

_注意：_ 此代码基于 golang.org/x/example 中的 `stringutil.Reverse` 函数实现。

4. 在 main.go 文件顶部的包声明下方，粘贴以下 `main` 函数代码。该函数会初始化一个字符串，对其执行反转操作，打印输出结果，并重复执行此过程。

```go
func main() {
	fmt.Println(stringutil.Reverse("!selpmaxe oG ,olleH"))
}
```    ```
    func main() {
        input := "The quick brown fox jumped over the lazy dog"
        rev := Reverse(input)
        doubleRev := Reverse(rev)
        fmt.Printf("original: %q\n", input)
        fmt.Printf("reversed: %q\n", rev)
        fmt.Printf("reversed again: %q\n", doubleRev)
    }
    ```
这个函数将执行几次`Reverse`操作，然后将结果输出到命令行。这有助于观察代码的实际运行效果，也可能用于调试目的。

5.  `main`函数使用了fmt包，因此你需要导入它。

    代码开头部分应如下所示：    ```
    package main

    import "fmt"
    ```
### 运行代码

在命令行中，进入包含main.go文件的目录，运行该代码。```
$ go run .
original: "The quick brown fox jumped over the lazy dog"
reversed: "god yzal eht revo depmuj xof nworb kciuq ehT"
reversed again: "The quick brown fox jumped over the lazy dog"
```
您可以看到原始字符串、反转后的结果，以及再次反转后的结果，这实际上等同于原始字符串。

现在代码已运行，是时候进行测试了。

## 添加单元测试 {#unit_test}

在本步骤中，您将为 `Reverse` 函数编写一个基础的单元测试（unit test）。

### 编写代码

1. 使用您的文本编辑器，在 fuzz 目录下创建一个名为 reverse_test.go 的文件。
2. 将以下代码粘贴到 reverse_test.go 文件中。   ```
   package main

   import (
       "testing"
   )

   func TestReverse(t *testing.T) {
       testcases := []struct {
           in, want string
       }{
           {"Hello, world", "dlrow ,olleH"},
           {" ", " "},
           {"!12345", "54321!"},
       }
       for _, tc := range testcases {
           rev := Reverse(tc.in)
           if rev != tc.want {
                   t.Errorf("Reverse: %q, want %q", rev, tc.want)
           }
       }
   }
   ```
这个简单的测试将断言列出的输入字符串能被正确反转。

### 运行代码
使用 `go test` 命令运行单元测试```
$ go test
PASS
ok      example/fuzz  0.013s
```
接下来，你将把单元测试转换为模糊测试。

## 添加模糊测试 {#fuzz_test}

单元测试存在局限性，即每个测试输入都必须由开发者手动添加到测试中。而模糊测试的优势在于它能为你的代码生成输入，并可能发现那些你原先设计的测试用例未能覆盖到的边界情况。

在本节中，你将把单元测试转换为模糊测试，从而能以更少的工作量生成更多测试输入！

请注意，你可以在同一个 `*_test.go` 文件中同时保留单元测试、基准测试和模糊测试，但在本示例中，我们将把单元测试转换为模糊测试。

### 编写代码

在你的文本编辑器中，将 `reverse_test.go` 中的单元测试替换为以下模糊测试：```
func FuzzReverse(f *testing.F) {
    testcases := []string{"Hello, world", " ", "!12345"}
    for _, tc := range testcases {
        f.Add(tc)  // Use f.Add to provide a seed corpus
    }
    f.Fuzz(func(t *testing.T, orig string) {
        rev := Reverse(orig)
        doubleRev := Reverse(rev)
        if orig != doubleRev {
            t.Errorf("Before: %q, after: %q", orig, doubleRev)
        }
        if utf8.ValidString(orig) && !utf8.ValidString(rev) {
            t.Errorf("Reverse produced invalid UTF-8 string %q", rev)
        }
    })
}
```
模糊测试也存在一些局限性。在单元测试中，你可以预测 `Reverse` 函数的预期输出，并验证实际输出是否符合预期。

例如，在测试用例 `Reverse("Hello, world")` 中，单元测试明确指定期望的返回值为 `"dlrow ,olleH"`。

而在模糊测试中，由于无法控制输入值，你无法预测预期输出。

不过，针对 `Reverse` 函数，你可以在模糊测试中验证一些固有属性。本次模糊测试将检查以下两个属性：

1.  对字符串进行两次反转操作应能还原原始值
2.  反转后的字符串仍保持有效的 UTF-8 编码状态

请注意单元测试与模糊测试的语法差异：

- 函数名以 `FuzzXxx` 而非 `TestXxx` 开头，且参数类型为 `*testing.F` 而非 `*testing.T`
- 原使用 `t.Run` 执行测试的位置，现在需使用 `f.Fuzz` 方法。该方法接受一个模糊目标函数作为参数，该目标函数的参数为 `*testing.T` 以及需要进行模糊测试的数据类型。原单元测试的输入数据通过 `f.Add` 转换为种子语料库输入。

请确保已导入新的包 `unicode/utf8`。```
package main

import (
    "testing"
    "unicode/utf8"
)
```
将单元测试转换为模糊测试后，现在需要再次运行测试。

### 运行代码

1. 先不执行模糊化操作运行模糊测试，确保种子输入（seed inputs）能够通过测试。   ```
   $ go test
   PASS
   ok      example/fuzz  0.013s
   ```
你也可以运行 `go test -run=FuzzReverse`（如果该文件中有其他测试，而你只想运行模糊测试）。

2. 运行带模糊测试的 `FuzzReverse`，以查看是否有任何随机生成的字符串输入会导致失败。这需要通过 `go test` 命令配合新参数 `-fuzz`（设置为 `Fuzz`）来执行。请复制以下命令：    ```
    $ go test -fuzz=Fuzz
    ```
另一个实用的标志是 `-fuzztime`，用于限制模糊测试的持续时间。例如，在下面的测试中指定 `-fuzztime 10s` 意味着只要没有更早出现失败，默认情况下测试将在 10 秒后自动退出。其他测试标志请参阅 cmd/go 文档的[这一章节](https://pkg.go.dev/cmd/go#hdr-Testing_flags)。

现在，请运行刚刚复制的命令。   ```
   $ go test -fuzz=Fuzz
   fuzz: elapsed: 0s, gathering baseline coverage: 0/3 completed
   fuzz: elapsed: 0s, gathering baseline coverage: 3/3 completed, now fuzzing with 8 workers
   fuzz: minimizing 38-byte failing input file...
   --- FAIL: FuzzReverse (0.01s)
       --- FAIL: FuzzReverse (0.00s)
           reverse_test.go:20: Reverse produced invalid UTF-8 string "\x9c\xdd"

       Failing input written to testdata/fuzz/FuzzReverse/af69258a12129d6cbba438df5d5f25ba0ec050461c116f777e77ea7c9a0d217a
       To re-run:
       go test -run=FuzzReverse/af69258a12129d6cbba438df5d5f25ba0ec050461c116f777e77ea7c9a0d217a
   FAIL
   exit status 1
   FAIL    example/fuzz  0.030s
   ```
在进行模糊测试（fuzzing）时发生错误，导致该问题的输入数据会被写入种子语料库文件。即使不使用 `-fuzz` 标志，下次执行 `go test` 命令时也会自动运行该文件。若要查看导致失败的输入内容，请用文本编辑器打开写入 testdata/fuzz/FuzzReverse 目录的语料库文件。您的种子语料库文件可能包含不同的字符串，但文件格式是相同的。   ```
   go test fuzz v1
   string("泃")
   ```
语料库文件的第一行指明编码版本。其后每一行代表构成语料库条目的各类型值。由于模糊测试目标仅接受单个输入，版本信息后仅存在一个值。

3. 再次运行 `go test` 命令但不添加 `-fuzz` 标志；此时将使用新的失败种子语料库条目：   ```
   $ go test
   --- FAIL: FuzzReverse (0.00s)
       --- FAIL: FuzzReverse/af69258a12129d6cbba438df5d5f25ba0ec050461c116f777e77ea7c9a0d217a (0.00s)
           reverse_test.go:20: Reverse produced invalid string
   FAIL
   exit status 1
   FAIL    example/fuzz  0.016s
   ```
既然测试已经失败，是时候进行调试了。

## 修复无效字符串错误 {#fix_invalid_string_error}

在本节中，你将调试失败的原因，并修复这个缺陷。

在继续之前，你可以花些时间思考并尝试自己修复这个问题。

### 诊断错误

有几种不同的方法可以调试这个错误。如果你使用 VS Code 作为文本编辑器，可以[设置调试器](https://github.com/golang/vscode-go/blob/master/docs/debugging.md)进行排查。

在本教程中，我们将在终端记录有用的调试信息。

首先，查看 [`utf8.ValidString`](https://pkg.go.dev/unicode/utf8) 的文档。```
ValidString reports whether s consists entirely of valid UTF-8-encoded runes.
```
当前的`Reverse`函数是逐字节（byte）反转字符串的，这正是问题的根源。为了保留原始字符串中经UTF-8编码的字符（rune），我们必须改为逐字符（rune）反转字符串。

要验证为何输入（例如中文字符`泃`）会导致`Reverse`函数反转后产生无效字符串，可以检查反转后字符串包含的字符（rune）数量。

#### 编写代码

在文本编辑器中，将`FuzzReverse`中的模糊测试目标（fuzz target）替换为以下内容：```
f.Fuzz(func(t *testing.T, orig string) {
    rev := Reverse(orig)
    doubleRev := Reverse(rev)
    t.Logf("Number of runes: orig=%d, rev=%d, doubleRev=%d", utf8.RuneCountInString(orig), utf8.RuneCountInString(rev), utf8.RuneCountInString(doubleRev))
    if orig != doubleRev {
        t.Errorf("Before: %q, after: %q", orig, doubleRev)
    }
    if utf8.ValidString(orig) && !utf8.ValidString(rev) {
        t.Errorf("Reverse produced invalid UTF-8 string %q", rev)
    }
})
```
如果发生错误，或者使用 `-v` 参数执行测试时，这行 `t.Logf` 语句会将信息打印到命令行，这有助于调试特定问题。

#### 运行代码

使用 `go test` 命令运行测试```
$ go test
--- FAIL: FuzzReverse (0.00s)
    --- FAIL: FuzzReverse/28f36ef487f23e6c7a81ebdaa9feffe2f2b02b4cddaa6252e87f69863046a5e0 (0.00s)
        reverse_test.go:16: Number of runes: orig=1, rev=3, doubleRev=1
        reverse_test.go:21: Reverse produced invalid UTF-8 string "\x83\xb3\xe6"
FAIL
exit status 1
FAIL    example/fuzz    0.598s
```
整个种子语料库使用的字符串中，每个字符都是单字节。然而，诸如“泃”这样的字符可能需要多个字节。因此，如果逐字节反转字符串，将会破坏多字节字符的有效性。

**注意：** 若您想深入了解Go语言如何处理字符串，请阅读博文[Go语言中的字符串、字节、符文与字符](/blog/strings)以获得更深刻的理解。

在更好地理解该问题后，请修正`Reverse`函数中的错误。

### 修复错误

为修正`Reverse`函数，我们将采用按符文（rune）而非按字节（byte）遍历字符串的方式。

#### 编写代码

在您的文本编辑器中，将现有的`Reverse()`函数替换为以下代码：```
func Reverse(s string) string {
    r := []rune(s)
    for i, j := 0, len(r)-1; i {{raw "<"}} len(r)/2; i, j = i+1, j-1 {
        r[i], r[j] = r[j], r[i]
    }
    return string(r)
}
```
关键区别在于`Reverse`现在遍历的是字符串中的每个`rune`（Unicode字符），而非每个`byte`（字节）。请注意这仅是示例，并未正确处理[组合字符](https://en.wikipedia.org/wiki/Combining_character)。

#### 运行代码

1. 使用`go test`运行测试   ```
   $ go test
   PASS
   ok      example/fuzz  0.016s
   ```
测试现在通过了！

2. 使用 `go test -fuzz` 命令再次进行模糊测试，以检查是否还有新的错误。   ```
   $ go test -fuzz=Fuzz
   fuzz: elapsed: 0s, gathering baseline coverage: 0/37 completed
   fuzz: minimizing 506-byte failing input file...
   fuzz: elapsed: 0s, gathering baseline coverage: 5/37 completed
   --- FAIL: FuzzReverse (0.02s)
       --- FAIL: FuzzReverse (0.00s)
           reverse_test.go:33: Before: "\x91", after: "�"

       Failing input written to testdata/fuzz/FuzzReverse/1ffc28f7538e29d79fce69fef20ce5ea72648529a9ca10bea392bcff28cd015c
       To re-run:
       go test -run=FuzzReverse/1ffc28f7538e29d79fce69fef20ce5ea72648529a9ca10bea392bcff28cd015c
   FAIL
   exit status 1
   FAIL    example/fuzz  0.032s
   ```
可以观察到，字符串在经历两次反转后变得与原字符串不同。这次的输入本身包含非法的Unicode字符。如果我们使用的是字符串进行模糊测试，这种情况是如何发生的呢？

让我们再次进行调试。

## 修复双重反转错误 {#fix_double_reverse_error}

在本节中，您将调试双重反转失败的问题并修复该错误。

在继续之前，请先花些时间自行思考并尝试修复此问题。

### 诊断错误

与之前类似，调试此失败有多种方法。在这种情况下，使用[调试器](https://github.com/golang/vscode-go/blob/master/docs/debugging.md)会是一个很好的方法。

在本教程中，我们将在`Reverse`函数中记录有用的调试信息。

仔细观察反转后的字符串以发现错误。在Go语言中，[字符串是只读的字节切片](/blog/strings)，并且可以包含无效的UTF-8字节。原始字符串是一个单字节的字节切片，字节为`'\x91'`。当输入字符串被设置为`[]rune`时，Go会将字节切片编码为UTF-8，并用UTF-8字符�替换该字节。当我们比较替换后的UTF-8字符与输入的字节切片时，它们显然不相等。

#### 编写代码

1. 在您的文本编辑器中，将`Reverse`函数替换为以下内容：   ```
   func Reverse(s string) string {
       fmt.Printf("input: %q\n", s)
       r := []rune(s)
       fmt.Printf("runes: %q\n", r)
       for i, j := 0, len(r)-1; i {{raw "<"}} len(r)/2; i, j = i+1, j-1 {
           r[i], r[j] = r[j], r[i]
       }
       return string(r)
   }
   ```
这有助于我们理解将字符串转换为 rune 切片（slice of runes）时出现的问题。

#### 运行代码

这次，我们只想运行失败的测试以便检查日志。为此，我们将使用 `go test -run` 命令。

要运行 FuzzXxx/testdata 中的特定语料库条目，你可以向 `-run` 提供 {FuzzTestName}/{filename}。这在调试时很有帮助。
在本例中，请将 `-run` 标志设置为失败测试的确切哈希值。
从你的终端复制粘贴该唯一哈希值；
它会与下面这个不同。```
$ go test -run=FuzzReverse/28f36ef487f23e6c7a81ebdaa9feffe2f2b02b4cddaa6252e87f69863046a5e0
input: "\x91"
runes: ['�']
input: "�"
runes: ['�']
--- FAIL: FuzzReverse (0.00s)
    --- FAIL: FuzzReverse/28f36ef487f23e6c7a81ebdaa9feffe2f2b02b4cddaa6252e87f69863046a5e0 (0.00s)
        reverse_test.go:16: Number of runes: orig=1, rev=1, doubleRev=1
        reverse_test.go:18: Before: "\x91", after: "�"
FAIL
exit status 1
FAIL    example/fuzz    0.145s
```
已知输入为无效的 Unicode，让我们来修复 `Reverse` 函数中的错误。

### 修复错误

为解决此问题，如果传入 `Reverse` 的输入不是有效的 UTF-8，我们需要返回一个错误。

#### 编写代码

1. 在您的文本编辑器中，用以下代码替换现有的 `Reverse` 函数。   ```
   func Reverse(s string) (string, error) {
       if !utf8.ValidString(s) {
           return s, errors.New("input is not valid UTF-8")
       }
       r := []rune(s)
       for i, j := 0, len(r)-1; i {{raw "<"}} len(r)/2; i, j = i+1, j-1 {
           r[i], r[j] = r[j], r[i]
       }
       return string(r), nil
   }
   ```
此更改将对输入字符串中包含无效 UTF-8 字符的情况返回错误。

1. 由于 Reverse 函数现在会返回错误，需要修改 `main` 函数以丢弃多余的错误值。将现有的 `main` 函数替换为以下内容：   ```
   func main() {
       input := "The quick brown fox jumped over the lazy dog"
       rev, revErr := Reverse(input)
       doubleRev, doubleRevErr := Reverse(rev)
       fmt.Printf("original: %q\n", input)
       fmt.Printf("reversed: %q, err: %v\n", rev, revErr)
       fmt.Printf("reversed again: %q, err: %v\n", doubleRev, doubleRevErr)
   }
   ```
对 `Reverse` 函数的这些调用应返回 nil 错误（nil error），因为输入字符串是有效的 UTF-8 格式。

1. 您需要导入 errors 和 unicode/utf8 这两个包。  
   main.go 文件中的导入语句应如下所示：   ```
   import (
       "errors"
       "fmt"
       "unicode/utf8"
   )
   ```
1. 修改 reverse_test.go 文件以检查错误，如果通过返回操作产生了错误则跳过测试。   ```
   func FuzzReverse(f *testing.F) {
       testcases := []string {"Hello, world", " ", "!12345"}
       for _, tc := range testcases {
           f.Add(tc)  // Use f.Add to provide a seed corpus
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
               t.Errorf("Before: %q, after: %q", orig, doubleRev)
           }
           if utf8.ValidString(orig) && !utf8.ValidString(rev) {
               t.Errorf("Reverse produced invalid UTF-8 string %q", rev)
           }
       })
   }
   ```
无需返回，你也可以调用 `t.Skip()` 来停止执行该模糊测试输入。

#### 运行代码

1. 使用 `go test` 运行测试   ```
   $ go test
   PASS
   ok      example/fuzz  0.019s
   ```
2.  使用 `go test -fuzz=Fuzz` 命令进行模糊测试，几秒钟后可通过 `ctrl-C` 停止测试。除非传递 `-fuzztime` 标志，否则模糊测试将运行至遇到失败输入为止。默认行为是在无故障时持续运行，并可通过 `ctrl-C` 中断进程。   ```
   $ go test -fuzz=Fuzz
   fuzz: elapsed: 0s, gathering baseline coverage: 0/38 completed
   fuzz: elapsed: 0s, gathering baseline coverage: 38/38 completed, now fuzzing with 4 workers
   fuzz: elapsed: 3s, execs: 86342 (28778/sec), new interesting: 2 (total: 35)
   fuzz: elapsed: 6s, execs: 193490 (35714/sec), new interesting: 4 (total: 37)
   fuzz: elapsed: 9s, execs: 304390 (36961/sec), new interesting: 4 (total: 37)
   ...
   fuzz: elapsed: 3m45s, execs: 7246222 (32357/sec), new interesting: 8 (total: 41)
   ^Cfuzz: elapsed: 3m48s, execs: 7335316 (31648/sec), new interesting: 8 (total: 41)
   PASS
   ok      example/fuzz  228.000s
   ```
3. 使用 `go test -fuzz=Fuzz -fuzztime 30s` 进行模糊测试，若未发现错误则默认持续运行 30 秒后自动退出。   ```
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
   ```
模糊测试通过！

除了 `-fuzz` 标志外，`go test` 还新增了多个标志选项，相关说明可查阅[文档](/security/fuzz/#custom-settings)。

关于模糊测试输出中的术语解释，请参阅 [Go 模糊测试](/security/fuzz/#command-line-output)文档。例如，“新有趣输入”指的是能扩大现有模糊测试语料库代码覆盖率的测试用例。在模糊测试开始时，“新有趣输入”的数量会快速增长，随着新代码路径的发现会出现多次突增，随后会随时间逐渐减少。

## 结论 {#conclusion}

完成得很好！您已成功体验了 Go 语言的模糊测试功能。

接下来请选择您代码中的某个函数进行模糊测试尝试！如果模糊测试发现了代码缺陷，欢迎将其添加到[战果展示页面](/wiki/Fuzzing-trophy-case)。

如遇任何问题或有功能建议，欢迎[提交问题报告](/issue/new/?&labels=fuzz)。

关于此功能的讨论与反馈，您也可以参与 Gophers Slack 的 [#fuzzing 频道](https://gophers.slack.com/archives/CH5KV1AKE)。

更多资料请查阅 [go.dev/security/fuzz](/security/fuzz/#requirements) 文档。

## 完整代码

--- main.go ---```
package main

import (
    "errors"
    "fmt"
    "unicode/utf8"
)

func main() {
    input := "The quick brown fox jumped over the lazy dog"
    rev, revErr := Reverse(input)
    doubleRev, doubleRevErr := Reverse(rev)
    fmt.Printf("original: %q\n", input)
    fmt.Printf("reversed: %q, err: %v\n", rev, revErr)
    fmt.Printf("reversed again: %q, err: %v\n", doubleRev, doubleRevErr)
}

func Reverse(s string) (string, error) {
    if !utf8.ValidString(s) {
        return s, errors.New("input is not valid UTF-8")
    }
    r := []rune(s)
    for i, j := 0, len(r)-1; i {{raw "<"}} len(r)/2; i, j = i+1, j-1 {
        r[i], r[j] = r[j], r[i]
    }
    return string(r), nil
}
```
--- reverse_test.go ---```
package main

import (
    "testing"
    "unicode/utf8"
)

func FuzzReverse(f *testing.F) {
    testcases := []string{"Hello, world", " ", "!12345"}
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
            t.Errorf("Before: %q, after: %q", orig, doubleRev)
        }
        if utf8.ValidString(orig) && !utf8.ValidString(rev) {
            t.Errorf("Reverse produced invalid UTF-8 string %q", rev)
        }
    })
}
```
[返回顶部](#top)