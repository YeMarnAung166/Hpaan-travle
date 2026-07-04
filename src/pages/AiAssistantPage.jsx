import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import AiChatView from '../components/AiChatView';

export default function AiAssistantPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>AI Travel Assistant | Hpa-An Travel</title>
        <meta name="description" content="Ask the AI travel assistant about Hpa-An destinations, restaurants, weather, events, and more." />
        <meta property="og:title" content="AI Travel Assistant | Hpa-An Travel" />
      </Helmet>

      <div className="flex flex-col h-[calc(100vh-var(--header-h,96px)-72px)] md:h-[calc(100vh-var(--header-h,96px))]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-mid bg-white dark:bg-neutral-dark">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-neutral-light dark:hover:bg-neutral-mid transition text-text-soft hover:text-text"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <h1 className="font-semibold text-text text-lg">
            {t('ai_assistant.title') || 'AI Travel Assistant'}
          </h1>
        </div>

        <div className="flex-1 overflow-hidden">
          <AiChatView showSuggested={true} />
        </div>
      </div>
    </>
  );
}
