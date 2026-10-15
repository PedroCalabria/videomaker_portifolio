import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // NEXT_PUBLIC_* vem da integração Supabase da Vercel. Nunca adicione um prefixo
  // que case com segredos (SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET...).
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
});
