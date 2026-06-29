import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import DataTable from "../../components/admin/DataTable";
import FormModal from "../../components/admin/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useLanguage } from "../../context/LanguageContext";
import ImageUploader from "../../components/ImageUploader";
import { Helmet } from 'react-helmet-async';

const CATEGORIES = [
  { value: "accommodation", label: "Accommodation", labelMy: "နေရာထိုင်ခင်း" },
  { value: "restaurant", label: "Restaurant", labelMy: "စားသောက်ဆိုင်" },
  { value: "transport", label: "Transport", labelMy: "ခရီးသွားပို့ဆောင်ရေး" },
  { value: "tours", label: "Tours & Activities", labelMy: "ခရီးစဉ်များ" },
];

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { t, language } = useLanguage();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    name_my: "",
    category: "accommodation",
    description: "",
    description_my: "",
    address: "",
    address_my: "",
    phone: "",
    image: "",
    video_url: "",
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .order("id");
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
      await supabase
        .from("businesses")
        .update(formData)
        .eq("id", editingItem.id);
    } else {
      await supabase.from("businesses").insert([formData]);
    }
    setModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      name_my: "",
      category: "accommodation",
      description: "",
      description_my: "",
      address: "",
      address_my: "",
      phone: "",
      image: "",
    });
    fetchBusinesses();
    setSubmitting(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      name_my: item.name_my || "",
      category: item.category || "accommodation",
      description: item.description || "",
      description_my: item.description_my || "",
      address: item.address || "",
      address_my: item.address_my || "",
      phone: item.phone || "",
      image: item.image || "",
      video_url: item.video_url || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from("businesses").delete().eq("id", deleteTarget);
    setDeleteTarget(null);
    fetchBusinesses();
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Name",
      render: (_, item) =>
        language === "my" && item.name_my ? item.name_my : item.name,
    },
    {
      key: "category",
      label: "Category",
      render: (val) =>
        language === "my"
          ? CATEGORIES.find((c) => c.value === val)?.labelMy
          : CATEGORIES.find((c) => c.value === val)?.label,
    },
    { key: "phone", label: "Phone" },
    {
      key: "image",
      label: "Image",
      render: (val) =>
        val ? (
          <img src={val} className="w-10 h-10 object-cover rounded" />
        ) : (
          "—"
        ),
    },
  ];

  if (loading) return <div className="spinner mx-auto"></div>;

  return (
    <>
      <Helmet>
        <title>Manage Businesses | Hpa-An Travel</title>
        <meta name="description" content="Manage businesses on Hpa-An Travel." />
        <meta property="og:title" content="Manage Businesses" />
        <meta property="og:description" content="Manage businesses on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
      <DataTable
        title={t("admin.businesses")}
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
        title={
          editingItem ? t("admin.edit") || "Edit" : t("admin.add") || "Add"
        }
        onSubmit={handleSubmit}
        loading={submitting}
      >
        {/* English Fields */}
        <div className="border-b pb-3 mb-3">
          <h3 className="font-semibold mb-2">English</h3>
          <input
            type="text"
            name="name"
            placeholder="Business Name (English)"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
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
            rows="3"
            className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address (English)"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
          />
        </div>
        {/* Burmese Fields */}
        <div className="border-b pb-3 mb-3">
          <h3 className="font-semibold mb-2">မြန်မာ (Burmese)</h3>
          <input
            type="text"
            name="name_my"
            placeholder="အမည် (မြန်မာ)"
            value={formData.name_my}
            onChange={handleInputChange}
            className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
          />
          <textarea
            name="description_my"
            placeholder="ဖော်ပြချက် (မြန်မာ)"
            value={formData.description_my}
            onChange={handleInputChange}
            rows="3"
            className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
          />
          <input
            type="text"
            name="address_my"
            placeholder="လိပ်စာ (မြန်မာ)"
            value={formData.address_my}
            onChange={handleInputChange}
            className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
          />
        </div>
        {/* Media & Contact */}
        <div>
          <h3 className="font-semibold mb-2">Contact & Media</h3>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
          />
          <ImageUploader
            folderPath={`businesses/${editingItem?.id || "temp"}`}
            existingImageUrl={formData.image}
            onUploadComplete={(result) => {
              setFormData((prev) => ({
                ...prev,
                image: result?.publicUrl || "",
              }));
            }}
          />
          <div>
            <h3 className="font-semibold mb-2">Video</h3>
            <input
              type="url"
              name="video_url"
              placeholder="YouTube video URL (e.g., https://www.youtube.com/watch?v=...)"
              value={formData.video_url}
              onChange={handleInputChange}
              className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
            />
          </div>
        </div>
      </FormModal>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this business?"
        message={t("admin.confirm_delete")}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
