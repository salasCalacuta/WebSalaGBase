import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder = (val: string) => 
  !val || 
  val.includes('your_supabase') || 
  val.includes('placeholder-') || 
  val === 'your_supabase_url' || 
  val === 'your_supabase_anon_key';

export const isSupabaseConfigured = !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

// Only initialize if we have the required keys, otherwise export a dummy or null
// to prevent the entire app from crashing on load.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-url.supabase.co', 
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase configuration missing or using placeholders! Data will only be saved locally.');
} else {
  console.log('✅ Supabase service initialized.');
}
