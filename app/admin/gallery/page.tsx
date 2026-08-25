"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCsrfToken, resizeImageFile } from "@/lib/adminClient";

interface Photo {
  id: string;
  url: string;
  alt: string;
  order: number;
}

interface PendingFile {
  file: File;
  previewUrl: string;
  alt: string;
}

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ text: string; error: boolean } | null>(null);
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
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
    }));
    setPending((prev) => [...prev, ...next]);
    setUploadStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updatePendingAlt(index: number, alt: string) {
    setPending((prev) => prev.map((p, i) => (i === index ? { ...p, alt } : p)));
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

  function onDragStart(index: number) {
    dragIndex.current = index;
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function onDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    setDragOverIndex(null);
    if (from === null || from === index) return;

    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
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
          <button className="cta" onClick={handleUploadAll} disabled={uploading}>
            {uploading ? "Uploading…" : `Upload ${pending.length} photo${pending.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {loading ? (
        <p className="admin-empty">Loading…</p>
      ) : photos.length === 0 ? (
        <p className="admin-empty">No photos yet — upload the first one above.</p>
      ) : (
        <div className="photo-grid">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`photo-card${dragOverIndex === index ? " drag-over" : ""}`}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={() => onDrop(index)}
              onDragEnd={() => setDragOverIndex(null)}
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
    </div>
  );
}
