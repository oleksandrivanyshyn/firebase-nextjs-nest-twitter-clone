'use client';

import dynamic from 'next/dynamic';

const UserProfileContent = dynamic(
  () => import('./UserProfileContent').then((m) => ({ default: m.UserProfileContent })),
  { ssr: false },
);

export function UserProfileWrapper({ id }: { id: string }) {
  return <UserProfileContent id={id} />;
}
