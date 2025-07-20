import { RouteHandler } from "../../types";

export async function handleContentRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const headers = { "Content-Type": "application/json" };

  const contentIdMatch = url.pathname.match(/^\/api\/content\/(\d+)$/);
  if (req.method === "GET" && contentIdMatch) {
    const contentId = contentIdMatch[1];
    // Placeholder: Fetch content from database
    return new Response(
      JSON.stringify({ message: `Content ${contentId} found`, contentId }),
      { status: 200, headers }
    );
  }

  return new Response(
    JSON.stringify({ message: "Content endpoint not found" }),
    { status: 404, headers }
  );
}
