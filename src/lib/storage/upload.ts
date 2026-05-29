import { createClient } from "@/lib/supabase/client";

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"] as const;

export type UploadResult = {
  publicUrl: string | null;
  error: string | null;
};

function generateSafeFilename(file: File): string {
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
  const safeExt = (ALLOWED_EXTENSIONS as readonly string[]).includes(`.${ext}`) ? ext : "png";
  return `${crypto.randomUUID()}.${safeExt}`;
}

export function validateImageFile(file: File): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Only PNG, JPG, and WebP images are allowed.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File must be under 5 MB.";
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".svg")) {
    return "SVG files are not allowed.";
  }
  return null;
}

export async function uploadImage(
  bucket: "profile-pictures" | "public-branding",
  folderPath: string,
  file: File,
): Promise<UploadResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    return { publicUrl: null, error: validationError };
  }

  const filename = generateSafeFilename(file);
  const fullPath = `${folderPath}/${filename}`;

  const supabase = createClient();
  let { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const refreshed = await supabase.auth.getSession();
      session = refreshed.data.session;
    }
  }
  if (!session) {
    const { publicUrl, error } = await uploadViaServerAction(bucket, folderPath, file);
    if (error) return { publicUrl: null, error };
    return { publicUrl, error: null };
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    const msg = error.message;
    if (/failed to fetch|networkerror|load failed/i.test(msg)) {
      await new Promise((r) => setTimeout(r, 1500));
      const { error: retryError } = await supabase.storage
        .from(bucket)
        .upload(fullPath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      if (retryError) {
        const retryMsg = retryError.message;
        if (/failed to fetch|networkerror|load failed/i.test(retryMsg)) {
          return { publicUrl: null, error: "Could not connect to storage. Please check your connection and try again." };
        }
        return { publicUrl: null, error: retryMsg };
      }
    } else {
      return { publicUrl: null, error: msg };
    }
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fullPath);
  if (!urlData?.publicUrl) {
    return { publicUrl: null, error: "Upload succeeded but could not generate a public URL." };
  }
  return { publicUrl: urlData.publicUrl, error: null };
}

async function uploadViaServerAction(
  bucket: "profile-pictures" | "public-branding",
  folderPath: string,
  file: File,
): Promise<UploadResult> {
  const { uploadImageAction } = await import("./upload-action");
  return uploadImageAction(bucket, folderPath, file);
}

export async function removeImage(
  bucket: "profile-pictures" | "public-branding",
  path: string,
): Promise<string | null> {
  const supabase = createClient();
  let { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const refreshed = await supabase.auth.getSession();
      session = refreshed.data.session;
    }
  }
  if (!session) {
    const { removeImageAction } = await import("./upload-action");
    return removeImageAction(bucket, path);
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);
  return error?.message ?? null;
}
