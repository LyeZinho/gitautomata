import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@/core': '/src/core',
      '@/automations': '/src/automations',
      '@/server': '/src/server',
      '@/utils': '/src/utils'
    }
  }
});