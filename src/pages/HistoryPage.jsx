import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const FALLBACK = {
  en: {
    title: 'The Story of Hpa‑An',
    subtitle: 'Land of Limestone Mountains and Ancient Legends',
    sections: [
      { title: 'Ancient Origins', text: 'Hpa‑An, the capital of Kayin State, has been inhabited for over a thousand years. According to legend, the name comes from "Hpa" (cliff) and "An" (to swallow) – referring to the mythical giant who swallowed a cliff.' },
      { title: 'Colonial Era', text: 'During British colonial rule, Hpa‑An grew as an administrative center. The British built a network of roads and railways, connecting the town to Yangon and Mawlamyine.' },
      { title: 'Spiritual Heart', text: 'The region is dotted with hundreds of Buddhist caves, pagodas, and meditation centers. Saddan Cave, with its hidden lake and reclining Buddha, is a testament to the deep spiritual significance of the landscape.' },
      { title: 'Modern Times', text: 'Today, Hpa‑An is a growing eco-tourism destination. Travelers come to hike Mount Zwegabin, explore the Thanlwin River, and experience Kayin culture.' }
    ],
    timeline: [
      { year: '11th century', event: 'First settlements by Mon and Kayin people' },
      { year: '1886', event: 'British annexation, Hpa‑An becomes district headquarters' },
      { year: '1948', event: 'Myanmar independence, Hpa‑An capital of Kayin State' }
    ]
  },
  my: {
    title: 'ဘားအံ၏ သမိုင်းဇာတ်ကြောင်း',
    subtitle: 'ထုံးကျောက်တောင်များနှင့် ရှေးဟောင်းဒဏ္ဍာရီများ',
    sections: [
      { title: 'ရှေးဟောင်းဇစ်မြစ်', text: 'ဘားအံမြို့သည် ကရင်ပြည်နယ်၏ မြို့တော်ဖြစ်ပြီး နှစ်ထောင်ကျော်သက်တမ်းရှိပြီ ဖြစ်သည်။' },
      { title: 'ကိုလိုနီခေတ်', text: 'ဗြိတိသျှကိုလိုနီခေတ်တွင် ဘားအံသည် အုပ်ချုပ်ရေးဗဟိုဌာနဖြစ်လာသည်။' },
      { title: 'ဝိညာဉ်ရေးဗဟို', text: 'ဤဒေသတွင် ဗုဒ္ဓဘာသာလိုဏ်ဂူများ၊ စေတီပုထိုးများနှင့် တရားထိုင်ရာစင်တာများ ရာနှင့်ချီရှိသည်။' },
    ]
  }
};

export default function HistoryPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);

  useEffect(() => {
    supabase
      .from('content_pages')
      .select('*')
      .eq('slug', 'history')
      .single()
      .then(({ data: page }) => {
        if (page) {
          const lang = language === 'my' ? 'my' : 'en';
          const raw = lang === 'my' ? page.content_my : page.content;
          try {
            const parsed = JSON.parse(raw);
            setData({
              title: page[`title_${lang}`] || page.title,
              subtitle: parsed.subtitle || '',
              sections: parsed.sections || [],
              timeline: parsed.timeline || []
            });
          } catch {
            setData({ title: page[`title_${lang}`] || page.title, subtitle: '', sections: [], timeline: [] });
          }
        } else {
          setData(null);
        }
      })
      .catch(() => setData(null));
  }, [language]);

  const c = data || FALLBACK[language === 'my' ? 'my' : 'en'];

  return (
    <div className="bg-neutral-light min-h-screen">
      <Helmet>
        <title>History of Hpa-An | Hpa-An Travel</title>
        <meta name="description" content="Learn about the rich history of Hpa-An, from ancient legends to modern times." />
        <meta property="og:title" content="History of Hpa-An" />
        <meta property="og:description" content="Learn about the rich history of Hpa-An, from ancient legends to modern times." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="relative h-[60vh] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://hqzodqvstvdemmqxphbv.supabase.co/storage/v1/object/public/hpaan-assets/static/history.jpg)' }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">{c.title}</h1>
          <p className="text-xl md:text-2xl italic max-w-2xl">{c.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {c.sections.map((section, idx) => (
          <div key={idx} className="mb-12 border-l-4 border-primary pl-6">
            <h2 className="text-2xl font-serif font-semibold text-primary mb-3">{section.title}</h2>
            <p className="text-text-soft leading-relaxed">{section.text}</p>
          </div>
        ))}

        {c.timeline && c.timeline.length > 0 && (
          <div className="my-16">
            <h2 className="text-3xl font-serif font-bold text-text mb-8 text-center">Key Moments in History</h2>
            <div className="relative border-l-2 border-primary pl-6 ml-4 space-y-8">
              {c.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-9 top-1 w-4 h-4 rounded-full bg-primary"></div>
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <span className="text-primary font-bold text-lg">{item.year}</span>
                    <p className="text-text-soft mt-1">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-16">
          <Link to="/">
            <Button variant="primary" size="lg">Start Your Journey</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
