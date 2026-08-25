# Site Map — Santa Cruz Mountain Photography

Living outline of the site's structure. Update this as pages get built or
scope changes — treat it as the source of truth for what exists vs. what's
still planned.

Status legend: ✅ live · 🚧 staging (gallery-page branch, not on production yet) · 📋 planned · ❓ needs a decision

## Pages

```
/                     ✅ live — splash, video hero + nav (no longer "Coming Soon")
/about                ✅ live — Jason's bio
/gallery              🚧 staging — real photos (22, Jason's own), DB-backed via /admin,
                                   justified-mosaic layout, lightbox. Not merged to main.
/contact              📋 still just a mailto link — revisit later (form vs. mailto)
/prints               ❓ needs a decision — sell prints (Etsy/Shopify embed, or a real cart)?
/blog                 ❓ needs a decision — worth it for SEO if he'll actually post
```

## Admin / content management

```
/admin           🚧 staging — password-gated login
/admin/gallery   🚧 staging — upload (auto-resized client-side), delete, drag-to-reorder
```

Decision made: **self-hosted admin**, not a headless CMS or third-party
platform embed. The site's foundation moved from plain static HTML to
Next.js (App Router) to support this — the public pages themselves are
unchanged, just now served from `public/` via rewrites.

- Own Neon Postgres project (`quiet-sun-69099430`) — `Photo` + `AdminConfig`
  tables. Fully separate from santa-cruz-tree-site's database.
- Own Vercel Blob store (public access) for the actual image files.
- Auth pattern ported from tree-site (signed-cookie session, bcrypt password,
  CSRF double-submit) but centralized in `proxy.ts` (Next 16's renamed
  middleware) instead of duplicated per route/page.
- Single shared admin password (not per-user accounts) — matches tree-site's
  model, appropriate for a two-person admin (Jon + Jason).

## SEO

```
robots.txt        ✅ (app/robots.ts) — disallows /admin and /api/
sitemap.xml       ✅ (app/sitemap.xml/route.ts) — custom XML, includes
                      <image:image> entries per gallery photo for Image Search
canonical links   ✅ on /, /about/, /gallery/
JSON-LD           ✅ LocalBusiness on /, Person on /about/, ImageGallery on /gallery/
noindex           ✅ on /admin/* (belt-and-suspenders alongside robots.txt disallow)
h1 per page       ✅ every public page has exactly one
alt text          ✅ descriptive, geo-tagged, per gallery photo
favicon           ❌ still the empty data: URI placeholder — real one not designed yet
Search Console     ❓ not yet verified/submitted (do this once gallery is live on production)
Google Business Profile   — already exists per earlier setup, not part of this repo
```

## Open questions for him

- [ ] Portfolio categories (landscapes, weddings, events, portraits, drone/aerial...?) — not
      built yet; current gallery is one flat list, ordered via admin drag-and-drop
- [ ] Sell prints, or portfolio-only for now?
- [ ] Blog, or skip it?
- [ ] Contact form, or keep the mailto link?
- [ ] When to merge gallery-page branch to main (production) — real photos are in place,
      admin works, but confirm he's happy with the gallery sizing/theme first
