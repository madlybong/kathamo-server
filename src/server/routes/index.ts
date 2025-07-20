import { AppConfig, Route } from "../../types";
import { handleAuthRoutes } from "./auth";
import { handleUserRoutes } from "./users";
import { handleContentRoutes } from "./content";
import { Database } from "../db";

const routes: Route[] = [
  // Authentication routes
  {
    path: /^\/api\/auth\/.*/,
    method: "GET",
    handler: handleAuthRoutes,
  },
  {
    path: /^\/api\/auth\/.*/,
    method: "POST",
    handler: handleAuthRoutes,
  },
  // User routes
  {
    path: /^\/api\/users\/.*/,
    method: "GET",
    handler: handleUserRoutes,
  },
  // Content routes
  {
    path: /^\/api\/content\/.*/,
    method: "GET",
    handler: handleContentRoutes,
  },
];

export async function apiRouter(
  req: Request,
  db: Database,
  config: AppConfig
): Promise<Response> {
  const url = new URL(req.url);

  for (const route of routes) {
    if (route.path.test(url.pathname) && route.method === req.method) {
      return await route.handler(req, db, config);
    }
  }

  return new Response("Not found", {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
