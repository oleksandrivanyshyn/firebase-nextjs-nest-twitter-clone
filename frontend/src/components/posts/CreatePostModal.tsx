'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { storageService } from '@/services/storage.service';
import { useCreatePost } from '@/hooks/usePosts';
import { X, ImagePlus } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  text: z.string().min(1, 'Content is required'),
});
type FormData = z.infer<typeof schema>;

export function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const createPost = useCreatePost();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const onSubmit = async (data: FormData) => {
    const photoURL = file ? await storageService.uploadPostImage(file) : null;
    await createPost.mutateAsync({ ...data, photoURL });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
        className="w-full max-w-lg rounded-2xl bg-gray-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="create-modal-title" className="text-xl font-bold text-white">
            New Tweet
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-white"
          >
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register('title')}
              id="create-title"
              placeholder="Title"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <textarea
              {...register('text')}
              id="create-text"
              rows={4}
              placeholder="What's happening?"
              className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            {errors.text && (
              <p className="mt-1 text-xs text-red-400">{errors.text.message}</p>
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400 hover:text-white">
            <ImagePlus className="h-5 w-5" />
            {file ? file.name : 'Add photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {createPost.isError && (
            <p className="text-sm text-red-400">
              {(createPost.error as Error)?.message ?? 'Something went wrong'}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2 text-gray-400 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createPost.isPending}
              className="rounded-full bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting || createPost.isPending ? 'Posting…' : 'Tweet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
