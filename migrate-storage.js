import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ... rest of your script

const OLD_BUCKET = 'Hpaan-Travel'; // change to your old bucket name
const NEW_BUCKET = 'hpaan-assets';

async function copyFolder(oldPath, newPath) {
  const { data: files, error } = await supabase.storage
    .from(OLD_BUCKET)
    .list(oldPath);
  if (error) {
    console.error(`Error listing ${oldPath}:`, error);
    return;
  }
  for (const file of files) {
    if (file.id) {
      const { data, error: downloadError } = await supabase.storage
        .from(OLD_BUCKET)
        .download(`${oldPath}/${file.name}`);
      if (downloadError) {
        console.error(`Download error for ${file.name}:`, downloadError);
        continue;
      }
      const { error: uploadError } = await supabase.storage
        .from(NEW_BUCKET)
        .upload(`${newPath}/${file.name}`, data, { upsert: true });
      if (uploadError) {
        console.error(`Upload error for ${file.name}:`, uploadError);
      } else {
        console.log(`Copied ${file.name}`);
      }
    }
  }
}

async function main() {
  // Example: copy businesses images (if they are stored in a folder like 'images/businesses')
  await copyFolder('images/businesses', 'businesses');
  await copyFolder('images/itineraries', 'itineraries');
  await copyFolder('images/events', 'events');
  await copyFolder('avatars', 'avatars'); // if old bucket had 'avatars' folder
  await copyFolder('user-uploads', 'user-uploads');
  console.log('Migration complete');
}

main();