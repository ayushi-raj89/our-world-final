import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

// Local mock storage helpers in case Supabase is not configured yet
export const getLocalFallbackData = (key, initialData) => {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return initialData;
    }
  }
  return initialData;
};

export const setLocalFallbackData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};
