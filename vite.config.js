import { createHash } from 'node:crypto';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Archivos de public/ que también se guardan para leer sin conexión (HU-12.1-A).
const PUBLIC_FILES = ['/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png'];

// Lista de precarga para el service worker escrito a mano (HT-06.2-A, HU-12.2-A; sin vite-plugin-pwa
// ni Workbox, CLAUDE.md §4). En cada build escribe dist/precache-manifest.json con:
// - `urls`: la portada y todos los archivos del build (con hash en el nombre) más los de PUBLIC_FILES;
// - `version`: un hash de esa lista. Si cambia cualquier archivo, cambia la versión y el service
//   worker crea una caché nueva y borra la anterior (HT-06.2-B: una versión vieja no persiste).
function precacheManifest() {
  return {
    name: 'tamalecho-precache-manifest',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const built = Object.keys(bundle)
        .filter((file) => !file.endsWith('.map') && file !== 'index.html')
        .map((file) => `/${file}`)
        .sort();
      const urls = ['/', ...built, ...PUBLIC_FILES];
      const version = createHash('sha256').update(urls.join('\n')).digest('hex').slice(0, 12);
      this.emitFile({
        type: 'asset',
        fileName: 'precache-manifest.json',
        source: `${JSON.stringify({ version, urls }, null, 2)}\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), precacheManifest()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/unit/**/*.test.{js,jsx}'],
  },
});
