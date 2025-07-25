import { Database } from "../server/db";

export interface ApiResponse {
  message: string;
  [key: string]: any;
}

export interface WebSocketMessage {
  type: "open" | "message" | "close";
  data?: string;
}

export interface RouteHandler {
  (req: Request, db: Database, config: AppConfig): Promise<Response>;
}

export interface Route {
  path: RegExp;
  method: string;
  handler: RouteHandler;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  mobile: string;
  email: string;
  username: string;
  password: string;
  date_created: string;
  date_updated: string;
  last_seen: string;
  verification_token: string;
  permanent_access_token: string;
  status: string;
  [key: string]: any; // Allow for dynamic columns
}

export interface Content {
  id: number;
  title: string;
  body: string | null;
}

export interface AuthToken {
  id: number;
  user_id: number;
  token: string;
  created_at: string;
}

export interface AppConfig {
  HOST: string;
  PORT: number;
  CORS_ORIGIN: string;
  DB_TYPE: "sqlite" | "mysql";
  DB_PATH: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

export interface DatabaseConfig {
  type: "sqlite" | "mysql";
  sqlitePath: string;
  mysqlConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
}

export interface Schema {
  initSchema(): Promise<void>;
  insertDefaultData(): Promise<void>;
  getTableName(): string;
}
