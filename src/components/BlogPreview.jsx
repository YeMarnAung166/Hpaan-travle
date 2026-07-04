import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { fadeInUp, fadeIn } from '../utils/animations';
import { getOptimizedImage } from '../utils/imageHelpers';

export default function BlogPreview() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [ref, inView] = useScrollReveal();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, title_my, excerpt, excerpt_my, slug, image, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) setPosts(data);
    };
    fetch();
  }, []);

  if (posts.length === 0) return null;

  const getLocal = (en, my) => language === 'my' && my ? my : en;

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeIn}
      className="py-16 bg-neutral-light/50"
    >
      <div className="container mx-auto px-4">
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text mb-3">
            {language === 'my' ? 'ဘလော့ဂ်' : 'Latest from Our Blog'}
          </h2>
          <p className="text-text-soft max-w-xl mx-auto">
            {language === 'my' ? 'ခရီးသွားအတွေ့အကြုံများနှင့် အကြံပြုချက်များ' : 'Stories, tips, and insights from Hpa-An'}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {posts.map((post) => (
            <motion.div key={post.id} variants={fadeInUp}>
              <Link to={`/blog/${post.slug}`} className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative h-44 overflow-hidden">
                  <img src={getOptimizedImage(post.image, 400) || '/placeholder.jpg'} alt={getLocal(post.title, post.title_my)} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-text-soft mb-1">{new Date(post.created_at).toLocaleDateString()}</p>
                  <h3 className="text-base font-serif font-semibold text-text mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {getLocal(post.title, post.title_my)}
                  </h3>
                  <p className="text-sm text-text-soft line-clamp-2">{getLocal(post.excerpt, post.excerpt_my)}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeInUp} className="text-center mt-8">
          <Link to="/blog" className="text-primary hover:underline font-medium">
            {language === 'my' ? 'အားလုံးကြည့်ရန် →' : 'View All Posts →'}
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
