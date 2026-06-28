import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { Helmet } from 'react-helmet-async';

const FALLBACK = {
  en: {
    title: 'Travel Tips for Hpa‑An',
    subtitle: 'Everything you need to know before you go',
    sections: [
      { title: 'Best Time to Visit', content: 'The best time to visit Hpa‑An is from November to February when the weather is cool and dry (20–30°C). March to May is hot (up to 40°C), while June to October is the rainy season – still beautiful but expect muddy trails and fewer tourists.' },
      { title: 'What to Pack', content: 'Light, breathable clothing (cotton, linen)\nComfortable walking/hiking shoes\nRain jacket (if visiting in monsoon)\nSunscreen, hat, sunglasses\nMosquito repellent\nPower bank (outages can happen)\nModest clothes for pagodas (shoulders and knees covered)' },
      { title: 'Local Customs & Etiquette', content: 'Remove shoes before entering pagodas and homes\nDress modestly when visiting religious sites\nGreet with a slight bow and "Mingalabar" (hello)\nUse your right hand to give or receive something\nDo not touch anyone\'s head\nAsk permission before taking photos of locals' },
      { title: 'Getting Around', content: 'Tuk-tuks are the easiest way to explore – negotiate price first (approx. 20,000–30,000 MMK per day)\nMotorbike rental available (requires IDP)\nBicycle is great for nearby caves and villages\nPrivate car with driver can be arranged through your guesthouse' },
    ]
  },
  my: {
    title: 'ဘားအံသို့ ခရီးသွားရန် အကြံပြုချက်များ',
    subtitle: 'မသွားမီ သိထားသင့်သည်များ',
    sections: [
      { title: 'လည်လည်ရန် အကောင်းဆုံးရာသီ', content: 'ဘားအံသို့ နိုဝင်ဘာမှ ဖေဖော်ဝါရီ အတွင်း သွားရောက်ခြင်းအကောင်းဆုံးဖြစ်သည်။ ရာသီဥတုအေးမြခြောက်သွေ့သည် (၂၀–၃၀ ဒီဂရီစင်တီဂရိတ်)။ မတ်လမှ မေလအထိပူပြင်းပြီး ဇွန်လမှ အောက်တိုဘာလအထိ မိုးရာသီဖြစ်သည်။' },
      { title: 'ထုပ်ပိုးသင့်သည်များ', content: 'ပေါ့ပါး၊ လေဝင်လေထွက်ကောင်းသော အဝတ်အစား\nသက်တောင့်သက်သာရှိသော လမ်းလျှောက်/တောင်တက်ဖိနပ်\nမိုးရာသီသွားပါက မိုးကာအင်္ကျီ\nနေကာခရင်မ်၊ ဦးထုပ်၊ နေကာမျက်မှန်\nခြင်ဆေးပစ္စည်း\nပါဝါဘဏ်\nဘုရားစေတီများအတွက် ကျိုးနွံသောအဝတ်အစား' },
    ]
  }
};

export default function TravelTipsPage() {
  const { language } = useLanguage();
  const [data, setData] = useState(null);

  useEffect(() => {
    supabase
      .from('content_pages')
      .select('*')
      .eq('slug', 'travel-tips')
      .single()
      .then(({ data: page }) => {
        if (page) {
          const lang = language === 'my' ? 'my' : 'en';
          const raw = lang === 'my' ? page.content_my : page.content;
          try {
            const parsed = JSON.parse(raw);
            setData({ title: page[`title_${lang}`] || page.title, subtitle: parsed.subtitle || '', sections: parsed.sections || [] });
          } catch {
            setData({ title: page[`title_${lang}`] || page.title, subtitle: '', sections: [{ title: '', content: raw || '' }] });
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
        <title>Travel Tips | Hpa-An Travel</title>
        <meta name="description" content="Essential travel tips for visiting Hpa-An, Myanmar - what to pack, best time to visit, local customs, and more." />
        <meta property="og:title" content="Travel Tips" />
        <meta property="og:description" content="Essential travel tips for visiting Hpa-An, Myanmar - what to pack, best time to visit, local customs, and more." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="relative h-64 bg-gradient-to-r from-primary-dark to-primary flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">{c.title}</h1>
          {c.subtitle && <p className="text-lg opacity-90">{c.subtitle}</p>}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid gap-8">
          {c.sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
              <h2 className="text-2xl font-serif font-semibold text-text mb-3">{section.title}</h2>
              <div className="text-text-soft leading-relaxed whitespace-pre-line">{section.content}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-text-soft italic mb-4">Have more questions? Feel free to ask locals – they're happy to help!</p>
        </div>
      </div>
    </div>
  );
}
