import { useAuth } from '@/contexts/AuthContext';

interface AdminPageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  const { profile } = useAuth();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
            Admin
          </span>
          <span className="text-xs text-neutral-400">/ {profile?.full_name}</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        <p className="text-neutral-500 mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
}
