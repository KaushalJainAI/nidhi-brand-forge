export const setGoogleTranslateLang = (lang: 'en' | 'hi') => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // 1. Aggressively clear ALL possible variations of the googtrans cookie
  // We go through every domain level (subdomain, parent domain, etc.)
  while (parts.length >= 2) {
    const domain = parts.join('.');
    document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}`;
    document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${domain}`;
    parts.shift();
  }
  // Clear without domain attribute as a final fallback
  document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  // 2. Set the new cookie if we're switching to Hindi
  if (lang === 'hi') {
    const cookieValue = `/en/hi`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${hostname}`;
    document.cookie = `googtrans=${cookieValue}; path=/`; 
  }

  // 3. Force a full page reload to apply the fresh cookie state
  window.location.reload();
};

export const getGoogleTranslateLang = (): 'en' | 'hi' => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
  if (cookie) {
    const val = cookie.split('=')[1];
    return val.includes('/hi') ? 'hi' : 'en';
  }
  return 'en';
};

export const toggleGoogleTranslate = (lang: 'en' | 'hi') => {
  setGoogleTranslateLang(lang);
};
