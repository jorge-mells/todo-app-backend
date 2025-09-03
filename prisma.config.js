import path from "node:path";
import { defineConfig } from "prisma/config";
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand'

dotenvExpand.expand(dotenv.config())

export default defineConfig({
  schema: path.join("src"),
  migrations: {
    path: path.join("src", "migrations"),
  },
});
