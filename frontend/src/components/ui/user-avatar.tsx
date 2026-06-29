import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Props {
  src?: string | null;
  name?: string;
  className?: string;
}

export function UserAvatar({ src, name, className }: Props) {
  return (
    <Avatar className={cn('bg-blue-700', className)}>
      {src && <AvatarImage src={src} alt={name ?? 'avatar'} />}
      <AvatarFallback className="bg-blue-700 text-sm font-bold text-white">
        {name?.[0]?.toUpperCase() ?? '?'}
      </AvatarFallback>
    </Avatar>
  );
}
