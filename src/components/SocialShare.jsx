import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function SocialShare({ title, url, description, image }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');
  const encodedImage = encodeURIComponent(image || '');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle} - ${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    copy: '#'
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareButtons = [
    { key: 'facebook', label: 'Facebook', icon: '📘', color: 'bg-blue-600 hover:bg-blue-700', url: shareLinks.facebook },
    { key: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'bg-green-500 hover:bg-primary', url: shareLinks.whatsapp },
    { key: 'twitter', label: 'Twitter', icon: '🐦', color: 'bg-sky-500 hover:bg-sky-600', url: shareLinks.twitter },
    { key: 'telegram', label: 'Telegram', icon: '✈️', color: 'bg-blue-400 hover:bg-blue-500', url: shareLinks.telegram },
    { key: 'copy', label: copied ? (t('social.copied') || 'Copied!') : (t('social.copy_link') || 'Copy Link'), icon: '🔗', color: 'bg-gray-500 hover:bg-gray-600', url: '#', onClick: handleCopyLink },
  ];

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 font-medium">
          {t('social.share') || 'Share:'}
        </span>
        {shareButtons.map((btn) => (
          <a
            key={btn.key}
            href={btn.url}
            target={btn.key !== 'copy' ? '_blank' : undefined}
            rel={btn.key !== 'copy' ? 'noopener noreferrer' : undefined}
            onClick={btn.onClick}
            className={`${btn.color} text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors`}
          >
            <span>{btn.icon}</span>
            <span className="hidden sm:inline">{btn.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}