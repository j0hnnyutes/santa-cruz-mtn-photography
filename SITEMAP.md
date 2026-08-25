# Site Map — Santa Cruz Mountain Photography

Living outline of the site's structure. Update this as pages get built or
scope changes — treat it as the source of truth for what exists vs. what's
still planned.

Status legend: ✅ live on production · 📋 planned · ❓ needs a decision

## Pages

```
/                     ✅ splash, video hero + nav
/about                ✅ Jason's bio
/gallery              ✅ real photos, DB-backed via /admin, justified-mosaic layout, lightbox
/blog                 ✅ 7 posts live (3 local guides, 1 drone, 3 live music), DB-backed via
                          /admin, server-rendered per post for real SEO (unlike /gallery,
                          which is client-fetched)
/contact              📋 still just a mailto link — revisit later (form vs. mailto)
/prints               ❓ needs a decision — sell prints (Etsy/Shopify embed, or a real cart)?
```

## Admin / content management

```
/admin           ✅ password-gated login
/admin/gallery   ✅ upload (auto-resized client-side), delete, drag-to-reorder, alt-text editing
/admin/blog      ✅ list, new/edit (Markdown content, cover image, SEO title/description
                    overrides), publish/draft toggle, delete
```

Self-hosted admin, not a headless CMS or third-party platform embed. The
site's foundation is Next.js (App Router) specifically to support this — the
original static pages (/, /about/, /gallery/) are still plain HTML in
`public/`, served via rewrites; only /admin/* and /blog/* are actual Next.js
pages.

- Own Neon Postgres project (`quiet-sun-69099430`) — `Photo`, `Post`,
  `AdminConfig` tables. Fully separate from santa-cruz-tree-site's database.
- Own Vercel Blob store (public access) for photo and blog cover images.
- Auth pattern ported from tree-site (signed-cookie session, bcrypt password,
  CSRF double-submit) but centralized in `proxy.ts` (Next 16's renamed
  middleware) instead of duplicated per route/page.
- Single shared admin password (not per-user accounts) — matches tree-site's
  model, appropriate for a two-person admin (Jon + Jason).

## SEO

```
robots.txt        ✅ (app/robots.ts) — disallows /admin and /api/
sitemap.xml       ✅ (app/sitemap.xml/route.ts) — custom XML: <image:image> entries per
                      gallery photo, plus every published blog post
canonical links   ✅ on every page, including each blog post
JSON-LD           ✅ LocalBusiness on /, Person on /about/, ImageGallery on /gallery/,
                      BlogPosting on each post
noindex           ✅ on /admin/* (belt-and-suspenders alongside robots.txt disallow)
h1 per page       ✅ every public page has exactly one
alt text          ✅ descriptive, geo-tagged — gallery photos and blog cover images
favicon           ❌ still the empty data: URI placeholder — real one not designed yet
Search Console     ✅ domain verified, sitemap submitted
Google Business Profile   — already exists per earlier setup, not part of this repo
```

Blog posts are intentionally NOT "keyword-dense" — that's an outdated
tactic Google's Helpful Content system actively suppresses now. Each post
targets a specific, genuine search intent (a local guide, a specific
service) using Jason's real photos/experience rather than generic
keyword-stuffed copy. See each post's `excerpt`/`metaDescription` for what
it's actually targeting.

## Open questions for him

- [ ] Portfolio categories (landscapes, weddings, events, portraits, drone/aerial...?) — not
      built yet; current gallery is one flat list, ordered via admin drag-and-drop
- [ ] Sell prints, or portfolio-only for now?
- [ ] More blog posts — the initial 7 are a starting batch, not a finished library. Worth
      revisiting whether Jason will actually keep posting before investing more here.
- [ ] Contact form, or keep the mailto link?
- [ ] Favicon design
