<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>generics - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
  "Title": "教程：泛型入门",
  "Breadcrumb": true
}-->">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"></script>
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <a href="/" class="logo">Go 文档中文版</a>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="搜索文档...">
      </div>
    </div>
  </nav>

  <main class="container">
    <article class="content">
      <!--{
  "Title": "教程：泛型入门",
  "Breadcrumb": true
}-->

<p>本教程将介绍 Go 语言泛型的基础知识。通过泛型，您可以声明并使用那些能够处理调用方所提供的一组特定类型中任意类型的函数或类型。</p>
<p>在本教程中，您将声明两个简单的非泛型函数，然后用一个泛型函数来封装相同的逻辑。</p>
<p>教程将引导您完成以下步骤：</p>
<ol>
<li>为代码创建文件夹</li>
<li>添加非泛型函数</li>
<li>添加一个能处理多种类型的泛型函数</li>
<li>在调用泛型函数时省略类型实参</li>
<li>声明一个类型约束</li>
</ol>
<p><strong>注意：</strong> 关于其他教程，请参阅 <a href="/doc/tutorial/index.html">教程</a>。</p>
<p><strong>注意：</strong> 如果您愿意，也可以使用<br><a href="/play/?v=gotip">“Go 开发分支”模式下的 Go Playground</a><br>来编辑和运行您的程序。</p>
<h2>前提条件</h2>
<ul>
<li><strong>安装 Go 1.18 或更高版本。</strong> 安装说明请参阅 <a href="/doc/install">安装 Go</a>。</li>
<li><strong>用于编辑代码的工具。</strong> 您拥有的任何文本编辑器均可使用。</li>
<li><strong>命令终端。</strong> Go 在 Linux 和 Mac 的任何终端，以及 Windows 的 PowerShell 或 cmd 中都能良好运行。</li>
</ul>
<h2>为代码创建文件夹 {#create_folder}</h2>
<p>首先，为您将要编写的代码创建一个文件夹。</p>
<ol>
<li><p>打开命令提示符，并切换到您的主目录。</p>
<p>在 Linux 或 Mac 上：    ```<br>$ cd</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在Windows系统上：    <code>    C:\&gt; cd %HOMEPATH%    </code><br>本教程后续部分将把提示符显示为 $。你所使用的命令在Windows上也能正常运行。</p>
<ol start="2">
<li><p>在命令提示符中，为你的代码创建一个名为generics的目录。    ```<br> $ mkdir generics<br> $ cd generics</p>
<pre><code>
</code></pre>
</li>
<li><p>创建模块以存放代码。</p>
<p> 运行 <code>go mod init</code> 命令，并为新代码指定模块路径。    ```<br> $ go mod init example/generics<br> go: creating new go.mod: module example/generics</p>
<pre><code>
</code></pre>
</li>
</ol>
<p><strong>注意：</strong> 在生产代码中，你应该根据自身需求指定更具体的模块路径。更多信息，请务必参阅 <a href="/doc/modules/managing-dependencies">管理依赖项</a>。</p>
<p>接下来，你将添加一些简单的代码来操作 map。</p>
<h2>添加非泛型函数 {#non_generic_functions}</h2>
<p>在这一步中，你将添加两个函数，每个函数都将 map 中的值相加并返回总和。</p>
<p>你之所以声明两个函数而不是一个，是因为你要处理两种不同类型的 map：一种存储 <code>int64</code> 值，另一种存储 <code>float64</code> 值。</p>
<h4>编写代码</h4>
<ol>
<li>使用你的文本编辑器，在 generics 目录下创建一个名为 main.go 的文件。你将在这个文件中编写你的 Go 代码。</li>
<li>将以下 package（包）声明粘贴到 main.go 文件的顶部。    ```<br>package main<pre><code>
</code></pre>
</li>
</ol>
<p>独立程序（与库相对应）始终位于 <code>main</code> 包中。</p>
<ol start="3">
<li><p>在包声明下方，粘贴以下两个函数声明。    ```<br> // SumInts adds together the values of m.<br> func SumInts(m map[string]int64) int64 {<br> var s int64<br> for _, v := range m {<br>     s += v<br> }<br> return s<br> }</p>
<p> // SumFloats adds together the values of m.<br> func SumFloats(m map[string]float64) float64 {<br> var s float64<br> for _, v := range m {<br>     s += v<br> }<br> return s<br> }</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在这段代码中，你需要：</p>
<ul>
<li>声明两个函数，用于对映射（map）中的值进行求和并返回结果。<ul>
<li><code>SumFloats</code> 接受键为 <code>string</code> 类型、值为 <code>float64</code> 类型的映射（map）。</li>
<li><code>SumInts</code> 接受键为 <code>string</code> 类型、值为 <code>int64</code> 类型的映射（map）。</li>
</ul>
</li>
</ul>
<ol start="4">
<li>在 main.go 文件顶部，包声明（package declaration）下方，粘贴以下 <code>main</code> 函数，以初始化两个映射（map），并在调用上一步所声明的函数时，将它们作为参数使用。    ```<br> func main() {<br> // Initialize a map for the integer values<br> ints := map[string]int64{<br>     &quot;first&quot;:  34,<br>     &quot;second&quot;: 12,<br> }<br><br> // Initialize a map for the float values<br> floats := map[string]float64{<br>     &quot;first&quot;:  35.98,<br>     &quot;second&quot;: 26.99,<br> }<br><br> fmt.Printf(&quot;Non-Generic Sums: %v and %v\n&quot;,<br>     SumInts(ints),<br>     SumFloats(floats))<br> }<pre><code>
</code></pre>
</li>
</ol>
<p>在这段代码中，你需要：</p>
<ul>
<li>初始化一个包含两个条目的 <code>float64</code> 类型值 map 和一个 <code>int64</code> 类型值 map。</li>
<li>调用先前声明的两个函数，分别计算每个 map 值的总和。</li>
<li>打印结果。</li>
</ul>
<ol start="5">
<li><p>在 main.go 文件顶部，package 声明的下方，导入支持你刚编写的代码所需的包。</p>
<p> 代码的开头几行应如下所示：    ```<br> package main</p>
<p> import &quot;fmt&quot;</p>
<pre><code>
</code></pre>
</li>
<li><p>保存 main.go。</p>
</li>
</ol>
<h4>运行代码</h4>
<p>在包含 main.go 的目录的命令行中运行代码。```<br>$ go run .<br>Non-Generic Sums: 46 and 62.97</p>
<pre><code>借助泛型（Generics），你可以在此处编写一个函数来替代原本的两个函数。接下来，你将添加一个单一的泛型函数来处理包含整数或浮点值的映射（map）。

## 添加泛型函数以处理多种类型 {#add_generic_function}

在本节中，你将添加一个泛型函数，该函数可以接收包含整数或浮点值的映射，从而有效地用单个函数替代你刚编写的两个函数。

为了支持这两种类型的值，该函数需要一种方式来声明它支持哪些类型。另一方面，调用代码也需要一种方式来指定它使用的是整数映射还是浮点映射。

为此，你将编写一个函数，除了常规的函数参数外，还需声明**类型参数**。这些类型参数使函数成为泛型，从而能够处理不同类型的参数。在调用该函数时，你将使用**类型参数**和常规函数参数。

每个类型参数都有一个**类型约束**，该约束充当类型参数的一种元类型。每个类型约束指定了调用代码可以用于对应类型参数的允许的类型参数。

虽然类型参数的约束通常代表一组类型，但在编译时，类型参数仅代表单一类型——即调用代码通过类型参数提供的类型。如果类型参数的类型不被类型参数的约束所允许，代码将无法编译。

请注意，类型参数必须支持泛型代码对其执行的所有操作。例如，如果你的函数代码尝试对一个约束包含数字类型的类型参数执行 `string` 操作（如索引），代码将无法编译。

在你即将编写的代码中，你将使用一个允许整数或浮点类型的约束。

#### 编写代码

1. 在你之前添加的两个函数下方，粘贴以下泛型函数。    ```
    // SumIntsOrFloats sums the values of map m. It supports both int64 and float64
    // as types for map values.
    func SumIntsOrFloats[K comparable, V int64 | float64](m map[K]V) V {
        var s V
        for _, v := range m {
            s += v
        }
        return s
    }
    ```
在此代码中，您：

*   声明了一个 `SumIntsOrFloats` 函数，它包含两个类型参数（位于方括号内）`K` 和 `V`，以及一个使用这些类型参数的参数 `m`，其类型为 `map[K]V`。该函数返回一个类型为 `V` 的值。
*   为类型参数 `K` 指定了类型约束 `comparable`。`comparable` 约束是 Go 语言中预声明的，专门用于此类场景。它允许任何类型的值用作比较运算符 `==` 和 `!=` 的操作数。Go 要求映射的键必须是可比较的。因此，将 `K` 声明为 `comparable` 是必要的，这样您才能将 `K` 用作映射变量中的键。这同时也确保了调用代码使用了映射键的允许类型。
*   为类型参数 `V` 指定了一个约束，它是两个类型的联合：`int64` 和 `float64`。使用 `|` 表示这两个类型的联合，意味着该约束允许其中任意一种类型。编译器将允许调用代码中使用这两种类型中的任何一种作为参数。
*   指定参数 `m` 的类型为 `map[K]V`，其中 `K` 和 `V` 已是为类型参数指定的类型。请注意，我们知道 `map[K]V` 是一个有效的映射类型，因为 `K` 是一个可比较的类型。如果我们没有将 `K` 声明为可比较的，编译器将拒绝 `map[K]V` 的引用。

2. 在 `main.go` 中，在您已有的代码下方，粘贴以下代码。    ```
    fmt.Printf(&quot;Generic Sums: %v and %v\n&quot;,
        SumIntsOrFloats[string, int64](ints),
        SumIntsOrFloats[string, float64](floats))
    ```
在这段代码中，你需要：

*   调用刚才声明的泛型函数，传入你创建的各个 map。
*   指定类型实参——即方括号中的类型名称——以明确应使用哪些类型来替换被调用函数中的类型形参。
    正如下一节将要介绍的，你通常可以在函数调用中省略类型实参。Go 语言常常能从你的代码中推断出它们。
*   打印该函数返回的和。

#### 运行代码
在命令行中，进入包含 `main.go` 文件的目录，然后运行代码。```
$ go run .
Non-Generic Sums: 46 and 62.97
Generic Sums: 46 and 62.97
</code></pre>
<p>运行代码时，编译器会在每次调用中将类型参数替换为该调用指定的具体类型。</p>
<p>在调用你编写的泛型函数时，你指定了类型参数，告诉编译器使用哪些类型来替代函数的类型参数。正如你在下一节将看到的，在许多情况下可以省略这些类型参数，因为编译器能够推断它们。</p>
<h2>调用泛型函数时省略类型参数 {#remove_type_arguments}</h2>
<p>本节你将添加一个修改版的泛型函数调用，通过微小的调整简化调用代码。我们将移除在当前场景中不必要的类型参数。</p>
<p>当Go编译器能够推断出你想要使用的类型时，你可以在调用代码中省略类型参数。编译器会根据函数参数的类型推断类型参数。</p>
<p>请注意这并非总是可行。例如，如果需要调用一个没有参数的泛型函数，就必须在函数调用中包含类型参数。</p>
<h4>编写代码</h4>
<ul>
<li>在main.go文件中，在已有代码下方粘贴以下代码。    ```<br>fmt.Printf(&quot;Generic Sums, type parameters inferred: %v and %v\n&quot;,<br>SumIntsOrFloats(ints),<br>SumIntsOrFloats(floats))<pre><code>
</code></pre>
</li>
</ul>
<p>在这段代码中，你：</p>
<p>• 调用泛型函数（generic function），但省略了类型参数（type arguments）。</p>
<h4>运行代码</h4>
<p>在命令行中，进入包含 <code>main.go</code> 的目录，运行该代码。```<br>$ go run .<br>Non-Generic Sums: 46 and 62.97<br>Generic Sums: 46 and 62.97<br>Generic Sums, type parameters inferred: 46 and 62.97</p>
<pre><code>接下来，你将通过把整数和浮点数的并集捕获到一个可复用的类型约束中，进一步简化该函数，这样你就能在其他代码中使用它。

## 声明类型约束 {#declare_type_constraint}

在最后这一节中，你将把之前定义的约束移到它自己的接口中，以便在多个地方复用它。以这种方式声明约束有助于简化代码，特别是在约束较为复杂的时候。

你可以将 _类型约束_ 声明为一个接口。该约束允许任何实现了该接口的类型。例如，如果你声明了一个具有三个方法的类型约束接口，然后在泛型函数中将其与类型参数一起使用，那么用于调用该函数的类型参数必须拥有所有这些方法。

约束接口也可以引用特定的类型，正如你将在本节中看到的那样。

#### 编写代码

1. 在 `main` 函数的正上方、导入语句之后，粘贴以下代码以声明一个类型约束。    ```
    type Number interface {
        int64 | float64
    }
    ```
在这段代码中，你：

    *   声明 `Number` 接口类型作为类型约束。
    *   在接口内部声明 `int64` 和 `float64` 的联合类型。

        本质上，你是将联合类型从函数声明移至新的类型约束中。这样，当你需要将类型参数限制为 `int64` 或 `float64` 时，就可以直接使用 `Number` 类型约束，而无需重复书写 `int64 | float64`。

2. 在已有函数下方，粘贴以下泛型函数 `SumNumbers`：    ```
    // SumNumbers sums the values of map m. It supports both integers
    // and floats as map values.
    func SumNumbers[K comparable, V Number](m map[K]V) V {
        var s V
        for _, v := range m {
            s += v
        }
        return s
    }
    ```
在这段代码中，您需要：

    *   声明一个泛型函数，其逻辑与之前声明的泛型函数相同，但使用新的接口类型（而非联合类型）作为类型约束。与之前一样，参数和返回类型使用类型参数。

3. 在 main.go 文件中，在已有代码下方粘贴以下代码。    ```
    fmt.Printf(&quot;Generic Sums with Constraint: %v and %v\n&quot;,
        SumNumbers(ints),
        SumNumbers(floats))
    ```
在这段代码中，您将：

*   对每个映射（map）调用 `SumNumbers` 函数，并打印其所有值的总和。

    如同前面章节所示，您在调用泛型函数时省略了类型参数（即方括号中的类型名）。Go 编译器能够从其他参数推断出类型参数。

#### 运行代码

请在命令行中，切换到包含 main.go 文件的目录，然后运行代码。```
$ go run .
Non-Generic Sums: 46 and 62.97
Generic Sums: 46 and 62.97
Generic Sums, type parameters inferred: 46 and 62.97
Generic Sums with Constraint: 46 and 62.97
</code></pre>
<h2>结论 {#conclusion}</h2>
<p>做得很好！你已经初步了解了 Go 语言中的泛型。</p>
<p>推荐的后续学习主题：</p>
<ul>
<li><a href="/tour/">Go 之旅</a> 是学习 Go 语言基础知识的循序渐进式教程。</li>
<li>你可以在 <a href="/doc/effective_go">高效 Go 编程</a> 和 <a href="/doc/code">如何编写 Go 代码</a> 中找到实用的 Go 最佳实践。</li>
</ul>
<h2>完整的代码 {#completed_code}</h2>
<!--TODO: Update text and link after release.-->
<p>你可以在 <a href="/play/p/apNmfVwogK0?v=gotip">Go 演练场</a> 中运行这个程序。在演练场中，只需点击 <strong>运行</strong> 按钮即可。</p>

    </article>
  </main>

  <footer class="footer">
    <div class="container">
      <p>Go 语言官方文档中文版 - 基于 <a href="https://go.dev/doc/">go.dev/doc</a> 翻译</p>
    </div>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>