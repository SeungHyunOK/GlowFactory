export default function CampaignReviewPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">인플루언서 : 콘텐츠 제출</h2>
        <form className="mt-4 grid grid-cols-1 gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">캠페인 ID</span>
            <input
              type="text"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="캠페인 ID"
              aria-label="캠페인 ID"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">콘텐츠 링크</span>
            <input
              type="url"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-300"
              placeholder="게시물 링크"
              aria-label="콘텐츠 링크"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="text-slate-600">파일 업로드</span>
            <input
              type="file"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-white"
              aria-label="파일 업로드"
            />
          </label>
          <div className="flex justify-end">
            <button className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
              제출
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">브랜드 : 검수/승인</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-800">@sophiastyle · 캠페인 P-1001</p>
            <p className="mt-1 text-xs text-slate-500">콘텐츠 링크: https://example.com/post/123</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                수정 요청
              </button>
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                반려
              </button>
              <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                승인
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-medium text-slate-800">@dailyjun · 캠페인 P-1002</p>
            <p className="mt-1 text-xs text-slate-500">콘텐츠 링크: https://example.com/post/456</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                수정 요청
              </button>
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                반려
              </button>
              <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                승인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
