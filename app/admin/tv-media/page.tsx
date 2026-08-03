"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "../../components/ProtectedRoute";

type TvMedia = {
  id: string;
  title: string;
  original_filename: string;
  storage_path: string;
  public_url: string;
  media_type: "image" | "video";
  mime_type: string;
  file_size: number;
  duration_seconds: number;
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const BUCKET = "tv-standby-media";
const MAX_FILE_SIZE = 100 * 1024 * 1024;

function formatBytes(value: number) {
  const bytes = Number(value || 0);

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function normalizeTitle(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createSafeFilename(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() || "bin";
  const base = filename
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${base || "media"}.${extension}`;
}

export default function TvMediaLibraryPage() {
  const [media, setMedia] = useState<TvMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("tv_media_library")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMedia(
      ((data ?? []) as TvMedia[]).map((item) => ({
        ...item,
        file_size: Number(item.file_size ?? 0),
        duration_seconds: Number(item.duration_seconds ?? 10),
        sort_order: Number(item.sort_order ?? 1),
      })),
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadMedia();

    const channel = supabase
      .channel("tv-media-library-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tv_media_library",
        },
        () => void loadMedia(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadMedia]);

  const filteredMedia = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return media.filter((item) => {
      const matchesType = filter === "all" || item.media_type === filter;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.original_filename.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [media, filter, searchQuery]);

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) return;

    setUploading(true);
    setMessage("");
    setErrorMessage("");

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          throw new Error(`${file.name} is not a supported image or video.`);
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`${file.name} is larger than 100 MB.`);
        }

        setUploadProgressText(
          `Uploading ${index + 1} of ${files.length}: ${file.name}`,
        );

        const mediaType: "image" | "video" = isVideo ? "video" : "image";
        const storagePath = `${mediaType}/${createSafeFilename(file.name)}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(storagePath);

        const nextSortOrder =
          media.reduce(
            (highest, item) => Math.max(highest, Number(item.sort_order || 0)),
            0,
          ) +
          index +
          1;

        const { error: insertError } = await supabase
          .from("tv_media_library")
          .insert({
            title: normalizeTitle(file.name) || "Untitled media",
            original_filename: file.name,
            storage_path: storagePath,
            public_url: publicUrlData.publicUrl,
            media_type: mediaType,
            mime_type: file.type,
            file_size: file.size,
            duration_seconds: mediaType === "video" ? 15 : 10,
            featured: false,
            active: true,
            sort_order: nextSortOrder,
          });

        if (insertError) {
          await supabase.storage.from(BUCKET).remove([storagePath]);
          throw insertError;
        }
      }

      setMessage(
        files.length === 1
          ? "Media uploaded successfully."
          : `${files.length} media files uploaded successfully.`,
      );

      await loadMedia();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to upload media.",
      );
    } finally {
      setUploading(false);
      setUploadProgressText("");
    }
  }

  async function saveTitle(event: FormEvent, item: TvMedia) {
    event.preventDefault();

    const title = editingTitle.trim();

    if (!title) {
      setErrorMessage("Media title cannot be blank.");
      return;
    }

    const { error } = await supabase
      .from("tv_media_library")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setEditingId(null);
    setEditingTitle("");
    setMessage("Media title updated.");
    await loadMedia();
  }

  async function toggleActive(item: TvMedia) {
    const { error } = await supabase
      .from("tv_media_library")
      .update({
        active: !item.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadMedia();
  }

  async function toggleFeatured(item: TvMedia) {
    const { error } = await supabase
      .from("tv_media_library")
      .update({
        featured: !item.featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadMedia();
  }

  async function updateDuration(item: TvMedia, value: number) {
    const duration = Math.max(5, Number(value || 10));

    setMedia((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              duration_seconds: duration,
            }
          : entry,
      ),
    );

    const { error } = await supabase
      .from("tv_media_library")
      .update({
        duration_seconds: duration,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      await loadMedia();
    }
  }

  async function moveItem(item: TvMedia, direction: "up" | "down") {
    const ordered = [...media].sort(
      (a, b) => Number(a.sort_order) - Number(b.sort_order),
    );
    const index = ordered.findIndex((entry) => entry.id === item.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;

    const target = ordered[targetIndex];

    const [firstResult, secondResult] = await Promise.all([
      supabase
        .from("tv_media_library")
        .update({
          sort_order: target.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id),
      supabase
        .from("tv_media_library")
        .update({
          sort_order: item.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", target.id),
    ]);

    if (firstResult.error || secondResult.error) {
      setErrorMessage(
        firstResult.error?.message ||
          secondResult.error?.message ||
          "Unable to reorder media.",
      );
      return;
    }

    await loadMedia();
  }

  async function deleteMedia(item: TvMedia) {
    const confirmed = window.confirm(
      `Delete "${item.title}" from the TV Media Library?`,
    );

    if (!confirmed) return;

    setErrorMessage("");
    setMessage("");

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([item.storage_path]);

    if (storageError) {
      setErrorMessage(storageError.message);
      return;
    }

    const { error: tableError } = await supabase
      .from("tv_media_library")
      .delete()
      .eq("id", item.id);

    if (tableError) {
      setErrorMessage(tableError.message);
      return;
    }

    setMessage("Media deleted.");
    await loadMedia();
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#070907] text-white">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                SYP ON CAFÉ ADMIN
              </p>
              <h1 className="mt-1 text-xl font-black">TV Media Library</h1>
              <p className="mt-1 text-xs text-neutral-500">
                Upload once, then reuse your media across TV standby and future
                promotions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold"
              >
                ← Admin
              </Link>

              <Link
                href="/admin/tv-standby"
                className="rounded-full border border-amber-400/30 px-4 py-2 text-sm font-bold text-amber-300"
              >
                TV Standby
              </Link>

              <Link
                href="/customer-display"
                target="_blank"
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-black"
              >
                Open TV Display
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-7">
          <section className="rounded-3xl border border-amber-400/20 bg-neutral-950 p-5 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-400">
                  Cloud Media Library
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Upload images and videos
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                  Supported: JPG, PNG, WEBP, GIF, MP4 and other browser-safe
                  image/video files. Maximum 100 MB per file.
                </p>
              </div>

              <label
                className={`inline-flex cursor-pointer items-center justify-center rounded-full px-6 py-3 font-black text-black ${
                  uploading
                    ? "pointer-events-none bg-neutral-600"
                    : "bg-amber-400 hover:bg-amber-300"
                }`}
              >
                {uploading ? "Uploading..." : "＋ Upload Media"}
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(event) => void uploadFiles(event)}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {uploading && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" />
                  <div>
                    <b className="block text-sm text-amber-200">
                      Uploading to TV Media Library
                    </b>
                    <small className="mt-1 block text-neutral-400">
                      {uploadProgressText}
                    </small>
                  </div>
                </div>
              </div>
            )}
          </section>

          {(message || errorMessage) && (
            <div
              className={`mt-5 rounded-2xl border p-4 text-sm font-bold ${
                errorMessage
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              }`}
            >
              {errorMessage || message}
            </div>
          )}

          <section className="mt-6 rounded-3xl border border-white/10 bg-neutral-950 p-5 sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-400">
                  Media Collection
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {media.length} uploaded file{media.length === 1 ? "" : "s"}
                </h2>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search media..."
                  className="rounded-full border border-white/10 bg-black px-5 py-3 text-sm outline-none focus:border-amber-400"
                />

                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as "all" | "image" | "video")
                  }
                  className="rounded-full border border-white/10 bg-black px-5 py-3 text-sm outline-none focus:border-amber-400"
                >
                  <option value="all">All media</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                </select>

                <button
                  type="button"
                  onClick={() => void loadMedia()}
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center text-neutral-500">
                Loading media library...
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="py-24 text-center">
                <div className="text-5xl">📺</div>
                <h3 className="mt-4 text-xl font-black">
                  No media found
                </h3>
                <p className="mt-2 text-sm text-neutral-500">
                  Upload your first image or video above.
                </p>
              </div>
            ) : (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredMedia.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-black"
                  >
                    <div className="relative aspect-video overflow-hidden bg-neutral-900">
                      {item.media_type === "video" ? (
                        <video
                          src={item.public_url}
                          muted
                          loop
                          autoPlay
                          playsInline
                          controls
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={item.public_url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      )}

                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-black/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                          {item.media_type}
                        </span>

                        {item.featured && (
                          <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black text-black">
                            ★ FEATURED
                          </span>
                        )}
                      </div>

                      <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-black ${
                          item.active
                            ? "bg-emerald-400 text-black"
                            : "bg-neutral-800 text-neutral-300"
                        }`}
                      >
                        {item.active ? "ACTIVE" : "OFF"}
                      </span>
                    </div>

                    <div className="p-5">
                      {editingId === item.id ? (
                        <form
                          onSubmit={(event) => void saveTitle(event, item)}
                          className="flex gap-2"
                        >
                          <input
                            autoFocus
                            value={editingTitle}
                            onChange={(event) =>
                              setEditingTitle(event.target.value)
                            }
                            className="min-w-0 flex-1 rounded-xl border border-amber-400/30 bg-neutral-950 px-3 py-2 outline-none"
                          />

                          <button
                            type="submit"
                            className="rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-black"
                          >
                            Save
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-black">
                              {item.title}
                            </h3>
                            <p className="mt-1 truncate text-xs text-neutral-500">
                              {item.original_filename}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id);
                              setEditingTitle(item.title);
                            }}
                            className="rounded-full border border-white/15 px-3 py-1 text-xs"
                          >
                            Rename
                          </button>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-neutral-500">
                        <span>{formatBytes(item.file_size)}</span>
                        <span className="text-right">
                          Order #{item.sort_order}
                        </span>
                      </div>

                      <label className="mt-4 grid gap-2 text-xs text-neutral-400">
                        <span>Display duration</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={5}
                            value={item.duration_seconds}
                            onChange={(event) =>
                              void updateDuration(
                                item,
                                Number(event.target.value),
                              )
                            }
                            className="w-24 rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 outline-none focus:border-amber-400"
                          />
                          <span>seconds</span>
                        </div>
                      </label>

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => void toggleFeatured(item)}
                          className={`rounded-xl border px-3 py-2 text-xs font-black ${
                            item.featured
                              ? "border-amber-400 bg-amber-400 text-black"
                              : "border-amber-400/25 text-amber-300"
                          }`}
                        >
                          {item.featured ? "★ Featured" : "☆ Feature"}
                        </button>

                        <button
                          type="button"
                          onClick={() => void toggleActive(item)}
                          className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black"
                        >
                          {item.active ? "Turn Off" : "Turn On"}
                        </button>
                      </div>

                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => void moveItem(item, "up")}
                          className="rounded-xl border border-white/15 px-3 py-2 text-xs"
                        >
                          ↑ Up
                        </button>

                        <button
                          type="button"
                          onClick={() => void moveItem(item, "down")}
                          className="rounded-xl border border-white/15 px-3 py-2 text-xs"
                        >
                          ↓ Down
                        </button>

                        <button
                          type="button"
                          onClick={() => void deleteMedia(item)}
                          className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-black text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}