import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder = (url: string, key: string) => {
  const isDefault = url.includes('your-project-id') || key.includes('your-anon-key') || !url || !key;
  const isInvalid = !url.startsWith('https://');
  return isDefault || isInvalid;
};

if (isPlaceholder(supabaseUrl, supabaseAnonKey)) {
  console.warn('Supabase configuration is missing or invalid. Please check your environment variables in the Secrets panel.');
  console.log('Current URL:', supabaseUrl);
}

// Only initialize if we have the required credentials and they aren't placeholders
export const supabase = !isPlaceholder(supabaseUrl, supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
