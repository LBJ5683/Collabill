export default function PrivacyPage() {

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">隱私權政策</h1>
          <p className="mb-4">
            本網站使用 Google AdSense 廣告服務。Google 可能會使用 Cookie 或其他技術，
            根據您的瀏覽行為提供個人化廣告。詳情請見
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline"> Google 的廣告政策</a>。
          </p>
          <p className="mb-4">
            CollaBill 不會保存您的個人資料。所有分帳紀錄僅用於分帳用途，不會對外分享或行銷使用。
          </p>
          <p className="text-sm text-gray-500">本政策可能因功能更新而有所調整，若有異動會在本頁公告。</p>
        </div>
      </div>
    );
  }
  