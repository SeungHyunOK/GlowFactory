import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">인증 오류</h1>
        <p className="text-gray-600 mb-6">로그인 중 오류가 발생했습니다. 다시 시도해주세요.</p>
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          로그인 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
