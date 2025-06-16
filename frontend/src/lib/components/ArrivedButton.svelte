<script>
  // Frontend
  //===== ArrivedButton.svelte ======
  // Frontend/src/lib/components/ArrivedButton.svelte

  import { getLocation } from '$lib/utils/geolocation.js';
  import { BACKEND_URL } from '$lib/config.js';
  let sent = false;

  async function handleClick() {
    console.log("Amir1")
    const position = await getLocation();
    await fetch(`${BACKEND_URL}/api/arrived`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'Home',
        timestamp: new Date().toISOString()

      })
    });
    sent = true;
  }
</script>

<button on:click={handleClick} disabled={sent}>
  {sent ? 'Senta!' : 'I Arriveds'}
</button>
