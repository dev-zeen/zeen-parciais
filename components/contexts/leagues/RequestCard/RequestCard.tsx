import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Image } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Button } from '@/components/structure/Button';
import useInvites from '@/hooks/useInvites';
import { Invite } from '@/models/Invites';
import { League } from '@/models/Leagues';

type InviteCardProps = {
  onRefetchLeague: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<League, Error>>;
  request: Invite;
};

export function RequestCard({ request, onRefetchLeague }: InviteCardProps) {
  const { handleAcceptInvite: onAcceptInvite, handleDeclineInvitation: onDeclineInvitation } =
    useInvites();

  const handleAcceptInvite = useCallback(
    async (messageId: number) => {
      await onAcceptInvite(messageId).then(() => {
        onRefetchLeague();
      });
    },
    [onAcceptInvite, onRefetchLeague]
  );

  const handleDeclineInvitation = useCallback(
    async (messageId: number) => {
      await onDeclineInvitation(messageId).then(() => {
        onRefetchLeague();
      });
    },
    [onDeclineInvitation, onRefetchLeague]
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
            uri: request.time?.url_escudo_png,
          }}
          className="w-12 h-12 rounded-full"
          alt={`Imagem da Liga ${request.time.nome}`}
        />

        <View className="">
          <Text className="text-sm font-bold">{request.time?.nome}</Text>
          <Text className="text-sm ">{request.time.nome_cartola}</Text>
        </View>
      </View>

      <View
        className="flex-row py-3"
        style={{
          gap: 16,
        }}>
        <Button
          onPress={() => handleDeclineInvitation(request?.mensagem_id)}
          variant="error"
          onlyIcon
          hasIcon
          iconName="x"
        />
        <Button
          onPress={() => handleAcceptInvite(request.mensagem_id)}
          variant="success"
          onlyIcon
          hasIcon
          iconName="check"
        />
      </View>
    </View>
  );
}
