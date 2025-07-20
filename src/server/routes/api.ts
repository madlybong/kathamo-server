export async function apiRouter(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/api/hello" && req.method === "GET") {
    return new Response(JSON.stringify({ message: "Hello from REST API!" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Not found", { status: 404 });
}
