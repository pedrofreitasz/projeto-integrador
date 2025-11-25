import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "bancopi",
  password: process.env.DB_PASS || "1234",
  port: process.env.DB_PORT || 5432
});
