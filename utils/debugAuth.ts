export function debugAuthState() {
  if (typeof window === 'undefined') return;
  
  console.log('=== AUTH DEBUG INFO ===');
  console.log('Local Storage:', Object.keys(localStorage).filter(key => key.includes('firebase')));
  console.log('Session Storage:', Object.keys(sessionStorage).filter(key => key.includes('firebase')));
  console.log('Cookies:', document.cookie);
  console.log('========================');
}

export function clearAuthDebug() {
  if (typeof window === 'undefined') return;
  
  console.log('Clearing auth debug...');
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach(function(c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
}