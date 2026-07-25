"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import "./site.css";

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

const communityMoments = [
  { image: "/community-v2/barkada-board-games.webp", title: "Barkada Game Night", caption: "Coffee, board games, and late-night kwentuhan with the KaSYP barkada.", badge: "BARKADA MOMENT" },
  { image: "/community-v2/cafe-barkada-selfie.webp", title: "Tropang SYP", caption: "A real café hangout shared by friends who keep coming back for good drinks and good vibes.", badge: "KASYP FAMILY" },
  { image: "/community-v2/barkada-tambay-collage.webp", title: "Coffee Tastes Better Together", caption: "Group drinks, mirror shots, and memories made at the café.", badge: "BARKADA FAVORITE" },
  { image: "/community-v2/coffee-fries-barkada.webp", title: "Coffee, Fries, and Tambay", caption: "A simple night made better with drinks, fries, games, and friends.", badge: "CAFE NIGHT" },
  { image: "/community-v2/mirror-selfie-regular.webp", title: "Mandatory Mirror Selfie", caption: "A regular KaSYP tradition—one mirror selfie before heading home.", badge: "MIRROR MOMENT" },
  { image: "/community-v2/coffee-buddy-night.webp", title: "Coffee Buddy Night", caption: "Two cups, one late-night story, and another SYP memory.", badge: "LATE-NIGHT KASYP" },
];

const loyaltyHighlights = [
  { image: "/community-v2/most-loyal-customer.webp", title: "Loyalty Legend", subtitle: "Always supporting, always sharing", copy: "A true KaSYP regular who keeps choosing SYP ON CAFÉ and proudly shares the journey." },
  { image: "/community-v2/loyalty-card-queen.webp", title: "Story Star", subtitle: "Caught posting again", copy: "One of our most active supporters—always tagging, posting, and spreading the SYP coffee love." },
  { image: "/community-v2/new-loyalty-card.webp", title: "New Card, Same Favorite Shop", subtitle: "Another loyalty journey begins", copy: "A fresh card for a loyal customer who keeps coming back, one stamp at a time." },
  { image: "/community-v2/free-drink-supporter.webp", title: "Reward Winner", subtitle: "Free coffee unlocked", copy: "Ten stamps completed and another well-deserved SYP reward claimed." },
];

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const [activeDrink, setActiveDrink] = useState<FeaturedDrink | null>(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoMini, setVideoMini] = useState(false);
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

  return (
    <main>
      <header className="site-header">
        <Link href="/" className="site-brand" aria-label="SYP ON CAFÉ home">
          <img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" />
          <div><b>SYP ON CAFÉ</b><small>STREET • ICED • BREWED</small></div>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/menu">Menu</Link><Link href="/reviews">Reviews</Link><Link href="/moments">Coffee Moments</Link><Link href="/about">About</Link><Link href="/contact">Visit</Link>
        </nav>
        <div className="site-header-actions">
          <Link href="/member-login" className="header-login-button">Login</Link>
          <Link href="/member-register" className="header-create-button">Create Account</Link>
          <Link href="/menu" className="gold-button">Order Now</Link>
        </div>
      </header>

      <section ref={heroSection} className="hero-section cinematic-hero">
        {!videoMini && renderCafeVideo(false)}
        <div className="hero-copy cinematic-copy">
          <span className="hero-kicker">OPEN DAILY • 5PM–4AM</span>
          <h1>Your late-night coffee, now closer.</h1>
          <p>Browse the actual SYP ON CAFÉ menu, discover featured drinks, order online, and collect rewards in one premium café experience.</p>
          <div className="hero-actions"><Link className="gold-button" href="/menu">Explore the Menu</Link><Link className="ghost-button" href="/member-register">Join SYP Rewards</Link></div>
          <div className="hero-proof"><div><b>4.9</b><span>Average rating</span></div><div><b>11</b><span>Featured drinks</span></div><div><b>10</b><span>Stamps = reward</span></div></div>
        </div>
        <div className="hero-featured-chip">
          <img src="/featured/biscoff-matcha.webp" alt="Biscoff Matcha featured drink" />
          <div><small>FEATURED DRINK</small><b>Biscoff Matcha</b><span>Starts at ₱119</span></div>
          <Link href="/menu">Order →</Link>
        </div>
      </section>

      {videoMini && renderCafeVideo(true)}

      <section className="site-section featured-album-section">
        <div className="section-heading">
          <div><small>FEATURED DRINK PICTURE ALBUM</small><h2>Swipe left or right to explore.</h2></div>
          <div className="rail-actions"><button type="button" onClick={() => moveRail(featuredRail, -1)} aria-label="Scroll featured drinks left">←</button><button type="button" onClick={() => moveRail(featuredRail, 1)} aria-label="Scroll featured drinks right">→</button><Link href="/menu">View full menu</Link></div>
        </div>
        <div className="category-pills">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}</div>
        <div className="featured-photo-grid horizontal-rail" ref={featuredRail}>
          {shown.map((drink) => (
            <article className="photo-drink-card" key={drink.name}>
              <button type="button" className="photo-button" onClick={() => setActiveDrink(drink)} aria-label={`View ${drink.name} poster`}>
                <img src={drink.poster} alt={`${drink.name} promotional poster`} loading="lazy" />
                {drink.tag && <span>{drink.tag}</span>}
              </button>
              <div><small>{drink.category} Collection</small><h3>{drink.name}</h3><p>{drink.note}</p><div className="drink-meta"><strong>{drink.price}</strong><span>★ {drink.rating} <em>({drink.reviews})</em></span></div><Link href="/menu">Preview & order</Link></div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-section community-showcase">
        <div className="community-feed">
          <div className="section-heading">
            <div><small>RECENT KASYP MOMENTS</small><h2>Real customers. Real coffee moments.</h2></div>
            <div className="rail-actions"><button type="button" onClick={() => moveRail(communityRail, -1)} aria-label="Scroll customer photos left">←</button><button type="button" onClick={() => moveRail(communityRail, 1)} aria-label="Scroll customer photos right">→</button><Link href="/moments">View album</Link></div>
          </div>
          <div className="community-album horizontal-rail" ref={communityRail}>
            {communityMoments.map((moment) => <article key={moment.image}><img src={moment.image} alt={moment.title} loading="lazy" /><div><small>{moment.badge}</small><h3>{moment.title}</h3><p>{moment.caption}</p></div></article>)}
          </div>
        </div>
        <aside className="community-promo-card"><img src="/brand/syp-logo-clean-v2.webp" alt="SYP ON CAFÉ official logo" /><small>YOUR KASYP COMMUNITY</small><h3>Real coffee. Real customers. Real moments.</h3><p>Share your favorite SYP moment and be part of the next customer album.</p><Link href="/moments">View all moments →</Link></aside>
      </section>

      <section className="site-section loyalty-spotlight-section">
        <div className="section-heading"><div><small>KASYP HALL OF FAME</small><h2>Celebrating our most loyal and active supporters.</h2></div><Link href="/moments">View community wall</Link></div>
        <div className="loyalty-spotlight-grid">{loyaltyHighlights.map((item) => <article key={item.image}><img src={item.image} alt={item.title} loading="lazy" /><div><span>{item.subtitle}</span><h3>{item.title}</h3><p>{item.copy}</p></div></article>)}</div>
      </section>

      <section className="site-section member-banner">
        <div className="member-banner-copy"><small>SYP DIGITAL MEMBERSHIP</small><h2>Every visit becomes part of your coffee story.</h2><p>Track stamps, café visits, birthday rewards, referrals, favorite drinks, and exclusive prizes.</p><div className="redeem-proof"><img src="/community/IMG_3227.webp" alt="KaSYP member holding her free loyalty drink" loading="lazy" /><span><b>Loyalty Free Drink Redeemed</b><small>Complete 10 stamps and enjoy your reward.</small></span></div><Link className="gold-button" href="/member-register">Create Free Membership</Link></div>
        <div className="membership-card"><div><span><b>SYP ON CAFÉ</b><small>DIGITAL MEMBER</small></span><i>JD</i></div><h3>JUAN DELA CRUZ</h3><p>SYP0021 • TRUSTED MEMBER</p><section>{Array.from({ length: 10 }, (_, i) => <span className={i < 6 ? "filled" : ""} key={i}>{i < 6 ? "★" : i + 1}</span>)}</section><footer><b>6 / 10 STAMPS</b><span>4 more to a free drink</span></footer></div>
      </section>

      <section className="site-section real-review-cta"><div><small>REAL CUSTOMER RATINGS ONLY</small><h2>No demo reviews. Every rating comes from a real completed SYP order.</h2><p>Customers can submit one verified rating after their order is completed. Approved ratings appear on the Reviews page.</p></div><Link className="gold-button" href="/reviews">View Real Reviews</Link></section>

      <section className="site-section visit-section"><div><small>DELIVERY & PICKUP</small><h2>Order your favorites in a few taps.</h2><p>Browse the live menu, customize your drink, and continue to checkout.</p><div className="hero-actions"><Link className="gold-button" href="/menu">Start an Order</Link><Link className="ghost-button" href="/contact">Visit the Café</Link></div></div><div className="visit-details"><article><span>01</span><b>Choose your drink</b><small>Actual photos, sizes, and add-ons.</small></article><article><span>02</span><b>Review your cart</b><small>See the complete total before checkout.</small></article><article><span>03</span><b>Track your order</b><small>Follow preparation and delivery status.</small></article></div></section>

      <footer className="site-footer"><div className="site-brand"><img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" /><div><b>SYP ON CAFÉ</b><small>APOLLO, ORANI, BATAAN</small></div></div><p>Besides 7-Eleven & in front of Mangan Tamu • Open daily 5PM–4AM</p><nav><Link href="/menu">Menu</Link><Link href="/about">About</Link><Link href="/contact">Visit</Link><Link href="/member-login">Member portal</Link></nav></footer>

      <nav className="mobile-quick-bar" aria-label="Quick actions"><Link href="/menu">Order</Link><Link href="/menu">Menu</Link><Link href="/member-login">Rewards</Link></nav>

      {activeDrink && <div className="poster-modal" role="dialog" aria-modal="true" aria-label={`${activeDrink.name} poster`} onClick={() => setActiveDrink(null)}><div onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setActiveDrink(null)} aria-label="Close poster">×</button><img src={activeDrink.poster} alt={`${activeDrink.name} full promotional poster`} /><footer><div><small>{activeDrink.category}</small><h3>{activeDrink.name}</h3></div><Link className="gold-button" href="/menu">Order Now</Link></footer></div></div>}
    </main>
  );
}
