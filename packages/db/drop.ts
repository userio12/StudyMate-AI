import postgres from 'postgres';
const sql = postgres('postgresql://postgres.qxvcgajxegqiupnknlbk:%40studymate-ai@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true', { ssl: 'require' });

sql`DROP TABLE IF EXISTS chunks CASCADE`.then(res => { 
  console.log('Chunks table dropped successfully'); 
  process.exit(0); 
}).catch(console.error);
