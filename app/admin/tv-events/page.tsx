"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PriorityEvent = {
  id: string;
  event_type: "birthday" | "spin_winner" | "new_menu" | "lucky_queue" | "announcement";
  title: string;
  subtitle?: string | null;
  body?: string | null;
  person_name?: string | null;
  reward?: string | null;
  image_url?: string | null;
  active: boolean;
  priority: number;
  duration_seconds: number;
  starts_at?: string | null;
  ends_at?: string | null;
};

const blank: Omit<PriorityEvent, "id"> = {
  event_type: "announcement",
  title: "",
  subtitle: "",
  body: "",
  person_name: "",
  reward: "",
  image_url: "",
  active: true,
  priority: 50,
  duration_seconds: 12,
  starts_at: "",
  ends_at: "",
};

export default function TvEventsAdminPage() {
  const [events, setEvents] = useState<PriorityEvent[]>([]);
  const [draft, setDraft] = useState(blank);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tv_priority_events")
      .select("*")
      .order("active", { ascending: false })
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setEvents((data ?? []) as PriorityEvent[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createEvent(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!draft.title.trim() && !draft.person_name?.trim()) {
      setMessage("Add a title or person/queue name.");
      return;
    }

    const payload = {
      ...draft,
      title: draft.title.trim() || draft.person_name?.trim() || "SYP ON CAFÉ",
      subtitle: draft.subtitle?.trim() || null,
      body: draft.body?.trim() || null,
      person_name: draft.person_name?.trim() || null,
      reward: draft.reward?.trim() || null,
      image_url: draft.image_url?.trim() || null,
      priority: Math.max(1, Number(draft.priority || 50)),
      duration_seconds: Math.max(7, Number(draft.duration_seconds || 12)),
      starts_at: draft.starts_at ? new Date(draft.starts_at).toISOString() : new Date().toISOString(),
      ends_at: draft.ends_at ? new Date(draft.ends_at).toISOString() : null,
    };

    const { error } = await supabase.from("tv_priority_events").insert(payload);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("TV event created.");
    setDraft(blank);
    await load();
  }

  async function toggle(event: PriorityEvent) {
    const { error } = await supabase
      .from("tv_priority_events")
      .update({ active: !event.active, updated_at: new Date().toISOString() })
      .eq("id", event.id);

    if (error) setMessage(error.message);
    else await load();
  }

  async function remove(event: PriorityEvent) {
    if (!window.confirm(`Delete "${event.title}"?`)) return;

    const { error } = await supabase
      .from("tv_priority_events")
      .delete()
      .eq("id", event.id);

    if (error) setMessage(error.message);
    else await load();
  }

  return (
    <main className="min-h-screen bg-[#070907] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-amber-400">
              SYP ON CAFÉ ADMIN
            </p>
            <h1 className="mt-1 text-xl font-black">TV Events Control</h1>
          </div>

          <div className="flex gap-2">
            <Link href="/admin" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
              ← Admin
            </Link>
            <Link href="/customer-display" target="_blank" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-black">
              Open TV Display
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-7 lg:grid-cols-[390px_1fr]">
        <form onSubmit={createEvent} className="space-y-4 rounded-3xl border border-amber-400/20 bg-neutral-950 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-amber-400">Create Priority Event</p>
            <p className="mt-2 text-xs text-neutral-500">This can interrupt the normal TV slideshow.</p>
          </div>

          <label className="grid gap-2 text-sm">
            <span className="font-bold text-neutral-300">Event Type</span>
            <select
              value={draft.event_type}
              onChange={(e) => setDraft((c) => ({ ...c, event_type: e.target.value as PriorityEvent["event_type"] }))}
              className="rounded-2xl border border-white/10 bg-black px-4 py-3"
            >
              <option value="birthday">Birthday</option>
              <option value="spin_winner">Spin Winner</option>
              <option value="new_menu">New Menu</option>
              <option value="lucky_queue">Lucky Queue</option>
              <option value="announcement">Announcement</option>
            </select>
          </label>

          {[
            ["Title", "title"],
            ["Small heading", "subtitle"],
            ["Person / Queue", "person_name"],
            ["Reward / CTA", "reward"],
            ["Image URL", "image_url"],
          ].map(([label, key]) => (
            <label key={key} className="grid gap-2 text-sm">
              <span className="font-bold text-neutral-300">{label}</span>
              <input
                value={String(draft[key as keyof typeof draft] ?? "")}
                onChange={(e) => setDraft((c) => ({ ...c, [key]: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3"
              />
            </label>
          ))}

          <label className="grid gap-2 text-sm">
            <span className="font-bold text-neutral-300">Body</span>
            <textarea
              rows={4}
              value={draft.body || ""}
              onChange={(e) => setDraft((c) => ({ ...c, body: e.target.value }))}
              className="rounded-2xl border border-white/10 bg-black px-4 py-3"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-sm">
              <span className="font-bold text-neutral-300">Priority</span>
              <input
                type="number"
                value={draft.priority}
                onChange={(e) => setDraft((c) => ({ ...c, priority: Number(e.target.value) }))}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-bold text-neutral-300">Seconds</span>
              <input
                type="number"
                value={draft.duration_seconds}
                onChange={(e) => setDraft((c) => ({ ...c, duration_seconds: Number(e.target.value) }))}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3"
              />
            </label>
          </div>

          <div className="grid gap-3">
            <label className="grid gap-2 text-sm">
              <span className="font-bold text-neutral-300">Start (optional)</span>
              <input
                type="datetime-local"
                value={draft.starts_at || ""}
                onChange={(e) => setDraft((c) => ({ ...c, starts_at: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-bold text-neutral-300">End (optional)</span>
              <input
                type="datetime-local"
                value={draft.ends_at || ""}
                onChange={(e) => setDraft((c) => ({ ...c, ends_at: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-black px-4 py-3"
              />
            </label>
          </div>

          <button className="w-full rounded-full bg-amber-400 px-5 py-3 font-black text-black">
            Create TV Event
          </button>

          {message && <div className="rounded-2xl border border-white/10 bg-black p-3 text-sm">{message}</div>}
        </form>

        <section className="rounded-3xl border border-white/10 bg-neutral-950 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-amber-400">Priority Scene Queue</p>
              <h2 className="mt-2 text-2xl font-black">TV Events</h2>
            </div>
            <button onClick={() => void load()} className="rounded-full border border-white/15 px-4 py-2 text-sm">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-neutral-500">Loading...</div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center text-neutral-500">No TV events yet.</div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <article key={event.id} className="rounded-2xl border border-white/10 bg-black p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-black uppercase text-amber-300">
                        {event.event_type.replaceAll("_", " ")}
                      </span>
                      <h3 className="mt-3 text-lg font-black">{event.title}</h3>
                      <p className="mt-2 text-sm text-neutral-400">
                        {event.person_name || event.body || "No extra details"}
                      </p>
                    </div>

                    <span className={`rounded-full px-3 py-1 text-xs font-black ${event.active ? "bg-green-500/15 text-green-300" : "bg-white/10 text-neutral-400"}`}>
                      {event.active ? "ACTIVE" : "OFF"}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => void toggle(event)} className="flex-1 rounded-full border border-white/15 px-4 py-2 text-sm">
                      {event.active ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => void remove(event)} className="rounded-full border border-red-500/30 px-4 py-2 text-sm text-red-300">
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
