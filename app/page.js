'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function HomePage() {
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Adsense error:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">CollaBill｜集資分帳系統</h1>
        <p className="text-gray-700 mb-6">
          CollaBill｜先集資、再分帳。免費多人分帳工具，讓團體支出透明好對帳，省去墊付與找零困擾。
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
          <a href="/login" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700">
            👉 立即登入
          </a>
          <a href="/register" className="bg-white border border-blue-600 text-blue-600 font-semibold py-2 px-6 rounded hover:bg-blue-50">
            👉 註冊新帳號
          </a>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          適用於長期團體支出，如公司訂餐、共享雜費、宿舍伙食、公費專案等情境。
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-gray-600 mt-6">
          <a href="/privacy" className="hover:underline">📜 隱私政策</a>
          <a href="/feedback" className="hover:underline">📩 聯絡我們</a>
        </div>
      </div>

      {/* 功能圖片說明區塊 */}
      <div className="w-full bg-gray-50 py-12 mt-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-8">四大特色</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {[
              '免下載',
              '免安裝',
              '免費使用',
              '介面友善'
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl px-6 py-5 text-gray-700 font-medium text-lg"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google AdSense 廣告區塊 */}
      <div className="w-full flex justify-center mt-10">
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-7785145306323259"
          data-ad-slot="8559364872"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      </div>

      {/* 圖片放大 modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="preview"
            className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
          />
        </div>
      )}

      {/* AdSense script loader */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7785145306323259"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
    </div>
  );
}
