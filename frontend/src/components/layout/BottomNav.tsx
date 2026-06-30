'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, PenSquare, LogIn } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

interface Props {
  onNewTweet: () => void;
}

export function BottomNav({ onNewTweet }: Props) {
  const { user } = useAuthContext();
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `flex flex-col items-center gap-0.5 p-3 transition ${
      pathname === href ? 'text-white' : 'text-gray-400 hover:text-white'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-gray-800 bg-gray-950 md:hidden">
      <Link href="/feed" className={linkClass('/feed')}>
        <Home className="h-6 w-6" />
        <span className="text-xs">Home</span>
      </Link>
      {user ? (
        <>
          <button
            onClick={onNewTweet}
            className="flex flex-col items-center gap-0.5 p-3 text-gray-400 transition hover:text-white"
          >
            <PenSquare className="h-6 w-6" />
            <span className="text-xs">Tweet</span>
          </button>
          <Link href="/profile" className={linkClass('/profile')}>
            <User className="h-6 w-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </>
      ) : (
        <Link href="/login" className={linkClass('/login')}>
          <LogIn className="h-6 w-6" />
          <span className="text-xs">Sign in</span>
        </Link>
      )}
    </nav>
  );
}
