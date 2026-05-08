import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import DataTable from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import ImageUploader from '../../components/ImageUploader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const CATEGORIES = [
  { value: 'accommodation', label: 'Accommodation', labelMy: 'နေရာထိုင်ခင်း' },
  { value: 'restaurant', label: 'Restaurant', labelMy: 'စားသောက်ဆိုင်' },
  { value: 'transport', label: 'Transport', labelMy: 'ခရီးသွားပို့ဆောင်ရေး' },
  { value: 'tours', label: 'Tours & Activities', labelMy: 'ခရီးစဉ်များ' },
];

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '', name_my: '', category: 'accommodation', description: '', description_my: '',
    address: '', address_my: '', phone: '', image: '',
  });

  useEffect(() => { fetchBusinesses(); }, []);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from('businesses').select('*').order('id');
    if (data) setBusinesses(data);
    setLoading(false);
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (editingItem) await supabase.from('businesses').update(formData).eq('id', editingItem.id);
    else await supabase.from('businesses').insert([formData]);
    setModalOpen(false);
    setEditingItem(null);
    setFormData({ name: '', name_my: '', category: 'accommodation', description: '', description_my: '', address: '', address_my: '', phone: '', image: '' });
    fetchBusinesses();
    setSubmitting(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '', name_my: item.name_my || '', category: item.category || 'accommodation',
      description: item.description || '', description_my: item.description_my || '',
      address: item.address || '', address_my: item.address_my || '',
      phone: item.phone || '', image: item.image || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm(t('admin.confirm_delete'))) {
      await supabase.from('businesses').delete().eq('id', id);
      fetchBusinesses();
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name', render: (_, item) => language === 'my' && item.name_my ? item.name_my : item.name },
    { key: 'category', label: 'Category', render: (val) => language === 'my' ? CATEGORIES.find(c => c.value === val)?.labelMy : CATEGORIES.find(c => c.value === val)?.label },
    { key: 'phone', label: 'Phone' },
    { key: 'image', label: 'Image', render: (val) => val ? <img src={val} className="w-10 h-10 object-cover rounded" /> : '—' },
  ];

  if (loading) return <div className="spinner mx-auto"></div>;

  return (
    <>
      <DataTable title={t('admin.businesses')} data={businesses} columns={columns} onAdd={() => setModalOpen(true)} onEdit={handleEdit} onDelete={handleDelete} />
      <FormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(null); }} title={editingItem ? t('admin.edit') : t('admin.add')} onSubmit={handleSubmit} loading={submitting}>
        <div className="border-b pb-3 mb-3">
          <h3 className="font-semibold mb-2">English</h3>
          <Input name="name" placeholder="Business Name (English)" value={formData.name} onChange={handleInputChange} required />
          <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-neutral-mid rounded-lg px-3 py-2 mb-3">
            {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>
          <textarea name="description" placeholder="Description (English)" value={formData.description} onChange={handleInputChange} rows="3" className="w-full border border-neutral-mid rounded-lg px-3 py-2 mb-3" required />
          <Input name="address" placeholder="Address (English)" value={formData.address} onChange={handleInputChange} />
        </div>
        <div className="border-b pb-3 mb-3">
          <h3 className="font-semibold mb-2">မြန်မာ (Burmese)</h3>
          <Input name="name_my" placeholder="အမည် (မြန်မာ)" value={formData.name_my} onChange={handleInputChange} />
          <textarea name="description_my" placeholder="ဖော်ပြချက် (မြန်မာ)" value={formData.description_my} onChange={handleInputChange} rows="3" className="w-full border border-neutral-mid rounded-lg px-3 py-2 mb-3" />
          <Input name="address_my" placeholder="လိပ်စာ (မြန်မာ)" value={formData.address_my} onChange={handleInputChange} />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Contact & Media</h3>
          <Input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} />
          <ImageUploader folderPath={`businesses/${editingItem?.id || 'temp'}`} existingImageUrl={formData.image} onUploadComplete={(result) => setFormData(prev => ({ ...prev, image: result?.publicUrl || '' }))} />
        </div>
      </FormModal>
    </>
  );
}