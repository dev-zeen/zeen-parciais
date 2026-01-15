import {
  INVITES_POINTS_COMPETITIONS,
  RESPONSE_INVITE_POINTS_COMPETITIONS,
} from '@/constants/Endpoits';
import type {
  PointsCompetitionInvitesResponse,
  RespondCompetitionInviteInput,
} from '@/models/Competition';
import api from '@/services/api';
import { useFetch } from '@/utils/reactQuery';

export const useGetPointsCompetitionInvites = (allowRequest?: boolean) =>
  useFetch<PointsCompetitionInvitesResponse>(INVITES_POINTS_COMPETITIONS, undefined, {
    enabled: !!allowRequest,
  });

/**
 * Aceitar/recusar convite de pontos corridos.
 *
 * Observação: a API usa PUT no mesmo endpoint; o shape exato do body pode variar.
 * Implementamos um body explícito para suportar ambos os caminhos.
 */
export const onRespondPointsCompetitionInvite = async ({
  messageId,
  decision,
}: RespondCompetitionInviteInput) => {
  const body = { aceitar: decision === 'accept' };
  return api.put(RESPONSE_INVITE_POINTS_COMPETITIONS.replace(':messageId', String(messageId)), body);
};
