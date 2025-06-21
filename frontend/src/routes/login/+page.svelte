<script>
    // FrontEnd
    // ===== Login Page =====
    // Full Path: src/routes/login/+page.svelte
  

  
    import { locale, t, isLoading } from 'svelte-i18n';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { userToken } from '$lib/stores';
    import { goto } from '$app/navigation';
    import { BACKEND_URL, DEFAULT_HEADERS } from '$lib/config.js';
  
      let username = '';
  let password = '';
  let display_name = '';
  let error = '';
  let isRegister = false;
  let language = 'en'; // default
  let showInstallButton = false;
  let installPrompt = null;
    let switchText = 'Switch to Create Account'; // Will be updated properly

  function updateLanguage(newLanguage) {
    language = newLanguage;
    locale.set(language);
    
    if (browser) {
      const dir = language === 'he' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', dir);
    }
    
    updateSwitchText();
  }

  function updateSwitchText() {
    // Update switch text based on current mode and translations
    if (!$isLoading) {
      switchText = isRegister ? $t('Switch to Login') : $t('Switch to Create Account');
    }
  }
  
      if (browser) {
    onMount(async () => {
      console.warn('🚀 Login page mounted');
      console.log('Initial state:', {
        isLoading: $isLoading,
        language,
        isRegister,
        showInstallButton,
        switchText
      });
      
      // Set initial language and direction
      updateLanguage(language);
      
      // Subscribe to translation loading to update switch text
      const unsubscribeLoading = isLoading.subscribe((loading) => {
        console.log('Translation loading state changed:', loading);
        if (!loading) {
          updateSwitchText();
        }
      });
      
      // Check for existing install prompt
      const isInBrowser = window.matchMedia('(display-mode: browser)').matches;
      console.log('PWA display mode - in browser:', isInBrowser);
      
      if (isInBrowser) {
        // Check if app is already installed first
        if ('getInstalledRelatedApps' in navigator) {
          try {
            const apps = await navigator.getInstalledRelatedApps();
            console.log('Installed related apps:', apps.length);
            if (apps.length === 0) {
              // Not installed, show the button
              showInstallButton = true;
              console.log('App not installed - showing install button');
            } else {
              console.log('App already installed');
            }
          } catch (error) {
            console.log('Error checking installed apps:', error);
            showInstallButton = true;
          }
        } else {
          // Can't check if installed, show button anyway
          console.log('getInstalledRelatedApps not supported - showing install button');
          showInstallButton = true;
        }
      } else {
        console.log('App running in standalone mode - no install button needed');
      }

      // Listen for future install prompts
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        installPrompt = e;
        showInstallButton = true;
      });

      return () => {
        unsubscribeLoading();
        window.removeEventListener('beforeinstallprompt', () => {});
      };
    });
  }

    async function installApp() {
      if (!installPrompt) {
        // Try to trigger PWA install manually
        if ('getInstalledRelatedApps' in navigator) {
          const apps = await navigator.getInstalledRelatedApps();
          if (apps.length > 0) {
            return;
          }
        }
        
        // Show instructions for manual install
        alert(`To install this PWA:
        
1. Chrome Menu (⋮) → "Install app" (if available)
2. Or enable chrome://flags/#bypass-app-banner-engagement-checks
3. Or visit the site multiple times to meet Chrome's engagement requirements`);
        return;
      }

      try {
        const result = await installPrompt.prompt();
        
        if (result.outcome === 'accepted') {
          showInstallButton = false;
        }
        
        installPrompt = null;
      } catch (error) {
        // Install failed silently
      }
    }
  
    async function submitForm() {
      error = ''; // Clear previous errors
      const endpoint = isRegister ? '/api/register' : '/api/login';
      
      const requestBody = isRegister ? 
        { username, password, display_name, language } : 
        { username, password, language };
  

  
      try {
        const res = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          body: JSON.stringify(requestBody)
        });
  
                const data = await res.json();

        if (res.ok && data.token) {
          userToken.set(data.token);
          if (browser) {
            localStorage.setItem('token', data.token);
          }

          if (data.user?.preferred_language) {
            locale.set(data.user.preferred_language);
          }

          // Small delay to ensure store updates are processed
          setTimeout(() => {
            goto('/');
          }, 100);
        } else {
          error = data.error || (isRegister ? 'Registration failed' : 'Login failed');
        }
      } catch (err) {
        error = 'Network error: Unable to connect to server. Please check if the backend is running.';
      }
    }
  
      function toggleMode() {
    isRegister = !isRegister;
    error = '';
    display_name = ''; // Clear display name when switching modes
    updateSwitchText(); // Update the switch text
  }
  </script>
  
{#if !$isLoading}
  <h2>{isRegister ? $t('Register') : $t('Login')}</h2>
  
  {#if error}
    <div style="background: #f44336; color: white; padding: 10px; margin: 10px 0; border-radius: 5px;">
      <p>❌ Error: {error}</p>
    </div>
  {/if}
  
  {#if showInstallButton}
    <div style="background: #4CAF50; color: white; padding: 10px; margin: 10px 0; border-radius: 5px; text-align: center;">
      <p>📱 Install this app for a better experience!</p>
      <button on:click={installApp} style="background: white; color: #4CAF50; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
        Install App
      </button>
    </div>
  {/if}
  
    <form on:submit|preventDefault={submitForm}>
    <label for="username">{$t('Username')}: <input id="username" name="username" type="text" bind:value={username} autocomplete="username" required /></label><br>
    {#if isRegister}
      <label for="display_name">{$t('Display Name')}: <input id="display_name" name="display_name" type="text" bind:value={display_name} autocomplete="name" placeholder="Optional" /></label><br>
    {/if}
    <label for="password">{$t('Password')}: <input id="password" name="password" type="password" bind:value={password} autocomplete="current-password" required /></label><br>

    <label for="language">{$t('Language')}:
      <select id="language" name="language" bind:value={language} on:change={(e) => updateLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="he">עברית</option>
      </select>
    </label><br>
  
    <button type="submit">{isRegister ? $t('Register') : $t('Login')}</button>
  </form>
  
  <button type="button" on:click={toggleMode}>
    {switchText}
  </button>
{:else}
  <div style="text-align: center; padding: 20px;">
    <p>Loading...</p>
  </div>
{/if}