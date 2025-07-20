import { RouteHandler } from "../../types";

export async function handleUserRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const headers = { "Content-Type": "application/json" };

  const userIdMatch = url.pathname.match(/^\/api\/users\/(\d+)$/);
  if (req.method === "GET" && userIdMatch) {
    const userId = userIdMatch[1];
    // Placeholder: Fetch user from database
    return new Response(
      JSON.stringify({ message: `User ${userId} found`, userId }),
      { status: 200, headers }
    );
  }

  return new Response(JSON.stringify({ message: "User endpoint not found" }), {
    status: 404,
    headers,
  });
}
