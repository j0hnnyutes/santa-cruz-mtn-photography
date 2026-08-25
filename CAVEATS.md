# Caveats, gotchas, and nuances

Things discovered while building this that aren't obvious from reading the
code cold. Read this before making infra/auth/routing changes.

## Local dev vs. deployed — env vars

**The bcrypt password hash breaks under `next dev` locally, but works fine
deployed.** Next's local `.env.local` loader (`@next/env`, built on
dotenv-expand) treats `$...` sequences as variable references to expand —
and a bcrypt hash is nothing but `$`-delimited segments
(`$2b$12$1E/D/ocR7zT...`), so it gets silently mangled when read from the
file. On Vercel, env vars are injected directly into `process.env` at
runtime with no file parsing involved, so **production and preview
deployments are unaffected** — only `next dev` reading `.env.local` breaks.

**Don't chase this by escaping `$` in the file** — `$$` escaping is
inconsistent with dotenv-expand's parser here and made it worse in testing.
If you need to verify admin login, do it against a deployed preview
(`vercel deploy`, then curl or click through it), not `next dev`.

## Vercel project config

**The project's "Framework Preset" was stuck on `null`/Other**, left over
from when this repo was a plain static site (before the admin backend
existed). Even though `next build` succeeded and listed all the routes
correctly, deployments 404'd on every dynamic route (`/api/*`, `/admin/*`,
`/robots.txt`, `/sitemap.xml`) while the static-rewritten pages (`/`,
`/about/`, `/gallery/`) worked fine — Vercel's edge router wasn't invoking
Next's serverless functions at all. Fixed by explicitly `PATCH`-ing the
project's `framework` to `"nextjs"` via the Vercel API. If dynamic routes
ever start 404ing again on a fresh deployment, check this first.

## Static assets can't live under `/admin/`

The proxy's auth matcher is `/admin/:path*`, which catches *everything*
under that path — including static files. `admin.css` originally lived at
`public/admin/admin.css` and got caught by the matcher too: unauthenticated
requests for the CSS itself were redirected to the login page (as HTML),
so the login page rendered completely unstyled. Moved to
`public/admin-assets/admin.css` instead. Any future static asset for the
admin UI needs to live outside `/admin/` for the same reason.

## `middleware.ts` is `proxy.ts` now

Next 16.3 renamed the middleware convention; this project uses the new
`proxy.ts` file (exporting a `proxy()` function instead of `middleware()`).
The `@next/codemod middleware-to-proxy` codemod did this migration and also
dropped the explicit `export const runtime = "nodejs"` line — this still
works (confirmed via real login attempts against deployed previews;
`proxy.ts` uses Node's `crypto` module for HMAC session verification, which
needs the Node runtime, not Edge), but if a future Next upgrade changes the
default runtime for `proxy.ts`, session verification would break silently.
Worth a quick login test after any Next.js version bump.

## trailingSlash + API routes

`next.config.ts` sets `trailingSlash: true` (needed so `/about`, `/gallery`
etc. canonicalize with a trailing slash, matching how the static pages'
internal links are written). This setting is global — it also redirects
`/api/photos` → `/api/photos/`. Fetch calls to any API route **must**
include the trailing slash directly (`fetch("/api/photos/")`, not
`fetch("/api/photos")`) to avoid an unnecessary redirect hop. All current
fetch calls in the codebase already do this — keep it that way if adding
new ones.

## Route handlers can go static without warning

`app/sitemap.xml/route.ts` queries the DB but has no per-request dynamic
API usage (no `cookies()`/`headers()` calls), so Next silently prerendered
it *once at build time* and served that frozen snapshot forever — new
photos uploaded via `/admin` wouldn't show up in the sitemap until the next
deploy. Fixed with `export const dynamic = "force-dynamic"`. Interestingly
`app/api/photos/route.ts` (same pattern: DB query, no dynamic APIs) was
*not* auto-statified — the difference isn't fully understood; if you add a
new route handler that reads from the DB and needs to always be fresh,
don't assume Next will do the right thing automatically — check the build
output (`ƒ` = dynamic, `○` = static) and add `force-dynamic` explicitly if
it's marked static.

## Deployment Protection was on by default

New Vercel projects (or at least this team's) have "Deployment Protection"
(an SSO wall) on for all non-custom-domain URLs by default, including
preview deployments. This was turned off at the project level
(`ssoProtection: null` via the API) specifically so preview links could be
shared with Jason without requiring a Vercel login. This means **any**
preview URL for this project is publicly viewable by anyone with the link —
acceptable for a low-stakes portfolio site, but worth remembering if this
pattern gets copied to a project with sensitive preview content.

## Auth model

Single shared admin password (bcrypt hash in `AdminConfig` DB row, falling
back to `ADMIN_PASSWORD_HASH` env var if no row exists) — not per-user
accounts. Both Jon and Jason use the same login. There's no audit trail of
who made a given change. This was a deliberate choice (matches
tree-site's pattern, appropriate for a two-person admin) — not an
oversight, but worth knowing if it ever needs to change.

Rate limiting on login attempts is in-memory (`lib/rateLimit.ts`), scoped
to a single serverless instance — doesn't coordinate across concurrent
instances and resets on cold start. Same tradeoff tree-site makes. Fine at
this traffic level; would need Upstash/Redis to be a real distributed
limiter.

## The ingestion script is destructive and one-time

`scripts/ingest-jason-photos.mjs` **deletes every existing `Photo` row**
before inserting its hardcoded list. It was written to do one specific
thing once (replace the 20 stock placeholders with Jason's 22 real
photos) and was already run. Don't run it again expecting it to "add"
photos — it will wipe whatever's currently in the gallery (including
anything uploaded since via `/admin`) and replace it with just those 22.
Use the admin UI for all future photo management.

## Alt text / captions

The admin upload UI (`app/admin/gallery/page.tsx`) collects a caption per
photo before upload and uses it for both the `alt` field and the Blob
filename (slugified — `sea-lions-santa-cruz-a1b2c3d4.jpg` instead of a bare
UUID). A photo can still end up with an empty caption if the field is left
blank; the admin dashboard highlights this with a reddish placeholder in
that photo's caption input, but doesn't hard-block saving. Worth doing a
periodic pass through `/admin/gallery` to make sure nothing's uncaptioned.

## Favicon

Still the empty `data:,` placeholder on every page. Not a functional bug,
but a real gap — no favicon means a generic icon in browser tabs and
possibly in search results. Needs an actual designed icon; hasn't been
addressed because it's a brand/visual decision, not something to pick
unilaterally.

## Blob storage is public

The Vercel Blob store (`santa-cruz-mtn-photography`) was created with
`--access public` — anyone with a photo's URL can view it directly, no
auth. This is correct/intended for a public gallery, but means the URLs
aren't a security boundary — don't rely on obscurity for anything that
should actually be private.
