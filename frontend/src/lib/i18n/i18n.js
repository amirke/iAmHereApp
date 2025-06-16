import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';
import { get } from 'svelte/store';
import { BACKEND_URL } from '$lib/config';
import { userToken } from '$lib/stores';

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

// Default init
init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator()
});
