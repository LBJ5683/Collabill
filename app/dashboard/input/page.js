'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function InputPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // amount_in, food, drink, other
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from('bills').select('id, name');
    setUsers(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected || !amount) {
      setMsg('請選擇參與者並填寫金額');
      return;
    }
    // 這裡假設只更新最新一筆資料（可根據日期做更細緻設計）
    const { error } = await supabase.from('bills').update({ [type]: Number(amount) }).eq('id', selected);
    if (error) setMsg('儲存失敗');
    else {
      router.push('/dashboard');
    }
  }

  // 顯示中文標題
  const typeMap = {
    amount_in: '投入金額',
    food: '食物花費',
    drink: '飲料花費',
    other: '其他花費'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">{typeMap[type] || '金額填寫'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-blue-900">日期</label>
            <input
              type="date"
              className="w-full p-2 border border-blue-300 rounded"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-blue-900">參與者</label>
            <select
              className="w-full p-2 border border-blue-300 rounded"
              value={selected}
              onChange={e => setSelected(e.target.value)}
            >
              <option value="">請選擇</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-blue-900">金額</label>
            <input
              type="number"
              className="w-full p-2 border border-blue-300 rounded"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min={0}
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition" type="submit">
            儲存
          </button>
          {msg && <div className="mt-2 text-red-500">{msg}</div>}
        </form>
      </div>
    </div>
  );
}