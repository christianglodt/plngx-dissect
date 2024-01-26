import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const fullEnv = loadEnv('development', '..', '');

const PATH_PREFIX = fullEnv.VITE_PATH_PREFIX || '';

const API_PATH = PATH_PREFIX + '/api';

const PROXY_CONFIG = {};
PROXY_CONFIG[API_PATH] = {
  target: 'http://127.0.0.1:8000',
  changeOrigin: true,
  //rewrite: (path) => path.replace(/^\/api/, ''),
};

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: PROXY_CONFIG
  },
  envDir: '..',
  build: {
    manifest: true
  },
})
