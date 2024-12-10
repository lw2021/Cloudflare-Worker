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

代码说明
新闻网站伪装：

/ 路径返回一个简单的新闻网站布局，包括标题、导航栏和文章内容，伪装成普通的新闻站点。
优选 IP 脚本：

/best-node 路径会自动选择延迟最低的节点（美洲、欧洲、亚洲等地区），并返回最佳节点的信息。
节点延迟通过 testLatency 函数进行测试，选择响应时间最短的节点。
订阅功能：

/sub 路径返回所有节点的 VMESS 订阅内容，以 Base64 编码的形式返回，兼容主流代理客户端。
自建 Proxy 和 CF 反代 IP：

支持自建代理 IP 和 Cloudflare 官方 IP 节点，并通过 uuid、region 等字段灵活配置。
使用步骤
部署到 Cloudflare Workers：

将代码保存为 worker.js 并上传到 Cloudflare Workers。
部署并获取 Worker URL，例如 https://your-worker-url/。
获取订阅：

访问 https://your-worker-url/sub 获取订阅内容。
获取最佳节点：

访问 https://your-worker-url/best-node 获取最佳节点的详细信息。
测试节点选择：

访问 /sub 和 /best-node 测试订阅功能和优选节点功能
