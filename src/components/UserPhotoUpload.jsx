import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "./ui/Button";
import imageCompression from "browser-image-compression";

const BUCKET_NAME = "hpaan-assets";

export default function UserPhotoUpload({
  businessId,
  itineraryId,
  onUploadComplete,
}) {
  const user = useUser();
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!user) {
      setError("Please log in to upload photos");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, or WebP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const compressed = await compressImage(file);
      const fileExt = compressed.type.split("/")[1];
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const folderPath = `user-uploads/${user.id}/${businessId ? `business_${businessId}` : `itinerary_${itineraryId}`}`;
      const fullPath = `${folderPath}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fullPath, compressed);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath);

      const insertData = {
        user_id: user.id,
        user_email: user.email,
        image_url: publicUrl,
        caption: caption || null,
        moderated: false,
      };
      if (businessId) insertData.business_id = businessId;
      if (itineraryId) insertData.itinerary_id = itineraryId;

      const { error: dbError } = await supabase
        .from("user_photos")
        .insert([insertData]);
      if (dbError) throw dbError;

      setCaption("");
      onUploadComplete?.();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-6 p-4 border border-dashed rounded-lg">
      <h3 className="font-semibold mb-2">
        {t("photos.share_your_photos") || "Share your photos"}
      </h3>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder={t("photos.caption") || "Caption (optional)"}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
        <label className="btn btn-secondary cursor-pointer inline-block text-center">
          {uploading
            ? t("photos.uploading") || "Uploading..."
            : t("photos.select_photo") || "Select Photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {error && <p className="text-error text-sm">{error}</p>}
      </div>
    </div>
  );
}
