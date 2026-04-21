import { UseMutationOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  GET_ALL_LEAGUES,
  GET_POINTS_COMPETITIONS,
  INVITES_POINTS_COMPETITIONS,
  RESPONSE_INVITE_POINTS_COMPETITIONS,
} from '@/constants/Endpoits';
import type {
  PointsCompetitionInvitesResponse,
  RespondCompetitionInviteInput,
} from '@/models/Competition';
import api from '@/services/api';

type RespondInviteResponse = { mensagem?: string };

export const useGetPointsCompetitionInvites = (allowRequest?: boolean) =>
  useQuery<PointsCompetitionInvitesResponse>({
    queryKey: [INVITES_POINTS_COMPETITIONS],
    queryFn: () =>
      api.get<PointsCompetitionInvitesResponse>(INVITES_POINTS_COMPETITIONS).then((r) => r.data),
    enabled: !!allowRequest,
  });

const respondCompetitionInviteRequest = async (
  input: RespondCompetitionInviteInput
): Promise<RespondInviteResponse> => {
  const body = { aceitar: input.decision === 'accept' };
  const { data } = await api.put<RespondInviteResponse>(
    RESPONSE_INVITE_POINTS_COMPETITIONS.replace(':messageId', String(input.messageId)),
    body
  );
  return data;
};

export function useRespondPointsCompetitionInvite(
  options?: UseMutationOptions<RespondInviteResponse, AxiosError<{ mensagem?: string }>, RespondCompetitionInviteInput>
) {
  const queryClient = useQueryClient();
  return useMutation<RespondInviteResponse, AxiosError<{ mensagem?: string }>, RespondCompetitionInviteInput>({
    mutationFn: respondCompetitionInviteRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [INVITES_POINTS_COMPETITIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_POINTS_COMPETITIONS] });
      queryClient.invalidateQueries({ queryKey: [GET_ALL_LEAGUES] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error(error.response?.data ?? error.message);
      options?.onError?.(error, variables, onMutateResult, context);
    },
    ...options,
  });
}
