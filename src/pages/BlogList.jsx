import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { SkeletonCard } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Helmet } from 'react-helmet-async';
import { getOptimizedImage } from '../utils/imageHelpers';

export default function BlogList() {
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 9;

  const fetchPosts = async () => {
    setLoading(true);
    const { count } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true);
    if (count) setTotalPages(Math.ceil(count / perPage));
    const from = (page - 1) * perPage;
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, title_my, excerpt, excerpt_my, slug, image, created_at, author')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, from + perPage - 1);
    if (!error) setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, [page]);

  const getLocal = (en, my) => language === 'my' && my ? my : en;

  if (loading) {
    return (
      <div className="container-custom">
        <h1 className="page-title">{t('nav.blog')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom max-w-5xl">
      <Helmet>
        <title>Blog | Hpa-An Travel</title>
        <meta name="description" content="Travel stories, tips, and guides about Hpa-An, Myanmar." />
        <meta property="og:title" content={t('nav.blog')} />
        <meta property="og:description" content="Travel stories, tips, and guides about Hpa-An, Myanmar." />
        <meta property="og:type" content="website" />
      </Helmet>
      <h1 className="page-title">{t('nav.blog')}</h1>
      <p className="text-text-soft mb-8">
        {language === 'my' ? 'ခရီးသွားအတွေ့အကြုံများနှင့် အကြံပြုချက်များ' : 'Travel experiences, tips, and stories from Hpa-An'}
      </p>
      {posts.length === 0 ? (
        <p className="text-center py-12 text-text-soft">{language === 'my' ? 'ပို့စ်များမရှိသေးပါ။' : 'No posts yet.'}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group block bg-white dark:bg-neutral-dark rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img src={getOptimizedImage(post.image, 400) || '/placeholder.jpg'} alt={getLocal(post.title, post.title_my)} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <p className="text-xs text-text-soft mb-1">{new Date(post.created_at).toLocaleDateString()}{post.author ? ` · ${post.author}` : ''}</p>
                <h3 className="text-lg font-serif font-semibold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {getLocal(post.title, post.title_my)}
                </h3>
                <p className="text-sm text-text-soft line-clamp-2">{getLocal(post.excerpt, post.excerpt_my)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
