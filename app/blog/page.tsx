import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Santa Cruz Mountain Photography",
  description:
    "Local guides, drone photography insights, and live music coverage from Santa Cruz and the Santa Cruz Mountains, by photographer Jason Lawton.",
  alternates: { canonical: "https://santacruzmtnphotography.com/blog/" },
  openGraph: {
    type: "website",
    url: "https://santacruzmtnphotography.com/blog/",
    siteName: "Santa Cruz Mountain Photography",
    title: "Blog — Santa Cruz Mountain Photography",
    description:
      "Local guides, drone photography insights, and live music coverage from Santa Cruz and the Santa Cruz Mountains.",
  },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
    date
  );
}

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="blog-index">
      <header className="blog-intro">
        <h1 className="eyebrow">Blog</h1>
      </header>

      {posts.length === 0 ? (
        <p className="blog-empty">No posts yet — check back soon.</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <a className="post-card" href={`/blog/${post.slug}/`} key={post.id}>
              {post.coverImageUrl && (
                <div className="post-card-image">
                  <img src={post.coverImageUrl} alt={post.coverImageAlt || ""} loading="lazy" />
                </div>
              )}
              <div className="post-card-body">
                <p className="post-date">{post.publishedAt ? formatDate(post.publishedAt) : ""}</p>
                <h2>{post.title}</h2>
                <p className="post-excerpt">{post.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
