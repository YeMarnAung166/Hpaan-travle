import { useState } from 'react';
import { getOptimizedImage } from '../utils/imageHelpers';

export default function ImageGallery({ images, alt = 'Gallery image' }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const next = () => setLightboxIndex((prev) => (prev + 1) % images.length);
  const prev = () => setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);

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
                className="absolute left-4 text-white/80 hover:text-white p-2"
                aria-label="Previous image"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 text-white/80 hover:text-white p-2"
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
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            loading="lazy"
            decoding="async"
          />

          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
