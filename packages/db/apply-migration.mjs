import postgres from 'postgres';
import fs from 'fs';

const sqlText = fs.readFileSync('drizzle/0006_overjoyed_lethal_legion.sql', 'utf-8');

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  console.log('Running migration...');
  const statements = sqlText.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
  
  for (const statement of statements) {
    console.log(`Executing: ${statement}`);
    await sql.unsafe(statement);
  }
  
  console.log('Done!');
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
