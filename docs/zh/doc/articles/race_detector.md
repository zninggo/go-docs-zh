<!--{
	"Title": "数据竞争检测器"
}-->

<h2 id="Introduction">简介</h2>

<p>
数据竞争是并发系统中最常见且最难调试的 Bug 类型之一。
当两个 goroutine 并发访问同一变量，且至少有一次访问为写操作时，就会发生数据竞争。
详情请参见<a href="/ref/mem/">《Go 内存模型》</a>。
</p>

<p>
以下是一个可能导致崩溃和内存损坏的数据竞争示例：
</p>

<pre>
func main() {
	c := make(chan bool)
	m := make(map[string]string)
	go func() {
		m["1"] = "a" // 第一次冲突访问
		c &lt;- true
	}()
	m["2"] = "b" // 第二次冲突访问
	&lt;-c
	for k, v := range m {
		fmt.Println(k, v)
	}
}
</pre>

<h2 id="Usage">使用方法</h2>

<p>
为帮助诊断此类 Bug，Go 语言内置了数据竞争检测器。
使用时，只需在 go 命令中添加 <code>-race</code> 标志：
</p>

<pre>
$ go test -race mypkg    // 测试包
$ go run -race mysrc.go  // 运行源文件
$ go build -race mycmd   // 构建命令
$ go install -race mypkg // 安装包
</pre>

<h2 id="Report_Format">报告格式</h2>

<p>
当检测器在程序中发现数据竞争时，会打印一份报告。
报告包含冲突访问的调用栈，以及涉及的相关 goroutine 创建时的调用栈。
示例如下：
</p>

<pre>
WARNING: DATA RACE
Read by goroutine 185:
  net.(*pollServer).AddFD()
      src/net/fd_unix.go:89 +0x398
  net.(*pollServer).WaitWrite()
      src/net/fd_unix.go:247 +0x45
  net.(*netFD).Write()
      src/net/fd_unix.go:540 +0x4d4
  net.(*conn).Write()
      src/net/net.go:129 +0x101
  net.func·060()
      src/net/timeout_test.go:603 +0xaf

Previous write by goroutine 184:
  net.setWriteDeadline()
      src/net/sockopt_posix.go:135 +0xdf
  net.setDeadline()
      src/net/sockopt_posix.go:144 +0x9c
  net.(*conn).SetDeadline()
      src/net/net.go:161 +0xe3
  net.func·061()
      src/net/timeout_test.go:616 +0x3ed

Goroutine 185 (running) created at:
  net.func·061()
      src/net/timeout_test.go:609 +0x288

Goroutine 184 (running) created at:
  net.TestProlongTimeout()
      src/net/timeout_test.go:618 +0x298
  testing.tRunner()
      src/testing/testing.go:301 +0xe8
</pre>

<h2 id="Options">选项</h2>

<p>
环境变量 <code>GORACE</code> 用于设置竞争检测器的选项。
格式如下：
</p>

<pre>
GORACE="option1=val1 option2=val2"
</pre>

<p>
可选项包括：
</p>

<ul>
<li>
<code>log_path</code>（默认 <code>stderr</code>）：检测器将报告写入名为 <code>log_path.<em>pid</em></code> 的文件。
特殊名称 <code>stdout</code>
和 <code>stderr</code> 分别将报告输出到标准输出和标准错误。
</li>

<li>
<code>exitcode</code>（默认 <code>66</code>）：检测到数据竞争后退出时的状态码。
</li>

<li>
<code>strip_path_prefix</code>（默认 <code>""</code>）：从所有报告的文件路径中移除此前缀，使报告更简洁。
</li>

<li>
<code>history_size</code>（默认 <code>1</code>）：每个 goroutine 的内存访问历史大小为 <code>32K * 2**history_size</code> 个元素。
增加此值可避免报告中出现"failed to restore the stack"错误，但会占用更多内存。
</li>

<li>
<code>halt_on_error</code>（默认 <code>0</code>）：控制程序在报告第一个数据竞争后是否退出。
</li>

<li>
<code>atexit_sleep_ms</code>（默认 <code>1000</code>）：退出前主 goroutine 的休眠时间（毫秒）。
</li>
</ul>

<p>
示例：
</p>

<pre>
$ GORACE="log_path=/tmp/race/report strip_path_prefix=/my/go/sources/" go test -race
</pre>

<h2 id="Excluding_Tests">排除测试</h2>

<p>
当使用 <code>-race</code> 标志构建时，<code>go</code> 命令会定义额外的<a href="/pkg/go/build/#hdr-Build_Constraints">构建标签</a> <code>race</code>。
可利用此标签在运行竞争检测器时排除特定代码和测试。
示例：
</p>

<pre>
// +build !race

package foo

// 该测试包含数据竞争（参见 issue 123）。
func TestFoo(t *testing.T) {
	// ...
}

// 该测试因超时在竞争检测器下失败。
func TestBar(t *testing.T) {
	// ...
}

// 该测试在竞争检测器下耗时过长。
func TestBaz(t *testing.T) {
	// ...
}
</pre>

<h2 id="How_To_Use">使用建议</h2>

<p>
首先，使用竞争检测器运行测试（<code>go test -race</code>）。
竞争检测器只能发现运行时发生的数据竞争，因此无法检测未执行代码路径中的竞争。
如果测试覆盖率不完整，
可在实际工作负载下运行使用 <code>-race</code> 构建的二进制文件，以发现更多数据竞争。
</p>

<h2 id="Typical_Data_Races">典型数据竞争</h2>

<p>
以下是一些典型的数据竞争案例，均可通过竞争检测器检测出来。
</p>

<h3 id="Race_on_loop_counter">循环计数器竞争</h3>

<pre>
func main() {
	var wg sync.WaitGroup
	wg.Add(5)
	var i int
	for i = 0; i &lt; 5; i++ {
		go func() {
			fmt.Println(i) // 并非期望的 'i' 值。
			wg.Done()
		}()
	}
	wg.Wait()
}
</pre>

<p>
函数字面量中的变量 <code>i</code> 与循环使用的变量相同，因此
goroutine 中的读取操作与循环自增操作存在竞争。
（此程序通常输出 55555，而非 01234。）
可通过复制变量来修复程序：
</p>

<pre>
func main() {
	var wg sync.WaitGroup
	wg.Add(5)
	var i int
	for i = 0; i &lt; 5; i++ {
		go func(j int) {
			fmt.Println(j) // 正确：读取循环计数器的局部副本。
			wg.Done()
		}(i)
	}
	wg.Wait()
}
</pre>

<h3 id="Accidentally_shared_variable">意外共享变量</h3>

<pre>
// ParallelWrite 将数据写入 file1 和 file2，返回错误。
func ParallelWrite(data []byte) chan error {
	res := make(chan error, 2)
	f1, err := os.Create("file1")
	if err != nil {
		res &lt;- err
	} else {
		go func() {
			// 此 err 与主 goroutine 共享，
			// 因此本次写入与下方的写入存在竞争。
			_, err = f1.Write(data)
			res &lt;- err
			f1.Close()
		}()
	}
	f2, err := os.Create("file2") // 对 err 的第二次冲突写入。
	if err != nil {
		res &lt;- err
	} else {
		go func() {
			_, err = f2.Write(data)
			res &lt;- err
			f2.Close()
		}()
	}
	return res
}
</pre>

<p>
修复方法是在 goroutine 中引入新变量（注意使用 <code>:=</code>）：
</p>

<pre>
			...
			_, err := f1.Write(data)
			...
			_, err := f2.Write(data)
			...
</pre>

<h3 id="Unprotected_global_variable">未保护的全局变量</h3>

<p>
若以下代码被多个 goroutine 调用，将导致 <code>service</code> 映射发生竞争。
并发读写同一映射是不安全的：
</p>

<pre>
var service map[string]net.Addr

func RegisterService(name string, addr net.Addr) {
	service[name] = addr
}

func LookupService(name string) net.Addr {
	return service[name]
}
</pre>

<p>
为使代码安全，需使用互斥锁保护访问：
</p>

<pre>
var (
	service   map[string]net.Addr
	serviceMu sync.Mutex
)

func RegisterService(name string, addr net.Addr) {
	serviceMu.Lock()
	defer serviceMu.Unlock()
	service[name] = addr
}

func LookupService(name string) net.Addr {
	serviceMu.Lock()
	defer serviceMu.Unlock()
	return service[name]
}
</pre>

<h3 id="Primitive_unprotected_variable">未保护的基本类型变量</h3>

<p>
数据竞争也可能发生在基本类型变量（如 <code>bool</code>、<code>int</code>、<code>int64</code> 等）上，
如下例所示：
</p>

<pre>
type Watchdog struct{ last int64 }

func (w *Watchdog) KeepAlive() {
	w.last = time.Now().UnixNano() // 第一次冲突访问。
}

func (w *Watchdog) Start() {
	go func() {
		for {
			time.Sleep(time.Second)
			// 第二次冲突访问。
			if w.last &lt; time.Now().Add(-10*time.Second).UnixNano() {
				fmt.Println("No keepalives for 10 seconds. Dying.")
				os.Exit(1)
			}
		}
	}()
}
</pre>

<p>
即使是这种"无害的"数据竞争（data race），也可能因为内存访问的非原子性、
与编译器优化的干扰，或访问处理器内存时的重排序问题，导致难以调试的问题。
</p>

<p>
解决此类竞争问题的典型方法是使用通道（channel）或互斥锁（mutex）。
为了保持无锁行为，也可以使用
<a href="/pkg/sync/atomic/"><code>sync/atomic</code></a> 包。
</p>

<pre>
type Watchdog struct{ last int64 }

func (w *Watchdog) KeepAlive() {
	atomic.StoreInt64(&amp;w.last, time.Now().UnixNano())
}

func (w *Watchdog) Start() {
	go func() {
		for {
			time.Sleep(time.Second)
			if atomic.LoadInt64(&amp;w.last) &lt; time.Now().Add(-10*time.Second).UnixNano() {
				fmt.Println("No keepalives for 10 seconds. Dying.")
				os.Exit(1)
			}
		}
	}()
}
</pre>

<h3 id="Unsynchronized_send_and_close_operations">未同步的发送和关闭操作</h3>

<p>
如本例所示，对同一通道进行未同步的发送（send）和关闭（close）操作
同样可能引发竞态条件：
</p>

<pre>
c := make(chan struct{}) // 或有缓冲的通道

// 竞态检测器无法推断出以下发送和关闭操作之间的先后发生关系。
// 这两个操作是未同步的，并且会并发执行。
go func() { c &lt;- struct{}{} }()
close(c)
</pre>

<p>
根据 Go 内存模型（memory model），通道上的发送操作会先于（happens before）
该通道上相应的接收操作完成。要同步发送和关闭操作，请使用一个接收操作，
该操作能确保发送在关闭之前完成：
</p>

<pre>
c := make(chan struct{}) // 或有缓冲的通道

go func() { c &lt;- struct{}{} }()
&lt;-c
close(c)
</pre>

<h2 id="Requirements">要求</h2>

<p>
  竞态检测器需要启用 cgo，并且在非 Darwin 系统上需要安装 C 编译器。
  竞态检测器支持
  <code>linux/amd64</code>、<code>linux/ppc64le</code>、
  <code>linux/arm64</code>、<code>linux/s390x</code>、
  <code>linux/loong64</code>、<code>freebsd/amd64</code>、
  <code>netbsd/amd64</code>、<code>darwin/amd64</code>、
  <code>darwin/arm64</code> 和 <code>windows/amd64</code>。
</p>

<p>
  在 Windows 上，竞态检测器的运行时（runtime）对安装的 C 编译器版本敏感；
  从 Go 1.21 开始，使用 <code>-race</code> 构建程序需要一个包含了
  <code>mingw-w64</code> 运行时库 8 版或更高版本的 C 编译器。
  你可以通过使用参数
  <code>--print-file-name libsynchronization.a</code> 调用你的 C 编译器来测试。
  一个较新的、符合要求的 C 编译器会打印出这个库的完整路径，
  而较旧的 C 编译器则只会回显该参数。
</p>

<h2 id="Runtime_Overheads">运行时开销</h2>

<p>
竞态检测的开销因程序而异，但对于一个典型的程序，内存使用量可能会增加 5-10 倍，
执行时间可能会增加 2-20 倍。
</p>

<p>
竞态检测器目前会为每个 <code>defer</code> 和 <code>recover</code>
语句额外分配 8 字节的内存。这些额外的分配
<a href="/issue/26813">直到协程（goroutine）退出时才会被回收</a>。
这意味着，如果你有一个长期运行的协程，并且周期性地发出
<code>defer</code> 和 <code>recover</code> 调用，那么程序的内存使用量可能会
无限增长。这些内存分配不会出现在
<code>runtime.ReadMemStats</code> 或 <code>runtime/pprof</code> 的输出中。
</p>