import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JARVIS — Multimodal Prototype Builder & Visual Teacher",
  description:
    "Real-time multimodal AI agent that builds 3D prototypes, web apps, navigation maps, and teaches from screen content using Gemini Live API.",
  keywords: [
    "Jarvis",
    "Gemini Live",
    "multimodal AI",
    "prototype builder",
    "visual teacher",
    "hackathon",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-black text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
