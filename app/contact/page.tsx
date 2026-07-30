import Link from "next/link";
import "../site.css";

const MAP_URL = "https://maps.app.goo.gl/e3gWxgxaSr7hBJbt7";
const navItems = [
  ["Home", "/"],
  ["Menu", "/menu"],
  ["About", "/about"],
  ["Moments", "/moments"],
  ["Reviews", "/reviews"],
] as const;

export default function ContactPage() {
  return (
    <main className="community-page">
      <header className="community-nav">
        <Link className="site-brand" href="/">
          <img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" />
          <div><b>SYP ON CAFÉ</b><small>VISIT & CONTACT</small></div>
        </Link>

        <nav className="community-links" aria-label="Main navigation">
          {navItems.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>

        <Link className="gold-button community-cta" href="/menu">Order Now</Link>

        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <div>
            {navItems.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            <Link className="gold-button" href="/menu">Order Now</Link>
          </div>
        </details>
      </header>

      <section className="community-hero contact-hero">
        <div>
          <small>SEE YOU TONIGHT</small>
          <h1>Your late-night coffee stop in Apollo.</h1>
          <p>Visit us, order online, or open your digital membership before your next SYP run.</p>
          <div className="hero-actions">
            <a className="gold-button" href={MAP_URL} target="_blank" rel="noreferrer">Get Directions</a>
            <Link className="ghost-button" href="/menu">View Live Menu</Link>
          </div>
        </div>
        <aside className="hero-note location-note">
          <span>EXACT LOCATION</span>
          <strong>Apollo, Orani</strong>
          <p>Beside 7-Eleven and in front of Mangan Tamu, along National Road.</p>
        </aside>
      </section>

      <section className="contact-grid">
        <article>
          <small>LOCATION</small>
          <h2>Apollo, Orani, Bataan</h2>
          <p>Beside 7-Eleven and in front of Mangan Tamu, along National Road.</p>
          <a className="ghost-button" href={MAP_URL} target="_blank" rel="noreferrer">Open Exact Pin</a>
        </article>
        <article>
          <small>OPEN DAILY</small>
          <h2>5:00 PM – 4:00 AM</h2>
          <p>Late-night coffee, matcha, milky drinks, soda, and fries every day.</p>
          <Link className="ghost-button" href="/menu">View Live Menu</Link>
        </article>
        <article>
          <small>SYP REWARDS</small>
          <h2>Join before your next order</h2>
          <p>Collect stamps, unlock a free drink, and receive member-only rewards.</p>
          <Link className="gold-button" href="/member-register">Create Membership</Link>
        </article>
      </section>

      <section className="site-section map-panel">
        <div>
          <small>FIND US FAST</small>
          <h2>Your next SYP run starts here.</h2>
          <p>Use the official Google Maps pin for the most accurate directions directly to SYP ON CAFÉ.</p>
          <a className="gold-button" href={MAP_URL} target="_blank" rel="noreferrer">Open SYP ON CAFÉ in Google Maps</a>
        </div>
        <a className="map-preview" href={MAP_URL} target="_blank" rel="noreferrer" aria-label="Open SYP ON CAFÉ exact Google Maps location">
          <span className="map-pin">SYP</span>
          <div><small>OFFICIAL MAP PIN</small><strong>SYP ON CAFÉ</strong><p>Apollo, Orani, Bataan</p></div>
          <b>↗</b>
        </a>
      </section>

      <section className="site-section visit-tips">
        <div className="section-heading"><div><small>BEFORE YOU VISIT</small><h2>Everything you need for a smooth café run.</h2></div></div>
        <div className="visit-details">
          <article><span>01</span><b>Check the live menu</b><small>See current choices before you order.</small></article>
          <article><span>02</span><b>Join SYP Rewards</b><small>Start collecting stamps from your next eligible purchase.</small></article>
          <article><span>03</span><b>Open the exact map pin</b><small>Avoid wrong turns by using the official location link.</small></article>
        </div>
      </section>

      <footer className="community-footer">
        <Link className="site-brand" href="/"><img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" /><div><b>SYP ON CAFÉ</b><small>STREET • ICED • BREWED</small></div></Link>
        <p>Open daily from 5:00 PM to 4:00 AM.</p>
        <nav><Link href="/menu">Menu</Link><Link href="/about">About</Link><Link href="/moments">Moments</Link><Link href="/reviews">Reviews</Link></nav>
      </footer>
    </main>
  );
}
