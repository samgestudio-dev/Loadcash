import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: { allow: ['..'] }, // tokens live in ../tokens
    allowedHosts: ['.local'], // the Mac's fixed name (xxx.local) for phone testing
  },
});
