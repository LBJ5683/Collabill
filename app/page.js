'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function HomePage() {
  const [modalImage, setModalImage] = useState(null);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Adsense error:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex flex-col items-center justify-center px-4 py-10">
      <div className="relative max-w-xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-5">CollaBill｜集資分帳系統</h1>
        <p className="text-gray-700 mb-6">
          CollaBill｜先集資、再分帳。免費多人分帳工具，讓團體支出透明。
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-5">
          <a href="/login" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700">
            👉 立即登入
          </a>
          <a href="/register" className="bg-white border border-blue-600 text-blue-600 font-semibold py-2 px-6 rounded hover:bg-blue-50">
            👉 註冊新帳號
          </a>
        </div>

        <p className="text-sm text-gray-500 mt-4">
        ❌ 自己先墊錢　❌ 一個個追款　❌ 幫忙找零錢
        </p>

        <div className="flex justify-center items-center gap-4 text-sm text-gray-600 mt-6">
  <a href="/privacy" className="hover:underline whitespace-nowrap">📜 隱私政策</a>
  <a href="/feedback" className="hover:underline whitespace-nowrap">📩 聯絡我們</a>

  <button
    onClick={() => setShowIntro(!showIntro)}
    className="px-3 py-1 bg-blue-100 border border-blue-300 text-blue-700 rounded hover:bg-blue-200 transition whitespace-nowrap"
  >
    {showIntro ? '✖ 收起說明' : '👀 為什麼要用'}
  </button>
  {showIntro && (
  <div className="fixed top-14 right-20 w-80 bg-white border border-blue-300 rounded-lg shadow-lg p-5 z-50 text-sm text-gray-800 animate-slide-in">
    <div className="flex justify-between items-center mb-3">
      <p className="font-semibold text-blue-700">📘 使用情境說明</p>
      <button onClick={() => setShowIntro(false)} className="text-gray-500 hover:text-red-500 text-base">✖</button>
    </div>
    <p className="mb-3 leading-relaxed whitespace-pre-line">
      🧋🍱 每天公司訂飲料、叫便當，
      總有一個人要先墊錢、催大家付款，還得幫忙找零。
    </p>
    <p className="mb-3 leading-relaxed whitespace-pre-line">
      💡 用 CollaBill，大家先儲值，
      每次登記各自花費，自動扣款，每人都有自己的帳戶。
    </p>
    <p className="font-medium text-blue-800">➤ 真正的自動分帳，讓團體訂餐變簡單！</p>
  </div>
)}

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
