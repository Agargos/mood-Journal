import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/hooks/useAuth';

export const DebugPremium = () => {
  const { isPremium, loading } = usePremium();
  const { user } = useAuth();

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-2 rounded z-[9999]">
      <div>User: {user?.email || 'No user'}</div>
      <div>Premium: {isPremium ? 'YES' : 'NO'}</div>
      <div>Loading: {loading ? 'YES' : 'NO'}</div>
    </div>
  );
};