import './styles.css';
import { createApp } from './app.js';

const root = document.querySelector('#app');

createApp(root).catch((error) => {
  console.error(error);
  root.innerHTML = `
    <main class="fatal-screen">
      <div class="fatal-card">
        <p class="eyebrow">Startup error</p>
        <h1>App failed to start</h1>
        <p>${error?.message || 'Unknown error'}</p>
        <button onclick="location.reload()">Reload</button>
      </div>
    </main>
  `;
});
