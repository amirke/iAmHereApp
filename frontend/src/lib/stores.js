import { writable } from 'svelte/store';

// Check if we are in the browser (client-side)
const isBrowser = typeof window !== 'undefined';

const savedToken = isBrowser ? localStorage.getItem('token') : '';

// Writable store for JWT token
export const userToken = writable(savedToken);

// Keep token in localStorage if running in browser
if (isBrowser) {
  userToken.subscribe((value) => {
    if (value) {
      localStorage.setItem('token', value);
    } else {
      localStorage.removeItem('token');
    }
  });
}
