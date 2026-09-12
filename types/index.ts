import type { Tables } from "@/types/database";

export type Article = Tables<"articles">;
export type Author = Tables<"authors">;
export type Profile = Tables<"profiles">;
export type Submission = Tables<"submissions">;

export type ArticleCategory = Article["category"];
export type ArticleStatus = Article["status"];

/** An article joined with its byline author — the shape most queries return. */
export type ArticleWithAuthor = Article & {
  author: Pick<Author, "id" | "name" | "avatar_url"> | null;
};

export const CATEGORIES: {
  value: ArticleCategory;
  label: string;
  navLabel: string;
}[] = [
  { value: "news", label: "News", navLabel: "News" },
  { value: "sports", label: "Sports", navLabel: "Sports" },
  { value: "campus", label: "Campus", navLabel: "Campus" },
  { value: "features", label: "Features", navLabel: "Features" },
  { value: "opinion", label: "Opinion", navLabel: "Opinion" },
  { value: "achievements", label: "Achievements", navLabel: "Achievements" },
];

export function isArticleCategory(value: string): value is ArticleCategory {
  return CATEGORIES.some((c) => c.value === value);
}

export function categoryLabel(category: ArticleCategory): string {
  return CATEGORIES.find((c) => c.value === category)?.label ?? category;
}
