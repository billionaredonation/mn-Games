export const APP_NAME = import.meta.env.VITE_APP_NAME || 'WorkRush';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('YOUR_PROJECT_ID') &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')
);

export const DEMO_STORAGE_KEY = 'workrush-demo-player-v1';
export const DEMO_USER_STORAGE_KEY = 'workrush-demo-user-v1';

export const UPGRADE_META = {
  tap_power: {
    title: 'Power',
    subtitle: '+coins per work tap',
    icon: '⚡',
    statLabel: 'Power',
  },
  stamina_level: {
    title: 'Stamina',
    subtitle: '+max energy and faster regen',
    icon: '🔋',
    statLabel: 'Stamina',
  },
  focus_level: {
    title: 'Focus',
    subtitle: '+base income scaling',
    icon: '🎯',
    statLabel: 'Focus',
  },
  luck_level: {
    title: 'Luck',
    subtitle: '+critical work chance',
    icon: '🍀',
    statLabel: 'Luck',
  },
  passive_income_level: {
    title: 'Passive',
    subtitle: '+offline income per minute',
    icon: '🏦',
    statLabel: 'Passive',
  },
};

export const UPGRADE_KEYS = Object.keys(UPGRADE_META);
