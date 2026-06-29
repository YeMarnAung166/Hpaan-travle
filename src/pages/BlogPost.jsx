import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { SkeletonDetail } from '../components/ui/Skeleton';
import SocialShare from '../components/SocialShare';
import { Helmet } from 'react-helmet-async';
import { getOptimizedImage } from '../utils/imageHelpers';

export default function BlogPost() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (!error) setPost(data);
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) return <SkeletonDetail />;
  if (!post) return (
    <div className="container-custom text-center py-16">
      <h1 className="text-2xl font-bold text-text mb-4">{language === 'my' ? 'ပို့စ်မတွေ့ပါ' : 'Post Not Found'}</h1>
      <Link to="/blog" className="text-primary hover:underline">← Back to Blog</Link>
    </div>
  );

  const title = language === 'my' && post.title_my ? post.title_my : post.title;
  const content = language === 'my' && post.content_my ? post.content_my : post.content;

  return (
    <div className="container-custom max-w-3xl">
      <Helmet>
        <title>{title} | Hpa-An Travel</title>
        <meta name="description" content={content.substring(0, 160)} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={content.substring(0, 160)} />
        {post.image && <meta property="og:image" content={post.image} />}
        <meta property="og:type" content="website" />
      </Helmet>
      <Link to="/blog" className="inline-flex items-center text-text-soft hover:text-primary text-sm mb-6 transition">
        ← {language === 'my' ? 'ဘလော့ဂ်သို့ ပြန်သွားရန်' : 'Back to Blog'}
      </Link>
      {post.image && (
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
          <img src={getOptimizedImage(post.image, 800)} alt={title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-text mb-3">{title}</h1>
      <div className="flex items-center gap-3 text-sm text-text-soft mb-6">
        {post.author && <span>By {post.author}</span>}
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      <div className="prose prose-lg max-w-none mb-8">
        {content.split('\n').map((p, i) => <p key={i} className="text-text-soft leading-relaxed mb-4">{p}</p>)}
      </div>
      <div className="border-t border-border pt-6">
        <SocialShare title={title} url={window.location.href} />
      </div>
    </div>
  );
}
