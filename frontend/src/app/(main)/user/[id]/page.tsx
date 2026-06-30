import { UserProfileWrapper } from './UserProfileWrapper';

export const generateStaticParams = () => [{ id: 'placeholder' }];

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserProfileWrapper id={id} />;
}
