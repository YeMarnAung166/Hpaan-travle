import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import DataTable from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import { useLanguage } from '../../context/LanguageContext';
import ImageUploader from '../../components/ImageUploader';

export default function AdminItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    title_my: '',
    duration: '',
    description: '',
    description_my: '',
    image: '',
    days: [],
    days_my: [],
  });
  const [daysJson, setDaysJson] = useState('');
  const [daysMyJson, setDaysMyJson] = useState('');

  useEffect(() => { fetchItineraries(); }, []);

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
    setDaysJson(e.target.value);
    try {
      const days = JSON.parse(e.target.value);
      setFormData({ ...formData, days });
    } catch (err) {}
  };

  const handleDaysMyChange = (e) => {
    setDaysMyJson(e.target.value);
    try {
      const days_my = JSON.parse(e.target.value);
      setFormData({ ...formData, days_my });
    } catch (err) {}
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
    setFormData({ title: '', title_my: '', duration: '', description: '', description_my: '', image: '', days: [], days_my: [] });
    setDaysJson('');
    setDaysMyJson('');
    fetchItineraries();
    setSubmitting(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      title_my: item.title_my || '',
      duration: item.duration || '',
      description: item.description || '',
      description_my: item.description_my || '',
      image: item.image || '',
      days: item.days || [],
      days_my: item.days_my || [],
    });
    setDaysJson(JSON.stringify(item.days || [], null, 2));
    setDaysMyJson(JSON.stringify(item.days_my || [], null, 2));
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm(t('admin.confirm_delete'))) {
      await supabase.from('itineraries').delete().eq('id', id);
      fetchItineraries();
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title', render: (_, item) => language === 'my' && item.title_my ? item.title_my : item.title },
    { key: 'duration', label: 'Duration' },
    { key: 'image', label: 'Image', render: (val) => val ? <img src={val} className="w-10 h-10 object-cover rounded" /> : '—' },
  ];

  if (loading) return <div className="spinner mx-auto"></div>;

  return (
    <>
      <DataTable
        title={t('admin.itineraries')}
        data={itineraries}
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
          <input type="text" name="duration" placeholder="Duration (e.g., 2 days)" value={formData.duration} onChange={handleInputChange} className="w-full border rounded px-3 py-2 mb-2" required />
          <textarea name="description" placeholder="Description (English)" value={formData.description} onChange={handleInputChange} rows="3" className="w-full border rounded px-3 py-2 mb-2" required />
          <label className="block text-sm font-medium mb-1">Days (JSON - English)</label>
          <textarea placeholder='[{"day":1,"activities":["Activity 1","Activity 2"]}]' value={daysJson} onChange={handleDaysChange} rows="6" className="w-full border rounded px-3 py-2 font-mono text-sm" required />
        </div>
        {/* Burmese Fields */}
        <div className="border-b pb-3 mb-3">
          <h3 className="font-semibold mb-2">မြန်မာ (Burmese)</h3>
          <input type="text" name="title_my" placeholder="ခေါင်းစဉ် (မြန်မာ)" value={formData.title_my} onChange={handleInputChange} className="w-full border rounded px-3 py-2 mb-2" />
          <textarea name="description_my" placeholder="ဖော်ပြချက် (မြန်မာ)" value={formData.description_my} onChange={handleInputChange} rows="3" className="w-full border rounded px-3 py-2 mb-2" />
          <label className="block text-sm font-medium mb-1">နေ့စဉ်လုပ်ဆောင်မှုများ (မြန်မာ) - JSON</label>
          <textarea placeholder='[{"day":1,"activities":["လုပ်ဆောင်ချက် ၁","လုပ်ဆောင်ချက် ၂"]}]' value={daysMyJson} onChange={handleDaysMyChange} rows="6" className="w-full border rounded px-3 py-2 font-mono text-sm" />
        </div>
        {/* Media */}
        <div>
          <h3 className="font-semibold mb-2">Media</h3>
          <ImageUploader
            folderPath={`itineraries/${editingItem?.id || 'temp'}`}
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