<script>
  // Frontend
  //===== Routes ======
  // Frontend/src/routes/+page.svelte

  import ArrivedButton from '$lib/components/ArrivedButton.svelte';
  import { onMount } from 'svelte';
  import { loadUserLocale } from '$lib/i18n/i18n';
  import { goto } from '$app/navigation';

</script>

<h1>Welcome to I Am Here</h1>
<ul>
  <li><a href="/profile">View or update your profile</a></li>
  <li><a href="/map">Share or check location (coming soon)</a></li>
  <li><a href="/arrivals">View recent arrivals (coming soon)</a></li>
</ul>

<ArrivedButton />
