'use client';

import { useState } from 'react';

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', type: '建議', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('https://formspree.io/f/mqaqpyyz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          type: form.type,
          message: form.message
        })
      });
      setSubmitted(true);
    } catch (error) {
      console.error('回饋送出失敗:', error);
      alert('送出失敗，請稍後再試');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">意見回饋</h1>
        {submitted ? (
          <div className="text-green-600 text-center font-semibold">
            感謝你的回饋，我們會持續改進 🙌
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700">姓名（可留空）</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
  <label className="block text-sm font-semibold text-gray-700">Email（方便我們回覆您）</label>
  <input
    type="email"
    required
    value={form.email}
    onChange={(e) => setForm({ ...form, email: e.target.value })}
    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="your@email.com"
  />
</div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">回饋類型</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="建議">建議</option>
                <option value="錯誤回報">錯誤回報</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">回饋內容</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold"
            >
              送出回饋
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
