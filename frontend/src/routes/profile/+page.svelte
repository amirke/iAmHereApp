<script>
    //FrontEnd
    //===== Profile Page ======
    // Frontend/src/routes/Profile/+page.svelte

  import { locale, t, isLoading } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { BACKEND_URL, DEFAULT_HEADERS } from '$lib/config';
  import { userToken } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let profile = {};
  let updated = false;
  let error = '';
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let passwordError = '';
  let passwordSuccess = false;

  onMount(async () => {
    if (!browser) return;

    const token = get(userToken);
    if (!token) {
      goto('/login');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/user/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          ...DEFAULT_HEADERS
        }
      });

      if (res.ok) {
        profile = await res.json();
      } else {
        error = 'Could not load profile';
      }
    } catch (err) {
      error = 'Network error loading profile';
    }
  });

  async function saveProfile() {
    const token = get(userToken);
    error = '';
    updated = false;

    try {
      const res = await fetch(`${BACKEND_URL}/api/user/me`, {
        method: 'PUT',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          display_name: profile.display_name,
          language: profile.language
        })
      });

      if (res.ok) {
        updated = true;
        
        // If language changed, update locale, direction, and refresh page
        if (profile.language && profile.language !== get(locale)) {
          locale.set(profile.language);
          
          // Update text direction immediately
          if (browser) {
            const newDirection = profile.language === 'he' ? 'rtl' : 'ltr';
            document.documentElement.setAttribute('dir', newDirection);
          }
          
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } else {
        const err = await res.json();
        error = err.error || 'Update failed';
      }
    } catch (err) {
      error = 'Network error updating profile';
    }
  }

  async function changePassword() {
    passwordError = '';
    passwordSuccess = false;

    if (!currentPassword || !newPassword || !confirmPassword) {
      passwordError = 'Please fill in all password fields';
      return;
    }

    if (newPassword !== confirmPassword) {
      passwordError = 'New passwords do not match';
      return;
    }

    if (newPassword.length < 6) {
      passwordError = 'New password must be at least 6 characters';
      return;
    }

    if (currentPassword === newPassword) {
      passwordError = 'New password must be different from current password';
      return;
    }

    const token = get(userToken);
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          ...DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (res.ok) {
        passwordSuccess = true;
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
      } else {
        const err = await res.json();
        passwordError = err.error || 'Password change failed';
      }
    } catch (err) {
      passwordError = 'Network error changing password';
    }
  }

  function logout() {
    userToken.set('');
    localStorage.removeItem('token');
    goto('/login');
  }
</script>

{#if !$isLoading}
<h2>{$t('My Profile')}</h2>
  
  {#if updated}
    <div style="background: #4CAF50; color: white; padding: 10px; margin: 10px 0; border-radius: 5px;">
      <p>✅ {$t('Profile updated')}</p>
    </div>
  {/if}
  {#if error}
    <div style="background: #f44336; color: white; padding: 10px; margin: 10px 0; border-radius: 5px;">
      <p>❌ {error}</p>
    </div>
  {/if}

  <!-- User Information Display -->
  <div style="background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px;">
    <h3>{$t('User Information')}</h3>
    <p><strong>{$t('Username')}:</strong> {profile.username || 'Loading...'}</p>
    <p><strong>{$t('Display Name')} ({$t('Nickname')}):</strong> {profile.display_name || $t('Not set')}</p>
    <p><strong>{$t('Member since')}:</strong> {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Loading...'}</p>
  </div>
  
  <!-- Profile Settings Form -->
  <div style="background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px;">
    <h3>{$t('Profile Settings')}</h3>
    <form on:submit|preventDefault={saveProfile}>
      <label for="display-name">{$t('Display Name')} ({$t('Nickname')}): 
        <input id="display-name" name="display_name" type="text" bind:value={profile.display_name} autocomplete="name" placeholder={$t('Enter your display name')}>
      </label><br><br>
      
      <label for="profile-language">{$t('Language')}:
        <select id="profile-language" name="language" bind:value={profile.language}>
          <option value="en">English</option>
          <option value="he">עברית</option>
        </select>
      </label><br><br>
      
      <button type="submit">{$t('Save Profile')}</button>
    </form>
  </div>

  <!-- Password Change Form -->
  <div style="background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px;">
    <h3>{$t('Change Password')}</h3>
    
    {#if passwordSuccess}
      <div style="background: #4CAF50; color: white; padding: 10px; margin: 10px 0; border-radius: 5px;">
        <p>✅ {$t('Password changed successfully')}</p>
      </div>
    {/if}
    {#if passwordError}
      <div style="background: #f44336; color: white; padding: 10px; margin: 10px 0; border-radius: 5px;">
        <p>❌ {passwordError}</p>
      </div>
    {/if}
    
    <form on:submit|preventDefault={changePassword}>
      <label for="current-password">{$t('Current Password')}: 
        <input id="current-password" name="current_password" type="password" bind:value={currentPassword} autocomplete="current-password" required>
      </label><br><br>
      
      <label for="new-password">{$t('New Password')}: 
        <input id="new-password" name="new_password" type="password" bind:value={newPassword} autocomplete="new-password" required>
      </label><br><br>
      
      <label for="confirm-password">{$t('Confirm Password')}: 
        <input id="confirm-password" name="confirm_password" type="password" bind:value={confirmPassword} autocomplete="new-password" required>
      </label><br><br>
      
      <button type="submit">{$t('Change Password')}</button>
    </form>
  </div>
  
  <div style="margin-top: 20px;">
    <button on:click={logout} style="background: #f44336; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
      {$t('Log out')}
    </button>
  </div>
{:else}
  <div style="text-align: center; padding: 20px;">
    <p>Loading...</p>
  </div>
{/if}