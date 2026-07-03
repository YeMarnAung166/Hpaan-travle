import { useEffect, useRef } from 'react';

const SWIPE_THRESHOLD = 80;
const EDGE_ZONE = 30;

export default function useSwipeBack(onSwipeBack, enabled = true) {
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;

      if (
        dx > SWIPE_THRESHOLD &&
        Math.abs(dy) < dx * 0.5 &&
        touchStart.current.x < EDGE_ZONE
      ) {
        onSwipeBack?.();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onSwipeBack]);
}
