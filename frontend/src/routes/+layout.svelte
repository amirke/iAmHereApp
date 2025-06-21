<script>
  // Frontend
  //===== Layout ======
  // Full Path: src/routes/+layout.svelte

  import '$lib/i18n/i18n.js';
  import { locale, t, isLoading } from 'svelte-i18n';
  import { loadUserLocale } from '$lib/i18n/i18n';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { userToken } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import Navigation from '$lib/components/Navigation.svelte';

  let showNav = false;



  // Register service worker for PWA
  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Debug: Check existing registrations
        const existingRegs = await navigator.serviceWorker.getRegistrations();
        
        // Try to register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        // Check if the service worker is controlling the page
        if (navigator.serviceWorker.controller) {
          console.log('✅ PWA: Service Worker is controlling the page');
        } else {
          console.log('⚠️ PWA: Service Worker is not controlling the page yet');
        }
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed');
            }
          });
        });

        // Debug: Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          // Store the event for later use
          window.deferredPrompt = e;
        });

        // Force update check for Chrome Mobile
        registration.update();

      } catch (error) {
        console.error('❌ PWA: Service Worker registration failed:', error);
      }
    }
  }

  if (browser) {
    onMount(async () => {
      // Register service worker first
      await registerServiceWorker();

      // Debug logging with proper browser context
      if (browser) {
        console.warn('🚀 Layout onMount started');
        console.log('Initial flags:', {
          isLoading: $isLoading,
          showNav: showNav,
          userToken: !!$userToken
        });
      }
      
      // Check authentication
      const token = get(userToken);
      if (!token) {
        goto('/login');
        return;
      }

      // Set initial navigation visibility
      showNav = !!(token && token.trim() !== '');

      // Load user locale and set direction
      await loadUserLocale();

      const currentLocale = get(locale);
      const direction = currentLocale === 'he' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', direction);

      // Subscribe to locale changes for RTL/LTR switching
      const unsubscribeLocale = locale.subscribe((currentLocale) => {
        const dir = currentLocale === 'he' ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', dir);
        if (browser) {
          console.log('🌐 Locale changed:', currentLocale, 'Direction:', dir);
        }
      });

      // Subscribe to token changes for navigation visibility
      const unsubscribeToken = userToken.subscribe((token) => {
        showNav = !!(token && token.trim() !== '');
        if (browser) {
          console.log('🔐 Token changed, showNav:', showNav);
        }
      });

      // Subscribe to translation loading state
      const unsubscribeLoading = isLoading.subscribe((loading) => {
        if (browser) {
          console.log('📚 Translation loading state:', loading);
        }
      });

      return () => {
        unsubscribeLocale();
        unsubscribeToken();
      };
    });
  }
</script>

<style>
  /* Layout styles */
</style>

<!--{#if showNav}
  <Navigation />
{/if}-->
 <Navigation />

<slot />
