interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-gray-900 p-8 shadow-xl">
        <h1 className="text-center text-2xl font-bold text-white">{title}</h1>
        {children}
      </div>
    </div>
  );
}
