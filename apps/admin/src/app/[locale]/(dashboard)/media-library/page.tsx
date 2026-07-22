"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/shared/hooks/use-auth-store";

interface Media {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  folder: string | null;
  createdAt: string;
}

interface SelectedFile {
  file: File;
  previewUrl: string;
  width?: number;
  height?: number;
}

type UrlFormData = {
  fileName: string;
  url: string;
  storagePath: string;
  mimeType: string;
  size: number;
  width: string;
  height: string;
  alt: string;
  tags: string;
  folder: string;
};

const emptyUrlForm: UrlFormData = {
  fileName: "",
  url: "",
  storagePath: "",
  mimeType: "image/jpeg",
  size: 0,
  width: "",
  height: "",
  alt: "",
  tags: "",
  folder: "",
};

/** Read intrinsic dimensions of an image file in the browser. */
function getImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve({});
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve({});
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
}

/** POST multipart form data with upload progress via XHR. */
function uploadWithProgress(
  formData: FormData,
  token: string | null,
  onProgress: (percent: number) => void
): Promise<{ data: Media[] }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let body: { message?: string; data?: Media[] } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ data: body.data || [] });
      } else {
        reject(new Error(body.message || `HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<"upload" | "url">("upload");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Upload tab state
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadFolder, setUploadFolder] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL / edit tab state
  const [urlForm, setUrlForm] = useState<UrlFormData>(emptyUrlForm);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, folder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (folder) params.set("folder", folder);
      const res = await api.get<{ data: Media[]; meta: { total: number; totalPages: number } }>(
        `/api/media?${params}`
      );
      setItems(res.data || []);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const resetModal = () => {
    selected.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    setSelected([]);
    setUploadFolder("");
    setUploadAlt("");
    setUploadTags("");
    setUrlForm(emptyUrlForm);
    setEditingId(null);
    setProgress(0);
    setError("");
    setUploading(false);
  };

  const openUploadModal = () => {
    resetModal();
    setModalTab("upload");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetModal();
  };

  const addFiles = async (fileList: FileList | File[]) => {
    setError("");
    const files = Array.from(fileList);
    const withMeta = await Promise.all(
      files.map(async (file) => {
        const dim = await getImageDimensions(file);
        return {
          file,
          previewUrl: URL.createObjectURL(file),
          width: dim.width,
          height: dim.height,
        } as SelectedFile;
      })
    );
    setSelected((prev) => [...prev, ...withMeta]);
  };

  const removeSelected = (index: number) => {
    setSelected((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (selected.length === 0) {
      setError("Please choose at least one file");
      return;
    }
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      const formData = new FormData();
      selected.forEach((s) => formData.append("files", s.file));
      formData.append(
        "dimensions",
        JSON.stringify(selected.map((s) => ({ width: s.width, height: s.height })))
      );
      if (uploadFolder) formData.append("folder", uploadFolder);
      if (uploadAlt) formData.append("alt", uploadAlt);
      if (uploadTags) formData.append("tags", uploadTags);

      const token = useAuthStore.getState().accessToken;
      await uploadWithProgress(formData, token, setProgress);
      closeModal();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...urlForm,
      width: urlForm.width ? parseInt(urlForm.width) : null,
      height: urlForm.height ? parseInt(urlForm.height) : null,
      tags: urlForm.tags ? urlForm.tags.split(",").map((t) => t.trim()) : [],
    };
    try {
      if (editingId) await api.put(`/api/media/${editingId}`, payload);
      else await api.post("/api/media", payload);
      closeModal();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleEdit = (item: Media) => {
    resetModal();
    setEditingId(item.id);
    setUrlForm({
      fileName: item.fileName,
      url: item.url,
      storagePath: "",
      mimeType: item.mimeType,
      size: item.size,
      width: item.width?.toString() || "",
      height: item.height?.toString() || "",
      alt: item.alt || "",
      tags: "",
      folder: item.folder || "",
    });
    setModalTab("url");
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media? The stored file will also be removed.")) return;
    try {
      await api.delete(`/api/media/${id}`);
      loadData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Media Library</h2>
          <p className="text-foreground-secondary mt-1">{total} files</p>
        </div>
        <button
          onClick={openUploadModal}
          className="bg-gold-500 hover:bg-gold-600 text-background px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Upload
        </button>
      </header>

      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
          />
          <button
            type="submit"
            className="bg-background-secondary hover:bg-background-tertiary border border-border px-4 py-2 rounded-lg text-foreground transition-colors"
          >
            Search
          </button>
        </form>
        <input
          type="text"
          value={folder}
          onChange={(e) => {
            setFolder(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by folder"
          className="w-40 bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-square bg-background-secondary rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-lg p-12 text-center">
          <p className="text-foreground-secondary">No media files</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-background-secondary border border-border rounded-lg overflow-hidden group"
              >
                <div className="aspect-square bg-background-tertiary flex items-center justify-center">
                  {item.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.alt || item.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-foreground-secondary text-xs text-center p-2">
                      {item.fileName}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-foreground truncate font-medium">{item.fileName}</p>
                  <p className="text-xs text-foreground-secondary">{formatSize(item.size)}</p>
                  {item.folder && <p className="text-xs text-gold-400 truncate">{item.folder}</p>}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-gold-400 hover:text-gold-300 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-background-secondary border border-border rounded text-sm text-foreground disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-sm text-foreground-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-background-secondary border border-border rounded text-sm text-foreground disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                {editingId ? "Edit Media" : "Add Media"}
              </h3>
              <button
                onClick={closeModal}
                className="text-foreground-secondary hover:text-foreground text-2xl"
              >
                &times;
              </button>
            </div>

            {!editingId && (
              <div className="flex gap-1 mb-6 bg-background rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setModalTab("upload")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    modalTab === "upload"
                      ? "bg-gold-500 text-background"
                      : "text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab("url")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    modalTab === "url"
                      ? "bg-gold-500 text-background"
                      : "text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  From URL
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-400 text-sm rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            {modalTab === "upload" && !editingId ? (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? "border-gold-500 bg-gold-500/10"
                      : "border-border hover:border-gold-500/60"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <p className="text-foreground font-medium">
                    Drag &amp; drop files here, or click to browse
                  </p>
                  <p className="text-foreground-secondary text-xs mt-1">
                    Images, videos or PDF · up to 10MB each
                  </p>
                </div>

                {selected.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {selected.map((s, i) => (
                      <div
                        key={i}
                        className="relative bg-background border border-border rounded-lg overflow-hidden"
                      >
                        <div className="aspect-square bg-background-tertiary flex items-center justify-center">
                          {s.file.type.startsWith("image/") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={s.previewUrl}
                              alt={s.file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-foreground-secondary text-[10px] text-center p-1 break-all">
                              {s.file.name}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelected(i)}
                          disabled={uploading}
                          className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white w-6 h-6 rounded-full text-sm leading-none"
                        >
                          &times;
                        </button>
                        <p className="text-[10px] text-foreground-secondary truncate px-1 py-0.5">
                          {formatSize(s.file.size)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">Folder</label>
                    <input
                      type="text"
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={uploadAlt}
                      onChange={(e) => setUploadAlt(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>

                {uploading && (
                  <div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1 text-center">
                      Uploading… {progress}%
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || selected.length === 0}
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-background py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {uploading ? "Uploading…" : `Upload ${selected.length || ""}`.trim()}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={uploading}
                    className="flex-1 bg-background-tertiary hover:bg-background text-foreground py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">
                    File Name *
                  </label>
                  <input
                    type="text"
                    value={urlForm.fileName}
                    onChange={(e) => setUrlForm({ ...urlForm, fileName: e.target.value })}
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">URL *</label>
                  <input
                    type="text"
                    value={urlForm.url}
                    onChange={(e) => setUrlForm({ ...urlForm, url: e.target.value })}
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                {!editingId && (
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">
                      Storage Path *
                    </label>
                    <input
                      type="text"
                      value={urlForm.storagePath}
                      onChange={(e) => setUrlForm({ ...urlForm, storagePath: e.target.value })}
                      required
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">
                      MIME Type *
                    </label>
                    <input
                      type="text"
                      value={urlForm.mimeType}
                      onChange={(e) => setUrlForm({ ...urlForm, mimeType: e.target.value })}
                      required
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">
                      Size (bytes)
                    </label>
                    <input
                      type="number"
                      value={urlForm.size}
                      onChange={(e) =>
                        setUrlForm({ ...urlForm, size: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">Width</label>
                    <input
                      type="text"
                      value={urlForm.width}
                      onChange={(e) => setUrlForm({ ...urlForm, width: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground-secondary mb-1">Height</label>
                    <input
                      type="text"
                      value={urlForm.height}
                      onChange={(e) => setUrlForm({ ...urlForm, height: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={urlForm.alt}
                    onChange={(e) => setUrlForm({ ...urlForm, alt: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">Folder</label>
                  <input
                    type="text"
                    value={urlForm.folder}
                    onChange={(e) => setUrlForm({ ...urlForm, folder: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground-secondary mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={urlForm.tags}
                    onChange={(e) => setUrlForm({ ...urlForm, tags: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-background py-2 rounded-lg font-medium transition-colors"
                  >
                    {editingId ? "Update" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-background-tertiary hover:bg-background text-foreground py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
