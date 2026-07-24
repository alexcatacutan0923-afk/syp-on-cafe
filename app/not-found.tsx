import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#050706",
        color: "#f6f2e8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section style={{ maxWidth: 620, textAlign: "center" }}>
        <p style={{ color: "#f0b934", fontWeight: 800, letterSpacing: 4 }}>404 • PAGE NOT FOUND</p>
        <h1 style={{ fontSize: 48, margin: "16px 0" }}>This page needs another shot.</h1>
        <p style={{ color: "#b9b9b2", fontSize: 18, lineHeight: 1.7 }}>
          The page may have moved or the address may be incorrect. Return to the café homepage or browse the live menu.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
          <Link href="/" style={{ background: "#f0b934", color: "#080a08", padding: "14px 22px", borderRadius: 999, fontWeight: 800, textDecoration: "none" }}>
            Back Home
          </Link>
          <Link href="/menu" style={{ border: "1px solid #8b6b20", color: "#f6f2e8", padding: "14px 22px", borderRadius: 999, fontWeight: 800, textDecoration: "none" }}>
            View Menu
          </Link>
        </div>
      </section>
    </main>
  );
}
