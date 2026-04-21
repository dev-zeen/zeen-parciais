import { UseMutationOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { GET_ALL_LEAGUES, INVITES, RESPONSE_INVITE } from '@/constants/Endpoits';
import { Invite, Requests } from '@/models/Invites';
import api from '@/services/api';

type InviteProps = {
  convites?: Invite[];
  solicitacoes?: Requests[];
};

type InviteResponse = { mensagem: string };

export const useGetInvites = (allowRequest?: boolean) =>
  useQuery<InviteProps>({
    queryKey: [INVITES],
    queryFn: () => api.get<InviteProps>(INVITES).then((r) => r.data),
    enabled: !!allowRequest,
  });

const acceptInviteRequest = async (id: string): Promise<InviteResponse> => {
  const { data } = await api.post<InviteResponse>(RESPONSE_INVITE.replace(':messageId', id), {});
  return data;
};

export function useAcceptInvite(
  options?: UseMutationOptions<InviteResponse, AxiosError<{ mensagem?: string }>, string>
) {
  const queryClient = useQueryClient();
  return useMutation<InviteResponse, AxiosError<{ mensagem?: string }>, string>({
    mutationFn: acceptInviteRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [INVITES] });
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

const declineInvitationRequest = async (id: string): Promise<InviteResponse> => {
  const { data } = await api.delete<InviteResponse>(RESPONSE_INVITE.replace(':messageId', id));
  return data;
};

export function useDeclineInvitation(
  options?: UseMutationOptions<InviteResponse, AxiosError<{ mensagem?: string }>, string>
) {
  const queryClient = useQueryClient();
  return useMutation<InviteResponse, AxiosError<{ mensagem?: string }>, string>({
    mutationFn: declineInvitationRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: [INVITES] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      console.error(error.response?.data ?? error.message);
      options?.onError?.(error, variables, onMutateResult, context);
    },
    ...options,
  });
}
