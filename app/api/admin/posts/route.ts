import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ posts });
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || "post";
  let n = 1;
  // Small dataset (a handful of posts) — a loop here is fine, no need for
  // a fancier collision-avoidance scheme.
  while (await prisma.post.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const title = (form.get("title") as string | null)?.trim() ?? "";
  const excerpt = (form.get("excerpt") as string | null)?.trim() ?? "";
  const content = (form.get("content") as string | null) ?? "";
  const metaTitle = (form.get("metaTitle") as string | null)?.trim() ?? "";
  const metaDescription = (form.get("metaDescription") as string | null)?.trim() ?? "";
  const published = form.get("published") === "true";
  const coverImageAlt = (form.get("coverImageAlt") as string | null)?.trim() ?? "";
  const file = form.get("coverImage");

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let coverImageUrl = "";
  let coverImagePathname = "";

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
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const slug = slugify(title);
    const pathname = `blog/${slug}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const blob = await put(pathname, file, { access: "public", addRandomSuffix: false });
    coverImageUrl = blob.url;
    coverImagePathname = blob.pathname;
  }

  const slug = await uniqueSlug(slugify(title));

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      coverImageUrl,
      coverImagePathname,
      coverImageAlt,
      published,
      publishedAt: published ? new Date() : null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
