import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { SkeletonListItem } from '../../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';

export default function AdminBlog() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', title_my: '', slug: '', excerpt: '', excerpt_my: '',
    content: '', content_my: '', image: '', author: '', published: false,
  });

  const fetchPosts = async () => {
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (!error) setPosts(data || []);
    setLoading(false);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, []);
  const resetForm = () => {
    setForm({ title: '', title_my: '', slug: '', excerpt: '', excerpt_my: '', content: '', content_my: '', image: '', author: '', published: false });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (post) => {
    setForm(post);
    setEditing(post.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.slug) {
      toast({ type: 'warning', message: 'Title and slug are required.' });
      return;
    }
    const record = { ...form };
    if (editing) {
      const { error } = await supabase.from('blog_posts').update(record).eq('id', editing);
      if (error) { toast({ type: 'error', message: error.message }); return; }
      toast({ type: 'success', message: 'Post updated' });
    } else {
      const { error } = await supabase.from('blog_posts').insert(record);
      if (error) { toast({ type: 'error', message: error.message }); return; }
      toast({ type: 'success', message: 'Post created' });
    }
    resetForm();
    fetchPosts();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) { toast({ type: 'error', message: error.message }); return; }
    toast({ type: 'success', message: 'Post deleted' });
    fetchPosts();
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) return <div className="container-custom pt-8"><SkeletonListItem count={5} /></div>;

  return (
    <div>
      <Helmet>
        <title>Manage Blog | Hpa-An Travel</title>
        <meta name="description" content="Manage blog posts on Hpa-An Travel." />
        <meta property="og:title" content="Manage Blog" />
        <meta property="og:description" content="Manage blog posts on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-bold">Blog Posts</h1>
        <Button variant="primary" onClick={() => { resetForm(); setShowForm(true); }}>New Post</Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={resetForm}>
          <div className="relative bg-white dark:bg-neutral-dark rounded-2xl shadow-2xl w-full max-w-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Post' : 'New Post'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Title (EN)</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : generateSlug(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Title (MY)</label>
                  <input type="text" value={form.title_my} onChange={e => setForm({ ...form, title_my: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Excerpt (EN)</label>
                  <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Excerpt (MY)</label>
                  <textarea value={form.excerpt_my} onChange={e => setForm({ ...form, excerpt_my: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Content (EN)</label>
                  <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Content (MY)</label>
                  <textarea value={form.content_my} onChange={e => setForm({ ...form, content_my: e.target.value })} rows={6} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input type="text" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} className="accent-primary" />
                Published
              </label>
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary">{editing ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
            <button onClick={resetForm} className="absolute top-3 right-3 text-text-soft hover:text-text transition">✕</button>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-text-soft">No blog posts yet.</p>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl border border-border p-4 flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text truncate">{language === 'my' && post.title_my ? post.title_my : post.title}</h3>
                  {post.published ? (
                    <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">Published</span>
                  ) : (
                    <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">Draft</span>
                  )}
                </div>
                <p className="text-xs text-text-soft">{post.slug} · {new Date(post.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <Button variant="ghost" size="sm" onClick={() => openEdit(post)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(post.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
