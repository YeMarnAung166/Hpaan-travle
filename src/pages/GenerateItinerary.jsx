import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { solveTsp, clusterByGeo, haversine } from '../utils/tspSolver';
import { Helmet } from 'react-helmet-async';

export default function GenerateItinerary() {
  const user = useUser();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [days, setDays] = useState(2);
  const [generated, setGenerated] = useState(null);
  const [saving, setSaving] = useState(false);
  const [radius, setRadius] = useState(5);

  useEffect(() => {
    const fetchDestinations = async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('id, name, name_my, description, image, lat, lng, category')
        .order('name');
      if (!error) setDestinations(data);
      setLoading(false);
    };
    fetchDestinations();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setGenerated(null);
  };

  const getLocalizedName = (dest) => {
    return language === 'my' && dest.name_my ? dest.name_my : dest.name;
  };

  const getNearbyRestaurants = async (lat, lng, rad) => {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, name_my, lat, lng, category')
      .eq('category', 'restaurant')
      .gte('lat', lat - rad / 111)
      .lte('lat', lat + rad / 111)
      .gte('lng', lng - rad / 111)
      .lte('lng', lng + rad / 111);
    return data || [];
  };

  const generateItinerary = useCallback(async () => {
    if (selectedIds.length === 0) {
      toast({ type: 'warning', message: 'Please select at least one destination.' });
      return;
    }
    const selected = destinations.filter(d => selectedIds.includes(d.id));
    const hasCoords = selected.filter(d => d.lat && d.lng);
    if (hasCoords.length < 2) {
      const shuffled = [...selected];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const perDay = Math.ceil(shuffled.length / days);
      const plan = [];
      for (let i = 0; i < days; i++) {
        const start = i * perDay;
        const end = Math.min(start + perDay, shuffled.length);
        if (start < shuffled.length) {
          plan.push({ day: i + 1, items: shuffled.slice(start, end), restaurants: [] });
        }
      }
      setGenerated(plan);
      return;
    }
    const clusters = clusterByGeo(hasCoords, days);
    const plan = [];
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      let ordered;
      if (cluster.length <= 1) {
        ordered = cluster;
      } else {
        ordered = solveTsp(cluster);
      }
      const restaurantPromises = ordered.map(async (item) => {
        if (!item.lat || !item.lng) return [];
        return getNearbyRestaurants(item.lat, item.lng, radius);
      });
      const restaurantResults = await Promise.all(restaurantPromises);
      const restaurants = [...new Map(
        restaurantResults.flat().map(r => [r.id, r])
      ).values()].slice(0, 5);
      plan.push({ day: i + 1, items: ordered, restaurants });
    }
    setGenerated(plan);
  }, [selectedIds, destinations, days, radius, toast]);

  const saveTrip = async () => {
    if (!user) {
      toast({ type: 'warning', message: 'Please log in to save your trip.' });
      return;
    }
    if (!generated) return;
    setSaving(true);
    const tripTitle = `${t('trips.generated_title') || 'My Custom Itinerary'} ${new Date().toLocaleDateString()}`;
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({ user_id: user.id, title: tripTitle })
      .select()
      .single();
    if (tripError) {
      toast({ type: 'error', message: 'Error creating trip' });
      setSaving(false);
      return;
    }
    let order = 0;
    for (const day of generated) {
      for (const item of day.items) {
        await supabase.from('trip_items').insert({
          trip_id: trip.id, item_type: 'destination', item_id: item.id, order_index: order,
        });
        order++;
      }
    }
    setSaving(false);
    navigate(`/trip/${trip.id}`);
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="container-custom max-w-4xl">
      <Helmet>
        <title>Itinerary Generator | Hpa-An Travel</title>
        <meta name="description" content="Plan your perfect trip to Hpa-An with our automated itinerary generator." />
        <meta property="og:title" content="Itinerary Generator" />
        <meta property="og:description" content="Plan your perfect trip to Hpa-An with our automated itinerary generator." />
        <meta property="og:type" content="website" />
      </Helmet>
      <h1 className="page-title">{t('generator.title') || 'Automated Itinerary Generator'}</h1>
      <p className="text-text-soft mb-6">
        {t('generator.subtitle') || 'Select destinations and days. We\'ll optimize the route and suggest nearby restaurants.'}
      </p>

      <div className="bg-white dark:bg-neutral-dark rounded-xl shadow-md p-6 mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {t('generator.select_destinations') || 'Select Destinations'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
            {destinations.map(dest => (
              <label key={dest.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(dest.id)}
                  onChange={() => toggleSelect(dest.id)}
                  className="accent-primary"
                />
                {getLocalizedName(dest)}
                {dest.lat && dest.lng && <span className="text-xs text-text-soft ml-1">📍</span>}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('generator.days') || 'Number of Days'}
            </label>
            <input
              type="number" min="1" max="7"
              value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 2))}
              className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('generator.search_radius') || 'Restaurant Radius (km)'}
            </label>
            <input
              type="number" min="1" max="50"
              value={radius}
              onChange={(e) => setRadius(Math.max(1, parseInt(e.target.value) || 5))}
              className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button onClick={generateItinerary} className="mt-5">
            {t('generator.generate') || 'Generate Itinerary'}
          </Button>
        </div>
      </div>

      {generated && (
        <div className="bg-white dark:bg-neutral-dark rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-serif font-bold mb-4">
            {t('generator.preview') || 'Your Itinerary'}
          </h2>
          <div className="space-y-6">
            {generated.map(day => (
              <div key={day.day} className="border-b pb-4 last:border-0">
                <h3 className="text-lg font-semibold text-primary">
                  {t('itinerary.day')} {day.day}
                </h3>
                <ul className="mt-2 space-y-2">
                  {day.items.map((item, idx) => (
                    <li key={item.id} className="flex items-start gap-2 text-text">
                      <span className="text-primary font-medium min-w-[1.5rem]">{idx + 1}.</span>
                      <div>
                        <span>{getLocalizedName(item)}</span>
                        {idx > 0 && day.items[idx - 1].lat && day.items[idx - 1].lng && item.lat && item.lng && (
                          <span className="text-xs text-text-soft ml-2">
                            ~{Math.round(haversine(day.items[idx - 1].lat, day.items[idx - 1].lng, item.lat, item.lng))} km
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {day.restaurants && day.restaurants.length > 0 && (
                  <div className="mt-3 pl-7">
                    <p className="text-xs font-medium text-text-soft mb-1">
                      {language === 'my' ? 'အနီးရှိ စားသောက်ဆိုင်များ' : 'Nearby Restaurants'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {day.restaurants.map(r => (
                        <span key={r.id} className="text-xs bg-secondary/10 text-primary px-2 py-0.5 rounded-full">
                          {getLocalizedName(r)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={saveTrip} disabled={saving}>
              {saving ? t('common.saving') : t('generator.save_trip') || 'Save as Trip'}
            </Button>
            <Button variant="outline" onClick={() => setGenerated(null)}>
              {t('common.clear')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
