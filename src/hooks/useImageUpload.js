import { useState } from 'react';
import { supabase } from '../supabaseClient';
import imageCompression from 'browser-image-compression';

export function useImageUpload(bucket = 'images') {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.3,           // target size in MB
      maxWidthOrHeight: 1200,   // resize to max 1200px (keeps aspect ratio)
      useWebWorker: true,       // speed up compression
      fileType: 'image/jpeg',   // output format (or 'image/webp')
    };
    try {
      return await imageCompression(file, options);
    } catch (err) {
      throw new Error('Image compression failed: ' + err.message);
    }
  };

  const upload = async (file, folderPath, onProgress) => {
    if (!file) return null;
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // 1. Compress the image
      const compressedFile = await compressImage(file);

      // 2. Generate a unique file name
      const fileExt = compressedFile.type.split('/')[1];
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const fullPath = `${folderPath}/${fileName}`;

      // 3. Upload to Supabase Storage (with manual progress simulation if needed)
      //    Supabase JS client does not expose upload progress, but we can simulate
      //    or you can use a custom fetch with XHR. For simplicity, we'll just show an indeterminate spinner.
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fullPath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 4. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fullPath);

      setUploadProgress(100);
      return { publicUrl, path: fullPath };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return { upload, uploading, uploadProgress, error };
}