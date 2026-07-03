import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { getOptimizedImage } from '../utils/imageHelpers';

export default function NearbyPlaces({ lat, lng, excludeId, type = 'destinations', radius = 10 }) {
  const { language } = useLanguage();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const table = type === 'businesses' ? 'businesses' : 'destinations';
      const rad = radius / 111;
      const { data, error } = await supabase
        .from(table)
        .select(`id, name, name_my, image, lat, lng`)
        .neq('id', excludeId)
        .gte('lat', lat - rad)
        .lte('lat', lat + rad)
        .gte('lng', lng - rad)
        .lte('lng', lng + rad)
        .limit(6);
      if (!error) setPlaces(data || []);
      setLoading(false);
    };
    fetch();
  }, [lat, lng, excludeId, type, radius, language]);

  if (loading) return <div className="flex gap-3 overflow-x-auto pb-2"><div className="w-32 h-24 bg-neutral-mid rounded-lg animate-pulse shrink-0" /><div className="w-32 h-24 bg-neutral-mid rounded-lg animate-pulse shrink-0" /></div>;
  if (places.length === 0) return <p className="text-text-soft text-sm">{language === 'my' ? 'အနီးနားတွင် နေရာများမရှိပါ။' : 'No nearby places found.'}</p>;

  const linkPrefix = type === 'businesses' ? '/business' : '/destination';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {places.map(p => (
        <Link key={p.id} to={`${linkPrefix}/${p.id}`} className="group block">
          <div className="relative h-24 rounded-lg overflow-hidden bg-neutral-mid">
            <img src={getOptimizedImage(p.image, 300) || '/placeholder.jpg'} alt={language === 'my' && p.name_my ? p.name_my : p.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <p className="text-sm font-medium text-text mt-1 truncate group-hover:text-primary transition-colors">
            {language === 'my' && p.name_my ? p.name_my : p.name}
          </p>
        </Link>
      ))}
    </div>
  );
}
