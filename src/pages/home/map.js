import { getState } from '../../state.js';

export default async function loadMap() {
  const { city } = getState();
  if (!city?.region) throw new Error('Город не выбран');

  // Vite подставит правильный URL (даже на GitHub Pages)
  const mod = await import(
    /* @vite-ignore */ `../../assets/maps/${city.region}.png`
  );
  return mod.default;
}
