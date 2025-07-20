import { serve } from "bun";
import { join } from "path";
import { apiRouter } from "./routes/api";
import { handleWebSocket } from "./ws/websocket";
import type { Server, ServerWebSocket } from "bun";

const PORT = 3000;
const CLIENT_DIR = join(__dirname, "../../dist/client");

const server = serve({
  port: PORT,
  async fetch(req: Request, server: Server) {
    const url = new URL(req.url);

    // Handle WebSocket connections
    if (url.pathname === "/ws") {
      if (server.upgrade(req)) {
        return;
      }
      return new Response("WebSocket upgrade failed", { status: 500 });
    }

    // Handle REST API routes
    if (url.pathname.startsWith("/api")) {
      return await apiRouter(req);
    }

    // Serve Vue app static files
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = join(CLIENT_DIR, path);

    try {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    } catch (error) {
      return new Response("Server error", { status: 500 });
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

console.log(`Server running at http://localhost:${PORT}`);
