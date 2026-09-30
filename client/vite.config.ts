import path from 'node:path';

import legacy from '@vitejs/plugin-legacy';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

// Oldest browser we intentionally support.
const LEGACY_TARGETS = ['safari >= 12'];

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname);
  return {
    // esbuild downlevels the modern (ESM) bundle's syntax. Safari 12 supports
    // <script type="module"> and therefore loads the modern bundle, so it must
    // be transpiled down to Safari 12 as well — not just the nomodule fallback.
    build: {
      target: ['safari12'],
    },
    plugins: [
      tailwindcss(),
      svelte(),
      // Emits a nomodule SystemJS fallback for browsers without ESM support and,
      // via modernPolyfills, injects the core-js polyfills Safari 12 needs into
      // the modern bundle it actually loads.
      legacy({
        targets: LEGACY_TARGETS,
        modernTargets: LEGACY_TARGETS,
        modernPolyfills: true,
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET ?? 'http://localhost:8000/',
          changeOrigin: true,
        },
        '/feed': {
          target: env.VITE_API_PROXY_TARGET ?? 'http://localhost:8000/',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '$lib': path.resolve(__dirname, './src/lib')
      }
    }
  };
});
