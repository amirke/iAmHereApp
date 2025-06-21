import { register, init, getLocaleFromNavigator, locale, waitLocale } from 'svelte-i18n';
import { get } from 'svelte/store';
import { BACKEND_URL } from '$lib/config';
import { userToken } from '$lib/stores';

// Pre-register locales synchronously to avoid delays
register('en', () => import('./en.json'));
register('he', () => import('./he.json'));

// async function to load user language from backend
export async function loadUserLocale() {
  const token = get(userToken);
  if (!token) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const user = await res.json();
    if (user.language) {
      locale.set(user.language);
    }
  } catch (err) {
    console.warn('Failed to load user locale:', err);
  }
}

// Function to switch language and save to backend
export async function switchLanguage(newLocale) {
  const token = get(userToken);
  if (!token) {
    locale.set(newLocale);
    return;
  }

  try {
    // Update backend
    const res = await fetch(`${BACKEND_URL}/api/user/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ language: newLocale })
    });

    if (res.ok) {
      // Update local locale
      locale.set(newLocale);
    } else {
      console.warn('Failed to update language on backend');
    }
  } catch (err) {
    console.warn('Failed to switch language:', err);
  }
}

// Initialize with immediate locale loading
const initLocale = getLocaleFromNavigator() || 'en';

init({
  fallbackLocale: 'en',
  initialLocale: initLocale
});

// Pre-load the initial locale
waitLocale(initLocale);
