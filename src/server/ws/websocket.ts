import type { ServerWebSocket } from "bun";

export function handleWebSocket(
  ws: ServerWebSocket,
  event: string,
  message?: string
): void {
  switch (event) {
    case "open":
      ws.send("WebSocket connection established!");
      break;
    case "message":
      if (message) {
        ws.send(`Echo: ${message}`);
      }
      break;
    case "close":
      console.log("WebSocket connection closed");
      break;
  }
}
