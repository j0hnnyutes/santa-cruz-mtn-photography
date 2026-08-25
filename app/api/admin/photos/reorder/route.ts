import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || !Array.isArray(body.ids) || !body.ids.every((v: unknown) => typeof v === "string")) {
    return NextResponse.json({ error: "Expected { ids: string[] }" }, { status: 400 });
  }

  const ids: string[] = body.ids;

  await prisma.$transaction(
    ids.map((id, index) => prisma.photo.update({ where: { id }, data: { order: index } }))
  );

  return NextResponse.json({ ok: true });
}
