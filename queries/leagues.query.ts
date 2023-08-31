import { useAsyncStorage } from '@react-native-async-storage/async-storage';

import {
  GET_ALL_LEAGUES,
  GET_CLUBS_BY_LEAGUE_ID,
  GET_LEAGUE_BY_SLUG,
  INVITES,
  RESPONSE_INVITE,
} from '@/constants/Endpoits';
import { CLUBS_BY_LEAGUE_KEY_STORAGE } from '@/constants/Keys';
import { Invite, League, LeagueUserDetails } from '@/models/Leagues';
import cartolaApi from '@/services/cartolaApi';
import { ClubsByLeagueUtils } from '@/utils/partials';
import { useFetch } from '@/utils/reactQuery';

type InviteProps = {
  convites: Invite[];
};

export interface Filter {
  [key: string]: string;
}

export interface Config extends Filter {}

export const useGetLeagues = (allowRequest?: boolean) =>
  useFetch<{ ligas: LeagueUserDetails[] }>(GET_ALL_LEAGUES, undefined, {
    enabled: !!allowRequest,
  });

export const useGetLeague = (slug: string, filters?: Filter) =>
  useFetch<League>(
    GET_LEAGUE_BY_SLUG.replace(':slug', slug),
    {
      ...filters,
    },
    {
      enabled: !!slug,
    }
  );

export const useGetClubsByLeagueId = (id?: number) => {
  return useFetch<ClubsByLeagueUtils>(
    GET_CLUBS_BY_LEAGUE_ID.replace(':id', String(id)),
    undefined,
    {
      enabled: !!id,
      select: (data) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { setItem } = useAsyncStorage(CLUBS_BY_LEAGUE_KEY_STORAGE(`${id}`));

        if (data) {
          setItem(JSON.stringify(data));
        }

        return data;
      },
    }
  );
};

export const useGetInvites = (allowRequest?: boolean) =>
  useFetch<InviteProps>(INVITES, undefined, {
    enabled: !!allowRequest,
  });

export const onAcceptInvite = async (id: string) =>
  await cartolaApi.post(RESPONSE_INVITE.replace(':messageId', id), {});

export const onDeclineInvitation = async (id: string) =>
  await cartolaApi.delete(RESPONSE_INVITE.replace(':messageId', id), {});
