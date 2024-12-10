export default {
  async fetch(req) {
    const n = new URL(req.url);
    const p = n.pathname;
    const u = req.headers.get("User-Agent");

    // 节点池配置，包括 CF 官方 IP 和自建 Proxy
    const a = [
      {
        r: "US",
        i: "104.16.166.19", // Cloudflare 美国官方 IP
        t: "443",
        u: "fixed-uuid-us",
        s: "/vless",
      },
      {
        r: "EU",
        i: "104.24.231.211", // Cloudflare 欧洲官方 IP
        t: "443",
        u: "fixed-uuid-eu",
        s: "/vless",
      },
      {
        r: "ASIA",
        i: "172.64.150.202", // Cloudflare 亚洲官方 IP
        t: "443",
        u: "fixed-uuid-asia",
        s: "/vless",
      },
      {
        r: "US-Proxy",
        i: "your-proxy-ip", // 用户自建的代理 IP
        t: "443",
        u: "custom-uuid-1", // 自定义 UUID
        s: "/vless",
      },
      {
        r: "EU-Proxy",
        i: "your-proxy-ip", // 用户自建的代理 IP
        t: "443",
        u: "custom-uuid-2", // 自定义 UUID
        s: "/vless",
      },
      {
        r: "ASIA-Proxy",
        i: "your-proxy-ip", // 用户自建的代理 IP
        t: "443",
        u: "custom-uuid-3", // 自定义 UUID
        s: "/vless",
      },
    ];

    // Netflix 和 YouTube 访问规则
    const rules = {
      "netflix.com": { region: "US", path: "/netflix", proxy: true },
      "youtube.com": { region: "US", path: "/youtube", proxy: true },
    };

    // 自动选择最佳节点
    async function d(e) {
      const t = Date.now();
      const r = await fetch(`https://${e.i}:${e.t}${e.s}`);
      const o = Date.now();
      return {
        n: e,
        l: o - t,
      };
    }

    async function m() {
      const e = await Promise.all(
        a.map((e) => d(e))
      );
      const t = e.sort((e, t) => e.l - t.l)[0];
      return t.n;
    }

    // 访问Netflix和YouTube的自动规则
    if (p.includes("netflix.com") || p.includes("youtube.com")) {
      const rule = rules[n.hostname];
      if (rule && rule.proxy) {
        // 判断是否是Netflix或YouTube流量，并优先选择代理节点
        const e = await m();
        return new Response(
          JSON.stringify({
            region: e.r,
            ip: e.i,
            uuid: e.u,
            path: rule.path, // 动态路径
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 新闻网站伪装首页
    if (p === "/") {
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
    if (p === "/best-node") {
      const e = await m();
      return new Response(
        JSON.stringify({
          region: e.r,
          ip: e.i,
          uuid: e.u,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 返回节点订阅
    if (p === "/sub") {
      const e = a.map((e) => {
        return `vless://${btoa(
          JSON.stringify({
            v: "2",
            ps: e.r,
            add: e.i,
            port: e.t,
            id: e.u,
            aid: "0",
            net: "ws",
            type: "none",
            host: e.i,
            path: e.s,
            tls: "tls",
          })
        )}`;
      });

      const t = btoa(e.join("\n"));
      return new Response(t, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new Response("404 Not Found", { status: 404 });
  },
};
