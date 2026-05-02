const SUPABASE_URL = 'https://ffdmajcvgpsakqopnxfn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EDJ1ReyqQF5_mVUZ5rwiMQ_2HoJEPNU';

function makeUrl(path) {
  return SUPABASE_URL.replace(/\/$/, '') + path;
}

export async function supabaseRequest(path, options = {}) {
  const response = await fetch(makeUrl(path), {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error('Supabase error ' + response.status + ': ' + message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
