import { isSupabaseConfigured, DEMO_STORAGE_KEY } from '../lib/config.js';
import { readJson, writeJson } from '../lib/storage.js';
import { supabase } from '../lib/supabase.js';
import {
  applyTimers,
  buyLocalUpgrade,
  claimLocalDaily,
  defaultPlayer,
  getUpgradeCosts,
  nextLevelXp,
  tapPlayer,
} from '../game/economy.js';

function normalizeUser(user) {
  return {
    p_telegram_id: Number(user.id),
    p_username: user.username || null,
    p_first_name: user.firstName || null,
  };
}

function normalizeRpcResult(data) {
  if (!data) {
    return {
      ok: false,
      message: 'Empty response from database',
    };
  }

  if (typeof data === 'string') {
    return JSON.parse(data);
  }

  return data;
}

async function callRpc(name, payload) {
  const { data, error } = await supabase.rpc(name, payload);

  if (error) {
    throw new Error(error.message);
  }

  return normalizeRpcResult(data);
}

function readDemoPlayer(user) {
  const saved = readJson(DEMO_STORAGE_KEY, null);

  if (saved?.telegram_id === user.id) {
    return applyTimers(saved);
  }

  return defaultPlayer(user);
}

function saveDemoResult(result) {
  if (result?.player) {
    writeJson(DEMO_STORAGE_KEY, result.player);
  }

  return result;
}

function localPayload(player, message = 'Demo player loaded') {
  const next = applyTimers(player);

  return saveDemoResult({
    ok: true,
    message,
    player: next,
    earned: 0,
    critical: false,
    nextLevelXp: nextLevelXp(next.level),
    upgradeCosts: getUpgradeCosts(next),
  });
}

export const gameApi = {
  async loadPlayer(user) {
    if (!isSupabaseConfigured) {
      return localPayload(readDemoPlayer(user));
    }

    return callRpc('get_or_create_player', normalizeUser(user));
  },

  async tapWork(user) {
    if (!isSupabaseConfigured) {
      return saveDemoResult(tapPlayer(readDemoPlayer(user)));
    }

    return callRpc('tap_work', normalizeUser(user));
  },

  async buyUpgrade(user, upgradeKey) {
    if (!isSupabaseConfigured) {
      return saveDemoResult(buyLocalUpgrade(readDemoPlayer(user), upgradeKey));
    }

    return callRpc('buy_upgrade', {
      p_telegram_id: Number(user.id),
      p_upgrade_key: upgradeKey,
    });
  },

  async claimDaily(user) {
    if (!isSupabaseConfigured) {
      return saveDemoResult(claimLocalDaily(readDemoPlayer(user)));
    }

    return callRpc('claim_daily_bonus', {
      p_telegram_id: Number(user.id),
    });
  },

  async leaderboard() {
    if (!isSupabaseConfigured) {
      const player = readJson(DEMO_STORAGE_KEY, null);

      if (!player) return [];

      return [
        {
          rank: 1,
          telegram_id: player.telegram_id,
          name: player.first_name || player.username || 'Demo',
          username: player.username,
          coins: player.coins,
          level: player.level,
          tap_power: player.tap_power,
        },
      ];
    }

    const result = await callRpc('get_leaderboard', { p_limit: 25 });
    return Array.isArray(result) ? result : [];
  },

  async adminGrantCoins(adminPin, telegramId, amount) {
    if (!isSupabaseConfigured) {
      const player = readDemoPlayer({ id: Number(telegramId), firstName: 'Demo' });
      const result = localPayload(
        {
          ...player,
          coins: Math.max(0, Number(player.coins || 0) + Number(amount || 0)),
        },
        'Demo admin balance updated'
      );
      return result;
    }

    return callRpc('admin_grant_coins', {
      p_admin_pin: adminPin,
      p_telegram_id: Number(telegramId),
      p_amount: Number(amount),
    });
  },

  async adminResetPlayer(adminPin, telegramId) {
    if (!isSupabaseConfigured) {
      const player = defaultPlayer({ id: Number(telegramId), firstName: 'Demo' });
      return saveDemoResult({
        ok: true,
        message: 'Demo player reset',
        player,
        earned: 0,
        critical: false,
        nextLevelXp: nextLevelXp(player.level),
        upgradeCosts: getUpgradeCosts(player),
      });
    }

    return callRpc('admin_reset_player', {
      p_admin_pin: adminPin,
      p_telegram_id: Number(telegramId),
    });
  },
};
