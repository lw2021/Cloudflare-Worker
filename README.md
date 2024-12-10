伪装为新闻网站：使用简单的新闻网站布局，伪装成静态网站。
VLESS 代理：支持 VLESS 协议，提供加密和隐匿功能。
一键自建 ProxyIP 和 CF 反代 IP：通过 Cloudflare Workers 实现反向代理，并提供自建 ProxyIP 和 Cloudflare 反代 IP 选择功能。
CF 优选 IP 脚本：自动输出美国、美洲、欧洲地区最佳优选 IP，以便选择最优连接。
懒人小白专用：无需频繁更新订阅，客户端可直接选择最佳 IP 节点。
方案设计
新闻网站伪装：使用 HTML 和 CSS 伪装成新闻网站主页，提升隐匿性。
Cloudflare Workers 实现反向代理：提供 VLESS 代理的 Cloudflare 反代。
自动化优选脚本：通过检测不同地区的 IP 延迟，选择最佳 IP，自动输出美洲、亚洲、欧洲最佳节点。
默认节点：默认配置为 Cloudflare 官方 IP，不需要频繁更新订阅。

**演示地址：https://h5.wslyszxbjn.us.kg/**

混淆和增强隐匿性：

通过将变量名替换为无意义的短名称（如 r, i, t, u, s），使代码难以理解和逆向。
通过改动函数名、结构等，提高代码的隐匿性。
Netflix 和 YouTube 特殊访问规则：

rules 对象定义了对于 Netflix 和 YouTube 的特殊规则，当请求来自这些服务时，优先选择最优代理节点。
每个访问规则通过检查主机名来匹配请求，若符合条件，则优先选择代理节点，并返回相关节点信息。
新闻网站伪装：

/ 路径提供一个简单的新闻网站主页，用于伪装。
优选节点和订阅：

/best-node 路径返回延迟最低的节点信息。
/sub 路径返回所有节点的订阅信息，兼容 VLESS 客户端。
使用方法：
部署到 Cloudflare Workers：

将此代码上传到 Cloudflare Workers 并部署。
访问您的 Worker URL（如 https://your-worker-url/）。
获取订阅：

访问 https://your-worker-url/sub 获取订阅内容。
获取最佳节点：

访问 https://your-worker-url/best-node 获取最佳节点信息。
通过这种方式，您不仅可以隐藏 Cloudflare Workers 的真实用途，还可以为特定服务（如 Netflix 和 YouTube）提供优化的代理服务，且无需频繁更新订阅。
访问 https://your-worker-url/best-node 获取最佳节点的详细信息。
测试节点选择：

访问 /sub 和 /best-node 测试订阅功能和优选节点功能
