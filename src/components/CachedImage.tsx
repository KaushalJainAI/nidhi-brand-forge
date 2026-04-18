import { useState, useEffect } from 'react';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
}

const CachedImage: React.FC<CachedImageProps> = ({ src, fallbackSrc, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!src) return;

      try {
        // Check if CacheStorage is available in the browser
        if ('caches' in window) {
          const cache = await caches.open('image-cache-ngu');
          const cachedResponse = await cache.match(src);

          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            const objectURL = URL.createObjectURL(blob);
            if (isMounted) {
              setImgSrc(objectURL);
              setLoading(false);
            }
            return;
          }

          // Fetch the image
          const response = await fetch(src, { mode: 'cors' });
          if (response.ok) {
            // Put in cache
            await cache.put(src, response.clone());
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);
            if (isMounted) {
              setImgSrc(objectURL);
              setLoading(false);
            }
          } else {
            throw new Error('Image fetch failed');
          }
        } else {
          // Fallback if caches is not supported
          setImgSrc(src);
          setLoading(false);
        }
      } catch (error) {
        console.warn('Failed to load cached image:', error);
        if (isMounted) {
          setImgSrc(fallbackSrc || src);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      // We don't revoke objectURL here because it could be reused or cause flickering
      // The browser cleans it up natively eventually, or we could handle it globally
    };
  }, [src, fallbackSrc]);

  return (
    <img
      src={imgSrc || src}
      alt={alt}
      {...props}
      style={{
        opacity: loading ? 0.5 : 1,
        transition: 'opacity 0.3s ease-in-out',
        ...props.style,
      }}
    />
  );
};

export default CachedImage;
