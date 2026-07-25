"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

const reviews = [
  { name: "Angeline", stars: 5, drink: "Spanish Latte", text: "Smooth, hindi sobrang tamis at bagay sa late-night tambay.", date: "Verified visit" },
  { name: "Keith", stars: 5, drink: "SYP White Rush", text: "Creamy at premium ang lasa. Ito na ang favorite ko.", date: "Verified order" },
  { name: "Mika", stars: 5, drink: "Biscoff Matcha", text: "Creamy matcha, malinaw ang Biscoff flavor at sulit ang size.", date: "Loyalty member" },
];

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const [activeDrink, setActiveDrink] = useState<FeaturedDrink | null>(null);
  const categories = ["All", "Coffee", "Matcha", "Milky", "Signature"];
  const shown = useMemo(() => category === "All" ? drinks : drinks.filter((drink) => drink.category === category), [category]);

  return (
    <main className="site-shell">
      <header className="site-nav">
        <Link className="site-brand" href="/"><span>SYP</span><div><b>SYP ON CAFÉ</b><small>STREET • ICED • BREWED</small></div></Link>
        <nav><Link href="/menu">Menu</Link><Link href="/reviews">Reviews</Link><Link href="/moments">Coffee Moments</Link><Link href="/about">About</Link><Link href="/contact">Visit</Link></nav>
        <Link className="site-order" href="/menu">Order Now</Link>
      </header>

      <section className="site-hero visual-hero">
        <div className="hero-copy">
          <span className="hero-kicker">OPEN DAILY • 5PM–4AM</span>
          <h1>Your late-night coffee, now closer.</h1>
          <p>Browse the actual SYP ON CAFÉ menu, discover featured drinks, order online, and collect rewards in one premium café experience.</p>
          <div className="hero-actions"><Link className="gold-button" href="/menu">Explore the Menu</Link><Link className="ghost-button" href="/member-register">Join SYP Rewards</Link></div>
          <div className="hero-proof"><div><b>4.9</b><span>Average rating</span></div><div><b>11</b><span>Featured drinks</span></div><div><b>10</b><span>Stamps = reward</span></div></div>
        </div>
        <div className="hero-product-photo">
          <span className="preview-tag">MOST LOVED</span>
          <img src="/featured/spanish-latte.webp" alt="Spanish Latte featured drink" />
          <div><small>COFFEE COLLECTION</small><h2>Spanish Latte</h2><p>Bold espresso meets sweet, creamy condensed milk.</p><strong>Starts at ₱89</strong></div>
        </div>
      </section>

      <section className="site-section featured-album-section">
        <div className="section-heading"><div><small>FEATURED DRINK PICTURE ALBUM</small><h2>See the drink before you order.</h2></div><Link href="/menu">View full menu →</Link></div>
        <div className="category-pills">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}</div>
        <div className="featured-photo-grid">{shown.map((drink) => <article className="photo-drink-card" key={drink.name}>
          <button type="button" className="photo-button" onClick={() => setActiveDrink(drink)} aria-label={`View ${drink.name} poster`}>
            <img src={drink.poster} alt={`${drink.name} promotional poster`} loading="lazy" />
            {drink.tag && <span>{drink.tag}</span>}
          </button>
          <div><small>{drink.category} Collection</small><h3>{drink.name}</h3><p>{drink.note}</p><div className="drink-meta"><strong>{drink.price}</strong><span>★ {drink.rating} <em>({drink.reviews})</em></span></div><Link href="/menu">Preview & order</Link></div>
        </article>)}</div>
      </section>

      <section className="site-section member-banner">
        <div><small>SYP DIGITAL MEMBERSHIP</small><h2>Every visit becomes part of your coffee story.</h2><p>Track stamps, café visits, birthday rewards, referrals, favorite drinks, and exclusive prizes.</p><Link className="gold-button" href="/member-register">Create Free Membership</Link></div>
        <div className="membership-card"><div><span><b>SYP ON CAFÉ</b><small>DIGITAL MEMBER</small></span><i>JD</i></div><h3>JUAN DELA CRUZ</h3><p>SYP0021 • TRUSTED MEMBER</p><section>{Array.from({ length: 10 }, (_, i) => <span className={i < 6 ? "filled" : ""} key={i}>{i < 6 ? "★" : i + 1}</span>)}</section><footer><b>6 / 10 STAMPS</b><span>4 more to a free drink</span></footer></div>
      </section>

      <section className="site-section review-section">
        <div className="section-heading"><div><small>REAL SYP EXPERIENCES</small><h2>Loved by our KaSYP community</h2></div><Link href="/reviews">See all reviews →</Link></div>
        <div className="review-grid">{reviews.map((review) => <article key={review.name}><div><span>{review.name.slice(0, 1)}</span><div><b>{review.name}</b><small>{review.date}</small></div><em>{"★".repeat(review.stars)}</em></div><p>“{review.text}”</p><footer>Ordered: <b>{review.drink}</b></footer></article>)}</div>
      </section>

      <section className="site-section visit-section"><div><small>DELIVERY & PICKUP</small><h2>Order your favorites in a few taps.</h2><p>Browse the live menu, customize your drink, and continue to checkout.</p><div className="hero-actions"><Link className="gold-button" href="/menu">Start an Order</Link><Link className="ghost-button" href="/contact">Visit the Café</Link></div></div><div className="visit-details"><article><span>01</span><b>Choose your drink</b><small>Actual photos, sizes, and add-ons.</small></article><article><span>02</span><b>Review your cart</b><small>See the complete total before checkout.</small></article><article><span>03</span><b>Track your order</b><small>Follow preparation and delivery status.</small></article></div></section>

      <footer className="site-footer"><div className="site-brand"><span>SYP</span><div><b>SYP ON CAFÉ</b><small>APOLLO, ORANI, BATAAN</small></div></div><p>Besides 7-Eleven & in front of Mangan Tamu • Open daily 5PM–4AM</p><nav><Link href="/menu">Menu</Link><Link href="/about">About</Link><Link href="/contact">Visit</Link><Link href="/member-login">Member portal</Link></nav></footer>

      {activeDrink && <div className="poster-modal" role="dialog" aria-modal="true" aria-label={`${activeDrink.name} poster`} onClick={() => setActiveDrink(null)}><div onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setActiveDrink(null)} aria-label="Close poster">×</button><img src={activeDrink.poster} alt={`${activeDrink.name} full promotional poster`} /><footer><div><small>{activeDrink.category}</small><h3>{activeDrink.name}</h3></div><Link className="gold-button" href="/menu">Order Now</Link></footer></div></div>}
    </main>
  );
}
