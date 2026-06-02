const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.zaahkhmnqcczswxrcuhw:amin0807144306@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'
  });

  try {
    await client.connect();
    console.log('Connected to DB');
    
    const sql = fs.readFileSync('supabase/migrations/20260604000000_add_tourist_stories.sql', 'utf8');
    await client.query(sql);
    console.log('Migration executed successfully');
    
  } catch (err) {
    console.error('Error executing migration', err);
  } finally {
    await client.end();
  }
}

run();
