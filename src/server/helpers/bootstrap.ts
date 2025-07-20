import { AppConfig, Schema } from "../../types";
import { Database } from "../db";

export const bootstrapApp = async (
  db: Database,
  config: AppConfig,
  schemas: Schema[]
) => {
  try {
    const results: boolean[] = [];

    for (const schema of schemas) {
      const tableName = schema.getTableName();
      const checkQuery =
        db.getDbType() === "sqlite"
          ? `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`
          : `SELECT 1 FROM information_schema.tables WHERE table_name = '${tableName}'`;

      const result = await db.query(checkQuery);

      if (result.length > 0) {
        results.push(true);
      } else {
        await schema.initSchema();
        await schema.insertDefaultData();
        results.push(false);
      }
    }

    return results;
  } catch (error) {
    throw error as Error;
  }
};
