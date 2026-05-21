import "dotenv/config";
import { app } from "./app";

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const hostname = "0.0.0.0";

const server = Bun.serve({
  port,
  hostname,
  fetch: app.fetch,
});

console.log(`🚀 Server running at http://${hostname}:${port}`);
