import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
const sql = neon("postgresql://neondb_owner:8l1pCxksgLGQ@ep-shrill-cloud-a19zt97v.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");
export const db = drizzle(sql, {schema});

