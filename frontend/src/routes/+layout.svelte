<script>
  // Frontend
  //===== Layout ======
  // Frontend/src/routes/+layout.svelte

  import '$lib/i18n/i18n.js';
  import { locale, t } from 'svelte-i18n'; // ⬅️ import this
  import { loadUserLocale } from '$lib/i18n/i18n';

  import { onMount } from 'svelte';
  import { userToken } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  // Set HTML direction dynamically
  $: {
    const currentLocale = $locale;
    const direction = currentLocale === 'he' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
  }


  function logout() {
    userToken.set('');
    localStorage.removeItem('token');
    goto('/login');
  }

  onMount(() => {
    const token = get(userToken);
    if (!token) {
      goto('/login');
      return;
    }

    loadUserLocale();
  });
</script>

<nav>
  <a href="/">{$t('Home')}</a> |
  <a href="/profile">{$t('My Profile')}</a> |
  <button on:click={logout}>{$t('Logout')}</button>
</nav>


<slot />
