import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfileContext } from '../context/ProfileContext';

export default function UserPhotosPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const user = useUser();
  const { t, language } = useLanguage();
  const { profile: viewerProfile } = useProfileContext();
  const isOwner = user?.id === userId;

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('user_photos')
        .select('*')
        .eq('user_id', userId)
        .eq('moderated', true)
        .order('created_at', { ascending: false });
      if (!error) setPhotos(data);
      setLoading(false);
    };
    fetchPhotos();
  }, [userId]);

  const handleDelete = async (photoId) => {
    if (!confirm(t('photos.confirm_delete'))) return;
    const { error } = await supabase
      .from('user_photos')
      .delete()
      .eq('id', photoId);
    if (!error) {
      setPhotos(photos.filter(p => p.id !== photoId));
      if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
    } else {
      alert(t('photos.failed_delete'));
    }
  };

  if (loading) return <div className="spinner mx-auto my-12"></div>;

  const displayName = viewerProfile?.display_name || 'Traveler';

  return (
    <div className="container-custom">
      {/* Back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-text-soft hover:text-primary transition"
          aria-label={t('nav.back')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{t('nav.back')}</span>
        </button>
      </div>

      <h1 className="page-title">{displayName}'s Photos</h1>

      {photos.length === 0 ? (
        <div className="text-center py-12 bg-neutral-light rounded-xl">
          <p className="text-text-soft text-lg">{t('photos.no_photos')}</p>
          {isOwner && (
            <button
              onClick={() => navigate(-1)}
              className="btn btn-primary mt-4 inline-block"
            >
              {t('photos.back_to_profile')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div
              key={photo.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.image_url}
                alt={photo.caption || 'User photo'}
                className="w-full h-48 object-cover"
              />
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id);
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  title={t('photos.delete_photo')}
                >
                  ✕
                </button>
              )}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-3xl max-h-[90vh] bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
              <p className="text-text-soft text-sm mt-1">
                {new Date(selectedPhoto.created_at).toLocaleDateString()}
              </p>
            </div>
            {isOwner && (
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => handleDelete(selectedPhoto.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  {t('photos.delete_photo')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}