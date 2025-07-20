// import { serve } from "bun";
// import { join } from "path";
// import { apiRouter } from "./routes/api";
// import { handleWebSocket } from "./ws/websocket";
// import type { Server, ServerWebSocket } from "bun";

// const PORT = 3000;
// const CLIENT_DIR = join(__dirname, "../../dist/client");

// const server = serve({
//   port: PORT,
//   async fetch(req: Request, server: Server) {
//     const url = new URL(req.url);

//     // Handle WebSocket connections
//     if (url.pathname === "/ws") {
//       if (server.upgrade(req)) {
//         return;
//       }
//       return new Response("WebSocket upgrade failed", { status: 500 });
//     }

//     // Handle REST API routes
//     if (url.pathname.startsWith("/api")) {
//       return await apiRouter(req);
//     }

//     // Serve Vue app static files
//     const path = url.pathname === "/" ? "/index.html" : url.pathname;
//     const filePath = join(CLIENT_DIR, path);

//     try {
//       const file = Bun.file(filePath);
//       if (await file.exists()) {
//         if (file.size > 10 * 1024 * 1024) {
//           // Limit file size to 10MB
//           return new Response("File too large", { status: 413 });
//         }
//         const ext = path.split(".").pop()?.toLowerCase();
//         const mimeTypes: Record<string, string> = {
//           html: "text/html",
//           js: "application/javascript",
//           css: "text/css",
//           png: "image/png",
//           jpg: "image/jpeg",
//           ico: "image/x-icon",
//         };
//         const contentType = mimeTypes[ext!] || "application/octet-stream";
//         return new Response(file, {
//           headers: {
//             "Content-Type": contentType,
//             "Content-Security-Policy":
//               "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
//           },
//         });
//       }
//       return new Response("Not found", { status: 404 });
//     } catch (error) {
//       console.error("Server error:", error);
//       return new Response("Internal server error", { status: 500 });
//     }
//   },
//   websocket: {
//     open(ws: ServerWebSocket) {
//       handleWebSocket(ws, "open");
//     },
//     message(ws: ServerWebSocket, message: string) {
//       handleWebSocket(ws, "message", message);
//     },
//     close(ws: ServerWebSocket) {
//       handleWebSocket(ws, "close");
//     },
//   },
// });

// console.log(`Server running at http://localhost:${PORT}`);

import { serve } from "bun";
import { join } from "path";
import { apiRouter } from "./routes/";
import { handleWebSocket } from "./ws/websocket";
import type { ServerWebSocket, Server } from "bun";

// Default configuration
const DEFAULT_CONFIG = {
  HOST: "localhost",
  PORT: 3000,
  CORS_ORIGIN: "http://localhost:5173", // Allow Vite dev server by default
};

// Load environment variables
const HOST = Bun.env.HOST || DEFAULT_CONFIG.HOST;
const PORT = Bun.env.PORT ? parseInt(Bun.env.PORT, 10) : DEFAULT_CONFIG.PORT;
const CORS_ORIGIN = Bun.env.CORS_ORIGIN || DEFAULT_CONFIG.CORS_ORIGIN;
const CLIENT_DIR = join(__dirname, "../../dist/client");

// Write default .env file if it doesn't exist
const envFilePath = join(__dirname, "../../../.env");
const envFile = Bun.file(envFilePath);

if (!(await envFile.exists())) {
  const defaultEnvContent = `
HOST=${DEFAULT_CONFIG.HOST}
PORT=${DEFAULT_CONFIG.PORT}
CORS_ORIGIN=${DEFAULT_CONFIG.CORS_ORIGIN}
`.trim();
  await Bun.write(envFilePath, defaultEnvContent);
  console.log("Created default .env file");
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = serve({
  port: PORT,
  hostname: HOST,
  async fetch(req: Request, server: Server) {
    const url = new URL(req.url);

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Handle WebSocket connections
    if (url.pathname === "/ws") {
      if (server.upgrade(req, { headers: corsHeaders })) {
        return;
      }
      return new Response("WebSocket upgrade failed", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Handle REST API routes
    if (url.pathname.startsWith("/api")) {
      const response = await apiRouter(req);
      // Add CORS headers to API responses
      for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
      }
      return response;
    }

    // Serve Vue app static files
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = join(CLIENT_DIR, path);

    try {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        if (file.size > 10 * 1024 * 1024) {
          // Limit file size to 10MB
          return new Response("File too large", {
            status: 413,
            headers: corsHeaders,
          });
        }
        const ext = path.split(".").pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
          html: "text/html",
          js: "application/javascript",
          css: "text/css",
          png: "image/png",
          jpg: "image/jpeg",
          ico: "image/x-icon",
        };
        const contentType = mimeTypes[ext!] || "application/octet-stream";
        return new Response(file, {
          headers: {
            "Content-Type": contentType,
            ...corsHeaders, // Add CORS headers to static file responses
          },
        });
      }
      return new Response("Not found", { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error("Server error:", error);
      return new Response("Internal server error", {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
  websocket: {
    open(ws: ServerWebSocket) {
      handleWebSocket(ws, "open");
    },
    message(ws: ServerWebSocket, message: string) {
      handleWebSocket(ws, "message", message);
    },
    close(ws: ServerWebSocket) {
      handleWebSocket(ws, "close");
    },
  },
});

console.log(`Server running at http://${HOST}:${PORT}`);
