"use client";

import { useEffect, useState } from "react";
import { getCsrfToken } from "@/lib/adminClient";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
}

const EMPTY: Post = {
  id: "",
  title: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  coverImageAlt: "",
  metaTitle: "",
  metaDescription: "",
  published: false,
};

export default function PostEditor({ postId }: { postId?: string }) {
  const [post, setPost] = useState<Post>(EMPTY);
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/admin/posts/${postId}/`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data.post);
        setLoading(false);
      });
  }, [postId]);

  function update<K extends keyof Post>(key: K, value: Post[K]) {
    setPost((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(publishOverride?: boolean) {
    setSaving(true);
    setStatus(null);

    const form = new FormData();
    form.append("title", post.title);
    form.append("excerpt", post.excerpt);
    form.append("content", post.content);
    form.append("metaTitle", post.metaTitle);
    form.append("metaDescription", post.metaDescription);
    form.append("coverImageAlt", post.coverImageAlt);
    form.append("published", String(publishOverride ?? post.published));
    if (coverFile) form.append("coverImage", coverFile);

    const url = postId ? `/api/admin/posts/${postId}/` : "/api/admin/posts/";
    const method = postId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "x-admin-csrf": getCsrfToken() },
      body: form,
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus({ text: data.error || "Failed to save.", error: true });
      return;
    }

    const data = await res.json();
    setStatus({ text: "Saved.", error: false });
    setCoverFile(null);

    if (!postId) {
      window.location.href = `/admin/blog/${data.post.id}`;
    } else {
      setPost(data.post);
    }
  }

  if (loading) return <p className="admin-empty">Loading…</p>;

  return (
    <div className="post-editor">
      <label className="editor-field">
        <span>Title</span>
        <input
          type="text"
          value={post.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </label>

      <label className="editor-field">
        <span>Excerpt (also used as the meta description if none is set below)</span>
        <textarea
          rows={2}
          value={post.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
        />
      </label>

      <label className="editor-field">
        <span>Content (Markdown)</span>
        <textarea
          className="editor-content"
          rows={20}
          value={post.content}
          onChange={(e) => update("content", e.target.value)}
        />
      </label>

      <label className="editor-field">
        <span>Cover image {post.coverImageUrl && "(uploading a new one replaces it)"}</span>
        {post.coverImageUrl && (
          <img className="editor-cover-preview" src={post.coverImageUrl} alt="" />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <label className="editor-field">
        <span>Cover image alt text</span>
        <input
          type="text"
          value={post.coverImageAlt}
          onChange={(e) => update("coverImageAlt", e.target.value)}
        />
      </label>

      <details className="editor-seo">
        <summary>SEO overrides (optional — falls back to title/excerpt)</summary>
        <label className="editor-field">
          <span>Meta title</span>
          <input
            type="text"
            value={post.metaTitle}
            onChange={(e) => update("metaTitle", e.target.value)}
          />
        </label>
        <label className="editor-field">
          <span>Meta description</span>
          <textarea
            rows={2}
            value={post.metaDescription}
            onChange={(e) => update("metaDescription", e.target.value)}
          />
        </label>
      </details>

      <div className="editor-actions">
        <button className="admin-logout" disabled={saving} onClick={() => handleSave(false)}>
          Save Draft
        </button>
        <button className="cta" disabled={saving} onClick={() => handleSave(true)}>
          {post.published ? "Save & Keep Live" : "Publish"}
        </button>
        {status && (
          <span className={`upload-status ${status.error ? "error" : "success"}`}>
            {status.text}
          </span>
        )}
      </div>
    </div>
  );
}
