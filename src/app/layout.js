import "./globals.css";

export const metadata = {
  title: "Crēo Teachers",
  description:
    "AI-integrated application for developing higher-order thinking skills in academic writing",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}