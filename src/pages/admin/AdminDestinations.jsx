import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import DataTable from "../../components/admin/DataTable";
import FormModal from "../../components/admin/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useLanguage } from "../../context/LanguageContext";
import ImageUploader from "../../components/ImageUploader";
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { t, language } = useLanguage();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    name_my: "",
    description: "",
    description_my: "",
    lat: "",
    lng: "",
    image: "",
    video_url: "",
  });

  const fetchDestinations = async () => {
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .order("id");
    if (!error) setDestinations(data);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDestinations();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...formData,
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lng: formData.lng ? parseFloat(formData.lng) : null,
    };
    if (editingItem) {
      await supabase
        .from("destinations")
        .update(payload)
        .eq("id", editingItem.id);
    } else {
      await supabase.from("destinations").insert([payload]);
    }
    setModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      name_my: "",
      description: "",
      description_my: "",
      lat: "",
      lng: "",
      image: "",
    });
    fetchDestinations();
    setSubmitting(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      name_my: item.name_my || "",
      description: item.description || "",
      description_my: item.description_my || "",
      lat: item.lat ?? "",
      lng: item.lng ?? "",
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
    await supabase.from("destinations").delete().eq("id", deleteTarget);
    setDeleteTarget(null);
    fetchDestinations();
  };

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "name",
      label: "Name",
      render: (_, item) =>
        language === "my" && item.name_my ? item.name_my : item.name,
    },
    { key: "lat", label: "Latitude" },
    { key: "lng", label: "Longitude" },
    {
      key: "image",
      label: "Image",
      render: (value) => {
        const defaultImageUrl =
          "https://hqzodqvstvdemmqxphbv.supabase.co/storage/v1/object/public/hpaan-assets/default/default-event.jpg";
        return (
          <img
            src={value || defaultImageUrl}
            alt="Preview"
            className="w-10 h-10 object-cover rounded"
          />
        );
      },
    },
  ];

  if (loading) return <div className="container-custom pt-8"><SkeletonTable rows={6} cols={4} /></div>;

  return (
    <>
      <Helmet>
        <title>Manage Destinations | Hpa-An Travel</title>
        <meta name="description" content="Manage destinations on Hpa-An Travel." />
        <meta property="og:title" content="Manage Destinations" />
        <meta property="og:description" content="Manage destinations on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
      <DataTable
        title={t("admin.destinations") || "Destinations"}
        data={destinations}
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
        <div className="border-b pb-3 mb-3">
          <h3 className="font-semibold mb-2">English</h3>
          <input
            type="text"
            name="name"
            placeholder="Name (English)"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
            required
          />
          <textarea
            name="description"
            placeholder="Description (English)"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
            required
          />
        </div>
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
        </div>
        <div>
          <h3 className="font-semibold mb-2">Location & Media</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              name="lat"
              placeholder="Latitude"
              value={formData.lat}
              onChange={handleInputChange}
              className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
            />
            <input
              type="text"
              name="lng"
              placeholder="Longitude"
              value={formData.lng}
              onChange={handleInputChange}
              className="w-full border border-border dark:border-border rounded px-3 py-2 mb-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
            />
          </div>
          <ImageUploader
            folderPath={`destinations/${editingItem?.id || "temp"}`}
            existingImageUrl={formData.image}
            onUploadComplete={(result) =>
              setFormData((prev) => ({
                ...prev,
                image: result?.publicUrl || "",
              }))
            }
          />
          <div>
            <h3 className="font-semibold mb-2">Video</h3>
            <input
              type="url"
              name="video_url"
              placeholder="YouTube video URL (e.g., https://www.youtube.com/watch?v=...)"
              value={formData.video_url}
              onChange={handleInputChange}
              className="w-full border border-border dark:border-border rounded px-3 py-2 bg-transparent text-text dark:text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-gold/30 dark:focus:ring-primary/30"
            />
          </div>
        </div>
      </FormModal>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this destination?"
        message={t("admin.confirm_delete")}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
