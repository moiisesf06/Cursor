import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { ReminderWatcher } from "@/components/ReminderWatcher";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "ForMyKids",
  description: "Tareas diarias de inglés y matemáticas para casa",
  applicationName: "ForMyKids",
  appleWebApp: {
    capable: true,
    title: "ForMyKids",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className={`${fredoka.variable} ${nunito.variable} antialiased`}>
        <ReminderWatcher />
        {children}
      </body>
    </html>
  );
}
