import { DEMO_USER_STORAGE_KEY } from './config.js';
import { readJson, writeJson } from './storage.js';

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

export function getTelegramApp() {
  return window.Telegram?.WebApp || null;
}

export function initTelegramShell() {
  const tg = getTelegramApp();

  if (!tg) {
    return {
      isTelegram: false,
      platform: 'browser',
      colorScheme: 'dark',
    };
  }

  tg.ready();
  tg.expand();

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
