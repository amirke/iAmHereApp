<script>
  import { t, isLoading } from 'svelte-i18n';
  import { userToken } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  function logout() {
    userToken.set('');
    if (browser) {
      localStorage.removeItem('token');
      console.log('token removed from navigation');
    }
    goto('/login');
  }

</script>

<style>
  nav {
    padding: 1rem;
    background-color: #f8f9fa;
    margin-bottom: 1rem;
    opacity: 1;
    transition: opacity 0.2s ease-in-out;
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

{#if !$isLoading}
  <nav>
    <a href="/">{$t('Home')}</a> |
    <a href="/profile">{$t('My Profile')}</a> |
    <button on:click={logout}>{$t('Logout')}</button>
  </nav>
{:else}
  <nav>
    <a href="/">Home</a> |
    <a href="/profile">Profile</a> |
    <button on:click={logout}>Logout</button>
  </nav>
{/if} 