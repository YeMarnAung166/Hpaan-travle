import { useState, useRef, useEffect } from 'react';

export default function ProgressiveImage({ src, alt, className, wrapperClassName, ...props }) {
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    setLoaded(false);
    setImgSrc(null);
    if (!src) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImgSrc(src);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) observerRef.current.observe(imgRef.current);
    return () => observerRef.current?.disconnect();
  }, [src]);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${wrapperClassName || ''}`} style={wrapperClassName ? undefined : { width: '100%', height: '100%' }}>
      <div
        className={`absolute inset-0 bg-neutral-mid dark:bg-neutral-dark transition-opacity duration-500 ${loaded ? 'opacity-0' : 'opacity-100'}`}
      />
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`${className || ''} ${loaded ? 'img-reveal' : 'opacity-0'}`}
          {...props}
        />
      )}
    </div>
  );
}
