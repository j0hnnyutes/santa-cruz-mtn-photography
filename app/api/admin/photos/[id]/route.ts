import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { isPhotoCategory } from "@/lib/photoCategories";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await del(photo.pathname).catch(() => {
    // If the blob is already gone, don't block deleting the DB row over it.
  });
  if (photo.thumbnailPathname) {
    await del(photo.thumbnailPathname).catch(() => {});
  }
  await prisma.photo.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  // Either field may show up on its own (alt blurs, category dropdown
  // changes) or together -- accept whichever valid ones are present.
  const data: { alt?: string; category?: string } = {};
  if (body && typeof body.alt === "string") {
    data.alt = body.alt.trim();
  }
  if (body && isPhotoCategory(body.category)) {
    data.category = body.category;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const photo = await prisma.photo.update({ where: { id }, data });

  return NextResponse.json({ photo });
}
