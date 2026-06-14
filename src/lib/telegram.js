import { DEMO_USER_STORAGE_KEY } from './config.js';
import { readJson, writeJson } from './storage.js';

const TELEGRAM_SCRIPT_SRC = 'https://telegram.org/js/telegram-web-app.js';

function createDemoUser() {
  const saved = readJson(DEMO_USER_STORAGE_KEY, null);

  if (saved?.id) {
    return saved;
  }

  const user = {
    id: Math.floor(100000000 + Math.random() * 899999999),
    username: 'demo_buyer',
    firstName: 'Demo',
    isDemo: true,
  };

  writeJson(DEMO_USER_STORAGE_KEY, user);
  return user;
}

function getLaunchParamsText() {
  return `${window.location.search || ''}&${window.location.hash || ''}`;
}

function hasTelegramLaunchParams() {
  if (window.Telegram?.WebApp) return true;

  const launchParams = getLaunchParamsText();

  return (
    launchParams.includes('tgWebAppData=') ||
    launchParams.includes('tgWebAppVersion=') ||
    launchParams.includes('tgWebAppPlatform=') ||
    launchParams.includes('tgWebAppThemeParams=')
  );
}

function loadTelegramScript() {
  if (window.Telegram?.WebApp) {
    return Promise.resolve(true);
  }

  const existingScript = document.querySelector(`script[src="${TELEGRAM_SCRIPT_SRC}"]`);

  if (existingScript) {
    return new Promise((resolve) => {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      window.setTimeout(() => resolve(Boolean(window.Telegram?.WebApp)), 1200);
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = TELEGRAM_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function getTelegramApp() {
  return window.Telegram?.WebApp || null;
}

export async function initTelegramShell() {
  if (hasTelegramLaunchParams()) {
    await loadTelegramScript();
  }

  const tg = getTelegramApp();

  if (!tg) {
    return {
      isTelegram: false,
      platform: 'browser',
      colorScheme: 'dark',
    };
  }

  try {
    tg.ready();
    tg.expand();
  } catch {
    // Running outside a real Telegram client can throw in some browsers. Safe to ignore.
  }

  try {
    tg.setHeaderColor('#10131f');
    tg.setBackgroundColor('#10131f');
  } catch {
    // Older clients may not support all methods. Safe to ignore.
  }

  return {
    isTelegram: true,
    platform: tg.platform || 'telegram',
    colorScheme: tg.colorScheme || 'dark',
    version: tg.version,
  };
}

export function getTelegramUser() {
  const tg = getTelegramApp();
  const rawUser = tg?.initDataUnsafe?.user;

  if (!rawUser?.id) {
    return createDemoUser();
  }

  return {
    id: rawUser.id,
    username: rawUser.username || null,
    firstName: rawUser.first_name || null,
    lastName: rawUser.last_name || null,
    languageCode: rawUser.language_code || null,
    isDemo: false,
  };
}

export function haptic(type = 'light') {
  const tg = getTelegramApp();
  const feedback = tg?.HapticFeedback;

  if (!feedback) return;

  try {
    if (type === 'success' || type === 'error' || type === 'warning') {
      feedback.notificationOccurred(type);
      return;
    }

    feedback.impactOccurred(type);
  } catch {
    // Haptics are optional.
  }
}
