import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ArticleCategory, ArticleWithAuthor } from "@/types";

type Client = SupabaseClient<Database>;

const ARTICLE_WITH_AUTHOR = "*, author:authors(id, name, avatar_url)";

/**
 * The article to lead the homepage: the most recent article marked
 * `featured`, falling back to the most recent published article so the
 * hero is never empty.
 */
export async function getFeaturedArticle(
  supabase: Client
): Promise<ArticleWithAuthor | null> {
  const { data: featured } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR)
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (featured) return featured as unknown as ArticleWithAuthor;

  const { data: fallback } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return fallback as unknown as ArticleWithAuthor | null;
}

export async function getLatestArticles(
  supabase: Client,
  limit = 4,
  excludeId?: string
): Promise<ArticleWithAuthor[]> {
  let query = supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query;
  return (data ?? []) as unknown as ArticleWithAuthor[];
}

export async function getArticlesByCategory(
  supabase: Client,
  category: ArticleCategory,
  limit = 6
): Promise<ArticleWithAuthor[]> {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR)
    .eq("status", "published")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as ArticleWithAuthor[];
}

/** Paginated category listing — used by the /[category] page so the archive doesn't hard-cap at one page. */
export async function getArticlesByCategoryPage(
  supabase: Client,
  category: ArticleCategory,
  page: number,
  pageSize = 12
): Promise<{ articles: ArticleWithAuthor[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR, { count: "exact" })
    .eq("status", "published")
    .eq("category", category)
    .order("published_at", { ascending: false })
    .range(from, to);

  return { articles: (data ?? []) as unknown as ArticleWithAuthor[], total: count ?? 0 };
}

/** One published-article page per category, fetched in parallel for the homepage. */
export async function getHomepageSections(
  supabase: Client,
  categories: ArticleCategory[],
  perSection = 4
): Promise<Record<ArticleCategory, ArticleWithAuthor[]>> {
  const results = await Promise.all(
    categories.map((category) =>
      getArticlesByCategory(supabase, category, perSection)
    )
  );

  return categories.reduce(
    (acc, category, i) => {
      acc[category] = results[i];
      return acc;
    },
    {} as Record<ArticleCategory, ArticleWithAuthor[]>
  );
}

export async function getArticlesByAuthor(
  supabase: Client,
  authorId: string,
  limit = 24
): Promise<ArticleWithAuthor[]> {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR)
    .eq("status", "published")
    .eq("author_id", authorId)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as ArticleWithAuthor[];
}

export async function getArticleBySlug(
  supabase: Client,
  slug: string,
  { publicOnly = true }: { publicOnly?: boolean } = {}
): Promise<ArticleWithAuthor | null> {
  let query = supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR)
    .eq("slug", slug);

  if (publicOnly) query = query.eq("status", "published");

  const { data } = await query.maybeSingle();
  return data as unknown as ArticleWithAuthor | null;
}

export async function getRelatedArticles(
  supabase: Client,
  category: ArticleCategory,
  excludeId: string,
  limit = 3
): Promise<ArticleWithAuthor[]> {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR)
    .eq("status", "published")
    .eq("category", category)
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as ArticleWithAuthor[];
}

export async function searchArticles(
  supabase: Client,
  query: string,
  limit = 20
): Promise<ArticleWithAuthor[]> {
  if (!query.trim()) return [];

  const normalizedTag = query.trim().toLowerCase();

  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR)
    .eq("status", "published")
    .or(`search_vector.wfts.${query},tags.cs.{${normalizedTag}}`)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as ArticleWithAuthor[];
}

/** Paginated tag listing — /tags/[tag]. Tags are stored lowercase. */
export async function getArticlesByTagPage(
  supabase: Client,
  tag: string,
  page: number,
  pageSize = 12
): Promise<{ articles: ArticleWithAuthor[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR, { count: "exact" })
    .eq("status", "published")
    .contains("tags", [tag.toLowerCase()])
    .order("published_at", { ascending: false })
    .range(from, to);

  return { articles: (data ?? []) as unknown as ArticleWithAuthor[], total: count ?? 0 };
}

// ---- Newsroom (requires an authenticated session — RLS enforces the rest) ----

export async function getNewsroomArticles(
  supabase: Client
): Promise<ArticleWithAuthor[]> {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR)
    .order("updated_at", { ascending: false });

  return (data ?? []) as unknown as ArticleWithAuthor[];
}

/** Paginated newsroom article list — same shape as the public category pagination. */
export async function getNewsroomArticlesPage(
  supabase: Client,
  page: number,
  pageSize = 20
): Promise<{ articles: ArticleWithAuthor[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  return { articles: (data ?? []) as unknown as ArticleWithAuthor[], total: count ?? 0 };
}

export async function getArticleById(
  supabase: Client,
  id: string
): Promise<ArticleWithAuthor | null> {
  const { data } = await supabase
    .from("articles")
    .select(ARTICLE_WITH_AUTHOR)
    .eq("id", id)
    .maybeSingle();

  return data as unknown as ArticleWithAuthor | null;
}

export async function getDashboardStats(supabase: Client) {
  const nowIso = new Date().toISOString();
  const [
    { count: published },
    { count: scheduled },
    { count: drafts },
    { count: inReview },
    { count: newTips },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .lte("published_at", nowIso),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gt("published_at", nowIso),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "reviewing"),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return {
    published: published ?? 0,
    scheduled: scheduled ?? 0,
    drafts: drafts ?? 0,
    inReview: inReview ?? 0,
    newTips: newTips ?? 0,
  };
}
