import { useContext, useEffect, useState } from 'react';

import { MARKET_STATUS_NAME } from '@/constants/Market';
import { AuthContext } from '@/contexts/Auth.context';
import useMarketStatus from '@/hooks/useMarketStatus';
import useMyClub from '@/hooks/useMyClub';
import { LeagueUserDetails } from '@/models/Leagues';
import { MarketStatus } from '@/models/Market';
import { useGetLeagues } from '@/queries/leagues.query';

type SectionLeagueProps = {
  title: string;
  data: LeagueUserDetails[];
};

const useLeagues = () => {
  const { marketStatus } = useMarketStatus();
  const { myClub } = useMyClub();

  const isMarketClose = marketStatus?.status_mercado !== MARKET_STATUS_NAME.ABERTO;

  const { isAutheticated } = useContext(AuthContext);

  const [sectionLeaguesList, setSectionLeaguesList] = useState<SectionLeagueProps[]>([]);

  const allowRequest =
    isAutheticated &&
    marketStatus &&
    marketStatus?.status_mercado !== MARKET_STATUS_NAME.EM_MANUTENCAO;

  const {
    data: leagues,
    isLoading: isLoadingLeagues,
    refetch: onRefetchLeagues,
    isRefetching: isRefetchingLeagues,
  } = useGetLeagues(!!allowRequest);

  useEffect(() => {
    if (!leagues) {
      return;
    }

    const { ligas } = leagues;
    const { max_ligas_pro, max_ligas_free, max_ligas_matamata_pro, max_ligas_matamata_free } =
      marketStatus as MarketStatus;

    const privateLeagues = ligas.filter((item) => item.time_dono_id && !item.mata_mata);
    const cartolaLeagues = ligas.filter((item) => !item.time_dono_id);
    const cups = ligas.filter((item) => item.mata_mata);

    const sectionLeagues = [
      {
        title: `Ligas Clássicas - ${privateLeagues.length} / ${
          myClub?.time.assinante ? max_ligas_pro : max_ligas_free
        }`,
        data: privateLeagues,
      },
      {
        title: `Mata Mata - ${cups.length} / ${
          myClub?.time.assinante ? max_ligas_matamata_pro : max_ligas_matamata_free
        }`,
        data: cups,
      },
    ];

    if (!isMarketClose) {
      sectionLeagues.push({
        title: 'Ligas do Cartola',
        data: cartolaLeagues,
      });
    }

    const filteredSectionLeagues = sectionLeagues.filter((item) => item.data.length > 0);

    setSectionLeaguesList(filteredSectionLeagues);
  }, [leagues, isMarketClose, marketStatus, myClub?.time.assinante]);

  return {
    leagues: sectionLeaguesList,
    isLoadingLeagues,
    onRefetchLeagues,
    isRefetchingLeagues,
  };
};

export default useLeagues;
