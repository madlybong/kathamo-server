import { Database } from "./index";

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

class UserSchema {
  private db: Database;

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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `
        : `
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    await this.db.query(sql);
  }

  public async insertDefaultData(): Promise<void> {
    await this.db.query("INSERT INTO users (username, email) VALUES (?, ?)", [
      "admin",
      "admin@example.com",
    ]);
  }

  public async insertUser(username: string, email: string): Promise<void> {
    await this.db.query("INSERT INTO users (username, email) VALUES (?, ?)", [
      username,
      email,
    ]);
  }

  public async getUserById(id: number): Promise<User | null> {
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
