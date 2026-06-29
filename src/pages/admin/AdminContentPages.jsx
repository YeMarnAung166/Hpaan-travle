import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import FormModal from '../../components/admin/FormModal';
import { SkeletonListItem } from '../../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';

const DEFAULT_SLUGS = ['travel-tips', 'history', 'contact', 'privacy', 'terms'];

export default function AdminContentPages() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    const { data } = await supabase.from('content_pages').select('*').order('slug');
    setPages(data || []);
    setLoading(false);
  };

  const openEdit = (page) => {
    setEditing({ ...page });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('content_pages')
      .upsert({ ...editing })
      .eq('id', editing.id);
    if (!error) {
      toast({ type: 'success', message: 'Page saved' });
      fetchPages();
      setEditing(null);
    } else {
      toast({ type: 'error', message: error.message });
    }
    setSaving(false);
  };

  if (loading) return <div className="container-custom pt-8"><SkeletonListItem count={5} /></div>;

  return (
    <div>
      <Helmet>
        <title>Manage Content Pages | Hpa-An Travel</title>
        <meta name="description" content="Manage content pages on Hpa-An Travel." />
        <meta property="og:title" content="Manage Content Pages" />
        <meta property="og:description" content="Manage content pages on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
      <h2 className="text-2xl font-bold mb-6">Content Pages</h2>

      <div className="space-y-3">
        {pages.length === 0 && <p className="text-text-soft">No pages found. Create one below.</p>}
        {pages.map(page => (
          <div key={page.id} className="flex items-center justify-between bg-white dark:bg-neutral-dark border border-border rounded-xl p-4">
            <div>
              <div className="font-semibold text-text">{page.title || page.slug}</div>
              <div className="text-sm text-text-soft">/{page.slug}</div>
            </div>
            <button
              onClick={() => openEdit(page)}
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-light transition"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-lg font-semibold mb-2">Create New Page</h3>
        <p className="text-sm text-text-soft mb-4">Enter a slug (e.g. "about") and a page will be created with default content.</p>
        <NewPageForm onCreated={fetchPages} />
      </div>

      {editing && (
        <FormModal
          isOpen={true}
          onClose={() => setEditing(null)}
          title={`Edit: ${editing.title || editing.slug}`}
          onSubmit={handleSave}
          loading={saving}
          submitLabel="Save"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={editing.slug}
                onChange={e => setEditing({ ...editing, slug: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title (English)</label>
              <input
                type="text"
                value={editing.title || ''}
                onChange={e => setEditing({ ...editing, title: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title (Burmese)</label>
              <input
                type="text"
                value={editing.title_my || ''}
                onChange={e => setEditing({ ...editing, title_my: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content (English) — supports JSON for structured pages</label>
              <textarea
                value={editing.content || ''}
                onChange={e => setEditing({ ...editing, content: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                rows="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content (Burmese)</label>
              <textarea
                value={editing.content_my || ''}
                onChange={e => setEditing({ ...editing, content_my: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                rows="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="text"
                value={editing.image || ''}
                onChange={e => setEditing({ ...editing, image: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={editing.published !== false}
                onChange={e => setEditing({ ...editing, published: e.target.checked })}
              />
              <label htmlFor="published" className="text-sm">Published</label>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}

function NewPageForm({ onCreated }) {
  const [slug, setSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!slug.trim()) return;
    setCreating(true);
    const { error } = await supabase
      .from('content_pages')
      .insert({ slug: slug.trim(), title: slug.trim(), content: '' });
    if (!error) {
      toast({ type: 'success', message: `Page "/${slug}" created` });
      setSlug('');
      onCreated();
    } else {
      toast({ type: 'error', message: error.message });
    }
    setCreating(false);
  };

  return (
    <form onSubmit={handleCreate} className="flex gap-2">
      <input
        type="text"
        value={slug}
        onChange={e => setSlug(e.target.value)}
        placeholder="page-slug"
        className="flex-1 border rounded-lg px-3 py-2 text-sm"
        required
      />
      <button
        type="submit"
        disabled={creating || !slug.trim()}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition disabled:opacity-50 text-sm"
      >
        {creating ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
