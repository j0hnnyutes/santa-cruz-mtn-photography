import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public, read-only — the static gallery page fetches this to render tiles.
// No auth required; only exposes what a visitor already sees on the page.
export async function GET() {
  const photos = await prisma.photo.findMany({
    orderBy: { order: "asc" },
    select: { id: true, url: true, alt: true },
  });

  return NextResponse.json(
    { photos },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } }
  );
}
