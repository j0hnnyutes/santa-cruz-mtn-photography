import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const PASSWORD_HASH_KEY = "password_hash";

/**
 * The admin password hash lives in the DB so it can be rotated without a
 * redeploy, falling back to ADMIN_PASSWORD_HASH env var if no row exists yet
 * (i.e. right after provisioning, before anyone has changed it).
 */
export async function getAdminPasswordHash(): Promise<string | null> {
  const row = await prisma.adminConfig.findUnique({ where: { key: PASSWORD_HASH_KEY } });
  if (row?.value) return row.value;
  return process.env.ADMIN_PASSWORD_HASH ?? null;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = await getAdminPasswordHash();
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function setAdminPasswordHash(hash: string): Promise<void> {
  await prisma.adminConfig.upsert({
    where: { key: PASSWORD_HASH_KEY },
    create: { key: PASSWORD_HASH_KEY, value: hash },
    update: { value: hash },
  });
}
