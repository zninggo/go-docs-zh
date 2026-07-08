<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>go_command - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
	"title": "关于go命令"
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
    "title": "关于go命令"
}-->

<p>Go 语言发行版包含一个名为
"<code><a href="/cmd/go/">go</a></code>"的命令，它可以自动完成Go语言包和命令的下载、构建、安装及测试。本文将讨论我们为何要编写这个新命令、它是什么、它不是什么以及如何使用它。</p>

<h2>设计初衷</h2>

<p>你可能看过Go语言早期的演讲，其中Rob Pike开玩笑说，Go语言的想法诞生于等待一个大型Google服务器编译的过程中。这确实是Go语言的真正动机：构建一种能高效构建和运行Google所编写和维护的大型软件的语言。从一开始就很清楚，这样的语言必须提供一种清晰表达代码库间依赖关系的方式，因此有了包分组和显式的导入语句块。同样从一开始就明确的是，你可能希望使用任意语法来描述要导入的代码；这就是为什么导入路径是字符串字面量。</p>

<p>Go语言从最初就确立的一个明确目标是：仅利用源代码本身的信息就能构建Go程序，无需编写Makefile或众多现代替代方案中的任何一种。如果Go需要一个配置文件来说明如何构建你的程序，那么Go就失败了。</p>

<p>最初并没有Go编译器，早期开发的重点是先构建一个编译器，然后再为其构建库。为了简便，我们通过使用make和编写Makefile推迟了Go代码构建自动化的工作。当时编译单个包需要多次调用Go编译器，我们甚至使用了一个程序来自动生成Makefile。如果你翻阅代码仓库的历史记录，还能找到它。</p>

<p>新的go命令旨在回归这一理想：Go程序应当能够编译，无需配置，开发者除了编写必要的导入语句外无需额外付出。</p>

<h2>配置与约定</h2>

<p>实现无配置系统简洁性的方法是建立约定。系统只有在这些约定得到遵守时才能有效运作。当我们最初发布Go时，很多人发布的包要求必须安装在特定位置、使用特定名称、借助特定构建工具才能使用。这可以理解：大多数其他语言就是这样工作的。过去几年里，我们不断提醒人们关于<code>goinstall</code>命令（现已被<a href="/cmd/go/#hdr-Download_and_install_packages_and_dependencies"><code>go get</code></a>取代）及其约定：首先，导入路径通过已知方式从源代码URL派生而来；其次，本地文件系统中存储源代码的位置通过已知方式从导入路径派生而来；第三，源代码树中的每个目录对应一个单独的包；第四，包的构建仅使用源代码中的信息。如今，绝大多数包都遵循这些约定。Go生态系统因此变得更加简洁和强大。</p>

<p>我们收到许多请求，希望在包目录中允许使用Makefile来提供除源代码之外的少量额外配置。但这会引入新的规则。由于我们没有同意这类请求，我们得以编写go命令，并消除了对make或其他任何构建系统的依赖。</p>

<p>重要的是要理解，go命令不是一个通用的构建工具。它不可配置，并且除了Go包之外不尝试构建其他任何东西。这些是重要的简化假设：它们不仅简化了实现，更重要的是，简化了工具本身的使用。</p>

<h2>Go语言的约定</h2>

<p><code>go</code>命令要求代码遵守一些关键的、成熟的约定。</p>

<p>首先，导入路径通过已知方式从源代码URL派生而来。对于Bitbucket、GitHub、Google Code和Launchpad，仓库的根目录由其主URL标识（不带<code>https://</code>前缀）。子目录则通过在该路径后追加名称来命名。
例如，Google日志包<code>glog</code>的源代码可通过运行以下命令获取：</p>

<pre>
git clone https://github.com/golang/glog
</pre>

<p>因此，<a href="https://pkg.go.dev/github.com/golang/glog">glog</a> 包的导入路径是&quot;<code>github.com/golang/glog</code>&quot;。</p></p>
<p>这些路径较长，但作为交换，我们获得了一个自动管理的导入路径命名空间，以及像go命令这样的工具能够根据一个陌生的导入路径推断出从何处获取源代码的能力。</p>

<p>其次，本地文件系统中存储源代码的位置通过已知方式从导入路径派生而来，具体为<code>$GOPATH/src/&lt;import-path&gt;</code>。
如果未设置，<code>$GOPATH</code>默认值为用户主目录下名为<code>go</code>的子目录。
如果<code>$GOPATH</code>设置为一系列路径，go命令会依次尝试每个目录下的<code>&lt;dir&gt;/src/&lt;import-path&gt;</code>。
</p>

<p>按照约定，这些源代码树中的每一个都包含一个名为"<code>bin</code>"的顶级目录（用于存放编译后的可执行文件）和一个名为"<code>pkg</code>"的顶级目录（用于存放可导入的编译后包），以及"<code>src</code>"目录（用于存放包源文件）。强制这种结构让我们能够使每个目录树保持自包含：编译后的产物和源代码总是彼此相邻。</p>

<p>这些命名约定也让我们能够反向工作，从目录名推导出其导入路径。这种映射对于go命令的许多子命令都很重要，我们将在下文中看到。</p>

<p>第三，源代码树中的每个目录对应一个单独的包。通过将一个目录限制为单个包，我们无需创建那种首先指定目录、然后再指定该目录内某个包的混合导入路径。此外，大多数文件管理工具和UI都以目录为基本单元。将Go的基本单元——包——与文件系统结构绑定，意味着文件系统工具就变成了Go包工具。复制、移动或删除一个包就对应于复制、移动或删除一个目录。</p>

<p>第四，每个包的构建仅使用源文件中存在的信息。这使得工具更有可能适应不断变化的构建环境和条件。例如，如果我们允许额外的配置，如编译器标志或命令行配方，那么每次构建工具改变时，该配置都需要更新；它也会固有地与特定工具链的使用绑定在一起。</p>

<h2>go命令入门</h2>

<p>最后，快速浏览一下如何使用go命令。
如上所述，在Unix系统上默认的<code>$GOPATH</code>是<code>$HOME/go</code>。
我们将把我们的程序存放在那里。
要使用其他位置，你可以设置<code>$GOPATH</code>；
详情请参见<a href="/doc/code.html">如何编写Go代码</a>。

<p>我们先添加一些源代码。假设我们想使用codesearch项目中的索引库以及一个左倾红黑树。我们可以使用"<code>go get</code>"子命令来安装它们：</p>

<pre>
$ go get github.com/google/codesearch/index
$ go get github.com/petar/GoLLRB/llrb
$
</pre>

<p>这两个项目现在已被下载并安装到<code>$HOME/go</code>目录下，该目录包含了<code>src/github.com/google/codesearch/index/</code>和<code>src/github.com/petar/GoLLRB/llrb/</code>两个目录，以及这些库及其依赖项的编译后包（在<code>pkg/</code>目录下）。</p>

<p>由于我们使用版本控制系统（Mercurial 和 Git）来检出源代码，因此源代码树也包含了相应仓库中的其他文件，例如相关的包。"<code>go list</code>" 子命令会列出其参数对应的导入路径（import path），而模式 "<code>./...</code>" 表示从当前目录（"<code>./</code>"）开始，查找该目录下的所有包（"<code>...</code>"）：</p>

<pre>
$ cd $HOME/go/src
$ go list ./...
github.com/google/codesearch/cmd/cgrep
github.com/google/codesearch/cmd/cindex
github.com/google/codesearch/cmd/csearch
github.com/google/codesearch/index
github.com/google/codesearch/regexp
github.com/google/codesearch/sparse
github.com/petar/GoLLRB/example
github.com/petar/GoLLRB/llrb
$
</pre>

<p>我们也可以测试这些包：</p>

<pre>
$ go test ./...
?   	github.com/google/codesearch/cmd/cgrep	[no test files]
?   	github.com/google/codesearch/cmd/cindex	[no test files]
?   	github.com/google/codesearch/cmd/csearch	[no test files]
ok  	github.com/google/codesearch/index	0.203s
ok  	github.com/google/codesearch/regexp	0.017s
?   	github.com/google/codesearch/sparse	[no test files]
?       github.com/petar/GoLLRB/example          [no test files]
ok      github.com/petar/GoLLRB/llrb             0.231s
$
</pre>

<p>如果在调用 go 子命令时没有列出路径参数，它将在当前目录下操作：</p>

<pre>
$ cd github.com/google/codesearch/regexp
$ go list
github.com/google/codesearch/regexp
$ go test -v
=== RUN   TestNstateEnc
--- PASS: TestNstateEnc (0.00s)
=== RUN   TestMatch
--- PASS: TestMatch (0.00s)
=== RUN   TestGrep
--- PASS: TestGrep (0.00s)
PASS
ok  	github.com/google/codesearch/regexp	0.018s
$ go install
$
</pre>

<p>这里的 "<code>go install</code>" 子命令会将包的最新副本安装到 pkg 目录。由于 go 命令能够分析依赖关系图，因此 "<code>go install</code>" 也会递归地安装此包导入的、但已过时的任何其他包。</p>

<p>请注意，"<code>go install</code>" 能够根据目录命名的约定，自动确定当前目录中包的导入路径名称。如果我们能自由选择存放源代码的目录名，可能会更方便一些，而且我们可能也不会选择如此长的名字，但这种能力需要在工具中增加额外的配置和复杂性。为了换取更高的简洁性和更强大的功能，多输入一两个目录名是一个很小的代价。</p>

<h2>限制</h2>

<p>如前所述，go 命令并非一个通用构建工具。
特别是，它不具备在构建过程中生成 Go 源文件的能力，尽管它提供了
<a href="/cmd/go/#hdr-Generate_Go_files_by_processing_source"><code>go</code>
<code>generate</code></a>，
该功能可以在构建<em>之前</em>自动化创建 Go 文件。
对于更高级的构建设置，你可能需要编写一个
makefile（或你选择的构建工具的配置文件）
来运行任何创建 Go 文件的工具，然后将这些生成的源文件
检入你的仓库。这对于作为包作者的你来说，工作量更大，
但对于你的用户来说，工作量则显著减少，因为他们可以使用
"<code>go get</code>" 而无需获取和构建任何额外的工具。</p>

<h2>更多信息</h2>

<p>欲了解更多，请阅读<a href="/doc/code.html">如何编写 Go 代码</a>，并查看<a href="/cmd/go/">go 命令文档</a>。</p>
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