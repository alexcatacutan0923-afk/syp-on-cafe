"use client";

import Link from "next/link";
import { useState } from "react";
import "../site.css";

const moments = [
  ["/community-v2/barkada-board-games.webp", "Barkada Game Night", "Board games, drinks, and late-night kwentuhan."],
  ["/community-v2/cafe-barkada-selfie.webp", "Tropang SYP", "Friends who made the café part of their story."],
  ["/community-v2/barkada-tambay-collage.webp", "Coffee Tastes Better Together", "A collage of real KaSYP moments."],
  ["/community-v2/coffee-fries-barkada.webp", "Coffee, Fries, and Tambay", "The complete late-night café setup."],
  ["/community-v2/mirror-selfie-regular.webp", "Mandatory Mirror Selfie", "A favorite stop before going home."],
  ["/community-v2/coffee-buddy-night.webp", "Coffee Buddy Night", "Two drinks and one good story."],
  ["/community-v2/loyalty-wall-fun.webp", "The Loyalty Wall", "A playful customer-made SYP tradition."],
  ["/community-v2/sticker-wall-story.webp", "Caught Sharing", "A KaSYP supporter posting the loyalty wall again."],
  ["/community-v2/loyalty-wall-organizing.webp", "Sticker by Sticker", "Another step toward a free drink."],
  ["/community-v2/free-drink-supporter.webp", "Reward Winner", "Free coffee unlocked after completing the journey."],
  ["/community-v2/late-night-loyalty.webp", "Late-Night Loyalty", "A loyal customer enjoying another café visit."],
  ["/community-v2/kasyp-home-away.webp", "KaSYP Home Away From Home", "A community built around coffee and friendship."],
] as const;

export default function MomentsPage() {
  const [active, setActive] = useState<(typeof moments)[number] | null>(null);
  return <main className="site-shell subpage-shell">
    <header className="site-nav"><Link className="site-brand" href="/"><img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" /><div><b>SYP ON CAFÉ</b><small>COFFEE MOMENTS</small></div></Link><nav><Link href="/menu">Menu</Link><Link href="/reviews">Reviews</Link><Link href="/member-login">Rewards</Link></nav><Link className="site-order" href="/menu">Order Now</Link></header>
    <section className="subpage-hero"><small>THE KASYP GALLERY</small><h1>Every cup has a story.</h1><p>Barkada nights, mirror selfies, loyalty milestones, and real moments shared by the SYP ON CAFÉ community.</p></section>
    <section className="site-section moments-masonry">{moments.map((item) => <button type="button" key={item[0]} onClick={() => setActive(item)}><img src={item[0]} alt={item[1]} loading="lazy" /><span><small>KASYP MOMENT</small><b>{item[1]}</b><em>{item[2]}</em></span></button>)}</section>
    {active && <div className="moment-lightbox" role="dialog" aria-modal="true" onClick={() => setActive(null)}><div onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setActive(null)}>×</button><img src={active[0]} alt={active[1]} /><footer><b>{active[1]}</b><span>{active[2]}</span></footer></div></div>}
  </main>;
}
