import { useState, useEffect, useRef } from 'react';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  lazy?: boolean;        // Enable lazy loading
  rootMargin?: string;   // How far ahead to load
  /**
   * Target display width in CSS px. When set (and the src is a Cloudinary
   * image), the delivered image is capped at ~2x this width so we never ship a
   * 1500px, 2 MB original to fill a 176px tile. Omit for full-resolution
   * contexts (e.g. product detail hero).
   */
  cldWidth?: number;
}

const MAX_CACHE_SIZE = 50; // Max images to cache in memory
const CACHE_NAME = 'ngu-image-cache-v2'; // bumped: entries now format/size-optimized

// Ask Cloudinary's f_auto for a modern format even though we load via fetch()
// (fetch's default Accept is */*, which would defeat format auto-negotiation).
const IMG_ACCEPT = 'image/avif,image/webp,image/png,image/*,*/*;q=0.8';

/**
 * Insert Cloudinary delivery transforms (auto format + auto quality, and an
 * optional width cap) into a res.cloudinary.com /image/upload/ URL. Non-Cloudinary
 * URLs and already-transformed URLs are returned unchanged.
 */
const optimizeCloudinary = (url: string, width?: number): string => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const marker = '/image/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const after = url.slice(i + marker.length);
  // Already has a transform segment (e.g. "f_auto,..." or "w_400,...")
  if (/^[a-z]{1,3}_[a-z0-9]/i.test(after)) return url;
  const params = ['f_auto', 'q_auto:good'];
  if (width) {
    // c_limit never upscales; request ~2x for crisp rendering on HiDPI screens.
    params.push('c_limit', `w_${Math.round(width * 2)}`);
  }
  return url.slice(0, i + marker.length) + params.join(',') + '/' + after;
};

const getProxiedUrl = (url: string) => {
  if (!url) return url;

  // 1. Handle S3 URLs (any bucket or region)
  if (url.includes('.s3.') || url.includes('.s3-')) {
    // Matches: https://bucket.s3.region.amazonaws.com/path or https://bucket.s3.amazonaws.com/path
    return url.replace(/^https?:\/\/[^/]+\.(s3[\.\-][^/]+)\.amazonaws.com\//, '/s3-media/');
  }

  // 2. Handle absolute URLs to our own backend during local dev (avoiding CORS)
  if (url.includes('127.0.0.1:8000') || url.includes('localhost:8000')) {
    return url.replace(/^https?:\/\/[^/]+\//, '/');
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
  cldWidth,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(!lazy);
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const proxiedSrc = optimizeCloudinary(getProxiedUrl(src), cldWidth);
  const proxiedFallback = fallbackSrc ? getProxiedUrl(fallbackSrc) : undefined;

  // The passed className styles the container <div>, but object-fit / object-position
  // only take effect on the <img> itself. Without this split the inner image keeps
  // CSS's default `object-fit: fill` and stretches to the box (which has a fixed
  // height but viewport-dependent width), so callers passing `object-contain` /
  // `object-cover` see distorted images that vary by device width. Move any
  // `object-*` utility onto the <img>; everything else stays on the container.
  // Default to `object-contain` so images never stretch even if a caller forgets.
  const classTokens = (className || '').split(/\s+/).filter(Boolean);
  const imgObjectClasses = classTokens.filter((c) => /^object-/.test(c));
  const containerClasses = classTokens.filter((c) => !/^object-/.test(c)).join(' ');
  const imgFitClasses = imgObjectClasses.length ? imgObjectClasses.join(' ') : 'object-contain';

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
        const response = await fetch(proxiedSrc, { mode: 'cors', headers: { Accept: IMG_ACCEPT } });
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
    <div ref={containerRef} className={`relative overflow-hidden ${containerClasses}`}>
      {loading && (
        <div className="absolute inset-0 animate-pulse bg-muted flex items-center justify-center">
            {/* Optional: Add a placeholder icon or tiny logo here */}
        </div>
      )}
      <img
        src={imgSrc || proxiedSrc}
        alt={alt}
        {...props}
        className={`w-full h-full ${imgFitClasses} transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default CachedImage;
