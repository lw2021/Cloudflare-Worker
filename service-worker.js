export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 节点配置，包括 CF 官方 IP 和其他自建代理 IP
    const nodes = [
      {
        region: "US",
        ip: "104.16.166.19", // Cloudflare 美国官方 IP
        port: "443",
        uuid: "fixed-uuid-us",
        path: "/vless",
      },
      {
        region: "EU",
        ip: "104.24.231.211", // Cloudflare 欧洲官方 IP
        port: "443",
        uuid: "fixed-uuid-eu",
        path: "/vless",
      },
      {
        region: "ASIA",
        ip: "172.64.150.202", // Cloudflare 亚洲官方 IP
        port: "443",
        uuid: "fixed-uuid-asia",
        path: "/vless",
      },
      {
        region: "US-Proxy",
        ip: "your-proxy-ip", // 用户自建的代理 IP
        port: "443",
        uuid: "custom-uuid-1", // 自定义 UUID
        path: "/vless",
      },
      {
        region: "EU-Proxy",
        ip: "your-proxy-ip", // 用户自建的代理 IP
        port: "443",
        uuid: "custom-uuid-2", // 自定义 UUID
        path: "/vless",
      },
      {
        region: "ASIA-Proxy",
        ip: "your-proxy-ip", // 用户自建的代理 IP
        port: "443",
        uuid: "custom-uuid-3", // 自定义 UUID
        path: "/vless",
      },
    ];

    // 获取节点延迟并选择最佳节点
    async function testLatency(node) {
      const start = Date.now();
      const response = await fetch(`https://${node.ip}:${node.port}${node.path}`);
      const end = Date.now();
      return {
        node,
        latency: end - start,
      };
    }

    // 测试所有节点并选择延迟最小的节点
    async function getBestNode() {
      const nodeLatencies = await Promise.all(
        nodes.map((node) => testLatency(node))
      );
      const bestNode = nodeLatencies.sort((a, b) => a.latency - b.latency)[0];
      return bestNode.node;
    }

    // 新闻网站伪装首页
    if (path === "/") {
      return new Response(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="Breaking News">
          <title>Breaking News Today</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            header { background-color: #333; color: white; padding: 15px 0; text-align: center; }
            header h1 { margin: 0; font-size: 2em; }
            nav { background-color: #222; padding: 10px 0; text-align: center; }
            nav a { color: white; margin: 0 15px; text-decoration: none; font-size: 1.1em; }
            article { margin: 20px; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            article h2 { color: #333; }
            article p { font-size: 1.1em; color: #555; }
          </style>
        </head>
        <body>
          <header>
            <h1>Breaking News Today</h1>
          </header>
          <nav>
            <a href="#">Home</a>
            <a href="#">World</a>
            <a href="#">Politics</a>
            <a href="#">Technology</a>
            <a href="#">Sports</a>
            <a href="#">Entertainment</a>
          </nav>
          <article>
            <h2>Global Markets React to Latest Economic News</h2>
            <p>Markets around the world experienced fluctuations today as investors reacted to the latest economic reports. Experts are predicting continued volatility in the coming weeks.</p>
          </article>
          <article>
            <h2>Technology Industry Faces New Challenges in 2024</h2>
            <p>The tech industry is facing new hurdles as major companies adapt to changing market conditions. Industry leaders are exploring new strategies to stay ahead of the curve.</p>
          </article>
          <article>
            <h2>Sports: New Records Set in International Football</h2>
            <p>Football enthusiasts witnessed new records being set as the international tournaments continue. The competition this year is heating up as top players aim for glory.</p>
          </article>
        </body>
        </html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // 获取最佳节点
    if (path === "/best-node") {
      const bestNode = await getBestNode();
      return new Response(
        JSON.stringify({
          region: bestNode.region,
          ip: bestNode.ip,
          uuid: bestNode.uuid,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 返回节点订阅
    if (path === "/sub") {
      const subscription = nodes.map((node) => {
        return `vless://${btoa(
          JSON.stringify({
            v: "2",
            ps: node.region,
            add: node.ip,
            port: node.port,
            id: node.uuid,
            aid: "0",
            net: "ws",
            type: "none",
            host: node.ip,
            path: node.path,
            tls: "tls",
          })
        )}`;
      });

      const encodedSubscription = btoa(subscription.join("\n"));
      return new Response(encodedSubscription, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 返回 404 页面
    return new Response("404 Not Found", { status: 404 });
  },
};
