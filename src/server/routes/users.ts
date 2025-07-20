import { AppConfig } from "../../types";
import { Database } from "../db";
import { UserService } from "../db/userService";

export async function handleUserRoutes(
  req: Request,
  db: Database,
  config: AppConfig
): Promise<Response> {
  const url = new URL(req.url);
  const headers = { "Content-Type": "application/json" };
  const userService = new UserService(db);

  const userIdMatch = url.pathname.match(/^\/api\/users\/(\d+)$/);
  if (req.method === "GET" && userIdMatch) {
    const userId = parseInt(userIdMatch[1]);
    const user = await userService.findUserById(userId);
    if (user) {
      return new Response(
        JSON.stringify({ message: `User ${userId} found`, user }),
        { status: 200, headers }
      );
    }
    return new Response(
      JSON.stringify({ message: `User ${userId} not found` }),
      { status: 404, headers }
    );
  }

  return new Response(JSON.stringify({ message: "User endpoint not found" }), {
    status: 404,
    headers,
  });
}
