import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
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

  const bytes = Buffer.from(await file.arrayBuffer());

  // Read intrinsic dimensions once, here, from the file header — so the
  // public gallery never has to download a full photo client-side just to
  // learn its aspect ratio (see the Photo model's width/height comment).
  const metadata = await sharp(bytes).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const blob = await put(pathname, bytes, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  const maxOrder = await prisma.photo.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const photo = await prisma.photo.create({
    data: {
      url: blob.url,
      pathname: blob.pathname,
      alt,
      order: nextOrder,
      width,
      height,
    },
  });

  return NextResponse.json({ photo }, { status: 201 });
}
