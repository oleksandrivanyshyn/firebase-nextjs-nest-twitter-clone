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
      pathname === href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-border bg-background md:hidden">
      <Link href="/feed" className={linkClass('/feed')}>
        <Home className="h-6 w-6" />
        <span className="text-xs">Home</span>
      </Link>
      {user ? (
        <>
          <button
            onClick={onNewTweet}
            className="flex flex-col items-center gap-0.5 p-3 text-muted-foreground transition hover:text-foreground"
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
