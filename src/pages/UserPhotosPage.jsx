import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useProfileContext } from '../context/ProfileContext';

export default function UserPhotosPage() {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfileContext();
  const { language } = useLanguage();

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

  if (loading) return <div className="spinner mx-auto my-12"></div>;

  const displayName = profile?.display_name || 'Traveler';

  return (
    <div className="container-custom">
      <h1 className="page-title">{displayName}'s Photos</h1>
      {photos.length === 0 ? (
        <p className="text-text-soft text-center py-12">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="rounded-lg overflow-hidden shadow-md">
              <img src={photo.image_url} alt={photo.caption || 'User photo'} className="w-full h-48 object-cover" />
              {photo.caption && <div className="p-2 text-sm text-text-soft">{photo.caption}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}