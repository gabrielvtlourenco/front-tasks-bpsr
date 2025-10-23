import { supabase } from './lib/supabaseClient'

async function testConnection() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (error) console.error('Erro ao conectar:', error)
  else console.log('Conectado ao Supabase ✅', data)
}

testConnection()