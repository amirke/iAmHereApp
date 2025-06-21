<script>
  // Frontend
  //===== Routes ======
  // Frontend/src/routes/+page.svelte

  import ArrivedButton from '$lib/components/ArrivedButton.svelte';
  import { onMount } from 'svelte';
  import { loadUserLocale } from '$lib/i18n/i18n';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { t, isLoading } from 'svelte-i18n';

  let showInstallButton = false;
  let installPrompt = null;


  onMount(() => {

    if (browser) {
      console.warn('Main page is starting');

      
      // Listen for the beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('Install prompt available on main page');
        e.preventDefault();
        installPrompt = e;
        showInstallButton = true;
      });

      // Check if app is already installed
      if ('getInstalledRelatedApps' in navigator) {
        navigator.getInstalledRelatedApps().then(apps => {
          if (apps.length > 0) {
            console.log('App already installed');
            showInstallButton = false;
          }
        });
      }
    }
  });

  async function installApp() {
    if (!installPrompt) {
      console.log('No install prompt available');
      return;
    }

    try {
      console.log('Triggering install prompt...');
      const result = await installPrompt.prompt();
      console.log('Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        showInstallButton = false;
      } else {
        console.log('User dismissed the install prompt');
      }
      
      installPrompt = null;
    } catch (error) {
      console.error('Error during install:', error);
    }
  }


</script>

<h1>Welcome to I Am Here</h1>

{#if showInstallButton}
  <div style="background: #4CAF50; color: white; padding: 10px; margin: 10px 0; border-radius: 5px; text-align: center;">
    <p>📱 Install this app for a better experience!</p>
    <button on:click={installApp} style="background: white; color: #4CAF50; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
      Install App
    </button>
  </div>
{/if}



<ul>
  <li><a href="/profile">View or update your profile</a></li>
  <li><a href="/map">Share or check location (coming soon)</a></li>
  <li><a href="/arrivals">View recent arrivals (coming soon)</a></li>
</ul>

<ArrivedButton />
