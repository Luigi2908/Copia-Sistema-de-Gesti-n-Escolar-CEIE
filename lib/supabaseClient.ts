import { createClient } from '@supabase/supabase-js';

// Conexión desactivada / Modo Local
const supabaseUrl = '';
const supabaseKey = '';

// Exportamos un cliente dummy o null, ya que no se usará.
// Para evitar errores de tipado en archivos que aún lo importen, lo dejamos como any o mock.
export const supabase = {
    from: () => ({ select: () => ({ data: [], error: null }) }),
    auth: {
        signUp: () => ({ data: { user: null }, error: null }),
        signInWithPassword: () => ({ data: { user: null }, error: null }),
        signOut: () => ({ error: null }),
        getSession: () => ({ data: { session: null } }),
        updateUser: () => ({ error: null }),
        resetPasswordForEmail: () => ({ error: null })
    }
} as any;