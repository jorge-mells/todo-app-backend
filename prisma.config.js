import path from "node:path";
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("src"),
  migrations: {
    path: path.join("src", "migrations"),
  },
});
