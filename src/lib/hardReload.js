export async function hardReloadGame() {
  try {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister())
      );
    }

    sessionStorage.clear();

    const baseUrl = window.location.origin + window.location.pathname;
    window.location.replace(`${baseUrl}?v=${Date.now()}`);
  } catch (error) {
    console.warn('Hard reload failed:', error);

    const baseUrl = window.location.origin + window.location.pathname;
    window.location.replace(`${baseUrl}?v=${Date.now()}`);
  }
}
