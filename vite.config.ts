import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Warn if critical keys are missing in production build
  if (mode === 'production' && !env.API_KEY) {
    console.warn("⚠️  WARNING: API_KEY is not defined in environment variables.");
  }

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Supabase keys are usually auto-exposed if prefixed with VITE_, but explicit definition ensures compatibility if using process.env
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    server: {
      port: 3000,
    },
  };
});