
import { createClient } from '@supabase/supabase-js';

// Datos oficiales del proyecto CEIE
const supabaseUrl = 'https://hxnrpyftwzvcxnkmzgvy.supabase.co';
const supabaseKey = 'sb_publishable_XJV4Hkxd1eCS35FNiVqAyA_6s8GNjN1';

export const supabase = createClient(supabaseUrl, supabaseKey);
