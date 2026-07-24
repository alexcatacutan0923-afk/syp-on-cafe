export default function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#050706",
        color: "#f0b934",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 2 }}>SYP ON CAFÉ</div>
        <p style={{ marginTop: 10, color: "#b9b9b2" }}>Brewing your page…</p>
      </div>
    </main>
  );
}
