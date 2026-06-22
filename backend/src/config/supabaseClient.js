const { createClient } = require('@supabase/supabase-js');

// Ya no hace falta requerir dotenv acá porque server.js ya lo hizo por todo el proyecto
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Cambiamos el nombre para que coincida EXACTAMENTE con tu .env
const supabaseKey = process.env.VITE_SUPABASE_SECRET;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Cliente de Supabase inicializado correctamente.');
} else {
  console.warn('Faltan las credenciales de Supabase en el .env');
}

module.exports = supabase;