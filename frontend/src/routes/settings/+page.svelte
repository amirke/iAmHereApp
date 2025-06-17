<script>
  import { locale } from 'svelte-i18n';
  import { switchLanguage } from '$lib/i18n/i18n';

  async function handleLanguageChange(event) {
    const newLocale = event.target.value;
    await switchLanguage(newLocale);
  }
</script>

<h1>Settings</h1>

<select value={$locale} on:change={handleLanguageChange}>
  <option value="en">English</option>
  <option value="he">עברית</option>
</select>
