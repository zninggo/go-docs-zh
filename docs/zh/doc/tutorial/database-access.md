<!--{
  "Title": "教程：访问关系数据库",
  "Breadcrumb": true
}-->

本教程介绍使用Go语言及其标准库中的`database/sql`包访问关系数据库的基础知识。

若您对Go语言及其工具链有基本了解，将能从本教程中获得最大收益。如果您是Go语言初学者，请先参阅[教程：Go语言入门](/doc/tutorial/getting-started)进行快速学习。

您将使用的[`database/sql`](https://pkg.go.dev/database/sql)包包含用于连接数据库、执行事务、取消进行中的操作等功能的类型与函数。关于该包的详细用法，请参阅[访问数据库](/doc/database/index)。

在本教程中，您将先创建数据库，然后编写代码来访问该数据库。示例项目将是一个存储复古爵士唱片信息的数据库仓库。

本教程将包含以下章节：

1. 创建代码文件夹
2. 设置数据库
3. 导入数据库驱动
4. 获取数据库连接句柄并建立连接
5. 查询多行数据
6. 查询单行数据
7. 添加数据

**注意：** 其他教程请参见[教程目录](/doc/tutorial/index.html)。

## 前提条件 {#prerequisites}

*   **已安装[MySQL](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/)关系数据库管理系统(DBMS)**
*   **已安装Go语言**。安装说明请参见[安装Go](/doc/install)
*   **代码编辑工具**。任何文本编辑器均可使用
*   **命令行终端**。在Linux和Mac系统上可使用任意终端，在Windows上建议使用PowerShell或cmd

## 创建代码文件夹 {#create_folder}

首先为即将编写的代码创建文件夹。

1. 打开命令行提示符并切换到主目录

    在Linux或Mac系统上：    ```
    $ cd
    ```
在 Windows 上：    ```
    C:\> cd %HOMEPATH%
    ```
在本教程的后续部分，我们将会使用 $ 作为命令行提示符。我们使用的命令在 Windows 上同样适用。

2. 在命令行中，创建一个名为 `data-access` 的代码目录。    ```
    $ mkdir data-access
    $ cd data-access
    ```
3. 创建一个模块，用于管理本教程后续将添加的依赖项。

    运行 `go mod init` 命令，并为新代码指定模块路径。    ```
    $ go mod init example/data-access
    go: creating new go.mod: module example/data-access
    ```
此命令会创建一个 go.mod 文件，后续添加的依赖项都会在此文件中列出以便跟踪。更多详细信息，请参阅[依赖管理](/doc/modules/managing-dependencies)。

**注意：** 在实际开发中，您需要指定一个更符合自身需求的模块路径。更多信息请参阅[依赖管理](/doc/modules/managing-dependencies#naming_module)。

接下来，您将创建一个数据库。

## 设置数据库 {#set_up_database}

在本步骤中，您将创建需要操作的数据库。您将使用数据库管理系统（DBMS）自带的命令行界面（CLI）来创建数据库、表并添加数据。

您将创建的数据库包含关于黑胶唱片上复古爵士乐录音的数据。

此处代码使用的是 [MySQL 命令行客户端](https://dev.mysql.com/doc/refman/8.0/en/mysql.html)，但大多数 DBMS 都具备功能相似的 CLI 工具。

1. 打开新的命令行窗口。
2. 在命令行中登录您的 DBMS，以下是 MySQL 的示例。    ```
    $ mysql -u root -p
    Enter password:

    mysql>
    ```
3. 在 `mysql` 命令提示符下，创建一个数据库。    ```
    mysql> create database recordings;
    ```
4. 切换到刚创建的数据库，以便添加表。    ```
    mysql> use recordings;
    Database changed
    ```
5. 在文本编辑器中，进入 data-access 文件夹，创建一个名为 create-tables.sql 的文件，用于保存添加表的 SQL 脚本。
6. 将以下 SQL 代码粘贴到文件中，然后保存文件。    ```
    DROP TABLE IF EXISTS album;
    CREATE TABLE album (
      id         INT AUTO_INCREMENT NOT NULL,
      title      VARCHAR(128) NOT NULL,
      artist     VARCHAR(255) NOT NULL,
      price      DECIMAL(5,2) NOT NULL,
      PRIMARY KEY (`id`)
    );

    INSERT INTO album
      (title, artist, price)
    VALUES
      ('Blue Train', 'John Coltrane', 56.99),
      ('Giant Steps', 'John Coltrane', 63.99),
      ('Jeru', 'Gerry Mulligan', 17.99),
      ('Sarah Vaughan', 'Sarah Vaughan', 34.98);
    ```
这段 SQL 代码中，您将：

    *   删除（drop）名为 `album` 的表。首先执行此命令可以便于您后续重新运行脚本，并从头开始创建该表。

    *   创建一个包含四列的 `album` 表：`title`、`artist` 和 `price`。每行的 `id` 值将由数据库管理系统自动生成。

    *   添加四行数据。

7. 在 `mysql` 命令提示符下，运行您刚刚创建的脚本。

    您将使用如下形式的 `source` 命令：    ```
    mysql> source /path/to/create-tables.sql
    ```
8. 在您的DBMS命令提示符下，使用`SELECT`语句来验证您已成功创建包含数据的表。    ```
    mysql> select * from album;
    +----+---------------+----------------+-------+
    | id | title         | artist         | price |
    +----+---------------+----------------+-------+
    |  1 | Blue Train    | John Coltrane  | 56.99 |
    |  2 | Giant Steps   | John Coltrane  | 63.99 |
    |  3 | Jeru          | Gerry Mulligan | 17.99 |
    |  4 | Sarah Vaughan | Sarah Vaughan  | 34.98 |
    +----+---------------+----------------+-------+
    4 rows in set (0.00 sec)
    ```
接下来，你将编写一些Go代码进行连接，以便进行查询。

## 查找并导入数据库驱动 {#import_driver}

现在你已拥有一个包含数据的数据库，可以开始编写Go代码了。

你需要找到并导入一个数据库驱动（database driver），该驱动会将你通过 `database/sql` 包中的函数发起的请求，转换为数据库能够理解的请求。

1. 在浏览器中访问 [SQLDrivers](/wiki/SQLDrivers) 维基页面，以识别可用的驱动程序。

    使用页面上的列表来选择你将使用的驱动程序。本教程中访问MySQL时，你将使用 [Go-MySQL-Driver](https://github.com/go-sql-driver/mysql/)。

2. 记下该驱动程序的包名（package name）——此处为 `github.com/go-sql-driver/mysql`。

3. 使用文本编辑器创建一个文件来编写Go代码，并将该文件保存为 `main.go`，存放在你之前创建的 `data-access` 目录中。

4. 在 `main.go` 中粘贴以下代码以导入驱动程序包。    ```
    package main

    import "github.com/go-sql-driver/mysql"
    ```
在此代码中，您将：

*   将代码添加到 `main` 包中，以便可以独立执行。
*   导入 MySQL 驱动 `github.com/go-sql-driver/mysql`。

驱动导入后，您将开始编写访问数据库的代码。

## 获取数据库句柄并进行连接 {#get_handle}

现在编写一些 Go 代码，通过数据库句柄让您能够访问数据库。

您将使用一个指向 `sql.DB` 结构体的指针，该结构体代表了对特定数据库的访问连接。

#### 编写代码

1.  在 main.go 文件中，于刚刚添加的 `import` 代码下方，粘贴以下 Go 代码以创建一个数据库句柄。    ```
    var db *sql.DB

    func main() {
    	// Capture connection properties.
    	cfg := mysql.NewConfig()
    	cfg.User = os.Getenv("DBUSER")
    	cfg.Passwd = os.Getenv("DBPASS")
    	cfg.Net = "tcp"
    	cfg.Addr = "127.0.0.1:3306"
    	cfg.DBName = "recordings"

    	// Get a database handle.
    	var err error
    	db, err = sql.Open("mysql", cfg.FormatDSN())
    	if err != nil {
    		log.Fatal(err)
    	}

    	pingErr := db.Ping()
    	if pingErr != nil {
    		log.Fatal(pingErr)
    	}
    	fmt.Println("Connected!")
    }
    ```
在这段代码中，你完成了以下操作：

*   声明了一个类型为 [`*sql.DB`](https://pkg.go.dev/database/sql#DB) 的变量 `db`。
    这是你的数据库句柄。

    将 `db` 设为全局变量简化了此示例。在生产环境中，你应该避免使用全局变量，例如将变量传递给需要它的函数，或者将其封装在结构体中。

*   使用了 MySQL 驱动的 [`Config`](https://pkg.go.dev/github.com/go-sql-driver/mysql#Config) 结构体及其 [`FormatDSN`](https://pkg.go.dev/github.com/go-sql-driver/mysql#Config.FormatDSN) 方法来收集连接属性，并将其格式化为连接字符串所需的 DSN。

    使用 `Config` 结构体比直接使用连接字符串更容易阅读。

*   调用 [`sql.Open`](https://pkg.go.dev/database/sql#Open) 来初始化 `db` 变量，并传入 `FormatDSN` 的返回值。

*   检查 `sql.Open` 是否返回错误。例如，如果你的数据库连接配置格式不正确，它就可能失败。

    为了简化代码，你调用了 `log.Fatal` 来终止执行并将错误打印到控制台。在生产代码中，你可能需要以更优雅的方式处理错误。

*   调用 [`DB.Ping`](https://pkg.go.dev/database/sql#DB.Ping) 来确认与数据库的连接是否正常。在运行时，`sql.Open` 可能不会立即建立连接，这取决于驱动程序。你在这里使用 `Ping` 来确认 `database/sql` 包在需要时能够连接。

*   检查 `Ping` 是否返回错误，以防连接失败。

*   如果 `Ping` 连接成功，则打印一条消息。

2. 在 main.go 文件的顶部，位于包声明下方，导入你刚才编写的代码所需支持的包。

    现在文件顶部应该看起来像这样：    ```
    package main

    import (
    	"database/sql"
    	"fmt"
    	"log"
    	"os"

    	"github.com/go-sql-driver/mysql"
    )
    ```
3. 保存 main.go 文件。

#### 运行代码

1. 开始追踪 MySQL 驱动模块作为依赖项。

    使用 [`go get`](/cmd/go/#hdr-Add_dependencies_to_current_module_and_install_them) 命令，将 `github.com/go-sql-driver/mysql` 模块添加为你自己模块的依赖项。使用点（`.`）作为参数，表示"获取当前目录下代码的依赖项"。    ```
    $ go get .
    go: added filippo.io/edwards25519 v1.1.0
    go: added github.com/go-sql-driver/mysql v1.8.1
    ```
Go 下载了这个依赖，因为你在上一步的 `import` 声明中添加了它。关于依赖追踪的更多信息，请参阅[添加依赖](/doc/modules/managing-dependencies#adding_dependency)。

2. 在命令提示符中，为 Go 程序设置 `DBUSER` 和 `DBPASS` 环境变量。

    在 Linux 或 Mac 上：    ```
    $ export DBUSER=username
    $ export DBPASS=password
    ```
在Windows上：    ```
    C:\Users\you\data-access> set DBUSER=username
    C:\Users\you\data-access> set DBPASS=password
    ```
3. 在命令行中进入包含 `main.go` 的目录，输入 `go run` 加上点号参数，表示“运行当前目录下的包（package）”。    ```
    $ go run .
    Connected!
    ```
能够成功连接了！接下来，您将执行数据查询操作。

## 查询多行数据 {#multiple_rows}

在本节中，您将使用 Go 语言执行一个用于返回多行数据的 SQL 查询。

对于可能返回多行结果的 SQL 语句，您需要使用 `database/sql` 包中的 `Query` 方法，然后循环遍历返回的结果行。（您将在后续章节 [查询单行数据](#single_row) 中学习如何查询单行数据。）

#### 编写代码

1. 在 main.go 文件中，定位到 `func main` 函数上方，粘贴以下 `Album` 结构体的定义。您将用它来保存查询返回的行数据。    ```
    type Album struct {
    	ID     int64
    	Title  string
    	Artist string
    	Price  float32
    }
    ```
2. 在`func main`下方，粘贴以下`albumsByArtist`函数以查询数据库。    ```
    // albumsByArtist queries for albums that have the specified artist name.
    func albumsByArtist(name string) ([]Album, error) {
    	// An albums slice to hold data from returned rows.
    	var albums []Album

    	rows, err := db.Query("SELECT * FROM album WHERE artist = ?", name)
    	if err != nil {
    		return nil, fmt.Errorf("albumsByArtist %q: %v", name, err)
    	}
    	defer rows.Close()
    	// Loop through rows, using Scan to assign column data to struct fields.
    	for rows.Next() {
    		var alb Album
    		if err := rows.Scan(&alb.ID, &alb.Title, &alb.Artist, &alb.Price); err != nil {
    			return nil, fmt.Errorf("albumsByArtist %q: %v", name, err)
    		}
    		albums = append(albums, alb)
    	}
    	if err := rows.Err(); err != nil {
    		return nil, fmt.Errorf("albumsByArtist %q: %v", name, err)
    	}
    	return albums, nil
    }
    ```
在这段代码中，您需要：

*   声明一个您定义的 `Album` 类型的切片（slice）`albums`。它将用于存放从查询结果行中返回的数据。结构体（struct）的字段名和类型需与数据库列的名称和类型相对应。

*   使用 [`DB.Query`](https://pkg.go.dev/database/sql#DB.Query) 来执行一个 `SELECT` 语句，以查询具有指定艺术家名称的专辑。
    `Query` 函数的第一个参数是 SQL 语句。在该参数之后，您可以传递零个或多个任意类型的参数。这些参数为您提供了指定 SQL 语句中参数值的位置。通过将 SQL 语句与参数值分开（而不是通过 `fmt.Sprintf` 之类的方式拼接），您可以使 `database/sql` 包将参数值与 SQL 文本分开发送，从而消除任何 SQL 注入的风险。

*   使用 `defer` 延迟执行关闭 `rows` 的操作，以确保当函数退出时，它所持有的所有资源都能被释放。

*   循环遍历返回的结果行，使用 [`Rows.Scan`](https://pkg.go.dev/database/sql#Rows.Scan) 将每一行的列值赋给 `Album` 结构体的字段。
    `Scan` 函数接受一个指向 Go 值的指针（pointer）列表，列值将被写入这些指针指向的位置。这里，您传递的是使用 `&` 操作符获取的 `alb` 变量中字段的指针。`Scan` 通过这些指针写入数据以更新结构体字段。

*   在循环内部，检查将列值扫描到结构体字段时是否发生错误。

*   在循环内部，将新的 `alb` 附加（append）到 `albums` 切片中。

*   循环结束后，使用 `rows.Err` 检查整体查询是否发生错误。请注意，如果查询本身失败，在这里检查错误是发现结果不完整的唯一方式。

3.  更新您的 `main` 函数以调用 `albumsByArtist`。
    在 `func main` 的末尾添加以下代码。    ```
    albums, err := albumsByArtist("John Coltrane")
    if err != nil {
    	log.Fatal(err)
    }
    fmt.Printf("Albums found: %v\n", albums)
    ```
在新代码中，现在您需要：

*   调用您添加的 `albumsByArtist` 函数，并将其返回值赋给一个新的 `albums` 变量。

*   打印结果。

#### 运行代码

在命令行中，切换到包含 main.go 文件的目录，然后运行代码。```
$ go run .
Connected!
Albums found: [{1 Blue Train John Coltrane 56.99} {2 Giant Steps John Coltrane 63.99}]
```
接下来，你将查询单行数据。

## 查询单行数据 {#single_row}

在本节中，你将使用Go语言从数据库中查询单行数据。

对于已知最多返回单行结果的SQL语句，你可以使用`QueryRow`函数，这比使用`Query`循环更简洁。

#### 编写代码

1. 在`albumsByArtist`函数下方，粘贴以下`albumByID`函数。    ```
    // albumByID queries for the album with the specified ID.
    func albumByID(id int64) (Album, error) {
    	// An album to hold data from the returned row.
    	var alb Album

    	row := db.QueryRow("SELECT * FROM album WHERE id = ?", id)
    	if err := row.Scan(&alb.ID, &alb.Title, &alb.Artist, &alb.Price); err != nil {
    		if err == sql.ErrNoRows {
    			return alb, fmt.Errorf("albumsById %d: no such album", id)
    		}
    		return alb, fmt.Errorf("albumsById %d: %v", id, err)
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
    fmt.Printf("Album found: %v\n", alb)
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
```
接下来，您将向数据库添加一张专辑。

## 添加数据 {#add_data}

在本节中，您将使用 Go 执行一条 SQL `INSERT` 语句，向数据库添加一行新数据。

您已经了解了如何使用 `Query` 和 `QueryRow` 处理会返回数据的 SQL 语句。要执行*不*返回数据的 SQL 语句，您需要使用 `Exec`。

#### 编写代码

1. 在 `albumByID` 函数下方，粘贴以下 `addAlbum` 函数以向数据库插入新专辑数据，然后保存 main.go 文件。    ```
    // addAlbum adds the specified album to the database,
    // returning the album ID of the new entry
    func addAlbum(alb Album) (int64, error) {
    	result, err := db.Exec("INSERT INTO album (title, artist, price) VALUES (?, ?, ?)", alb.Title, alb.Artist, alb.Price)
    	if err != nil {
    		return 0, fmt.Errorf("addAlbum: %v", err)
    	}
    	id, err := result.LastInsertId()
    	if err != nil {
    		return 0, fmt.Errorf("addAlbum: %v", err)
    	}
    	return id, nil
    }
    ```
在这段代码中，你需要：

*   使用 [`DB.Exec`](https://pkg.go.dev/database/sql#DB.Exec) 来执行一条 `INSERT` 语句。

    像 `Query` 一样，`Exec` 接受一个 SQL 语句，后面跟着该 SQL 语句所需的参数值。

*   检查执行 `INSERT` 操作时可能产生的错误。

*   使用 [`Result.LastInsertId`](https://pkg.go.dev/database/sql#Result.LastInsertId) 来获取已插入数据库行的 ID。

*   检查在尝试获取 ID 时可能产生的错误。

2. 更新 `main` 函数，以便调用新的 `addAlbum` 函数。

    在 `func main` 函数的末尾，添加以下代码。    ```
    albID, err := addAlbum(Album{
    	Title:  "The Modern Sound of Betty Carter",
    	Artist: "Betty Carter",
    	Price:  49.99,
    })
    if err != nil {
    	log.Fatal(err)
    }
    fmt.Printf("ID of added album: %v\n", albID)
    ```
在新的代码中，你现在需要：

*   使用新专辑调用 `addAlbum` 函数，并将你正在添加的专辑 ID 赋值给 `albID` 变量。

#### 运行代码

在包含 main.go 文件的目录下，通过命令行运行代码。```
$ go run .
Connected!
Albums found: [{1 Blue Train John Coltrane 56.99} {2 Giant Steps John Coltrane 63.99}]
Album found: {2 Giant Steps John Coltrane 63.99}
ID of added album: 5
```
## 结论 {#conclusion}

恭喜！您刚刚使用 Go 语言完成了对关系型数据库的简单操作。

推荐的后续学习主题：

*   查看数据访问指南，其中包含了更多关于本章仅略作触及的主题的信息。

*   如果您是 Go 语言新手，可以在[《Effective Go》](/doc/effective_go)和[《如何编写 Go 代码》](/doc/code)中找到实用的最佳实践。

*   [Go 之旅](/tour/)是逐步学习 Go 语言基础的极佳资源。

## 完整代码 {#completed_code}

本章节包含您通过本教程构建的应用程序代码。```
package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/go-sql-driver/mysql"
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
	cfg.User = os.Getenv("DBUSER")
	cfg.Passwd = os.Getenv("DBPASS")
	cfg.Net = "tcp"
	cfg.Addr = "127.0.0.1:3306"
	cfg.DBName = "recordings"

	// Get a database handle.
	var err error
	db, err = sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}

	pingErr := db.Ping()
	if pingErr != nil {
		log.Fatal(pingErr)
	}
	fmt.Println("Connected!")

	albums, err := albumsByArtist("John Coltrane")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Albums found: %v\n", albums)

	// Hard-code ID 2 here to test the query.
	alb, err := albumByID(2)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Album found: %v\n", alb)

	albID, err := addAlbum(Album{
		Title:  "The Modern Sound of Betty Carter",
		Artist: "Betty Carter",
		Price:  49.99,
	})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("ID of added album: %v\n", albID)
}

// albumsByArtist queries for albums that have the specified artist name.
func albumsByArtist(name string) ([]Album, error) {
	// An albums slice to hold data from returned rows.
	var albums []Album

	rows, err := db.Query("SELECT * FROM album WHERE artist = ?", name)
	if err != nil {
		return nil, fmt.Errorf("albumsByArtist %q: %v", name, err)
	}
	defer rows.Close()
	// Loop through rows, using Scan to assign column data to struct fields.
	for rows.Next() {
		var alb Album
		if err := rows.Scan(&alb.ID, &alb.Title, &alb.Artist, &alb.Price); err != nil {
			return nil, fmt.Errorf("albumsByArtist %q: %v", name, err)
		}
		albums = append(albums, alb)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("albumsByArtist %q: %v", name, err)
	}
	return albums, nil
}

// albumByID queries for the album with the specified ID.
func albumByID(id int64) (Album, error) {
	// An album to hold data from the returned row.
	var alb Album

	row := db.QueryRow("SELECT * FROM album WHERE id = ?", id)
	if err := row.Scan(&alb.ID, &alb.Title, &alb.Artist, &alb.Price); err != nil {
		if err == sql.ErrNoRows {
			return alb, fmt.Errorf("albumsById %d: no such album", id)
		}
		return alb, fmt.Errorf("albumsById %d: %v", id, err)
	}
	return alb, nil
}

// addAlbum adds the specified album to the database,
// returning the album ID of the new entry
func addAlbum(alb Album) (int64, error) {
	result, err := db.Exec("INSERT INTO album (title, artist, price) VALUES (?, ?, ?)", alb.Title, alb.Artist, alb.Price)
	if err != nil {
		return 0, fmt.Errorf("addAlbum: %v", err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("addAlbum: %v", err)
	}
	return id, nil
}
```
