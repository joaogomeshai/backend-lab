import { describe, it, expect } from "vitest";
import * as articleService from "../services/articleService";

describe("articleService", () => {
  it("should return all articles", () => {
    const articles = articleService.getAllArticles();
    expect(articles.length).toBeGreaterThan(0);
  });

  it("should find article by slug", () => {
    const article = articleService.getArticleBySlug("what-is-multi-project-pipeline");
    expect(article).toBeDefined();
    expect(article?.title).toBe("What is a Multi-Project Pipeline");
  });

  it("should return undefined for unknown slug", () => {
    const article = articleService.getArticleBySlug("non-existent");
    expect(article).toBeUndefined();
  });

  it("should return all topics", () => {
    const topics = articleService.getAllTopics();
    expect(topics.length).toBeGreaterThan(0);
    expect(topics[0]).toHaveProperty("name");
    expect(topics[0]).toHaveProperty("slug");
  });
});
