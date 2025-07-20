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

import type { ServerWebSocket, Server } from "bun";
import { serve } from "bun";
import { join } from "path";
import { apiRouter } from "./routes";
import { handleWebSocket } from "./ws/websocket";
import AppEnv from "./helpers/env";
import { Database } from "./db";
import { bootstrapApp } from "./helpers/bootstrap";
import { UserSchema } from "./db/userSchema";
import { Schema } from "../types";

async function startServer() {
  const appEnv = new AppEnv();
  const config = await appEnv.init();

  // Initialize database
  const db = await Database.getInstance({
    type: config.DB_TYPE,
    sqlitePath: config.DB_PATH,
    mysqlConfig: {
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      database: config.DB_NAME,
      password: config.DB_PASSWORD,
    },
  });
  // Initialize schemas
  const schemas: Schema[] = [new UserSchema(db)];

  // Bootstrap database with multiple schemas
  const schemaResults = await bootstrapApp(db, config, schemas);
  console.log("Schema existence results:", schemaResults);

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": config.CORS_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const server = serve({
    port: config.PORT,
    hostname: config.HOST,
    async fetch(req: Request, server: Server) {
      const url = new URL(req.url);
      const CLIENT_DIR = join(__dirname, "../../dist/client");

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
        const response = await apiRouter(req, db, config);
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
              ...corsHeaders,
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

  console.log(`Server running at http://${config.HOST}:${config.PORT}`);
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
