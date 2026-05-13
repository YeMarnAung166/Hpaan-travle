import { useLanguage } from '../context/LanguageContext';

export default function TravelTipsPage() {
  const { language } = useLanguage();

  const tips = {
    en: {
      title: 'Travel Tips for Hpa‑An',
      subtitle: 'Everything you need to know before you go',
      sections: [
        {
          title: '🌤️ Best Time to Visit',
          content: 'The best time to visit Hpa‑An is from **November to February** when the weather is cool and dry (20–30°C). March to May is hot (up to 40°C), while June to October is the rainy season – still beautiful but expect muddy trails and fewer tourists.'
        },
        {
          title: '🎒 What to Pack',
          content: '• Light, breathable clothing (cotton, linen)\n• Comfortable walking/hiking shoes\n• Rain jacket (if visiting in monsoon)\n• Sunscreen, hat, sunglasses\n• Mosquito repellent\n• Power bank (outages can happen)\n• Modest clothes for pagodas (shoulders and knees covered)'
        },
        {
          title: '🙏 Local Customs & Etiquette',
          content: '• Remove shoes before entering pagodas and homes\n• Dress modestly when visiting religious sites\n• Greet with a slight bow and “Mingalabar” (hello)\n• Use your right hand to give or receive something\n• Do not touch anyone’s head\n• Ask permission before taking photos of locals'
        },
        {
          title: '🚗 Getting Around',
          content: '• **Tuk‑tuks** are the easiest way to explore – negotiate price first (approx. 20,000–30,000 MMK per day)\n• **Motorbike rental** available (requires IDP)\n• **Bicycle** is great for nearby caves and villages\n• **Private car** with driver can be arranged through your guesthouse'
        },
        {
          title: '💵 Money & Connectivity',
          content: '• **Currency**: Myanmar Kyat (MMK). Cash is king – bring crisp, new USD notes for exchange.\n• **ATMs** available in town but may have low limits.\n• **SIM cards**: MPT, Telenor (now Atom), Ooredoo – buy at the airport or in town. Data is affordable.\n• **WiFi** is available in most hotels and cafes but can be slow.'
        },
        {
          title: '🍜 Must‑Try Food',
          content: '• **Mohinga** (rice noodle fish soup)\n• **Shan noodles**\n• **Tea leaf salad** (Lahpet thoke)\n• **Grilled river fish**\n• **Sticky rice desserts**\n• **Local coffee and tea**'
        },
        {
          title: '📌 Safety & Respect',
          content: 'Hpa‑An is very safe for travelers. However, always respect local culture, avoid discussing politics, and ask before taking photos of people. The Karen people are warm and welcoming – a smile goes a long way.'
        }
      ]
    },
    my: {
      title: 'ဘားအံသို့ ခရီးသွားရန် အကြံပြုချက်များ',
      subtitle: 'မသွားမီ သိထားသင့်သည်များ',
      sections: [
        {
          title: '🌤️ လည်လည်ရန် အကောင်းဆုံးရာသီ',
          content: 'ဘားအံသို့ **နိုဝင်ဘာမှ ဖေဖော်ဝါရီ** အတွင်း သွားရောက်ခြင်းအကောင်းဆုံးဖြစ်သည်။ ရာသီဥတုအေးမြခြောက်သွေ့သည် (၂၀–၃၀ ဒီဂရီစင်တီဂရိတ်)။ မတ်လမှ မေလအထိပူပြင်းပြီး ဇွန်လမှ အောက်တိုဘာလအထိ မိုးရာသီဖြစ်သည် – လမ်းများ ရွှံ့နွံဖြစ်နိုင်သော်လည်း လည်လည်နိုင်သည်။'
        },
        {
          title: '🎒 ထုပ်ပိုးသင့်သည်များ',
          content: '• ပေါ့ပါး၊ လေ၀င်လေထွက်ကောင်းသော အဝတ်အစား\n• သက်တောင့်သက်သာရှိသော လမ်းလျှောက်/တောင်တက်ဖိနပ်\n• မိုးရာသီသွားပါက မိုးကာအင်္ကျီ\n• နေကာခရင်မ်၊ ဦးထုပ်၊ နေကာမျက်မှန်\n• ခြင်ဆေးပစ္စည်း\n• ပါဝါဘဏ် (မီးပျက်တတ်သည်)\n• ဘုရားစေတီများအတွက် ကျိုးနွံသောအဝတ်အစား (ပခုံးနှင့် ဒူးဆစ်ကို အုပ်ရန်)'
        },
        {
          title: '🙏 ဒေသခံဓလေ့များ',
          content: '• ဘုရားစေတီနှင့် အိမ်များသို့ မဝင်မီ ဖိနပ်ချွတ်ပါ\n• ဘာသာရေးအဆောက်အအုံများတွင် ကျိုးနွံစွာဝတ်ဆင်ပါ\n• “မင်္ဂလာပါ” ဖြင့် အနည်းငယ်ဦးညွှတ်နှုတ်ဆက်ပါ\n• တစ်စုံတစ်ရာပေးရန်/လက်ခံရန် ညာလက်ကိုသုံးပါ\n• မည်သူ့ဦးခေါင်းကိုမျှ မထိပါနှင့်\n• ဒေသခံများအား ဓာတ်ပုံမရိုက်မီ ခွင့်တောင်းပါ'
        },
        {
          title: '🚗 သွားလာရေး',
          content: '• **ထော်လော်ချီ** – အလွယ်ကူဆုံးဖြစ်ပြီး တစ်ရက်လျှင် ၂၀,၀၀၀–၃၀,၀၀၀ ကျပ်ခန့် ညှိနှိုင်းပါ။\n• **မော်တော်ဆိုင်ကယ်ငှားရမ်း** – နိုင်ငံတကာမောင်းနှင်ခွင့်လိုင်စင် လိုအပ်။\n• **စက်ဘီး** – အနီးရှိလိုဏ်ဂူနှင့် ကျေးရွာများအတွက် ကောင်းမွန်။\n• **ကားအငှားဖြင့် ယာဉ်မောင်း** – တည်းခိုခန်းများမှ စီစဉ်ပေးနိုင်။'
        },
        {
          title: '💵 ငွေကြေးနှင့် ဆက်သွယ်ရေး',
          content: '• **ငွေကြေး** – မြန်မာကျပ် (MMK)။ ငွေသားအသုံးများသည်။ အသစ်၊ သန့်ရှင်းသော ဒေါ်လာငွေစက္ကူများ ယူလာပါ။\n• **အေတီအမ်** – မြို့ထဲတွင်ရှိသော်လည်း ငွေထုတ်ယူမှုကန့်သတ်ချက်နည်းနိုင်သည်။\n• **ဆင်းကဒ်** – လေဆိပ် သို့မဟုတ် မြို့ထဲတွင် ဝယ်ယူနိုင်။\n• **ဝိုင်ဖိုင်** – ဟိုတယ်နှင့် ကဖေးအများစုတွင်ရှိသော်လည်း နှေးနိုင်သည်။'
        },
        {
          title: '🍜 စမ်းသုံးကြည့်သင့်သော အစားအစာများ',
          content: '• မုန့်ဟင်းခါး\n• ရှမ်းခေါက်ဆွဲ\n• လက်ဖက်သုပ်\n• မြစ်ငါးကင်\n• ကောက်ညှင်းအချိုပွဲများ\n• ဒေသကော်ဖီနှင့်လက်ဖက်ရည်'
        },
        {
          title: '📌 လုံခြုံရေးနှင့် ရိုသေလေးစားမှု',
          content: 'ဘားအံသည် ခရီးသွားများအတွက် အလွန်လုံခြုံသည်။ ဒေသယဉ်ကျေးမှုကို ရိုသေပါ၊ နိုင်ငံရေးအကြောင်း ဆွေးနွေးခြင်းရှောင်ပါ၊ လူများအား ဓာတ်ပုံမရိုက်မီ ခွင့်တောင်းပါ။ ကရင်လူမျိုးများသည် ဖော်ရွေပြီး ပြုံးရွှင်ခြင်းသည် အကောင်းဆုံးဖြစ်သည်။'
        }
      ]
    }
  };

  const data = language === 'my' ? tips.my : tips.en;

  return (
    <div className="bg-neutral-light min-h-screen">
      {/* Hero */}
      <div className="relative h-64 bg-gradient-to-r from-primary-dark to-primary flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">{data.title}</h1>
          <p className="text-lg opacity-90">{data.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid gap-8">
          {data.sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
              <h2 className="text-2xl font-serif font-semibold text-text mb-3">{section.title}</h2>
              <div className="text-text-soft leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-12 text-center">
          <p className="text-text-soft italic mb-4">Have more questions? Feel free to ask locals – they're happy to help!</p>
        </div>
      </div>
    </div>
  );
}