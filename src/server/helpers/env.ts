import { join } from "path";
import { AppConfig } from "../../types";

const DEFAULT_CONFIG: AppConfig = {
  HOST: "localhost",
  PORT: 3000,
  CORS_ORIGIN: "http://localhost:5173",
  DB_TYPE: "sqlite", // Corrected to match knex.js client
  DB_PATH: "./kathamo.db",
  DB_HOST: "localhost",
  DB_PORT: 3306,
  DB_USER: "root",
  DB_PASSWORD: "",
  DB_NAME: "kathamo",
};

export default class AppEnv {
  private envFilePath: string;
  private envFile: Bun.BunFile;

  constructor() {
    this.envFilePath = join(__dirname, "../../../.env");
    this.envFile = Bun.file(this.envFilePath);
  }

  async init(): Promise<AppConfig> {
    try {
      // Check if .env exists, create with defaults if not
      if (!(await this.envFile.exists())) {
        const defaultEnvContent = `
# Server config
HOST=${DEFAULT_CONFIG.HOST}
PORT=${DEFAULT_CONFIG.PORT}
CORS_ORIGIN=${DEFAULT_CONFIG.CORS_ORIGIN}


#DB config
DB_TYPE="sqlite" #Corrected to match knex.js client

#SQLite DB config
DB_PATH="./kathamo.db"

#MySQL DB config
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=kathamo
`.trim();
        await Bun.write(this.envFilePath, defaultEnvContent);
        console.log("Created default .env file");
      }

      // Return parsed environment variables with defaults
      return {
        HOST: Bun.env.HOST || DEFAULT_CONFIG.HOST,
        PORT: Bun.env.PORT ? parseInt(Bun.env.PORT, 10) : DEFAULT_CONFIG.PORT,
        CORS_ORIGIN: Bun.env.CORS_ORIGIN || DEFAULT_CONFIG.CORS_ORIGIN,
        DB_TYPE: (Bun.env.DB_TYPE || DEFAULT_CONFIG.DB_TYPE) as
          | "sqlite"
          | "mysql",
        DB_PATH: Bun.env.DB_PATH || DEFAULT_CONFIG.DB_PATH,
        DB_HOST: Bun.env.DB_HOST || DEFAULT_CONFIG.DB_HOST,
        DB_PORT: Number(Bun.env.DB_PORT) || Number(DEFAULT_CONFIG.DB_PORT),
        DB_USER: Bun.env.DB_USER || DEFAULT_CONFIG.DB_USER,
        DB_PASSWORD: Bun.env.DB_PASSWORD || DEFAULT_CONFIG.DB_PASSWORD,
        DB_NAME: Bun.env.DB_NAME || DEFAULT_CONFIG.DB_NAME,
      };
    } catch (error) {
      console.error("Error initializing environment:", error);
      throw new Error("Failed to initialize environment configuration");
    }
  }
}
