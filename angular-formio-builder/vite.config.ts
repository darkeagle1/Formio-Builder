import { defineConfig } from 'vite';

export default defineConfig({
  // Configuración mínima para evitar errores de SSR
  define: {
    global: 'globalThis',
  },
  ssr: {
    // Excluir completamente estas dependencias del SSR
    external: ['dragula', '@formio/js', '@formio/angular']
  },
  optimizeDeps: {
    // Excluir estas dependencias de la optimización
    exclude: ['dragula', '@formio/js', '@formio/angular']
  }
});
