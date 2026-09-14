"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCsrfToken, resizeImageFile } from "@/lib/adminClient";
import { PHOTO_CATEGORIES } from "@/lib/photoCategories";

interface Photo {
  id: string;
  url: string;
  alt: string;
  order: number;
  category: string;
}

interface PendingFile {
  file: File;
  previewUrl: string;
  alt: string;
  category: string;
}

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ text: string; error: boolean } | null>(null);
  // Drag-to-reorder is scoped to one category's own grid now that photos
  // are grouped -- tracking by id (not a flat index) makes it trivial to
  // refuse a drop that crosses into a different section's grid.
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPhotos = useCallback(async () => {
    const res = await fetch("/api/admin/photos/");
    if (res.ok) {
      const data = await res.json();
      setPhotos(data.photos);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  function handleSelectFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      alt: "",
      category: "",
    }));
    setPending((prev) => [...prev, ...next]);
    setUploadStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updatePendingAlt(index: number, alt: string) {
    setPending((prev) => prev.map((p, i) => (i === index ? { ...p, alt } : p)));
  }

  function updatePendingCategory(index: number, category: string) {
    setPending((prev) => prev.map((p, i) => (i === index ? { ...p, category } : p)));
  }

  function removePending(index: number) {
    setPending((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleUploadAll() {
    setUploading(true);
    setUploadStatus(null);

    let succeeded = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        const resized = await resizeImageFile(item.file);
        const form = new FormData();
        form.append("file", resized, item.file.name.replace(/\.[^.]+$/, "") + ".jpg");
        form.append("alt", item.alt.trim());
        form.append("category", item.category);

        const res = await fetch("/api/admin/photos/", {
          method: "POST",
          headers: { "x-admin-csrf": getCsrfToken() },
          body: form,
        });

        if (res.ok) succeeded += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
      URL.revokeObjectURL(item.previewUrl);
    }

    setUploading(false);
    setPending([]);
    setUploadStatus({
      text:
        failed === 0
          ? `Uploaded ${succeeded} photo${succeeded === 1 ? "" : "s"}.`
          : `Uploaded ${succeeded}, ${failed} failed.`,
      error: failed > 0,
    });
    loadPhotos();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo? This can't be undone.")) return;
    const res = await fetch(`/api/admin/photos/${id}/`, {
      method: "DELETE",
      headers: { "x-admin-csrf": getCsrfToken() },
    });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function persistOrder(next: Photo[]) {
    setPhotos(next);
    await fetch("/api/admin/photos/reorder/", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-csrf": getCsrfToken() },
      body: JSON.stringify({ ids: next.map((p) => p.id) }),
    });
  }

  async function updateAlt(id: string, alt: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, alt } : p)));
    await fetch(`/api/admin/photos/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-csrf": getCsrfToken() },
      body: JSON.stringify({ alt }),
    });
  }

  async function updateCategory(id: string, category: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, category } : p)));
    await fetch(`/api/admin/photos/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-csrf": getCsrfToken() },
      body: JSON.stringify({ category }),
    });
  }

  function onDragStart(id: string) {
    dragId.current = id;
  }

  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }

  // Reordering is scoped to one category's own grid -- a drop is ignored
  // if the dragged photo isn't in the same category as the drop target,
  // rather than letting a drag silently reassign its section.
  function onDrop(category: string, targetId: string) {
    const fromId = dragId.current;
    dragId.current = null;
    setDragOverId(null);
    if (!fromId || fromId === targetId) return;

    const fromPhoto = photos.find((p) => p.id === fromId);
    if (!fromPhoto || fromPhoto.category !== category) return;

    const categoryItems = photos.filter((p) => p.category === category);
    const fromIdx = categoryItems.findIndex((p) => p.id === fromId);
    const toIdx = categoryItems.findIndex((p) => p.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...categoryItems];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    // Splice the reordered category back into the full list, leaving every
    // other category's photos exactly where they were.
    let i = 0;
    const next = photos.map((p) => (p.category === category ? reordered[i++] : p));
    persistOrder(next);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout/", { method: "POST" });
    window.location.href = "/admin";
  }

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h1>Gallery</h1>
        <button className="admin-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>

      <p className="admin-hint">
        Drag a photo to reorder — that&rsquo;s the order visitors see. Captions become each
        photo&rsquo;s alt text, which matters for accessibility and for showing up in Google
        Image Search, so it&rsquo;s worth a real sentence, not just a label.
      </p>

      <label className="upload-zone">
        Choose files — resized automatically before upload.
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading}
          onChange={(e) => handleSelectFiles(e.target.files)}
        />
        {uploadStatus && (
          <div className={`upload-status ${uploadStatus.error ? "error" : "success"}`}>
            {uploadStatus.text}
          </div>
        )}
      </label>

      {pending.length > 0 && (
        <div className="pending-list">
          {pending.map((item, index) => (
            <div className="pending-item" key={item.previewUrl}>
              <img src={item.previewUrl} alt="" />
              <input
                type="text"
                placeholder="Describe this photo — e.g. “Sunset over the Santa Cruz Wharf”"
                value={item.alt}
                disabled={uploading}
                onChange={(e) => updatePendingAlt(index, e.target.value)}
              />
              <select
                className="pending-cat"
                value={item.category}
                disabled={uploading}
                onChange={(e) => updatePendingCategory(index, e.target.value)}
              >
                <option value="" disabled hidden>
                  Choose section
                </option>
                {PHOTO_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="photo-delete"
                disabled={uploading}
                onClick={() => removePending(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="cta"
            onClick={handleUploadAll}
            disabled={uploading || pending.some((p) => !p.category)}
          >
            {uploading ? "Uploading…" : `Upload ${pending.length} photo${pending.length === 1 ? "" : "s"}`}
          </button>
          {pending.some((p) => !p.category) && (
            <p className="admin-hint" style={{ marginTop: "-0.2rem" }}>
              Choose a section for every photo before uploading.
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="admin-empty">Loading…</p>
      ) : photos.length === 0 ? (
        <p className="admin-empty">No photos yet — upload the first one above.</p>
      ) : (
        <>
          {PHOTO_CATEGORIES.map((category) => {
            const items = photos.filter((p) => p.category === category);
            return (
              <section className="admin-category" key={category}>
                <div className="admin-category-head">
                  <h2>{category}</h2>
                  <span className="admin-category-count">
                    {items.length} photo{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                {items.length === 0 ? (
                  <p className="admin-category-empty">No photos in this section yet.</p>
                ) : (
                  <div className="photo-grid">
                    {items.map((photo, index) => (
                      <div
                        key={photo.id}
                        className={`photo-card${dragOverId === photo.id ? " drag-over" : ""}`}
                        draggable
                        onDragStart={() => onDragStart(photo.id)}
                        onDragOver={(e) => onDragOver(e, photo.id)}
                        onDrop={() => onDrop(category, photo.id)}
                        onDragEnd={() => setDragOverId(null)}
                      >
                        <img src={photo.url} alt={photo.alt || ""} />
                        <input
                          type="text"
                          className="photo-alt-input"
                          placeholder="No caption — add one"
                          defaultValue={photo.alt}
                          onBlur={(e) => {
                            if (e.target.value !== photo.alt) updateAlt(photo.id, e.target.value);
                          }}
                        />
                        <select
                          className="cat-select"
                          value={photo.category}
                          onChange={(e) => updateCategory(photo.id, e.target.value)}
                        >
                          <option value="" disabled hidden>
                            Uncategorized
                          </option>
                          {PHOTO_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <div className="photo-meta">
                          <span className="photo-order">#{index + 1}</span>
                          <button className="photo-delete" onClick={() => handleDelete(photo.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {/* Rows saved before category existed, or somehow cleared back to
              "" -- the dropdown itself can never produce this, so this only
              shows up for legacy/edge-case data. Surfaced here rather than
              hidden, unlike the public gallery, so nothing goes missing from
              Jason's own view of his photos. */}
          {photos.some((p) => !p.category) && (
            <section className="admin-category">
              <div className="admin-category-head">
                <h2>Uncategorized</h2>
                <span className="admin-category-count">
                  {photos.filter((p) => !p.category).length} photo
                  {photos.filter((p) => !p.category).length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="photo-grid">
                {photos
                  .filter((p) => !p.category)
                  .map((photo, index) => (
                    <div className="photo-card" key={photo.id}>
                      <img src={photo.url} alt={photo.alt || ""} />
                      <input
                        type="text"
                        className="photo-alt-input"
                        placeholder="No caption — add one"
                        defaultValue={photo.alt}
                        onBlur={(e) => {
                          if (e.target.value !== photo.alt) updateAlt(photo.id, e.target.value);
                        }}
                      />
                      <select
                        className="cat-select"
                        value={photo.category}
                        onChange={(e) => updateCategory(photo.id, e.target.value)}
                      >
                        <option value="" disabled hidden>
                          Uncategorized
                        </option>
                        {PHOTO_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="photo-meta">
                        <span className="photo-order">#{index + 1}</span>
                        <button className="photo-delete" onClick={() => handleDelete(photo.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
