import { Database as SQLiteDatabase } from "bun:sqlite";
import mysql, { Connection, Pool } from "mysql2/promise";
import { DatabaseConfig } from "../../types";

export class Database {
  private static instance: Database;
  private connection: SQLiteDatabase | Pool | null = null;
  private dbType: "sqlite" | "mysql";

  private constructor(config: DatabaseConfig) {
    this.dbType = config.type;
  }

  public static async getInstance(config: DatabaseConfig): Promise<Database> {
    if (!Database.instance) {
      Database.instance = new Database(config);
      await Database.instance.init(config);
    }
    return Database.instance;
  }

  private async init(config: DatabaseConfig): Promise<void> {
    if (config.type === "sqlite") {
      this.connection = new SQLiteDatabase(config.sqlitePath || ":memory:");
    } else {
      this.connection = await mysql.createPool({
        host: config.mysqlConfig.host || "localhost",
        port: config.mysqlConfig.port || 3306,
        user: config.mysqlConfig.user || "root",
        password: config.mysqlConfig.password || "",
        database: config.mysqlConfig.database || "default_db",
        connectionLimit: 10,
      });
    }
  }

  public async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.connection)
      throw new Error("Database connection not initialized");

    if (this.dbType === "sqlite") {
      const db = this.connection as SQLiteDatabase;
      const stmt = db.prepare(sql);
      return stmt.all(...params) as T[];
    } else {
      const pool = this.connection as Pool;
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.execute(sql, params);
        return rows as T[];
      } finally {
        conn.release();
      }
    }
  }

  public async close(): Promise<void> {
    if (!this.connection) return;

    if (this.dbType === "sqlite") {
      (this.connection as SQLiteDatabase).close();
    } else {
      await (this.connection as Pool).end();
    }
    this.connection = null;
  }

  public getDbType(): "sqlite" | "mysql" {
    return this.dbType;
  }
}
