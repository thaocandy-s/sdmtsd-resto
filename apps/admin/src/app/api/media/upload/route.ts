import { NextRequest, NextResponse } from "next/server";
import type { Media } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { supabaseAdmin, MEDIA_BUCKET, buildStoragePath } from "@/lib/supabase";

export const runtime = "nodejs";

// Reject files larger than 10MB to protect the storage bucket.
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Cap the number of files accepted in a single request.
const MAX_FILES_PER_REQUEST = 10;

// Only allow image uploads — validate both MIME type and file extension.
// SVG is intentionally excluded: it can embed scripts and would be served
// from the public bucket as a stored-XSS vector.
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function isAllowedImage(file: File): boolean {
  if (!ALLOWED_MIME_TYPES.has(file.type)) return false;
  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
  return ALLOWED_EXTENSIONS.has(ext);
}

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const formData = await request.formData();
      const files = formData.getAll("files").filter((f): f is File => f instanceof File);

      if (files.length === 0) {
        return NextResponse.json({ message: "No files provided" }, { status: 400 });
      }

      if (files.length > MAX_FILES_PER_REQUEST) {
        return NextResponse.json(
          { message: `A maximum of ${MAX_FILES_PER_REQUEST} files can be uploaded at once` },
          { status: 400 }
        );
      }

      // Validate every file up front, before touching storage.
      for (const file of files) {
        if (!isAllowedImage(file)) {
          return NextResponse.json(
            { message: `File "${file.name}" is not an allowed image type` },
            { status: 400 }
          );
        }
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { message: `File "${file.name}" exceeds the 10MB limit` },
            { status: 400 }
          );
        }
      }

      const folder = (formData.get("folder") as string) || null;
      const alt = (formData.get("alt") as string) || null;
      const tagsRaw = (formData.get("tags") as string) || "";
      const tags = tagsRaw
        ? tagsRaw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      // Optional client-extracted dimensions, aligned with files order.
      let dimensions: Array<{ width?: number; height?: number }> = [];
      const dimsRaw = formData.get("dimensions") as string | null;
      if (dimsRaw) {
        try {
          dimensions = JSON.parse(dimsRaw);
        } catch {
          dimensions = [];
        }
      }

      const created: Media[] = [];
      const uploadedPaths: string[] = [];

      // Roll back storage objects and Media rows created earlier in the batch.
      const rollback = async () => {
        if (uploadedPaths.length) {
          await supabaseAdmin.storage.from(MEDIA_BUCKET).remove(uploadedPaths);
        }
        if (created.length) {
          await prisma.media.deleteMany({
            where: { id: { in: created.map((m) => m.id) } },
          });
        }
      };

      // Any failure inside the batch (storage or DB) rolls back everything
      // created so far, so a request never leaves partial results behind.
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          const storagePath = buildStoragePath(file.name, folder);
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = file.type || "application/octet-stream";

          const { error: uploadError } = await supabaseAdmin.storage
            .from(MEDIA_BUCKET)
            .upload(storagePath, buffer, {
              contentType: mimeType,
              upsert: false,
            });

          if (uploadError) {
            await rollback();
            console.error("Storage upload error:", uploadError);
            return NextResponse.json(
              { message: `Failed to upload "${file.name}": ${uploadError.message}` },
              { status: 500 }
            );
          }

          uploadedPaths.push(storagePath);

          const {
            data: { publicUrl },
          } = supabaseAdmin.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);

          const dim = dimensions[i] || {};
          const media = await prisma.media.create({
            data: {
              fileName: file.name,
              url: publicUrl,
              storagePath,
              mimeType,
              size: file.size,
              width: typeof dim.width === "number" ? dim.width : null,
              height: typeof dim.height === "number" ? dim.height : null,
              alt,
              tags,
              folder,
              uploadedBy: user.userId,
            },
          });
          created.push(media);
        }
      } catch (batchError) {
        await rollback().catch((rollbackError) => {
          console.error("Rollback failed:", rollbackError);
        });
        throw batchError;
      }

      return NextResponse.json({ data: created }, { status: 201 });
    } catch (error) {
      console.error("Upload media error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "media", action: "create" }
);
