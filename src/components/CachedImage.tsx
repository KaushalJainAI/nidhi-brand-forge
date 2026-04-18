import { useState, useEffect, useRef } from 'react';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  lazy?: boolean;        // Enable lazy loading
  rootMargin?: string;   // How far ahead to load
}

const MAX_CACHE_SIZE = 50; // Max images to cache in memory
const CACHE_NAME = 'ngu-image-cache-v1';

const getProxiedUrl = (url: string) => {
  if (!url) return url;
  // If it's an S3 URL, route it through our local Nginx proxy to avoid CORS issues
  if (url.includes('s3.ap-south-1.amazonaws.com')) {
    return url.replace(/https:\/\/.*\.s3\..*\.amazonaws\.com\//, '/s3-media/');
  }
  return url;
};

interface CacheEntry {
  blobUrl: string;
  lastAccessed: number;
}

// Global memory cache for object URLs
const memoryCache: Map<string, CacheEntry> = new Map();

const addToMemoryCache = (url: string, blobUrl: string) => {
  if (memoryCache.size >= MAX_CACHE_SIZE) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      const oldEntry = memoryCache.get(oldestKey);
      if (oldEntry) {
        URL.revokeObjectURL(oldEntry.blobUrl);
        memoryCache.delete(oldestKey);
      }
    }
  }
  
  memoryCache.set(url, { blobUrl, lastAccessed: Date.now() });
};

const getFromMemoryCache = (url: string): string | undefined => {
  const entry = memoryCache.get(url);
  if (entry) {
    entry.lastAccessed = Date.now();
    return entry.blobUrl;
  }
  return undefined;
};

const CachedImage: React.FC<CachedImageProps> = ({ 
  src, 
  fallbackSrc, 
  alt, 
  lazy = true,
  rootMargin = '200px',
  className,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(!lazy);
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const proxiedSrc = getProxiedUrl(src);
  const proxiedFallback = fallbackSrc ? getProxiedUrl(fallbackSrc) : undefined;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, rootMargin, src]);

  // Load image when visible
  useEffect(() => {
    if (!isVisible || !proxiedSrc) return;
    
    let isMounted = true;

    const loadImage = async () => {
      // 1. Check memory cache (fastest)
      const memCached = getFromMemoryCache(proxiedSrc);
      if (memCached) {
        if (isMounted) {
          setImgSrc(memCached);
          setLoading(false);
        }
        return;
      }

      // 2. Check Cache API (disk)
      try {
        if ('caches' in window) {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(proxiedSrc);
          
          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            if (isMounted) {
              addToMemoryCache(proxiedSrc, blobUrl);
              setImgSrc(blobUrl);
              setLoading(false);
            }
            return;
          }
        }
      } catch (e) {
        console.warn('Cache API lookup failed:', e);
      }

      // 3. Network fetch
      try {
        const response = await fetch(proxiedSrc, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          
          if (isMounted) {
            addToMemoryCache(proxiedSrc, blobUrl);
            setImgSrc(blobUrl);
            setLoading(false);
          }
          
          // Background cache in Cache API
          if ('caches' in window) {
            try {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(proxiedSrc, new Response(blob.slice(), {
                headers: response.headers
              }));
            } catch (e) {
              console.warn('Cache API write failed:', e);
            }
          }
        } else {
          throw new Error('Image fetch failed');
        }
      } catch (error) {
        console.warn('Failed to load image:', proxiedSrc, error);
        if (isMounted) {
          setImgSrc(proxiedFallback || proxiedSrc);
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [proxiedSrc, proxiedFallback, isVisible]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 animate-pulse bg-muted flex items-center justify-center">
            {/* Optional: Add a placeholder icon or tiny logo here */}
        </div>
      )}
      <img
        src={imgSrc || proxiedSrc}
        alt={alt}
        {...props}
        className={`w-full h-full transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default CachedImage;
