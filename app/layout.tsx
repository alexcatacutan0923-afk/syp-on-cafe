import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://syponcafe.shop";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SYP ON CAFÉ | Street • Iced • Brewed",
    template: "%s | SYP ON CAFÉ",
  },
  description:
    "Order coffee, matcha, milky drinks, soda, and fries from SYP ON CAFÉ in Apollo, Orani, Bataan. Open daily from 5 PM to 4 AM.",
  applicationName: "SYP ON CAFÉ",
  keywords: [
    "SYP ON CAFÉ",
    "coffee shop Orani",
    "cafe Bataan",
    "coffee delivery Orani",
    "matcha Orani",
    "late night cafe",
  ],
  authors: [{ name: "SYP ON CAFÉ" }],
  creator: "SYP ON CAFÉ",
  publisher: "SYP ON CAFÉ",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: siteUrl,
    siteName: "SYP ON CAFÉ",
    title: "SYP ON CAFÉ | Street • Iced • Brewed",
    description:
      "Your late-night coffee stop in Apollo, Orani. Coffee, matcha, milky drinks, soda, fries, delivery, and digital rewards.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SYP ON CAFÉ — Street, Iced, Brewed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SYP ON CAFÉ | Street • Iced • Brewed",
    description:
      "Your late-night coffee stop in Apollo, Orani, Bataan. Open daily from 5 PM to 4 AM.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  category: "food and drink",
};

export const viewport: Viewport = {
  themeColor: "#050706",
  colorScheme: "dark",
};

const cafeStructuredData = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: "SYP ON CAFÉ",
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
  description:
    "Late-night neighborhood café serving coffee, matcha, milky drinks, soda, fries, delivery, and digital rewards.",
  slogan: "Street • Iced • Brewed",
  address: {
    "@type": "PostalAddress",
    streetAddress: "National Road, Apollo, beside 7-Eleven and in front of Mangan Tamu",
    addressLocality: "Orani",
    addressRegion: "Bataan",
    addressCountry: "PH",
  },
  hasMap: "https://maps.app.goo.gl/e3gWxgxaSr7hBJbt7",
  servesCuisine: ["Coffee", "Matcha", "Milky Drinks", "Soda", "Fries"],
  priceRange: "₱",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "17:00",
      closes: "04:00",
    },
  ],
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(cafeStructuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
