'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  function validateName(name) {
    return /^[a-zA-Z0-9]+$/.test(name);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateName(name)) {
      setMsg('名字只能是英數字');
      return;
    }
    if (password.length < 6) {
      setMsg('密碼至少6碼');
      return;
    }
    if (password !== password2) {
      setMsg('兩次密碼不一致');
      return;
    }
    const fakeEmail = `${name}@fake.com`;
    const { error } = await supabase.auth.signUp({ email: fakeEmail, password });
    if (error) {
      if (error.message.includes('User already registered')) {
        setMsg('這個名字已經被註冊，請換一個');
      } else {
        setMsg(error.message);
      }
    } else {
      setMsg('註冊成功，請直接登入');
      setTimeout(() => router.push('/login'), 1500);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">多人分帳系統</h1>
        <h2 className="text-xl font-semibold text-center mb-6">註冊</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="名字（英數字）"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            placeholder="密碼（至少6碼）"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            placeholder="再次輸入密碼"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
          />
          <button
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
            type="submit"
          >
            註冊
          </button>
          <div className="mt-4 text-center text-red-500">{msg}</div>
          <div className="mt-4 text-center">
            <span className="text-gray-600">已有帳號？</span>
            <a href="/login" className="text-blue-600 hover:underline ml-1">登入</a>
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