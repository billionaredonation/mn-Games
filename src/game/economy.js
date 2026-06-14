export function nextLevelXp(level) {
  return 100 + Math.max(1, Number(level || 1)) * 50;
}

export function upgradeCost(key, currentLevel) {
  const level = Math.max(1, Number(currentLevel || 1));
  const table = {
    tap_power: [40, 1.55],
    stamina_level: [60, 1.5],
    focus_level: [90, 1.58],
    luck_level: [120, 1.65],
    passive_income_level: [180, 1.72],
  };

  const [base, multiplier] = table[key] || [999999, 2];
  return Math.ceil(base * Math.pow(multiplier, level - 1));
}

export function getUpgradeCosts(player) {
  return {
    tap_power: upgradeCost('tap_power', player.tap_power),
    stamina_level: upgradeCost('stamina_level', player.stamina_level),
    focus_level: upgradeCost('focus_level', player.focus_level),
    luck_level: upgradeCost('luck_level', player.luck_level),
    passive_income_level: upgradeCost('passive_income_level', player.passive_income_level),
  };
}

export function applyTimers(player, nowMs = Date.now()) {
  const lastMs = new Date(player.last_energy_at || nowMs).getTime();
  const minutes = Math.max(0, Math.floor((nowMs - lastMs) / 60000));

  const maxEnergy = 100 + Math.max(0, player.stamina_level - 1) * 10;

  if (minutes <= 0) {
    return {
      ...player,
      max_energy: maxEnergy,
    };
  }

  const energyGain = Math.max(
    1,
    Math.floor(minutes * (1 + Math.max(0, player.stamina_level - 1) * 0.15))
  );
  const passiveGain = Math.floor(minutes * Math.max(0, player.passive_income_level - 1) * 0.25);

  return {
    ...player,
    coins: Number(player.coins || 0) + passiveGain,
    energy: Math.min(maxEnergy, Number(player.energy || 0) + energyGain),
    max_energy: maxEnergy,
    last_energy_at: new Date(nowMs).toISOString(),
  };
}

export function defaultPlayer(user) {
  return {
    id: crypto.randomUUID?.() || String(Date.now()),
    telegram_id: user.id,
    username: user.username || null,
    first_name: user.firstName || 'Demo',
    coins: 0,
    energy: 100,
    max_energy: 100,
    level: 1,
    xp: 0,
    tap_power: 1,
    stamina_level: 1,
    focus_level: 1,
    luck_level: 1,
    passive_income_level: 1,
    last_energy_at: new Date().toISOString(),
    last_daily_bonus_on: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function tapPlayer(player) {
  let next = applyTimers(player);

  if (next.energy <= 0) {
    return {
      ok: false,
      message: 'No energy. Wait for regeneration.',
      player: next,
      earned: 0,
      critical: false,
      nextLevelXp: nextLevelXp(next.level),
      upgradeCosts: getUpgradeCosts(next),
    };
  }

  const baseIncome = next.tap_power + Math.floor(Math.max(0, next.focus_level - 1) * 0.65);
  const critChance = Math.min(0.3, Math.max(0, next.luck_level - 1) * 0.025);
  const critical = Math.random() < critChance;
  const earned = critical ? Math.floor(baseIncome * 2.5) : Math.floor(baseIncome);

  let xp = next.xp + 5;
  let level = next.level;
  let levelBonus = 0;

  while (xp >= nextLevelXp(level)) {
    xp -= nextLevelXp(level);
    level += 1;
    levelBonus += 25 * level;
  }

  next = {
    ...next,
    coins: Number(next.coins || 0) + earned + levelBonus,
    energy: Math.max(0, next.energy - 1),
    xp,
    level,
    updated_at: new Date().toISOString(),
  };

  return {
    ok: true,
    message: levelBonus > 0 ? 'Level up bonus included' : 'Work completed',
    player: next,
    earned: earned + levelBonus,
    critical,
    nextLevelXp: nextLevelXp(next.level),
    upgradeCosts: getUpgradeCosts(next),
  };
}

export function buyLocalUpgrade(player, key) {
  let next = applyTimers(player);
  const currentLevel = Number(next[key] || 1);

  if (currentLevel >= 20) {
    return {
      ok: false,
      message: 'Upgrade is already maxed',
      player: next,
      earned: 0,
      critical: false,
      nextLevelXp: nextLevelXp(next.level),
      upgradeCosts: getUpgradeCosts(next),
    };
  }

  const cost = upgradeCost(key, currentLevel);

  if (Number(next.coins || 0) < cost) {
    return {
      ok: false,
      message: 'Not enough coins',
      player: next,
      earned: 0,
      critical: false,
      nextLevelXp: nextLevelXp(next.level),
      upgradeCosts: getUpgradeCosts(next),
    };
  }

  next = {
    ...next,
    coins: Number(next.coins || 0) - cost,
    [key]: currentLevel + 1,
    updated_at: new Date().toISOString(),
  };

  if (key === 'stamina_level') {
    next.max_energy = 100 + Math.max(0, next.stamina_level - 1) * 10;
  }

  return {
    ok: true,
    message: 'Upgrade purchased',
    player: next,
    earned: 0,
    critical: false,
    nextLevelXp: nextLevelXp(next.level),
    upgradeCosts: getUpgradeCosts(next),
  };
}

export function claimLocalDaily(player) {
  let next = applyTimers(player);
  const today = new Date().toISOString().slice(0, 10);

  if (next.last_daily_bonus_on === today) {
    return {
      ok: false,
      message: 'Daily bonus already claimed',
      player: next,
      earned: 0,
      critical: false,
      nextLevelXp: nextLevelXp(next.level),
      upgradeCosts: getUpgradeCosts(next),
    };
  }

  const bonus = 250 + next.level * 10;

  next = {
    ...next,
    coins: Number(next.coins || 0) + bonus,
    last_daily_bonus_on: today,
    updated_at: new Date().toISOString(),
  };

  return {
    ok: true,
    message: 'Daily bonus claimed',
    player: next,
    earned: bonus,
    critical: false,
    nextLevelXp: nextLevelXp(next.level),
    upgradeCosts: getUpgradeCosts(next),
  };
}
