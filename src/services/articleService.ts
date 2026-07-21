import { articles } from "../data/articles";
import { Article } from "../types";

export function getAllArticles(): Article[] {
  return articles;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getAllTopics(): { name: string; slug: string; description: string }[] {
  const topicMap = new Map<string, { name: string; slug: string; description: string }>();
  for (const article of articles) {
    if (!topicMap.has(article.topic)) {
      topicMap.set(article.topic, {
        name: article.topic,
        slug: article.topic.toLowerCase().replace(/\s+/g, "-"),
        description: `Articles about ${article.topic}`,
      });
    }
  }
  return Array.from(topicMap.values());
}
