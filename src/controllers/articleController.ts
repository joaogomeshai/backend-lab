import { FastifyRequest, FastifyReply } from "fastify";
import * as articleService from "../services/articleService";

export async function getArticles(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const articles = articleService.getAllArticles();
  return reply.send(articles);
}

export async function getArticleBySlug(
  request: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) {
  const article = articleService.getArticleBySlug(request.params.slug);
  if (!article) {
    return reply.status(404).send({ error: "Article not found" });
  }
  return reply.send(article);
}

export async function getTopics(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const topics = articleService.getAllTopics();
  return reply.send(topics);
}

export async function getHealth(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.send({ status: "ok", timestamp: new Date().toISOString() });
}
