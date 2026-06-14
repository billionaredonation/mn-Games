import { APP_NAME, isSupabaseConfigured, UPGRADE_KEYS, UPGRADE_META } from './lib/config.js';
import { escapeHtml, formatCoins, percent } from './lib/format.js';
import { getTelegramUser, haptic, initTelegramShell } from './lib/telegram.js';
import { gameApi } from './services/gameApi.js';

const state = {
  shell: null,
  user: null,
  player: null,
  nextLevelXp: 150,
  upgradeCosts: {},
  leaderboard: [],
  activeTab: 'upgrades',
  busy: false,
  toast: null,
};

function playerName() {
  if (!state.user) return 'Player';
  return state.user.firstName || state.user.username || 'Player';
}

function setBusy(value) {
  state.busy = value;
  render();
}

function setToast(message, type = 'info') {
  state.toast = { message, type };
  render();

  window.clearTimeout(setToast.timer);
  setToast.timer = window.setTimeout(() => {
    state.toast = null;
    render();
  }, 2600);
}

function applyResult(result) {
  if (result?.player) {
    state.player = result.player;
  }

  if (result?.nextLevelXp) {
    state.nextLevelXp = result.nextLevelXp;
  }

  if (result?.upgradeCosts) {
    state.upgradeCosts = result.upgradeCosts;
  }

  if (result?.message) {
    setToast(result.message, result.ok ? 'success' : 'error');
  }
}

async function refreshLeaderboard() {
  try {
    state.leaderboard = await gameApi.leaderboard();
  } catch (error) {
    console.error(error);
  }
}

async function guarded(action) {
  if (state.busy) return;

  try {
    setBusy(true);
    await action();
  } catch (error) {
    console.error(error);
    haptic('error');
    setToast(error.message || 'Action failed', 'error');
  } finally {
    setBusy(false);
  }
}

async function handleWork() {
  await guarded(async () => {
    const result = await gameApi.tapWork(state.user);
    applyResult(result);

    if (result.ok) {
      haptic(result.critical ? 'heavy' : 'light');
    } else {
      haptic('warning');
    }

    await refreshLeaderboard();
  });
}

async function handleBuyUpgrade(key) {
  await guarded(async () => {
    const result = await gameApi.buyUpgrade(state.user, key);
    applyResult(result);
    haptic(result.ok ? 'success' : 'warning');
    await refreshLeaderboard();
  });
}

async function handleDaily() {
  await guarded(async () => {
    const result = await gameApi.claimDaily(state.user);
    applyResult(result);
    haptic(result.ok ? 'success' : 'warning');
    await refreshLeaderboard();
  });
}

async function handleAdminGrant(form) {
  const formData = new FormData(form);
  const pin = String(formData.get('pin') || '').trim();
  const telegramId = String(formData.get('telegramId') || '').trim();
  const amount = Number(formData.get('amount') || 0);

  if (!pin || !telegramId || !Number.isFinite(amount)) {
    setToast('Fill admin PIN, Telegram ID and amount', 'error');
    return;
  }

  await guarded(async () => {
    const result = await gameApi.adminGrantCoins(pin, telegramId, amount);
    applyResult(result);
    haptic(result.ok ? 'success' : 'warning');
    await refreshLeaderboard();
  });
}

async function handleAdminReset(form) {
  const formData = new FormData(form);
  const pin = String(formData.get('pin') || '').trim();
  const telegramId = String(formData.get('telegramId') || '').trim();

  if (!pin || !telegramId) {
    setToast('Fill admin PIN and Telegram ID', 'error');
    return;
  }

  await guarded(async () => {
    const result = await gameApi.adminResetPlayer(pin, telegramId);
    applyResult(result);
    haptic(result.ok ? 'success' : 'warning');
    await refreshLeaderboard();
  });
}

function renderHero() {
  const player = state.player;
  const energyPercent = percent(player.energy, player.max_energy);
  const xpPercent = percent(player.xp, state.nextLevelXp);

  return `
    <section class="hero-card">
      <div class="hero-topline">
        <div>
          <p class="eyebrow">${escapeHtml(APP_NAME)} / Starter Kit</p>
          <h1>Work. Earn. Upgrade.</h1>
        </div>
        <div class="mode-pill ${isSupabaseConfigured ? 'mode-pill--live' : ''}">
          ${isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode'}
        </div>
      </div>

      <div class="player-strip">
        <div class="avatar">${escapeHtml(playerName().slice(0, 1).toUpperCase())}</div>
        <div>
          <strong>${escapeHtml(playerName())}</strong>
          <span>${state.user.isDemo ? 'Browser demo user' : `Telegram ID ${state.user.id}`}</span>
        </div>
      </div>

      <div class="primary-balance">
        <span>Balance</span>
        <strong>${formatCoins(player.coins)} WRK</strong>
      </div>

      <div class="progress-block">
        <div class="progress-row">
          <span>Energy</span>
          <b>${player.energy}/${player.max_energy}</b>
        </div>
        <div class="progress-track"><i style="width:${energyPercent}%"></i></div>
      </div>

      <div class="progress-block">
        <div class="progress-row">
          <span>Level ${player.level}</span>
          <b>${player.xp}/${state.nextLevelXp} XP</b>
        </div>
        <div class="progress-track progress-track--xp"><i style="width:${xpPercent}%"></i></div>
      </div>

      <button class="work-button" data-action="work" ${state.busy || player.energy <= 0 ? 'disabled' : ''}>
        <span>Tap to Work</span>
        <b>+${Math.max(1, Number(player.tap_power || 1))} WRK</b>
      </button>

      <button class="daily-button" data-action="daily" ${state.busy ? 'disabled' : ''}>
        Claim daily bonus
      </button>
    </section>
  `;
}

function renderStats() {
  const player = state.player;
  const stats = [
    ['Power', player.tap_power, 'coins/tap'],
    ['Stamina', player.stamina_level, 'energy'],
    ['Focus', player.focus_level, 'income'],
    ['Luck', player.luck_level, 'crit'],
  ];

  return `
    <section class="stats-grid">
      ${stats
        .map(
          ([label, value, hint]) => `
            <article class="stat-card">
              <span>${label}</span>
              <strong>${value}</strong>
              <small>${hint}</small>
            </article>
          `
        )
        .join('')}
    </section>
  `;
}

function renderTabs() {
  const tabs = [
    ['upgrades', 'Upgrades'],
    ['leaderboard', 'Leaderboard'],
    ['admin', 'Admin'],
  ];

  return `
    <nav class="tabs">
      ${tabs
        .map(
          ([key, label]) => `
            <button class="tab ${state.activeTab === key ? 'tab--active' : ''}" data-tab="${key}">
              ${label}
            </button>
          `
        )
        .join('')}
    </nav>
  `;
}

function renderUpgrades() {
  const player = state.player;

  return `
    <section class="panel">
      <div class="panel-heading">
        <p class="eyebrow">Monetizable loop</p>
        <h2>Upgrade economy</h2>
      </div>

      <div class="upgrade-list">
        ${UPGRADE_KEYS.map((key) => {
          const meta = UPGRADE_META[key];
          const level = Number(player[key] || 1);
          const cost = Number(state.upgradeCosts[key] || 0);
          const canBuy = Number(player.coins || 0) >= cost && level < 20 && !state.busy;

          return `
            <article class="upgrade-card">
              <div class="upgrade-icon">${meta.icon}</div>
              <div class="upgrade-body">
                <strong>${meta.title}</strong>
                <span>${meta.subtitle}</span>
                <small>Level ${level}/20</small>
              </div>
              <button class="mini-button" data-upgrade="${key}" ${canBuy ? '' : 'disabled'}>
                ${level >= 20 ? 'Max' : `${formatCoins(cost)} WRK`}
              </button>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderLeaderboard() {
  return `
    <section class="panel">
      <div class="panel-heading panel-heading--row">
        <div>
          <p class="eyebrow">Social proof</p>
          <h2>Leaderboard</h2>
        </div>
        <button class="ghost-button" data-action="refresh-leaderboard">Refresh</button>
      </div>

      <div class="leaderboard-list">
        ${state.leaderboard.length
          ? state.leaderboard
              .map(
                (item) => `
                  <article class="leaderboard-row">
                    <b>#${item.rank}</b>
                    <div>
                      <strong>${escapeHtml(item.name || 'Player')}</strong>
                      <span>${item.username ? `@${escapeHtml(item.username)}` : `ID ${item.telegram_id}`}</span>
                    </div>
                    <em>${formatCoins(item.coins)} WRK</em>
                  </article>
                `
              )
              .join('')
          : '<p class="empty-text">No leaderboard data yet.</p>'}
      </div>
    </section>
  `;
}

function renderAdmin() {
  return `
    <section class="panel">
      <div class="panel-heading">
        <p class="eyebrow">Demo admin panel</p>
        <h2>Operator tools</h2>
      </div>

      <div class="warning-box">
        Static MVP admin is good for demos. For production, move admin actions behind a real backend role.
        Default SQL PIN is <b>1234</b>. Change it in Supabase before showing clients.
      </div>

      <form class="admin-form" data-admin-form="grant">
        <label>
          Admin PIN
          <input name="pin" type="password" placeholder="1234" autocomplete="off" />
        </label>
        <label>
          Telegram ID
          <input name="telegramId" type="number" value="${state.user.id}" />
        </label>
        <label>
          Amount
          <input name="amount" type="number" value="500" />
        </label>
        <button class="mini-button" type="submit">Grant coins</button>
      </form>

      <form class="admin-form" data-admin-form="reset">
        <label>
          Admin PIN
          <input name="pin" type="password" placeholder="1234" autocomplete="off" />
        </label>
        <label>
          Telegram ID
          <input name="telegramId" type="number" value="${state.user.id}" />
        </label>
        <button class="danger-button" type="submit">Reset player</button>
      </form>
    </section>
  `;
}

function renderActivePanel() {
  if (state.activeTab === 'leaderboard') return renderLeaderboard();
  if (state.activeTab === 'admin') return renderAdmin();
  return renderUpgrades();
}

function renderToast() {
  if (!state.toast) return '';

  return `
    <div class="toast toast--${state.toast.type}">
      ${escapeHtml(state.toast.message)}
    </div>
  `;
}

function renderLoading() {
  return `
    <main class="app-shell app-shell--loading">
      <div class="loader-card">
        <div class="loader-ring"></div>
        <p>Loading ${escapeHtml(APP_NAME)}...</p>
      </div>
    </main>
  `;
}

function render() {
  if (!state.player) {
    appRoot.innerHTML = renderLoading();
    return;
  }

  appRoot.innerHTML = `
    <main class="app-shell">
      <header class="topbar">
        <div>
          <strong>${escapeHtml(APP_NAME)}</strong>
          <span>${state.shell?.isTelegram ? 'Telegram Mini App' : 'Browser Preview'}</span>
        </div>
        <button class="icon-button" data-action="reload">↻</button>
      </header>

      ${renderHero()}
      ${renderStats()}
      ${renderTabs()}
      ${renderActivePanel()}
      ${renderToast()}
    </main>
  `;
}

function bindEvents(root) {
  root.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    const tabButton = event.target.closest('[data-tab]');
    const upgradeButton = event.target.closest('[data-upgrade]');

    if (tabButton) {
      state.activeTab = tabButton.dataset.tab;
      render();
      return;
    }

    if (upgradeButton) {
      handleBuyUpgrade(upgradeButton.dataset.upgrade);
      return;
    }

    if (!actionButton) return;

    const action = actionButton.dataset.action;

    if (action === 'work') handleWork();
    if (action === 'daily') handleDaily();
    if (action === 'reload') location.reload();
    if (action === 'refresh-leaderboard') {
      guarded(async () => {
        await refreshLeaderboard();
        setToast('Leaderboard refreshed', 'success');
      });
    }
  });

  root.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-admin-form]');
    if (!form) return;

    event.preventDefault();

    if (form.dataset.adminForm === 'grant') {
      handleAdminGrant(form);
    }

    if (form.dataset.adminForm === 'reset') {
      handleAdminReset(form);
    }
  });
}

let appRoot;

export async function createApp(root) {
  appRoot = root;
  bindEvents(appRoot);

  state.shell = await initTelegramShell();
  state.user = getTelegramUser();

  render();

  const result = await gameApi.loadPlayer(state.user);
  applyResult(result);
  await refreshLeaderboard();
  render();
}
