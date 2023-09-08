import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fillLineupWithPlayers,
  onGetDefaultLineupTeam,
  onGetEqualLineups,
} from '@/app/(tabs)/team/team.helpers';
import { LINEUPS_DEFAULT_OBJECT } from '@/constants/Formations';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import usePlayerStats from '@/hooks/usePlayerStats';
import useSubstituition from '@/hooks/useSubstituition';
import { FullClubInfo } from '@/models/Club';
import { LineupPlayers, LineupPosition } from '@/models/Formations';
import { useSaveTeam } from '@/queries/club.query';
import useTeamLineupStore from '@/store/useTeamLineupStore';
import { onGetIsLineupComplete, onGetPayloadSaveTeam, onGetTeamPrice } from '@/utils/team';

const useLineup = () => {
  const { myClub } = useMyClub();

  const { isMarketClose } = useMarketStatus();

  const { playerStats } = usePlayerStats();

  const { substitutions } = useSubstituition({
    teamId: myClub?.time.time_id,
  });

  const [emptyPositions, setEmptyPositions] = useState<Set<number>>();

  const price = useTeamLineupStore((state) => state.price);
  const updatePrice = useTeamLineupStore((state) => state.updatePrice);

  const updateLineup = useTeamLineupStore((state) => state.updateLineup);
  const lineup = useTeamLineupStore((state) => state.lineup);

  const updateCapitain = useTeamLineupStore((state) => state.updateCapitain);
  const capitain = useTeamLineupStore((state) => state.capitain);

  const updateFormation = useTeamLineupStore((state) => state.updateFormation);
  const formation = useTeamLineupStore((state) => state.formation);

  const { mutate, isSuccess: isSuccessSaveTeam } = useSaveTeam();

  const [isLineupComplete, setIsLineupComplete] = useState(false);

  const initialLineupTeamFormation = useMemo(
    () => onGetDefaultLineupTeam(myClub?.time.esquema_id as number),
    [myClub]
  );

  const initialTeamPrice = useMemo(() => {
    if (lineup) {
      return onGetTeamPrice(lineup.starting);
    }
    return 0;
  }, [lineup]);

  useEffect(() => {
    updateFormation(initialLineupTeamFormation);
  }, [initialLineupTeamFormation, updateFormation]);

  const onSaveTeam = useCallback(() => {
    const payload = onGetPayloadSaveTeam({
      lineup: lineup as LineupPlayers,
      capitain,
      formation,
    });

    mutate(payload);
    setIsLineupComplete(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineup, capitain, formation, mutate]);

  const isReservesCompleted = useCallback((reserves: LineupPosition[]) => {
    return reserves.every((item) => item.player);
  }, []);

  const balancePrice = useMemo(() => {
    if (myClub && price) {
      return myClub.patrimonio - price;
    }
    return myClub?.patrimonio as number;
  }, [myClub, price]);

  const onShowSaveLineupButton = useCallback(
    (lineup: LineupPlayers, capitain: number, club: FullClubInfo) => {
      if (lineup && club) {
        const isEqualLineups = onGetEqualLineups(lineup, club);
        const isSameCapitain = club.capitao_id === capitain;

        if (!isSameCapitain || !isEqualLineups) setIsLineupComplete(true);
        if (isSameCapitain && isEqualLineups) setIsLineupComplete(false);
      }
    },
    []
  );

  useEffect(() => {
    const emptyPositionsUpdated = new Set(
      (lineup?.starting || []).filter(({ player }) => !player).map(({ position }) => position)
    );
    setEmptyPositions(emptyPositionsUpdated);
  }, [lineup]);

  useEffect(() => {
    if (!lineup && myClub) {
      const defaultLineup = fillLineupWithPlayers(
        myClub,
        (LINEUPS_DEFAULT_OBJECT as any)[myClub?.time.esquema_id as number],
        playerStats,
        isMarketClose
      );

      updateLineup(defaultLineup);
      updateCapitain(myClub.capitao_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myClub, isMarketClose, lineup, playerStats]);

  useEffect(() => {
    if (lineup && myClub) {
      const isFilledLineup = onGetIsLineupComplete(lineup);

      if (isFilledLineup) {
        onShowSaveLineupButton(lineup as LineupPlayers, capitain, myClub as FullClubInfo);
      } else {
        setIsLineupComplete(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capitain, myClub, lineup]);

  useEffect(() => {
    updatePrice(initialTeamPrice);
  }, [initialTeamPrice, updatePrice]);

  return {
    balancePrice,
    initialLineupTeamFormation,
    initialTeamPrice,

    isReservesCompleted,

    onSaveTeam,
    isSuccessSaveTeam,

    isLineupComplete,
    lineup,
    updateLineup,

    price,
    updatePrice,

    updateCapitain,
    capitain,

    updateFormation,
    formation,

    substitutions,
    emptyPositions,
  };
};

export default useLineup;
