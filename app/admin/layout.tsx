import type { Metadata } from "next";

// robots.txt disallows /admin too, but disallow only stops crawling — a
// URL that gets linked from elsewhere can still show up bare in search
// results. This meta tag is the actual guarantee against indexing.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/base.css" />
      <link rel="stylesheet" href="/admin-assets/admin.css" />
      {children}
    </>
  );
}
