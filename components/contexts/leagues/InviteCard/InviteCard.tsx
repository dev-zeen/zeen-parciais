import { useCallback } from 'react';
import { Image } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Button } from '@/components/structure/Button';
import useInvites from '@/hooks/useInvites';
import { Invite } from '@/models/Invites';
import { useGetLeagues } from '@/queries/leagues.query';

type InviteCardProps = {
  invite: Invite;
};

export function InviteCard({ invite }: InviteCardProps) {
  const { handleAcceptInvite: onAcceptInvite, handleDeclineInvitation: onDeclineInvitation } =
    useInvites();

  const { refetch: onRefetchLeagues } = useGetLeagues();

  const handleAcceptInvite = useCallback(
    async (messageId: number) => {
      await onAcceptInvite(messageId).then(async () => {
        await onRefetchLeagues();
      });
    },
    [onAcceptInvite, onRefetchLeagues]
  );

  const handleDeclineInvitation = useCallback(
    async (messageId: number) => {
      await onDeclineInvitation(messageId).then(async () => {
        await onRefetchLeagues();
      });
    },
    [onDeclineInvitation, onRefetchLeagues]
  );

  return (
    <View className="flex-row p-3 rounded-lg justify-between">
      <View
        className="flex-row items-center"
        style={{
          gap: 4,
        }}>
        <Image
          source={{
            uri: invite.liga?.imagem,
          }}
          className="w-12 h-12 rounded-full"
          alt={`Imagem da Liga ${invite.liga?.nome}`}
        />

        <View className="">
          <Text className="text-sm font-bold">{invite.liga?.nome}</Text>
          <Text className="text-sm ">{invite.time.nome}</Text>

          <Text className="text-xs ">
            {invite.liga?.mata_mata ? 'Mata-Mata' : 'Clássica'} | {invite.liga?.tipo}
          </Text>
        </View>
      </View>

      <View
        className="flex-row py-3"
        style={{
          gap: 16,
        }}>
        <Button
          onPress={() => handleDeclineInvitation(invite?.mensagem_id)}
          variant="error"
          onlyIcon
          hasIcon
          iconName="x"
        />
        <Button
          onPress={() => handleAcceptInvite(invite.mensagem_id)}
          variant="success"
          onlyIcon
          hasIcon
          iconName="check"
        />
      </View>
    </View>
  );
}
