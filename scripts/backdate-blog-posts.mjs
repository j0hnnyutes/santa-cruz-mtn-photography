// One-time script: staggers the 7 launch posts' publish dates instead of
// having them all show as published the same day, starting July 29, 2026.
// Safe to re-run.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dates = [
  ["best-spots-sunset-photos-west-cliff-drive-santa-cruz", "2026-07-29"],
  ["photographers-guide-natural-bridges-state-beach", "2026-08-02"],
  ["big-basin-redwoods-since-czu-fire", "2026-08-06"],
  ["aerial-drone-photography-santa-cruz-weddings-events-land-surveys", "2026-08-11"],
  ["photographing-live-music-lighthouse-point-summer-concerts", "2026-08-15"],
  ["friday-night-bands-santa-cruz-beach-boardwalk", "2026-08-20"],
  ["what-its-like-shooting-live-music-santa-cruz", "2026-08-24"],
];

async function main() {
  for (const [slug, dateStr] of dates) {
    const date = new Date(`${dateStr}T18:00:00Z`);
    const post = await prisma.post.update({
      where: { slug },
      data: { publishedAt: date, updatedAt: date },
    });
    console.log(`✓ ${slug} -> ${post.publishedAt.toISOString().slice(0, 10)}`);
  }
  console.log("\nDone.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
