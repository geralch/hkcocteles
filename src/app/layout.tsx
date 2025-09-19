import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HK Cocteles - Granizados y Bebidas",
  description: "Deliciosos granizados y bebidas para todos los gustos. Ubicados en Prados de Oriente, Cali.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/img/ico.png', type: 'image/png' },
    ],
    apple: '/img/ico.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
