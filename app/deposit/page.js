'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export async function generateMetadata() {
  return {
    title: 'CollaBill｜集資存款',
    description: '輸入金額與日期，完成集資儲值記錄。用於分帳前集中收款管理。',
    alternates: {
      canonical: 'https://collabill01.vercel.app/deposit',
    },
  };
}

export default function Deposit() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [msg, setMsg] = useState('');
  const [names, setNames] = useState([]);
  const router = useRouter();

  // 取得所有參與者姓名
  useEffect(() => {
    async function fetchNames() {
      const { data } = await supabase.from('bills').select('name');
      setNames(data ? data.map(d => d.name) : []);
    }
    fetchNames();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name) {
      setMsg('請選擇姓名');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setMsg('請輸入正確金額');
      return;
    }
    const { error } = await supabase.from('transactions').insert([
      { name, type: '投入', amount: Number(amount), date }
    ]);
    if (error) {
      setMsg('儲存失敗，請重試');
    } else {
      setMsg('儲存成功！');
      setTimeout(() => router.push('/dashboard'), 1000);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">投入金額</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-blue-800 font-semibold">日期</label>
            <input
              type="date"
              className="w-full p-2 border border-blue-300 rounded"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-blue-800 font-semibold">姓名</label>
            <select
              className="w-full p-2 border border-blue-300 rounded"
              value={name}
              onChange={e => setName(e.target.value)}
            >
              <option value="">請選擇</option>
              {names.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-blue-800 font-semibold">金額</label>
            <input
              type="number"
              className="w-full p-2 border border-blue-300 rounded"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
            />
          </div>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
            type="submit"
          >
            確認
          </button>
          <div className="mt-4 text-center text-red-500">{msg}</div>
        </form>
      </div>
    </div>
  );
}