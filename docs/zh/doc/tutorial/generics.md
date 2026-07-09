<!--{
  "Title": "教程：泛型入门",
  "Breadcrumb": true
}-->

本教程介绍 Go 语言泛型（generics）的基础知识。通过泛型，你可以声明和使用能够处理调用方代码所提供的一组类型中任意类型的函数或类型。

在本教程中，你将先声明两个简单的非泛型函数，然后用一个泛型函数来封装相同的逻辑。

你将按照以下章节循序渐进：

1.  为你的代码创建一个文件夹。
2.  添加非泛型函数。
3.  添加一个处理多种类型的泛型函数。
4.  调用泛型函数时移除类型参数。
5.  声明一个类型约束。

**注意：** 查看其他教程，请访问[教程](/doc/tutorial/index.html)。

## 先决条件

*   **Go。** 我们建议使用最新版本的 Go 来学习本教程。安装说明请参见[安装 Go](/doc/install)。
*   **代码编辑工具。** 任何你拥有的文本编辑器均可使用。
*   **命令行终端。** Go 在 Linux 和 Mac 的任何终端以及 Windows 的 PowerShell 或 cmd 中都能良好运行。

## 为你的代码创建一个文件夹 {#create_folder}

首先，为你将要编写的代码创建一个文件夹。

1.  打开命令提示符并切换到你的主目录。

    在 Linux 或 Mac 上：    ```
    $ cd
    ```
在Windows上：    ```
    C:\> cd %HOMEPATH%
    ```
本教程后续内容将使用美元符号 `$` 作为命令提示符。您所使用的命令在 Windows 系统上同样适用。

接下来，在命令提示符中创建一个名为 `generics` 的目录来存放您的代码。    ```
    $ mkdir generics
    $ cd generics
    ```
3. 创建一个模块来存放你的代码。

    运行 `go mod init` 命令，为其指定新代码的模块路径。    ```
    $ go mod init example/generics
    go: creating new go.mod: module example/generics
    ```
**注意：** 对于生产代码，您需要指定更符合自身需求的模块路径。更多信息请参阅[管理依赖项](/doc/modules/managing-dependencies)。

接下来，您将添加一些处理映射的简单代码。

## 添加非泛型函数 {#non_generic_functions}

在本步骤中，您将添加两个函数，分别计算映射（map）中值的总和并返回结果。

您需要声明两个函数而非一个，因为您要处理两种不同类型的映射：一种存储 `int64` 类型的值，另一种存储 `float64` 类型的值。

#### 编写代码

1. 使用文本编辑器，在 generics 目录下创建一个名为 main.go 的文件。您将在此文件中编写 Go 代码。
2. 在 main.go 文件的开头，粘贴以下包（package）声明。    ```
    package main
    ```
一个独立程序（区别于库）总是位于 `main` 包中。

3. 在包声明的下方，粘贴以下两个函数声明。    ```
    // SumInts adds together the values of m.
    func SumInts(m map[string]int64) int64 {
    	var s int64
    	for _, v := range m {
    		s += v
    	}
    	return s
    }

    // SumFloats adds together the values of m.
    func SumFloats(m map[string]float64) float64 {
    	var s float64
    	for _, v := range m {
    		s += v
    	}
    	return s
    }
    ```
在此代码中，您需要：

*   声明两个函数，用于对map（映射）的值进行求和并返回结果。
    *   `SumFloats` 函数接受一个键类型为 `string`、值类型为 `float64` 的 map。
    *   `SumInts` 函数接受一个键类型为 `string`、值类型为 `int64` 的 map。

4.  在 main.go 文件的顶部，在 package 声明之下，粘贴以下 `main` 函数，该函数将初始化两个 map，并在调用您在上一步中声明的函数时，将它们用作参数。    ```
    func main() {
    	// Initialize a map for the integer values
    	ints := map[string]int64{
    		"first":  34,
    		"second": 12,
    	}

    	// Initialize a map for the float values
    	floats := map[string]float64{
    		"first":  35.98,
    		"second": 26.99,
    	}

    	fmt.Printf("Non-Generic Sums: %v and %v\n",
    		SumInts(ints),
    		SumFloats(floats))
    }
    ```
在这段代码中，您需要：

*   初始化一个包含 `float64` 值的映射（map）和一个包含 `int64` 值的映射（map），每个映射（map）各有两条记录。
*   调用之前声明的两个函数来计算每个映射（map）中值的总和。
*   打印结果。

5.  在 main.go 文件的顶部，紧随包声明（package declaration）之后，导入（import）支持您刚编写的代码所需的包。

    代码的开头几行应该如下所示：    ```
    package main

    import "fmt"
    ```
6. 保存 main.go 文件。

#### 运行代码

在包含 main.go 文件的目录中，从命令行运行代码。```
$ go run .
Non-Generic Sums: 46 and 62.97
```
使用泛型，你可以用一个函数代替之前的两个函数。接下来，你将为包含整型或浮点型值的映射添加一个泛型函数。

## 添加处理多种类型的泛型函数 {#add_generic_function}

在本节中，你将添加一个泛型函数，它可以接收包含整型或浮点型值的映射，从而有效地用单个函数替代你刚刚编写的两个函数。

为了支持这两种类型的值，这个函数需要一种方式来声明它支持哪些类型。另一方面，调用代码需要一种方式来指定它是使用整型还是浮点型映射进行调用。

为此，你将编写一个除了普通函数参数外，还声明_类型参数_的函数。这些类型参数使函数泛型化，使其能够处理不同类型的参数。你将使用_类型参数_和普通函数参数来调用该函数。

每个类型参数都有一个_类型约束_，它充当该类型参数的一种元类型。每个类型约束指定了调用代码可以为相应类型参数使用的允许类型。

虽然类型参数的约束通常代表一组类型，但在编译时，类型参数仅代表一个单一类型——即调用代码作为类型参数提供的类型。如果类型参数的类型不被类型参数的约束所允许，代码将无法编译。

请记住，类型参数必须支持泛型代码对其执行的所有操作。例如，如果你的函数代码试图对一个约束包含数值类型的类型参数执行`string`操作（如索引），代码将无法编译。

在你即将编写的代码中，你将使用一个允许整型或浮点型的约束。

#### 编写代码

1.  在你之前添加的两个函数下方，粘贴以下泛型函数。    ```
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
在这段代码中，您：

*   声明了一个名为 `SumIntsOrFloats` 的函数，该函数包含两个类型参数（在方括号内），分别为 `K` 和 `V`，以及一个使用这些类型参数的参数 `m`，其类型为 `map[K]V`。该函数返回类型为 `V` 的值。
*   为类型参数 `K` 指定了类型约束 `comparable`。`comparable` 约束是 Go 语言中预声明的，专门用于此类场景。它允许任何其值可以作为比较运算符 `==` 和 `!=` 的操作数的类型。Go 语言要求映射的键必须是可比较的。因此，将 `K` 声明为 `comparable` 是必要的，这样您才能在映射变量中使用 `K` 作为键。它也确保调用方代码对映射键使用了允许的类型。
*   为类型参数 `V` 指定了一个约束，该约束是 `int64` 和 `float64` 两个类型的联合。使用 `|` 指定了这两个类型的联合，意味着此约束允许其中任意一种类型。编译器将允许调用方代码将这两种类型中的任意一种作为参数。
*   指定参数 `m` 的类型为 `map[K]V`，其中 `K` 和 `V` 已经是为类型参数指定的类型。请注意，我们知道 `map[K]V` 是一个有效的映射类型，因为 `K` 是可比较的类型。如果我们没有将 `K` 声明为可比较的，编译器将会拒绝 `map[K]V` 的引用。

2. 在 `main.go` 文件中，在您已有的代码下方，粘贴以下代码。    ```
    fmt.Printf("Generic Sums: %v and %v\n",
    	SumIntsOrFloats[string, int64](ints),
    	SumIntsOrFloats[string, float64](floats))
    ```
在这段代码中，您需要：

*   调用刚刚声明的泛型函数（generic function），并传入创建的每个映射（map）。
*   在方括号中指定类型参数（type arguments）——明确应替换所调用函数中类型参数的具体类型名称。

    正如下一节将介绍的，您通常可以在函数调用中省略类型参数。Go 语言往往能从您的代码中推断出这些类型。
*   打印函数返回的求和结果。

#### 运行代码

在包含 main.go 文件的目录中，打开命令行终端运行代码。```
$ go run .
Non-Generic Sums: 46 and 62.97
Generic Sums: 46 and 62.97
```
在运行代码时，编译器会将每次调用中的类型参数替换为该次调用指定的具体类型。

在调用您编写的泛型函数时，您指定了类型实参，告知编译器使用哪些类型来替代函数的类型参数。正如您将在下一节中看到的，在许多情况下，您可以省略这些类型实参，因为编译器能够推断它们。

## 调用泛型函数时省略类型实参 {#remove_type_arguments}

在本节中，您将修改泛型函数的调用方式，通过一个小小的改动来简化调用代码。我们将移除在此情况下并不必需的类型实参。

当 Go 编译器能够推断出您想要使用的类型时，您可以在调用代码中省略类型实参。编译器会根据函数参数的类型来推断类型实参。

请注意，这并非总是可行。例如，如果需要调用一个没有参数的泛型函数，您就必须在函数调用中包含类型实参。

#### 编写代码

*   在 `main.go` 文件中，于已有代码下方粘贴以下代码。    ```
    fmt.Printf("Generic Sums, type parameters inferred: %v and %v\n",
    	SumIntsOrFloats(ints),
    	SumIntsOrFloats(floats))
    ```
在这段代码中，您需要：

*   调用泛型函数，并省略类型参数。

#### 运行代码

在包含 main.go 文件的目录中，打开命令行工具运行代码。```
$ go run .
Non-Generic Sums: 46 and 62.97
Generic Sums: 46 and 62.97
Generic Sums, type parameters inferred: 46 and 62.97
```
接下来，你将通过将整数和浮点数的联合约束捕获到一个可复用的类型约束中，来进一步简化函数。

## 声明类型约束 {#declare_type_constraint}

在最后一节中，你将把之前定义的约束移动到它自己的接口中，以便在多处复用。以这种方式声明约束有助于精简代码，尤其在约束较为复杂时。

你可以将 _类型约束_ 声明为一个接口。该约束允许任何实现了该接口的类型。例如，如果你声明了一个包含三个方法的类型约束接口，并在一个泛型函数中将其用作类型参数，那么用于调用该函数的类型参数必须拥有所有这些方法。

约束接口也可以引用特定类型，你将在本节中看到这一点。

#### 编写代码

1.  在 `main` 函数正上方，紧接在导入语句之后，粘贴以下代码来声明一个类型约束。    ```
    type Number interface {
        int64 | float64
    }
    ```
在以下代码中，你将：

*   声明 `Number` 接口类型作为类型约束使用。
*   在接口内部声明 `int64` 和 `float64` 的联合类型。

        本质上，你将联合类型从函数声明中移入一个新的类型约束。这样，当你需要将类型参数约束为 `int64` 或 `float64` 时，可以直接使用这个 `Number` 类型约束，而无需重复编写 `int64 | float64`。

2. 在你已有的函数下方，粘贴以下通用 `SumNumbers` 函数：    ```
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
在此代码中，您将：

*   声明一个泛型函数（generic function），其逻辑与之前声明的泛型函数相同，但类型约束从联合类型（union）改为使用新的接口类型（interface type）。与之前一样，函数参数和返回值类型都使用类型参数（type parameters）。

3. 在 `main.go` 文件中已有代码的下方，粘贴以下代码：    ```
    fmt.Printf("Generic Sums with Constraint: %v and %v\n",
    	SumNumbers(ints),
    	SumNumbers(floats))
    ```
在这段代码中，你将：

*   对每个映射调用`SumNumbers`函数，并打印其所有值的总和。

    与前一节相同，你在调用泛型函数时省略了类型参数（即方括号内的类型名称）。Go编译器能够根据其他参数推断出类型参数。

#### 运行代码

在包含 main.go 文件的目录中，通过命令行运行此代码。```
$ go run .
Non-Generic Sums: 46 and 62.97
Generic Sums: 46 and 62.97
Generic Sums, type parameters inferred: 46 and 62.97
Generic Sums with Constraint: 46 and 62.97
```
## 结论 {#conclusion}

干得漂亮！您已经完成了Go语言泛型的初步学习。

建议接下来学习：

*   [Go语言之旅](/tour/) 是一个循序渐进的Go语言基础教程
*   您可以在[高效Go编程](/doc/effective_go)和[Go代码编写指南](/doc/code)中找到实用的Go语言最佳实践

## 完整代码 {#completed_code}

您可以在[Go Playground](/play/p/apNmfVwogK0)中运行此程序。
在Playground界面只需点击 **Run** 按钮即可执行。