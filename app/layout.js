import { metadata } from './metadata';

export { metadata };

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7785145306323259"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
