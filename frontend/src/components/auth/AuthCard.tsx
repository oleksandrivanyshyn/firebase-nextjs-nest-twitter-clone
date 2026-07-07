import { ThemeToggle } from '@/components/layout/ThemeToggle';

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-card p-8 shadow-xl">
        <h1 className="text-center text-2xl font-bold text-card-foreground">{title}</h1>
        {children}
      </div>
    </div>
  );
}
