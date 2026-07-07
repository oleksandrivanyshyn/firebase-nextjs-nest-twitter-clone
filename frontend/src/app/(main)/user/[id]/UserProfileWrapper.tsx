'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const UserProfileContent = dynamic(
  () => import('./UserProfileContent').then((m) => ({ default: m.UserProfileContent })),
  { ssr: false },
);

// This route is statically exported with a single placeholder param
// (see generateStaticParams in page.tsx) and served for every real
// /user/<uid> path via a Firebase Hosting rewrite. The server-provided
// `id` prop is therefore always "placeholder" in production — the real
// id must be read from the browser URL instead.
export function UserProfileWrapper({ id }: { id: string }) {
  const pathname = usePathname();
  const pathId = pathname.split('/').filter(Boolean).pop();
  return <UserProfileContent id={pathId ?? id} />;
}
