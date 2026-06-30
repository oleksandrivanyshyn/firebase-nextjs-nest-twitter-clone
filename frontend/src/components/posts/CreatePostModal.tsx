'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import { storageService } from '@/services/storage.service';
import { useCreatePost } from '@/hooks/usePosts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  text: z.string().min(1, 'Content is required'),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:border-blue-500';

export function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const createPost = useCreatePost();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const photoURL = file ? await storageService.uploadPostImage(file) : null;
    await createPost.mutateAsync({ ...data, photoURL });
    onClose();
  };

  const handleFile = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-lg flex-col gap-0 bg-gray-900 p-0 text-white">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>New Tweet</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-4">
            <div>
              <Input {...register('title')} placeholder="Title" className={inputClass} />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
            </div>

            <div>
              <Textarea
                {...register('text')}
                rows={4}
                placeholder="What's happening?"
                className={`resize-none ${inputClass}`}
              />
              {errors.text && <p className="mt-1 text-xs text-red-400">{errors.text.message}</p>}
            </div>

            {preview && (
              <div className="relative flex max-h-60 items-center justify-center overflow-hidden rounded-xl bg-gray-950">
                <Image src={preview} alt="preview" width={800} height={600} className="max-h-60 w-full object-contain" />
                <button
                  type="button"
                  onClick={() => handleFile(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400 hover:text-white">
              <ImagePlus className="h-5 w-5" />
              {file ? file.name : 'Add photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>

            {createPost.isError && (
              <p className="text-sm text-red-400">
                {(createPost.error as Error)?.message ?? 'Something went wrong'}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createPost.isPending}
                className="rounded-full bg-blue-600 px-5 font-bold text-white hover:bg-blue-500"
              >
                {isSubmitting || createPost.isPending ? 'Posting…' : 'Tweet'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
