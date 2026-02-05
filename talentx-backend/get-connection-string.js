const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

// Convert to connection string format
const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const connectionString = `postgresql://postgres:${supabaseKey}@db.${projectId}.supabase.co:5432/postgres`;

console.log('Connection string:', connectionString);
console.log('Use this with psql to run your schema:');
console.log(`psql "${connectionString}" < schema.sql`);