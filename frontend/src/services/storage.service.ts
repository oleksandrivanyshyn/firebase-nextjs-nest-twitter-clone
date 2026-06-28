import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '@/lib/firebase';

export const storageService = {
  uploadPostImage: async (file: File): Promise<string> => {
    const uid = auth.currentUser!.uid;
    const fileRef = ref(storage, `posts/${uid}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  },

  uploadAvatar: async (file: File, uid: string): Promise<string> => {
    const fileRef = ref(storage, `avatars/${uid}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  },
};
