import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const title = (form.get("title") as string | null)?.trim() ?? existing.title;
  const excerpt = (form.get("excerpt") as string | null)?.trim() ?? existing.excerpt;
  const content = (form.get("content") as string | null) ?? existing.content;
  const metaTitle = (form.get("metaTitle") as string | null)?.trim() ?? existing.metaTitle;
  const metaDescription =
    (form.get("metaDescription") as string | null)?.trim() ?? existing.metaDescription;
  const coverImageAlt =
    (form.get("coverImageAlt") as string | null)?.trim() ?? existing.coverImageAlt;
  const publishedRaw = form.get("published");
  const published = publishedRaw === null ? existing.published : publishedRaw === "true";
  const file = form.get("coverImage");

  let coverImageUrl = existing.coverImageUrl;
  let coverImagePathname = existing.coverImagePathname;

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported cover image type. Use JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Cover image too large (15MB max)." }, { status: 400 });
    }
    if (existing.coverImagePathname) {
      await del(existing.coverImagePathname).catch(() => {});
    }
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const slug = slugify(title);
    const pathname = `blog/${slug}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const blob = await put(pathname, file, { access: "public", addRandomSuffix: false });
    coverImageUrl = blob.url;
    coverImagePathname = blob.pathname;
  }

  // Re-slugging an existing published post would break any inbound/shared
  // links and its indexed URL, so the slug is intentionally left alone
  // after creation — title can change freely without moving the URL.
  const post = await prisma.post.update({
    where: { id },
    data: {
      title,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      coverImageUrl,
      coverImagePathname,
      coverImageAlt,
      published,
      publishedAt: published && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (post.coverImagePathname) {
    await del(post.coverImagePathname).catch(() => {});
  }
  await prisma.post.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
