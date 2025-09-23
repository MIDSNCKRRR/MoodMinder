// // import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import { createClient } from '@supabase/supabase-js';
// import ws from 'ws';
// import * as schema from '@shared/schema';
// // import postgres from 'postgres'

// neonConfig.webSocketConstructor = ws;

// // const databaseUrl = process.env.SUPABASE_URL;
// // if (!databaseUrl) {
// //   throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
// // }

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_KEY;
// if (!supabaseUrl) {
//   throw new Error('SUPABASE_URL must be set. Copy it from the Supabase dashboard.');
// }
// if (!supabaseKey) {
//   throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY must be set for Supabase access.');
// }

// // export const pool = new Pool({ connectionString: databaseUrl });
// // export const db = drizzle({ client: pool, schema });
// // export const supabase = createClient(supabaseUrl, supabaseKey, {
// //   auth: { persistSession: false },
// // });
// const connectionString = process.env.SUPABASE_URL
// // Disable prefetch as it is not supported for "Transaction" pool mode
// export const pool = new Pool({ connectionString: databaseUrl });
// export const client = postgres(connectionString, { prepare: false })
// export const db = drizzle(client);





// import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
const connectionString = process.env.DATABASE_URL
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client);