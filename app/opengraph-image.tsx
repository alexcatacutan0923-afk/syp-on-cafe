import { ImageResponse } from "next/og";

export const alt = "SYP ON CAFÉ — Street, Iced, Brewed";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050706",
          color: "#f6f2e8",
          fontFamily: "Arial, sans-serif",
          padding: "68px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "2px solid #d7a82f",
            borderRadius: "34px",
            padding: "58px",
            background: "linear-gradient(135deg, #090d0a 0%, #15130c 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                width: "92px",
                height: "92px",
                borderRadius: "999px",
                border: "3px solid #d7a82f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#f0b934",
                fontSize: "34px",
                fontWeight: 800,
              }}
            >
              SYP
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "46px", fontWeight: 800, letterSpacing: "2px" }}>
                SYP ON CAFÉ
              </div>
              <div style={{ color: "#d7a82f", fontSize: "22px", letterSpacing: "6px" }}>
                STREET • ICED • BREWED
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ fontSize: "64px", fontWeight: 800, maxWidth: "920px" }}>
              Your late-night coffee stop in Orani.
            </div>
            <div style={{ fontSize: "27px", color: "#c7c7bf" }}>
              Coffee • Matcha • Milky Drinks • Soda • Fries • Digital Rewards
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "23px" }}>
            <div>Apollo, Orani, Bataan</div>
            <div style={{ color: "#f0b934", fontWeight: 700 }}>OPEN DAILY • 5 PM–4 AM</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
