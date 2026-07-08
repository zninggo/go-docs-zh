<!--{
    "Title": "编译并安装应用程序",
    "Breadcrumb": true
}-->

<p>
  在这最后一个主题中，您将学习几个新的 <code>go</code> 命令。虽然 <code>go run</code> 命令在频繁修改代码时是一个方便的快捷方式，用于编译和运行程序，但它不会生成二进制可执行文件。</p>

<p>
  本主题介绍另外两个用于构建代码的命令：
</p>

<ul>
  <li>
    <a href="/cmd/go/#hdr-Compile_packages_and_dependencies"><code>go
    build</code> 命令</a>会编译包及其依赖项，但不会安装编译结果。
  </li>
  <li>
    <a href="/ref/mod#go-install"><code>go
    install</code> 命令</a>会编译并安装包。
  </li>
</ul>

<aside class="Note">
  <strong>注意：</strong>本主题是一个多部分教程的一部分，该教程从<a href="create-module.html">创建一个 Go 模块</a>开始。
</aside>

<ol>
  <li>
    在 hello 目录的命令行中，运行 <code>go build</code> 命令，将代码编译成一个可执行文件。

    <pre>$ go build</pre>
  </li>

  <li>
    在 hello 目录的命令行中，运行新的 <code>hello</code> 可执行文件，以确认代码工作正常。

    <p>
      请注意，您的结果可能有所不同，这取决于您在测试后是否修改了 greetings.go 代码。
    </p>

    <ul>
      <li>
        在 Linux 或 Mac 上：

        <pre>
$ ./hello
map[Darrin:Great to see you, Darrin! Gladys:Hail, Gladys! Well met! Samantha:Hail, Samantha! Well met!]
</pre>
      </li>

      <li>
        在 Windows 上：

        <pre>
$ hello.exe
map[Darrin:Great to see you, Darrin! Gladys:Hail, Gladys! Well met! Samantha:Hail, Samantha! Well met!]
</pre>
      </li>
    </ul>
    <p>
      您已经将应用程序编译成了一个可执行文件，现在可以运行它了。但要运行它，您当前的命令提示符（命令行）要么需要位于该可执行文件所在的目录中，要么需要指定该可执行文件的路径。
    </p>
    <p>
      接下来，您将安装该可执行文件，以便无需指定其路径即可运行。
    </p>
  </li>

  <li>
    探查 Go 的安装路径，<code>go</code> 命令将把当前包安装到此路径。

    <p>
      您可以通过运行
      <a href="/cmd/go/#hdr-List_packages_or_modules">
        <code>go list</code> 命令</a>来查找安装路径，如下例所示：
    </p>

    <pre>
$ go list -f '{{.Target}}'
</pre>

    <p>
      例如，该命令的输出可能是 <code>/home/gopher/bin/hello</code>，这意味着二进制文件将被安装到 /home/gopher/bin。您将在下一步中用到此安装目录。
    </p>
  </li>

  <li>
    将 Go 安装目录添加到系统的 shell 环境变量 PATH 中。

    <p>
      这样，您就可以在不指定可执行文件位置的情况下运行您的程序。
    </p>

    <ul>
      <li>
        在 Linux 或 Mac 上，运行以下命令：

        <pre>
$ export PATH=$PATH:/path/to/your/install/directory
</pre>
      </li>

      <li>
        在 Windows 上，运行以下命令：

        <pre>
$ set PATH=%PATH%;C:\path\to\your\install\directory
</pre>
      </li>
    </ul>

    <p>
      或者，如果您已经有一个像 <code>$HOME/bin</code> 这样的目录在您的 shell 路径中，并且您想将 Go 程序安装到那里，您可以通过使用
      <a href="/cmd/go/#hdr-Print_Go_environment_information">
        <code>go env</code> 命令</a>设置 <code>GOBIN</code> 变量来更改安装目标：
    </p>

    <pre>
$ go env -w GOBIN=/path/to/your/bin
</pre>

    <p>
      或者
    </p>

    <pre>
$ go env -w GOBIN=C:\path\to\your\bin
</pre>
  </li>

  <li>
    更新 shell 路径后，运行 <code>go install</code> 命令来编译并安装该包。

    <pre>$ go install</pre>
  </li>

  <li>
    只需输入程序名称即可运行您的应用程序。为了让这更有趣，请打开一个新的命令提示符，然后在其他任意目录中运行 <code>hello</code> 可执行文件名称。

    <pre>
$ hello
map[Darrin:Hail, Darrin! Well met! Gladys:Great to see you, Gladys! Samantha:Hail, Samantha! Well met!]
</pre>
  </li>
</ol>

<p>
  这就是 Go 教程的全部内容！
</p>

<p class="Navigation">
  <a class="Navigation-prev" href="add-a-test.html">&lt; 添加测试</a>
  <a class="Navigation-next" href="module-conclusion.html">结论与更多资源链接 &gt;</a>
</p>