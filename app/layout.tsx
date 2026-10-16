import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local';
import Head from "next/head";

export const metadata: Metadata = {
  title: "ЮЖНЫЙ СОУС",
  description: "ЮЖНЫЙ СОУС - сниппеты",
};

const Molot = localFont({
  src: [
    {
      path: './assets/fonts/Molot.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-custom', // CSS-переменная для использования в Tailwind/CSS
}) 

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={Molot.className}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
