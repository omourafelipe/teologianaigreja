import { createClient } from "@supabase/supabase-js";
import process from "node:process";

// As variáveis de ambiente do servidor são lidas per-request.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ [Supabase CONFIG WARNING]: As variáveis SUPABASE_URL e SUPABASE_ANON_KEY não foram encontradas no ambiente. A plataforma funcionará em modo fallback local (dados salvos em memória no servidor).",
  );
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null;
