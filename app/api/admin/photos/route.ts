import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB safety cap
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Slugify the caption into the filename itself — "sea-lions-santa-cruz.jpg"
// beats a bare UUID for image-search SEO, alongside the alt text.
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function GET() {
  const photos = await prisma.photo.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const alt = (form.get("alt") as string | null)?.trim() ?? "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (15MB max)." }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const slug = slugify(alt);
  const shortId = crypto.randomUUID().slice(0, 8);
  const pathname = `gallery/${slug ? `${slug}-${shortId}` : shortId}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
  });

  const maxOrder = await prisma.photo.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const photo = await prisma.photo.create({
    data: {
      url: blob.url,
      pathname: blob.pathname,
      alt,
      order: nextOrder,
    },
  });

  return NextResponse.json({ photo }, { status: 201 });
}
