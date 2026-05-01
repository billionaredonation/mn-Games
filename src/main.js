import { show } from './router.js';
import { initRuntime, getState } from './state.js';

const APP_VERSION = '93';

await import(`../pages/welcome1/welcome1.js?v=${APP_VERSION}`);
await import(`../pages/welcome2/welcome2.js?v=${APP_VERSION}`);
await import(`../pages/welcome3/welcome3.js?v=${APP_VERSION}`);
await import(`../pages/home/home.js?v=${APP_VERSION}`);

function renderBootError(error) {
  console.error(error);

  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = `
    <div style="
      min-height:100vh;
      background:#050505;
      color:#fff;
      padding:20px;
      font-family:Arial,sans-serif;
      white-space:pre-wrap;
    ">
      Ошибка запуска:

      ${error?.stack || error?.message || error}
    </div>
  `;
}

async function boot() {
  try {
    window.Telegram?.WebApp?.expand?.();

    initRuntime();

    const state = getState();

    const nickname = state.nickname || state.player?.nickname;
    const city = state.city || state.player?.city;

    if (!nickname) {
      show('welcome1');
      return;
    }

    if (!city) {
      show('welcome3');
      return;
    }

    show('home');
  } catch (error) {
    renderBootError(error);
  }
}

boot();

