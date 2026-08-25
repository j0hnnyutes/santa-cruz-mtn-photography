"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "@/lib/adminClient";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    const res = await fetch("/api/admin/posts/");
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/posts/${id}/`, {
      method: "DELETE",
      headers: { "x-admin-csrf": getCsrfToken() },
    });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/admin/logout/", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h1>Blog</h1>
        <button className="admin-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>

      <a className="cta" href="/admin/blog/new" style={{ marginBottom: "2.5rem", display: "inline-block" }}>
        New Post
      </a>

      {loading ? (
        <p className="admin-empty">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="admin-empty">No posts yet.</p>
      ) : (
        <div className="post-admin-list">
          {posts.map((post) => (
            <div className="post-admin-row" key={post.id}>
              <span className={`post-status ${post.published ? "live" : "draft"}`}>
                {post.published ? "Live" : "Draft"}
              </span>
              <a className="post-admin-title" href={`/admin/blog/${post.id}`}>
                {post.title}
              </a>
              <div className="post-admin-actions">
                {post.published && (
                  <a href={`/blog/${post.slug}/`} target="_blank" rel="noreferrer">
                    View
                  </a>
                )}
                <button className="photo-delete" onClick={() => handleDelete(post.id, post.title)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
