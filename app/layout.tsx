import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collabill｜集資分帳系統｜免下載、免安裝、線上使用",
  description:
    "先集資、再分帳，個人帳戶清楚不混亂。適用於長期團體支出，如訂餐、共住、社團或專案分帳。先集資集中扣款，每人獨立帳戶明細透明，省去墊付、對帳與找零困擾。",
  openGraph: {
    title: "Collabill｜集資分帳系統｜免下載、免安裝、線上使用",
    description:
      "先集資、再分帳，個人帳戶清楚不混亂。適用於長期團體支出，如訂餐、共住、社團或專案分帳。先集資集中扣款，每人獨立帳戶明細透明，省去墊付、對帳與找零困擾。",
    images: [
      {
        url: "/preview-main.png",
        width: 1200,
        height: 630,
        alt: "CollaBill 預覽圖",
      },
    ],
    type: "website",
    url: "https://collabill01.vercel.app/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content="Collabill｜集資分帳系統｜免下載、免安裝、線上使用" />
        <meta property="og:description" content="先集資、再分帳，個人帳戶清楚不混亂。適用於長期團體支出，如訂餐、共住、社團或專案分帳。先集資集中扣款，每人獨立帳戶明細透明，省去墊付、對帳與找零困擾。" />
        <meta property="og:image" content="/preview-social.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://collabill01.vercel.app/" />

        <link rel="icon" href="/favicon.ico" />

        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-WX0TM1TPPY" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WX0TM1TPPY');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
