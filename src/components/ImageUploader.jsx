import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import imageCompression from 'browser-image-compression';
import { useLanguage } from '../context/LanguageContext';
import Button from './ui/Button';

const BUCKET_NAME = 'hpaan-assets';

export default function ImageUploader({ folderPath, onUploadComplete, existingImageUrl = null }) {
  const { t } = useLanguage();
  const [preview, setPreview] = useState(existingImageUrl);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const compressImage = async (file) => {
    const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1024, useWebWorker: true, fileType: 'image/jpeg' };
    return await imageCompression(file, options);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert(t('image.invalid_type'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert(t('image.too_large'));
      return;
    }
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setCompressing(true);
    try {
      const compressed = await compressImage(selectedFile);
      setCompressing(false);
      const ext = compressed.type.split('/')[1];
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;
      const fullPath = `${folderPath}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fullPath, compressed, { cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fullPath);
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
      setPreview(publicUrl);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadComplete?.({ publicUrl, path: fullPath });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
      setCompressing(false);
    }
  };

  const handleRemove = () => {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    onUploadComplete?.(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        {preview && (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
            <button onClick={handleRemove} className="absolute -top-2 -right-2 bg-error text-white rounded-full w-6 h-6 text-xs">✕</button>
          </div>
        )}
        <Button variant="outline" onClick={() => fileInputRef.current.click()} disabled={uploading}>
          {preview ? (t('image.change') || 'Change') : (t('image.select') || 'Select')}
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/webp" className="hidden" />
        {selectedFile && !uploading && <Button variant="primary" onClick={handleUpload}>{t('image.upload') || 'Upload'}</Button>}
      </div>
      {(compressing || uploading) && <div className="text-sm text-text-soft">Uploading...</div>}
      {error && <div className="message-error text-sm">{error}</div>}
    </div>
  );
}