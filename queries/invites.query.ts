import { INVITES, RESPONSE_INVITE } from '@/constants/Endpoits';
import { Invite, Requests } from '@/models/Invites';
import api from '@/services/api';
import { useFetch } from '@/utils/reactQuery';

type InviteProps = {
  convites?: Invite[];
  solicitacoes?: Requests[];
};

export const useGetInvites = (allowRequest?: boolean) =>
  useFetch<InviteProps>(INVITES, undefined, {
    enabled: !!allowRequest,
  });

export const onAcceptInvite = async (id: string) =>
  await api.post(RESPONSE_INVITE.replace(':messageId', id), {});

export const onDeclineInvitation = async (id: string) =>
  await api.delete(RESPONSE_INVITE.replace(':messageId', id), {});
