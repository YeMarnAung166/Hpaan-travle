import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listFiles() {
  const { data, error } = await supabase.storage
    .from('Hpaan-Travel')
    .list('', { limit: 100 });
  if (error) console.error(error);
  else console.log('Files in root:', data.map(f => f.name));
}

listFiles();