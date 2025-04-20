'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    const fakeEmail = `${name}@fake.com`;
    const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password });
    if (error) setMsg(error.message);
    else router.push('/dashboard');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">多人分賬系統</h1>
        <h2 className="text-xl font-semibold text-center mb-6">登入</h2>
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
      <div className="mt-8 text-center text-gray-600 text-sm">
        <div>問題聯絡人：呂秉杰</div>
        <div>分機：253649</div>
        <div>信箱：Bjie5683@gmail.com</div>
      </div>
    </div>
  );
}