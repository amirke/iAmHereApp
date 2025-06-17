<script>
  // Frontend
  //===== Layout ======
  // Full Path: src/routes/+layout.svelte

  import '$lib/i18n/i18n.js';
  import { locale, t } from 'svelte-i18n';
  import { loadUserLocale } from '$lib/i18n/i18n';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { userToken } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let translatedHome = '';
  let translatedProfile = '';
  let translatedLogout = '';
  let showNav = false; // 👈 שליטה על תצוגת התפריט

  function logout() {
    userToken.set('');
    localStorage.removeItem('token');
    goto('/login');
  }

  if (browser) {
    onMount(async () => {
      const token = get(userToken);
      if (!token) {
        console.log('[Layout] No token. Redirecting to /login');
        goto('/login');
        return;
      }

      showNav = true; // ✅ מציג תפריט רק אחרי אימות טוקן

      console.log('[Layout] Logged in. Loading user locale...');
      await loadUserLocale();

      const currentLocale = get(locale);
      const direction = currentLocale === 'he' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', direction);

      const unsubscribe = locale.subscribe((currentLocale) => {
        const dir = currentLocale === 'he' ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', dir);
        console.log('[Layout] Locale changed →', currentLocale, '→ dir:', dir);
      });

      const unsubT = t.subscribe(($t) => {
        translatedHome = $t('Home');
        translatedProfile = $t('My Profile');
        translatedLogout = $t('Logout');
        console.log('[Layout] Translations updated');
      });

      return () => {
        unsubscribe();
        unsubT();
      };
    });
  }
</script>

<style>
  nav {
    padding: 1rem;
    background-color: #f8f9fa;
    margin-bottom: 1rem;
  }

  nav a {
    margin: 0 0.5rem;
    text-decoration: none;
    color: #333;
  }

  nav button {
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }
</style>

{#if browser && showNav}
  <nav>
    <a href="/">{translatedHome}</a> |
    <a href="/profile">{translatedProfile}</a> |
    <button on:click={logout}>{translatedLogout}</button>
  </nav>
{/if}

<slot />
