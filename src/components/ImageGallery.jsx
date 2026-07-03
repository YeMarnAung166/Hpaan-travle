import { useState, useEffect, useRef } from 'react';
import { getOptimizedImage } from '../utils/imageHelpers';

export default function ImageGallery({ images, alt = 'Gallery image' }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const touchStart = useRef({ x: 0, y: 0 });

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e) => { if (e.key === 'Escape') closeLightbox(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [lightboxIndex]);

  if (!images || images.length === 0) return null;

  const next = () => setLightboxIndex((prev) => (prev + 1) % images.length);
  const prev = () => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    if (dx > 60) prev();
    else if (dx < -60) next();
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((src, idx) => (
          <button
            key={idx}
            onClick={() => openLightbox(idx)}
            className="overflow-hidden rounded-lg group"
          >
            <img
              src={getOptimizedImage(src, 600)}
              alt={`${alt} ${idx + 1}`}
              className="w-full h-32 sm:h-40 object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 text-white/80 hover:text-white p-2 hidden sm:block"
                aria-label="Previous image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 text-white/80 hover:text-white p-2 hidden sm:block"
                aria-label="Next image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <img
            src={getOptimizedImage(images[lightboxIndex], 600)}
            alt={`${alt} ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg select-none"
            onClick={(e) => e.stopPropagation()}
            loading="lazy"
            decoding="async"
            draggable={false}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm bg-black/50 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
