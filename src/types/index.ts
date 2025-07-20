export interface ApiResponse {
  message: string;
}

export interface WebSocketMessage {
  type: "open" | "message" | "close";
  data?: string;
}

export interface RouteHandler {
  (req: Request): Promise<Response>;
}
