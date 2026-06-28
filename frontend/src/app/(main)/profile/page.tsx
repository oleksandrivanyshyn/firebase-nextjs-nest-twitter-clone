'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/utils/api';
import { PostCard } from '@/components/posts/PostCard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth, storage } from '@/lib/firebase';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { useSignOut } from '@/hooks/useAuth';
import { useState } from 'react';
import type { UserProfile, PaginatedPosts } from '@/types';

const profileSchema = z.object({
  name: z.string().min(1, 'Required'),
  surname: z.string().min(1, 'Required'),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const signOut = useSignOut();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: () => apiFetch<UserProfile>('/users/me'),
    enabled: !!user,
  });

  const { data: postsData } = useQuery({
    queryKey: ['userPosts', user?.uid],
    queryFn: () => apiFetch<PaginatedPosts>(`/users/${user!.uid}/posts`),
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? { name: profile.name, surname: profile.surname }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) =>
      apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const fileRef = storageRef(
      storage,
      `avatars/${user.uid}/${Date.now()}_${file.name}`,
    );
    await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);
    await apiFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ photoURL }),
    });
    qc.invalidateQueries({ queryKey: ['profile'] });
    qc.invalidateQueries({ queryKey: ['user', user.uid] });
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account permanently? This cannot be undone.'))
      return;
    await apiFetch('/users/me', { method: 'DELETE' });
    signOut.mutate();
  };

  return (
    <div className="max-w-lg space-y-8 p-6">
      <h1 className="text-2xl font-bold text-white">Your Profile</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-700 text-2xl font-bold text-white">
            {profile?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoURL}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              (profile?.name?.[0] ?? '?')
            )}
          </div>
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

      {/* Edit name/surname */}
      <form
        onSubmit={handleSubmit((d) => updateMutation.mutate(d))}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300">
            First Name
          </label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Last Name
          </label>
          <input
            {...register('surname')}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Change password */}
      <div className="space-y-3 rounded-xl border border-gray-800 p-4">
        <h2 className="font-semibold text-white">Change Password</h2>
        <ChangePasswordForm />
      </div>

      {/* My posts */}
      {postsData?.posts && postsData.posts.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold text-white">My Posts</h2>
          {postsData.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Danger zone */}
      <div className="space-y-3 rounded-xl border border-red-900/50 p-4">
        <h2 className="font-semibold text-red-400">Danger Zone</h2>
        <button
          onClick={() => signOut.mutate()}
          className="w-full rounded-lg border border-gray-700 py-2 text-gray-300 transition hover:bg-gray-800"
        >
          Log out
        </button>
        <button
          onClick={handleDeleteAccount}
          className="w-full rounded-lg bg-red-900/30 py-2 text-red-400 transition hover:bg-red-900/50"
        >
          Delete Account
        </button>
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
