"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SectionName =
  | "new_menu"
  | "drink_album"
  | "coffee_moments"
  | "claimed_drinks";

type MediaRow = {
  id: string;
  section: SectionName;
  title: string;
  caption: string | null;
  badge: string | null;
  image_url: string;
  storage_path: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

const sectionLabels: Record<SectionName, string> = {
  new_menu: "New Menu Spotlight",
  drink_album: "Daily Drink Album",
  coffee_moments: "Coffee Moments",
  claimed_drinks: "Claimed Drinks",
};

const defaultBadges: Record<SectionName, string> = {
  new_menu: "NEW MENU",
  drink_album: "FEATURED DRINK",
  coffee_moments: "KASYP MOMENT",
  claimed_drinks: "REWARD CLAIMED",
};

export default function HomeMediaAdminPage() {
  const router = useRouter();

  const [authChecking, setAuthChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [rows, setRows] = useState<MediaRow[]>([]);
  const [section, setSection] = useState<SectionName>("new_menu");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [badge, setBadge] = useState("NEW MENU");
  const [linkUrl, setLinkUrl] = useState("/menu");
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const checkAdminSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      const hasSession = Boolean(data.session && !error);

      if (!active) return;

      if (!hasSession) {
        setAuthorized(false);
        setAuthChecking(false);
        router.replace("/admin");
        return;
      }

      setAuthorized(true);
      setAuthChecking(false);
    };

    void checkAdminSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthorized(false);
        router.replace("/admin");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const loadRows = useCallback(async () => {
    const { data, error } = await supabase
      .from("homepage_media")
      .select(
        "id, section, title, caption, badge, image_url, storage_path, link_url, sort_order, is_active, created_at",
      )
      .order("section", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setRows((data ?? []) as MediaRow[]);
  }, []);

  useEffect(() => {
    if (!authorized) return;

    void loadRows();

    const channel = supabase
      .channel("secure-admin-homepage-media")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_media" },
        () => void loadRows(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authorized, loadRows]);

  const grouped = useMemo(
    () => ({
      new_menu: rows.filter((row) => row.section === "new_menu"),
      drink_album: rows.filter((row) => row.section === "drink_album"),
      coffee_moments: rows.filter((row) => row.section === "coffee_moments"),
      claimed_drinks: rows.filter((row) => row.section === "claimed_drinks"),
    }),
    [rows],
  );

  function changeSection(nextSection: SectionName) {
    setSection(nextSection);
    setBadge(defaultBadges[nextSection]);
    setLinkUrl(nextSection === "new_menu" ? "/menu" : "");
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setCaption("");
    setBadge(defaultBadges[section]);
    setLinkUrl(section === "new_menu" ? "/menu" : "");
    setFile(null);
  }

  function editRow(row: MediaRow) {
    setEditingId(row.id);
    setSection(row.section);
    setTitle(row.title);
    setCaption(row.caption || "");
    setBadge(row.badge || defaultBadges[row.section]);
    setLinkUrl(row.link_url || "");
    setFile(null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadFile(selectedFile: File, targetSection: SectionName) {
    const safeName = selectedFile.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, "-");

    const storagePath = `${targetSection}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from("homepage-media")
      .upload(storagePath, selectedFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("homepage-media")
      .getPublicUrl(storagePath);

    return {
      storagePath,
      imageUrl: data.publicUrl,
    };
  }

  async function saveMedia() {
    if (!title.trim()) {
      setMessage("Enter a title or name.");
      return;
    }

    if (!editingId && !file) {
      setMessage("Choose an image.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const current = editingId
        ? rows.find((row) => row.id === editingId) || null
        : null;

      let imageUrl = current?.image_url;
      let storagePath = current?.storage_path;

      if (file) {
        const uploaded = await uploadFile(file, section);
        imageUrl = uploaded.imageUrl;
        storagePath = uploaded.storagePath;
      }

      if (!imageUrl) throw new Error("Image is required.");

      const payload = {
        section,
        title: title.trim(),
        caption: caption.trim() || null,
        badge: badge.trim() || defaultBadges[section],
        image_url: imageUrl,
        storage_path: storagePath,
        link_url: linkUrl.trim() || null,
        is_active: true,
      };

      if (current) {
        const { error } = await supabase
          .from("homepage_media")
          .update(payload)
          .eq("id", current.id);

        if (error) throw error;

        if (
          file &&
          current.storage_path &&
          current.storage_path !== storagePath
        ) {
          await supabase.storage
            .from("homepage-media")
            .remove([current.storage_path]);
        }

        setMessage("Media updated successfully.");
      } else {
        const existingItems = grouped[section];
        const nextOrder = existingItems.length
          ? Math.max(...existingItems.map((item) => item.sort_order)) + 1
          : 0;

        if (section === "new_menu" && existingItems.length) {
          const oldNewMenu = existingItems[0];

          const { error } = await supabase
            .from("homepage_media")
            .update({
              ...payload,
              sort_order: 0,
            })
            .eq("id", oldNewMenu.id);

          if (error) throw error;

          if (oldNewMenu.storage_path) {
            await supabase.storage
              .from("homepage-media")
              .remove([oldNewMenu.storage_path]);
          }
        } else {
          const { error } = await supabase.from("homepage_media").insert({
            ...payload,
            sort_order: nextOrder,
          });

          if (error) throw error;
        }

        setMessage("Media published successfully.");
      }

      resetForm();
      await loadRows();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save media.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: MediaRow) {
    const { error } = await supabase
      .from("homepage_media")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);

    if (error) setMessage(error.message);
  }

  async function move(row: MediaRow, direction: -1 | 1) {
    const items = grouped[row.section];
    const index = items.findIndex((item) => item.id === row.id);
    const other = items[index + direction];

    if (!other) return;

    await Promise.all([
      supabase
        .from("homepage_media")
        .update({ sort_order: other.sort_order })
        .eq("id", row.id),
      supabase
        .from("homepage_media")
        .update({ sort_order: row.sort_order })
        .eq("id", other.id),
    ]);

    await loadRows();
  }

  async function deleteRow(row: MediaRow) {
    const confirmed = window.confirm(`Delete "${row.title}"?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from("homepage_media")
      .delete()
      .eq("id", row.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (row.storage_path) {
      await supabase.storage
        .from("homepage-media")
        .remove([row.storage_path]);
    }

    setMessage("Media deleted.");
    await loadRows();
  }

  if (authChecking) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#080808] px-5 text-white">
        <p className="rounded-3xl border border-white/10 bg-neutral-950 px-6 py-5">
          Checking secure admin session…
        </p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#080808] px-5 text-white">
        <div className="max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-7 text-center">
          <h1 className="text-2xl font-black">Admin access required</h1>
          <p className="mt-3 text-red-100/80">
            Sign in through the admin page before opening the media manager.
          </p>
          <Link
            href="/admin"
            className="mt-5 inline-flex rounded-full bg-amber-400 px-6 py-3 font-black text-black"
          >
            Go to Admin Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-black">SYP ON CAFÉ ADMIN</p>
            <p className="text-xs text-neutral-500">
              Secure Homepage Media Manager
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-black"
            >
              ← Admin
            </Link>
            <Link
              href="/"
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-black text-black"
            >
              View Homepage
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section className="rounded-[2rem] border border-white/10 bg-neutral-950 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
            {editingId ? "Replace / Edit Media" : "Add Homepage Media"}
          </p>
          <h1 className="mt-2 text-3xl font-black">
            New Menu, Gallery, Coffee Moments, and Claimed Drinks
          </h1>

          <div className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(sectionLabels) as SectionName[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => changeSection(item)}
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  section === item
                    ? "bg-amber-400 text-black"
                    : "border border-white/10 text-neutral-400"
                }`}
              >
                {sectionLabels[item]}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <label>
              <span className="text-sm font-black">Image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  setFile(event.target.files?.[0] || null)
                }
                className="mt-2 block w-full rounded-2xl border border-white/10 bg-black px-4 py-3"
              />
              {editingId && (
                <small className="mt-2 block text-xs text-neutral-600">
                  Leave blank to keep the current image.
                </small>
              )}
            </label>

            <label>
              <span className="text-sm font-black">Title / Name</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={
                  section === "claimed_drinks"
                    ? "Example: Free Spanish Latte Claimed"
                    : "Enter title"
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3"
              />
            </label>

            <label>
              <span className="text-sm font-black">Badge</span>
              <input
                value={badge}
                onChange={(event) => setBadge(event.target.value)}
                placeholder={defaultBadges[section]}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3"
              />
            </label>

            <label>
              <span className="text-sm font-black">Button link (optional)</span>
              <input
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="/menu"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3"
              />
            </label>

            <label className="lg:col-span-2">
              <span className="text-sm font-black">Caption / Details</span>
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                rows={4}
                placeholder={
                  section === "claimed_drinks"
                    ? "Example: 10 stamps completed. Free drink successfully claimed!"
                    : "Short details shown on the homepage"
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-3"
              />
            </label>
          </div>

          {message && (
            <p className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm">
              {message}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void saveMedia()}
              disabled={saving}
              className="rounded-full bg-amber-400 px-6 py-3 font-black text-black disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Replacement"
                  : "Add to Homepage"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-white/15 px-6 py-3 font-black"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </section>

        {(Object.keys(sectionLabels) as SectionName[]).map((sectionName) => (
          <section key={sectionName} className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                  Homepage Section
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  {sectionLabels[sectionName]}
                </h2>
              </div>
              <span className="text-sm text-neutral-500">
                {grouped[sectionName].length} item(s)
              </span>
            </div>

            {grouped[sectionName].length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {grouped[sectionName].map((row, index) => (
                  <article
                    key={row.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-950"
                  >
                    <img
                      src={row.image_url}
                      alt={row.title}
                      className="h-64 w-full object-cover"
                    />

                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300">
                          {row.badge || defaultBadges[row.section]}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            row.is_active
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-red-400/10 text-red-300"
                          }`}
                        >
                          {row.is_active ? "ACTIVE" : "HIDDEN"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-black">{row.title}</h3>
                      {row.caption && (
                        <p className="mt-2 text-sm leading-6 text-neutral-500">
                          {row.caption}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => editRow(row)}
                          className="rounded-full border border-white/15 px-4 py-2 text-sm font-black"
                        >
                          Replace / Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleActive(row)}
                          className="rounded-full border border-white/15 px-4 py-2 text-sm font-black"
                        >
                          {row.is_active ? "Hide" : "Show"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void move(row, -1)}
                          disabled={index === 0}
                          className="rounded-full border border-white/15 px-3 py-2 disabled:opacity-30"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => void move(row, 1)}
                          disabled={
                            index === grouped[sectionName].length - 1
                          }
                          className="rounded-full border border-white/15 px-3 py-2 disabled:opacity-30"
                        >
                          →
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteRow(row)}
                          className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-neutral-500">
                No uploaded media for this section.
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}