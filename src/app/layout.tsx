import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flood Early Warning System",
  description: "Real-time flood risk monitoring and alerts for flood-prone districts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
