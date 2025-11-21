import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '日本IT技術カンファレンスマップ',
  description: '日本全国のIT技術カンファレンスの開催履歴を地図上で確認できます',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              日本IT技術カンファレンスマップ
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              全国のIT技術カンファレンスの開催履歴を地図で探索
            </p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
