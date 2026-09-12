# The Modernist

**The independent student publication of MDIS.**

A real student-journalism publication: a premium editorial public site backed by a
lightweight newsroom CMS. Built with Next.js (App Router), TypeScript, Tailwind CSS,
and Supabase (Postgres, Auth, Storage).

Publishing an article in the newsroom updates the public site automatically — nothing
is hardcoded, and there's no separate "deploy the content" step.

---

## 1. What's already running

A live Supabase project has been created and seeded for you:

- **Project:** "The Modernist" (`nitdwtisckhszwvsloek`, region `ap-south-1`)
- **Schema:** `articles`, `authors`, `profiles`, `submissions`, full RLS policies, a
  `media` storage bucket, and triggers that enforce the publish workflow (see §4).
- **Seed data:** ~10 published articles across all 6 categories (matching §19 of the
  brief) plus a few sample story tips, so the site isn't empty on first run.
- `.env.local` is already filled in with this project's URL and anon key — you can run
  the app immediately.

## 2. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the public site.

## 3. Create your first newsroom account

There's deliberately no public sign-up page for the newsroom — accounts are provisioned
by hand, the same way you'd provision access to any internal tool:

1. In the [Supabase dashboard](https://supabase.com/dashboard/project/nitdwtisckhszwvsloek) →
   **Authentication → Users → Add user**, create a user with an email + password.
   (A `profiles` row is created for them automatically, with role `reporter`.)
2. Promote them to editor so they can publish/archive, by running this in the
   **SQL Editor**:
   ```sql
   update public.profiles set role = 'editor'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
3. Sign in at `/newsroom/login`. Forgot your password later? Use the **Forgot
   password?** link on that page — see §9 for how the reset email is sent.

`reporter` accounts can create and edit their own drafts. Only `editor` accounts can
publish or archive an article — this is enforced by a database trigger, not just the
UI, so it holds even if someone calls the API directly.

## 4. How the publish workflow is enforced

- Articles have three states: `draft`, `published`, `archived`. Only `published`
  articles are ever readable by anonymous visitors (enforced by Row Level Security,
  not app logic).
- A Postgres trigger (`handle_article_status`) stamps `published_at` the moment an
  article first becomes published, and blocks non-editors from setting `published` or
  `archived` — so "only editors can publish" can't be bypassed.
- Submitting the article editor's **Save Draft** / **Publish** buttons calls the same
  server action with a different `status`; there's no separate "push to production"
  step because the public site reads directly from the same `articles` table.

## 5. Project structure

```
app/
  (public)/            # public site — wrapped in Header + Footer
    page.tsx            # homepage: hero, latest updates, per-category sections
    [category]/          # news, sports, campus, features, opinion, achievements
      page.tsx
      [slug]/page.tsx     # article page
    submit/               # public story-tip form
    search/               # site search
  newsroom/
    login/                # public — outside the auth-gated shell
    (dashboard)/          # everything below requires a session (see middleware.ts)
      page.tsx             # overview / stats
      articles/            # list, new, edit
      submissions/         # review tips, convert to draft
      media/               # media library

components/    # Header, Footer, ArticleCard, ArticleEditor, RichTextEditor, ...
lib/
  supabase/    # browser + server Supabase clients
  queries/     # all data-fetching, shared by public pages and the newsroom
  actions/     # server actions: auth, article CRUD/publish, submission workflow
  utils/       # reading time, relative dates, slugify, content rendering
types/         # generated Database types + app-level convenience types
middleware.ts  # redirects unauthenticated visitors away from /newsroom/*
```

## 6. Notes on a few deliberate choices

- **One dynamic `[category]` route** covers `/news`, `/sports`, `/campus`,
  `/features`, `/opinion`, and `/achievements` rather than six near-identical folders —
  same routes the brief asked for, less duplication.
- **Article body** is stored as HTML produced by the newsroom's rich-text editor
  (Tiptap). The seed articles are stored as plain text and rendered through a small
  compatibility helper (`lib/utils/content.ts`) so both look identical on the page.
- **The "Get the latest" newsletter box** on the homepage is presentational only (it
  matches the reference design) — there's no email-sending backend wired up, since
  that wasn't part of the specified schema. Easy to wire up later if you want it.
- **Cover/body images** for the seeded articles use Lorem Picsum placeholder photos —
  swap them for real photography via the newsroom's cover-image upload or the Media
  library whenever you're ready.

## 7. What's next (not built in this pass)

Everything in the brief's "Final Success Test" (§29) works end to end, plus the V2
additions below. A few polish items are left for you or a follow-up session:

- Image optimization/CDN tuning beyond Next's built-in `<Image>` handling.
- A dedicated "reject reason" or audit trail on submissions (status changes are
  tracked, but not who made them).
- Real email delivery for the newsletter box, if you want to keep it.

## 8. Deploying

This is a standard Next.js app — deploys to Vercel with zero config. Add
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.local`) as
environment variables on whatever platform you deploy to, and set
`NEXT_PUBLIC_SITE_URL` to your real domain so the sitemap generates correct URLs.

## 9. V2 additions

Everything below was added after the initial V1 build, closing gaps a production
newsroom would actually hit:

- **Authors page** (`/newsroom/authors`) — add, edit, and remove bylines (with avatar
  upload) without touching SQL. Previously the article editor could only pick from
  authors that already existed in the database.
- **Password reset** — "Forgot password?" on the login page sends a reset email via
  Supabase Auth's built-in email sending, through `/auth/callback` (which exchanges the
  recovery code for a session) to `/newsroom/reset-password`. Supabase's built-in email
  is rate-limited and fine for a school-scale newsroom; if you outgrow it, add a custom
  SMTP provider under **Project Settings → Auth → SMTP Settings** — no app code changes
  needed.
- **Delete article** — editors can permanently remove an article from its edit page
  (with a confirmation prompt). Previously the only way to remove one was archiving.
- **Author byline pages** (`/authors/[id]`) — clicking a byline anywhere on the site
  shows that author's bio and full list of published stories.
- **RSS feed** at `/feed.xml` (linked from page metadata for feed reader discovery).
- **NewsArticle structured data** (JSON-LD) on every article page, for search engines.
- **Pagination** — both the public category pages and the newsroom's article list now
  page through results (12 and 20 per page) instead of hard-capping at a fixed count.
- **Toast notifications** — upload/save errors now show a dismissible toast instead of
  a browser `alert()` popup. This also fixed a real bug: the Media library was
  swallowing upload failures silently.
- **Single-featured-article enforcement** — a database trigger now guarantees only one
  article can be marked `featured` at a time; marking a new one automatically
  un-features the last.
- **Basic spam protection** on the public story-tip form — a hidden honeypot field
  that's invisible to real visitors but often filled in by bots, which silently
  short-circuits the submission.

## 10. V3 additions — scheduled publishing & tags

- **Scheduled publishing** — the article editor now has a "Publish date & time"
  field (editors only). Leave it blank to publish immediately; set a future date and
  the article goes live automatically at that moment — **no cron job or scheduled
  function required**. This works because the public read policy (Row Level Security)
  checks `published_at <= now()` on every request, so a "published" article with a
  future timestamp is simply invisible to the public until that moment passes, then
  becomes visible on its own. The newsroom dashboard and article list show a distinct
  **Scheduled** badge (instead of Published) for anything still in the future.
- **Tags** — a free-form, comma-separated tag field alongside the fixed category.
  Tags power a new public route, `/tags/[tag]`, that lists everything with that tag
  across categories (e.g. a "coding-club" tag could span both Campus and Features).
  Tags are included in site search and the sitemap. Tags are stored lowercase
  automatically.
- The article editor's Save buttons were also reorganized while adding these: a
  published or archived article now gets a **Save Changes** button that persists
  edits (including tag changes or rescheduling) without touching its status — clicking
  "Save Draft" on a published article no longer accidentally unpublishes it.

**One known limitation:** if a signed-in newsroom staff member browses the *public*
site (not `/newsroom`) while logged in, they'll currently see scheduled/not-yet-live
articles too, since the RLS policy can't distinguish "staff browsing the newsroom" from
"staff browsing the public site with the same session." This isn't a security hole
(only staff accounts can see it), just a minor UX quirk worth knowing about — use a
private/incognito window if you want to preview exactly what the public sees.
