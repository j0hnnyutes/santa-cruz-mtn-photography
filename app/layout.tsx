// Minimal root layout — required by the App Router, but this site's actual
// public pages are the plain static HTML files in public/ (rewritten to at
// /, /about/, /gallery/). Only /admin/* actually renders through here.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
