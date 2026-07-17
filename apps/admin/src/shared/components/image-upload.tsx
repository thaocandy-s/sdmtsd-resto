"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/shared/hooks/use-auth-store";

/* ------------------------------------------------------------------ */
/*  Shared upload helper                                               */
/* ------------------------------------------------------------------ */

/** Upload a single image file to /api/media/upload and return its public URL. */
function uploadImage(
  file: File,
  folder: string | undefined,
  onProgress: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("files", file);
    if (folder) formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload");
    const token = useAuthStore.getState().accessToken;
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let body: { message?: string; data?: Array<{ url: string }> } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.data?.[0]?.url) {
        resolve(body.data[0].url);
      } else {
        reject(new Error(body.message || `HTTP ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

/* ------------------------------------------------------------------ */
/*  Single image upload                                                */
/* ------------------------------------------------------------------ */

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  folder?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  required = false,
  folder,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      const url = await uploadImage(file, folder, setProgress);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm text-foreground-secondary">
          {label}
          {required && <span className="text-red-400"> *</span>}
        </label>
        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Remove
          </button>
        )}
      </div>

      {value && (
        <div className="mb-2 w-full h-32 bg-background-tertiary rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}

      {uploading && (
        <div className="mb-2">
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-gold-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-foreground-secondary mt-1 text-center">
            Uploading… {progress}%
          </p>
        </div>
      )}

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      {!uploading && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-gold-500 bg-gold-500/10"
                : "border-border hover:border-gold-500/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            <p className="text-sm text-foreground-secondary">Drag &amp; drop or click to upload</p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-foreground-tertiary">or paste URL:</span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-gold-500"
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Multi-image upload (for arrays of URLs)                           */
/* ------------------------------------------------------------------ */

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  folder?: string;
}

export function MultiImageUpload({
  value,
  onChange,
  label = "Images",
  folder,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      const url = await uploadImage(file, folder, setProgress);
      onChange([...value, url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange([...value, trimmed]);
      setUrlInput("");
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm text-foreground-secondary mb-1">{label}</label>

      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-2">
          {value.map((url, i) => (
            <div
              key={i}
              className="relative aspect-square bg-background-tertiary rounded-lg overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white w-5 h-5 rounded-full text-xs leading-none"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="mb-2">
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-gold-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-foreground-secondary mt-1 text-center">
            Uploading… {progress}%
          </p>
        </div>
      )}

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      {!uploading && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-gold-500 bg-gold-500/10"
                : "border-border hover:border-gold-500/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            <p className="text-sm text-foreground-secondary">
              Drag &amp; drop or click to add image
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrl();
                }
              }}
              placeholder="Paste image URL and press Enter"
              className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-gold-500"
            />
            <button
              type="button"
              onClick={addUrl}
              className="bg-background-tertiary hover:bg-background border border-border px-3 py-1.5 rounded-lg text-sm text-foreground"
            >
              Add
            </button>
          </div>
        </>
      )}
    </div>
  );
}
