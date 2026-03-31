import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function sanitizeSegment(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "review"
  );
}

function getExtension(file: File) {
  const originalExtension = path.extname(file.name).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(originalExtension)) {
    return originalExtension === ".jpeg" ? ".jpg" : originalExtension;
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  return ".jpg";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image is too large. Please keep files under 5MB." },
        { status: 400 }
      );
    }

    const fileName = `${sanitizeSegment(path.parse(file.name).name)}-${Date.now()}${getExtension(file)}`;
    const absoluteDirectory = path.join(process.cwd(), "public", "uploads", "reviews");
    const absoluteFilePath = path.join(absoluteDirectory, fileName);
    const publicUrl = `/uploads/reviews/${fileName}`;

    await mkdir(absoluteDirectory, { recursive: true });
    await writeFile(absoluteFilePath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Review upload error:", error);
    return NextResponse.json({ error: "Failed to upload review image" }, { status: 500 });
  }
}
