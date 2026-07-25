import Link from "next/link";
import "../site.css";

const navItems = [
  ["Home", "/"],
  ["Menu", "/menu"],
  ["Moments", "/moments"],
  ["Reviews", "/reviews"],
  ["Contact", "/contact"],
] as const;

export default function AboutPage() {
  return (
    <main className="community-page">
      <header className="community-nav">
        <Link className="site-brand" href="/">
          <img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" />
          <div><b>SYP ON CAFÉ</b><small>OUR STORY</small></div>
        </Link>

        <nav className="community-links" aria-label="Main navigation">
          {navItems.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>

        <Link className="gold-button community-cta" href="/member-register">Join Rewards</Link>

        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <div>
            {navItems.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            <Link className="gold-button" href="/member-register">Join Rewards</Link>
          </div>
        </details>
      </header>

      <section className="community-hero about-hero">
        <div>
          <small>STREET • ICED • BREWED</small>
          <h1>A neighborhood café built for late nights.</h1>
          <p>SYP ON CAFÉ brings accessible specialty-style drinks, comfort food, rewards, and a welcoming tambayan experience to Apollo, Orani.</p>
          <div className="hero-actions">
            <Link className="gold-button" href="/menu">Explore the Menu</Link>
            <Link className="ghost-button" href="/contact">Visit the Café</Link>
          </div>
        </div>
        <aside className="hero-note">
          <span>OPEN DAILY</span>
          <strong>5PM–4AM</strong>
          <p>For students, workers, barkadas, and every late-night KaSYP.</p>
        </aside>
      </section>

      <section className="story-grid">
        <article><span>01</span><h2>Made for Orani</h2><p>A local café experience beside 7-Eleven and in front of Mangan Tamu—easy to find, easy to enjoy.</p></article>
        <article><span>02</span><h2>Open when you need coffee</h2><p>Serving daily from 5PM to 4AM for students, workers, barkadas, and every late-night KaSYP.</p></article>
        <article><span>03</span><h2>More than one cup</h2><p>Digital loyalty, birthday rewards, coffee moments, delivery, and a community that grows with every visit.</p></article>
      </section>

      <section className="site-section timeline-section">
        <div className="section-heading">
          <div><small>OUR JOURNEY</small><h2>Built one cup and one customer at a time.</h2></div>
        </div>
        <div className="story-timeline">
          <article><b>01</b><div><h3>A simple local idea</h3><p>Create a comfortable café where quality drinks remain approachable.</p></div></article>
          <article><b>02</b><div><h3>A late-night tambayan</h3><p>Stay open when many customers still need a place to unwind, work, or catch up.</p></div></article>
          <article><b>03</b><div><h3>A growing KaSYP community</h3><p>Bring loyalty, rewards, ordering, moments, and service into one connected café experience.</p></div></article>
        </div>
      </section>

      <section className="site-section member-banner">
        <div>
          <small>THE KaSYP PROMISE</small>
          <h2>Good cup. Good tambay. Good memories.</h2>
          <p>We keep the menu approachable, the atmosphere relaxed, and every customer experience worth coming back for.</p>
          <Link className="gold-button" href="/menu">Explore the Menu</Link>
        </div>
        <div className="about-quote">“Your late-night coffee, now closer.”<small>SYP ON CAFÉ • APOLLO, ORANI, BATAAN</small></div>
      </section>

      <footer className="community-footer">
        <Link className="site-brand" href="/"><img src="/brand/syp-logo-glow-v2.webp" alt="SYP ON CAFÉ logo" /><div><b>SYP ON CAFÉ</b><small>STREET • ICED • BREWED</small></div></Link>
        <p>Open daily from 5:00 PM to 4:00 AM.</p>
        <nav><Link href="/menu">Menu</Link><Link href="/moments">Moments</Link><Link href="/reviews">Reviews</Link><Link href="/contact">Contact</Link></nav>
      </footer>
    </main>
  );
}
