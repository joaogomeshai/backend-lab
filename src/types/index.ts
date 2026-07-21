export interface Article {
  id: number;
  slug: string;
  title: string;
  content: string;
  topic: string;
}

export interface Topic {
  name: string;
  slug: string;
  description: string;
}
