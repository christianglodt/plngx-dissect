import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const fullEnv = loadEnv('development', '..', '');

const PATH_PREFIX = fullEnv.PATH_PREFIX || '';
const API_PATH = PATH_PREFIX + '/api';

const PROXY_CONFIG = {};
PROXY_CONFIG[API_PATH] = {
  target: 'http://localhost:8000',
  changeOrigin: true,
  //rewrite: (path) => path.replace(/^\/api/, ''),
};

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    proxy: PROXY_CONFIG
  },
  envDir: '..',
  define: {
    'import.meta.env.PATH_PREFIX': JSON.stringify(PATH_PREFIX)
  },
  build: {
    manifest: true
  },
})
