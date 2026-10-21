import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Same alias as tsconfig.json "paths".
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**'],
    // Tests arrive with lib/format (F0-4); until then `npm test` must not fail on an empty suite.
    passWithNoTests: true,
  },
});
