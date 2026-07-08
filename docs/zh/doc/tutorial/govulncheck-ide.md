<!--{
  "Title": "教程：使用 VS Code Go 查找并修复易受攻击的依赖",
  "Breadcrumb": true
}-->

[返回 Go 安全](/security)

您可以使用 Visual Studio Code 的 Go 扩展，直接在代码编辑器中扫描代码中的漏洞。

注意：有关下图中包含的漏洞修复的说明，请参阅 [govulncheck 教程](/doc/tutorial/govulncheck)。

## 前置条件：

- **Go。** 我们建议使用最新版本的 Go 来跟随本教程。有关安装说明，请参阅[安装 Go](/doc/install)。
- **VS Code**，更新到最新版本。[在此处下载](https://code.visualstudio.com/)。您也可以使用 Vim（详情请参见[此处](/security/vuln/editor#editor-specific-instructions)），但本教程重点介绍 VS Code Go。
- **VS Code Go 扩展**，可以[在此处下载](https://marketplace.visualstudio.com/items?itemName=golang.go)。
- **编辑器特定的设置更改。** 您需要根据[这些规范](/security/vuln/editor#editor-specific-instructions)修改您的 IDE 设置，才能复现以下结果。

## 如何使用 VS Code Go 扫描漏洞

**步骤 1.** 运行 "Go: Toggle Vulncheck"

[Toggle Vulncheck](https://github.com/golang/vscode-go/wiki/Commands#go-toggle-vulncheck) 命令会显示您模块中列出的所有依赖的漏洞分析。要使用此命令，请在您的 IDE 中打开[命令面板](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)（在 Linux/Windows 上按 Ctrl+Shift+P，在 Mac OS 上按 Cmd+Shift+P），然后运行 “Go: Toggle Vulncheck”。在您的 go.mod 文件中，您将看到代码中直接和间接使用的有漏洞依赖的诊断信息。

<div class="image">
  <center>
    <img style="width: 100%" width="2110" height="952" src="editor_tutorial_1.png" alt="运行 Toggle Vulncheck"></img>
  </center>
</div>

注意：要在您自己的编辑器上复现本教程，请将下面的代码复制到您的 main.go 文件中。```
// This program takes language tags as command-line
// arguments and parses them.

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
然后，确保该程序对应的go.mod文件内容如下所示：```
module module1

go 1.18

require golang.org/x/text v0.3.5
```
现在，请运行 `go mod tidy` 命令以确保你的 go.sum 文件已更新。

**步骤 2.** 通过代码操作运行 govulncheck。

使用代码操作运行 govulncheck 可以让你专注于代码中实际调用的依赖项。VS Code 中的代码操作以灯泡图标标识；将鼠标悬停在相关依赖项上可查看漏洞信息，然后选择“快速修复”会显示一个选项菜单。在其中选择“运行 govulncheck 进行验证”。这将在终端中返回相关的 govulncheck 输出。

<div class="image">
  <center>
    <img style="width: 100%" width="2110" height="952" src="editor_tutorial_2.png" alt="govulncheck 代码操作"></img>
  </center>
</div>

<div class="image">
  <center>
    <img style="width: 100%" width="2110" height="952" src="editor_tutorial_3.png" alt="VS Code Go govulncheck 输出"></img>
  </center>
</div>

**步骤 3**. 将鼠标悬停在 go.mod 文件中列出的依赖项上。

你也可以通过将鼠标悬停在 go.mod 文件中的特定依赖项上来查看相关的 govulncheck 输出。要快速查看依赖项信息，此方法比使用代码操作更加高效。

<div class="image">
  <center>
    <img style="width: 100%" width="2110" height="952" src="editor_tutorial_4.png" alt="悬停查看依赖项漏洞信息"></img>
  </center>
</div>

**步骤 4.** 升级到已修复漏洞的依赖项版本。

代码操作也可用于快速升级到已修复漏洞的依赖项版本。通过在代码操作下拉菜单中选择“升级”选项即可完成。

<div class="image">
  <center>
    <img style="width: 100%" width="2110" height="952" src="editor_tutorial_5.png" alt="通过代码操作菜单升级到最新版本"></img>
  </center>
</div>

## 额外资源

- 有关 IDE 中漏洞扫描的更多信息，请参阅[此页面](/security/vuln/editor)。特别是[“注意事项”章节](/security/vuln/editor#notes-and-caveats)，讨论了漏洞扫描可能比上文示例更复杂的特殊情况。
- [Go 漏洞数据库](https://pkg.go.dev/vuln/)包含来自多个现有来源的信息，以及 Go 软件包维护者直接向 Go 安全团队提交的报告。
- 参阅 [Go 漏洞管理](/security/vuln/) 页面，了解用于检测、报告和管理漏洞的 Go 架构的高层概述。