/**
 * Article `content` is normally HTML produced by the newsroom rich-text
 * editor. Seed/plain-text content (no tags) is converted to paragraphs so
 * both render identically through `.article-prose`.
 */
export function articleContentHtml(content: string): string {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content);
  if (looksLikeHtml) return content;

  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
