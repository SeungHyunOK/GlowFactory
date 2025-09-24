export default function CampaignNewPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">브랜드 : 캠페인 생성</h2>
        <form className="mt-4 grid grid-cols-1 gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">캠페인 목적</span>
            <input
              type="text"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="브랜드 인지도 상승, 전환 증대 등"
              aria-label="캠페인 목적"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">조건</span>
            <input
              type="text"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="팔로워 수, 카테고리, 지역 등"
              aria-label="캠페인 조건"
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-slate-600">시작일</span>
              <input
                type="date"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
                aria-label="시작일"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-600">마감일</span>
              <input
                type="date"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
                aria-label="마감일"
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">보상 방식</span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              aria-label="보상 방식"
            >
              <option>현금</option>
              <option>제품지급</option>
              <option>현금+제품</option>
              <option>성과형</option>
            </select>
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              캠페인 생성
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">인플루언서 : 지원 및 제안서 제출</h2>
        <form className="mt-4 grid grid-cols-1 gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">캠페인 ID</span>
            <input
              type="text"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="지원할 캠페인 ID"
              aria-label="캠페인 ID"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">제안 내용</span>
            <textarea
              className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="콘텐츠 아이디어, 일정, 보상 기대 등"
              aria-label="제안 내용"
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-slate-600">예상 일정</span>
              <input
                type="date"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
                aria-label="예상 일정"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-600">희망 보상</span>
              <input
                type="text"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
                placeholder="예: 현금 50만원"
                aria-label="희망 보상"
              />
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              지원/제안서 제출
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
