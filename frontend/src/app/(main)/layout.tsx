'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuthContext();
  const [showCreatePost, setShowCreatePost] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />
      <ScrollArea className="flex-1">
        <main className="mx-auto max-w-2xl border-x border-gray-800 pb-20 md:pb-0 lg:max-w-4xl xl:max-w-5xl">
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
