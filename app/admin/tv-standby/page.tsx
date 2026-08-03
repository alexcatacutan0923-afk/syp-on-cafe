"use client";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "../../components/ProtectedRoute";

type Settings={id:number;enabled:boolean;slide_seconds:number;show_queue:boolean;show_reviews:boolean;show_membership:boolean;show_store_status:boolean;show_social:boolean;footer_message:string};
type Slide={id:string;title:string;subtitle:string;body:string;badge:string;image_url:string;video_url:string;duration_seconds:number;active:boolean;sort_order:number};
const defaultSettings:Settings={id:1,enabled:true,slide_seconds:10,show_queue:true,show_reviews:true,show_membership:true,show_store_status:true,show_social:true,footer_message:"Perfect weather for coffee."};
const blank:Omit<Slide,"id">={title:"",subtitle:"",body:"",badge:"",image_url:"",video_url:"",duration_seconds:10,active:true,sort_order:1};

export default function TvStandbyAdminPage(){
  const[settings,setSettings]=useState(defaultSettings);
  const[slides,setSlides]=useState<Slide[]>([]);
  const[draft,setDraft]=useState(blank);
  const[editing,setEditing]=useState<string|null>(null);
  const[loading,setLoading]=useState(true);
  const[message,setMessage]=useState("");
  const [uploading,setUploading]=useState(false);

  const load=useCallback(async()=>{
    setLoading(true);setMessage("");
    const[s,sl]=await Promise.all([
      supabase.from("tv_standby_settings").select("*").eq("id",1).maybeSingle(),
      supabase.from("tv_standby_slides").select("*").order("sort_order")
    ]);
    if(s.error||sl.error)setMessage(s.error?.message||sl.error?.message||"Unable to load.");
    else{setSettings({...defaultSettings,...s.data});setSlides((sl.data??[]) as Slide[])}
    setLoading(false);
  },[]);

  useEffect(()=>{void load()},[load]);

  async function saveSettings(){
    const{error}=await supabase.from("tv_standby_settings").upsert({...settings,id:1,slide_seconds:Math.max(5,settings.slide_seconds),updated_at:new Date().toISOString()},{onConflict:"id"});
    setMessage(error?error.message:"TV settings saved.");
  }

  async function uploadMedia(
  event: ChangeEvent<HTMLInputElement>,
  type: "image" | "video",
) {
  const file = event.target.files?.[0];

  if (!file) return;

  setUploading(true);

  try {
    const extension = file.name.split(".").pop();

    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;

    const path = `${type}/${fileName}`;

    const { error } = await supabase.storage
      .from("tv-standby-media")
      .upload(path, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("tv-standby-media")
      .getPublicUrl(path);

    if (type === "image") {
      setDraft((current)=>({
        ...current,
        image_url:data.publicUrl,
        video_url:"",
      }));
    } else {
      setDraft((current)=>({
        ...current,
        video_url:data.publicUrl,
        image_url:"",
      }));
    }

    setMessage("Media uploaded successfully.");
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "Upload failed.");
  }

  setUploading(false);
}

  async function saveSlide(event:FormEvent){
    event.preventDefault();
    if(!draft.title.trim()){setMessage("Enter a slide title.");return}
    const payload={...draft,title:draft.title.trim(),duration_seconds:Math.max(5,draft.duration_seconds),sort_order:Math.max(1,draft.sort_order),updated_at:new Date().toISOString()};
    const result=editing
      ?await supabase.from("tv_standby_slides").update(payload).eq("id",editing)
      :await supabase.from("tv_standby_slides").insert(payload);
    if(result.error){setMessage(result.error.message);return}
    setMessage(editing?"Slide updated.":"Slide added.");
    setEditing(null);setDraft({...blank,sort_order:slides.length+1});await load();
  }

  async function toggle(slide:Slide){
    const{error}=await supabase.from("tv_standby_slides").update({active:!slide.active,updated_at:new Date().toISOString()}).eq("id",slide.id);
    if(error)setMessage(error.message);else await load();
  }

  async function remove(slide:Slide){
    if(!window.confirm(`Delete "${slide.title}"?`))return;
    const{error}=await supabase.from("tv_standby_slides").delete().eq("id",slide.id);
    if(error)setMessage(error.message);else await load();
  }

  return <ProtectedRoute><main className="min-h-screen bg-[#070907] text-white">
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-400">SYP ON CAFÉ ADMIN</p><h1 className="mt-1 text-xl font-black">TV Standby Control</h1></div>
        <div className="flex gap-2"><Link href="/admin" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">← Admin</Link><Link href="/customer-display" target="_blank" className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-black">Open TV Display</Link></div>
      </div>
    </header>

    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 lg:grid-cols-[380px_1fr]">
      <aside className="space-y-6">
        <section className="rounded-3xl border border-amber-400/20 bg-neutral-950 p-5">
          <p className="text-xs font-black uppercase tracking-[.18em] text-amber-400">Global Settings</p>
          <div className="mt-5 grid gap-3">
            {([["Enable TV standby","enabled"],["Live queue","show_queue"],["Customer reviews","show_reviews"],["Membership QR","show_membership"],["Store status","show_store_status"],["Order QR and website","show_social"]] as const).map(([label,key])=><Toggle key={key} label={label} checked={Boolean(settings[key])} onChange={value=>setSettings(current=>({...current,[key]:value}))}/>)}
            <NumberField label="Default slide seconds" value={settings.slide_seconds} onChange={value=>setSettings(current=>({...current,slide_seconds:value}))}/>
            <label className="grid gap-2 text-sm"><span className="font-bold text-neutral-300">Footer message</span><textarea value={settings.footer_message} onChange={event=>setSettings(current=>({...current,footer_message:event.target.value}))} rows={3} className="rounded-2xl border border-white/10 bg-black px-4 py-3"/></label>
          </div>
          <button onClick={()=>void saveSettings()} className="mt-5 w-full rounded-full bg-amber-400 px-5 py-3 font-black text-black">Save TV Settings</button>
        </section>

        <section className="rounded-3xl border border-white/10 bg-neutral-950 p-5">
          <p className="text-xs font-black uppercase tracking-[.18em] text-amber-400">{editing?"Edit Slide":"Add Standby Slide"}</p>
          <form onSubmit={saveSlide} className="mt-5 grid gap-3">
            <Field label="Small heading" value={draft.subtitle} onChange={value=>setDraft(current=>({...current,subtitle:value}))}/>
            <Field label="Main title" value={draft.title} onChange={value=>setDraft(current=>({...current,title:value}))}/>
            <label className="grid gap-2 text-sm"><span className="font-bold text-neutral-300">Body</span><textarea value={draft.body} onChange={event=>setDraft(current=>({...current,body:event.target.value}))} rows={3} className="rounded-2xl border border-white/10 bg-black px-4 py-3"/></label>
            <Field label="Badge" value={draft.badge} onChange={value=>setDraft(current=>({...current,badge:value}))}/>
            <label className="grid gap-2">
  <span className="font-bold text-neutral-300">
    Upload Image
  </span>

  <input
    type="file"
    accept="image/*"
    onChange={(event)=>void uploadMedia(event,"image")}
  />
</label>

<label className="grid gap-2">
  <span className="font-bold text-neutral-300">
    Upload Video
  </span>

  <input
    type="file"
    accept="video/*"
    onChange={(event)=>void uploadMedia(event,"video")}
  />
</label>

{uploading && (
  <div className="rounded-xl bg-amber-400/10 p-3 text-sm">
    Uploading...
  </div>
)}

{draft.image_url && (
  <img
    src={draft.image_url}
    className="rounded-2xl"
  />
)}

{draft.video_url && (
  <video
    src={draft.video_url}
    controls
    className="rounded-2xl"
  />
)}
            <div className="grid grid-cols-2 gap-3"><NumberField label="Duration" value={draft.duration_seconds} onChange={value=>setDraft(current=>({...current,duration_seconds:value}))}/><NumberField label="Order" value={draft.sort_order} onChange={value=>setDraft(current=>({...current,sort_order:value}))}/></div>
            <Toggle label="Active" checked={draft.active} onChange={value=>setDraft(current=>({...current,active:value}))}/>
            <div className="flex gap-2"><button className="flex-1 rounded-full bg-amber-400 px-5 py-3 font-black text-black">{editing?"Update Slide":"Add Slide"}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setDraft({...blank,sort_order:slides.length+1})}} className="rounded-full border border-white/15 px-5 py-3">Cancel</button>}</div>
          </form>
        </section>
      </aside>

      <section>
        {message&&<div className="mb-5 rounded-2xl border border-white/10 bg-neutral-950 p-4">{message}</div>}
        <div className="rounded-3xl border border-white/10 bg-neutral-950 p-5">
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-amber-400">TV Playlist</p><h2 className="mt-2 text-2xl font-black">Standby Slides</h2></div><button onClick={()=>void load()} className="rounded-full border border-white/15 px-4 py-2 text-sm">Refresh</button></div>
          {loading?<div className="py-20 text-center text-neutral-500">Loading...</div>:slides.length===0?<div className="py-20 text-center text-neutral-500">No custom slides yet. Built-in fallback slides will appear.</div>:<div className="mt-6 grid gap-4 md:grid-cols-2">{slides.map(slide=><article key={slide.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            <div className="relative aspect-video bg-neutral-900">{slide.video_url?<video src={slide.video_url} muted loop autoPlay playsInline className="h-full w-full object-cover"/>:slide.image_url?<img src={slide.image_url} alt="" className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-5xl">☕</div>}<span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-black ${slide.active?"bg-emerald-400 text-black":"bg-neutral-800"}`}>{slide.active?"ACTIVE":"OFF"}</span></div>
            <div className="p-4"><small className="text-amber-400">{slide.subtitle}</small><h3 className="mt-2 text-lg font-black">{slide.title}</h3><p className="mt-2 text-sm text-neutral-500">{slide.body}</p><div className="mt-4 flex gap-2"><button onClick={()=>{setEditing(slide.id);setDraft({title:slide.title,subtitle:slide.subtitle,body:slide.body,badge:slide.badge,image_url:slide.image_url,video_url:slide.video_url,duration_seconds:slide.duration_seconds,active:slide.active,sort_order:slide.sort_order});window.scrollTo({top:0,behavior:"smooth"})}} className="rounded-full border border-amber-400/30 px-4 py-2 text-xs text-amber-300">Edit</button><button onClick={()=>void toggle(slide)} className="rounded-full border border-white/15 px-4 py-2 text-xs">{slide.active?"Turn Off":"Turn On"}</button><button onClick={()=>void remove(slide)} className="rounded-full border border-red-500/30 px-4 py-2 text-xs text-red-300">Delete</button></div></div>
          </article>)}</div>}
        </div>
      </section>
    </div>
  </main></ProtectedRoute>;
}

function Toggle({label,checked,onChange}:{label:string;checked:boolean;onChange:(value:boolean)=>void}){return <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black p-4"><b>{label}</b><input type="checkbox" checked={checked} onChange={event=>onChange(event.target.checked)} className="h-5 w-5 accent-amber-400"/></label>}
function NumberField({label,value,onChange}:{label:string;value:number;onChange:(value:number)=>void}){return <label className="grid gap-2 text-sm"><span className="font-bold text-neutral-300">{label}</span><input type="number" min="1" value={value} onChange={event=>onChange(Number(event.target.value))} className="rounded-2xl border border-white/10 bg-black px-4 py-3"/></label>}
function Field({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){return <label className="grid gap-2 text-sm"><span className="font-bold text-neutral-300">{label}</span><input value={value} onChange={event=>onChange(event.target.value)} className="rounded-2xl border border-white/10 bg-black px-4 py-3"/></label>}
