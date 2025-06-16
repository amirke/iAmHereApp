<script>
  import { locale } from 'svelte-i18n';
</script>

<h1>Settings</h1>

<select bind:value={$locale}>
  <option value="en">English</option>
  <option value="he">עברית</option>
</select>
