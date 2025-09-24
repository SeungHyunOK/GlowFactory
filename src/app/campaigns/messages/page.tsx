export default function CampaignMessagesPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">대화</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center justify-between rounded-xl border border-slate-200 p-2">
            <span>@sophiastyle</span>
            <span className="text-xs text-slate-400">new</span>
          </li>
          <li className="rounded-xl border border-slate-200 p-2">@dailyjun</li>
          <li className="rounded-xl border border-slate-200 p-2">@beautymin</li>
        </ul>
      </aside>
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">@sophiastyle</h3>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
            알림 설정
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="max-w-[70%] rounded-2xl bg-slate-100 p-3">
            안녕하세요! 일정 공유드립니다.
          </div>
          <div className="ml-auto max-w-[70%] rounded-2xl bg-indigo-600 p-3 text-white">
            확인했습니다. 요구사항 정리해서 전달드릴게요.
          </div>
        </div>
        <form className="mt-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="메시지 입력"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
            aria-label="메시지 입력"
          />
          <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">
            전송
          </button>
        </form>
      </section>
    </div>
  );
}
