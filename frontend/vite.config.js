import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({plugins:[react(),tailwindcss()],server:{proxy:{'/api':'http://localhost:8080'}},build:{target:'es2022',rollupOptions:{output:{manualChunks:id=>id.includes('node_modules')?'vendor':undefined}}}});
