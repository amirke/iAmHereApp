<script>
    //FrontEnd
    //===== Profile Page ======
    // Frontend/src/routes/Profile/+page.svelte

  import { locale, t } from 'svelte-i18n'; // ⬅️ import this
  import { onMount } from 'svelte';
  import { BACKEND_URL } from '$lib/config';
  import { userToken } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store'; // ✅ this is needed

  let profile = {};
  let updated = false;
  let error = '';

  onMount(async () => {
    const token = get(userToken); // ✅
    if (!token) {
      goto('/login');
      return;
    }

    const res = await fetch(`${BACKEND_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      profile = await res.json();
    } else {
      error = 'Could not load profile';
    }
  });

  async function saveProfile() {
    const token = get(userToken); // ✅
    const res = await fetch(`${BACKEND_URL}/api/user/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profile)
    });

    if (res.ok) {
      updated = true;
    } else {
      const err = await res.json();
      error = err.error || 'Update failed';
    }
  }

  function logout() {
    userToken.set('');
    localStorage.removeItem('token');
    goto('/login');
  }
</script>

  <h2>{$t('My Profile')}</h2>
  
  {#if updated}
    <p>✅ {$t('Profile updated')}</p>
  {/if}
  {#if error}
    <p style="color:red;">❌ {error}</p>
  {/if}
  
  <form on:submit|preventDefault={saveProfile}>
    <label>{$t('Name')}: <input bind:value={profile.display_name}></label><br>
    <label>{$t('Language')}:
      <select bind:value={profile.language}>
        <option value="en">English</option>
        <option value="he">עברית</option>
      </select>
    </label><br>
    <button type="submit">{$t('Save')}</button>
  </form>
  
  <button on:click={logout}>Log out</button>
  