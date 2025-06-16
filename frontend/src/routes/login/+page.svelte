<script>
    //FrontEnd
    //===== Login Page ======
    // Frontend/src/routes/login/+page.svelte

    import { locale, t } from 'svelte-i18n'; // ⬅️ import this
    import { userToken } from '$lib/stores';
    import { goto } from '$app/navigation';

    let username = '';
    let password = '';
    let error = '';
    let isRegister = false;
    let language = 'en'; // default selected

    $: locale.set(language);

    async function submitForm() {
        const endpoint = isRegister ? '/api/register' : '/api/login';
        console.log(endpoint);

        const res = await fetch(`http://192.168.1.17:3001${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, language })
        });
        console.log(res);

        const data = await res.json();
        console.log(data);

        if (res.ok && data.token) {
            userToken.set(data.token);
            localStorage.setItem('token', data.token);
            console.log(data.token);

            // ✅ Switch language immediately
            if (data.user?.preferred_language) {
                locale.set(data.user.preferred_language);
                console.log(data.user.preferred_language);
            }

            goto('/');
        } else {
            error = data.error || (isRegister ? 'Registration failed' : 'Login failed');
            console.log(error);
        }
    }

    function toggleMode() {
        isRegister = !isRegister;
        error = '';
    }



    // In submitForm() request body:
    body: JSON.stringify({ username, password, language })


</script>

<h2>{isRegister ? $t('Create Account') : $t('login')}</h2>

<form on:submit|preventDefault={submitForm}>
  <label>{$t('Username')}: <input bind:value={username} required /></label><br>
  <label>{$t('Password')}: <input type="password" bind:value={password} required /></label><br>

  <label>{$t('Language')}:
    <select bind:value={language}>
      <option value="en">English</option>
      <option value="he">עברית</option>
    </select>
  </label><br>

  <button type="submit">{isRegister ? $t('Register') : $t('Login')}</button>

</form>


<button type="button" on:click={toggleMode}>
    {isRegister ? $t('Switch to Login') : $t('Switch to Create Account')}
</button>
