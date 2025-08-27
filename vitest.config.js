import { defineConfig } from 'vitest/config';
import 'dotenv/config';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
    hookTimeout: 30000,
    maxConcurrency: 1,
    fileParallelism: false,
  }
});
