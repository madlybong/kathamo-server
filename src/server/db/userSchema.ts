import { Database } from "./index";
import type { Schema, User } from "../../types";
import { randomUUID } from "crypto";

class UserSchema implements Schema {
  private db: Database;
  private readonly baseColumns: string[] = [
    "id",
    "firstname",
    "lastname",
    "mobile",
    "email",
    "username",
    "password",
    "date_created",
    "date_updated",
    "last_seen",
    "verification_token",
    "permanent_access_token",
    "status",
  ];

  constructor(db: Database) {
    this.db = db;
  }

  public getTableName(): string {
    return "users";
  }

  public async initSchema(): Promise<void> {
    const sql =
      this.db.getDbType() === "sqlite"
        ? `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          firstname TEXT NOT NULL,
          lastname TEXT NOT NULL,
          mobile TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          date_created TEXT DEFAULT CURRENT_TIMESTAMP,
          date_updated TEXT DEFAULT CURRENT_TIMESTAMP,
          last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
          verification_token TEXT,
          permanent_access_token TEXT,
          status TEXT DEFAULT 'active'
        )
      `
        : `
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          firstname VARCHAR(255) NOT NULL,
          lastname VARCHAR(255) NOT NULL,
          mobile VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verification_token VARCHAR(255),
          permanent_access_token VARCHAR(255),
          status VARCHAR(50) DEFAULT 'active'
        )
      `;
    await this.db.query(sql);
  }

  public async insertDefaultData(): Promise<void> {
    const uuid = randomUUID();
    await this.db.query(
      `INSERT INTO users (
        id, firstname, lastname, mobile, email, username, password,
        verification_token, permanent_access_token, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid,
        "Admin",
        "User",
        "1234567890",
        "admin@example.com",
        "admin",
        "hashed_password",
        "",
        "",
        "active",
      ]
    );
  }

  public async addColumn(
    columnName: string,
    columnType: string
  ): Promise<void> {
    if (this.baseColumns.includes(columnName)) {
      throw new Error(
        `Cannot add column '${columnName}' as it is part of the base structure`
      );
    }

    const sqlType = this.normalizeColumnType(columnType);
    const sql =
      this.db.getDbType() === "sqlite"
        ? `ALTER TABLE users ADD COLUMN ${columnName} ${sqlType}`
        : `ALTER TABLE users ADD ${columnName} ${sqlType}`;

    await this.db.query(sql);
  }

  public async deleteColumn(columnName: string): Promise<void> {
    if (this.baseColumns.includes(columnName)) {
      throw new Error(
        `Cannot delete column '${columnName}' as it is part of the base structure`
      );
    }

    if (this.db.getDbType() === "sqlite") {
      // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
      await this.recreateTableWithoutColumn(columnName);
    } else {
      const sql = `ALTER TABLE users DROP COLUMN ${columnName}`;
      await this.db.query(sql);
    }
  }

  private async recreateTableWithoutColumn(columnName: string): Promise<void> {
    // Get current columns
    const columns = await this.getCurrentColumns();
    if (!columns.includes(columnName)) {
      throw new Error(`Column '${columnName}' does not exist`);
    }

    // Create temporary table with all columns except the one to delete
    const newColumns = columns.filter(
      (col) => col !== columnName && !this.baseColumns.includes(col)
    );
    const baseSchema = this.getBaseSchema();
    const newSchema = newColumns.map((col) => `${col} TEXT`).join(", ");
    const allColumns = [...this.baseColumns, ...newColumns];

    const tempTableSql = `
      CREATE TABLE users_temp (
        ${baseSchema}${newSchema ? ", " + newSchema : ""}
      )
    `;
    await this.db.query(tempTableSql);

    // Copy data
    const columnsList = allColumns.join(", ");
    await this.db.query(
      `INSERT INTO users_temp (${columnsList}) SELECT ${columnsList} FROM users`
    );

    // Drop original table and rename temporary table
    await this.db.query("DROP TABLE users");
    await this.db.query("ALTER TABLE users_temp RENAME TO users");
  }

  private async getCurrentColumns(): Promise<string[]> {
    if (this.db.getDbType() === "sqlite") {
      const result = await this.db.query<{ name: string }>(
        "PRAGMA table_info(users)"
      );
      return result.map((row) => row.name);
    } else {
      const result = await this.db.query<{ COLUMN_NAME: string }>(
        "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_name = 'users'"
      );
      return result.map((row) => row.COLUMN_NAME);
    }
  }

  private getBaseSchema(): string {
    return this.db.getDbType() === "sqlite"
      ? `
        id TEXT PRIMARY KEY,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        mobile TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        date_created TEXT DEFAULT CURRENT_TIMESTAMP,
        date_updated TEXT DEFAULT CURRENT_TIMESTAMP,
        last_seen TEXT DEFAULT CURRENT_TIMESTAMP,
        verification_token TEXT,
        permanent_access_token TEXT,
        status TEXT DEFAULT 'active'
      `
      : `
        id VARCHAR(36) PRIMARY KEY,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verification_token VARCHAR(255),
        permanent_access_token VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active'
      `;
  }

  private normalizeColumnType(type: string): string {
    const normalizedType = type.toUpperCase();
    const validTypes = [
      "TEXT",
      "INTEGER",
      "REAL",
      "BLOB",
      "VARCHAR",
      "INT",
      "FLOAT",
      "DATETIME",
    ];
    if (!validTypes.some((t) => normalizedType.startsWith(t))) {
      throw new Error(`Invalid column type: ${type}`);
    }
    return normalizedType;
  }

  public async insertUser(
    user: Omit<User, "id" | "date_created" | "date_updated" | "last_seen">
  ): Promise<void> {
    const uuid = randomUUID();
    await this.db.query(
      `INSERT INTO users (
        id, firstname, lastname, mobile, email, username, password,
        verification_token, permanent_access_token, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid,
        user.firstname,
        user.lastname,
        user.mobile,
        user.email,
        user.username,
        user.password,
        user.verification_token,
        user.permanent_access_token,
        user.status,
      ]
    );
  }

  public async getUserById(id: string): Promise<User | null> {
    const results = await this.db.query<User>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return results.length > 0 ? results[0] : null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const results = await this.db.query<User>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return results.length > 0 ? results[0] : null;
  }
}

export { UserSchema, User };
