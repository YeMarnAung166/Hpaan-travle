// src/components/UserPhotoGallery.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

export default function UserPhotoGallery({ businessId, itineraryId, destinationId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const user = useUser();
  const { language } = useLanguage();

  useEffect(() => {
    fetchPhotos();
  }, [businessId, itineraryId, destinationId]);

  const fetchPhotos = async () => {
    setLoading(true);
    let query = supabase
      .from('user_photos')
      .select('*')
      .eq('moderated', true);

    if (businessId) query = query.eq('business_id', businessId);
    else if (itineraryId) query = query.eq('itinerary_id', itineraryId);
    else if (destinationId) query = query.eq('destination_id', destinationId);
    else {
      setPhotos([]);
      setLoading(false);
      return;
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching user photos:', error);
    } else if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        const profilesMap = {};
        profiles.forEach(p => { profilesMap[p.id] = p; });
        const photosWithProfiles = data.map(photo => ({
          ...photo,
          profile: profilesMap[photo.user_id] || null
        }));
        setPhotos(photosWithProfiles);
      }
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
      if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
    } else {
      alert('Failed to delete photo');
    }
  };

  if (loading) return <div className="text-center py-4 text-text-soft">Loading photos...</div>;
  if (photos.length === 0) return null;

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
              {selectedPhoto.profile && (
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={selectedPhoto.profile.avatar_url || '/default-avatar.png'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                  />
                  <span className="font-semibold text-text">
                    {selectedPhoto.profile.display_name || 'Traveler'}
                  </span>
                </div>
              )}
              <p className="text-text">
                {language === 'my' && selectedPhoto.caption_my
                  ? selectedPhoto.caption_my
                  : selectedPhoto.caption || 'No caption'}
              </p>
              <p className="text-text-soft text-sm mt-1">
                {new Date(selectedPhoto.created_at).toLocaleDateString()}
              </p>
            </div>
            {(user?.id === selectedPhoto.user_id || user?.email?.includes('admin')) && (
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => handleDelete(selectedPhoto.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Photo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}