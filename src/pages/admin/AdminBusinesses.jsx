import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import DataTable from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';
import { useLanguage } from '../../context/LanguageContext';

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
    name: '',
    name_my: '',
    category: 'accommodation',
    description: '',
    description_my: '',
    address: '',
    address_my: '',
    phone: '',
    image: '',
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('id');
    if (!error) setBusinesses(data);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingItem) {
      const { error } = await supabase
        .from('businesses')
        .update(formData)
        .eq('id', editingItem.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase
        .from('businesses')
        .insert([formData]);
      if (error) alert(error.message);
    }

    setModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      name_my: '',
      category: 'accommodation',
      description: '',
      description_my: '',
      address: '',
      address_my: '',
      phone: '',
      image: '',
    });
    fetchBusinesses();
    setSubmitting(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      name_my: item.name_my || '',
      category: item.category || 'accommodation',
      description: item.description || '',
      description_my: item.description_my || '',
      address: item.address || '',
      address_my: item.address_my || '',
      phone: item.phone || '',
      image: item.image || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm(t('admin.confirm_delete'))) {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);
      if (error) alert(error.message);
      else fetchBusinesses();
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'name',
      label: 'Name',
      render: (_, item) => language === 'my' && item.name_my ? item.name_my : item.name,
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => {
        const cat = CATEGORIES.find(c => c.value === value);
        if (language === 'my' && cat) return cat.labelMy;
        return cat?.label || value;
      },
    },
    { key: 'phone', label: 'Phone' },
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
        title={t('admin.businesses')}
        data={businesses}
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
        title={editingItem ? t('admin.edit') : t('admin.add')}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        {/* English Fields */}
        <div className="border-b pb-3 mb-3">
          <h3 className="font-semibold text-gray-700 mb-2">English</h3>
          <input
            type="text"
            name="name"
            placeholder="Business Name (English)"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <textarea
            name="description"
            placeholder="Description (English)"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address (English)"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Burmese Fields */}
        <div className="border-b pb-3 mb-3">
          <h3 className="font-semibold text-gray-700 mb-2">မြန်မာ (Burmese)</h3>
          <input
            type="text"
            name="name_my"
            placeholder="အမည် (မြန်မာ)"
            value={formData.name_my}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <textarea
            name="description_my"
            placeholder="ဖော်ပြချက် (မြန်မာ)"
            value={formData.description_my}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
          />
          <input
            type="text"
            name="address_my"
            placeholder="လိပ်စာ (မြန်မာ)"
            value={formData.address_my}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Common Fields */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Contact & Media</h3>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="url"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </FormModal>
    </>
  );
}