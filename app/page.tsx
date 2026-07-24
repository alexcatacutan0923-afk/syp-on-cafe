"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import "./site.css";

type FeaturedDrink = {
  name: string;
  category: string
  price: string;
  rating: string;
  reviews: number;
  emoji: string;
  note: string;
  tag?: string;
};

const drinks: FeaturedDrink[] = [
  { name: "Spanish Latte", category: "Coffee Collection", price: "₱89", rating: "4.9", reviews: 126, emoji: "☕", note: "Creamy, balanced and café-favorite.", tag: "BEST SELLER" },
  { name: "Hot Salted Caramel", category: "Hot Coffee Collection", price: "₱99", rating: "4.9", reviews: 74, emoji: "♨", note: "Warm espresso with a sweet-salty finish.", tag: "NEW HOT" },
  { name: "Biscoff Matcha", category: "Matcha Collection", price: "₱119", rating: "4.8", reviews: 91, emoji: "🍵", note: "Earthy matcha with caramelized biscuit notes." },
  { name: "SYP Choco Boom", category: "Signature Collection", price: "₱99", rating: "4.8", reviews: 83, emoji: "🍫", note: "Bold chocolate and espresso signature blend." },
  { name: "Milo Dino", category: "Milky Collection", price: "₱79", rating: "4.7", reviews: 68, emoji: "🥛", note: "Rich milky Milo topped for extra comfort." },
  { name: "SYP Bites", category: "Fries Collection", price: "₱49", rating: "4.7", reviews: 52, emoji: "🍟", note: "Crispy flavored fries, perfect with coffee." },
];

const reviews = [
  { name: "Angeline", stars: 5, drink: "Spanish Latte", text: "Smooth, hindi sobrang tamis at bagay sa late-night tambay.", date: "Verified visit" },
  { name: "Keith", stars: 5, drink: "Hot Salted Caramel", text: "Comforting at premium ang lasa. Ito na favorite hot drink ko.", date: "Verified order" },
  { name: "Mika", stars: 5, drink: "Biscoff Matcha", text: "Creamy matcha, malinaw ang Biscoff flavor at sulit ang size.", date: "Loyalty member" },
];

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const categories = ["All", "Coffee", "Hot Coffee", "Matcha", "Milky", "Signature", "Fries"];
  const shown = useMemo(() => category === "All" ? drinks : drinks.filter((drink) => drink.category.startsWith(category)), [category]);

  return (
    <main className="site-shell">
      <header className="site-nav">
        <Link className="site-brand" href="/"><span>SYP</span><div><b>SYP ON CAFÉ</b><small>STREET • ICED • BREWED</small></div></Link>
        <nav><Link href="/menu">Menu</Link><Link href="/reviews">Reviews</Link><Link href="/moments">Coffee Moments</Link><Link href="/about">About</Link><Link href="/contact">Visit</Link></nav>
        <Link className="site-order" href="/menu">Order Now</Link>
      </header>

      <section className="site-hero">
        <div className="hero-copy">
          <span className="hero-kicker">OPEN DAILY • 5PM–4AM</span>
          <h1>Your late-night coffee, now closer.</h1>
          <p>Discover SYP favorites, preview customer ratings, order online, and collect rewards in one premium café experience.</p>
          <div className="hero-actions"><Link className="gold-button" href="/menu">Explore the Menu</Link><Link className="ghost-button" href="/member-register">Join SYP Rewards</Link></div>
          <div className="hero-proof"><div><b>4.9</b><span>Average rating</span></div><div><b>500+</b><span>Coffee moments</span></div><div><b>10</b><span>Stamps = reward</span></div></div>
        </div>
        <div className="hero-preview">
          <div className="preview-glow" />
          <article className="preview-card main"><span className="preview-tag">MOST LOVED</span><div className="drink-art">☕</div><small>COFFEE COLLECTION</small><h2>Spanish Latte</h2><p>Silky espresso, milk and signature sweetness.</p><div><b>₱89</b><span>★ 4.9 · 126 reviews</span></div></article>
          <article className="preview-card mini hot"><span>♨</span><div><small>NEW HOT</small><b>Salted Caramel</b><em>★ 4.9</em></div></article>
          <article className="preview-card mini matcha"><span>🍵</span><div><small>TOP MATCHA</small><b>Biscoff Matcha</b><em>★ 4.8</em></div></article>
        </div>
      </section>

      <section className="site-section">
        <div className="section-heading"><div><small>POPULAR RIGHT NOW</small><h2>Made for every SYP moment</h2></div><Link href="/menu">View full menu →</Link></div>
        <div className="category-pills">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}</div>
        <div className="featured-grid">{shown.map((drink) => <article className="drink-card" key={drink.name}><div className="drink-visual">{drink.tag && <span>{drink.tag}</span>}<b>{drink.emoji}</b></div><small>{drink.category}</small><h3>{drink.name}</h3><p>{drink.note}</p><div className="drink-meta"><strong>{drink.price}</strong><span>★ {drink.rating} <em>({drink.reviews})</em></span></div><Link href="/menu">Preview & order</Link></article>)}</div>
      </section>

      <section className="site-section member-banner">
        <div><small>SYP DIGITAL MEMBERSHIP</small><h2>Every visit becomes part of your coffee story.</h2><p>Track stamps, café visits, birthday rewards, referrals, favorite drinks, and exclusive Spin the Wheel prizes.</p><Link className="gold-button" href="/member-register">Create Free Membership</Link></div>
        <div className="membership-card"><div><span><b>SYP ON CAFÉ</b><small>DIGITAL MEMBER</small></span><i>JD</i></div><h3>JUAN DELA CRUZ</h3><p>SYP0021 • TRUSTED MEMBER</p><section>{Array.from({ length: 10 }, (_, i) => <span className={i < 6 ? "filled" : ""} key={i}>{i < 6 ? "★" : i + 1}</span>)}</section><footer><b>6 / 10 STAMPS</b><span>4 more to a free drink</span></footer></div>
      </section>

      <section className="site-section review-section">
        <div className="section-heading"><div><small>REAL SYP EXPERIENCES</small><h2>Loved by our KaSYP community</h2></div><Link href="/reviews">See all reviews →</Link></div>
        <div className="review-grid">{reviews.map((review) => <article key={review.name}><div><span>{review.name.slice(0, 1)}</span><div><b>{review.name}</b><small>{review.date}</small></div><em>{"★".repeat(review.stars)}</em></div><p>“{review.text}”</p><footer>Ordered: <b>{review.drink}</b></footer></article>)}</div>
      </section>

      <section className="site-section moments-strip">
        <div><small>COFFEE MOMENTS</small><h2>Share your SYP story.</h2><p>Upload your café moments, get featured, and inspire the next KaSYP order.</p><Link className="ghost-button" href="/moments">Explore Coffee Moments</Link></div>
        <div className="moment-collage"><span>☕<small>Late-night coffee</small></span><span>🤍<small>KaSYP moments</small></span><span>🍵<small>Matcha nights</small></span><span>✨<small>Reward claimed</small></span></div>
      </section>


      <section className="site-section visit-section">
        <div><small>DELIVERY & PICKUP</small><h2>Order your favorites in a few taps.</h2><p>Browse the live menu, customize your drink, and continue to checkout. Delivery availability and fee depend on your location within the service radius.</p><div className="hero-actions"><Link className="gold-button" href="/menu">Start an Order</Link><Link className="ghost-button" href="/contact">Visit the Café</Link></div></div>
        <div className="visit-details"><article><span>01</span><b>Choose your drink</b><small>Hot, iced, sizes, and add-ons.</small></article><article><span>02</span><b>Review your cart</b><small>See the complete total before checkout.</small></article><article><span>03</span><b>Track your order</b><small>Follow preparation and delivery status.</small></article></div>
      </section>

      <footer className="site-footer"><div className="site-brand"><span>SYP</span><div><b>SYP ON CAFÉ</b><small>APOLLO, ORANI, BATAAN</small></div></div><p>Besides 7-Eleven & in front of Mangan Tamu • Open daily 5PM–4AM</p><nav><Link href="/menu">Menu</Link><Link href="/about">About</Link><Link href="/contact">Visit</Link><Link href="/member-login">Member portal</Link></nav></footer>
    </main>
  );
}
