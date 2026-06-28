'use client';

import Link from 'next/link';
import { Home, User, PenSquare, LogOut } from 'lucide-react';
import { useSignOut } from '@/hooks/useAuth';
import { useState } from 'react';
import { CreatePostModal } from '@/components/posts/CreatePostModal';

export function Sidebar() {
  const signOut = useSignOut();
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-64 flex-col justify-between border-r border-gray-800 p-6">
        <div className="space-y-2">
          <div className="mb-6 text-2xl font-black text-blue-400">
            🐦 Tweeter
          </div>
          <Link
            href="/feed"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-lg font-medium text-gray-200 transition hover:bg-gray-800"
          >
            <Home className="h-6 w-6" /> Home
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-lg font-medium text-gray-200 transition hover:bg-gray-800"
          >
            <User className="h-6 w-6" /> Profile
          </Link>
          <button
            onClick={() => setShowCreatePost(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-500"
          >
            <PenSquare className="h-5 w-5" /> New Tweet
          </button>
        </div>
        <button
          onClick={() => signOut.mutate()}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-400 transition hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" /> Log out
        </button>
      </aside>

      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </>
  );
}
