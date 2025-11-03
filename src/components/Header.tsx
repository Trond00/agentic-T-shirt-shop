'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <nav className="flex space-x-6">
          <Link
            href="/"
            className={`text-lg font-medium ${
              pathname === '/'
                ? 'text-black dark:text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            } transition-colors`}
          >
            Home
          </Link>
          <Link
            href="/catalog"
            className={`text-lg font-medium ${
              pathname === '/catalog'
                ? 'text-black dark:text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            } transition-colors`}
          >
            Catalog
          </Link>
          <Link
            href="/categories"
            className={`text-lg font-medium ${
              pathname === '/categories'
                ? 'text-black dark:text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            } transition-colors`}
          >
            Categories
          </Link>
        </nav>
      </div>
    </header>
  )
}
