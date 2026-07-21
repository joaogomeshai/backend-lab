import { FastifyInstance } from "fastify";
import * as articleController from "../controllers/articleController";

export async function articleRoutes(app: FastifyInstance) {
  app.get("/articles", articleController.getArticles);
  app.get("/articles/:slug", articleController.getArticleBySlug);
  app.get("/topics", articleController.getTopics);
  app.get("/health", articleController.getHealth);
}
