import { PostContent } from './PostContent';

export const generateStaticParams = () => [{ id: 'placeholder' }];

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostContent id={id} />;
}
