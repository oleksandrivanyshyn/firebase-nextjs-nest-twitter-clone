'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useMe, useUpdateProfile, useDeleteAccount } from '@/hooks/useProfile';
import { useUserPosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/posts/PostCard';
import { PostDetailModal } from '@/components/posts/PostDetailModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { storageService } from '@/services/storage.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useSignOut } from '@/hooks/useAuth';
import { useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(1, 'Required'),
  surname: z.string().min(1, 'Required'),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuthContext();
  const { data: profile } = useMe(!!user);
  const { data: postsData } = useUserPosts(user?.uid ?? '');
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const signOut = useSignOut();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const posts = postsData?.pages.flatMap((p) => p.posts) ?? [];

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? { name: profile.name, surname: profile.surname }
      : undefined,
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const photoURL = await storageService.uploadAvatar(file, user.uid);
    updateProfile.mutate({ photoURL });
  };

  return (
    <div className="max-w-lg space-y-8 p-6">
      <h1 className="text-2xl font-bold text-white">Your Profile</h1>

      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <UserAvatar src={profile?.photoURL} name={profile?.name} className="h-20 w-20 text-2xl" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </label>
        <div>
          <p className="font-semibold text-white">
            {profile ? `${profile.name} ${profile.surname}` : '…'}
          </p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <p className="mt-1 text-xs text-blue-400">Click avatar to change</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(async (d) => { await updateProfile.mutateAsync(d); })}
        className="space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            First Name
          </label>
          <input
            {...register('name')}
            id="name"
            autoComplete="given-name"
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-300">
            Last Name
          </label>
          <input
            {...register('surname')}
            id="surname"
            autoComplete="family-name"
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
          {errors.surname && (
            <p className="mt-1 text-xs text-red-400">{errors.surname.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || updateProfile.isPending}
          className="rounded-full bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {isSubmitting || updateProfile.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {user?.providerData.some((p) => p.providerId === 'password') && (
        <div className="space-y-3 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-white">Change Password</h2>
          <ChangePasswordForm />
        </div>
      )}

      {posts.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-white">My Posts</h2>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onSelect={() => setSelectedPostId(post.id)} />
          ))}
        </div>
      )}

      {selectedPostId && (
        <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
      )}

      <div className="space-y-3 rounded-xl border border-red-900/50 p-4">
        <h2 className="font-semibold text-red-400">Danger Zone</h2>
        <button
          onClick={() => signOut.mutate()}
          className="w-full rounded-lg border border-gray-700 py-2 text-gray-300 transition hover:bg-gray-800"
        >
          Log out
        </button>
        <ConfirmDialog
          trigger={
            <button className="w-full rounded-lg bg-red-900/30 py-2 text-red-400 transition hover:bg-red-900/50">
              Delete Account
            </button>
          }
          title="Delete account permanently?"
          description="All your posts, comments, and data will be removed. This cannot be undone."
          confirmLabel="Delete Account"
          onConfirm={() => deleteAccount.mutate()}
        />
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user?.email) throw new Error('Not authenticated');
      const credential = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPw);
      setSuccess(true);
      setCurrentPw('');
      setNewPw('');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to change password',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && (
        <p className="text-xs text-green-400">Password changed successfully.</p>
      )}
      <input
        type="password"
        value={currentPw}
        onChange={(e) => setCurrentPw(e.target.value)}
        placeholder="Current password"
        required
        minLength={6}
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
      />
      <input
        type="password"
        value={newPw}
        onChange={(e) => setNewPw(e.target.value)}
        placeholder="New password (min 6 chars)"
        required
        minLength={6}
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-gray-700 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
      >
        {loading ? 'Updating…' : 'Change Password'}
      </button>
    </form>
  );
}
