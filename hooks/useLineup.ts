import { useMemo } from 'react';

import useMyClub from '@/hooks/useMyClub';
import useTeamLineupStore from '@/store/useTeamLineupStore';

const useLineup = () => {
  const { myClub } = useMyClub();

  const price = useTeamLineupStore((state) => state.price);

  const balancePriceValue = useMemo(() => {
    if (myClub && price) {
      return myClub.patrimonio - price;
    }
    return myClub?.patrimonio as number;
  }, [myClub, price]);

  return {
    balancePriceValue,
  };
};

export default useLineup;
