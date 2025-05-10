'use client';

import { ReactSortable } from 'react-sortablejs';

// 排序後重新排列陣列的工具函數
function arrayMove(arr, fromIndex, toIndex) {
  const newArr = [...arr];
  const [moved] = newArr.splice(fromIndex, 1);
  newArr.splice(toIndex, 0, moved);
  return newArr;
}


import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import useSessionGuard from '../../hooks/useSessionGuard'; 
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useCallback } from 'react';


const FIELDS = [
  { key: 'amount_in', label: '投入金額' },
  { key: 'food', label: '食物花費' },
  { key: 'drink', label: '飲料花費' },
  { key: 'other', label: '其他花費' },
];

const ICONS = {
  amount_in: '💰',
  food: '🍚',
  drink: '🥤',
  other: '🛒',
};

// 歷史記錄 icon
const HISTORY_ICON = '📜';

export default function Dashboard() {
  useSessionGuard();
  const [bills, setBills] = useState([]);
  const [userId, setUserId] = useState(null); 
  const [, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [exportStart, setExportStart] = useState('');
  const [exportEnd,   setExportEnd]   = useState('');
  const [exportType, setExportType] = useState('amount_in');
  const [showExportModal, setShowExportModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const tutorialImages = [
    '/guide/page1.png',
    '/guide/page2.png',
    '/guide/page3.png',
    '/guide/page4.png',
    '/guide/page5.png'
  ];
  
  const [showGuide, setShowGuide] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Modal 狀態
  const [showModal, setShowModal] = useState(false);
  const [modalField, setModalField] = useState('amount_in');
  const [modalValues, setModalValues] = useState({});
  const [modalMsg, setModalMsg] = useState('');
  const [modalDate, setModalDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    try {
      if (window?.adsbygoogle?.push) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error('AdSense push error:', e);
    }
  }, []);  

  // 刪除確認
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 歷史記錄
  const [showHistory, setShowHistory] = useState(false);
  const [historyDate, setHistoryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [historyBills, setHistoryBills] = useState([]);
  const [historyEdit, setHistoryEdit] = useState({});
  const [historyMsg, setHistoryMsg] = useState('');

  // 歷史記錄 modal 狀態
  const [historyViewMode, setHistoryViewMode] = useState('view'); // 'view' | 'edit'
  const [historyQueried, setHistoryQueried] = useState(false);

  // 新增今日加總 state
  const [todayTotals, setTodayTotals] = useState({ amount_in: 0, food: 0, drink: 0, other: 0 });

  const router = useRouter();

  // 使用指南彈窗
  const fetchTodayTotals = useCallback(async () => {
    const today = getToday();
    const { data: userData } = await supabase.auth.getUser();
const user = userData?.user;
if (!user) return;

const { data } = await supabase
  .from('bills')
  .select('*')
  .eq('date', today)
  .eq('user_id', user.id);
    const sum = { amount_in: 0, food: 0, drink: 0, other: 0 };
    (data || []).forEach(bill => {
      sum.amount_in += bill.amount_in || 0;
      sum.food += bill.food || 0;
      sum.drink += bill.drink || 0;
      sum.other += bill.other || 0;
    });
    setTodayTotals(sum);
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchBills();
      fetchTodayTotals();
    });
  
    return () => subscription?.unsubscribe();
  }, [fetchTodayTotals]);
   
  
  useEffect(() => {
    const result = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESH_FAILED') {
        console.warn('🔐 Refresh token 無效，自動登出');
        supabase.auth.signOut();
        router.replace('/login');
      }
    });
  
    return () => {
      try {
        result?.data?.subscription?.unsubscribe?.(); 
      } catch (e) {
        console.warn('取消 Supabase 訂閱時發生錯誤', e);
      }
    };
  }, [router]);  


  // 取得今天日期
  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }
  
  // 剩餘金額總額（全部資料）
  const totalRemain = bills.reduce((sum, b) => sum + ((b.amount_in || 0) - (b.food || 0) - (b.drink || 0) - (b.other || 0)), 0);

  async function fetchBills() {
    setLoading(true);
    // 取得目前登入的 user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setBills([]);
      setLoading(false);
      return;
    }
    setUserId(user.id);
    // 查詢只屬於這個 user 的資料
    const { data } = await supabase.from('bills').select('*').eq('user_id', user.id).order('order', { ascending: true, nullsLast: true }).order('id', { ascending: true });


    if (data) {
      // 以 name.trim() 分組加總，只顯示 name 不為空的資料
      const sumMap = new Map();
      (data || []).forEach(bill => {
        const key = bill.name ? bill.name.trim() : '';
        if (!key) return;
        if (!sumMap.has(key)) {
          sumMap.set(key, { ...bill, name: key });
        } else {
          const item = sumMap.get(key);
          item.amount_in += bill.amount_in || 0;
          item.food += bill.food || 0;
          item.drink += bill.drink || 0;
          item.other += bill.other || 0;
        }
      });
      setBills(
        Array.from(sumMap.values()).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
      );
      
    } else {
      setBills([]);
    }
    setLoading(false);
  }

  async function exportExcelByType(type) {
    if (!exportStart || !exportEnd) {
      alert('請選擇起始與結束日期');
      return;
    }
  
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;
  
    const { data } = await supabase.from('bills').select('*')
      .eq('user_id', user.id)
      .gte('date', exportStart)
      .lte('date', exportEnd);
  
    const nameSet = new Set();
    const dateMap = new Map();
    (data || []).forEach(row => {
      const name = row.name?.trim();
      if (!name) return;
      nameSet.add(name);
      if (!dateMap.has(row.date)) dateMap.set(row.date, {});
      const obj = dateMap.get(row.date);
      obj[name] = (obj[name] || 0) + (row[type] || 0);
    });
  
   const names = Array.from(nameSet);

    const dates = Array.from(dateMap.keys()).sort();
  
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('報表');
  
    const header = ['日期', ...names, '當日總額'];
    sheet.addRow(header);
  
    dates.forEach(date => {
      const row = [date];
      let dailyTotal = 0;
      names.forEach(name => {
        const val = dateMap.get(date)?.[name] || '';
        row.push(val || '');
        dailyTotal += val || 0;
      });
      row.push(dailyTotal);
      const r = sheet.addRow(row);
      r.getCell(row.length).font = { bold: true };
      r.getCell(row.length).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC' }
      };
    });
  
    const totalRow = ['期間總額'];
    names.forEach(name => {
      let total = 0;
      dates.forEach(date => total += dateMap.get(date)?.[name] || 0);
      totalRow.push(total);
    });
    const grandTotal = totalRow.slice(1).reduce((a, b) => a + (b || 0), 0);
    totalRow.push(grandTotal);
  
    const r = sheet.addRow(totalRow);
    r.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: 'CCFFCC' }
      };
    });
  
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `${type}_報表.xlsx`);
  }  

  function calcRemain(bill) {
    return (bill.amount_in || 0) - (bill.food || 0) - (bill.drink || 0) - (bill.other || 0);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) {
      setAddMsg('姓名不能為空');
      return;
    }
    if (bills.some(b => b.name === newName.trim())) {
      setAddMsg('此姓名已存在');
      return;
    }
    const today = getToday();
    // 取得目前登入的 user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setAddMsg('請先登入');
      return;
    }
    // 新增時要帶上 user_id
// 先計算最大 order，再加一
const maxOrder = bills.reduce(
  (max, b) => (b.order !== null && b.order !== undefined ? Math.max(max, b.order) : max),
  -1
);

const { error } = await supabase.from('bills').insert([
  {
    name: newName.trim(),
    amount_in: 0,
    food: 0,
    drink: 0,
    other: 0,
    date: today,
    user_id: user.id,
    order: maxOrder + 1   // 👈 加入這行避免順位衝突
  }
]);

    if (error) {
      setAddMsg('新增失敗，請重試');
    } else {
      setAddMsg('');
      setNewName('');
      setShowAdd(false);
      fetchBills();
      fetchTodayTotals();
    }
  }

  // Modal 批次填寫投入/花費
  function openModal(field) {
    setModalField(field);
    setModalValues({});
    setModalMsg('');
    setModalDate(new Date().toISOString().slice(0, 10));
    setShowModal(true);
  }
  async function handleModalSubmit(e) {
    e.preventDefault();
    setModalMsg('');
    // 取得目前登入的 user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setModalMsg('請先登入');
      return;
    }
    for (const id in modalValues) {
      let value = modalValues[id];
      if (value === '' || value === undefined) value = 0;
      if (!isNaN(Number(value))) {
        // 查詢該 id、modalDate 是否有資料
        const { data: exist } = await supabase.from('bills').select('*').eq('name', bills.find(b => b.id === id)?.name).eq('date', modalDate).eq('user_id', user.id);
        if (exist && exist.length > 0) {
          const old = exist[0];
          const currentOrder =
            bills.find(b => b.id === id)?.order ?? old.order ?? 9999;
        
          const updateObj = {
            amount_in: modalField === 'amount_in'
              ? (old.amount_in || 0) + Number(value)
              : old.amount_in || 0,
            food: modalField === 'food'
              ? (old.food || 0) + Number(value)
              : old.food || 0,
            drink: modalField === 'drink'
              ? (old.drink || 0) + Number(value)
              : old.drink || 0,
            other: modalField === 'other'
              ? (old.other || 0) + Number(value)
              : old.other || 0,
            order: currentOrder
          };
        
          await supabase.from('bills').update(updateObj).eq('id', old.id);
        }
        
        else {
          // 沒資料就 insert，四欄位都齊全
          const bill = bills.find(b => b.id === id);
          await supabase.from('bills').insert([
            {
              name: bill ? bill.name.trim() : '',
              amount_in: modalField === 'amount_in' ? Number(value) : 0,
              food: modalField === 'food' ? Number(value) : 0,
              drink: modalField === 'drink' ? Number(value) : 0,
              other: modalField === 'other' ? Number(value) : 0,
              date: modalDate,
              user_id: user.id,
              order: bill ? bill.order : 9999
            }
          ]);
        }
      }
    }
    setShowModal(false);
    setModalValues({});
    fetchBills();
    fetchTodayTotals();
  }

  // 刪除參與者
  function openDeleteDialog(bill) {
    setDeleteId(bill.id);
    setDeleteName('');
    setDeleteMsg('');
    setShowDeleteDialog(true);
  }
  async function handleDeleteConfirm() {
    const target = bills.find(b => b.id === deleteId);
    if (!target) {
      setDeleteMsg('找不到該參與者');
      return;
    }
  
    if (deleteName.trim() !== target.name) {
      setDeleteMsg('名字不正確，請重新輸入');
      return;
    }
  
    // ✅ 補上這段：取得目前登入的使用者
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setDeleteMsg('請先登入');
      return;
    }
  
    if (!window.confirm(`確定要刪除「${target.name}」嗎？此動作無法復原 °□°`)) return;
  
    // ✅ 現在才可以安全執行刪除
    await supabase
      .from('bills')
      .delete()
      .eq('user_id', user.id)
      .eq('name', target.name);
  
    setShowDeleteDialog(false);
    setDeleteId(null);
    setDeleteName('');
    setDeleteMsg('');
    fetchBills();
    fetchTodayTotals();
  }
  

  // 歷史記錄
  async function openHistory() {
    setShowHistory(true);
    setHistoryMsg('');
    await fetchHistoryBills(historyDate);
  }
  async function fetchHistoryBills(date) {
    // 取得目前登入的 user
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setHistoryBills([]);
      setHistoryEdit({});
      return;
    }
    // 查詢只屬於這個 user 的資料
    const { data } = await supabase.from('bills').select('*').eq('date', date).eq('user_id', user.id).order('order', { ascending: true, nullsLast: true }).order('id', { ascending: true });;

    // sum 同一個人同一天的所有資料
    const sumMap = new Map();
    (data || []).forEach(bill => {
      const key = bill.name ? bill.name.trim() : '';
      if (!key) return;
      const total =
  (bill.amount_in || 0) +
  (bill.food || 0) +
  (bill.drink || 0) +
  (bill.other || 0);

if (total === 0) return;

if (!sumMap.has(key)) {
  sumMap.set(key, { ...bill, name: key, id: bill.id });
}
 else {
        const item = sumMap.get(key);
        item.amount_in += bill.amount_in || 0;
        item.food += bill.food || 0;
        item.drink += bill.drink || 0;
        item.other += bill.other || 0;
      }
    });
    setHistoryBills(
      Array.from(sumMap.values()).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    );
    setHistoryEdit({});
  }
  async function saveHistoryEdit() {
    const orderMap = new Map();   
  
    for (const id in historyEdit) {
      const updateObj = {};
      for (const key in historyEdit[id]) {
        let value = historyEdit[id][key];
        if (value === '' || value === undefined) value = 0;
        updateObj[key] = value;
      }
  
      // 找出這筆的名字與原始排序順序
      const name = historyBills.find(h => h.id === Number(id))?.name;
      const ori  = bills.find(b => b.name === name);
      const order = ori?.order ?? 9999;
      updateObj.order = order;
  
      await supabase
        .from('bills')
        .update(updateObj)
        .eq('id', id)
        .eq('date', historyDate);
  
      orderMap.set(name, order);
    }
  
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    for (const [name, order] of orderMap) {
      await supabase
        .from('bills')
        .update({ order })
        .eq('user_id', user.id)
        .eq('name', name);
    }
  
    setShowHistory(false);
    setHistoryEdit({});
    fetchBills();
    fetchTodayTotals();
  }
  

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-100 to-blue-300">
      {/* 左側欄 */}
      <aside className="w-full md:w-64 bg-white/95 shadow-lg flex flex-col p-8 rounded-r-3xl border-r border-blue-300">
        {/* 投入 */}
        <div className="mb-10">
          <div className="text-blue-700 font-bold text-xl mb-2 tracking-wide">投入</div>
          <div className="pl-4 text-blue-900 font-medium text-base mb-1 flex items-center gap-2">
            <span>{ICONS.amount_in}</span>
            <button
              className="hover:underline"
              onClick={() => openModal('amount_in')}
              type="button"
            >
              投入金額
            </button>
          </div>
        </div>
        {/* 花費 */}
        <div className="mb-10">
          <div className="text-blue-700 font-bold text-xl mb-2 tracking-wide">花費</div>
          <div className="pl-4 text-blue-900 font-medium text-base mb-1 flex items-center gap-2">
            <span>{ICONS.food}</span>
            <button className="hover:underline" onClick={() => openModal('food')} type="button">食物花費</button>
          </div>
          <div className="pl-4 text-blue-900 font-medium text-base mb-1 flex items-center gap-2">
            <span>{ICONS.drink}</span>
            <button className="hover:underline" onClick={() => openModal('drink')} type="button">飲料花費</button>
          </div>
          <div className="pl-4 text-blue-900 font-medium text-base mb-1 flex items-center gap-2">
            <span>{ICONS.other}</span>
            <button className="hover:underline" onClick={() => openModal('other')} type="button">其他花費</button>
          </div>
        </div>
        {/* 歷史記錄 */}
        <div>
          <div className="pl-0 text-blue-900 font-medium text-base mb-1 flex items-center gap-2">
            <span className="text-xl">{HISTORY_ICON}</span>
            <button className="hover:underline" onClick={openHistory} type="button">歷史記錄</button>
          </div>
        </div>
      </aside>
      {/* 右側主區 */}
      <main className="flex-1 p-4 md:p-10">
        <div className="flex-1 flex flex-col">
          {/* 今日統計 */}
          <div className="mb-4 flex flex-wrap gap-6 items-center">
           <div className="text-lg font-bold text-green-700">今日投入：</div>
           <div className="text-base text-green-900">💰 投入金額：{todayTotals.amount_in}</div>
          </div>
          {/* 今日花費統計 */}
          <div className="mb-4 flex flex-wrap gap-6 items-center">
            <div className="text-lg font-bold text-blue-700">今日花費：</div>
            <div className="text-base text-blue-900">🍚 食物：{todayTotals.food}</div>
            <div className="text-base text-blue-900">🥤 飲料：{todayTotals.drink}</div>
            <div className="text-base text-blue-900">🛒 其他：{todayTotals.other}</div>
            <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-md text-blue-900 font-semibold text-xl whitespace-nowrap">
   剩餘金額總額：{totalRemain}
</div>
{userId && (
  <div className="absolute top-5 right-10 flex flex-col items-center">
    <a
      href={`https://collabill01.vercel.app/view?uid=${userId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-blue-600 underline mb-1 hover:text-blue-800"
    >
      分享唯讀連結
    </a>
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://collabill01.vercel.app/view?uid=${userId}`}
      alt="QR Code"
      className="w-24 h-24 border rounded shadow"
    />
  </div>
)}

          </div>
          {showGuide && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-4 max-w-5xl w-full relative">
      <button
        className="absolute top-2 right-2 text-gray-600 text-lg"
        onClick={() => setShowGuide(false)}
      >
        ✕
      </button>

...

<div className="h-[80vh] w-full relative flex items-center justify-center overflow-hidden">
  <AnimatePresence mode="wait">
    <motion.img
      key={currentImageIndex}
      src={tutorialImages[currentImageIndex]}
      alt={`使用指南第 ${currentImageIndex + 1} 張`}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute h-full max-h-[80vh] max-w-full object-contain"
    />
  </AnimatePresence>
</div>


      <div className="flex justify-between mt-4">
        <button
          disabled={currentImageIndex === 0}
          onClick={() => setCurrentImageIndex(i => i - 1)}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          ← 上一張
        </button>
        <button
          disabled={currentImageIndex === tutorialImages.length - 1}
          onClick={() => setCurrentImageIndex(i => i + 1)}
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:opacity-50"
        >
          下一張 →
        </button>
      </div>
    </div>
  </div>
)}

          {/* Modal 批次填寫投入/花費 */}
          {showModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-lg
            border border-blue-200 max-h-[90vh] overflow-y-auto flex flex-col">
                <h2 className="text-lg font-bold mb-4 text-blue-700">{FIELDS.find(f => f.key === modalField)?.label || ''}（{modalDate}）</h2>
                <form onSubmit={handleModalSubmit}>
                <div className="mb-3">
  <label className="text-blue-900 font-medium mr-2">選擇日期：</label>
  <input
    type="date"
    className="p-2 border border-blue-300 rounded"
    value={modalDate}
    onChange={e => setModalDate(e.target.value)}
  />
</div>

                    <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                    {bills.map(bill => (
                      <div key={bill.id} className="flex items-center gap-2">
                        <span className="w-24 text-blue-900">{bill.name}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="flex-1 p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="金額"
                          value={modalValues[bill.id] || ''}
                          onChange={e => setModalValues(a => ({ ...a, [bill.id]: e.target.value.replace(/[^0-9]/g, '') }))}
                        />
                      </div>
                    ))}
                  </div>
                  {modalMsg && <div className="text-red-500 mb-2">{modalMsg}</div>}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                      onClick={() => { setShowModal(false); setModalValues({}); setModalMsg(''); }}
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      儲存
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* 刪除對話框 */}
          {showDeleteDialog && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm border border-blue-200">
                <h2 className="text-lg font-bold mb-4 text-blue-700">刪除參與者</h2>
                <div className="mb-2 text-gray-700">請輸入參與者名字以確認刪除：</div>
                <input
                  className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                  placeholder="請輸入名字"
                  value={deleteName}
                  onChange={e => setDeleteName(e.target.value)}
                  autoFocus
                />
                {deleteMsg && <div className="text-red-500 mb-2">{deleteMsg}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                    onClick={() => { setShowDeleteDialog(false); setDeleteId(null); setDeleteName(''); setDeleteMsg(''); }}
                  >
                    取消
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={handleDeleteConfirm}
                  >
                    確認刪除
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* 歷史記錄 Modal */}
          {showHistory && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-2xl
  border-2 border-blue-400 h-[90vh] md:max-h-[80vh] md:h-auto overflow-y-auto flex flex-col">
                <h2 className="text-2xl font-extrabold mb-4 text-blue-900 flex items-center gap-2">
                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{HISTORY_ICON} 歷史記錄</span>
                  <span className="text-base font-normal text-blue-500">（可查詢、編輯指定日資料）</span>
                </h2>
                <div className="mb-4 flex items-center gap-2">
                  <label className="text-blue-900">選擇日期：</label>
                  <input
                    type="date"
                    className="p-2 border border-blue-300 rounded"
                    value={historyDate}
                    onChange={e => setHistoryDate(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={async () => {
                      await fetchHistoryBills(historyDate);
                      setHistoryQueried(true);
                      setHistoryViewMode('view');
                    }}
                    type="button"
                  >查詢</button>
                </div>
                {historyQueried && (
                  <div className="flex-1 overflow-x-auto overflow-y-auto min-h-[200px] rounded-xl shadow bg-white/95 border border-blue-200 mb-4">
                    <table className="w-full text-center text-sm">
                      <thead className="bg-blue-50 text-blue-700">
                        <tr>
                          <th className="px-2 py-3">序</th>
                          <th className="px-4 py-3">姓名</th>
                          <th className="px-4 py-3">投入金額</th>
                          <th className="px-4 py-3">食物花費</th>
                          <th className="px-4 py-3">飲料花費</th>
                          <th className="px-4 py-3">其他花費</th>
                        </tr>
                      </thead>

           <tbody>

{historyBills.length > 0 && historyBills.map((bill, idx) => (

                          <tr key={bill.id}>
                            <td className="px-2 py-2">{idx + 1}</td>
                            <td className="px-4 py-2 drag-handle cursor-move">{bill.name}</td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-14 p-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={
                                  historyEdit[bill.id]?.amount_in !== undefined
                                    ? historyEdit[bill.id].amount_in
                                    : bill.amount_in || ''
                                }
                                onChange={e =>
                                  setHistoryEdit(edit => ({
                                    ...edit,
                                    [bill.id]: { ...edit[bill.id], amount_in: e.target.value }
                                  }))
                                }
                                disabled={historyViewMode !== 'edit'}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-20 p-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={
                                  historyEdit[bill.id]?.food !== undefined
                                    ? historyEdit[bill.id].food
                                    : bill.food || ''
                                }
                                onChange={e =>
                                  setHistoryEdit(edit => ({
                                    ...edit,
                                    [bill.id]: { ...edit[bill.id], food: e.target.value }
                                  }))
                                }
                                disabled={historyViewMode !== 'edit'}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-20 p-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={
                                  historyEdit[bill.id]?.drink !== undefined
                                    ? historyEdit[bill.id].drink
                                    : bill.drink || ''
                                }
                                onChange={e =>
                                  setHistoryEdit(edit => ({
                                    ...edit,
                                    [bill.id]: { ...edit[bill.id], drink: e.target.value }
                                  }))
                                }
                                disabled={historyViewMode !== 'edit'}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-20 p-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={
                                  historyEdit[bill.id]?.other !== undefined
                                    ? historyEdit[bill.id].other
                                    : bill.other || ''
                                }
                                onChange={e =>
                                  setHistoryEdit(edit => ({
                                    ...edit,
                                    [bill.id]: { ...edit[bill.id], other: e.target.value }
                                  }))
                                }
                                disabled={historyViewMode !== 'edit'}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* 歷史記錄分別總額 */}
                {historyQueried && (
                  <div className="mb-4 flex flex-wrap gap-6 items-center text-base text-blue-900">
                    <div>💰 投入金額總額：{historyBills.reduce((sum, b) => sum + (b.amount_in || 0), 0)}</div>
                    <div>🍚 食物花費總額：{historyBills.reduce((sum, b) => sum + (b.food || 0), 0)}</div>
                    <div>🥤 飲料花費總額：{historyBills.reduce((sum, b) => sum + (b.drink || 0), 0)}</div>
                    <div>🛒 其他花費總額：{historyBills.reduce((sum, b) => sum + (b.other || 0), 0)}</div>
                  </div>
                )}
                {historyMsg && <div className="text-red-500 mb-2">{historyMsg}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                    onClick={() => { setShowHistory(false); setHistoryQueried(false); setHistoryViewMode('view'); }}
                  >
                    取消
                  </button>
                  {historyViewMode === 'view' && historyQueried && (
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={() => setHistoryViewMode('edit')}
                    >
                      編輯
                    </button>
                  )}
                  {historyViewMode === 'edit' && historyQueried && (
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      onClick={async () => { await saveHistoryEdit(); setHistoryViewMode('view'); setHistoryQueried(false); }}
                    >
                      儲存
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
<div className="flex justify-between items-center mb-8">
  <div className="flex items-center gap-4">
    <h1 className="text-3xl font-bold text-blue-800 tracking-wide">分帳表格</h1>
    <button
      className="border border-blue-700 text-blue-700 px-4 py-2 rounded hover:bg-blue-50 transition font-semibold"
      onClick={() => setShowExportModal(true)}
    >
      匯出報表
    </button>
  </div>
  <div className="flex gap-3">
    <button className="bg-white border border-blue-400 text-blue-700 px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition font-semibold" onClick={() => router.push('/')}>返回首頁</button>
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition font-semibold"
      onClick={() => setShowAdd(true)}
    >
      新增參與者
    </button>
    <button className="bg-blue-400 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-500 transition font-semibold" onClick={() => setShowGuide(true)}>使用指南</button>
  </div>
</div>

          {/* 新增參與者表單 */}
          {showAdd && (
            <form onSubmit={handleAdd} className="mb-6 flex items-center gap-3 bg-blue-50 p-4 rounded-lg shadow border border-blue-200 max-w-md">
              <input
                className="flex-1 p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="請輸入姓名"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                確認
              </button>
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => { setShowAdd(false); setAddMsg(''); setNewName(''); }}
              >
                取消
              </button>
              {addMsg && <div className="ml-4 text-red-500">{addMsg}</div>}
            </form>
          )}
          <div className="overflow-x-auto rounded-xl shadow-lg bg-white/95 border border-blue-200 max-h-[500px] overflow-auto">
            <table className="min-w-full text-center">
              <thead className="bg-blue-100 text-blue-700">
                <tr>
                  <th className="px-4 py-3">序</th>
                  <th className="px-4 py-3">姓名</th>
                  <th className="px-4 py-3">投入金額</th>
                  <th className="px-4 py-3">食物花費</th>
                  <th className="px-4 py-3">飲料花費</th>
                  <th className="px-4 py-3">其他花費</th>
                  <th className="px-4 py-3">剩餘金額</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>

              <ReactSortable
  tag="tbody"
  list={bills}
  setList={setBills}
  handle=".drag-handle"
  animation={150}
  onEnd={async ({ oldIndex, newIndex }) => {
    const updated = arrayMove(bills, oldIndex, newIndex);
    setBills(updated);
  
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;
  
    for (let i = 0; i < updated.length; i++) {
      await supabase
        .from('bills')
        .update({ order: i })
        .eq('user_id', user.id)
        .eq('name', updated[i].name);
    }
  }}
>
  {bills.map((bill, idx) => (
    <tr key={bill.id} className="hover:bg-blue-50 transition">
      <td className="px-2 py-2">{idx + 1}</td>
      <td className="px-4 py-2 drag-handle cursor-move">{bill.name}</td>
      <td className="px-4 py-2">{bill.amount_in || 0}</td>
      <td className="px-4 py-2">{bill.food || 0}</td>
      <td className="px-4 py-2">{bill.drink || 0}</td>
      <td className="px-4 py-2">{bill.other || 0}</td>
      <td className="px-4 py-2 font-bold">
        {calcRemain(bill) < 0 ? <span className="text-red-600">{calcRemain(bill)}</span> : calcRemain(bill)}
      </td>
      <td className="px-4 py-2">
        <button
          className="text-red-500 hover:text-red-700 font-semibold"
          onClick={() => openDeleteDialog(bill)}
          type="button"
        >
          刪除
        </button>
      </td>
    </tr>
  ))}
</ReactSortable>

            </table>
          </div>
        </div>
        {/* AdSense 區塊 */}
<div className="w-full flex justify-center mt-10">
  <ins className="adsbygoogle"
    style={{ display: 'block' }}
    data-ad-client="ca-pub-7785145306323259"
    data-ad-slot="8559364872"
    data-ad-format="auto"
    data-full-width-responsive="true"></ins>
</div>

        <div className="mt-8 text-center text-gray-500 text-sm leading-relaxed">
        <a href="/feedback" className="hover:underline">📩 聯絡我們</a>
  <br />
          <a
    href="/privacy"
    className="underline hover:text-blue-600 mt-1 inline-block"
  >
    隱私政策
  </a>
        </div>
      </main>
      {showExportModal && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-green-400">
      <h2 className="text-xl font-bold text-green-800 mb-4">匯出報表</h2>

      <div className="mb-3">
        <label className="block mb-1 text-green-900">起始日期</label>
        <input
          type="date"
          className="w-full p-2 border border-green-300 rounded"
          value={exportStart}
          onChange={e => setExportStart(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-green-900">結束日期</label>
        <input
          type="date"
          className="w-full p-2 border border-green-300 rounded"
          value={exportEnd}
          onChange={e => setExportEnd(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-green-900">選擇類型</label>
        <select
          className="w-full p-2 border border-green-300 rounded"
          value={exportType}
          onChange={e => setExportType(e.target.value)}
        >
          <option value="amount_in">💰 投入金額</option>
          <option value="food">🍚 食物花費</option>
          <option value="drink">🥤 飲料花費</option>
          <option value="other">🛒 其他花費</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          onClick={() => setShowExportModal(false)}
        >
          取消
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => {
            exportExcelByType(exportType);
            setShowExportModal(false);
          }}
        >
          匯出
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}