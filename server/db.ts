import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

const { Pool } = pg;

let db: ReturnType<typeof drizzle> | undefined;
let pool: Pool | undefined;

if (!process.env.DATABASE_URL) {
  console.log(
    "DATABASE_URL not set. Database operations will be unavailable, falling back to MemStorage.",
  );
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { db, pool };
