import {
  ensureRuntimeCities,
  loadGameDb,
  patchCityRuntime,
  resetGameDb,
  saveGameDb,
  setDbPath
} from './db/gameDb.js';
import {
  savePlayerToSupabase,
  syncPlayerFromSupabase
} from './db/playerRepository.js';

export let state = loadGameDb();
let remoteSyncQueue = Promise.resolve();

export function save() {
  saveGameDb(state);
}

export function getState() {
  return state;
}

export function setState(path, value) {
  setDbPath(state, path, value);
}

export function updateRuntime(cityId, patch) {
  patchCityRuntime(state, cityId, patch);
}

export function initRuntime() {
  ensureRuntimeCities(state);
}

export function resetState() {
  state = resetGameDb();
}

export async function initRemotePlayer() {
  try {
    await syncPlayerFromSupabase(state);
    save();
  } catch (error) {
    console.warn('Unable to load player from Supabase', error);
  }
}

export function syncPlayerRemote() {
  remoteSyncQueue = remoteSyncQueue
    .then(() => savePlayerToSupabase(state))
    .catch((error) => {
      console.warn('Unable to save player to Supabase', error);
    });

  return remoteSyncQueue;
}
