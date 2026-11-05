import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  // `npm run build:arquivo` gera um ÚNICO arquivo HTML (JS, CSS e fontes
  // embutidos) em dist-arquivo/, que abre com dois cliques, sem servidor.
  const singleFile = mode === 'arquivo';

  return {
    // base: './' gera caminhos relativos, então o site funciona no GitHub
    // Pages em qualquer endereço (usuario.github.io/<nome-do-repo>/).
    base: './',
    plugins: [react(), tailwindcss(), ...(singleFile ? [viteSingleFile()] : [])],
    build: singleFile ? { outDir: 'dist-arquivo' } : undefined,
  };
});
