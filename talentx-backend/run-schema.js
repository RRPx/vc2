const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSchema() {
    try {
        console.log('Reading schema.sql...');
        const schema = fs.readFileSync('./schema.sql', 'utf8');
        
        // Split schema by semicolons to handle multiple statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`Found ${statements.length} SQL statements to execute`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            
            // Use raw SQL execution through the REST API
            const { error } = await supabase
                .from('pg_tables')
                .select('*')
                .limit(1);
            
            // Try using a direct SQL approach
            try {
                const { data, error } = await supabase.rpc('exec_sql', { 
                    query: statement 
                });
                
                if (error) {
                    console.log(`Warning on statement ${i + 1}:`, error.message);
                    // Continue with other statements
                } else {
                    console.log(`Statement ${i + 1} executed successfully`);
                }
            } catch (stmtError) {
                console.log(`Error on statement ${i + 1}:`, stmtError.message);
            }
        }
        
        console.log('Schema execution completed!');
    } catch (error) {
        console.error('Error reading or processing schema:', error.message);
    }
}

runSchema();