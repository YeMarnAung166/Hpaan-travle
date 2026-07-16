import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabaseClient";
import DataTable from "../../components/admin/DataTable";
import FormModal from "../../components/admin/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useLanguage } from "../../context/LanguageContext";
import ImageUploader from "../../components/ImageUploader";
import LocationPicker from "../../components/LocationPicker";
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';

const CATEGORIES = [
  { value: "accommodation", label: "Accommodation", labelMy: "နေရာထိုင်ခင်း" },
  { value: "restaurant", label: "Restaurant", labelMy: "စားသောက်ဆိုင်" },
  { value: "transport", label: "Transport", labelMy: "ခရီးသွားပို့ဆောင်ရေး" },
  { value: "tours", label: "Tours & Activities", labelMy: "ခရီးစဉ်များ" },
];

export default function AdminBusinesses() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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
    lat: "",
    lng: "",
  });

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["admin", "businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("id");
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["businesses"] });
    queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (editingItem) {
        await supabase.from("businesses").update(payload).eq("id", editingItem.id);
      } else {
        await supabase.from("businesses").insert([payload]);
      }
    },
    onSuccess: () => {
      setModalOpen(false);
      setEditingItem(null);
      setFormData({
        name: "", name_my: "", category: "accommodation", description: "", description_my: "",
        address: "", address_my: "", phone: "", image: "", lat: "", lng: "",
      });
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await supabase.from("businesses").delete().eq("id", id);
    },
    onSuccess: () => {
      setDeleteTarget(null);
      invalidate();
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (lat, lng) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lng: formData.lng ? parseFloat(formData.lng) : null,
    };
    mutation.mutate(payload);
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
      lat: item.lat ?? "",
      lng: item.lng ?? "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
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
    { key: "lat", label: "Latitude" },
    { key: "lng", label: "Longitude" },
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

  if (isLoading) return <div className="container-custom pt-8"><SkeletonTable rows={6} cols={5} /></div>;

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
        loading={mutation.isPending}
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
          <div className="mb-4">
            <LocationPicker
              lat={formData.lat}
              lng={formData.lng}
              onLocationChange={handleLocationChange}
            />
          </div>
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
