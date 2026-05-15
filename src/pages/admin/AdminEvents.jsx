import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import DataTable from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import { useLanguage } from '../../context/LanguageContext';
import ImageUploader from '../../components/ImageUploader';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    title_my: '',
    description: '',
    description_my: '',
    event_date: '',
    location: '',
    location_my: '',
    image: '',
  });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    if (!error) setEvents(data);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (editingItem) {
      await supabase.from('events').update(formData).eq('id', editingItem.id);
    } else {
      await supabase.from('events').insert([formData]);
    }
    setModalOpen(false);
    setEditingItem(null);
    setFormData({ title: '', title_my: '', description: '', description_my: '', event_date: '', location: '', location_my: '', image: '' });
    fetchEvents();
    setSubmitting(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      title_my: item.title_my || '',
      description: item.description || '',
      description_my: item.description_my || '',
      event_date: item.event_date,
      location: item.location || '',
      location_my: item.location_my || '',
      image: item.image || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm(t('admin.confirm_delete'))) {
      await supabase.from('events').delete().eq('id', id);
      fetchEvents();
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title', render: (_, item) => language === 'my' && item.title_my ? item.title_my : item.title },
    { key: 'event_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'location', label: 'Location', render: (_, item) => language === 'my' && item.location_my ? item.location_my : item.location },
  ];

  if (loading) return <div className="spinner mx-auto"></div>;

  return (
    <>
      <DataTable
        title={t('admin.events')}
        data={events}
        columns={columns}
        onAdd={() => setModalOpen(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <FormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        title={editingItem ? (t('admin.edit') || 'Edit') : (t('admin.add') || 'Add')}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        {/* English Fields */}
        <div className="border-b pb-3 mb-3">
          <h3 className="font-semibold mb-2">English</h3>
          <input type="text" name="title" placeholder="Title (English)" value={formData.title} onChange={handleInputChange} className="w-full border rounded px-3 py-2 mb-2" required />
          <textarea name="description" placeholder="Description (English)" value={formData.description} onChange={handleInputChange} rows="3" className="w-full border rounded px-3 py-2 mb-2" />
          <input type="text" name="location" placeholder="Location (English)" value={formData.location} onChange={handleInputChange} className="w-full border rounded px-3 py-2 mb-2" />
        </div>
        {/* Burmese Fields */}
        <div className="border-b pb-3 mb-3">
          <h3 className="font-semibold mb-2">မြန်မာ (Burmese)</h3>
          <input type="text" name="title_my" placeholder="ခေါင်းစဉ် (မြန်မာ)" value={formData.title_my} onChange={handleInputChange} className="w-full border rounded px-3 py-2 mb-2" />
          <textarea name="description_my" placeholder="ဖော်ပြချက် (မြန်မာ)" value={formData.description_my} onChange={handleInputChange} rows="3" className="w-full border rounded px-3 py-2 mb-2" />
          <input type="text" name="location_my" placeholder="တည်နေရာ (မြန်မာ)" value={formData.location_my} onChange={handleInputChange} className="w-full border rounded px-3 py-2 mb-2" />
        </div>
        {/* Date & Media */}
        <div>
          <h3 className="font-semibold mb-2">Date & Media</h3>
          <input type="date" name="event_date" value={formData.event_date} onChange={handleInputChange} className="w-full border rounded px-3 py-2 mb-2" required />
          <ImageUploader
            folderPath={`events/${editingItem?.id || 'temp'}`}
            existingImageUrl={formData.image}
            onUploadComplete={(result) => {
              setFormData(prev => ({ ...prev, image: result?.publicUrl || '' }));
            }}
          />
        </div>
      </FormModal>
    </>
  );
}