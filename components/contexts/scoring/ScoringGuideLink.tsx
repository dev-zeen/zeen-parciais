import { router } from 'expo-router';

import { LinkRow } from '@/components/ui/LinkRow';

/** Atalho para a tela "Como funciona a pontuação" (Rodada e Perfil). */
export function ScoringGuideLink() {
  return (
    <LinkRow
      icon="help-circle"
      title="Como funciona a pontuação"
      subtitle="Quanto vale cada lance, capitão e reservas"
      accessibilityHint="Abre a explicação dos pontos de cada lance"
      onPress={() => router.push('/pontuacao')}
    />
  );
}
