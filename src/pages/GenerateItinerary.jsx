import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

export default function GenerateItinerary() {
  const user = useUser();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [days, setDays] = useState(2);
  const [generated, setGenerated] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('id, name, name_my, description, image')
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
    setGenerated(null); // clear previous generation
  };

  const generateItinerary = () => {
    if (selectedIds.length === 0) return alert('Please select at least one destination.');
    const selected = destinations.filter(d => selectedIds.includes(d.id));
    const shuffled = [...selected];
    // Shuffle to add variety (optional)
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // Distribute across days
    const perDay = Math.ceil(shuffled.length / days);
    const plan = [];
    for (let i = 0; i < days; i++) {
      const start = i * perDay;
      const end = Math.min(start + perDay, shuffled.length);
      if (start < shuffled.length) {
        plan.push({
          day: i + 1,
          items: shuffled.slice(start, end),
        });
      }
    }
    setGenerated(plan);
  };

  const saveTrip = async () => {
    if (!user) {
      alert('Please log in to save your trip.');
      return;
    }
    if (!generated) return;

    setSaving(true);
    // Create trip
    const tripTitle = `${t('trips.generated_title') || 'My Custom Itinerary'} ${new Date().toLocaleDateString()}`;
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({ user_id: user.id, title: tripTitle })
      .select()
      .single();

    if (tripError) {
      alert('Error creating trip');
      setSaving(false);
      return;
    }

    // Add items
    let order = 0;
    for (const day of generated) {
      for (const item of day.items) {
        const { error: itemError } = await supabase
          .from('trip_items')
          .insert({
            trip_id: trip.id,
            item_type: 'destination',
            item_id: item.id,
            order_index: order,
          });
        if (itemError) console.error(itemError);
        order++;
      }
    }

    setSaving(false);
    navigate(`/trip/${trip.id}`);
  };

  const getLocalizedName = (dest) => {
    return language === 'my' && dest.name_my ? dest.name_my : dest.name;
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="container-custom max-w-4xl">
      <h1 className="page-title">{t('generator.title') || 'Automated Itinerary Generator'}</h1>
      <p className="text-text-soft mb-6">
        {t('generator.subtitle') || 'Select destinations and days, and we’ll create a balanced itinerary for you.'}
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
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('generator.days') || 'Number of Days'}
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 2))}
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
          <div className="space-y-4">
            {generated.map(day => (
              <div key={day.day} className="border-b pb-4 last:border-0">
                <h3 className="text-lg font-semibold text-primary">
                  {t('itinerary.day')} {day.day}
                </h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {day.items.map(item => (
                    <li key={item.id} className="text-text">
                      {getLocalizedName(item)}
                    </li>
                  ))}
                </ul>
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