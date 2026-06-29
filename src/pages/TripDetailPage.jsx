import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { SkeletonDetail } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ConfirmDialog';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Helmet } from 'react-helmet-async';

export default function TripDetailPage() {
  const { id } = useParams();
  const user = useUser();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState({});
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [availableBusinesses, setAvailableBusinesses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('destination');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (user) fetchTrip();
  }, [id, user]);

  const fetchTrip = async () => {
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();
    if (tripError || !tripData) {
      navigate('/trips');
      return;
    }
    setTrip(tripData);
    setTitle(tripData.title);
    setDescription(tripData.description || '');

    const { data: itemsData, error: itemsError } = await supabase
      .from('trip_items')
      .select('*')
      .eq('trip_id', id)
      .order('order_index', { ascending: true });
    if (!itemsError) {
      const enriched = await Promise.all(itemsData.map(async (item) => {
        if (item.item_type === 'destination') {
          const { data: dest } = await supabase
            .from('destinations')
            .select('id, name, name_my, image, lat, lng')
            .eq('id', item.item_id)
            .single();
          return { ...item, data: dest };
        } else {
          const { data: biz } = await supabase
            .from('businesses')
            .select('id, name, name_my, image, lat, lng')
            .eq('id', item.item_id)
            .single();
          return { ...item, data: biz };
        }
      }));
      setItems(enriched);
      const notesMap = {};
      enriched.forEach(item => { if (item.notes) notesMap[item.id] = item.notes; });
      setNotes(notesMap);
    }

    const { data: dests } = await supabase.from('destinations').select('id, name, name_my');
    const { data: bizs } = await supabase.from('businesses').select('id, name, name_my');
    setAvailableDestinations(dests || []);
    setAvailableBusinesses(bizs || []);
    setLoading(false);
  };

  const updateTrip = async () => {
    const { error } = await supabase
      .from('trips')
      .update({ title, description })
      .eq('id', id);
    if (!error) {
      setTrip({ ...trip, title, description });
      setEditingTitle(false);
    }
  };

  const addItem = async (itemType, itemId) => {
    const newOrderIndex = items.length;
    const tempId = Date.now();
    const newItem = {
      id: tempId,
      trip_id: id,
      item_type: itemType,
      item_id: itemId,
      order_index: newOrderIndex,
      notes: null,
      data: (itemType === 'destination'
        ? availableDestinations.find(d => d.id === itemId)
        : availableBusinesses.find(b => b.id === itemId)) || { name: 'Loading...' }
    };
    setItems(prev => [...prev, newItem]);

    const { data, error } = await supabase
      .from('trip_items')
      .insert({ trip_id: id, item_type: itemType, item_id: itemId, order_index: newOrderIndex })
      .select()
      .single();
    if (error) {
      setItems(prev => prev.filter(i => i.id !== tempId));
      toast({ type: 'error', message: t('trips.error_adding') });
    } else {
      setItems(prev => prev.map(i => i.id === tempId ? { ...data, data: newItem.data } : i));
    }
    setShowAddModal(false);
  };

  const removeItem = async (itemId) => {
    const originalItems = [...items];
    setItems(prev => prev.filter(i => i.id !== itemId));
    const { error } = await supabase.from('trip_items').delete().eq('id', itemId);
    if (error) {
      setItems(originalItems);
      toast({ type: 'error', message: t('trips.error_removing') });
    } else {
      toast({ type: 'success', message: 'Item removed' });
    }
    setConfirmDelete(null);
  };

  const saveNote = async (itemId) => {
    const newNotes = notes[itemId] || null;
    setEditingNoteId(null);
    const { error } = await supabase
      .from('trip_items')
      .update({ notes: newNotes })
      .eq('id', itemId);
    if (error) {
      setNotes(prev => ({ ...prev, [itemId]: null }));
      toast({ type: 'error', message: t('trips.error_saving_note') });
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    setItems(reordered);
    const updates = reordered.map((item, idx) => ({ id: item.id, order_index: idx }));
    await Promise.all(updates.map(update =>
      supabase
        .from('trip_items')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
    ));
  };

  const viewOnMap = () => {
    const waypoints = items.filter(i => i.data?.lat && i.data?.lng).map(i => ({ lat: i.data.lat, lng: i.data.lng }));
    if (waypoints.length === 0) {
      toast({ type: 'warning', message: t('trips.location_missing') });
      return;
    }
    const waypointsParam = encodeURIComponent(JSON.stringify(waypoints));
    navigate(`/map?waypoints=${waypointsParam}`);
  };

  const shareTrip = () => {
    const url = `${window.location.origin}/trip/${id}`;
    navigator.clipboard.writeText(url);
    toast({ type: 'success', message: t('trips.trip_link_copied') });
  };

  if (loading) return <SkeletonDetail />;
  if (!trip) return <div className="container-custom">Trip not found</div>;

  const getName = (item) => {
    if (!item.data) return 'Unknown';
    return language === 'my' && item.data.name_my ? item.data.name_my : item.data.name;
  };
  const getLink = (item) => {
    if (item.item_type === 'destination') return `/destination/${item.item_id}`;
    return `/business/${item.item_id}`;
  };

  const availableItems = addType === 'destination' ? availableDestinations : availableBusinesses;
  const filteredAvailable = availableItems.filter(a =>
    (language === 'my' && a.name_my ? a.name_my : a.name).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-custom max-w-4xl">
      <Helmet>
        <title>{trip.title} | Hpa-An Travel</title>
        <meta name="description" content={trip.description || `Trip itinerary for ${trip.title}`} />
        <meta property="og:title" content={trip.title} />
        <meta property="og:description" content={trip.description || `Trip itinerary for ${trip.title}`} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        {editingTitle ? (
          <div className="w-full">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl sm:text-3xl font-bold border rounded px-2 py-1 w-full"
              autoFocus
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border rounded px-2 py-1 mt-2"
              rows="2"
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={updateTrip}>{t('common.save')}</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingTitle(false)}>{t('common.cancel')}</Button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text break-words">{trip.title}</h1>
            {trip.description && <p className="text-text-soft mt-1">{trip.description}</p>}
            <button onClick={() => setEditingTitle(true)} className="text-primary text-sm mt-1">
              ✏️ {t('trips.edit_trip')}
            </button>
          </div>
        )}
        <div className="flex gap-2 flex-wrap justify-end">
          <Button size="sm" variant="outline" onClick={shareTrip}>🔗 {t('trips.share')}</Button>
          <Button size="sm" onClick={viewOnMap} disabled={items.length === 0}>🗺️ {t('trips.view_on_map')}</Button>
          <Link to="/trips" className="text-primary text-sm self-center">← {t('trips.back')}</Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <h2 className="text-xl font-semibold">{t('trips.places_title')}</h2>
          <Button size="sm" onClick={() => setShowAddModal(true)}>+ {t('trips.add_place')}</Button>
        </div>
        {items.length === 0 ? (
          <p className="text-text-soft">{t('trips.no_places')}</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="trip-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {items.map((item, idx) => (
                    <Draggable key={item.id} draggableId={String(item.id)} index={idx}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white rounded-lg shadow p-3"
                        >
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <Link to={getLink(item)} className="flex-1 min-w-0">
                              <span className="font-medium break-words">{getName(item)}</span>
                              <span className="text-xs text-text-soft ml-2 capitalize">{item.item_type}</span>
                            </Link>
                            <button onClick={() => setConfirmDelete(item.id)} className="text-red-500 hover:text-red-700 p-1">✕</button>
                          </div>
                          <div className="mt-2">
                            {editingNoteId === item.id ? (
                              <div className="flex flex-col sm:flex-row gap-1">
                                <input
                                  type="text"
                                  value={notes[item.id] || ''}
                                  onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                                  className="flex-1 border rounded px-2 py-1 text-sm"
                                  placeholder={t('trips.note_placeholder')}
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <button onClick={() => saveNote(item.id)} className="text-primary text-sm">{t('trips.save_note')}</button>
                                  <button onClick={() => setEditingNoteId(null)} className="text-gray-500 text-sm">{t('trips.cancel_note')}</button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-text-soft">
                                {notes[item.id] ? (
                                  <div className="flex justify-between flex-wrap gap-2">
                                    <span className="break-words">📝 {notes[item.id]}</span>
                                    <button onClick={() => setEditingNoteId(item.id)} className="text-primary text-xs">{t('trips.edit_note')}</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setEditingNoteId(item.id)} className="text-primary text-xs">+ {t('trips.add_note')}</button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">{t('trips.add_modal_title')}</h3>
            <div className="flex gap-2 mb-3">
              <button
                className={`flex-1 px-3 py-1 rounded ${addType === 'destination' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                onClick={() => setAddType('destination')}
              >
                {t('trips.destination')}
              </button>
              <button
                className={`flex-1 px-3 py-1 rounded ${addType === 'business' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                onClick={() => setAddType('business')}
              >
                {t('trips.business')}
              </button>
            </div>
            <input
              type="text"
              placeholder={t('trips.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredAvailable.map(place => {
                const name = language === 'my' && place.name_my ? place.name_my : place.name;
                return (
                  <button
                    key={place.id}
                    onClick={() => addItem(addType, place.id)}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                  >
                    {name}
                  </button>
                );
              })}
              {filteredAvailable.length === 0 && <p className="text-text-soft text-center">{t('trips.no_results')}</p>}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>{t('trips.cancel')}</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title={t('trips.remove_confirm')}
        message=""
        onConfirm={() => removeItem(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        confirmText="Remove"
        cancelText={t('trips.cancel')}
      />
    </div>
  );
}