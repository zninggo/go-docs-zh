<!--{
  "Title": "教程：使用 Go 和 Gin 开发 RESTful API",
  "Breadcrumb": true
}-->

本教程介绍如何使用 Go 和 [Gin Web 框架](https://gin-gonic.com/en/docs/)（Gin）编写 RESTful Web 服务 API 的基础知识。

如果您对 Go 及其工具链有基本了解，将能从本教程中获得最佳学习效果。如果这是您首次接触 Go，请参阅[教程：Go 入门](/doc/tutorial/getting-started)获取快速入门指导。

Gin 简化了许多与构建 Web 应用程序（包括 Web 服务）相关的编码任务。在本教程中，您将使用 Gin 来路由请求、获取请求详情，并将响应数据编码为 JSON 格式。

在本教程中，您将构建一个具有两个端点的 RESTful API 服务器。示例项目将是一个存储复古爵士唱片数据的仓库。

本教程包含以下部分：

1. 设计 API 端点。
2. 创建代码文件夹。
3. 创建数据。
4. 编写处理程序以返回所有项目。
5. 编写处理程序以添加新项目。
6. 编写处理程序以返回特定项目。

**注意：** 其他教程请参阅[教程列表](/doc/tutorial/index.html)。

如需在 Google Cloud Shell 中完成此交互式教程，请点击下方按钮。

[![在 Cloud Shell 中打开](https://gstatic.com/cloudssh/images/open-btn.png)](https://ide.cloud.google.com/?cloudshell_workspace=~&walkthrough_tutorial_url=https://raw.githubusercontent.com/golang/tour/master/tutorial/web-service-gin.md)

## 前提条件

*   **Go 1.16 或更高版本。** 安装说明请参阅[安装 Go](/doc/install)。
*   **代码编辑工具。** 您拥有的任何文本编辑器均可使用。
*   **命令行终端。** Go 在 Linux 和 Mac 的任何终端上均可良好运行，在 Windows 上可使用 PowerShell 或 cmd。
*   **curl 工具。** 在 Linux 和 Mac 上通常已预装。在 Windows 上，自 Windows 10 Insider build 17063 及更高版本起已包含此工具。对于较早的 Windows 版本，您可能需要自行安装。更多信息请参阅 [Tar 和 Curl 登陆 Windows](https://docs.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows)。

## 设计 API 端点 {#design_endpoints}

您将构建一个提供复古黑胶唱片销售商店访问权限的 API。因此需要提供端点，以便客户端可以获取和为用户添加专辑数据。

开发 API 时，通常从设计端点开始。如果端点易于理解，API 用户将更容易成功使用。

以下是您将在本教程中创建的端点：

/albums
*   `GET` – 获取所有专辑列表，以 JSON 格式返回。
*   `POST` – 从以 JSON 格式发送的请求数据中添加新专辑。

/albums/:id
*   `GET` – 通过 ID 获取专辑，以 JSON 格式返回专辑数据。

接下来，您将为代码创建文件夹。

## 创建代码文件夹 {#create_folder}

首先，为您将要编写的代码创建一个项目。

1. 打开命令提示符并切换到主目录。

    在 Linux 或 Mac 上：    ```
    $ cd
    ```
在Windows上：    ```
    C:\> cd %HOMEPATH%
    ```
2. 使用命令行，请创建一个名为 web-service-gin 的代码目录。    ```
    $ mkdir web-service-gin
    $ cd web-service-gin
    ```
3. 创建模块以管理依赖项。

    运行 `go mod init` 命令，并指定代码所在模块的路径。    ```
    $ go mod init example/web-service-gin
    go: creating new go.mod: module example/web-service-gin
    ```
此命令会创建一个 go.mod 文件，你添加的依赖项将在此文件中列出以便追踪。关于如何通过模块路径为模块命名的更多信息，请参阅[管理依赖项](/doc/modules/managing-dependencies#naming_module)。

接下来，你将设计用于处理数据的数据结构。

## 创建数据 {#create_data}

为简化本教程的演示流程，我们将数据存储在内存中。更典型的 API 通常会与数据库进行交互。

请注意，将数据存储在内存中意味着每次停止服务器时，专辑数据集将会丢失，重新启动后会再次创建。

#### 编写代码

1. 使用文本编辑器，在 web-service 目录下创建一个名为 main.go 的文件。你将在此文件中编写 Go 代码。
2. 在 main.go 文件的顶部粘贴以下包声明：    ```
    package main
    ```
一个独立程序（与库相对应）总是在 `main` 包中。

3. 在 package 声明下方，粘贴以下 `album` 结构体的声明。你将用它来在内存中存储专辑数据。

   结构体标签如 ``json:"artist"`` 指定了当结构体内容序列化为 JSON 时字段应使用的名称。若省略标签，JSON 会直接采用结构体的大写字段名——这种风格在 JSON 中并不常见。    ```
    // album represents data about a record album.
    type album struct {
    	ID     string  `json:"id"`
    	Title  string  `json:"title"`
    	Artist string  `json:"artist"`
    	Price  float64 `json:"price"`
    }
    ```
4. 在你刚刚添加的结构体声明下方，粘贴以下包含初始数据的 `album` 结构体切片。    ```
    // albums slice to seed record album data.
    var albums = []album{
    	{ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
    	{ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
    	{ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
    }
    ```
接下来，你将编写代码来实现你的第一个端点。

## 编写一个返回所有项目的处理函数 {#all_items}

当客户端在 `GET /albums` 发起请求时，你需要以 JSON 格式返回所有的专辑数据。

为此，你将编写以下内容：

*   准备响应数据的逻辑
*   将请求路径映射到你的处理逻辑的代码

请注意，这与运行时的执行顺序相反，但你先添加依赖项，然后才是依赖这些项的代码。

#### 编写代码

1. 在上一节你添加的结构体代码下方，粘贴以下代码以获取专辑列表。

    这个 `getAlbums` 函数从 `album` 结构体的切片（slice）创建 JSON，并将 JSON 写入响应中。    ```
    // getAlbums responds with the list of all albums as JSON.
    func getAlbums(c *gin.Context) {
    	c.IndentedJSON(http.StatusOK, albums)
    }
    ```
在此代码中，您：

    *   编写了一个 `getAlbums` 函数，该函数接收一个
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

2. 在 main.go 文件顶部附近，`albums` 切片声明的正下方，粘贴以下代码，将处理函数分配给端点路径。

    这将建立关联，使 `getAlbums` 处理对 `/albums` 端点路径的请求。    ```
    func main() {
    	router := gin.Default()
    	router.GET("/albums", getAlbums)

    	router.Run("localhost:8080")
    }
    ```
在此代码中，您需要：

*   使用 [`Default`](https://pkg.go.dev/github.com/gin-gonic/gin#Default) 初始化一个 Gin 路由器（router）。
*   使用 [`GET`](https://pkg.go.dev/github.com/gin-gonic/gin#RouterGroup.GET) 函数将 `GET` HTTP 方法和 `/albums` 路径与一个处理函数（handler function）关联起来。

    请注意，您传递的是 `getAlbums` 函数的_名称_，而不是传递该函数的_结果_（后者需要使用 `getAlbums()` 并注意括号）。

*   使用 [`Run`](https://pkg.go.dev/github.com/gin-gonic/gin#Engine.Run) 函数将路由器附加到一个 `http.Server` 并启动服务器。

3. 在 main.go 文件顶部，包声明（package declaration）之下，导入您编写的代码所需的包。

    代码的开头几行应如下所示：    ```
    package main

    import (
    	"net/http"

    	"github.com/gin-gonic/gin"
    )
    ```
4. 保存 main.go 文件。

#### 运行代码

1. 开始将 Gin 模块作为依赖项进行跟踪。

    在命令行中，使用 [`go get`](/cmd/go/#hdr-Add_dependencies_to_current_module_and_install_them) 命令将 github.com/gin-gonic/gin 模块添加为您的模块的依赖项。
    使用点号（`.`）作为参数，表示"获取当前目录中代码的依赖项"。    ```
    $ go get .
    go get: added github.com/gin-gonic/gin v1.7.2
    ```
Go 语言已自动解析并下载了该依赖，以满足您在上一步骤中添加的 `import` 声明要求。

2. 在包含 main.go 文件的目录中打开命令行，运行代码。使用点号参数表示“运行当前目录下的代码”。    ```
    $ go run .
    ```
一旦代码开始运行，你就有了一个正在运行的 HTTP 服务器，可以向它发送请求。

3. 在新的命令行窗口中，使用 `curl` 向你正在运行的 Web 服务发送请求。    ```
    $ curl http://localhost:8080/albums
    ```
该命令应显示您为服务预置的数据。    ```
    [
            {
                    "id": "1",
                    "title": "Blue Train",
                    "artist": "John Coltrane",
                    "price": 56.99
            },
            {
                    "id": "2",
                    "title": "Jeru",
                    "artist": "Gerry Mulligan",
                    "price": 17.99
            },
            {
                    "id": "3",
                    "title": "Sarah Vaughan and Clifford Brown",
                    "artist": "Sarah Vaughan",
                    "price": 39.99
            }
    ]
    ```
你已经启动了一个API！在下一节中，你将创建另一个端点（endpoint），编写代码来处理`POST`请求以添加一个项目。

## 编写处理器以添加新项目 {#add_item}

当客户端在 `/albums` 发出 `POST` 请求时，你需要将请求体中描述的专辑添加到现有的专辑数据中。

为此，你将需要编写以下内容：

*   将新专辑添加到现有列表的逻辑。
*   一小段代码，用于将 `POST` 请求路由到你的逻辑。

#### 编写代码

1.  添加代码，将专辑数据添加到专辑列表中。

    在 `import` 语句之后的某个位置，粘贴以下代码。（文件末尾是放置此代码的好位置，但 Go 不强制规定函数声明的顺序。）    ```
    // postAlbums adds an album from JSON received in the request body.
    func postAlbums(c *gin.Context) {
    	var newAlbum album

    	// Call BindJSON to bind the received JSON to
    	// newAlbum.
    	if err := c.BindJSON(&newAlbum); err != nil {
    		return
    	}

    	// Add the new album to the slice.
    	albums = append(albums, newAlbum)
    	c.IndentedJSON(http.StatusCreated, newAlbum)
    }
    ```
在这段代码中，您：

*   使用 [`Context.BindJSON`](https://pkg.go.dev/github.com/gin-gonic/gin#Context.BindJSON) 方法将请求体绑定到 `newAlbum` 变量。
*   将基于 JSON 数据初始化的 `album` 结构体追加到 `albums` 切片中。
*   在响应中添加 `201` 状态码，同时以 JSON 格式返回所添加的相册信息。

2. 修改您的 `main` 函数，使其包含 `router.POST` 函数，如下所示：    ```
    func main() {
    	router := gin.Default()
    	router.GET("/albums", getAlbums)
    	router.POST("/albums", postAlbums)

    	router.Run("localhost:8080")
    }
    ```
在以下代码中，您将：

*   将 `/albums` 路径的 `POST` 方法关联到 `postAlbums` 函数。

    使用 Gin 框架时，您可以将处理函数（handler）与特定的 HTTP 方法和路径组合进行关联。通过这种方式，您可以根据客户端使用的不同方法，对发送到同一路径的请求分别进行路由处理。

#### 运行代码

1. 如果上一部分的服务器仍在运行，请先将其停止。
2. 在包含 `main.go` 文件的目录下，通过命令行运行代码。    ```
    $ go run .
    ```
3. 在另一个命令行窗口中，使用 `curl` 向正在运行的网络服务发送请求。    ```
    $ curl http://localhost:8080/albums \
        --include \
        --header "Content-Type: application/json" \
        --request "POST" \
        --data '{"id": "4","title": "The Modern Sound of Betty Carter","artist": "Betty Carter","price": 49.99}'
    ```
该命令应显示添加的专辑的响应头信息和JSON数据。    ```
    HTTP/1.1 201 Created
    Content-Type: application/json; charset=utf-8
    Date: Wed, 02 Jun 2021 00:34:12 GMT
    Content-Length: 116

    {
        "id": "4",
        "title": "The Modern Sound of Betty Carter",
        "artist": "Betty Carter",
        "price": 49.99
    }
    ```
4. 正如前面章节所述，使用 `curl` 命令获取完整的专辑列表，
    这可以用于验证新专辑是否已成功添加。    ```
    $ curl http://localhost:8080/albums \
        --header "Content-Type: application/json" \
        --request "GET"
    ```
该命令应显示专辑列表。    ```
    [
            {
                    "id": "1",
                    "title": "Blue Train",
                    "artist": "John Coltrane",
                    "price": 56.99
            },
            {
                    "id": "2",
                    "title": "Jeru",
                    "artist": "Gerry Mulligan",
                    "price": 17.99
            },
            {
                    "id": "3",
                    "title": "Sarah Vaughan and Clifford Brown",
                    "artist": "Sarah Vaughan",
                    "price": 39.99
            },
            {
                    "id": "4",
                    "title": "The Modern Sound of Betty Carter",
                    "artist": "Betty Carter",
                    "price": 49.99
            }
    ]
    ```
在下一节中，你将添加代码来处理针对特定项目的 `GET` 请求。

## 编写处理函数以返回特定项目 {#specific_item}

当客户端向 `GET /albums/[id]` 发出请求时，你需要返回ID与路径参数 `id` 相匹配的专辑。

为此，你需要：

*   添加逻辑以检索请求的专辑。
*   将路径映射到该逻辑。

#### 编写代码

1. 在上一部分你添加的 `postAlbums` 函数下方，粘贴以下代码以检索特定专辑。

    此 `getAlbumByID` 函数将提取请求路径中的ID，然后定位一个匹配的专辑。    ```
    // getAlbumByID locates the album whose ID value matches the id
    // parameter sent by the client, then returns that album as a response.
    func getAlbumByID(c *gin.Context) {
    	id := c.Param("id")

    	// Loop over the list of albums, looking for
    	// an album whose ID value matches the parameter.
    	for _, a := range albums {
    		if a.ID == id {
    			c.IndentedJSON(http.StatusOK, a)
    			return
    		}
    	}
    	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "album not found"})
    }
    ```
在上述代码中，您需要：

1.  使用 [`Context.Param`](https://pkg.go.dev/github.com/gin-gonic/gin#Context.Param) 从 URL 中获取路径参数 `id`。当将该处理函数映射到路径时，您需要在路径中包含该参数的占位符。
2.  遍历切片中的 `album` 结构体，寻找 `ID` 字段值与参数 `id` 值匹配的元素。如果找到，则将该 `album` 结构体序列化为 JSON，并将其作为响应返回，同时附带 `200 OK` 的 HTTP 状态码。
    如上所述，实际应用中的服务可能会通过数据库查询来执行此查找操作。
3.  如果未找到对应的专辑，则返回 HTTP `404` 错误，并使用 [`http.StatusNotFound`](https://pkg.go.dev/net/http#StatusNotFound) 作为状态码。

最后，修改您的 `main` 函数，添加一个新的 `router.GET` 调用，路径现为 `/albums/:id`，如下例所示。    ```
    func main() {
    	router := gin.Default()
    	router.GET("/albums", getAlbums)
    	router.GET("/albums/:id", getAlbumByID)
    	router.POST("/albums", postAlbums)

    	router.Run("localhost:8080")
    }
    ```
在这段代码中，你将：

- 将 `/albums/:id` 路径关联到 `getAlbumByID` 函数。在 Gin 框架中，路径中冒号前缀的项目表示该项为路径参数。

#### 运行代码

1. 如果服务器仍在运行，请先停止它。
2. 在命令行中，进入包含 main.go 文件的目录，运行代码以启动服务器。    ```
    $ go run .
    ```
3. 从另一个命令行窗口中，使用`curl`工具向运行中的Web服务发送请求。    ```
    $ curl http://localhost:8080/albums/2
    ```
该命令应显示你所使用ID对应的专辑的JSON数据。如果未找到该专辑，则会返回包含错误信息的JSON。    ```
    {
            "id": "2",
            "title": "Jeru",
            "artist": "Gerry Mulligan",
            "price": 17.99
    }
    ```
## 结论 {#conclusion}

恭喜！您刚刚使用 Go 和 Gin 编写了一个简单的 RESTful 网络服务。

建议的后续学习主题：

*   如果您是 Go 语言新手，可以在[高效Go编程](/doc/effective_go)和[如何编写Go代码](/doc/code)中找到实用的最佳实践指南。
*   [Go 语言之旅](/tour/)是一个循序渐进学习 Go 语言基础的优质教程。
*   如需了解更多关于 Gin 的内容，请参阅 [Gin Web 框架包文档](https://pkg.go.dev/github.com/gin-gonic/gin)或 [Gin Web 框架文档](https://gin-gonic.com/en/docs/)。

## 完整代码 {#completed_code}

本节包含通过本教程构建的应用程序代码。```
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// album represents data about a record album.
type album struct {
	ID     string  `json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
}

// albums slice to seed record album data.
var albums = []album{
	{ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
	{ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
	{ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

func main() {
	router := gin.Default()
	router.GET("/albums", getAlbums)
	router.GET("/albums/:id", getAlbumByID)
	router.POST("/albums", postAlbums)

	router.Run("localhost:8080")
}

// getAlbums responds with the list of all albums as JSON.
func getAlbums(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, albums)
}

// postAlbums adds an album from JSON received in the request body.
func postAlbums(c *gin.Context) {
	var newAlbum album

	// Call BindJSON to bind the received JSON to
	// newAlbum.
	if err := c.BindJSON(&newAlbum); err != nil {
		return
	}

	// Add the new album to the slice.
	albums = append(albums, newAlbum)
	c.IndentedJSON(http.StatusCreated, newAlbum)
}

// getAlbumByID locates the album whose ID value matches the id
// parameter sent by the client, then returns that album as a response.
func getAlbumByID(c *gin.Context) {
	id := c.Param("id")

	// Loop through the list of albums, looking for
	// an album whose ID value matches the parameter.
	for _, a := range albums {
		if a.ID == id {
			c.IndentedJSON(http.StatusOK, a)
			return
		}
	}
	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "album not found"})
}
```
