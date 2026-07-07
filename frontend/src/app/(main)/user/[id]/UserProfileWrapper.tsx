'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const UserProfileContent = dynamic(
  () => import('./UserProfileContent').then((m) => ({ default: m.UserProfileContent })),
  { ssr: false },
);

export function UserProfileWrapper({ id }: { id: string }) {
  const pathname = usePathname();
  const pathId = pathname.split('/').filter(Boolean).pop();
  return <UserProfileContent id={pathId ?? id} />;
}
