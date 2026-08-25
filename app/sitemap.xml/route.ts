import { prisma } from "@/lib/prisma";

const BASE_URL = "https://santacruzmtnphotography.com";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Custom XML (rather than Next's built-in sitemap.ts helper) so the gallery
// page's <url> entry can carry an <image:image> child per photo — the image
// sitemap extension, which meaningfully helps Google Image Search discover
// and index each photo individually.
export async function GET() {
  const photos = await prisma.photo.findMany({
    orderBy: { order: "asc" },
    select: { url: true, alt: true },
  });

  const imageEntries = photos
    .map(
      (p) => `
    <image:image>
      <image:loc>${escapeXml(p.url)}</image:loc>
      ${p.alt ? `<image:caption>${escapeXml(p.alt)}</image:caption>` : ""}
    </image:image>`
    )
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
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
