import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Helmet } from 'react-helmet-async';
import { getOptimizedImage } from '../../utils/imageHelpers';

export default function AdminUserPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);
  const perPage = 12;
  const { t, language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => { fetchPhotos(); }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('user_photos')
      .select('*, businesses(name, name_my), itineraries(title, title_my)')
      .eq('moderated', false)
      .order('created_at', { ascending: false });
    if (!error) setPhotos(data);
    setLoading(false);
  };

  const processed = useMemo(() => {
    if (!debouncedSearch) return photos;
    const term = debouncedSearch.toLowerCase();
    return photos.filter((photo) => {
      const targetName = photo.businesses?.name || photo.itineraries?.title || '';
      const caption = photo.caption || '';
      const email = photo.user_email || '';
      return targetName.toLowerCase().includes(term)
        || caption.toLowerCase().includes(term)
        || email.toLowerCase().includes(term);
    });
  }, [photos, debouncedSearch]);

  const totalPages = Math.ceil(processed.length / perPage);
  const paginated = processed.slice((currentPage - 1) * perPage, currentPage * perPage);

  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); return pages; }
    pages.push(1);
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    if (currentPage <= 2) start = 2;
    if (currentPage >= totalPages - 1) end = totalPages - 1;
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map(p => p.id)));
    }
  };

  const handleApprove = async (id) => {
    const { error } = await supabase.from('user_photos').update({ moderated: true }).eq('id', id);
    if (error) toast({ type: 'error', message: error.message });
    else { toast({ type: 'success', message: 'Photo approved' }); fetchPhotos(); }
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleBatchApprove = async () => {
    const ids = [...selected];
    const { error } = await supabase.from('user_photos').update({ moderated: true }).in('id', ids);
    if (error) toast({ type: 'error', message: error.message });
    else { toast({ type: 'success', message: `${ids.length} photos approved` }); fetchPhotos(); }
    setSelected(new Set());
    setConfirmAction(null);
  };

  const handleDelete = async (id, imageUrl) => {
    if (imageUrl) {
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.indexOf('object') + 2;
      const filePath = urlParts.slice(bucketIndex + 1).join('/');
      if (filePath) {
        await supabase.storage.from('hpaan-assets').remove([filePath]);
      }
    }
    const { error } = await supabase.from('user_photos').delete().eq('id', id);
    if (error) { toast({ type: 'error', message: `Delete failed: ${error.message}` }); }
    else { toast({ type: 'success', message: 'Photo deleted' }); fetchPhotos(); }
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleBatchDelete = async () => {
    const ids = [...selected];
    for (const id of ids) {
      await supabase.from('user_photos').delete().eq('id', id);
    }
    toast({ type: 'success', message: `${ids.length} photos deleted` });
    fetchPhotos();
    setSelected(new Set());
    setConfirmAction(null);
  };

  if (loading) return <div className="spinner mx-auto"></div>;

  return (
    <div>
      <Helmet>
        <title>Moderate Photos | Hpa-An Travel</title>
        <meta name="description" content="Moderate user-uploaded photos on Hpa-An Travel." />
        <meta property="og:title" content="Moderate Photos" />
        <meta property="og:description" content="Moderate user-uploaded photos on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">{t('admin.moderate_photos')}</h2>
        <input
          type="text"
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 border border-neutral-mid rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-64"
        />
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-text">{selected.size} selected</span>
          <button onClick={() => setConfirmAction('approve')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
            Approve All
          </button>
          <button onClick={() => setConfirmAction('delete')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm">
            Delete All
          </button>
          <button onClick={() => setSelected(new Set())} className="px-3 py-1 border border-border rounded text-sm hover:bg-overlay transition">
            Clear
          </button>
        </div>
      )}

      {processed.length === 0 ? (
        <p className="text-center py-12 text-text-soft">{searchTerm ? t('common.no_results') : t('admin.no_pending')}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((photo) => {
              let targetName = '';
              if (photo.businesses) {
                targetName = language === 'my' && photo.businesses.name_my
                  ? photo.businesses.name_my : photo.businesses.name;
              } else if (photo.itineraries) {
                targetName = language === 'my' && photo.itineraries.title_my
                  ? photo.itineraries.title_my : photo.itineraries.title;
              } else { targetName = 'N/A'; }

              return (
                <div key={photo.id} className={`bg-white dark:bg-neutral-dark rounded-xl border p-4 transition ${selected.has(photo.id) ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={selected.has(photo.id)}
                      onChange={() => toggleSelect(photo.id)}
                      className="accent-primary"
                    />
                    <span className="text-xs text-text-soft">Select</span>
                  </div>
                  <img
                    src={getOptimizedImage(photo.image_url, 300)}
                    alt="User upload"
                    className="w-full h-48 object-cover rounded"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.target.src = '/fallback-image.jpg'; }}
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-text"><strong>{t('business.title')}:</strong> {targetName}</p>
                    <p className="text-sm text-text"><strong>{t('admin.user')}:</strong> {photo.user_email || photo.user_id}</p>
                    {photo.caption && <p className="text-sm text-text-soft">"{photo.caption}"</p>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleApprove(photo.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">{t('admin.approve')}</button>
                    <button onClick={() => handleDelete(photo.id, photo.image_url)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm">{t('admin.delete')}</button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-border rounded text-sm disabled:opacity-40 hover:bg-overlay transition"
              >
                {t('pagination.previous')}
              </button>
              {pageNumbers.map((page, i) =>
                page === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-text-soft text-sm">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded text-sm font-medium transition ${currentPage === page ? 'bg-primary text-white' : 'text-text hover:bg-overlay border border-border'}`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-border rounded text-sm disabled:opacity-40 hover:bg-overlay transition"
              >
                {t('pagination.next')}
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirmAction === 'approve'}
        title={`Approve ${selected.size} photos?`}
        message="These photos will be marked as moderated and visible to all users."
        onConfirm={handleBatchApprove}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === 'delete'}
        title={`Delete ${selected.size} photos?`}
        message="This action cannot be undone."
        onConfirm={handleBatchDelete}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
