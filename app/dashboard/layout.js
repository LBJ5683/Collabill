import { metadata } from './metadata';
import Script from 'next/script'; // 加載 Google AdSense 所需的元件

export { metadata };

export default function DashboardLayout({ children }) {
  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7785145306323259"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}
