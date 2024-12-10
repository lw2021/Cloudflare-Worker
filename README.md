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
