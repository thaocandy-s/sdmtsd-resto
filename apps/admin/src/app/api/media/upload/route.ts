import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { supabaseAdmin, MEDIA_BUCKET, buildStoragePath } from "@/lib/supabase";

export const runtime = "nodejs";

// Reject files larger than 10MB to protect the storage bucket.
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const formData = await request.formData();
      const files = formData.getAll("files").filter((f): f is File => f instanceof File);

      if (files.length === 0) {
        return NextResponse.json({ message: "No files provided" }, { status: 400 });
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

      const created = [];
      const uploadedPaths: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.size > MAX_FILE_SIZE) {
          // Roll back anything already uploaded in this batch.
          if (uploadedPaths.length) {
            await supabaseAdmin.storage.from(MEDIA_BUCKET).remove(uploadedPaths);
          }
          return NextResponse.json(
            { message: `File "${file.name}" exceeds the 10MB limit` },
            { status: 400 }
          );
        }

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
          if (uploadedPaths.length) {
            await supabaseAdmin.storage.from(MEDIA_BUCKET).remove(uploadedPaths);
          }
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

      return NextResponse.json({ data: created }, { status: 201 });
    } catch (error) {
      console.error("Upload media error:", error);
      const message = error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json({ message }, { status: 500 });
    }
  },
  { module: "media", action: "create" }
);
