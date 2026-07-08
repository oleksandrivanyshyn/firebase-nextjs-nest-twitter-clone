'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuthContext();
  const [showCreatePost, setShowCreatePost] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <ThemeToggle className="fixed right-4 top-4 z-30" />
      <Sidebar />
      <ScrollArea className="flex-1">
        <main className="mx-auto max-w-2xl border-x border-border pb-20 md:pb-0 lg:max-w-4xl xl:max-w-5xl">
          <EmailVerificationBanner />
          {children}
        </main>
      </ScrollArea>
      <BottomNav onNewTweet={() => setShowCreatePost(true)} />
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
}
