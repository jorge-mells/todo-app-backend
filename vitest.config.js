import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand'

dotenvExpand.expand(dotenv.config())

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    hookTimeout: 30000,
    maxConcurrency: 1,
    fileParallelism: false,
  }
});
