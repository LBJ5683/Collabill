'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

export default function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    // 如果輸入內容包含 @ 則直接當 email，否則自動補 @fake.com
    const email = name.includes('@') ? name : `${name}@fake.com`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else router.push('/dashboard');
  }

  return (
    <>
      <Head>
        <title>CollaBill｜多人集資與分帳系統，讓團體支出更簡單</title>
        <meta
          name="description"
          content="CollaBill 是專為多人設計的集資分帳工具，支援儲值、扣款、自動分帳與餘額查詢，適合團體訂餐、室友共用開銷、小型創業等場景！"
        />
        <meta name="keywords" content="分帳,多人分帳,AA制,群組記帳,花費管理,共用帳本" />
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">CollaBill｜集資分帳系統</h1>
          <h2 className="text-xl font-semibold text-center mb-6">登入</h2>
          <p className="text-gray-700 text-center text-sm mb-4 px-2">
             CollaBill 是一款免費多人分帳工具，支援長期集資與消費，
             團體金錢管理更簡單。註冊一次，輕鬆追蹤所有花費。
          </p>
          <form onSubmit={handleSubmit}>
            <input
              className="block w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="名字"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              className="block w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="password"
              placeholder="密碼"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
              type="submit"
            >
              登入
            </button>
            <div className="mt-4 text-center text-red-500">{msg}</div>
            <div className="mt-4 text-center">
              <span className="text-gray-600">沒有帳號？</span>
              <a href="/register" className="text-blue-600 hover:underline ml-1">註冊</a>
            </div>
          </form>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm leading-relaxed">
  如有問題請聯絡：
  <a
    href="mailto:jie5683@gmail.com"
    className="underline hover:text-blue-600"
  >
    Bjie5683@gmail.com
  </a>
  <br />
          <a
    href="/privacy"
    className="underline hover:text-blue-600 mt-1 inline-block"
  >
    隱私政策
  </a>
        </div>
      </div>
    </>
  );
}