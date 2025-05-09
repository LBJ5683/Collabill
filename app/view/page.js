'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ViewPage() {
  const [rawBills, setRawBills] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const uid = searchParams.get('uid');
    if (uid) fetchBills(uid);
  }, []);

  async function fetchBills(uid) {
    const { data } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', uid)
      .order('order', { ascending: true, nullsLast: true });

    if (!data) return;

    setRawBills(data);

    // 聚合同名紀錄 => 總計欄
    const sumMap = new Map();
    data.forEach(b => {
      const key = b.name?.trim();
      if (!key) return;
      if (!sumMap.has(key)) {
        sumMap.set(key, { ...b, name: key });
      } else {
        const item = sumMap.get(key);
        item.amount_in += b.amount_in || 0;
        item.food += b.food || 0;
        item.drink += b.drink || 0;
        item.other += b.other || 0;
      }
    });
    setBills(Array.from(sumMap.values()));
  }

  const calcRemain = b => (b.amount_in || 0) - (b.food || 0) - (b.drink || 0) - (b.other || 0);

  // 今日日期字串
  const todayStr = new Date().toISOString().split('T')[0];

  // 今日所有原始紀錄
  const todayBills = rawBills.filter(b => new Date(b.created_at).toISOString().split('T')[0] === todayStr);

  const todayIn     = todayBills.reduce((s, b) => s + (b.amount_in || 0), 0);
  const todayFood   = todayBills.reduce((s, b) => s + (b.food     || 0), 0);
  const todayDrink  = todayBills.reduce((s, b) => s + (b.drink    || 0), 0);
  const todayOther  = todayBills.reduce((s, b) => s + (b.other    || 0), 0);

  const totalRemain = bills.reduce((s, b) => s + calcRemain(b), 0);

  // 今日各名單分佈
  const todayNameMap = new Map();
  todayBills.forEach(b => {
    const name = b.name?.trim();
    if (!name) return;
    const entry = todayNameMap.get(name) || { in: 0, food: 0, drink: 0, other: 0 };
    entry.in    += b.amount_in || 0;
    entry.food  += b.food      || 0;
    entry.drink += b.drink     || 0;
    entry.other += b.other     || 0;
    todayNameMap.set(name, entry);
  });

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">📘 分帳記錄（唯讀瀏覽）</h1>

      {/* 統計卡片 */}
      <div className="relative flex flex-wrap gap-y-3 gap-x-6 bg-blue-100 p-4 rounded-md shadow mb-6 text-sm pr-28">
        <div className="text-green-700 font-semibold">今日投入： 💰 投入金額：{todayIn}</div>
        <div className="text-blue-800 font-semibold">
          今日花費： 🍚食物：{todayFood}　🥤飲料：{todayDrink}　🛒 其他：{todayOther}
        </div>
        <div className="bg-blue-200 border border-blue-400 px-4 py-2 rounded text-blue-900 font-bold text-base shadow-sm whitespace-nowrap">
          💡 剩餘金額總額：{totalRemain}
        </div>
      </div>

      {/* 表格外層，加 overflow-x-auto 避免手機溢位 */}
      {bills.length > 0 ? (
        <div className="w-full overflow-x-auto sm:overflow-visible">
          <table className="min-w-[640px] sm:min-w-full text-sm text-center bg-white shadow border border-blue-200 rounded">
            <thead className="bg-blue-100 text-blue-700">
              <tr>
                <th rowSpan={2} className="px-2 py-3 align-middle">姓名</th>
                <th rowSpan={2} className="px-2 py-3 align-middle">📅 今日紀錄</th>
                <th colSpan={4} className="px-2 py-2">💰 總計項目</th>
                <th rowSpan={2} className="px-2 py-3 align-middle">剩餘</th>
              </tr>
              <tr>
                <th className="px-2 py-2">投入</th>
                <th className="px-2 py-2">🍚 食物</th>
                <th className="px-2 py-2">🥤 飲料</th>
                <th className="px-2 py-2">🛒 其他</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b, i) => (
                <tr key={i} className="border-t hover:bg-blue-50">
                  <td className="px-2 py-2 whitespace-nowrap">{b.name}</td>
                  <td className="px-2 py-2 text-xs text-gray-600 whitespace-nowrap w-[96px] overflow-hidden text-ellipsis">
                    {todayNameMap.has(b.name) && (() => {
                      const t = todayNameMap.get(b.name);
                      const parts = [];
                      if (t.in    > 0) parts.push(`投入 ${t.in}`);
                      if (t.food  > 0) parts.push(`食 ${t.food}`);
                      if (t.drink > 0) parts.push(`飲 ${t.drink}`);
                      if (t.other > 0) parts.push(`其他 ${t.other}`);
                      return parts.join(' / ');
                    })()}
                  </td>
                  <td className="px-2 py-2">{b.amount_in || 0}</td>
                  <td className="px-2 py-2">{b.food || 0}</td>
                  <td className="px-2 py-2">{b.drink || 0}</td>
                  <td className="px-2 py-2">{b.other || 0}</td>
                  <td className="px-2 py-2 font-semibold">
                    {calcRemain(b) < 0 ? <span className="text-red-600">{calcRemain(b)}</span> : calcRemain(b)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 mt-6">⚠️ 查無資料，或使用者 ID 無效。</p>
      )}
    </div>
  );
}
