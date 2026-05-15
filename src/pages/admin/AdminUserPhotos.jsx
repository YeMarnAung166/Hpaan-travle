import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminUserPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('user_photos')
      .select('*, businesses(name, name_my), itineraries(title, title_my)')
      .eq('moderated', false)
      .order('created_at', { ascending: false });
    if (!error) setPhotos(data);
    setLoading(false);
  };

  const handleApprove = async (id) => {
    const { error } = await supabase
      .from('user_photos')
      .update({ moderated: true })
      .eq('id', id);
    if (error) alert(error.message);
    else fetchPhotos();
  };

  const handleDelete = async (id) => {
    if (confirm(t('admin.confirm_delete'))) {
      const { error } = await supabase
        .from('user_photos')
        .delete()
        .eq('id', id);
      if (error) alert(error.message);
      else fetchPhotos();
    }
  };

  if (loading) return <div className="spinner mx-auto"></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('admin.moderate_photos')}</h2>
      {photos.length === 0 ? (
        <p className="text-gray-500">{t('admin.no_pending')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => {
            // Localized business or itinerary name
            let targetName = '';
            if (photo.businesses) {
              targetName = language === 'my' && photo.businesses.name_my
                ? photo.businesses.name_my
                : photo.businesses.name;
            } else if (photo.itineraries) {
              targetName = language === 'my' && photo.itineraries.title_my
                ? photo.itineraries.title_my
                : photo.itineraries.title;
            } else {
              targetName = 'N/A';
            }

            return (
              <div key={photo.id} className="bg-white rounded-lg shadow p-4">
                <img
                  src={photo.image_url}
                  alt="User upload"
                  className="w-full h-48 object-cover rounded"
                />
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <strong>{t('business.title')}:</strong> {targetName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>{t('admin.user')}:</strong> {photo.user_email || photo.user_id}
                  </p>
                  {photo.caption && (
                    <p className="text-sm text-gray-500 mt-1">
                      "{photo.caption}"
                    </p>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleApprove(photo.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {t('admin.approve')}
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    {t('admin.delete')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}