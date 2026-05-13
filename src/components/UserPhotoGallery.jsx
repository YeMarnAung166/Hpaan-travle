import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

export default function UserPhotoGallery({ businessId, itineraryId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const user = useUser();
  const { language } = useLanguage();

  useEffect(() => {
    fetchPhotos();
  }, [businessId, itineraryId]);

  const fetchPhotos = async () => {
    setLoading(true);
    let query = supabase
      .from('user_photos')
      .select('*')
      .eq('moderated', true);

    if (businessId) {
      query = query.eq('business_id', businessId);
    } else if (itineraryId) {
      query = query.eq('itinerary_id', itineraryId);
    } else {
      setPhotos([]);
      setLoading(false);
      return;
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user photos:', error);
    } else {
      setPhotos(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (photoId) => {
    if (!confirm('Delete this photo?')) return;
    const { error } = await supabase
      .from('user_photos')
      .delete()
      .eq('id', photoId);
    if (!error) {
      fetchPhotos();
    } else {
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-text-soft">Loading photos...</div>;
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Traveler Photos</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.image_url}
              alt={photo.caption || 'User photo'}
              className="w-full h-32 object-cover rounded-lg"
            />
            {(user?.id === photo.user_id || user?.email?.includes('admin')) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(photo.id);
                }}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-3xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.image_url}
              alt="Full size"
              className="w-full h-auto max-h-[70vh] object-contain"
            />
            <div className="p-4">
              <p className="text-text">
                {language === 'my' && selectedPhoto.caption_my
                  ? selectedPhoto.caption_my
                  : selectedPhoto.caption || 'No caption'}
              </p>
              <p className="text-text-soft text-sm mt-1">© Traveler</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}