import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await del(photo.pathname).catch(() => {
    // If the blob is already gone, don't block deleting the DB row over it.
  });
  await prisma.photo.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (!body || typeof body.alt !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const photo = await prisma.photo.update({
    where: { id },
    data: { alt: body.alt.trim() },
  });

  return NextResponse.json({ photo });
}
