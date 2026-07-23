import Fastify from "fastify";
import cors from "@fastify/cors";
import { articleRoutes } from "./routes/articleRoutes";

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: "*" });

  await app.register(articleRoutes);

  const port = parseInt(process.env.PORT || "3001", 10);
  const host = process.env.HOST || "0.0.0.0";

  try {
    await app.listen({ port, host });
    console.log(`Backend running at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
