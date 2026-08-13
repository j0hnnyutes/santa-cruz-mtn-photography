# Site Map — Santa Cruz Mountain Photography

Living outline of the site's structure. Update this as pages get built or
scope changes — treat it as the source of truth for what exists vs. what's
still planned.

Status legend: ✅ live · 🚧 in progress · 📋 planned · ❓ needs a decision

## Pages

```
/                     ✅ live — splash / coming soon
/portfolio            📋 planned — gallery grid, likely grouped by category
  /portfolio/[category]   📋 planned — e.g. landscapes, weddings, portraits (categories TBD)
/about                 📋 planned — bio, background, approach
/contact               📋 planned — currently just a mailto on the splash page;
                                    revisit once the real site is built (form vs. mailto)
/prints                ❓ needs a decision — does he want to sell prints (Etsy/Shopify
                                    embed, or a real cart)?
/blog                  ❓ needs a decision — worth it for SEO if he'll actually post
```

## Admin / content management

```
/admin (or CMS dashboard)   📋 planned — where he uploads/organizes gallery photos
```

This is the one piece that changes the technical plan, not just the sitemap.
He wants to be able to add photos to the gallery himself, on an ongoing basis.
That rules out a plain static site (current splash page is intentionally just
HTML/CSS/JS — fine for one hero photo + video, not fine for an evolving photo
library). Once we start building `/portfolio`, we'll need to pick one of:

- **Self-hosted upload** — small Next.js app (mirrors the tree site's stack),
  Vercel Blob or S3 for storage, a simple password-gated `/admin` upload page,
  Postgres to store captions/categories/ordering.
- **Headless CMS** — e.g. Sanity or Cloudinary, gives him a hosted
  upload/organize UI without us building one, site just fetches from their API.
- **Existing photography platform embed** — e.g. Pixieset/SmugMug/Instagram
  feed embedded on `/portfolio`, he manages photos entirely on their platform.

No decision needed yet — flagging it now so the splash-page stack doesn't
become a dead end we have to rip out later.

## Open questions for him

- [ ] Portfolio categories (landscapes, weddings, events, portraits, drone/aerial...?)
- [ ] Sell prints, or portfolio-only for now?
- [ ] Blog, or skip it?
- [ ] Self-upload via our own admin, or a CMS/platform he manages directly?
- [ ] Contact form, or keep the mailto link?
