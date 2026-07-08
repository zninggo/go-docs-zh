<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>database-access - Go 语言官方文档中文版</title>
  <meta name="description" content="<!--{
  "Title": "教程：访问关系数据库",
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
  "Title": "教程：访问关系数据库",
  "Breadcrumb": true
}-->

<p>本教程介绍使用Go语言及其标准库中的<code>database/sql</code>包访问关系数据库的基础知识。</p>
<p>若您对Go语言及其工具链有基本了解，将能从本教程中获得最大收益。如果您是Go语言初学者，请先参阅<a href="/doc/tutorial/getting-started">教程：Go语言入门</a>进行快速学习。</p>
<p>您将使用的<a href="https://pkg.go.dev/database/sql"><code>database/sql</code></a>包包含用于连接数据库、执行事务、取消进行中的操作等功能的类型与函数。关于该包的详细用法，请参阅<a href="/doc/database/index">访问数据库</a>。</p>
<p>在本教程中，您将先创建数据库，然后编写代码来访问该数据库。示例项目将是一个存储复古爵士唱片信息的数据库仓库。</p>
<p>本教程将包含以下章节：</p>
<ol>
<li>创建代码文件夹</li>
<li>设置数据库</li>
<li>导入数据库驱动</li>
<li>获取数据库连接句柄并建立连接</li>
<li>查询多行数据</li>
<li>查询单行数据</li>
<li>添加数据</li>
</ol>
<p><strong>注意：</strong> 其他教程请参见<a href="/doc/tutorial/index.html">教程目录</a>。</p>
<h2>前提条件 {#prerequisites}</h2>
<ul>
<li><strong>已安装<a href="https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/">MySQL</a>关系数据库管理系统(DBMS)</strong></li>
<li><strong>已安装Go语言</strong>。安装说明请参见<a href="/doc/install">安装Go</a></li>
<li><strong>代码编辑工具</strong>。任何文本编辑器均可使用</li>
<li><strong>命令行终端</strong>。在Linux和Mac系统上可使用任意终端，在Windows上建议使用PowerShell或cmd</li>
</ul>
<h2>创建代码文件夹 {#create_folder}</h2>
<p>首先为即将编写的代码创建文件夹。</p>
<ol>
<li><p>打开命令行提示符并切换到主目录</p>
<p> 在Linux或Mac系统上：    ```<br> $ cd</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在 Windows 上：    <code>    C:\&gt; cd %HOMEPATH%    </code><br>在本教程的后续部分，我们将会使用 $ 作为命令行提示符。我们使用的命令在 Windows 上同样适用。</p>
<ol start="2">
<li><p>在命令行中，创建一个名为 <code>data-access</code> 的代码目录。    ```<br> $ mkdir data-access<br> $ cd data-access</p>
<pre><code>
</code></pre>
</li>
<li><p>创建一个模块，用于管理本教程后续将添加的依赖项。</p>
<p> 运行 <code>go mod init</code> 命令，并为新代码指定模块路径。    ```<br> $ go mod init example/data-access<br> go: creating new go.mod: module example/data-access</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>此命令会创建一个 go.mod 文件，后续添加的依赖项都会在此文件中列出以便跟踪。更多详细信息，请参阅<a href="/doc/modules/managing-dependencies">依赖管理</a>。</p>
<p><strong>注意：</strong> 在实际开发中，您需要指定一个更符合自身需求的模块路径。更多信息请参阅<a href="/doc/modules/managing-dependencies#naming_module">依赖管理</a>。</p>
<p>接下来，您将创建一个数据库。</p>
<h2>设置数据库 {#set_up_database}</h2>
<p>在本步骤中，您将创建需要操作的数据库。您将使用数据库管理系统（DBMS）自带的命令行界面（CLI）来创建数据库、表并添加数据。</p>
<p>您将创建的数据库包含关于黑胶唱片上复古爵士乐录音的数据。</p>
<p>此处代码使用的是 <a href="https://dev.mysql.com/doc/refman/8.0/en/mysql.html">MySQL 命令行客户端</a>，但大多数 DBMS 都具备功能相似的 CLI 工具。</p>
<ol>
<li><p>打开新的命令行窗口。</p>
</li>
<li><p>在命令行中登录您的 DBMS，以下是 MySQL 的示例。    ```<br> $ mysql -u root -p<br> Enter password:</p>
<p> mysql&gt;</p>
<pre><code>
</code></pre>
</li>
<li><p>在 <code>mysql</code> 命令提示符下，创建一个数据库。    ```<br> mysql&gt; create database recordings;</p>
<pre><code>
</code></pre>
</li>
<li><p>切换到刚创建的数据库，以便添加表。    ```<br> mysql&gt; use recordings;<br> Database changed</p>
<pre><code>
</code></pre>
</li>
<li><p>在文本编辑器中，进入 data-access 文件夹，创建一个名为 create-tables.sql 的文件，用于保存添加表的 SQL 脚本。</p>
</li>
<li><p>将以下 SQL 代码粘贴到文件中，然后保存文件。    ```<br> DROP TABLE IF EXISTS album;<br> CREATE TABLE album (<br>   id         INT AUTO_INCREMENT NOT NULL,<br>   title      VARCHAR(128) NOT NULL,<br>   artist     VARCHAR(255) NOT NULL,<br>   price      DECIMAL(5,2) NOT NULL,<br>   PRIMARY KEY (<code>id</code>)<br> );</p>
<p> INSERT INTO album<br>   (title, artist, price)<br> VALUES<br>   (&#39;Blue Train&#39;, &#39;John Coltrane&#39;, 56.99),<br>   (&#39;Giant Steps&#39;, &#39;John Coltrane&#39;, 63.99),<br>   (&#39;Jeru&#39;, &#39;Gerry Mulligan&#39;, 17.99),<br>   (&#39;Sarah Vaughan&#39;, &#39;Sarah Vaughan&#39;, 34.98);</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>这段 SQL 代码中，您将：</p>
<pre><code>*   删除（drop）名为 `album` 的表。首先执行此命令可以便于您后续重新运行脚本，并从头开始创建该表。

*   创建一个包含四列的 `album` 表：`title`、`artist` 和 `price`。每行的 `id` 值将由数据库管理系统自动生成。

*   添加四行数据。
</code></pre>
<ol start="7">
<li><p>在 <code>mysql</code> 命令提示符下，运行您刚刚创建的脚本。</p>
<p> 您将使用如下形式的 <code>source</code> 命令：    ```<br> mysql&gt; source /path/to/create-tables.sql</p>
<pre><code>
</code></pre>
</li>
<li><p>在您的DBMS命令提示符下，使用<code>SELECT</code>语句来验证您已成功创建包含数据的表。    ```<br> mysql&gt; select * from album;<br> +----+---------------+----------------+-------+<br> | id | title         | artist         | price |<br> +----+---------------+----------------+-------+<br> |  1 | Blue Train    | John Coltrane  | 56.99 |<br> |  2 | Giant Steps   | John Coltrane  | 63.99 |<br> |  3 | Jeru          | Gerry Mulligan | 17.99 |<br> |  4 | Sarah Vaughan | Sarah Vaughan  | 34.98 |<br> +----+---------------+----------------+-------+<br> 4 rows in set (0.00 sec)</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>接下来，你将编写一些Go代码进行连接，以便进行查询。</p>
<h2>查找并导入数据库驱动 {#import_driver}</h2>
<p>现在你已拥有一个包含数据的数据库，可以开始编写Go代码了。</p>
<p>你需要找到并导入一个数据库驱动（database driver），该驱动会将你通过 <code>database/sql</code> 包中的函数发起的请求，转换为数据库能够理解的请求。</p>
<ol>
<li><p>在浏览器中访问 <a href="/wiki/SQLDrivers">SQLDrivers</a> 维基页面，以识别可用的驱动程序。</p>
<p> 使用页面上的列表来选择你将使用的驱动程序。本教程中访问MySQL时，你将使用 <a href="https://github.com/go-sql-driver/mysql/">Go-MySQL-Driver</a>。</p>
</li>
<li><p>记下该驱动程序的包名（package name）——此处为 <code>github.com/go-sql-driver/mysql</code>。</p>
</li>
<li><p>使用文本编辑器创建一个文件来编写Go代码，并将该文件保存为 <code>main.go</code>，存放在你之前创建的 <code>data-access</code> 目录中。</p>
</li>
<li><p>在 <code>main.go</code> 中粘贴以下代码以导入驱动程序包。    ```<br> package main</p>
<p> import &quot;github.com/go-sql-driver/mysql&quot;</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在此代码中，您将：</p>
<ul>
<li>将代码添加到 <code>main</code> 包中，以便可以独立执行。</li>
<li>导入 MySQL 驱动 <code>github.com/go-sql-driver/mysql</code>。</li>
</ul>
<p>驱动导入后，您将开始编写访问数据库的代码。</p>
<h2>获取数据库句柄并进行连接 {#get_handle}</h2>
<p>现在编写一些 Go 代码，通过数据库句柄让您能够访问数据库。</p>
<p>您将使用一个指向 <code>sql.DB</code> 结构体的指针，该结构体代表了对特定数据库的访问连接。</p>
<h4>编写代码</h4>
<ol>
<li><p>在 main.go 文件中，于刚刚添加的 <code>import</code> 代码下方，粘贴以下 Go 代码以创建一个数据库句柄。    ```<br>var db *sql.DB</p>
<p>func main() {<br>// Capture connection properties.<br>cfg := mysql.NewConfig()<br>cfg.User = os.Getenv(&quot;DBUSER&quot;)<br>cfg.Passwd = os.Getenv(&quot;DBPASS&quot;)<br>cfg.Net = &quot;tcp&quot;<br>cfg.Addr = &quot;127.0.0.1:3306&quot;<br>cfg.DBName = &quot;recordings&quot;<br><br>// Get a database handle.<br>var err error<br>db, err = sql.Open(&quot;mysql&quot;, cfg.FormatDSN())<br>if err != nil {<br>    log.Fatal(err)<br>}<br><br>pingErr := db.Ping()<br>if pingErr != nil {<br>    log.Fatal(pingErr)<br>}<br>fmt.Println(&quot;Connected!&quot;)<br>}</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在这段代码中，你完成了以下操作：</p>
<ul>
<li><p>声明了一个类型为 <a href="https://pkg.go.dev/database/sql#DB"><code>*sql.DB</code></a> 的变量 <code>db</code>。<br>这是你的数据库句柄。</p>
<p>将 <code>db</code> 设为全局变量简化了此示例。在生产环境中，你应该避免使用全局变量，例如将变量传递给需要它的函数，或者将其封装在结构体中。</p>
</li>
<li><p>使用了 MySQL 驱动的 <a href="https://pkg.go.dev/github.com/go-sql-driver/mysql#Config"><code>Config</code></a> 结构体及其 <a href="https://pkg.go.dev/github.com/go-sql-driver/mysql#Config.FormatDSN"><code>FormatDSN</code></a> 方法来收集连接属性，并将其格式化为连接字符串所需的 DSN。</p>
<p>使用 <code>Config</code> 结构体比直接使用连接字符串更容易阅读。</p>
</li>
<li><p>调用 <a href="https://pkg.go.dev/database/sql#Open"><code>sql.Open</code></a> 来初始化 <code>db</code> 变量，并传入 <code>FormatDSN</code> 的返回值。</p>
</li>
<li><p>检查 <code>sql.Open</code> 是否返回错误。例如，如果你的数据库连接配置格式不正确，它就可能失败。</p>
<p>为了简化代码，你调用了 <code>log.Fatal</code> 来终止执行并将错误打印到控制台。在生产代码中，你可能需要以更优雅的方式处理错误。</p>
</li>
<li><p>调用 <a href="https://pkg.go.dev/database/sql#DB.Ping"><code>DB.Ping</code></a> 来确认与数据库的连接是否正常。在运行时，<code>sql.Open</code> 可能不会立即建立连接，这取决于驱动程序。你在这里使用 <code>Ping</code> 来确认 <code>database/sql</code> 包在需要时能够连接。</p>
</li>
<li><p>检查 <code>Ping</code> 是否返回错误，以防连接失败。</p>
</li>
<li><p>如果 <code>Ping</code> 连接成功，则打印一条消息。</p>
</li>
</ul>
<ol start="2">
<li><p>在 main.go 文件的顶部，位于包声明下方，导入你刚才编写的代码所需支持的包。</p>
<p> 现在文件顶部应该看起来像这样：    ```<br> package main</p>
<p> import (<br> &quot;database/sql&quot;<br> &quot;fmt&quot;<br> &quot;log&quot;<br> &quot;os&quot;<br><br> &quot;github.com/go-sql-driver/mysql&quot;<br> )</p>
<pre><code>
</code></pre>
</li>
<li><p>保存 main.go 文件。</p>
</li>
</ol>
<h4>运行代码</h4>
<ol>
<li><p>开始追踪 MySQL 驱动模块作为依赖项。</p>
<p> 使用 <a href="/cmd/go/#hdr-Add_dependencies_to_current_module_and_install_them"><code>go get</code></a> 命令，将 <code>github.com/go-sql-driver/mysql</code> 模块添加为你自己模块的依赖项。使用点（<code>.</code>）作为参数，表示&quot;获取当前目录下代码的依赖项&quot;。    ```<br> $ go get .<br> go: added filippo.io/edwards25519 v1.1.0<br> go: added github.com/go-sql-driver/mysql v1.8.1</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>Go 下载了这个依赖，因为你在上一步的 <code>import</code> 声明中添加了它。关于依赖追踪的更多信息，请参阅<a href="/doc/modules/managing-dependencies#adding_dependency">添加依赖</a>。</p>
<ol start="2">
<li><p>在命令提示符中，为 Go 程序设置 <code>DBUSER</code> 和 <code>DBPASS</code> 环境变量。</p>
<p> 在 Linux 或 Mac 上：    ```<br> $ export DBUSER=username<br> $ export DBPASS=password</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在Windows上：    <code>    C:\Users\you\data-access&gt; set DBUSER=username     C:\Users\you\data-access&gt; set DBPASS=password    </code><br>3. 在命令行中进入包含 <code>main.go</code> 的目录，输入 <code>go run</code> 加上点号参数，表示“运行当前目录下的包（package）”。    <code>    $ go run .     Connected!    </code><br>能够成功连接了！接下来，您将执行数据查询操作。</p>
<h2>查询多行数据 {#multiple_rows}</h2>
<p>在本节中，您将使用 Go 语言执行一个用于返回多行数据的 SQL 查询。</p>
<p>对于可能返回多行结果的 SQL 语句，您需要使用 <code>database/sql</code> 包中的 <code>Query</code> 方法，然后循环遍历返回的结果行。（您将在后续章节 <a href="#single_row">查询单行数据</a> 中学习如何查询单行数据。）</p>
<h4>编写代码</h4>
<ol>
<li>在 main.go 文件中，定位到 <code>func main</code> 函数上方，粘贴以下 <code>Album</code> 结构体的定义。您将用它来保存查询返回的行数据。    ```<br> type Album struct {<br> ID     int64<br> Title  string<br> Artist string<br> Price  float32<br> }<pre><code>
</code></pre>
</li>
<li>在<code>func main</code>下方，粘贴以下<code>albumsByArtist</code>函数以查询数据库。    ```<br> // albumsByArtist queries for albums that have the specified artist name.<br> func albumsByArtist(name string) ([]Album, error) {<br> // An albums slice to hold data from returned rows.<br> var albums []Album<br><br> rows, err := db.Query(&quot;SELECT * FROM album WHERE artist = ?&quot;, name)<br> if err != nil {<br>     return nil, fmt.Errorf(&quot;albumsByArtist %q: %v&quot;, name, err)<br> }<br> defer rows.Close()<br> // Loop through rows, using Scan to assign column data to struct fields.<br> for rows.Next() {<br>     var alb Album<br>     if err := rows.Scan(&amp;alb.ID, &amp;alb.Title, &amp;alb.Artist, &amp;alb.Price); err != nil {<br>         return nil, fmt.Errorf(&quot;albumsByArtist %q: %v&quot;, name, err)<br>     }<br>     albums = append(albums, alb)<br> }<br> if err := rows.Err(); err != nil {<br>     return nil, fmt.Errorf(&quot;albumsByArtist %q: %v&quot;, name, err)<br> }<br> return albums, nil<br> }<pre><code>
</code></pre>
</li>
</ol>
<p>在这段代码中，您需要：</p>
<ul>
<li><p>声明一个您定义的 <code>Album</code> 类型的切片（slice）<code>albums</code>。它将用于存放从查询结果行中返回的数据。结构体（struct）的字段名和类型需与数据库列的名称和类型相对应。</p>
</li>
<li><p>使用 <a href="https://pkg.go.dev/database/sql#DB.Query"><code>DB.Query</code></a> 来执行一个 <code>SELECT</code> 语句，以查询具有指定艺术家名称的专辑。<br><code>Query</code> 函数的第一个参数是 SQL 语句。在该参数之后，您可以传递零个或多个任意类型的参数。这些参数为您提供了指定 SQL 语句中参数值的位置。通过将 SQL 语句与参数值分开（而不是通过 <code>fmt.Sprintf</code> 之类的方式拼接），您可以使 <code>database/sql</code> 包将参数值与 SQL 文本分开发送，从而消除任何 SQL 注入的风险。</p>
</li>
<li><p>使用 <code>defer</code> 延迟执行关闭 <code>rows</code> 的操作，以确保当函数退出时，它所持有的所有资源都能被释放。</p>
</li>
<li><p>循环遍历返回的结果行，使用 <a href="https://pkg.go.dev/database/sql#Rows.Scan"><code>Rows.Scan</code></a> 将每一行的列值赋给 <code>Album</code> 结构体的字段。<br><code>Scan</code> 函数接受一个指向 Go 值的指针（pointer）列表，列值将被写入这些指针指向的位置。这里，您传递的是使用 <code>&amp;</code> 操作符获取的 <code>alb</code> 变量中字段的指针。<code>Scan</code> 通过这些指针写入数据以更新结构体字段。</p>
</li>
<li><p>在循环内部，检查将列值扫描到结构体字段时是否发生错误。</p>
</li>
<li><p>在循环内部，将新的 <code>alb</code> 附加（append）到 <code>albums</code> 切片中。</p>
</li>
<li><p>循环结束后，使用 <code>rows.Err</code> 检查整体查询是否发生错误。请注意，如果查询本身失败，在这里检查错误是发现结果不完整的唯一方式。</p>
</li>
</ul>
<ol start="3">
<li>更新您的 <code>main</code> 函数以调用 <code>albumsByArtist</code>。<br>在 <code>func main</code> 的末尾添加以下代码。    ```<br>albums, err := albumsByArtist(&quot;John Coltrane&quot;)<br>if err != nil {<br>log.Fatal(err)<br>}<br>fmt.Printf(&quot;Albums found: %v\n&quot;, albums)<pre><code>
</code></pre>
</li>
</ol>
<p>在新代码中，现在您需要：</p>
<ul>
<li><p>调用您添加的 <code>albumsByArtist</code> 函数，并将其返回值赋给一个新的 <code>albums</code> 变量。</p>
</li>
<li><p>打印结果。</p>
</li>
</ul>
<h4>运行代码</h4>
<p>在命令行中，切换到包含 main.go 文件的目录，然后运行代码。```<br>$ go run .<br>Connected!<br>Albums found: [{1 Blue Train John Coltrane 56.99} {2 Giant Steps John Coltrane 63.99}]</p>
<pre><code>接下来，你将查询单行数据。

## 查询单行数据 {#single_row}

在本节中，你将使用Go语言从数据库中查询单行数据。

对于已知最多返回单行结果的SQL语句，你可以使用`QueryRow`函数，这比使用`Query`循环更简洁。

#### 编写代码

1. 在`albumsByArtist`函数下方，粘贴以下`albumByID`函数。    ```
    // albumByID queries for the album with the specified ID.
    func albumByID(id int64) (Album, error) {
        // An album to hold data from the returned row.
        var alb Album

        row := db.QueryRow(&quot;SELECT * FROM album WHERE id = ?&quot;, id)
        if err := row.Scan(&amp;alb.ID, &amp;alb.Title, &amp;alb.Artist, &amp;alb.Price); err != nil {
            if err == sql.ErrNoRows {
                return alb, fmt.Errorf(&quot;albumsById %d: no such album&quot;, id)
            }
            return alb, fmt.Errorf(&quot;albumsById %d: %v&quot;, id, err)
        }
        return alb, nil
    }
    ```
在这段代码中，您需要：

*   使用 [`DB.QueryRow`](https://pkg.go.dev/database/sql#DB.QueryRow) 来执行一条 `SELECT` 语句，以查询指定 ID 的专辑。
    它返回一个 `sql.Row`。为了简化调用代码（也就是您自己的代码！），`QueryRow` 并不返回错误。相反，它被设计为在稍后调用 `Rows.Scan` 时返回任何查询错误（例如 `sql.ErrNoRows`）。

*   使用 [`Row.Scan`](https://pkg.go.dev/database/sql#Row.Scan) 将列的值复制到结构体字段中。

*   检查 `Scan` 返回的错误。
    特殊的错误 `sql.ErrNoRows` 表示查询没有返回任何行。通常，这个错误值得被替换为更具体的文本，例如这里的 “no such album”（无此专辑）。

2. 更新 `main` 函数以调用 `albumByID`。
    在 `func main` 的末尾添加以下代码。    ```
    // Hard-code ID 2 here to test the query.
    alb, err := albumByID(2)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf(&quot;Album found: %v\n&quot;, alb)
    ```
在新的代码中，你现在需要：

    *   调用你添加的 `albumByID` 函数。
    *   打印返回的专辑 ID。

#### 运行代码

在包含 `main.go` 文件的目录下的命令行中，运行代码。```
$ go run .
Connected!
Albums found: [{1 Blue Train John Coltrane 56.99} {2 Giant Steps John Coltrane 63.99}]
Album found: {2 Giant Steps John Coltrane 63.99}
</code></pre>
<p>接下来，您将向数据库添加一张专辑。</p>
<h2>添加数据 {#add_data}</h2>
<p>在本节中，您将使用 Go 执行一条 SQL <code>INSERT</code> 语句，向数据库添加一行新数据。</p>
<p>您已经了解了如何使用 <code>Query</code> 和 <code>QueryRow</code> 处理会返回数据的 SQL 语句。要执行<em>不</em>返回数据的 SQL 语句，您需要使用 <code>Exec</code>。</p>
<h4>编写代码</h4>
<ol>
<li>在 <code>albumByID</code> 函数下方，粘贴以下 <code>addAlbum</code> 函数以向数据库插入新专辑数据，然后保存 main.go 文件。    ```<br> // addAlbum adds the specified album to the database,<br> // returning the album ID of the new entry<br> func addAlbum(alb Album) (int64, error) {<br> result, err := db.Exec(&quot;INSERT INTO album (title, artist, price) VALUES (?, ?, ?)&quot;, alb.Title, alb.Artist, alb.Price)<br> if err != nil {<br>     return 0, fmt.Errorf(&quot;addAlbum: %v&quot;, err)<br> }<br> id, err := result.LastInsertId()<br> if err != nil {<br>     return 0, fmt.Errorf(&quot;addAlbum: %v&quot;, err)<br> }<br> return id, nil<br> }<pre><code>
</code></pre>
</li>
</ol>
<p>在这段代码中，你需要：</p>
<ul>
<li><p>使用 <a href="https://pkg.go.dev/database/sql#DB.Exec"><code>DB.Exec</code></a> 来执行一条 <code>INSERT</code> 语句。</p>
<p>像 <code>Query</code> 一样，<code>Exec</code> 接受一个 SQL 语句，后面跟着该 SQL 语句所需的参数值。</p>
</li>
<li><p>检查执行 <code>INSERT</code> 操作时可能产生的错误。</p>
</li>
<li><p>使用 <a href="https://pkg.go.dev/database/sql#Result.LastInsertId"><code>Result.LastInsertId</code></a> 来获取已插入数据库行的 ID。</p>
</li>
<li><p>检查在尝试获取 ID 时可能产生的错误。</p>
</li>
</ul>
<ol start="2">
<li><p>更新 <code>main</code> 函数，以便调用新的 <code>addAlbum</code> 函数。</p>
<p> 在 <code>func main</code> 函数的末尾，添加以下代码。    ```<br> albID, err := addAlbum(Album{<br> Title:  &quot;The Modern Sound of Betty Carter&quot;,<br> Artist: &quot;Betty Carter&quot;,<br> Price:  49.99,<br> })<br> if err != nil {<br> log.Fatal(err)<br> }<br> fmt.Printf(&quot;ID of added album: %v\n&quot;, albID)</p>
<pre><code>
</code></pre>
</li>
</ol>
<p>在新的代码中，你现在需要：</p>
<ul>
<li>使用新专辑调用 <code>addAlbum</code> 函数，并将你正在添加的专辑 ID 赋值给 <code>albID</code> 变量。</li>
</ul>
<h4>运行代码</h4>
<p>在包含 main.go 文件的目录下，通过命令行运行代码。```<br>$ go run .<br>Connected!<br>Albums found: [{1 Blue Train John Coltrane 56.99} {2 Giant Steps John Coltrane 63.99}]<br>Album found: {2 Giant Steps John Coltrane 63.99}<br>ID of added album: 5</p>
<pre><code>## 结论 {#conclusion}

恭喜！您刚刚使用 Go 语言完成了对关系型数据库的简单操作。

推荐的后续学习主题：

*   查看数据访问指南，其中包含了更多关于本章仅略作触及的主题的信息。

*   如果您是 Go 语言新手，可以在[《Effective Go》](/doc/effective_go)和[《如何编写 Go 代码》](/doc/code)中找到实用的最佳实践。

*   [Go 之旅](/tour/)是逐步学习 Go 语言基础的极佳资源。

## 完整代码 {#completed_code}

本章节包含您通过本教程构建的应用程序代码。```
package main

import (
    &quot;database/sql&quot;
    &quot;fmt&quot;
    &quot;log&quot;
    &quot;os&quot;

    &quot;github.com/go-sql-driver/mysql&quot;
)

var db *sql.DB

type Album struct {
    ID     int64
    Title  string
    Artist string
    Price  float32
}

func main() {
    // Capture connection properties.
    cfg := mysql.NewConfig()
    cfg.User = os.Getenv(&quot;DBUSER&quot;)
    cfg.Passwd = os.Getenv(&quot;DBPASS&quot;)
    cfg.Net = &quot;tcp&quot;
    cfg.Addr = &quot;127.0.0.1:3306&quot;
    cfg.DBName = &quot;recordings&quot;

    // Get a database handle.
    var err error
    db, err = sql.Open(&quot;mysql&quot;, cfg.FormatDSN())
    if err != nil {
        log.Fatal(err)
    }

    pingErr := db.Ping()
    if pingErr != nil {
        log.Fatal(pingErr)
    }
    fmt.Println(&quot;Connected!&quot;)

    albums, err := albumsByArtist(&quot;John Coltrane&quot;)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf(&quot;Albums found: %v\n&quot;, albums)

    // Hard-code ID 2 here to test the query.
    alb, err := albumByID(2)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf(&quot;Album found: %v\n&quot;, alb)

    albID, err := addAlbum(Album{
        Title:  &quot;The Modern Sound of Betty Carter&quot;,
        Artist: &quot;Betty Carter&quot;,
        Price:  49.99,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf(&quot;ID of added album: %v\n&quot;, albID)
}

// albumsByArtist queries for albums that have the specified artist name.
func albumsByArtist(name string) ([]Album, error) {
    // An albums slice to hold data from returned rows.
    var albums []Album

    rows, err := db.Query(&quot;SELECT * FROM album WHERE artist = ?&quot;, name)
    if err != nil {
        return nil, fmt.Errorf(&quot;albumsByArtist %q: %v&quot;, name, err)
    }
    defer rows.Close()
    // Loop through rows, using Scan to assign column data to struct fields.
    for rows.Next() {
        var alb Album
        if err := rows.Scan(&amp;alb.ID, &amp;alb.Title, &amp;alb.Artist, &amp;alb.Price); err != nil {
            return nil, fmt.Errorf(&quot;albumsByArtist %q: %v&quot;, name, err)
        }
        albums = append(albums, alb)
    }
    if err := rows.Err(); err != nil {
        return nil, fmt.Errorf(&quot;albumsByArtist %q: %v&quot;, name, err)
    }
    return albums, nil
}

// albumByID queries for the album with the specified ID.
func albumByID(id int64) (Album, error) {
    // An album to hold data from the returned row.
    var alb Album

    row := db.QueryRow(&quot;SELECT * FROM album WHERE id = ?&quot;, id)
    if err := row.Scan(&amp;alb.ID, &amp;alb.Title, &amp;alb.Artist, &amp;alb.Price); err != nil {
        if err == sql.ErrNoRows {
            return alb, fmt.Errorf(&quot;albumsById %d: no such album&quot;, id)
        }
        return alb, fmt.Errorf(&quot;albumsById %d: %v&quot;, id, err)
    }
    return alb, nil
}

// addAlbum adds the specified album to the database,
// returning the album ID of the new entry
func addAlbum(alb Album) (int64, error) {
    result, err := db.Exec(&quot;INSERT INTO album (title, artist, price) VALUES (?, ?, ?)&quot;, alb.Title, alb.Artist, alb.Price)
    if err != nil {
        return 0, fmt.Errorf(&quot;addAlbum: %v&quot;, err)
    }
    id, err := result.LastInsertId()
    if err != nil {
        return 0, fmt.Errorf(&quot;addAlbum: %v&quot;, err)
    }
    return id, nil
}
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