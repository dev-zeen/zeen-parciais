import { useMemo } from 'react';

import { onGetEqualLineups } from '@/components/contexts/team/_team.helpers';
import useMarketStatus from '@/hooks/useMarketStatus';
import { useGetMyClub } from '@/queries/club.query';
import { useGetPointsCompetitionInvites } from '@/queries/competitionsInvites.query';
import { useGetInvites } from '@/queries/invites.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';

/**
 * Estado dos badges da barra de abas. Reaproveita consultas que as telas já fazem,
 * então não gera requisições novas além das que o Início dispara.
 */
export function useTabBadges() {
  const { allowRequest, isMarketClose, isBallRolling } = useMarketStatus();

  const { data: myClub } = useGetMyClub(allowRequest);
  const { data: invites } = useGetInvites(allowRequest);
  const { data: pointsInvites } = useGetPointsCompetitionInvites(allowRequest);

  const lineup = useTeamLineupStore((state) => state.lineup);
  const captain = useTeamLineupStore((state) => state.captain);

  // Só existe escalação em edição depois que a aba Time foi aberta.
  const hasUnsavedLineup = useMemo(() => {
    if (!lineup || !myClub || isMarketClose) return false;
    return myClub.capitao_id !== captain || !onGetEqualLineups(lineup, myClub);
  }, [lineup, myClub, captain, isMarketClose]);

  const invitesCount = (invites?.convites?.length ?? 0) + (pointsInvites?.length ?? 0);

  return { hasUnsavedLineup, invitesCount, isBallRolling };
}
