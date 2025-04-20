'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

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
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [addMsg, setAddMsg] = useState('');

  // Modal 狀態
  const [showModal, setShowModal] = useState(false);
  const [modalField, setModalField] = useState('amount_in');
  const [modalValues, setModalValues] = useState({});
  const [modalMsg, setModalMsg] = useState('');
  const [modalDate] = useState(() => new Date().toISOString().slice(0, 10));

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

  const router = useRouter();

  // 使用指南彈窗
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  // 取得今天日期
  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  async function fetchBills() {
    setLoading(true);
    const today = getToday();
    const { data, error } = await supabase.from('bills').select('*').eq('date', today).order('created_at', { ascending: true });
    if (!error) setBills(data || []);
    setLoading(false);
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
    const { error } = await supabase.from('bills').insert([
      { name: newName.trim(), amount_in: 0, food: 0, drink: 0, other: 0, date: today }
    ]);
    if (error) {
      setAddMsg('新增失敗，請重試');
    } else {
      setAddMsg('');
      setNewName('');
      setShowAdd(false);
      fetchBills();
    }
  }

  // Modal 批次填寫投入/花費
  function openModal(field) {
    setModalField(field);
    setModalValues({});
    setModalMsg('');
    setShowModal(true);
  }
  async function handleModalSubmit(e) {
    e.preventDefault();
    setModalMsg('');
    const today = getToday();
    for (const id in modalValues) {
      let value = modalValues[id];
      if (value === '' || value === undefined) value = 0;
      if (!isNaN(Number(value))) {
        await supabase.from('bills').update({ [modalField]: Number(value) }).eq('id', id).eq('date', today);
      }
    }
    setShowModal(false);
    setModalValues({});
    fetchBills();
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
    if (!window.confirm(`確定要刪除「${target.name}」嗎？此動作無法復原。`)) return;
    await supabase.from('bills').delete().eq('id', deleteId);
    setShowDeleteDialog(false);
    setDeleteId(null);
    setDeleteName('');
    setDeleteMsg('');
    fetchBills();
  }

  // 歷史記錄
  async function openHistory() {
    setShowHistory(true);
    setHistoryMsg('');
    await fetchHistoryBills(historyDate);
  }
  async function fetchHistoryBills(date) {
    const { data, error } = await supabase.from('bills').select('*').eq('date', date).order('created_at', { ascending: true });
    setHistoryBills(data || []);
    setHistoryEdit({});
  }
  function handleHistoryEdit(id, field, value) {
    setHistoryEdit(edit => ({
      ...edit,
      [id]: { ...edit[id], [field]: value }
    }));
  }
  async function saveHistoryEdit() {
    for (const id in historyEdit) {
      const updateObj = {};
      for (const key in historyEdit[id]) {
        let value = historyEdit[id][key];
        if (value === '' || value === undefined) value = 0;
        updateObj[key] = value;
      }
      await supabase.from('bills').update(updateObj).eq('id', id).eq('date', historyDate);
    }
    setShowHistory(false);
    setHistoryEdit({});
    fetchBills();
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      {/* 左側欄 */}
      <aside className="w-64 bg-white/95 shadow-lg flex flex-col p-8 rounded-r-3xl border-r border-blue-200">
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
      <main className="flex-1 p-10">
        <div className="flex-1 flex flex-col">
          {/* 使用指南彈窗 */}
          {showGuide && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg border border-blue-200">
                <h2 className="text-lg font-bold mb-4 text-blue-700">使用指南</h2>
                <ul className="list-disc pl-6 text-blue-900 space-y-2 mb-4 text-base">
                  <li>先「新增參與者」，建立分帳名單</li>
                  <li>左側區域可批次輸入投入金額與各類花費</li>
                  <li>右側區域可刪除指定參與者</li>
                  <li>歷史記錄可查詢特定日期的資料，並進行編輯與更正</li>
                </ul>
                <div className="flex justify-end">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => setShowGuide(false)}>關閉</button>
                </div>
              </div>
            </div>
          )}
          {/* Modal 批次填寫投入/花費 */}
          {showModal && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg border border-blue-200">
                <h2 className="text-lg font-bold mb-4 text-blue-700">{FIELDS.find(f => f.key === modalField)?.label || ''}（{modalDate}）</h2>
                <form onSubmit={handleModalSubmit}>
                  <div className="space-y-3 max-h-72 overflow-y-auto mb-4">
                    {bills.map(bill => (
                      <div key={bill.id} className="flex items-center gap-2">
                        <span className="w-24 text-blue-900">{bill.name}</span>
                        <input
                          type="number"
                          className="flex-1 p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="金額"
                          value={modalValues[bill.id] !== undefined ? modalValues[bill.id] : bill[modalField] || ''}
                          onChange={e => setModalValues(a => ({ ...a, [bill.id]: e.target.value }))}
                          min={0}
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
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl border-2 border-blue-400">
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
                  <div className="overflow-x-auto rounded-xl shadow bg-white/95 border border-blue-200 mb-4">
                    <table className="min-w-full text-center">
                      <thead className="bg-blue-50 text-blue-700">
                        <tr>
                          <th className="px-4 py-3">姓名</th>
                          <th className="px-4 py-3">投入金額</th>
                          <th className="px-4 py-3">食物花費</th>
                          <th className="px-4 py-3">飲料花費</th>
                          <th className="px-4 py-3">其他花費</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyBills.map(bill => (
                          <tr key={bill.id}>
                            <td className="px-4 py-2">{bill.name}</td>
                            {FIELDS.map(f => (
                              <td key={f.key} className="px-4 py-2">
                                <input
                                  type="number"
                                  className="w-20 p-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                  value={
                                    historyEdit[bill.id]?.[f.key] !== undefined
                                      ? historyEdit[bill.id][f.key]
                                      : bill[f.key] || ''
                                  }
                                  onChange={e =>
                                    handleHistoryEdit(bill.id, f.key, e.target.value)
                                  }
                                  disabled={historyViewMode !== 'edit'}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            <h1 className="text-3xl font-bold text-blue-800 tracking-wide">分賬表格</h1>
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
          <div className="overflow-x-auto rounded-xl shadow-lg bg-white/95 border border-blue-200">
            <table className="min-w-full text-center">
              <thead className="bg-blue-100 text-blue-700">
                <tr>
                  <th className="px-4 py-3">姓名</th>
                  <th className="px-4 py-3">投入金額</th>
                  <th className="px-4 py-3">食物花費</th>
                  <th className="px-4 py-3">飲料花費</th>
                  <th className="px-4 py-3">其他花費</th>
                  <th className="px-4 py-3">剩餘金額</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">載入中...</td>
                  </tr>
                ) : bills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">目前沒有分賬資料</td>
                  </tr>
                ) : (
                  bills.map(bill => (
                    <tr key={bill.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-2">{bill.name}</td>
                      <td className="px-4 py-2">{bill.amount_in || 0}</td>
                      <td className="px-4 py-2">{bill.food || 0}</td>
                      <td className="px-4 py-2">{bill.drink || 0}</td>
                      <td className="px-4 py-2">{bill.other || 0}</td>
                      <td className={`px-4 py-2 font-bold ${calcRemain(bill) < 0 ? 'text-red-600' : 'text-blue-700'}`}>
                        {calcRemain(bill)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-10 text-center text-sm text-gray-500">
          問題聯絡人：呂秉杰<br />
          分機：253649<br />
          信箱：Bjie5683@gmail.com
        </div>
      </main>
    </div>
  );
}