<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>web-service-gin - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
  "Title": "教程：使用 Go 和 Gin 开发 RESTful API",
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
  "Title": "教程：使用 Go 和 Gin 开发 RESTful API",
  "Breadcrumb": true
}-->

<p>本教程介绍如何使用 Go 和 <a href="https://gin-gonic.com/en/docs/">Gin Web 框架</a>（Gin）编写 RESTful Web 服务 API 的基础知识。</p>
<p>如果您对 Go 及其工具链有基本了解，将能从本教程中获得最佳学习效果。如果这是您首次接触 Go，请参阅<a href="/doc/tutorial/getting-started">教程：Go 入门</a>获取快速入门指导。</p>
<p>Gin 简化了许多与构建 Web 应用程序（包括 Web 服务）相关的编码任务。在本教程中，您将使用 Gin 来路由请求、获取请求详情，并将响应数据编码为 JSON 格式。</p>
<p>在本教程中，您将构建一个具有两个端点的 RESTful API 服务器。示例项目将是一个存储复古爵士唱片数据的仓库。</p>
<p>本教程包含以下部分：</p>
<ol>
<li>设计 API 端点。</li>
<li>创建代码文件夹。</li>
<li>创建数据。</li>
<li>编写处理程序以返回所有项目。</li>
<li>编写处理程序以添加新项目。</li>
<li>编写处理程序以返回特定项目。</li>
</ol>
<p><strong>注意：</strong> 其他教程请参阅<a href="/doc/tutorial/index.html">教程列表</a>。</p>
<p>如需在 Google Cloud Shell 中完成此交互式教程，请点击下方按钮。</p>
<p><a href="https://ide.cloud.google.com/?cloudshell_workspace=~&walkthrough_tutorial_url=https://raw.githubusercontent.com/golang/tour/master/tutorial/web-service-gin.md"><img src="https://gstatic.com/cloudssh/images/open-btn.png" alt="在 Cloud Shell 中打开"></a></p>
<h2>前提条件</h2>
<ul>
<li><strong>Go 1.16 或更高版本。</strong> 安装说明请参阅<a href="/doc/install">安装 Go</a>。</li>
<li><strong>代码编辑工具。</strong> 您拥有的任何文本编辑器均可使用。</li>
<li><strong>命令行终端。</strong> Go 在 Linux 和 Mac 的任何终端上均可良好运行，在 Windows 上可使用 PowerShell 或 cmd。</li>
<li><strong>curl 工具。</strong> 在 Linux 和 Mac 上通常已预装。在 Windows 上，自 Windows 10 Insider build 17063 及更高版本起已包含此工具。对于较早的 Windows 版本，您可能需要自行安装。更多信息请参阅 <a href="https://docs.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows">Tar 和 Curl 登陆 Windows</a>。</li>
</ul>
<h2>设计 API 端点 {#design_endpoints}</h2>
<p>您将构建一个提供复古黑胶唱片销售商店访问权限的 API。因此需要提供端点，以便客户端可以获取和为用户添加专辑数据。</p>
<p>开发 API 时，通常从设计端点开始。如果端点易于理解，API 用户将更容易成功使用。</p>
<p>以下是您将在本教程中创建的端点：</p>
<p>/albums</p>
<ul>
<li><code>GET</code> – 获取所有专辑列表，以 JSON 格式返回。</li>
<li><code>POST</code> – 从以 JSON 格式发送的请求数据中添加新专辑。</li>
</ul>
<p>/albums/:id</p>
<ul>
<li><code>GET</code> – 通过 ID 获取专辑，以 JSON 格式返回专辑数据。</li>
</ul>
<p>接下来，您将为代码创建文件夹。</p>
<h2>创建代码文件夹 {#create_folder}</h2>
<p>首先，为您将要编写的代码创建一个项目。</p>
<ol>
<li><p>打开命令提示符并切换到主目录。</p>
<p> 在 Linux 或 Mac 上：    ```<br> $ cd</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在Windows上：    <code>    C:\&gt; cd %HOMEPATH%    </code><br>2. 使用命令行，请创建一个名为 web-service-gin 的代码目录。    <code>    $ mkdir web-service-gin     $ cd web-service-gin    </code><br>3. 创建模块以管理依赖项。</p>
<pre><code>运行 `go mod init` 命令，并指定代码所在模块的路径。    ```
$ go mod init example/web-service-gin
go: creating new go.mod: module example/web-service-gin
```
</code></pre>
<p>此命令会创建一个 go.mod 文件，你添加的依赖项将在此文件中列出以便追踪。关于如何通过模块路径为模块命名的更多信息，请参阅<a href="/doc/modules/managing-dependencies#naming_module">管理依赖项</a>。</p>
<p>接下来，你将设计用于处理数据的数据结构。</p>
<h2>创建数据 {#create_data}</h2>
<p>为简化本教程的演示流程，我们将数据存储在内存中。更典型的 API 通常会与数据库进行交互。</p>
<p>请注意，将数据存储在内存中意味着每次停止服务器时，专辑数据集将会丢失，重新启动后会再次创建。</p>
<h4>编写代码</h4>
<ol>
<li>使用文本编辑器，在 web-service 目录下创建一个名为 main.go 的文件。你将在此文件中编写 Go 代码。</li>
<li>在 main.go 文件的顶部粘贴以下包声明：    ```<br> package main<pre><code>
</code></pre>
</li>
</ol>
<p>一个独立程序（与库相对应）总是在 <code>main</code> 包中。</p>
<ol start="3">
<li><p>在 package 声明下方，粘贴以下 <code>album</code> 结构体的声明。你将用它来在内存中存储专辑数据。</p>
<p>结构体标签如 <code>json:&quot;artist&quot;</code> 指定了当结构体内容序列化为 JSON 时字段应使用的名称。若省略标签，JSON 会直接采用结构体的大写字段名——这种风格在 JSON 中并不常见。    ```<br> // album represents data about a record album.<br> type album struct {<br> ID     string  <code>json:&quot;id&quot;</code><br> Title  string  <code>json:&quot;title&quot;</code><br> Artist string  <code>json:&quot;artist&quot;</code><br> Price  float64 <code>json:&quot;price&quot;</code><br> }</p>
<pre><code>
</code></pre>
</li>
<li><p>在你刚刚添加的结构体声明下方，粘贴以下包含初始数据的 <code>album</code> 结构体切片。    ```<br> // albums slice to seed record album data.<br> var albums = []album{<br> {ID: &quot;1&quot;, Title: &quot;Blue Train&quot;, Artist: &quot;John Coltrane&quot;, Price: 56.99},<br> {ID: &quot;2&quot;, Title: &quot;Jeru&quot;, Artist: &quot;Gerry Mulligan&quot;, Price: 17.99},<br> {ID: &quot;3&quot;, Title: &quot;Sarah Vaughan and Clifford Brown&quot;, Artist: &quot;Sarah Vaughan&quot;, Price: 39.99},<br> }</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>接下来，你将编写代码来实现你的第一个端点。</p>
<h2>编写一个返回所有项目的处理函数 {#all_items}</h2>
<p>当客户端在 <code>GET /albums</code> 发起请求时，你需要以 JSON 格式返回所有的专辑数据。</p>
<p>为此，你将编写以下内容：</p>
<ul>
<li>准备响应数据的逻辑</li>
<li>将请求路径映射到你的处理逻辑的代码</li>
</ul>
<p>请注意，这与运行时的执行顺序相反，但你先添加依赖项，然后才是依赖这些项的代码。</p>
<h4>编写代码</h4>
<ol>
<li><p>在上一节你添加的结构体代码下方，粘贴以下代码以获取专辑列表。</p>
<p> 这个 <code>getAlbums</code> 函数从 <code>album</code> 结构体的切片（slice）创建 JSON，并将 JSON 写入响应中。    ```<br> // getAlbums responds with the list of all albums as JSON.<br> func getAlbums(c *gin.Context) {<br> c.IndentedJSON(http.StatusOK, albums)<br> }</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在此代码中，您：</p>
<pre><code>*   编写了一个 `getAlbums` 函数，该函数接收一个
    [`gin.Context`](https://pkg.go.dev/github.com/gin-gonic/gin#Context)
    参数。请注意，您可以为此函数指定任何名称——无论是 Gin 还是 Go 都不要求特定的函数命名格式。

    `gin.Context` 是 Gin 框架中最重要的部分。它承载请求详情、验证并序列化 JSON 等功能。（尽管名称相似，但它不同于 Go 内置的
    [`context`](/pkg/context/) 包。）

*   调用 [`Context.IndentedJSON`](https://pkg.go.dev/github.com/gin-gonic/gin#Context.IndentedJSON)
    将结构体序列化为 JSON 并添加到响应中。

    该函数的第一个参数是您希望发送给客户端的 HTTP 状态码。此处，您传递的是 `net/http` 包中的 [`StatusOK`](https://pkg.go.dev/net/http#StatusOK)
    常量，表示 `200 OK`。

    请注意，您可以将 `Context.IndentedJSON` 替换为调用
    [`Context.JSON`](https://pkg.go.dev/github.com/gin-gonic/gin#Context.JSON) 以发送更紧凑的 JSON。实际上，在调试时，带缩进的格式更易于使用，且大小差异通常很小。
</code></pre>
<ol start="2">
<li><p>在 main.go 文件顶部附近，<code>albums</code> 切片声明的正下方，粘贴以下代码，将处理函数分配给端点路径。</p>
<p> 这将建立关联，使 <code>getAlbums</code> 处理对 <code>/albums</code> 端点路径的请求。    ```<br> func main() {<br> router := gin.Default()<br> router.GET(&quot;/albums&quot;, getAlbums)<br><br> router.Run(&quot;localhost:8080&quot;)<br> }</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在此代码中，您需要：</p>
<ul>
<li><p>使用 <a href="https://pkg.go.dev/github.com/gin-gonic/gin#Default"><code>Default</code></a> 初始化一个 Gin 路由器（router）。</p>
</li>
<li><p>使用 <a href="https://pkg.go.dev/github.com/gin-gonic/gin#RouterGroup.GET"><code>GET</code></a> 函数将 <code>GET</code> HTTP 方法和 <code>/albums</code> 路径与一个处理函数（handler function）关联起来。</p>
<p>请注意，您传递的是 <code>getAlbums</code> 函数的_名称_，而不是传递该函数的_结果_（后者需要使用 <code>getAlbums()</code> 并注意括号）。</p>
</li>
<li><p>使用 <a href="https://pkg.go.dev/github.com/gin-gonic/gin#Engine.Run"><code>Run</code></a> 函数将路由器附加到一个 <code>http.Server</code> 并启动服务器。</p>
</li>
</ul>
<ol start="3">
<li><p>在 main.go 文件顶部，包声明（package declaration）之下，导入您编写的代码所需的包。</p>
<p> 代码的开头几行应如下所示：    ```<br> package main</p>
<p> import (<br> &quot;net/http&quot;<br><br> &quot;github.com/gin-gonic/gin&quot;<br> )</p>
<pre><code>
</code></pre>
</li>
<li><p>保存 main.go 文件。</p>
</li>
</ol>
<h4>运行代码</h4>
<ol>
<li><p>开始将 Gin 模块作为依赖项进行跟踪。</p>
<p> 在命令行中，使用 <a href="/cmd/go/#hdr-Add_dependencies_to_current_module_and_install_them"><code>go get</code></a> 命令将 github.com/gin-gonic/gin 模块添加为您的模块的依赖项。<br> 使用点号（<code>.</code>）作为参数，表示&quot;获取当前目录中代码的依赖项&quot;。    ```<br> $ go get .<br> go get: added github.com/gin-gonic/gin v1.7.2</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>Go 语言已自动解析并下载了该依赖，以满足您在上一步骤中添加的 <code>import</code> 声明要求。</p>
<ol start="2">
<li>在包含 main.go 文件的目录中打开命令行，运行代码。使用点号参数表示“运行当前目录下的代码”。    ```<br> $ go run .<pre><code>
</code></pre>
</li>
</ol>
<p>一旦代码开始运行，你就有了一个正在运行的 HTTP 服务器，可以向它发送请求。</p>
<ol start="3">
<li>在新的命令行窗口中，使用 <code>curl</code> 向你正在运行的 Web 服务发送请求。    ```<br> $ curl <a href="http://localhost:8080/albums">http://localhost:8080/albums</a><pre><code>
</code></pre>
</li>
</ol>
<p>该命令应显示您为服务预置的数据。    <code>    [             {                     &quot;id&quot;: &quot;1&quot;,                     &quot;title&quot;: &quot;Blue Train&quot;,                     &quot;artist&quot;: &quot;John Coltrane&quot;,                     &quot;price&quot;: 56.99             },             {                     &quot;id&quot;: &quot;2&quot;,                     &quot;title&quot;: &quot;Jeru&quot;,                     &quot;artist&quot;: &quot;Gerry Mulligan&quot;,                     &quot;price&quot;: 17.99             },             {                     &quot;id&quot;: &quot;3&quot;,                     &quot;title&quot;: &quot;Sarah Vaughan and Clifford Brown&quot;,                     &quot;artist&quot;: &quot;Sarah Vaughan&quot;,                     &quot;price&quot;: 39.99             }     ]    </code><br>你已经启动了一个API！在下一节中，你将创建另一个端点（endpoint），编写代码来处理<code>POST</code>请求以添加一个项目。</p>
<h2>编写处理器以添加新项目 {#add_item}</h2>
<p>当客户端在 <code>/albums</code> 发出 <code>POST</code> 请求时，你需要将请求体中描述的专辑添加到现有的专辑数据中。</p>
<p>为此，你将需要编写以下内容：</p>
<ul>
<li>将新专辑添加到现有列表的逻辑。</li>
<li>一小段代码，用于将 <code>POST</code> 请求路由到你的逻辑。</li>
</ul>
<h4>编写代码</h4>
<ol>
<li><p>添加代码，将专辑数据添加到专辑列表中。</p>
<p>在 <code>import</code> 语句之后的某个位置，粘贴以下代码。（文件末尾是放置此代码的好位置，但 Go 不强制规定函数声明的顺序。）    ```<br>// postAlbums adds an album from JSON received in the request body.<br>func postAlbums(c *gin.Context) {<br>var newAlbum album<br><br>// Call BindJSON to bind the received JSON to<br>// newAlbum.<br>if err := c.BindJSON(&amp;newAlbum); err != nil {<br>    return<br>}<br><br>// Add the new album to the slice.<br>albums = append(albums, newAlbum)<br>c.IndentedJSON(http.StatusCreated, newAlbum)<br>}</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在这段代码中，您：</p>
<ul>
<li>使用 <a href="https://pkg.go.dev/github.com/gin-gonic/gin#Context.BindJSON"><code>Context.BindJSON</code></a> 方法将请求体绑定到 <code>newAlbum</code> 变量。</li>
<li>将基于 JSON 数据初始化的 <code>album</code> 结构体追加到 <code>albums</code> 切片中。</li>
<li>在响应中添加 <code>201</code> 状态码，同时以 JSON 格式返回所添加的相册信息。</li>
</ul>
<ol start="2">
<li>修改您的 <code>main</code> 函数，使其包含 <code>router.POST</code> 函数，如下所示：    ```<br> func main() {<br> router := gin.Default()<br> router.GET(&quot;/albums&quot;, getAlbums)<br> router.POST(&quot;/albums&quot;, postAlbums)<br><br> router.Run(&quot;localhost:8080&quot;)<br> }<pre><code>
</code></pre>
</li>
</ol>
<p>在以下代码中，您将：</p>
<ul>
<li><p>将 <code>/albums</code> 路径的 <code>POST</code> 方法关联到 <code>postAlbums</code> 函数。</p>
<p>使用 Gin 框架时，您可以将处理函数（handler）与特定的 HTTP 方法和路径组合进行关联。通过这种方式，您可以根据客户端使用的不同方法，对发送到同一路径的请求分别进行路由处理。</p>
</li>
</ul>
<h4>运行代码</h4>
<ol>
<li>如果上一部分的服务器仍在运行，请先将其停止。</li>
<li>在包含 <code>main.go</code> 文件的目录下，通过命令行运行代码。    ```<br> $ go run .<pre><code>
</code></pre>
</li>
<li>在另一个命令行窗口中，使用 <code>curl</code> 向正在运行的网络服务发送请求。    ```<br> $ curl <a href="http://localhost:8080/albums">http://localhost:8080/albums</a> <br> --include <br> --header &quot;Content-Type: application/json&quot; <br> --request &quot;POST&quot; <br> --data &#39;{&quot;id&quot;: &quot;4&quot;,&quot;title&quot;: &quot;The Modern Sound of Betty Carter&quot;,&quot;artist&quot;: &quot;Betty Carter&quot;,&quot;price&quot;: 49.99}&#39;<pre><code>
</code></pre>
</li>
</ol>
<p>该命令应显示添加的专辑的响应头信息和JSON数据。    ```<br>    HTTP/1.1 201 Created<br>    Content-Type: application/json; charset=utf-8<br>    Date: Wed, 02 Jun 2021 00:34:12 GMT<br>    Content-Length: 116</p>
<pre><code>{
    &quot;id&quot;: &quot;4&quot;,
    &quot;title&quot;: &quot;The Modern Sound of Betty Carter&quot;,
    &quot;artist&quot;: &quot;Betty Carter&quot;,
    &quot;price&quot;: 49.99
}
```
</code></pre>
<ol start="4">
<li>正如前面章节所述，使用 <code>curl</code> 命令获取完整的专辑列表，<br> 这可以用于验证新专辑是否已成功添加。    ```<br> $ curl <a href="http://localhost:8080/albums">http://localhost:8080/albums</a> <br> --header &quot;Content-Type: application/json&quot; <br> --request &quot;GET&quot;<pre><code>
</code></pre>
</li>
</ol>
<p>该命令应显示专辑列表。    <code>    [             {                     &quot;id&quot;: &quot;1&quot;,                     &quot;title&quot;: &quot;Blue Train&quot;,                     &quot;artist&quot;: &quot;John Coltrane&quot;,                     &quot;price&quot;: 56.99             },             {                     &quot;id&quot;: &quot;2&quot;,                     &quot;title&quot;: &quot;Jeru&quot;,                     &quot;artist&quot;: &quot;Gerry Mulligan&quot;,                     &quot;price&quot;: 17.99             },             {                     &quot;id&quot;: &quot;3&quot;,                     &quot;title&quot;: &quot;Sarah Vaughan and Clifford Brown&quot;,                     &quot;artist&quot;: &quot;Sarah Vaughan&quot;,                     &quot;price&quot;: 39.99             },             {                     &quot;id&quot;: &quot;4&quot;,                     &quot;title&quot;: &quot;The Modern Sound of Betty Carter&quot;,                     &quot;artist&quot;: &quot;Betty Carter&quot;,                     &quot;price&quot;: 49.99             }     ]    </code><br>在下一节中，你将添加代码来处理针对特定项目的 <code>GET</code> 请求。</p>
<h2>编写处理函数以返回特定项目 {#specific_item}</h2>
<p>当客户端向 <code>GET /albums/[id]</code> 发出请求时，你需要返回ID与路径参数 <code>id</code> 相匹配的专辑。</p>
<p>为此，你需要：</p>
<ul>
<li>添加逻辑以检索请求的专辑。</li>
<li>将路径映射到该逻辑。</li>
</ul>
<h4>编写代码</h4>
<ol>
<li><p>在上一部分你添加的 <code>postAlbums</code> 函数下方，粘贴以下代码以检索特定专辑。</p>
<p> 此 <code>getAlbumByID</code> 函数将提取请求路径中的ID，然后定位一个匹配的专辑。    ```<br> // getAlbumByID locates the album whose ID value matches the id<br> // parameter sent by the client, then returns that album as a response.<br> func getAlbumByID(c *gin.Context) {<br> id := c.Param(&quot;id&quot;)<br><br> // Loop over the list of albums, looking for<br> // an album whose ID value matches the parameter.<br> for _, a := range albums {<br>     if a.ID == id {<br>         c.IndentedJSON(http.StatusOK, a)<br>         return<br>     }<br> }<br> c.IndentedJSON(http.StatusNotFound, gin.H{&quot;message&quot;: &quot;album not found&quot;})<br> }</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在上述代码中，您需要：</p>
<ol>
<li>使用 <a href="https://pkg.go.dev/github.com/gin-gonic/gin#Context.Param"><code>Context.Param</code></a> 从 URL 中获取路径参数 <code>id</code>。当将该处理函数映射到路径时，您需要在路径中包含该参数的占位符。</li>
<li>遍历切片中的 <code>album</code> 结构体，寻找 <code>ID</code> 字段值与参数 <code>id</code> 值匹配的元素。如果找到，则将该 <code>album</code> 结构体序列化为 JSON，并将其作为响应返回，同时附带 <code>200 OK</code> 的 HTTP 状态码。<br>如上所述，实际应用中的服务可能会通过数据库查询来执行此查找操作。</li>
<li>如果未找到对应的专辑，则返回 HTTP <code>404</code> 错误，并使用 <a href="https://pkg.go.dev/net/http#StatusNotFound"><code>http.StatusNotFound</code></a> 作为状态码。</li>
</ol>
<p>最后，修改您的 <code>main</code> 函数，添加一个新的 <code>router.GET</code> 调用，路径现为 <code>/albums/:id</code>，如下例所示。    ```<br>    func main() {<br>        router := gin.Default()<br>        router.GET(&quot;/albums&quot;, getAlbums)<br>        router.GET(&quot;/albums/:id&quot;, getAlbumByID)<br>        router.POST(&quot;/albums&quot;, postAlbums)</p>
<pre><code>    router.Run(&quot;localhost:8080&quot;)
}
```
</code></pre>
<p>在这段代码中，你将：</p>
<ul>
<li>将 <code>/albums/:id</code> 路径关联到 <code>getAlbumByID</code> 函数。在 Gin 框架中，路径中冒号前缀的项目表示该项为路径参数。</li>
</ul>
<h4>运行代码</h4>
<ol>
<li>如果服务器仍在运行，请先停止它。</li>
<li>在命令行中，进入包含 main.go 文件的目录，运行代码以启动服务器。    ```<br> $ go run .<pre><code>
</code></pre>
</li>
<li>从另一个命令行窗口中，使用<code>curl</code>工具向运行中的Web服务发送请求。    ```<br> $ curl <a href="http://localhost:8080/albums/2">http://localhost:8080/albums/2</a><pre><code>
</code></pre>
</li>
</ol>
<p>该命令应显示你所使用ID对应的专辑的JSON数据。如果未找到该专辑，则会返回包含错误信息的JSON。    <code>    {             &quot;id&quot;: &quot;2&quot;,             &quot;title&quot;: &quot;Jeru&quot;,             &quot;artist&quot;: &quot;Gerry Mulligan&quot;,             &quot;price&quot;: 17.99     }    </code></p>
<h2>结论 {#conclusion}</h2>
<p>恭喜！您刚刚使用 Go 和 Gin 编写了一个简单的 RESTful 网络服务。</p>
<p>建议的后续学习主题：</p>
<ul>
<li>如果您是 Go 语言新手，可以在<a href="/doc/effective_go">高效Go编程</a>和<a href="/doc/code">如何编写Go代码</a>中找到实用的最佳实践指南。</li>
<li><a href="/tour/">Go 语言之旅</a>是一个循序渐进学习 Go 语言基础的优质教程。</li>
<li>如需了解更多关于 Gin 的内容，请参阅 <a href="https://pkg.go.dev/github.com/gin-gonic/gin">Gin Web 框架包文档</a>或 <a href="https://gin-gonic.com/en/docs/">Gin Web 框架文档</a>。</li>
</ul>
<h2>完整代码 {#completed_code}</h2>
<p>本节包含通过本教程构建的应用程序代码。```<br>package main</p>
<p>import (<br>    &quot;net/http&quot;</p>
<pre><code>&quot;github.com/gin-gonic/gin&quot;
</code></pre>
<p>)</p>
<p>// album represents data about a record album.<br>type album struct {<br>    ID     string  <code>json:&quot;id&quot;</code><br>    Title  string  <code>json:&quot;title&quot;</code><br>    Artist string  <code>json:&quot;artist&quot;</code><br>    Price  float64 <code>json:&quot;price&quot;</code><br>}</p>
<p>// albums slice to seed record album data.<br>var albums = []album{<br>    {ID: &quot;1&quot;, Title: &quot;Blue Train&quot;, Artist: &quot;John Coltrane&quot;, Price: 56.99},<br>    {ID: &quot;2&quot;, Title: &quot;Jeru&quot;, Artist: &quot;Gerry Mulligan&quot;, Price: 17.99},<br>    {ID: &quot;3&quot;, Title: &quot;Sarah Vaughan and Clifford Brown&quot;, Artist: &quot;Sarah Vaughan&quot;, Price: 39.99},<br>}</p>
<p>func main() {<br>    router := gin.Default()<br>    router.GET(&quot;/albums&quot;, getAlbums)<br>    router.GET(&quot;/albums/:id&quot;, getAlbumByID)<br>    router.POST(&quot;/albums&quot;, postAlbums)</p>
<pre><code>router.Run(&quot;localhost:8080&quot;)
</code></pre>
<p>}</p>
<p>// getAlbums responds with the list of all albums as JSON.<br>func getAlbums(c *gin.Context) {<br>    c.IndentedJSON(http.StatusOK, albums)<br>}</p>
<p>// postAlbums adds an album from JSON received in the request body.<br>func postAlbums(c *gin.Context) {<br>    var newAlbum album</p>
<pre><code>// Call BindJSON to bind the received JSON to
// newAlbum.
if err := c.BindJSON(&amp;newAlbum); err != nil {
    return
}

// Add the new album to the slice.
albums = append(albums, newAlbum)
c.IndentedJSON(http.StatusCreated, newAlbum)
</code></pre>
<p>}</p>
<p>// getAlbumByID locates the album whose ID value matches the id<br>// parameter sent by the client, then returns that album as a response.<br>func getAlbumByID(c *gin.Context) {<br>    id := c.Param(&quot;id&quot;)</p>
<pre><code>// Loop through the list of albums, looking for
// an album whose ID value matches the parameter.
for _, a := range albums {
    if a.ID == id {
        c.IndentedJSON(http.StatusOK, a)
        return
    }
}
c.IndentedJSON(http.StatusNotFound, gin.H{&quot;message&quot;: &quot;album not found&quot;})
</code></pre>
<p>}</p>
<pre><code>
</code></pre>

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