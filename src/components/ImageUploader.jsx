// src/components/ImageUploader.jsx
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import imageCompression from 'browser-image-compression';
import { useLanguage } from '../context/LanguageContext';

// 👇 REPLACE WITH YOUR ACTUAL BUCKET NAME FROM SUPABASE STORAGE
const BUCKET_NAME = 'Hpaan-Travel';   // e.g., 'Hpaan-Travel' or 'images'

export default function ImageUploader({ folderPath, onUploadComplete, existingImageUrl = null }) {
  const { t } = useLanguage();
  const [preview, setPreview] = useState(existingImageUrl);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  // Cleanup blob URLs on unmount or preview change
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.2,          // 200KB target
      maxWidthOrHeight: 1024,  // resize to max 1024px
      useWebWorker: true,
      fileType: 'image/jpeg',
    };
    return await imageCompression(file, options);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert(t('image.invalid_type'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(t('image.too_large'));
      return;
    }

    // Revoke old preview if any
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setCompressing(true);
    setError(null);

    try {
      // 1. Compress
      const compressed = await compressImage(selectedFile);
      setCompressing(false);

      // 2. Generate unique filename
      const fileExt = compressed.type.split('/')[1];
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const fullPath = `${folderPath}/${fileName}`;

      // 3. Upload to Supabase Storage (public bucket)
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fullPath, compressed, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 4. Get public URL (not signed)
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fullPath);

      // 5. Cleanup blob preview
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }

      // 6. Update UI
      setPreview(publicUrl);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // 7. Notify parent
      onUploadComplete?.({ publicUrl, path: fullPath });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || t('image.error'));
      setCompressing(false);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onUploadComplete?.(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              title={t('image.remove') || 'Remove'}
            >
              ✕
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="btn btn-secondary"
          disabled={uploading}
        >
          {preview ? (t('image.change') || 'Change Image') : (t('image.select') || 'Select Image')}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />
        {selectedFile && !uploading && (
          <button onClick={handleUpload} className="btn btn-primary">
            {t('image.upload') || 'Upload'}
          </button>
        )}
      </div>

      {compressing && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="spinner w-4 h-4 border-2 border-t-green-600 rounded-full animate-spin"></div>
          <span>Compressing image...</span>
        </div>
      )}

      {uploading && !compressing && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="spinner w-4 h-4 border-2 border-t-green-600 rounded-full animate-spin"></div>
          <span>{t('image.uploading') || 'Uploading...'}</span>
        </div>
      )}

      {error && (
        <div className="message-error text-sm">
          {t('image.error') || 'Upload error'}: {error}
        </div>
      )}
    </div>
  );
}