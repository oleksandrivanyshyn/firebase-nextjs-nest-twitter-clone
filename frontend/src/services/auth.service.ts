import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiFetch } from '@/utils/api';

export const authService = {
  signIn: (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password),

  signInWithGoogle: async () => {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const u = result.user;
    const parts = (u.displayName ?? '').split(' ');
    await apiFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify({
        name: parts[0] ?? '',
        surname: parts.slice(1).join(' '),
        photoURL: u.photoURL,
      }),
    });
  },

  register: async (
    email: string,
    password: string,
    name: string,
    surname: string,
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
    await apiFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ name, surname }),
    });
  },

  sendPasswordReset: (email: string) => sendPasswordResetEmail(auth, email),

  signOut: () => signOut(auth),
};
