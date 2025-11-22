'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'

function NavigationContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // 現在のクエリパラメータを保持
  const currentQuery = searchParams.toString()
  const queryString = currentQuery ? `?${currentQuery}` : ''

  return (
    <nav className="flex space-x-2">
      <Link 
        href={`/${queryString}`}
        className={`p-2 rounded-lg transition-colors ${
          pathname === '/' 
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="マップ表示"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0v-8.5A.75.75 0 019 6zm6.75 2.25a.75.75 0 00-1.5 0v8.5a.75.75 0 001.5 0v-8.5z" clipRule="evenodd" />
        </svg>
      </Link>
      <Link 
        href={`/list${queryString}`}
        className={`p-2 rounded-lg transition-colors ${
          pathname === '/list' 
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="リスト表示"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        </svg>
      </Link>
    </nav>
  )
}

export default function Navigation() {
  return (
    <Suspense fallback={
      <nav className="flex space-x-2">
        <div className="p-2 rounded-lg text-gray-600 dark:text-gray-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 011.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0121.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 01-1.676 0l-4.994-2.497a.375.375 0 00-.336 0l-3.868 1.935A1.875 1.875 0 012.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437zM9 6a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0v-8.5A.75.75 0 019 6zm6.75 2.25a.75.75 0 00-1.5 0v8.5a.75.75 0 001.5 0v-8.5z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="p-2 rounded-lg text-gray-600 dark:text-gray-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </div>
      </nav>
    }>
      <NavigationContent />
    </Suspense>
  )
}