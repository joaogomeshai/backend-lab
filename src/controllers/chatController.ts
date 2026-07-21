import { FastifyRequest, FastifyReply } from "fastify";
import { askQuestion } from "../services/chatService";

interface ChatRequest {
  question: string;
}

export async function chat(
  request: FastifyRequest<{ Body: ChatRequest }>,
  reply: FastifyReply
) {
  const { question } = request.body;

  if (!question || typeof question !== "string") {
    return reply.status(400).send({ error: "question is required" });
  }

  try {
    const answer = await askQuestion(question.trim());
    return reply.send({ answer });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    request.log.error("Chat error:", message);
    return reply.status(500).send({ error: "Failed to process question" });
  }
}
