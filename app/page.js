'use client';

import { useState } from 'react';

export default function HomePage() {
  const [modalImage, setModalImage] = useState(null);

  const features = [
    {
      img: '/preview-main.png',
      alt: '主要分帳表格',
      title: '多人分帳表格',
      desc: '即時查看每人投入、花費與餘額。',
    },
    {
      img: '/preview-invest.png',
      alt: '投入金額',
      title: '參與者先投入金額',
      desc: '事先集資，避免墊付問題，結帳更省事。',
    },
    {
      img: '/preview-daily.png',
      alt: '每日消費',
      title: '填寫每日消費紀錄',
      desc: '每日輸入花費，自動同步到分帳表格。',
    },
    {
      img: '/preview-history.png',
      alt: '歷史記錄',
      title: '查詢與編輯記錄',
      desc: '可依日期查找記錄，方便修正與追溯。',
    },
    {
      img: '/preview-balance.png',
      alt: '個人賬戶',
      title: '個人賬戶餘額',
      desc: '每人獨立帳戶明細清楚，方便對帳。',
    },
  ];

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
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-10">功能範例畫面</h2>
          <div className="space-y-10">
            {features.map((f, i) => (
              <div
                key={i}
                className={`flex flex-col md:flex-row ${i % 2 === 1 ? 'md:flex-row-reverse' : ''} items-center bg-white rounded-xl shadow p-6`}
              >
                <div className="md:w-1/2 w-full cursor-pointer group">
                  <img
                    src={f.img}
                    alt={f.alt}
                    className="rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
                    onClick={() => setModalImage(f.img)}
                  />
                </div>
                <div className="md:w-1/2 w-full mt-4 md:mt-0 md:px-6 text-left">
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
    </div>
  );
}
