import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Image, useColorScheme } from 'react-native';

import captainIcon from '@/assets/images/letter-c.png';
import { Text, View } from '@/components/Themed';
import { Cup } from '@/components/contexts/leagues/Cup';
import { League as LeagueComponent } from '@/components/contexts/leagues/League';
import { DialogComponent } from '@/components/structure/Dialog';
import { Loading } from '@/components/structure/Loading';
import { AuthContext } from '@/contexts/Auth.context';
import useLeague from '@/hooks/useLeague';
import useMarketStatus from '@/hooks/useMarketStatus';
import { League, TeamLeague } from '@/models/Leagues';
import { useGetScoredPlayers } from '@/queries/stats.query';
import theme from '@/styles/theme';

export interface ClubByLeague extends TeamLeague {
  playersHavePlayed?: number;
}

export interface LeagueProps {
  league: League;
  isRefetching: boolean;
  onRefetch: () => void;
}

export default () => {
  const colorTheme = useColorScheme();

  const { isAutheticated } = useContext(AuthContext);

  const { id: slug } = useLocalSearchParams();

  const { marketStatus, isMarketClose } = useMarketStatus();

  const { refetch: onRefetchStats } = useGetScoredPlayers(isMarketClose);

  const [showModalPublicLeague, setShowModalPublicLeague] = useState(false);

  const { league, onRefetchLeague, isRefetchingLeague } = useLeague({
    slug: slug as string,
  });

  const onRefetch = useCallback(async () => {
    await Promise.all([onRefetchLeague(), onRefetchStats()]);
  }, [onRefetchLeague, onRefetchStats]);

  const handleConfirmDialog = useCallback(() => {
    setShowModalPublicLeague(false);
  }, []);

  useEffect(() => {
    if (league && !league?.liga.time_dono_id) {
      setShowModalPublicLeague(true);
    }
  }, [league]);

  const isRefetching = isRefetchingLeague;

  if (!isAutheticated) return <Redirect href="/(tabs)/leagues" />;

  if (!league || !marketStatus) {
    return <Loading />;
  }

  return (
    <>
      <View
        className={`${colorTheme === 'dark' ? 'bg-dark' : 'bg-light'} pb-2`}
        style={{
          gap: 12,
        }}>
        <View className="flex-row justify-center items-center py-2 rounded-lg mx-2 mt-2">
          <Image
            source={{
              uri: league.liga.mata_mata ? league.liga.url_trofeu_png : league.liga.url_flamula_png,
            }}
            style={{
              width: theme.Tokens.SIZE.sm,
              height: theme.Tokens.SIZE.sm,
            }}
            alt={`Imagem da liga ${league?.liga.nome}`}
          />
          <Text
            style={{
              fontWeight: '700',
              fontSize: theme.Tokens.TEXT.md,
              textTransform: 'uppercase',
            }}>
            {league?.liga.nome}
          </Text>
          {!league.liga.sem_capitao && (
            <Image
              source={captainIcon}
              style={{
                width: 24,
                height: 24,
                margin: 4,
              }}
              alt={`Liga com Capitão`}
            />
          )}
        </View>
      </View>

      {league.liga.mata_mata ? (
        <Cup league={league} onRefetch={onRefetch} isRefetching={isRefetching} />
      ) : (
        <LeagueComponent league={league} onRefetch={onRefetch} isRefetching={isRefetching} />
      )}

      {showModalPublicLeague && (
        <DialogComponent
          isVisible={showModalPublicLeague}
          onPressConfirm={handleConfirmDialog}
          subtitile="Apenas os 100 primeiros times são exibidos nas ligas públicas por questões de desempenho."
        />
      )}
    </>
  );
};
