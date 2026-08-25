import AdminLoginClient from "./AdminLoginClient";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Guard against an open redirect via a crafted ?next= value — only allow
  // same-site paths.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin/gallery";
  return <AdminLoginClient next={safeNext} />;
}
