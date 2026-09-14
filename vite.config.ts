import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'src/main/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'electron-store', 'child_process', 'koffi']
            }
          }
        }
      },
      preload: {
        input: 'src/main/preload.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
          }
        }
      },
      renderer: {}
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer')
    }
  }
});
