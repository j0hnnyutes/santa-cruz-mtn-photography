import { prisma } from "@/lib/prisma";

// Without this, Next.js prerenders this route once at build time (it has no
// per-request dynamic API calls, just a DB query) and freezes whatever
// photos existed then — new uploads/deletes via /admin wouldn't show up
// until the next deploy. force-dynamic keeps it querying the DB live.
export const dynamic = "force-dynamic";

const BASE_URL = "https://santacruzmtnphotography.com";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Custom XML (rather than Next's built-in sitemap.ts helper) so <url>
// entries can carry <image:image> children — the gallery page gets one per
// photo, each blog post gets one for its cover image — the image sitemap
// extension, which meaningfully helps Google Image Search discover and
// index each photo individually.
export async function GET() {
  const [photos, posts] = await Promise.all([
    prisma.photo.findMany({
      orderBy: { order: "asc" },
      select: { url: true, alt: true },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, updatedAt: true, coverImageUrl: true, coverImageAlt: true },
    }),
  ]);

  const imageEntries = photos
    .map(
      (p) => `
    <image:image>
      <image:loc>${escapeXml(p.url)}</image:loc>
      ${p.alt ? `<image:caption>${escapeXml(p.alt)}</image:caption>` : ""}
    </image:image>`
    )
    .join("");

  const postEntries = posts
    .map((p) => {
      const image = p.coverImageUrl
        ? `
    <image:image>
      <image:loc>${escapeXml(p.coverImageUrl)}</image:loc>
      ${p.coverImageAlt ? `<image:caption>${escapeXml(p.coverImageAlt)}</image:caption>` : ""}
    </image:image>`
        : "";
      return `
  <url>
    <loc>${BASE_URL}/blog/${escapeXml(p.slug)}/</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${image}
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/gallery/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>${imageEntries}
  </url>
  <url>
    <loc>${BASE_URL}/blog/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact/</loc>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>${postEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
