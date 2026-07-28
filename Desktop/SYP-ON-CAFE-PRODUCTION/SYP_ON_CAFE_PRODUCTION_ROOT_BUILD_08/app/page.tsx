"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import "./site.css";
import { supabase } from "../lib/supabase";

type HomeMediaRow = {
  id: string;
  section: "new_menu" | "drink_album" | "coffee_moments" | "claimed_drinks";
  title: string;
  caption: string | null;
  badge: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

type FeaturedDrink = {
  name: string;
  category: string;
  price: string;
  rating: string;
  reviews: number;
  image: string;
  poster: string;
  note: string;
  tag?: string;
};

const drinks: FeaturedDrink[] = [
  { name: "Spanish Latte", category: "Coffee", price: "₱89", rating: "4.9", reviews: 126, image: "/products/spanish-latte.webp", poster: "/featured/spanish-latte.webp", note: "Bold espresso meets sweet, creamy condensed milk.", tag: "BEST SELLER" },
  { name: "Iced Milo Latte", category: "Coffee", price: "₱79", rating: "4.8", reviews: 88, image: "/products/iced-milo-latte.webp", poster: "/featured/iced-milo-latte.webp", note: "Creamy Milo, smooth milk and a touch of espresso.", tag: "CUSTOMER FAVORITE" },
  { name: "Biscoff Latte", category: "Coffee", price: "₱99", rating: "4.8", reviews: 94, image: "/products/biscoff-latte.webp", poster: "/featured/biscoff-latte.webp", note: "Buttery Biscoff flavor in a rich, smooth latte.", tag: "PREMIUM PICK" },
  { name: "Caramel Macchiato", category: "Milky", price: "₱89", rating: "4.8", reviews: 81, image: "/products/caramel-macchiato.webp", poster: "/featured/caramel-macchiato.webp", note: "Sweet caramel layered with creamy milk and espresso." },
  { name: "Milo Dino", category: "Milky", price: "₱79", rating: "4.7", reviews: 68, image: "/products/milo-dino.webp", poster: "/featured/milo-dino.webp", note: "Classic Milo, dino-sized and packed with chocolatey goodness." },
  { name: "Oreo Matcha", category: "Matcha", price: "₱119", rating: "4.9", reviews: 103, image: "/products/oreo-matcha.webp", poster: "/featured/oreo-matcha.webp", note: "Earthy matcha with creamy Oreo crumble.", tag: "TRENDING" },
  { name: "Biscoff Matcha", category: "Matcha", price: "₱119", rating: "4.8", reviews: 91, image: "/products/biscoff-matcha.webp", poster: "/featured/biscoff-matcha.webp", note: "Smooth matcha with Biscoff sweetness in every sip." },
  { name: "Mango Matcha", category: "Matcha", price: "₱109", rating: "4.8", reviews: 76, image: "/products/mango-matcha.webp", poster: "/featured/mango-matcha.webp", note: "Sweet mango goodness with smooth, creamy matcha." },
  { name: "Strawberry Matcha", category: "Matcha", price: "₱109", rating: "4.8", reviews: 79, image: "/products/strawberry-matcha.webp", poster: "/featured/strawberry-matcha.webp", note: "Sweet strawberry layers balanced by creamy matcha." },
  { name: "SYP White Rush", category: "Signature", price: "₱99", rating: "4.9", reviews: 97, image: "/products/syp-white-rush.webp", poster: "/featured/syp-white-rush.webp", note: "Smooth white chocolate meets bold espresso.", tag: "SIGNATURE" },
  { name: "SYP Choco Boom", category: "Signature", price: "₱99", rating: "4.9", reviews: 99, image: "/products/syp-choco-boom.webp", poster: "/featured/syp-choco-boom.webp", note: "Rich chocolate and coffee in one addictive blend.", tag: "SIGNATURE" },
];

const heroSlides = [
  {
    name: "Spanish Latte",
    label: "BEST SELLER",
    image: "/featured/spanish-latte.webp",
    background: "/community-v2/coffee-fries-barkada.webp",
  },
  {
    name: "Oreo Matcha",
    label: "TRENDING",
    image: "/featured/oreo-matcha.webp",
    background: "/community-v2/cafe-barkada-selfie.webp",
  },
  {
    name: "SYP Choco Boom",
    label: "SIGNATURE",
    image: "/featured/syp-choco-boom.webp",
    background: "/community-v2/barkada-board-games.webp",
  },
  {
    name: "Biscoff Matcha",
    label: "PREMIUM PICK",
    image: "/featured/biscoff-matcha.webp",
    background: "/community-v2/coffee-buddy-night.webp",
  },
];

const communityMoments = [
  { image: "/community-v2/barkada-board-games.webp", title: "Barkada Game Night", caption: "Coffee, board games, and late-night kwentuhan with the KaSYP barkada.", badge: "BARKADA MOMENT" },
  { image: "/community-v2/cafe-barkada-selfie.webp", title: "Tropang SYP", caption: "A real café hangout shared by friends who keep coming back for good drinks and good vibes.", badge: "KASYP FAMILY" },
  { image: "/community-v2/barkada-tambay-collage.webp", title: "Coffee Tastes Better Together", caption: "Group drinks, mirror shots, and memories made at the café.", badge: "BARKADA FAVORITE" },
  { image: "/community-v2/coffee-fries-barkada.webp", title: "Coffee, Fries, and Tambay", caption: "A simple night made better with drinks, fries, games, and friends.", badge: "CAFE NIGHT" },
  { image: "/community-v2/mirror-selfie-regular.webp", title: "Mandatory Mirror Selfie", caption: "A regular KaSYP tradition—one mirror selfie before heading home.", badge: "MIRROR MOMENT" },
  { image: "/community-v2/coffee-buddy-night.webp", title: "Coffee Buddy Night", caption: "Two cups, one late-night story, and another SYP memory.", badge: "LATE-NIGHT KASYP" },
];

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const [activeDrink, setActiveDrink] = useState<FeaturedDrink | null>(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoMini, setVideoMini] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [homeMedia, setHomeMedia] = useState<HomeMediaRow[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<HomeMediaRow | null>(null);
  const featuredRail = useRef<HTMLDivElement | null>(null);
  const communityRail = useRef<HTMLDivElement | null>(null);
  const cafeVideo = useRef<HTMLVideoElement | null>(null);
  const heroSection = useRef<HTMLElement | null>(null);
  const categories = ["All", "Coffee", "Matcha", "Milky", "Signature"];

  const moveRail = (rail: RefObject<HTMLDivElement | null>, direction: number) => {
    rail.current?.scrollBy({ left: direction * Math.max(280, rail.current.clientWidth * 0.78), behavior: "smooth" });
  };

  const toggleVideoSound = () => {
    if (!cafeVideo.current) return;
    cafeVideo.current.muted = !cafeVideo.current.muted;
    setVideoMuted(cafeVideo.current.muted);
    void cafeVideo.current.play();
  };

  const openVideoFullscreen = () => {
    const video = cafeVideo.current;
    if (video?.requestFullscreen) void video.requestFullscreen();
  };

  useEffect(() => {
    const hero = heroSection.current;
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVideoMini(!entry.isIntersecting), { threshold: 0.18 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;

    const loadHomeMedia = async () => {
      const { data, error } = await supabase
        .from("homepage_media")
        .select("id, section, title, caption, badge, image_url, link_url, sort_order, is_active, created_at")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Unable to load homepage media:", error);
        setHomeMedia([]);
      } else {
        setHomeMedia((data ?? []) as HomeMediaRow[]);
      }

      setMediaLoading(false);
    };

    void loadHomeMedia();

    const channel = supabase
      .channel("homepage-media-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_media" },
        () => void loadHomeMedia(),
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  const newMenuMedia = homeMedia.find((item) => item.section === "new_menu");
  const drinkAlbumMedia = homeMedia.filter((item) => item.section === "drink_album");
  const coffeeMomentMedia = homeMedia.filter((item) => item.section === "coffee_moments");
  const claimedDrinkMedia = homeMedia.filter((item) => item.section === "claimed_drinks");

  const shown = useMemo(() => category === "All" ? drinks : drinks.filter((drink) => drink.category === category), [category]);

  const renderCafeVideo = (mini: boolean) => (
    <div className={mini ? "hero-video-stage is-mini" : "hero-video-stage"}>
      <video ref={cafeVideo} src="/videos/syp-cafe-background.mp4" autoPlay muted={videoMuted} loop playsInline poster="/brand/syp-logo-glow-v2.webp" />
      <div className="hero-video-overlay" />
      <div className="hero-video-controls">
        <button type="button" onClick={toggleVideoSound}>{videoMuted ? "🔇 Sound" : "🔊 Sound"}</button>
        <button type="button" onClick={openVideoFullscreen}>⛶ Full size</button>
      </div>
      <div className="hero-video-brand">
        <img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" />
        <span><b>SYP ON CAFÉ</b><small>Street • Iced • Brewed</small></span>
      </div>
      {mini && <button className="mini-video-return" type="button" onClick={() => heroSection.current?.scrollIntoView({ behavior: "smooth" })}>Return to hero</button>}
    </div>
  );

  const activeHero = heroSlides[heroIndex];

  const moveHero = (direction: number) => {
    setHeroIndex((current) => {
      const next = current + direction;
      if (next < 0) return heroSlides.length - 1;
      if (next >= heroSlides.length) return 0;
      return next;
    });
  };

  return (
    <main>
      <style jsx global>{`
/* BUILD 45 — ADVENTURE-INSPIRED SYP ON CAFÉ HERO
   Supplemental styles only. Existing site.css remains untouched. */

.b45-hero {
  --b45-gold: #f4c95d;
  --b45-cream: #fff4d0;
  position: relative;
  min-height: min(900px, 100svh);
  margin: 0;
  overflow: hidden;
  isolation: isolate;
  background-color: #050706;
  background-position: center;
  background-size: cover;
  color: #fff;
}

.b45-hero-video,
.b45-hero-video video,
.b45-overlay {
  position: absolute;
  inset: 0;
}

.b45-hero-video {
  z-index: -3;
}

.b45-hero-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(.82) contrast(1.08) brightness(.72);
  transform: scale(1.035);
  animation: b45-slow-zoom 18s ease-in-out infinite alternate;
}

.b45-overlay {
  z-index: -2;
  background:
    linear-gradient(90deg, rgba(1, 4, 3, .93) 0%, rgba(2, 6, 4, .76) 36%, rgba(2, 5, 4, .3) 68%, rgba(1, 3, 2, .58) 100%),
    linear-gradient(0deg, rgba(2, 4, 3, .92) 0%, transparent 42%),
    radial-gradient(circle at 75% 36%, rgba(244, 201, 93, .13), transparent 34%);
}

.b45-header {
  position: relative;
  z-index: 5;
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 26px 0 18px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 34px;
  border-bottom: 1px solid rgba(255, 255, 255, .14);
}

.b45-brand {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: #fff;
  text-decoration: none;
}

.b45-brand img {
  width: 46px;
  height: 46px;
  object-fit: contain;
}

.b45-brand span {
  display: grid;
  gap: 2px;
}

.b45-brand b {
  font-size: 15px;
  letter-spacing: .08em;
}

.b45-brand small {
  color: rgba(255, 255, 255, .58);
  font-size: 8px;
  letter-spacing: .22em;
}

.b45-nav {
  display: flex;
  justify-content: center;
  gap: clamp(18px, 3vw, 42px);
}

.b45-nav a,
.b45-header-actions a,
.b45-header-actions button {
  color: rgba(255, 255, 255, .86);
  text-decoration: none;
  font: inherit;
  font-size: 13px;
}

.b45-nav a {
  position: relative;
  padding: 10px 0;
}

.b45-nav a::after {
  content: "";
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: 2px;
  height: 1px;
  background: var(--b45-gold);
  transition: left .25s ease, right .25s ease;
}

.b45-nav a:hover::after {
  left: 0;
  right: 0;
}

.b45-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.b45-header-actions button {
  border: 1px solid rgba(255, 255, 255, .18);
  background: rgba(0, 0, 0, .22);
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
}

.b45-header-actions a {
  padding: 11px 18px;
  border-radius: 999px;
  background: var(--b45-gold);
  color: #090a08;
  font-weight: 800;
}

.b45-content {
  position: relative;
  z-index: 3;
  width: min(1180px, calc(100% - 48px));
  min-height: 690px;
  margin: 0 auto;
  padding: 74px 0 90px;
  display: grid;
  grid-template-columns: minmax(0, .88fr) minmax(430px, 1.12fr);
  align-items: end;
  gap: clamp(40px, 7vw, 100px);
}

.b45-copy {
  max-width: 560px;
}

.b45-eyebrow {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, .72);
  text-transform: uppercase;
  letter-spacing: .19em;
  font-size: 11px;
}

.b45-eyebrow span {
  width: 48px;
  height: 1px;
  background: var(--b45-gold);
}

.b45-copy h1 {
  margin: 24px 0 20px;
  font-size: clamp(54px, 6.8vw, 94px);
  line-height: .92;
  letter-spacing: -.055em;
  text-transform: uppercase;
  max-width: 720px;
}

.b45-copy h1 em {
  color: var(--b45-gold);
  font-style: normal;
}

.b45-lead {
  max-width: 530px;
  color: rgba(255, 255, 255, .7);
  font-size: 15px;
  line-height: 1.7;
}

.b45-cta {
  margin-top: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.b45-cta > span {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--b45-gold);
  color: #080907;
}

.b45-cta a {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  padding: 0 20px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, .3);
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: .08em;
  font-size: 11px;
  font-weight: 800;
}

.b45-cta a:first-of-type {
  background: rgba(255, 255, 255, .08);
  backdrop-filter: blur(14px);
}

.b45-proof {
  margin-top: 34px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  max-width: 520px;
}

.b45-proof div {
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, .2);
  display: grid;
  gap: 4px;
}

.b45-proof b {
  color: var(--b45-cream);
  font-size: 14px;
}

.b45-proof small {
  color: rgba(255, 255, 255, .48);
  font-size: 10px;
}

.b45-showcase {
  min-width: 0;
  align-self: end;
}

.b45-card-rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(145px, 1fr);
  gap: 14px;
  overflow-x: auto;
  padding: 8px 2px 16px;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
}

.b45-card-rail::-webkit-scrollbar {
  display: none;
}

.b45-card-rail button {
  position: relative;
  min-height: 280px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 18px;
  background: rgba(0, 0, 0, .32);
  color: #fff;
  text-align: left;
  cursor: pointer;
  scroll-snap-align: start;
  transition: transform .25s ease, border-color .25s ease, opacity .25s ease;
}

.b45-card-rail button:not(.active) {
  opacity: .72;
}

.b45-card-rail button:hover,
.b45-card-rail button.active {
  transform: translateY(-8px);
  opacity: 1;
  border-color: rgba(244, 201, 93, .75);
}

.b45-card-rail img {
  width: 100%;
  height: 100%;
  min-height: 280px;
  object-fit: cover;
}

.b45-card-rail button::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0, 0, 0, .92), transparent 58%);
}

.b45-card-rail span,
.b45-card-rail b {
  position: absolute;
  z-index: 2;
  left: 15px;
  right: 15px;
}

.b45-card-rail span {
  bottom: 48px;
  color: var(--b45-gold);
  font-size: 9px;
  letter-spacing: .13em;
}

.b45-card-rail b {
  bottom: 20px;
  font-size: 14px;
}

.b45-controls {
  margin-top: 8px;
  display: grid;
  grid-template-columns: 48px 48px 1fr auto;
  gap: 12px;
  align-items: center;
}

.b45-controls > button {
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, .35);
  border-radius: 50%;
  background: rgba(0, 0, 0, .22);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.b45-progress {
  height: 1px;
  background: rgba(255, 255, 255, .28);
  overflow: hidden;
}

.b45-progress span {
  display: block;
  height: 100%;
  background: var(--b45-gold);
  transition: width .35s ease;
}

.b45-controls strong {
  min-width: 42px;
  font-size: 27px;
  letter-spacing: -.04em;
}

.b45-current {
  position: absolute;
  right: 26px;
  top: 100px;
  z-index: 4;
  display: grid;
  justify-items: end;
  gap: 3px;
  text-align: right;
}

.b45-current small {
  color: var(--b45-gold);
  letter-spacing: .16em;
  font-size: 9px;
}

.b45-current b {
  font-size: 14px;
}

.b45-current a {
  color: rgba(255, 255, 255, .65);
  font-size: 10px;
  text-decoration: none;
}

.b45-scroll {
  position: absolute;
  z-index: 4;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, .54);
  text-transform: uppercase;
  letter-spacing: .15em;
  font-size: 9px;
  text-decoration: none;
}

@keyframes b45-slow-zoom {
  from { transform: scale(1.035); }
  to { transform: scale(1.09); }
}

@media (max-width: 1000px) {
  .b45-header {
    grid-template-columns: auto 1fr;
  }

  .b45-nav {
    display: none;
  }

  .b45-header-actions {
    justify-self: end;
  }

  .b45-content {
    grid-template-columns: 1fr;
    align-items: end;
    padding-top: 92px;
  }

  .b45-showcase {
    max-width: 100%;
  }

  .b45-card-rail {
    grid-auto-columns: minmax(170px, 34vw);
  }

  .b45-current {
    top: 94px;
  }
}

@media (max-width: 640px) {
  .b45-hero {
    min-height: auto;
  }

  .b45-header {
    width: min(100% - 28px, 1180px);
    padding-top: 16px;
    gap: 10px;
  }

  .b45-brand img {
    width: 39px;
    height: 39px;
  }

  .b45-brand b {
    font-size: 12px;
  }

  .b45-brand small {
    display: none;
  }

  .b45-header-actions button {
    display: none;
  }

  .b45-header-actions a {
    padding: 10px 14px;
    font-size: 11px;
  }

  .b45-content {
    width: min(100% - 28px, 1180px);
    min-height: 760px;
    padding: 90px 0 70px;
    gap: 42px;
  }

  .b45-copy h1 {
    font-size: clamp(47px, 15vw, 66px);
  }

  .b45-lead {
    font-size: 13px;
  }

  .b45-proof {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .b45-proof div {
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 10px;
  }

  .b45-card-rail {
    grid-auto-columns: minmax(155px, 62vw);
  }

  .b45-card-rail button,
  .b45-card-rail img {
    min-height: 230px;
  }

  .b45-current {
    display: none;
  }

  .b45-controls {
    grid-template-columns: 44px 44px 1fr auto;
  }

  .b45-controls > button {
    width: 44px;
    height: 44px;
  }

  .b45-scroll {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .b45-hero-video video {
    animation: none;
  }

  .b45-card-rail button {
    transition: none;
  }
}

/* BUILD 46 — ADMIN-MANAGED HOMEPAGE MEDIA */
.dynamic-new-menu {
  display: grid;
  grid-template-columns: minmax(0, .86fr) minmax(360px, 1.14fr);
  gap: clamp(30px, 6vw, 84px);
  align-items: center;
  overflow: hidden;
  border-top: 1px solid rgba(244, 201, 93, .16);
  border-bottom: 1px solid rgba(244, 201, 93, .16);
  background:
    radial-gradient(circle at 15% 18%, rgba(244, 201, 93, .08), transparent 30%),
    linear-gradient(135deg, rgba(19, 16, 10, .96), rgba(4, 6, 5, .98));
}

.dynamic-new-menu-copy small {
  color: #f4c95d;
  letter-spacing: .22em;
  font-weight: 900;
}

.dynamic-new-menu-copy h2 {
  max-width: 620px;
  margin: 14px 0;
  font-size: clamp(42px, 6vw, 78px);
  line-height: .96;
  letter-spacing: -.05em;
}

.dynamic-new-menu-copy p {
  max-width: 580px;
  color: rgba(255,255,255,.62);
  line-height: 1.75;
}

.dynamic-new-menu-actions {
  margin-top: 25px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.dynamic-new-menu-image {
  position: relative;
  min-height: 630px;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid rgba(244, 201, 93, .25);
  background: #e9ddcd;
}

.dynamic-new-menu-image img {
  width: 100%;
  height: 100%;
  min-height: 630px;
  object-fit: cover;
  display: block;
}

.dynamic-new-menu-image span {
  position: absolute;
  left: 18px;
  bottom: 18px;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgba(0,0,0,.72);
  color: #f4c95d;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .14em;
}

.dynamic-media-empty {
  min-height: 260px;
  display: grid;
  place-items: center;
  border: 1px dashed rgba(255,255,255,.14);
  border-radius: 24px;
  color: rgba(255,255,255,.46);
  text-align: center;
  padding: 30px;
}

.dynamic-album-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(250px, 32%);
  gap: 18px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: 12px;
}

.dynamic-album-grid::-webkit-scrollbar {
  display: none;
}

.dynamic-album-card {
  position: relative;
  min-height: 390px;
  overflow: hidden;
  border-radius: 26px;
  border: 1px solid rgba(255,255,255,.1);
  background: #090a09;
  scroll-snap-align: start;
  cursor: pointer;
}

.dynamic-album-card img {
  width: 100%;
  height: 100%;
  min-height: 390px;
  object-fit: cover;
  display: block;
  transition: transform .35s ease;
}

.dynamic-album-card:hover img {
  transform: scale(1.035);
}

.dynamic-album-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, rgba(0,0,0,.9), transparent 60%);
}

.dynamic-album-card div {
  position: absolute;
  z-index: 2;
  left: 18px;
  right: 18px;
  bottom: 18px;
}

.dynamic-album-card small {
  color: #f4c95d;
  letter-spacing: .14em;
  font-weight: 900;
}

.dynamic-album-card h3 {
  margin: 7px 0 0;
  font-size: 24px;
}

.dynamic-album-card p {
  margin: 8px 0 0;
  color: rgba(255,255,255,.62);
  line-height: 1.5;
}

.dynamic-media-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(0,0,0,.88);
  backdrop-filter: blur(14px);
}

.dynamic-media-modal > div {
  position: relative;
  width: min(920px, 100%);
  max-height: 92vh;
  overflow: auto;
  border-radius: 28px;
  background: #090a09;
  border: 1px solid rgba(244,201,93,.2);
}

.dynamic-media-modal button {
  position: absolute;
  z-index: 3;
  right: 14px;
  top: 14px;
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 50%;
  background: rgba(0,0,0,.72);
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}

.dynamic-media-modal img {
  width: 100%;
  max-height: 76vh;
  object-fit: contain;
  background: #000;
}

.dynamic-media-modal footer {
  padding: 20px;
}

.dynamic-media-modal footer small {
  color: #f4c95d;
  letter-spacing: .14em;
}

.dynamic-media-modal footer h3 {
  margin: 7px 0 0;
  font-size: 28px;
}

.dynamic-media-modal footer p {
  color: rgba(255,255,255,.62);
}

@media (max-width: 900px) {
  .dynamic-new-menu {
    grid-template-columns: 1fr;
  }

  .dynamic-new-menu-image,
  .dynamic-new-menu-image img {
    min-height: 480px;
  }

  .dynamic-album-grid {
    grid-auto-columns: minmax(250px, 72vw);
  }
}

@media (max-width: 560px) {
  .dynamic-new-menu-image,
  .dynamic-new-menu-image img {
    min-height: 420px;
  }

  .dynamic-album-card,
  .dynamic-album-card img {
    min-height: 330px;
  }
}

`}</style>
      <section
        ref={heroSection}
        className="b45-hero"
        style={{ backgroundImage: `url(${activeHero.background})` }}
      >
        <div className="b45-hero-video" aria-hidden="true">
          <video
            ref={cafeVideo}
            src="/videos/syp-cafe-background.mp4"
            autoPlay
            muted={videoMuted}
            loop
            playsInline
            poster={activeHero.background}
          />
        </div>
        <div className="b45-overlay" />

        <header className="b45-header">
          <Link href="/" className="b45-brand" aria-label="SYP ON CAFÉ home">
            <img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" />
            <span>
              <b>SYP ON CAFÉ</b>
              <small>STREET • ICED • BREWED</small>
            </span>
          </Link>

          <nav className="b45-nav" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <Link href="/menu">Menu</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/moments">Coffee Moments</Link>
            <Link href="/contact">Visit Us</Link>
          </nav>

          <div className="b45-header-actions">
            <button
              type="button"
              onClick={toggleVideoSound}
              aria-label={videoMuted ? "Turn hero sound on" : "Mute hero video"}
            >
              {videoMuted ? "Sound off" : "Sound on"}
            </button>
            <Link href="/menu">Order Now</Link>
          </div>
        </header>

        <div className="b45-content">
          <div className="b45-copy">
            <div className="b45-eyebrow">
              <span />
              <p>Open daily • 5PM–4AM</p>
            </div>

            <h1>
              Your night.<br />
              Your coffee.<br />
              <em>Your SYP.</em>
            </h1>

            <p className="b45-lead">
              Street-style coffee, late-night comfort, and real KaSYP moments
              in one place. Order your favorite drink and make tonight better.
            </p>

            <div className="b45-cta">
              <span>★</span>
              <Link href="/menu">Start your order</Link>
              <Link href="/moments">See KaSYP moments</Link>
            </div>

            <div className="b45-proof">
              <div>
                <b>5PM–4AM</b>
                <small>Open daily</small>
              </div>
              <div>
                <b>10 stamps</b>
                <small>Free drink reward</small>
              </div>
              <div>
                <b>Apollo</b>
                <small>Orani, Bataan</small>
              </div>
            </div>
          </div>

          <div className="b45-showcase">
            <div className="b45-card-rail">
              {heroSlides.map((slide, index) => (
                <button
                  type="button"
                  key={slide.name}
                  onClick={() => setHeroIndex(index)}
                  className={index === heroIndex ? "active" : ""}
                  aria-label={`Show ${slide.name}`}
                >
                  <img src={slide.image} alt={slide.name} />
                  <span>{slide.label}</span>
                  <b>{slide.name}</b>
                </button>
              ))}
            </div>

            <div className="b45-controls">
              <button
                type="button"
                onClick={() => moveHero(-1)}
                aria-label="Previous featured drink"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => moveHero(1)}
                aria-label="Next featured drink"
              >
                →
              </button>
              <div className="b45-progress">
                <span style={{ width: `${((heroIndex + 1) / heroSlides.length) * 100}%` }} />
              </div>
              <strong>{String(heroIndex + 1).padStart(2, "0")}</strong>
            </div>
          </div>
        </div>

        <div className="b45-current">
          <small>{activeHero.label}</small>
          <b>{activeHero.name}</b>
          <Link href="/menu">Order this drink →</Link>
        </div>

        <a className="b45-scroll" href="#featured-drinks" aria-label="Scroll to featured drinks">
          Scroll to explore ↓
        </a>
      </section>

      <section className="site-section dynamic-new-menu">
        <div className="dynamic-new-menu-copy">
          <small>NEW MENU SPOTLIGHT • EDITABLE IN ADMIN</small>
          <h2>{newMenuMedia?.title || "Egg Brulee Collection"}</h2>
          <p>
            {newMenuMedia?.caption ||
              "Creamy, silky egg brulee with a caramelized finish—available in Matcha Egg Brulee and Egg Brulee Coffee."}
          </p>
          <div className="dynamic-new-menu-actions">
            <Link className="gold-button" href={newMenuMedia?.link_url || "/menu"}>
              View New Menu
            </Link>
            <Link className="ghost-button" href="/moments">
              View Coffee Moments
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="dynamic-new-menu-image"
          onClick={() => newMenuMedia && setActiveMedia(newMenuMedia)}
          aria-label="View new menu poster"
        >
          <img
            src={newMenuMedia?.image_url || "/brand/syp-logo-glow-v2.webp"}
            alt={newMenuMedia?.title || "SYP ON CAFÉ new menu"}
          />
          <span>{newMenuMedia?.badge || "UPLOAD NEW MENU IN ADMIN"}</span>
        </button>
      </section>

      <section id="featured-drinks" className="site-section featured-album-section">
        <div className="section-heading">
          <div>
            <small>DAILY DRINK ALBUM</small>
            <h2>Fresh featured drinks, updated anytime.</h2>
          </div>
          <div className="rail-actions">
            <button type="button" onClick={() => moveRail(featuredRail, -1)} aria-label="Scroll drink album left">←</button>
            <button type="button" onClick={() => moveRail(featuredRail, 1)} aria-label="Scroll drink album right">→</button>
            <Link href="/menu">View full menu</Link>
          </div>
        </div>

        {mediaLoading ? (
          <div className="dynamic-media-empty">Loading today’s drink album…</div>
        ) : drinkAlbumMedia.length ? (
          <div className="dynamic-album-grid" ref={featuredRail}>
            {drinkAlbumMedia.map((item) => (
              <button
                type="button"
                className="dynamic-album-card"
                key={item.id}
                onClick={() => setActiveMedia(item)}
              >
                <img src={item.image_url} alt={item.title} loading="lazy" />
                <div>
                  <small>{item.badge || "FEATURED DRINK"}</small>
                  <h3>{item.title}</h3>
                  {item.caption && <p>{item.caption}</p>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="dynamic-media-empty">
            No drink album photos yet. Upload today’s photos from Admin → Homepage Media.
          </div>
        )}
      </section>

      <section className="site-section community-showcase">
        <div className="community-feed">
          <div className="section-heading">
            <div>
              <small>RECENT KASYP MOMENTS</small>
              <h2>Real customers. Real coffee moments.</h2>
            </div>
            <div className="rail-actions">
              <button type="button" onClick={() => moveRail(communityRail, -1)} aria-label="Scroll coffee moments left">←</button>
              <button type="button" onClick={() => moveRail(communityRail, 1)} aria-label="Scroll coffee moments right">→</button>
              <Link href="/moments">View full gallery</Link>
            </div>
          </div>

          {mediaLoading ? (
            <div className="dynamic-media-empty">Loading Coffee Moments…</div>
          ) : coffeeMomentMedia.length ? (
            <div className="dynamic-album-grid" ref={communityRail}>
              {coffeeMomentMedia.map((item) => (
                <button
                  type="button"
                  className="dynamic-album-card"
                  key={item.id}
                  onClick={() => setActiveMedia(item)}
                >
                  <img src={item.image_url} alt={item.title} loading="lazy" />
                  <div>
                    <small>{item.badge || "KASYP MOMENT"}</small>
                    <h3>{item.title}</h3>
                    {item.caption && <p>{item.caption}</p>}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="dynamic-media-empty">
              No Coffee Moments yet. Upload customer photos from Admin → Homepage Media.
            </div>
          )}
        </div>

        <aside className="community-promo-card">
          <img src="/brand/syp-logo-clean-v2.webp" alt="SYP ON CAFÉ official logo" />
          <small>KASYP COMMUNITY GALLERY</small>
          <h3>Real coffee. Real customers. Real moments.</h3>
          <p>Browse customer memories, featured drinks, and reward celebrations from the SYP ON CAFÉ community.</p>
          <Link href="/moments">View all Coffee Moments →</Link>
        </aside>
      </section>

      <section className="site-section featured-album-section">
        <div className="section-heading">
          <div>
            <small>CLAIMED DRINKS & REWARDS</small>
            <h2>KaSYP rewards, proudly claimed.</h2>
          </div>
          <Link href="/member-register">Join SYP Rewards</Link>
        </div>

        {mediaLoading ? (
          <div className="dynamic-media-empty">Loading claimed rewards…</div>
        ) : claimedDrinkMedia.length ? (
          <div className="dynamic-album-grid">
            {claimedDrinkMedia.map((item) => (
              <button
                type="button"
                className="dynamic-album-card"
                key={item.id}
                onClick={() => setActiveMedia(item)}
              >
                <img src={item.image_url} alt={item.title} loading="lazy" />
                <div>
                  <small>{item.badge || "REWARD CLAIMED"}</small>
                  <h3>{item.title}</h3>
                  {item.caption && <p>{item.caption}</p>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="dynamic-media-empty">
            Claimed rewards will appear here after they are added by SYP ON CAFÉ.
          </div>
        )}
      </section>

      <section className="site-section member-banner">
        <div className="member-banner-copy"><small>SYP DIGITAL MEMBERSHIP</small><h2>Every visit becomes part of your coffee story.</h2><p>Track stamps, café visits, birthday rewards, referrals, favorite drinks, and exclusive prizes.</p><div className="redeem-proof"><img src="/community/IMG_3227.webp" alt="KaSYP member holding her free loyalty drink" loading="lazy" /><span><b>Loyalty Free Drink Redeemed</b><small>Complete 10 stamps and enjoy your reward.</small></span></div><Link className="gold-button" href="/member-register">Create Free Membership</Link></div>
        <div className="membership-card"><div><span><b>SYP ON CAFÉ</b><small>DIGITAL MEMBER</small></span><i>JD</i></div><h3>JUAN DELA CRUZ</h3><p>SYP0021 • TRUSTED MEMBER</p><section>{Array.from({ length: 10 }, (_, i) => <span className={i < 6 ? "filled" : ""} key={i}>{i < 6 ? "★" : i + 1}</span>)}</section><footer><b>6 / 10 STAMPS</b><span>4 more to a free drink</span></footer></div>
      </section>

      <section className="site-section real-review-cta"><div><small>REAL CUSTOMER RATINGS ONLY</small><h2>No demo reviews. Every rating comes from a real completed SYP order.</h2><p>Customers can submit one verified rating after their order is completed. Approved ratings appear on the Reviews page.</p></div><Link className="gold-button" href="/reviews">View Real Reviews</Link></section>

      <section className="site-section visit-section"><div><small>DELIVERY & PICKUP</small><h2>Order your favorites in a few taps.</h2><p>Browse the live menu, customize your drink, and continue to checkout.</p><div className="hero-actions"><Link className="gold-button" href="/menu">Start an Order</Link><Link className="ghost-button" href="/contact">Visit the Café</Link></div></div><div className="visit-details"><article><span>01</span><b>Choose your drink</b><small>Actual photos, sizes, and add-ons.</small></article><article><span>02</span><b>Review your cart</b><small>See the complete total before checkout.</small></article><article><span>03</span><b>Track your order</b><small>Follow preparation and delivery status.</small></article></div></section>

      <footer className="site-footer"><div className="site-brand"><img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" /><div><b>SYP ON CAFÉ</b><small>APOLLO, ORANI, BATAAN</small></div></div><p>Besides 7-Eleven & in front of Mangan Tamu • Open daily 5PM–4AM</p><nav><Link href="/menu">Menu</Link><Link href="/about">About</Link><Link href="/contact">Visit</Link><Link href="/member-login">Member portal</Link></nav></footer>

      <nav className="mobile-quick-bar" aria-label="Quick actions"><Link href="/menu">Order</Link><Link href="/menu">Menu</Link><Link href="/member-login">Rewards</Link></nav>

      {activeMedia && (
        <div
          className="dynamic-media-modal"
          role="dialog"
          aria-modal="true"
          aria-label={activeMedia.title}
          onClick={() => setActiveMedia(null)}
        >
          <div onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setActiveMedia(null)} aria-label="Close image">×</button>
            <img src={activeMedia.image_url} alt={activeMedia.title} />
            <footer>
              <small>{activeMedia.badge || activeMedia.section.replace("_", " ").toUpperCase()}</small>
              <h3>{activeMedia.title}</h3>
              {activeMedia.caption && <p>{activeMedia.caption}</p>}
            </footer>
          </div>
        </div>
      )}

      {activeDrink && <div className="poster-modal" role="dialog" aria-modal="true" aria-label={`${activeDrink.name} poster`} onClick={() => setActiveDrink(null)}><div onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setActiveDrink(null)} aria-label="Close poster">×</button><img src={activeDrink.poster} alt={`${activeDrink.name} full promotional poster`} /><footer><div><small>{activeDrink.category}</small><h3>{activeDrink.name}</h3></div><Link className="gold-button" href="/menu">Order Now</Link></footer></div></div>}
    </main>
  );
}