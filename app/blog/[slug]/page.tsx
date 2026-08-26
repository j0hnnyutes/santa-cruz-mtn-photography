import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) return null;
  return post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = post.metaTitle || `${post.title} — Santa Cruz Mountain Photography`;
  const description = post.metaDescription || post.excerpt;
  const url = `https://santacruzmtnphotography.com/blog/${post.slug}/`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: "Santa Cruz Mountain Photography",
      title,
      description,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
    date
  );
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const html = await marked.parse(post.content);
  const url = `https://santacruzmtnphotography.com/blog/${post.slug}/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverImageUrl || undefined,
    author: {
      "@type": "Person",
      name: "Jason Lawton",
      url: "https://santacruzmtnphotography.com/about/",
    },
    publisher: {
      "@type": "LocalBusiness",
      name: "Santa Cruz Mountain Photography",
      url: "https://santacruzmtnphotography.com/",
    },
  };

  return (
    <main className="blog-post">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="blog-post-header">
        <a className="blog-back" href="/blog/">
          &larr; Blog
        </a>
        <p className="post-date">{post.publishedAt ? formatDate(post.publishedAt) : ""}</p>
        <h1>{post.title}</h1>
      </header>

      {post.coverImageUrl && (
        <figure className="blog-post-cover">
          <img src={post.coverImageUrl} alt={post.coverImageAlt || ""} />
        </figure>
      )}

      <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />

      <footer className="blog-post-footer">
        <a className="cta" href="/contact/">
          Get in Touch
        </a>
      </footer>
    </main>
  );
}
