import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import BottomSheet from './BottomSheet';
import AiChatView from './AiChatView';

export default function AiAssistantFAB() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isChatPage = location.pathname === '/chat';

  if (isAdmin || isChatPage) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 z-50 w-12 h-12 rounded-full text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--color-aurora-1), var(--color-aurora-2), var(--color-aurora-3))' }}
        aria-label="Open AI Travel Assistant"
      >
        <MessageCircle size={22} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="AI Travel Assistant">
        <div className="h-[65vh] md:h-[70vh]">
          <AiChatView onClose={() => setOpen(false)} />
        </div>
      </BottomSheet>
    </>
  );
}
