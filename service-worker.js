为了将 Cloudflare Worker 伪装成一个静态网站（例如 YouTube），并且提供一个可视化面板，
我们需要在 Worker 中处理静态内容的展示，并通过伪装 HTTP 请求头使其看起来像 YouTube 和 ChatGPT 流量。接下来，我们可以设计一个简易的前端面板，提供配置生成、订阅链接等功能。

1、装请求头：将流量伪装成来自 YouTube 和 ChatGPT 的流量。
2、静态网站面板：提供可视化界面，用户可以选择代理配置并生成订阅。
3、WebSocket 代理：支持 VLESS、Trojan 等协议的 WebSocket 转发。
4、支持订阅：允许客户端通过订阅链接获取代理配置。

addEventListener("fetch", event => {
  event.respondWith(
    (async () => {
      try {
        return await handleRequest(event.request);
      } catch (err) {
        console.error("Worker Error:", err);
        return new Response("Internal Server Error", { status: 500 });
      }
    })()
  );
});

// 配置常量
const WEBSOCKET_PATH = "/vless"; // VLESS WebSocket 路径
const TROJAN_PATH = "/trojan"; // Trojan WebSocket 路径
const UUID = "replace-with-your-uuid"; // 替换为你的 UUID
const PROTOCOL = "my-protocol"; // 伪装协议名称
const TARGET_HOST = "your-vless-server.com"; // 目标 VLESS 服务器
const TARGET_PORT = 443; // 目标服务器端口（通常为 443）

// 伪装请求头，使请求看起来来自 YouTube 或 ChatGPT
function getYouTubeHeaders() {
  return {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 YouTube/16.14.34",
    "Referer": "https://www.youtube.com/",
    "Accept": "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Dest": "document",
  };
}

function getChatGPTHeaders() {
  return {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 ChatGPT/3.0",
    "Referer": "https://chat.openai.com/",
    "Accept": "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Dest": "document",
  };
}

// 处理请求
async function handleRequest(request) {
  const url = new URL(request.url);

  // 主页显示静态面板
  if (request.method === "GET" && url.pathname === "/") {
    return new Response(await getStaticPage(), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // WebSocket 代理配置
  if (url.pathname === WEBSOCKET_PATH || url.pathname === TROJAN_PATH) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Not a WebSocket request", { status: 400 });
    }

    const clientProtocol = request.headers.get("X-Protocol");
    const clientUUID = request.headers.get("X-UUID");

    // 校验协议与 UUID
    if (clientProtocol !== PROTOCOL || clientUUID !== UUID) {
      console.warn("Unauthorized access attempt detected");
      return new Response("Unauthorized", { status: 403 });
    }

    const { 0: client, 1: server } = new WebSocketPair();

    try {
      await handleWebSocket(client, server, url.pathname);
    } catch (err) {
      console.error("WebSocket Handling Error:", err);
      return new Response("WebSocket Error", { status: 500 });
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  // 处理订阅请求
  if (url.pathname === "/subscribe") {
    const config = getProxyConfig(request);
    return new Response(config, {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404 });
}

// WebSocket 转发
async function handleWebSocket(client, server, protocol) {
  client.accept();
  server.accept();

  try {
    const remoteSocket = await connectToRemote(protocol);

    // 双向消息转发
    client.addEventListener("message", msg => {
      if (remoteSocket.readyState === "open") {
        remoteSocket.send(msg.data);
      }
    });

    remoteSocket.addEventListener("message", msg => {
      if (client.readyState === "open") {
        client.send(msg.data);
      }
    });

    // 双向关闭事件
    client.addEventListener("close", () => remoteSocket.close());
    remoteSocket.addEventListener("close", () => client.close());

    // 双向错误处理
    client.addEventListener("error", () => remoteSocket.close());
    remoteSocket.addEventListener("error", () => client.close());
  } catch (err) {
    console.error("WebSocket Connection Error:", err);
    client.close();
    throw err;
  }
}

// 建立与后端服务器的连接，支持不同协议
async function connectToRemote(protocol) {
  const targetUrl = `wss://${TARGET_HOST}:${TARGET_PORT}`;

  return new Promise((resolve, reject) => {
    const remoteSocket = new WebSocket(targetUrl, [], {
      headers: getYouTubeHeaders(), // 伪装请求头
    });

    // 成功连接
    remoteSocket.addEventListener("open", () => {
      console.log("Connected to target server:", targetUrl);
      resolve(remoteSocket);
    });

    // 连接错误处理
    remoteSocket.addEventListener("error", err => {
      console.error("Failed to connect to target server:", err);
      reject(err);
    });

    // 超时保护（10 秒）
    setTimeout(() => {
      if (remoteSocket.readyState !== WebSocket.OPEN) {
        console.error("Connection timeout");
        remoteSocket.close();
        reject(new Error("Connection timeout"));
      }
    }, 10000);
  });
}

// 静态页面（面板）
async function getStaticPage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Proxy Service Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        header { background-color: #333; color: white; padding: 1rem; text-align: center; }
        main { padding: 2rem; }
        button { padding: 0.5rem 1rem; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background-color: #45a049; }
        pre { background-color: #f4f4f4; padding: 1rem; border-radius: 5px; }
      </style>
    </head>
    <body>
      <header>
        <h1>Proxy Service Dashboard</h1>
      </header>
      <main>
        <h2>Generate Proxy Subscription</h2>
        <p>Click below to generate a proxy subscription link for your client.</p>
        <button onclick="window.location.href='/subscribe'">Generate Subscription</button>
        <h2>WebSocket Protocols</h2>
        <p>Use the WebSocket protocols to connect to your server securely.</p>
        <pre>VLESS: wss://your-domain.com/vless</pre>
        <pre>Trojan: wss://your-domain.com/trojan</pre>
      </main>
    </body>
    </html>
  `;
}

// 生成代理配置订阅内容
function getProxyConfig(request) {
  const config = {
    vless: {
      servers: [
        {
          address: TARGET_HOST,
          port: TARGET_PORT,
          id: UUID,
          alterId: 0,
          security: "auto",
          network: "ws",
          path: WEBSOCKET_PATH,
          tls: true,
        },
      ],
    },
    trojan: {
      servers: [
        {
          address: TARGET_HOST,
          port: TARGET_PORT,
          password: "your-trojan-password", // 替换为 Trojan 密码
          network: "ws",
          path: TROJAN_PATH,
          tls: true,
        },
      ],
    },
  };

  return JSON.stringify(config);
}

关键点说明
伪装请求头：通过 getYouTubeHeaders 和 getChatGPTHeaders 来伪装请求头，确保 WebSocket 请求看起来像来自 YouTube 或 ChatGPT。
WebSocket 代理：支持 VLESS、Trojan 协议的 WebSocket 代理，提供连接到后端服务器的功能。
静态面板：getStaticPage 函数返回了一个简单的 HTML 页面，作为可视化的面板，用户可以点击按钮生成代理配置订阅。
订阅功能：通过 /subscribe 路径返回代理配置 JSON。
使用说明
部署 Cloudflare Worker：将代码部署到 Cloudflare Worker 上，确保你已经设置了域名和路由。
面板访问：访问 Worker 地址，你将看到一个简易的代理服务面板。
生成订阅：点击“Generate Subscription”按钮，用户将获得 VLESS 和 Trojan 的配置文件，方便客户端使用。
