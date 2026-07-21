import { FastifyInstance } from "fastify";
import { chat } from "../controllers/chatController";

export async function chatRoutes(app: FastifyInstance) {
  app.post("/chat", chat);
}
