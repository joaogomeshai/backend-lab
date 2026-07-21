import { GoogleGenerativeAI } from "@google/generative-ai";
import { articles } from "../data/articles";

function buildContext(): string {
  return articles
    .map((a) => `--- ${a.title} ---\n${a.content}`)
    .join("\n\n");
}

export async function askQuestion(question: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "GEMINI_API_KEY not configured. Set it as an environment variable.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const context = buildContext();
  const prompt = `You are a tutor for the Multi-Project Pipeline Lab.
Answer the question using ONLY the articles below.
If the answer is not in the articles, say "I don't know based on the available content."
Keep answers concise and technical.

Articles:
${context}

Question: ${question}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
