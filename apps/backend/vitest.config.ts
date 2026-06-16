import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: 'src',
    include: ['**/*.spec.ts'],
    exclude: ['**/*.e2e-spec.ts', 'node_modules'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.service.ts', 'src/**/*.guard.ts', 'src/**/*.pipe.ts'],
      exclude: ['node_modules', 'test'],
    },
  },
});
