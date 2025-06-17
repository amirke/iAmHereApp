import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      fallback: 'index.html' // ✅ SPA fallback for dynamic routes
    })
  }
};

export default config;
