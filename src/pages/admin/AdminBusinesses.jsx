import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import DataTable from '../../components/admin/DataTable';
import FormModal from '../../components/admin/FormModal';

const CATEGORIES = ['accommodation', 'restaurant', 'transport', 'tours'];

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'accommodation',
    description: '',
    address: '',
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
      await supabase.from('businesses').update(formData).eq('id', editingItem.id);
    } else {
      await supabase.from('businesses').insert([formData]);
    }

    setModalOpen(false);
    setEditingItem(null);
    setFormData({ name: '', category: 'accommodation', description: '', address: '', phone: '', image: '' });
    fetchBusinesses();
    setSubmitting(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      address: item.address || '',
      phone: item.phone || '',
      image: item.image || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure? This will also delete its reviews!')) {
      await supabase.from('businesses').delete().eq('id', id);
      fetchBusinesses();
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
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
        title="Businesses"
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
        title={editingItem ? 'Edit Business' : 'Add Business'}
        onSubmit={handleSubmit}
        loading={submitting}
      >
        <input
          type="text"
          name="name"
          placeholder="Business Name"
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
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
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
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleInputChange}
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
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
          className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </FormModal>
    </>
  );
}