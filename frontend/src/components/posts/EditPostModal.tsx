'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import { storageService } from '@/services/storage.service';
import { useUpdatePost } from '@/hooks/usePosts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Post } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  text: z.string().min(1, 'Content is required'),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:border-blue-500';

interface Props {
  post: Post;
  onClose: () => void;
}

export function EditPostModal({ post, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const updatePost = useUpdatePost();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: post.title, text: post.text },
  });

  const handleFile = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
    setRemovePhoto(false);
  };

  const onSubmit = async (data: FormData) => {
    let photoURL: string | null = removePhoto ? null : post.photoURL ?? null;
    if (file) photoURL = await storageService.uploadPostImage(file);
    await updatePost.mutateAsync({ id: post.id, data: { ...data, photoURL } });
    onClose();
  };

  const currentPreview = preview ?? (!removePhoto && post.photoURL ? post.photoURL : null);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-lg flex-col gap-0 bg-card p-0 text-card-foreground">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Edit Tweet</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-4">
            <div>
              <Input {...register('title')} placeholder="Title" className={inputClass} />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
            </div>

            {currentPreview && (
              <div className="relative flex max-h-60 items-center justify-center overflow-hidden rounded-xl bg-muted">
                <Image src={currentPreview} alt="preview" width={800} height={600} className="max-h-60 w-full object-contain" />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); setRemovePhoto(true); }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ImagePlus className="h-5 w-5" />
              {file ? file.name : currentPreview ? 'Change photo' : 'Add photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>

            <div>
              <Textarea
                {...register('text')}
                rows={4}
                placeholder="What's happening?"
                className={`resize-none ${inputClass}`}
              />
              {errors.text && <p className="mt-1 text-xs text-red-400">{errors.text.message}</p>}
            </div>

            {updatePost.isError && (
              <p className="text-sm text-red-400">
                {(updatePost.error as Error)?.message ?? 'Something went wrong'}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || updatePost.isPending}
                className="rounded-full bg-blue-600 px-5 font-bold text-white hover:bg-blue-500"
              >
                {isSubmitting || updatePost.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
