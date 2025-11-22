import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          カンファレンスが見つかりません
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          お探しのカンファレンスは存在しないか、削除された可能性があります。
        </p>
        <div className="space-y-4">
          <Link
            href="/conference"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            カンファレンス一覧に戻る
          </Link>
          <br />
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            マップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}