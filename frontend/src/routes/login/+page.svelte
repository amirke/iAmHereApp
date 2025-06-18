<script>
    // FrontEnd
    // ===== Login Page =====
    // Full Path: src/routes/login/+page.svelte
  
    import { locale, t } from 'svelte-i18n';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { userToken } from '$lib/stores';
    import { goto } from '$app/navigation';
    import { BACKEND_URL, DEFAULT_HEADERS } from '$lib/config.js';
  
    let username = '';
    let password = '';
    let error = '';
    let isRegister = false;
    let language = 'en'; // default
    let translatedLogin = '';
    let translatedRegister = '';
    let translatedUsername = '';
    let translatedPassword = '';
    let translatedSwitch = '';
    let translatedLang = '';
  
    // Set initial language
    $: locale.set(language);
  
    // Set text direction (RTL/LTR)
    $: if (browser) {
      const dir = language === 'he' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', dir);
    }
  
    // Load translations reactively
    if (browser) {
      onMount(() => {
        const unsub = t.subscribe(($t) => {
          translatedLogin = $t('Login');
          translatedRegister = $t('Register');
          translatedUsername = $t('Username');
          translatedPassword = $t('Password');
          translatedSwitch = isRegister ? $t('Switch to Login') : $t('Switch to Create Account');
          translatedLang = $t('Language');
        });
  
        return () => unsub();
      });
    }
  
    async function submitForm() {
      const endpoint = isRegister ? '/api/register' : '/api/login';
  
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ username, password, language })
      });
  
      const data = await res.json();
  
      if (res.ok && data.token) {
        userToken.set(data.token);
        localStorage.setItem('token', data.token);
  
        if (data.user?.preferred_language) {
          locale.set(data.user.preferred_language);
        }
  
        goto('/');
      } else {
        error = data.error || (isRegister ? 'Registration failed' : 'Login failed');
      }
    }
  
    function toggleMode() {
      isRegister = !isRegister;
      error = '';
    }
  </script>
  
  <h2>{isRegister ? translatedRegister : translatedLogin}</h2>
  
  <form on:submit|preventDefault={submitForm}>
    <label>{translatedUsername}: <input bind:value={username} required /></label><br>
    <label>{translatedPassword}: <input type="password" bind:value={password} required /></label><br>
  
    <label>{translatedLang}:
      <select bind:value={language}>
        <option value="en">English</option>
        <option value="he">עברית</option>
      </select>
    </label><br>
  
    <button type="submit">{isRegister ? translatedRegister : translatedLogin}</button>
  </form>
  
  <button type="button" on:click={toggleMode}>
    {translatedSwitch}
  </button>
  