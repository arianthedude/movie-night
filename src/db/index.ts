import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

function getClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!globalForDb.postgresClient) {
    globalForDb.postgresClient = postgres(connectionString, { max: 10 });
  }
  return globalForDb.postgresClient;
}

export const db = drizzle(getClient(), { schema });
