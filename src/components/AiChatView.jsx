import { useRef, useEffect, useCallback } from 'react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import useLocalAIChat from '../hooks/useLocalAIChat';
import { Send, Bot, User, RefreshCw, Sparkles, MapPin, Sun, Calendar, Star, AlertTriangle } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What are the best caves to visit in Hpa-An?',
  'Recommend good restaurants near Saddan Cave',
  "What's the weather like today?",
  'Plan a 1-day itinerary for Hpa-An',
];

function ToolResultCard({ toolName, output }) {
  if (!output) return null;

  if (toolName === 'searchDestinations') {
    const items = Array.isArray(output) ? output : [output];
    if (items.length === 0) return <p className="text-sm text-text-soft italic px-4">No destinations found.</p>;
    return (
      <div className="space-y-2 px-4 pb-2">
        {items.map((d) => (
          <a
            key={d.id}
            href={`/destination/${d.id}`}
            className="flex gap-3 bg-neutral-light dark:bg-neutral-mid rounded-xl p-3 hover:bg-neutral-mid dark:hover:bg-neutral-dark transition group"
          >
            {d.image && (
              <img
                src={d.image}
                alt={d.name || d.name_my}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                loading="lazy"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-primary flex-shrink-0" />
                <p className="font-medium text-sm text-text truncate">{d.name || d.name_my}</p>
              </div>
              {(d.description || d.description_my) && (
                <p className="text-xs text-text-soft line-clamp-2 mt-0.5">{d.description || d.description_my}</p>
              )}
              {d.type && <span className="text-[10px] uppercase tracking-wider text-primary/70 mt-1 block">{d.type}</span>}
              {d.duration && <span className="text-[10px] text-text-soft block">~{d.duration}</span>}
            </div>
          </a>
        ))}
      </div>
    );
  }

  if (toolName === 'searchBusinesses') {
    const items = Array.isArray(output) ? output : [output];
    if (items.length === 0) return <p className="text-sm text-text-soft italic px-4">No businesses found.</p>;
    return (
      <div className="space-y-2 px-4 pb-2">
        {items.map((b) => (
          <a
            key={b.id}
            href={`/business/${b.id}`}
            className="flex gap-3 bg-neutral-light dark:bg-neutral-mid rounded-xl p-3 hover:bg-neutral-mid dark:hover:bg-neutral-dark transition group"
          >
            {b.image && (
              <img
                src={b.image}
                alt={b.name || b.name_my}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                loading="lazy"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-text truncate">{b.name || b.name_my}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {b.category && <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">{b.category}</span>}
                {b.avg_rating > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-text-soft">
                    <Star size={10} className="text-amber-500 fill-amber-500" />
                    {b.avg_rating} ({b.review_count})
                  </span>
                )}
              </div>
              {(b.description || b.description_my) && (
                <p className="text-xs text-text-soft line-clamp-2 mt-0.5">{b.description || b.description_my}</p>
              )}
              {b.phone && <p className="text-xs text-text-soft mt-0.5">📞 {b.phone}</p>}
            </div>
          </a>
        ))}
      </div>
    );
  }

  if (toolName === 'getCurrentWeather') {
    const w = output;
    if (w.error) return <p className="text-sm text-text-soft italic px-4">{w.error}</p>;
    return (
      <div className="px-4 pb-2">
        <div className="bg-neutral-light dark:bg-neutral-mid rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun size={20} className="text-amber-500" />
              <span className="text-2xl font-bold text-text">{w.current.temp}°C</span>
            </div>
            <span className="text-sm text-text-soft capitalize">{w.current.description}</span>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-text-soft">
            <span>Feels like {w.current.feels_like}°C</span>
            <span>Humidity: {w.current.humidity}%</span>
            <span>Wind: {w.current.wind_speed} km/h</span>
          </div>
          {w.forecast?.length > 0 && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-mid">
              {w.forecast.map((d, i) => (
                <div key={i} className="flex-1 text-center text-xs">
                  <div className="font-medium text-text">{new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                  <div className="text-text-soft">{d.temp}°C</div>
                  <div className="text-text-soft capitalize truncate">{d.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (toolName === 'getUpcomingEvents') {
    const items = Array.isArray(output) ? output : [output];
    if (items.length === 0) return <p className="text-sm text-text-soft italic px-4">No upcoming events found.</p>;
    return (
      <div className="space-y-2 px-4 pb-2">
        {items.map((e) => (
          <div key={e.id} className="flex gap-3 bg-neutral-light dark:bg-neutral-mid rounded-xl p-3">
            {e.image && (
              <img
                src={e.image}
                alt={e.name || e.name_my}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                loading="lazy"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-primary flex-shrink-0" />
                <p className="font-medium text-sm text-text truncate">{e.name || e.name_my}</p>
              </div>
              <p className="text-xs text-text-soft">{new Date(e.date).toLocaleDateString()}</p>
              {e.location && <p className="text-xs text-text-soft">{e.location}</p>}
              {(e.description || e.description_my) && (
                <p className="text-xs text-text-soft line-clamp-2 mt-0.5">{e.description || e.description_my}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function MessagePart({ part }) {
  if (part.type === 'text') {
    return <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{part.text}</p>;
  }

  if (part.type.startsWith('tool-')) {
    const toolName = part.type.slice('tool-'.length);
    if (part.state !== 'output-available') return null;
    return (
      <div className="my-1">
        <ToolResultCard toolName={toolName} output={part.output} />
      </div>
    );
  }

  return null;
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 px-4 py-2 ${isUser ? '' : 'bg-neutral-light/50 dark:bg-neutral-mid/20'}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${isUser ? 'bg-primary/10 text-primary' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        {message.parts.map((part, i) => (
          <MessagePart key={i} part={part} />
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 px-4 py-2 bg-neutral-light/50 dark:bg-neutral-mid/20">
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
        <Bot size={14} />
      </div>
      <div className="flex items-center gap-1 py-1">
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function AiChatView({ showSuggested = true }) {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { messages, sendMessage, status, error, clearChat, stop } = useLocalAIChat();

  const isLoading = status === 'generating';
  const isReady = status === 'ready';
  const showSuggestions = showSuggested && messages.length === 0 && isReady;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  }, [input, isLoading, sendMessage]);

  const handleSuggestedClick = useCallback((question) => {
    sendMessage(question);
  }, [sendMessage]);

  const handleClear = useCallback(() => {
    clearChat();
  }, [clearChat]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-3 space-y-1">

        {showSuggestions && (
          <div className="px-4 py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={22} className="text-white" />
            </div>
            <h3 className="text-base font-semibold text-text mb-1">
              {t('ai_assistant.title') || 'AI Travel Assistant'}
            </h3>
            <p className="text-sm text-text-soft mb-4">
              {t('ai_assistant.greeting') || 'Ask me anything about Hpa-An!'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedClick(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-neutral-light dark:bg-neutral-mid text-text-soft hover:text-text hover:bg-neutral-mid dark:hover:bg-neutral-dark transition border border-neutral-mid"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}

        {isLoading && messages.length > 0 && (
          <TypingIndicator />
        )}

        {error && (
          <div className="px-4 py-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-neutral-mid p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('ai_assistant.placeholder') || 'Ask about Hpa-An...'}
            disabled={isLoading}
            className="flex-1 bg-neutral-light dark:bg-neutral-mid rounded-xl px-4 py-2.5 text-sm text-text placeholder-text-soft outline-none focus:ring-2 focus:ring-primary/30 transition disabled:opacity-50"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition"
              title="Stop"
            >
              <div className="w-3.5 h-3.5 bg-current rounded-sm" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || !isReady}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-30"
            >
              <Send size={16} />
            </button>
          )}
        </form>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="mt-2 text-[10px] text-text-soft hover:text-text transition flex items-center gap-1 mx-auto"
          >
            <RefreshCw size={10} />
            {t('ai_assistant.clear_chat') || 'Clear chat'}
          </button>
        )}
      </div>
    </div>
  );
}
