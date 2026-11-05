import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base: './' gera caminhos relativos no build, então o site funciona no
// GitHub Pages em qualquer endereço (usuario.github.io/<nome-do-repo>/)
// sem precisar configurar o nome do repositório.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
