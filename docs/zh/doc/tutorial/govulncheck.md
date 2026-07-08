<!--{
  "Title": "教程：使用 govulncheck 查找并修复存在漏洞的依赖",
  "HideTOC": true,
  "Breadcrumb": true
}-->

govulncheck 是一款低噪音工具，可帮助您查找并修复 Go 项目中的存在漏洞的依赖项。它的工作原理是扫描项目的依赖项以识别已知漏洞，然后定位代码中对这些漏洞的直接或间接调用。

在本教程中，您将学习如何使用 govulncheck 扫描一个简单程序是否存在漏洞。您还将学习如何优先处理和评估漏洞，以便能够首先专注于修复最重要的漏洞。

若要了解更多关于 govulncheck 的信息，请参阅 [govulncheck 文档](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck) 以及这篇关于 [Go 漏洞管理的博文](/blog/vuln)。我们也非常期待 [收到您的反馈](/s/govulncheck-feedback)。

## 前置条件

- **Go。** 我们建议使用最新版本的 Go 来跟随本教程操作。（安装说明请参阅[安装 Go](/doc/install)。）
- **代码编辑器。** 您拥有的任何编辑器均可使用。
- **命令终端。** Go 在 Linux 和 Mac 上的任何终端中以及 Windows 上的 PowerShell 或 cmd 中均可良好运行。

本教程将引导您完成以下步骤：

1. 创建一个包含存在漏洞依赖的示例 Go 模块
2. 安装并运行 govulncheck
3. 评估漏洞
4. 升级存在漏洞的依赖

## 创建包含存在漏洞依赖的示例 Go 模块

**步骤 1.** 首先，创建一个名为 `vuln-tutorial` 的新文件夹并初始化一个 Go 模块。（如果您是 Go 模块新手，请查看 [go.dev/doc/tutorial/create-module](/doc/tutorial/create-module)）。

例如，在您的主目录下，运行以下命令：```
$ mkdir vuln-tutorial
$ cd vuln-tutorial
$ go mod init vuln.tutorial
```
**第二步.** 在 `vuln-tutorial` 文件夹内创建名为 `main.go` 的文件，并将以下代码复制其中：```
package main

import (
        "fmt"
        "os"

        "golang.org/x/text/language"
)

func main() {
        for _, arg := range os.Args[1:] {
                tag, err := language.Parse(arg)
                if err != nil {
                        fmt.Printf("%s: error: %v\n", arg, err)
                } else if tag == language.Und {
                        fmt.Printf("%s: undefined\n", arg)
                } else {
                        fmt.Printf("%s: tag %s\n", arg, tag)
                }
        }
}
```
该示例程序接收命令行参数中的语言标签列表，并为每个标签输出解析结果：解析成功、标签未定义，或解析过程中发生错误。

**步骤 3.** 运行 `go mod tidy` 命令，该命令会将上一步在 `main.go` 中添加的代码所需的全部依赖项填入 `go.mod` 文件。

在 `vuln-tutorial` 文件夹下执行：```
$ go mod tidy
```
您应该会看到如下输出：```
go: finding module for package golang.org/x/text/language
go: downloading golang.org/x/text v0.9.0
go: found golang.org/x/text/language in golang.org/x/text v0.9.0
```
**步骤4.** 打开您的 `go.mod` 文件，确认其内容与以下示例一致：```
module vuln.tutorial

go 1.20

require golang.org/x/text v0.9.0
```
**步骤 5.** 将 `golang.org/x/text` 包的版本降级至包含已知漏洞的 v0.3.5 版本。执行命令：```
$ go get golang.org/x/text@v0.3.5
```
你应该会看到这样的输出：```
go: downgraded golang.org/x/text v0.9.0 => v0.3.5
```
现在 `go.mod` 文件应显示为：```
module vuln.tutorial

go 1.20

require golang.org/x/text v0.3.5
```
现在，让我们看看 govulncheck 的实际使用。

## 安装并运行 govulncheck

**步骤 6.** 使用 `go install` 命令安装 govulncheck：```
$ go install golang.org/x/vuln/cmd/govulncheck@latest
```
**步骤七。** 从您要分析的文件夹（本例中为 `vuln-tutorial`）运行：```
$ govulncheck ./...
```
您应该能看到如下输出：```
govulncheck is an experimental tool. Share feedback at https://go.dev/s/govulncheck-feedback.

Using go1.20.3 and govulncheck@v0.0.0 with
vulnerability data from https://vuln.go.dev (last modified 2023-04-18 21:32:26 +0000 UTC).

Scanning your code and 46 packages across 1 dependent module for known vulnerabilities...
Your code is affected by 1 vulnerability from 1 module.

Vulnerability #1: GO-2021-0113
  Due to improper index calculation, an incorrectly formatted
  language tag can cause Parse to panic via an out of bounds read.
  If Parse is used to process untrusted user inputs, this may be
  used as a vector for a denial of service attack.

  More info: https://pkg.go.dev/vuln/GO-2021-0113

  Module: golang.org/x/text
    Found in: golang.org/x/text@v0.3.5
    Fixed in: golang.org/x/text@v0.3.7

    Call stacks in your code:
      main.go:12:29: vuln.tutorial.main calls golang.org/x/text/language.Parse

=== Informational ===

Found 1 vulnerability in packages that you import, but there are no call
stacks leading to the use of this vulnerability. You may not need to
take any action. See https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck
for details.

Vulnerability #1: GO-2022-1059
  An attacker may cause a denial of service by crafting an
  Accept-Language header which ParseAcceptLanguage will take
  significant time to parse.
  More info: https://pkg.go.dev/vuln/GO-2022-1059
  Found in: golang.org/x/text@v0.3.5
  Fixed in: golang.org/x/text@v0.3.8

```
### 解读输出结果

<font size="2">  *注意：如果您未使用最新版本的 Go，可能会看到标准库中额外的漏洞信息。*</font>

我们的代码受一个漏洞影响：
[GO-2021-0113](https://pkg.go.dev/vuln/GO-2021-0113)，因为代码直接调用了
`golang.org/x/text/language` 中存在漏洞的版本（v0.3.5）的 `Parse` 函数。

另一个漏洞 [GO-2022-1059](https://pkg.go.dev/vuln/GO-2022-1059) 存在于 `golang.org/x/text` 模块的 v0.3.5 版本中。但由于我们的代码从未（直接或间接）调用其任何易受攻击的函数，该漏洞被报告为"信息性"漏洞。

现在，让我们评估这些漏洞并确定应采取的措施。

### 评估漏洞

a. 评估漏洞。

首先，阅读漏洞描述，判断它是否确实适用于您的代码和使用场景。如需更多信息，请访问"更多信息"链接。

根据描述，漏洞 GO-2021-0113 可能在使用 `Parse` 处理不可信的用户输入时导致恐慌（panic）。假设我们的程序需要承受不可信输入，且我们关注拒绝服务攻击，那么该漏洞很可能适用。

GO-2022-1059 可能不影响我们的代码，因为我们的代码没有调用该报告中的任何易受攻击的函数。

b. 决定采取的措施。

为了缓解 GO-2021-0113 漏洞，我们有几个选项：
- **选项 1：升级到已修复的版本。** 如果存在可用的修复，我们可以通过将模块升级到已修复的版本来移除易受攻击的依赖项。
- **选项 2：停止使用易受攻击的符号。** 我们可以选择移除代码中对易受攻击函数的所有调用。
  我们需要找到替代方案或自行实现。

在本例中，存在可用的修复，且 `Parse` 函数是我们程序的核心部分。让我们将依赖项升级到"已在 v0.3.7 版本中修复"的版本。

我们决定暂时不优先修复信息性漏洞 GO-2022-1059，但由于它与 GO-2021-0113 位于同一模块中，且其已在 v0.3.8 版本中修复，因此我们可以通过升级到 v0.3.8 轻松地同时移除这两个漏洞。

## 升级易受攻击的依赖项

幸运的是，升级易受攻击的依赖项非常简单。

**步骤 8.** 将 `golang.org/x/text` 升级到 v0.3.8：```
$ go get golang.org/x/text@v0.3.8
```
您应该看到如下输出：```
go: upgraded golang.org/x/text v0.3.5 => v0.3.8
```
（需要注意的是，我们也可以选择升级到`latest`版本，或v0.3.8之后的任何其他版本）。

**步骤9.** 现在再次运行govulncheck工具：```
$ govulncheck ./...
```
您现在将看到以下输出：```
govulncheck is an experimental tool. Share feedback at https://go.dev/s/govulncheck-feedback.

Using go1.20.3 and govulncheck@v0.0.0 with
vulnerability data from https://vuln.go.dev (last modified 2023-04-06 19:19:26 +0000 UTC).

Scanning your code and 46 packages across 1 dependent module for known vulnerabilities...
No vulnerabilities found.
```
最终，govulncheck确认未发现任何漏洞。

通过定期使用govulncheck命令扫描依赖项，您可以识别、优先级排序并修复漏洞，从而确保代码库安全。