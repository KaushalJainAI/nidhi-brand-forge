export const toggleGoogleTranslate = (lang: 'en' | 'hi') => {
  const googleTranslateElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (googleTranslateElement) {
    googleTranslateElement.value = lang;
    googleTranslateElement.dispatchEvent(new Event('change'));
  } else {
    // If widget not loaded yet, set cookie manually as fallback
    document.cookie = `googtrans=/en/${lang}; path=/`;
    document.cookie = `googtrans=/en/${lang}; domain=.nidhimasala.com; path=/`;
    window.location.reload();
  }
};

export const getGoogleTranslateLang = () => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
  if (cookie) {
    const val = cookie.split('=')[1];
    return val.endsWith('/hi') ? 'hi' : 'en';
  }
  return 'en';
};
