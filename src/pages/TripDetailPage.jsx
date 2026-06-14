import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function TripDetailPage() {
  const { id } = useParams();
  const user = useUser();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
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

  useEffect(() => {
    if (user) fetchTrip();
  }, [id, user]);

  const fetchTrip = async () => {
    // Fetch trip details
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

    // Fetch items with joined data
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

    // Fetch available places
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
    // Optimistically add to local state (temporary id)
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
      // revert on error
      setItems(prev => prev.filter(i => i.id !== tempId));
      alert('Error adding item');
    } else {
      // replace temp item with real one
      setItems(prev => prev.map(i => i.id === tempId ? { ...data, data: newItem.data } : i));
    }
    setShowAddModal(false);
  };

  const removeItem = async (itemId) => {
    if (!confirm('Remove from trip?')) return;
    // Optimistic removal
    const originalItems = [...items];
    setItems(prev => prev.filter(i => i.id !== itemId));
    const { error } = await supabase.from('trip_items').delete().eq('id', itemId);
    if (error) {
      setItems(originalItems);
      alert('Error removing item');
    }
  };

  const saveNote = async (itemId) => {
    const newNotes = notes[itemId] || null;
    // Optimistic update
    setEditingNoteId(null);
    const { error } = await supabase
      .from('trip_items')
      .update({ notes: newNotes })
      .eq('id', itemId);
    if (error) {
      // revert in state
      setNotes(prev => ({ ...prev, [itemId]: null }));
      alert('Error saving note');
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    // Reorder local state
    const reordered = Array.from(items);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    setItems(reordered);

    // Update order_index in database for all affected items
    const updates = reordered.map((item, idx) => ({
      id: item.id,
      order_index: idx,
    }));
    await Promise.all(updates.map(update =>
      supabase
        .from('trip_items')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
    ));
    // No need to fetchTrip()
  };

  const viewOnMap = () => {
    const waypoints = items.filter(i => i.data?.lat && i.data?.lng).map(i => ({ lat: i.data.lat, lng: i.data.lng }));
    if (waypoints.length === 0) {
      alert('No locations with coordinates in this trip');
      return;
    }
    const waypointsParam = encodeURIComponent(JSON.stringify(waypoints));
    navigate(`/map?waypoints=${waypointsParam}`);
  };

  const shareTrip = () => {
    const url = `${window.location.origin}/trip/${id}`;
    navigator.clipboard.writeText(url);
    alert('Trip link copied!');
  };

  if (loading) return <LoadingSpinner size="lg" />;
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
      <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
        {editingTitle ? (
          <div className="flex-1 mr-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border rounded px-2 py-1 w-full"
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
              <Button size="sm" onClick={updateTrip}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingTitle(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-text">{trip.title}</h1>
            {trip.description && <p className="text-text-soft mt-1">{trip.description}</p>}
            <button onClick={() => setEditingTitle(true)} className="text-primary text-sm mt-1">✏️ Edit</button>
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={shareTrip}>🔗 Share</Button>
          <Button size="sm" onClick={viewOnMap} disabled={items.length === 0}>🗺️ View on Map</Button>
          <Link to="/trips" className="text-primary text-sm self-center">← Back</Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Places in this trip</h2>
          <Button size="sm" onClick={() => setShowAddModal(true)}>+ Add Place</Button>
        </div>
        {items.length === 0 ? (
          <p className="text-text-soft">No places added yet. Click "Add Place" to start.</p>
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
                          <div className="flex justify-between items-center">
                            <Link to={getLink(item)} className="flex-1">
                              <span className="font-medium">{getName(item)}</span>
                              <span className="text-xs text-text-soft ml-2 capitalize">{item.item_type}</span>
                            </Link>
                            <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">✕</button>
                          </div>
                          <div className="mt-2">
                            {editingNoteId === item.id ? (
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={notes[item.id] || ''}
                                  onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                                  className="flex-1 border rounded px-2 py-1 text-sm"
                                  placeholder="Add a note..."
                                  autoFocus
                                />
                                <button onClick={() => saveNote(item.id)} className="text-primary text-sm">Save</button>
                                <button onClick={() => setEditingNoteId(null)} className="text-gray-500 text-sm">Cancel</button>
                              </div>
                            ) : (
                              <div className="text-sm text-text-soft">
                                {notes[item.id] ? (
                                  <div className="flex justify-between">
                                    <span>📝 {notes[item.id]}</span>
                                    <button onClick={() => setEditingNoteId(item.id)} className="text-primary text-xs">Edit</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setEditingNoteId(item.id)} className="text-primary text-xs">+ Add note</button>
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

      {/* Add modal (unchanged) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add a place</h3>
            <div className="flex gap-2 mb-3">
              <button
                className={`px-3 py-1 rounded ${addType === 'destination' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                onClick={() => setAddType('destination')}
              >
                Destination
              </button>
              <button
                className={`px-3 py-1 rounded ${addType === 'business' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                onClick={() => setAddType('business')}
              >
                Business
              </button>
            </div>
            <input
              type="text"
              placeholder="Search..."
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
              {filteredAvailable.length === 0 && <p className="text-text-soft text-center">No results</p>}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}