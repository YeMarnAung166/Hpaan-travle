import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from './ui/LoadingSpinner';

export default function ContentPage({ slug, defaultTitle }) {
  const { language } = useLanguage();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('content_pages')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        setPage(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner size="lg" />;

  const lang = language === 'my' ? 'my' : 'en';
  const title = page ? (page[`title_${lang}`] || page.title) : (defaultTitle || slug);
  const content = page ? (lang === 'my' && page.content_my ? page.content_my : page.content) : '';

  return (
    <div className="container-custom max-w-4xl min-h-[60vh]">
      <h1 className="page-title">{title}</h1>
      {content ? (
        <div className="prose prose-lg max-w-none text-text-soft leading-relaxed whitespace-pre-line">
          {content}
        </div>
      ) : (
        <p className="text-text-soft">Content coming soon.</p>
      )}
    </div>
  );
}
