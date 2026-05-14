import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import imageCompression from 'browser-image-compression';

const BUCKET_NAME = 'hpaan-assets';

export default function AvatarUpload({ avatarUrl, onUpload }) {
  const user = useUser();
  const [uploading, setUploading] = useState(false);

  const compressImage = async (file) => {
    const options = { maxSizeMB: 0.2, maxWidthOrHeight: 200, useWebWorker: true };
    return await imageCompression(file, options);
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image');
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fileExt = compressed.type.split('/')[1];
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, compressed, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      onUpload(publicUrl);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={avatarUrl || 'https://via.placeholder.com/100?text=No+Avatar'}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover border-2 border-primary"
      />
      <label className="btn btn-secondary text-sm cursor-pointer">
        {uploading ? 'Uploading...' : 'Change Avatar'}
        <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
      </label>
    </div>
  );
}