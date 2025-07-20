export async function handleContentRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const headers = { "Content-Type": "application/json" };

  const contentIdMatch = url.pathname.match(/^\/api\/content\/(\d+)$/);
  if (req.method === "GET" && contentIdMatch) {
    const contentId = parseInt(contentIdMatch[1]);

    // if (content) {
    //   return new Response(
    //     JSON.stringify({ message: `Content ${contentId} found`, content }),
    //     { status: 200, headers }
    //   );
    // }
    return new Response(
      JSON.stringify({ message: `Content ${contentId} not found` }),
      { status: 404, headers }
    );
  }

  return new Response(
    JSON.stringify({ message: "Content endpoint not found" }),
    { status: 404, headers }
  );
}
