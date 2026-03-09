
import { createClient } from '@supabase/supabase-js';

// Configuración de la conexión a la base de datos.
// Para producción en Hostinger, define las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
// en el panel de control de tu hosting o en el archivo .env del servidor.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hxnrpyftwzvcxnkmzgvy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_XJV4Hkxd1eCS35FNiVqAyA_6s8GNjN1';

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Advertencia: No se han detectado las credenciales de Supabase. La aplicación podría no conectarse a la base de datos.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
