import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import packageJson from './package.json' with { type: 'json' };

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(packageJson.version) },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/api/**/*.{ts,tsx}',
        'src/config/**/*.ts',
        'src/lib/**/*.{ts,tsx}',
        'src/features/jobs/submissionSchemas.ts',
      ],
      exclude: ['src/test/**', 'src/**/*.d.ts'],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 65,
        statements: 75,
      },
    },
  },
});
