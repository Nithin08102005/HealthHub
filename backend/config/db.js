import { neon } from '@neondatabase/serverless';
import "dotenv/config";

const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

const connectionString = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}`;
const sql = neon(connectionString); 

export { sql };
export const testConnection = async () => {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connected. Current time:', result[0].now);
    return result;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};
