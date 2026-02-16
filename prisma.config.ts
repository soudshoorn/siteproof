import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Session pooler for migrations (direct connection niet bereikbaar op IPv4)
    url: process.env["DIRECT_URL"],
  },
});
