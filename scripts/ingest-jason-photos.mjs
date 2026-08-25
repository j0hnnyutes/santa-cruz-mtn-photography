// One-time script: uploads Jason's real, pre-resized gallery photos to Vercel
// Blob and creates Photo rows for them, replacing the stock placeholder set.
// Run with env vars loaded (BLOB_READ_WRITE_TOKEN, DATABASE_URL, DIRECT_URL).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SOURCE_DIR = "/tmp/jason-gallery-resized";

// filename -> descriptive, SEO-friendly alt text (Santa Cruz / Santa Cruz
// Mountains geo-tagged where the subject is reasonably identifiable).
const photos = [
  ["DSC_0018.jpg", "Sunlight through a Santa Cruz Mountains forest with new growth after wildfire"],
  ["DSC_0023.jpg", "A lighthouse at Lighthouse Point, Santa Cruz, California"],
  ["DSC_0031.jpg", "A natural rock arch along the Santa Cruz, California coastline at dusk"],
  ["DSC_0035.jpg", "A live band performing outdoors in Santa Cruz, California"],
  ["DSC_0042.jpg", "Coastal cliffs along the Santa Cruz, California coastline"],
  ["DSC_0043.jpg", "Pelicans flying over the ocean near Santa Cruz, California"],
  ["DSC_0045.jpg", "Sea lions resting on a rock near Santa Cruz, California"],
  ["DSC_0048.jpg", "A seagull standing on coastal rocks in Santa Cruz, California"],
  ["DSC_0057.jpg", "Sunset over the beach in Santa Cruz, California"],
  ["DSC_0062.jpg", "Golden hour light on coastal cliffs in Santa Cruz, California"],
  ["DSC_0064.jpg", "Sunset gathering at a lighthouse in Santa Cruz, California"],
  ["DSC_0067.jpg", "A bird flying over the Santa Cruz, California coastline at sunset"],
  ["DSC_0192.jpg", "A crowd gathered at sunset for a live event on the Santa Cruz, California coast"],
  ["DSC_0195.jpg", "The Santa Cruz Beach Boardwalk and Giant Dipper roller coaster"],
  ["DSC_0197.jpg", "Sunset over the harbor in Santa Cruz, California"],
  ["DSC_0202.jpg", "Sunset skyline along the Santa Cruz, California coast"],
  ["DSC_0218.jpg", "Portrait session at sunset on a pier in Santa Cruz, California"],
  ["DSC_2399.jpg", "Big Basin Redwoods State Park sign, Santa Cruz Mountains"],
  ["DSC_2401.jpg", "Purple thistle flowers in the Santa Cruz Mountains"],
  ["DSC_2404.jpg", "A gated forest road in the Santa Cruz Mountains"],
  ["DSC_2406.jpg", "A fire-scarred forest at sunset in the Santa Cruz Mountains"],
  ["DSC_2414.jpg", "Sunburst through trees in the Santa Cruz Mountains"],
];

async function main() {
  const existing = await prisma.photo.count();
  if (existing > 0) {
    console.log(`Deleting ${existing} existing Photo row(s) (placeholder set)...`);
    await prisma.photo.deleteMany({});
  }

  let order = 0;
  for (const [filename, alt] of photos) {
    const filePath = path.join(SOURCE_DIR, filename);
    const buffer = await readFile(filePath);
    const pathname = `gallery/${crypto.randomUUID()}.jpg`;

    const blob = await put(pathname, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/jpeg",
    });

    await prisma.photo.create({
      data: { url: blob.url, pathname: blob.pathname, alt, order },
    });

    console.log(`✓ ${filename} -> ${blob.url}`);
    order += 1;
  }

  console.log(`\nDone — ${photos.length} photos uploaded and seeded.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
