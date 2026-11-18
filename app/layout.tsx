import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coffee & Health Records | Medallo.dev",
  description: "Explore the coffee consumption and health dataset.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
