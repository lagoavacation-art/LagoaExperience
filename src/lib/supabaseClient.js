import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gkhphchabrrxvastrkyp.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_kasq7letpyPu4RNhIQZWhQ_Mcx4rIxS';

if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: Supabase URL ou Key não definidos. Verifique as variáveis de ambiente.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
