import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not set.');
  console.error('Set it via the environment:');
  console.error('  $env:SUPABASE_SERVICE_ROLE_KEY="your-key" (PowerShell)');
  console.error('  export SUPABASE_SERVICE_ROLE_KEY="your-key"  (bash)');
  process.exit(1);
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  serviceRoleKey
);

async function listFiles() {
  const { data, error } = await supabase.storage
    .from('Hpaan-Travel')
    .list('', { limit: 100 });
  if (error) console.error(error);
  else console.log('Files in root:', data.map(f => f.name));
}

listFiles();