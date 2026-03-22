import "./globals.css";

export const metadata = {
  title: "HOTSWrite",
  description:
    "AI-Integrated Application for Enhancing Higher-Order Thinking Skills in Academic Writing",
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