<!--{
  "Title": "教程：多模块工作区入门",
  "Breadcrumb": true
}-->

本教程介绍 Go 语言中多模块工作区的基础知识。通过多模块工作区，您可以告知 Go 命令您正在同时编写多个模块中的代码，并能轻松地构建和运行这些模块中的代码。

在本教程中，您将在一个共享的多模块工作区中创建两个模块，跨模块进行修改，并在构建中查看这些修改的结果。

<!-- 目录待补充 -->

**注意：** 其他教程请参见[教程](/doc/tutorial/index.html)。

## 前提条件

*   **已安装 Go 1.18 或更高版本。**
*   **一个代码编辑工具。** 任何您拥有的文本编辑器都可以。
*   **一个命令终端。** Go 在 Linux 和 Mac 的任何终端以及 Windows 的 PowerShell 或 cmd 中均能良好运行。

本教程需要 go1.18 或更高版本。请确保您已通过 [go.dev/dl](/dl) 的链接安装了 Go 1.18 或更高版本。

## 为您的代码创建一个模块 {#create_folder}

首先，为您将要编写的代码创建一个模块。

1.  打开命令提示符，并切换到您的主目录。

    在 Linux 或 Mac 上：    ```
    $ cd
    ```
在 Windows 上：    ```
    C:\> cd %HOMEPATH%
    ```
本教程后续部分将以 $ 符号作为命令行提示符。您使用的命令在 Windows 系统中同样适用。

2. 在命令提示符中，为您的代码创建一个名为 workspace 的目录。    ```
    $ mkdir workspace
    $ cd workspace
    ```
3. 初始化模块

   本示例将创建一个名为 `hello` 的新模块，该模块将依赖于 golang.org/x/example 模块。

   创建 hello 模块：   ```
   $ mkdir hello
   $ cd hello
   $ go mod init example.com/hello
   go: creating new go.mod: module example.com/hello
   ```
通过使用 `go get` 命令添加对 `golang.org/x/example/hello/reverse` 包的依赖。   ```
   $ go get golang.org/x/example/hello/reverse
   ```
在 hello 目录中创建 hello.go 文件，包含以下内容：   ```
   package main

   import (
       "fmt"

       "golang.org/x/example/hello/reverse"
   )

   func main() {
       fmt.Println(reverse.String("Hello"))
   }
   ```
现在，运行 hello 程序：   ```
   $ go run .
   olleH
   ```
## 创建工作区

在本步骤中，我们将创建一个 `go.work` 文件来指定包含该模块的工作区。

#### 初始化工作区

在 `workspace` 目录中，运行以下命令：   ```
   $ go work init ./hello
   ```
`go work init` 命令指示 `go` 为包含 `./hello` 目录中模块的工作区创建一个 `go.work` 文件。

该命令会生成如下格式的 `go.work` 文件：   ```
   go 1.18

   use ./hello
   ```
`go.work` 文件的语法与 `go.mod` 文件相似。

`go` 指令告知 Go 应该用哪个版本的 Go 来解析该文件。这类似于 `go.mod` 文件中的 `go` 指令。

`use` 指令告知 Go，在构建时 `hello` 目录中的模块应作为主模块（main modules）。

因此，在 `workspace` 的任何子目录中，该模块都将处于活动状态。

#### 在工作空间目录中运行程序

在 `workspace` 目录下，运行：   ```
   $ go run ./hello
   olleH
   ```
Go命令会将工作区中的所有模块都视为主模块。这使得我们可以在模块外部引用模块中的包。若在模块或工作区之外运行 `go run` 命令，将会出现错误，因为 `go` 命令无法确定应使用哪些模块。

接下来，我们将向工作区添加 `golang.org/x/example/hello` 模块的本地副本。该模块存储在 `go.googlesource.com/example` Git 仓库的子目录中。随后我们将向 `reverse` 包添加一个新函数，用来替代 `String` 函数。

## 下载并修改 `golang.org/x/example/hello` 模块

   在此步骤中，我们将克隆包含 `golang.org/x/example/hello` 模块的 Git 仓库副本，将其添加到工作区，然后为其添加一个将在 hello 程序中使用的新函数。

1. 克隆仓库

   从工作区目录运行 `git` 命令来克隆仓库：   ```
   $ git clone https://go.googlesource.com/example
   Cloning into 'example'...
   remote: Total 165 (delta 27), reused 165 (delta 27)
   Receiving objects: 100% (165/165), 434.18 KiB | 1022.00 KiB/s, done.
   Resolving deltas: 100% (27/27), done.
   ```
2. 将模块添加到工作区

   Git 仓库刚刚被检出到 `./example` 目录。
   `golang.org/x/example/hello` 模块的源代码位于 `./example/hello`。
   将其添加到工作区：   ```
   $ go work use ./example/hello
   ```
`go work use` 命令会向 go.work 文件添加一个新的模块。它现在将显示如下内容：   ```
   go 1.18

   use (
       ./hello
       ./example/hello
   )
   ```
当前工作区同时包含 `example.com/hello` 模块与 `golang.org/x/example/hello` 模块，后者提供了 `golang.org/x/example/hello/reverse` 包。

这使我们能够使用即将在本地 `reverse` 包副本中编写的新代码，而非通过 `go get` 命令下载至模块缓存中的包版本。

3. 添加新函数

我们将向 `golang.org/x/example/hello/reverse` 包添加一个用于反转数字的新函数。

在 `workspace/example/hello/reverse` 目录下创建名为 `int.go` 的新文件，内容如下：   ```
   package reverse

   import "strconv"

   // Int returns the decimal reversal of the integer i.
   func Int(i int) int {
       i, _ = strconv.Atoi(String(strconv.Itoa(i)))
       return i
   }
   ```
4. 修改 hello 程序以使用该函数。

   将 `workspace/hello/hello.go` 文件的内容修改为如下内容：   ```
   package main

   import (
       "fmt"

       "golang.org/x/example/hello/reverse"
   )

   func main() {
       fmt.Println(reverse.String("Hello"), reverse.Int(24601))
   }
   ```
#### 在工作区中运行代码

   从工作区目录出发，运行   ```
   $ go run ./hello
   olleH 10642
   ```
Go 命令在 `go.work` 文件指定的 `hello` 目录中找到命令行中指定的 `example.com/hello` 模块，并同样通过 `go.work` 文件解析 `golang.org/x/example/hello/reverse` 导入路径。

`go.work` 可用于替代在各模块中添加 [`replace`](/ref/mod#go-mod-file-replace) 指令的方式，以便跨多个模块进行开发。

由于这两个模块位于同一工作区中，因此很容易在一个模块中进行更改并在另一个模块中使用。

#### 后续步骤

现在，为了正确发布这些模块，我们需要发布 `golang.org/x/example/hello` 模块，例如发布 `v0.1.0` 版本。这通常通过在模块的版本控制仓库中对提交进行标记来完成。更多详情请参阅[模块发布工作流文档](/doc/modules/release-workflow)。发布完成后，我们可以在 `hello/go.mod` 中提升对 `golang.org/x/example/hello` 模块的依赖要求：   ```
   cd hello
   go get golang.org/x/example/hello@v0.1.0
   ```
这样，`go` 命令就能正确解析工作空间之外的模块。

## 进一步了解工作空间

除了前面教程中提到的 `go work init` 命令外，`go` 命令还提供了一些用于管理工作空间的子命令：

- `go work use [-r] [dir]`：若指定目录 `dir` 存在，则向 `go.work` 文件中添加对应的 `use` 指令；若该目录不存在则移除相应条目。`-r` 标志可递归检查 `dir` 的子目录。
- `go work edit`：以类似 `go mod edit` 的方式编辑 `go.work` 文件
- `go work sync`：将工作空间构建列表中的依赖关系同步到每个工作空间模块中

有关工作空间和 `go.work` 文件的详细信息，请参阅 Go Modules 参考文档中的[工作空间](/ref/mod#workspaces)章节。