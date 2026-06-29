'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, PenSquare, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useSignOut } from '@/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';
import { useState } from 'react';
import { CreatePostModal } from '@/components/posts/CreatePostModal';

export function Sidebar() {
  const { user } = useAuthContext();
  const signOut = useSignOut();
  const pathname = usePathname();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const navClass = (href: string) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-lg font-medium transition hover:bg-gray-800 ${
      pathname === href ? 'bg-gray-800 text-white font-bold' : 'text-gray-200'
    }`;

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 flex-col justify-between border-r border-gray-800 p-6 md:flex xl:w-80">
        <div className="space-y-2">
          <div className="mb-6 text-2xl font-black text-blue-400">
            🐦 Tweeter
          </div>
          <Link href="/feed" className={navClass('/feed')}>
            <Home className="h-6 w-6" /> Home
          </Link>

          {user ? (
            <>
              <Link href="/profile" className={navClass('/profile')}>
                <User className="h-6 w-6" /> Profile
              </Link>
              <button
                onClick={() => setShowCreatePost(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-500"
              >
                <PenSquare className="h-5 w-5" /> New Tweet
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navClass('/login')}>
                <LogIn className="h-6 w-6" /> Log in
              </Link>
              <Link
                href="/register"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-500"
              >
                <UserPlus className="h-5 w-5" /> Sign up
              </Link>
            </>
          )}
        </div>

        {user && (
          <button
            onClick={() => signOut.mutate()}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" /> Log out
          </button>
        )}
      </aside>

      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </>
  );
}
