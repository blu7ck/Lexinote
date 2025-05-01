import { useEffect, useState } from 'react';
import { Membership } from '../types/Membership';
import { fetchMembershipsForUser } from '../services/MembershipService'; // Service katmanı kullanıyoruz
import useAuth from '../hooks/useAuth';
import { toast } from 'sonner'; // İstersen uyarı gösterebiliriz

export function useMemberships() {
  const { user, loading: authLoading } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMemberships = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchMembershipsForUser(user.id);
        setMemberships(data);
      } catch (error) {
        console.error('Membership verileri çekilemedi:', error);
        toast.error('Üyelik verileri alınamadı!');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchMemberships();
    }
  }, [user, authLoading]);

  return { memberships, loading };
}
