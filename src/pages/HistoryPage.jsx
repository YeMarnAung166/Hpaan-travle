import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
  const { t, language } = useLanguage();

  // Content sections (English and Burmese)
  const content = {
    en: {
      title: 'The Story of Hpa‑An',
      subtitle: 'Land of Limestone Mountains and Ancient Legends',
      heroCaption: 'Where nature meets spirituality',
      sections: [
        {
          title: 'Ancient Origins',
          text: 'Hpa‑An, the capital of Kayin State, has been inhabited for over a thousand years. According to legend, the name comes from “Hpa” (cliff) and “An” (to swallow) – referring to the mythical giant who swallowed a cliff. The area was part of the Thaton Kingdom and later the Hanthawaddy Kingdom, serving as a strategic trade route between inland Burma and the coast.'
        },
        {
          title: 'Colonial Era',
          text: 'During British colonial rule, Hpa‑An grew as an administrative center. The British built a network of roads and railways, connecting the town to Yangon and Mawlamyine. Many colonial-era buildings still stand, blending with traditional Kayin architecture.'
        },
        {
          title: 'Spiritual Heart',
          text: 'The region is dotted with hundreds of Buddhist caves, pagodas, and meditation centers. Saddan Cave, with its hidden lake and reclining Buddha, is a testament to the deep spiritual significance of the landscape. Local legends tell of hermits meditating in these caves for centuries.'
        },
        {
          title: 'Modern Times',
          text: 'Today, Hpa‑An is a growing eco‑tourism destination. Travelers come to hike Mount Zwegabin, explore the Thanlwin River, and experience Kayin culture – traditional dance, longyi weaving, and bamboo rafting. The city maintains a peaceful, small‑town charm while welcoming visitors from around the world.'
        }
      ],
      timeline: [
        { year: '11th century', event: 'First settlements by Mon and Kayin people' },
        { year: '1755', event: 'Alaungpaya’s unification campaign passes through' },
        { year: '1886', event: 'British annexation, Hpa‑An becomes district headquarters' },
        { year: '1948', event: 'Myanmar independence, Hpa‑An capital of Kayin State' },
        { year: '2010s', event: 'Tourism development begins' }
      ],
      cta: 'Explore the wonders of Hpa‑An'
    },
    my: {
      title: 'ဘားအံ၏ သမိုင်းဇာတ်ကြောင်း',
      subtitle: 'ထုံးကျောက်တောင်များနှင့် ရှေးဟောင်းဒဏ္ဍာရီများ',
      heroCaption: 'သဘာဝနှင့် ဝိညာဉ်ရေးရာ ဆုံဆည်းရာ',
      sections: [
        {
          title: 'ရှေးဟောင်းဇစ်မြစ်',
          text: 'ဘားအံမြို့သည် ကရင်ပြည်နယ်၏ မြို့တော်ဖြစ်ပြီး နှစ်ထောင်ကျော်သက်တမ်းရှိပြီ ဖြစ်သည်။ ဒဏ္ဍာရီအရ “ဘား” (ကျောက်ဆောင်) နှင့် “အံ” (မျိုချခြင်း) မှ ဆင်းသက်လာသည် – ဧရာမဘီလူးတစ်ကောင်က ကျောက်ဆောင်ကို မျိုချခဲ့သည်ဟု ဆိုသည်။ ဤဒေသသည် သထုံခေတ်နှင့် ဟံသာဝတီခေတ်တို့တွင် ကုန်းတွင်းပိုင်းနှင့် ကမ်းရိုးတန်းအကြား ကုန်သွယ်ရေးလမ်းကြောင်းဖြစ်သည်။'
        },
        {
          title: 'ကိုလိုနီခေတ်',
          text: 'ဗြိတိသျှကိုလိုနီခေတ်တွင် ဘားအံသည် အုပ်ချုပ်ရေးဗဟိုဌာနဖြစ်လာသည်။ ဗြိတိသျှတို့သည် ရန်ကုန်နှင့် မော်လမြိုင်သို့ လမ်းနှင့် မီးရထားလမ်းများ ဖောက်လုပ်ခဲ့သည်။ ကိုလိုနီခေတ်အဆောက်အအုံများစွာ ယနေ့တိုင် တည်ရှိနေပြီး ရိုးရာကရင်ဗိသုကာနှင့် ရောနှောလျက်ရှိသည်။'
        },
        {
          title: 'ဝိညာဉ်ရေးဗဟို',
          text: 'ဤဒေသတွင် ဗုဒ္ဓဘာသာလိုဏ်ဂူများ၊ စေတီပုထိုးများနှင့် တရားထိုင်ရာစင်တာများ ရာနှင့်ချီရှိသည်။ ဆဒ္ဒန်လိုဏ်ဂူသည် ကွယ်ဝှက်အိုင်နှင့် စက်တော်ရာဘုရားကြီးအတွက် ထင်ရှားသည်။ ဒေသခံဒဏ္ဍာရီများအရ ရသေ့များသည် ဤလိုဏ်ဂူများတွင် ရာစုနှစ်များစွာ တရားအားထုတ်ခဲ့ကြသည်။'
        },
        {
          title: 'မျက်မှောက်ခေတ်',
          text: 'ယနေ့ခေတ်တွင် ဘားအံသည် ဂေဟစနစ်ခရီးသွားလုပ်ငန်း ဖွံ့ဖြိုးတိုးတက်လာသောနေရာတစ်ခုဖြစ်သည်။ ခရီးသွားများသည် ဇွဲကပင်တောင်တက်ခြင်း၊ သန်လျင်မြစ်စူးစမ်းခြင်းနှင့် ကရင်ယဉ်ကျေးမှု (အကများ၊ ထဘီရက်လုပ်ခြင်း၊ ဝါးဖောင်စီးခြင်း) တို့ကို ခံစားနိုင်သည်။ မြို့တော်သည် ကမ္ဘာလှည့်ခရီးသည်များကို ကြိုဆိုနေချိန်တွင် ငြိမ်သက်အေးချမ်းသော မြို့ငယ်လေးအဖြစ်တည်ရှိဆဲဖြစ်သည်။'
        }
      ],
      timeline: [
        { year: '၁၁ ရာစု', event: 'မွန်နှင့် ကရင်တို့၏ ပထမဆုံးအခြေချနေထိုင်မှု' },
        { year: '၁၇၅၅', event: 'အလောင်းဘုရား၏ ပေါင်းစည်းရေးစစ်ဆင်မှု' },
        { year: '၁၈၈၆', event: 'ဗြိတိသျှသိမ်းပိုက်မှု၊ ဘားအံခရိုင်ရုံးစိုက်ရာဖြစ်လာ' },
        { year: '၁၉၄၈', event: 'မြန်မာလွတ်လပ်ရေး၊ ကရင်ပြည်နယ်၏မြို့တော်ဖြစ်လာ' },
        { year: '၂၀၁၀', event: 'ခရီးသွားလုပ်ငန်း စတင်ဖွံ့ဖြိုးလာ' }
      ],
      cta: 'ဘားအံ၏ အံ့ဖွယ်များကို စူးစမ်းလိုက်ပါ'
    }
  };

  const c = language === 'my' ? content.my : content.en;

  return (
    <div className="bg-neutral-light min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://hqzodqvstvdemmqxphbv.supabase.co/storage/v1/object/public/Hpaan-Travel/history/photo_12_2026-05-02_21-55-55.jpg)' }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">{c.title}</h1>
          <p className="text-xl md:text-2xl italic max-w-2xl">{c.subtitle}</p>
          <p className="text-sm uppercase tracking-wider mt-6 opacity-80">{c.heroCaption}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Introduction */}
        <div className="prose prose-lg max-w-none mb-12">
          <p className="lead text-text-soft text-xl">Step into the mist‑shrouded mountains and ancient caves of Hpa‑An, where nature and spirituality intertwine.</p>
        </div>

        {/* Narrative sections */}
        {c.sections.map((section, idx) => (
          <div key={idx} className="mb-12 border-l-4 border-primary pl-6">
            <h2 className="text-2xl font-serif font-semibold text-primary mb-3">{section.title}</h2>
            <p className="text-text-soft leading-relaxed">{section.text}</p>
          </div>
        ))}

        {/* Timeline */}
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

        {/* Call to action */}
        <div className="text-center mt-16">
          <p className="text-text-soft italic mb-6">{c.cta}</p>
          <Link to="/">
            <Button variant="primary" size="lg">Start Your Journey</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}