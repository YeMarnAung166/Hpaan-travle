import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import DataTable from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';

export default function AdminItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    description: '',
    image: '',
    days: [],
  });

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .order('id');
    if (!error) setItineraries(data);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDaysChange = (e) => {
    try {
      const days = JSON.parse(e.target.value);
      setFormData({ ...formData, days });
    } catch (err) {
      // Invalid JSON, ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingItem) {
      await supabase.from('itineraries').update(formData).eq('id', editingItem.id);
    } else {
      await supabase.from('itineraries').insert([formData]);
    }

    setModalOpen(false);
    setEditingItem(null);
    setFormData({ title: '', duration: '', description: '', image: '', days: [] });
    fetchItineraries();
    setSubmitting(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      duration: item.duration,
      description: item.description,
      image: item.image || '',
      days: item.days || [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this itinerary?')) {
      await supabase.from('itineraries').delete().eq('id', id);
      fetchItineraries();
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'duration', label: 'Duration' },
    {
      key: 'image',
      label: 'Image',
      render: (value) =>
        value ? (
          <img src={value} alt="Preview" className="w-10 h-10 object-cover rounded" />
        ) : (
          '—'
        ),
    },
  ];

  if (loading) return <div className="spinner mx-auto"></div>;

  return (
    <>
      <DataTable
        title="Itineraries"
        data={itineraries}
        columns={columns}
        onAdd={() => setModalOpen(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Itinerary' : 'Add Itinerary'}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="text"
          name="duration"
          placeholder="Duration (e.g., 2 days)"
          value={formData.duration}
          onChange={handleInputChange}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          rows="3"
          required
        />
        <input
          type="url"
          name="image"
          placeholder="Image URL"
          value={formData.image}
          onChange={handleInputChange}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">Days (JSON format)</label>
        <textarea
          name="days"
          placeholder='[{"day":1,"activities":["Activity 1","Activity 2"]}]'
          value={JSON.stringify(formData.days, null, 2)}
          onChange={handleDaysChange}
          className="w-full border rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          rows="6"
          required
        />
      </FormModal>
    </>
  );
}