import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      fallback: 'index.html', // ✅ SPA fallback for dynamic routes
      prerender: {
        entries: [] // Disable prerendering to avoid icon path issues
      }
    }),
    serviceWorker: {
      register: false // Disable SvelteKit's automatic service worker
    }
  }
};

export default config;
